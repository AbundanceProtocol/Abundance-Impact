import connectToDatabase from '../../../libs/mongodb';
import User from '../../../models/User';
import Impact from '../../../models/Impact';
import Quality from '../../../models/Quality';
import Cast from '../../../models/Cast';
import Allowlist from '../../../models/Allowlist';
import EcosystemRules from '../../../models/EcosystemRules';
import Signal from '../../../models/Signal';
import Miniapp from '../../../models/Miniapp';
import axios from 'axios';
import { decryptPassword } from '../../../utils/utils'; 
const apiKey = process.env.NEYNAR_API_KEY
const encryptedBotUuid = process.env.ENCRYPTED_BOT_UUID
const secretKey = process.env.SECRET_KEY

export default async function handler(req, res) {
  const { fid, castContext, impactAmount, points } = req.body;
  console.log(fid, castContext, impactAmount, points)
  
  if (req.method !== 'POST' || !fid || fid == '-' || !impactAmount || !castContext || !points) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {
    const signer = decryptPassword(encryptedBotUuid, secretKey)

    await connectToDatabase();

    const ecosystem = await EcosystemRules.findOne({ ecosystem_points_name: points }).exec();

    let channelCuration = false

    if (ecosystem.channels && ecosystem.channels.length > 0) {
      for (const channel of ecosystem.channels) {
        if (channel.url == castContext.cast_channel) {
          channelCuration = true
        }
      }
    }

    async function getQuality(curatorFid, castHash, points) {
      try {
        await connectToDatabase();
        const quality = await Quality.find({ curator_fid: curatorFid, target_cast_hash: castHash, points })
        if (quality.length == 0) {
          return null
        } else {
          return quality
        }
      } catch (error) {
        console.error('Error handling request:', error);
        return null
      }
    }

    const quality = await getQuality(fid, castContext.cast_hash, points)
    // console.log('4', quality)

    if (!quality) {

      await connectToDatabase();
        
      const user = await User.findOne({ fid, ecosystem_points: points }).exec();
      // console.log('5', user)

      if (!user) {
        res.status(404).json({ error: 'No eligible user found' });
      } else {
        
        const userRemainingImpact = user.remaining_i_allowance
        
        if (userRemainingImpact || userRemainingImpact !== 0) {
          
          if (userRemainingImpact >= impactAmount) {
            
            async function updateListings(fid, castContext, impactAmount, points) {
              // console.log(fid, castContext, impactAmount)
              try {
                await connectToDatabase();
                let user = await User.findOne({ fid, ecosystem_points: points }).exec();
                // console.log('6', user)

                if (user) {
                // console.log('11', user)
                user.remaining_i_allowance -= impactAmount
                
                let cast = await Cast.findOne({ cast_hash: castContext.cast_hash, points: points }).exec();

                async function createdSignal(fid, castContext, impactAmount, points) {

                  try {
                    // Get all unique user fids from User where validator: true
                    await connectToDatabase();
                    const validatorUsers = await User.find({ validator: true, fid: { $ne: fid } }).distinct('fid');
                    // Convert fids to numbers
                    const validatorFids = validatorUsers.map(fid => Number(fid));
                    // Get all Miniapp fids where active: true and fid in validatorFids
                    const miniappValidators = await Miniapp.find({ active: true, fid: { $in: validatorFids } }).distinct('fid');
                    // For each 10 points in impactAmount, select one random fid from miniappValidators
                    const numValidators = Math.ceil(impactAmount / 10);
                    let selectedFids = [];
                    if (miniappValidators.length > 0 && numValidators > 0) {
                      // Shuffle miniappValidators and pick numValidators unique fids
                      const shuffled = miniappValidators
                        .map(value => ({ value, sort: Math.random() }))
                        .sort((a, b) => a.sort - b.sort)
                        .map(({ value }) => value);
                      selectedFids = shuffled.slice(0, Math.min(numValidators, shuffled.length));
                    }
                    // Create validators array
                    const validators = selectedFids.map(fid => ({
                      validator_fid: fid,
                      vote: 0,
                      confirmed: false
                    }));

                    const newSignal = new Signal({
                      author_fid: castContext.author_fid,
                      curator_fid: fid,
                      cast_hash: castContext.cast_hash,
                      impact: impactAmount,
                      validators: validators || [],
                      boosts: [],
                      stage: 'validation'
                    });
                    await newSignal.save()
                    return newSignal
                  } catch (error) {
                    console.error('Error creating signal:', error);
                    return null
                  }




                }

                let signal = await createdSignal(fid, castContext, impactAmount, points)
                console.log('signal', signal)

                function createdImpact(fid, castContext, impactAmount, points) {
                  const newImpact = new Impact({
                    curator_fid: fid,
                    target_cast_hash: castContext.cast_hash,
                    points: points,
                    creator_fid: castContext.author_fid,
                    impact_points: impactAmount
                  });
                  return newImpact
                }
                

                const saveAll = async (user, impact, cast) => {
                  // console.log('8', user, impact, cast)
                  try {
                    const [savedUser, savedImpact, savedCast] = await Promise.all([
                      user.save(),
                      impact.save(),
                      cast.save()
                    ]);
                    return savedUser.remaining_i_allowance
                  } catch (error) {
                    console.error("Error saving lists:", error);
                    return null
                  }
                }
                
                if (cast) {
                  
                  let impact

                  impact = await Impact.findOne({ target_cast_hash: castContext.cast_hash, points: points }).sort({ createdAt: -1 }).exec();
                  
                  if (impact && impact.curator_fid == fid) {
                    impact.impact_points += impactAmount
                    cast.impact_total += impactAmount
                    // Add tag if provided and not already exists
                    if (castContext.tag) {
                      const tagExists = cast.cast_tags.some(tagObj => tagObj.tag === castContext.tag && tagObj.fid === fid);
                      if (!tagExists) {
                        cast.cast_tags.push({ tag: castContext.tag, fid: fid });
                      }
                    }
                    let impactTotal = cast.impact_total
                    let curatorCount = cast.impact_points.length
                    const saveLists = await saveAll(user, impact, cast)
                    return {saveLists, impactTotal, curatorCount, cast}
                    
                  } else {
                    impact = createdImpact(fid, castContext, impactAmount, points)
                    cast.impact_total += impactAmount
                    cast.impact_points.push(impact)
                    user.impact_reviews.push(impact)
                    // Add tag if provided
                    if (castContext.tag) {
                      const tagExists = cast.cast_tags.some(tagObj => tagObj.tag === castContext.tag && tagObj.fid === fid);
                      if (!tagExists) {
                        cast.cast_tags.push({ tag: castContext.tag, fid: fid });
                      }
                    }
                    let impactTotal = cast.impact_total
                    let curatorCount = cast.impact_points.length
                    const saveLists = await saveAll(user, impact, cast)
                    return {saveLists, impactTotal, curatorCount, cast}
                  }

                } else {
    
                  let impact = createdImpact(fid, castContext, impactAmount)
    
                  cast = new Cast({
                    author_fid: castContext.author_fid,
                    author_pfp: castContext.author_pfp,
                    author_username: castContext.author_username,
                    author_display_name: castContext.author_display_name,
                    points: points,
                    cast_hash: castContext.cast_hash,
                    cast_text: castContext.cast_text,
                    cast_channel: castContext.cast_channel,
                    quality_balance: 0,
                    quality_absolute: 0,
                    impact_total: impactAmount,
                    impact_points: [impact],
                    cast_tags: castContext.tag ? [{ tag: castContext.tag, fid: fid }] : [],
                  });

                  const saveLists = await saveAll(user, impact, cast)
                  let impactTotal = impactAmount
                  let curatorCount = 1

                  async function nominationCast(user, curator, ecosystem, hash, signer) {
                    try {
                      const base = "https://api.neynar.com/";
                      const url = `${base}v2/farcaster/cast`;
                
                      let body = {
                        signer_uuid: signer,
                        text: `@${user} has been nominated by @${curator} to the ${ecosystem} Ecosystem on /impact\n\nHelp support @${user}'s nominees.\n\nOpt out of /impact nominations in frame`,
                      };
                
                      body.parent = hash;

                      const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'api_key': apiKey,
                        },
                        body: JSON.stringify(body),
                      });
                      // console.log(response)
                      if (!response.ok) {
                        console.error(`Failed to send nomination`);
                        return false
                      } else {
                        console.log(`Nomination sent successfully`);
                        return true
                      }

                    } catch (error) {
                      console.error('Error handling GET request:', error);
                      return false
                    }
                  }

                  if (ecosystem.bot_reply) {
                    nominationCast(castContext.author_username, user.username, ecosystem.ecosystem_name, castContext.cast_hash, signer)
                  }

                  return {saveLists, impactTotal, curatorCount, cast}
                }
              } else {
                return {saveLists: null, impactTotal: null , curatorCount: null, cast: null}
              }
            } catch (error) {
              console.error("Error while saving user, cast and impact objects:", error);
              return {saveLists: null, impactTotal: null , curatorCount: null, cast: null}
            }
          }

          const {saveLists, impactTotal, curatorCount, cast} = await updateListings(fid, castContext, impactAmount, points)
          console.log('7', saveLists, impactTotal, curatorCount)

          if (saveLists || saveLists == 0) {
            let curatedCast = null

            if (channelCuration) {
              if (impactTotal >= ecosystem.condition_points_threshold &&  curatorCount >= ecosystem.condition_curators_threshold) {

                async function curateCast(hash) {
                  try {
                    const base = "https://api.neynar.com/";
                    const url = `${base}v2/farcaster/reaction`;
                    const response = await fetch(url, {
                      method: 'POST',
                      headers: {
                        accept: "application/json",
                        api_key: apiKey,
                        'content-type': 'application/json',
                      },
                      body: JSON.stringify({
                        'signer_uuid': signer,
                        target: hash,
                        reaction_type: 'like'
                      })})
                      
                    const cast = await response.json();
                    return cast
                  } catch (error) {
                    console.error('Error handling POST request:', error);
                    return null
                  }
                }
                curatedCast = await curateCast(castContext.cast_hash)
              }
            }
            res.status(201).json({ balance: saveLists, points: impactAmount, curated: curatedCast, cast: cast, message: 'User, cast and impact objects saved successfully' });
          } else {
            res.status(500).json({ error: 'Internal Server Error' });
          }
          
          } else {
            res.status(400).json({ error: 'Exceeded allowance' });
          }
        } else {
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    } else {
      res.status(202).send({message: `Can't add Impact to reviewed cast`});
    }
  }
}