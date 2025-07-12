import satori from "satori";
import path from 'path'
import fs from 'fs';
import { promisify } from 'util';
import svg2img from 'svg2img';
import fetch from 'isomorphic-unfetch';
import NodeCache from 'node-cache';
// import User from "../../../models/User";
import connectToDatabase from "../../../../libs/mongodb";
import mongoose from 'mongoose';
import Impact from '../../../../models/Impact';
import User from '../../../../models/User';
import Claim from '../../../../models/Claim';
import ScheduleTip from '../../../../models/ScheduleTip';
import { formatNum } from '../../../../utils/utils'


const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const cache = new NodeCache({ stdTTL: 60 });

export default async function handler(req, res) {
  const { fid, fund } = req.query

  console.log('fid', fid)
  try {
    const fontPath = path.join(process.cwd(), 'public', 'Inter-SemiBold.ttf');
    const fontData = fs.readFileSync(fontPath);
    // const login = needLogin == 'true'
    // console.log('at2 login', login, needLogin)

    await connectToDatabase();



    async function getCuratorData(fid) {
      try {
        await connectToDatabase();

        const userData = await User.findOne({fid: fid.toString(), ecosystem_points: '$IMPACT'}).select('fid username pfp boost validator')

        // const schedule = await ScheduleTip.findOne({fid: fid}).select('active_cron creator_fund development_fund growth_fund')


        console.log('userData', userData)
        
        
        return userData
      } catch (error) {
        console.error("Error while fetching casts:", error);
        return null
      }
    }



    const userData = await getCuratorData(Number(fid))

    console.log('userData', userData)
    // let rounded = uniqueCreators
    // if (uniqueCreators > 100) {
    //   rounded = Math.floor(uniqueCreators / 100) * 100
    // } else if (uniqueCreators > 10) {
    //   rounded = Math.floor(uniqueCreators / 10) * 10
    // }




    // async function getReward(id) {
    //   try {
    //     const objectId = new mongoose.Types.ObjectId(id)
    //     console.log(id)
    //     await connectToDatabase();
    //     let rank = await Claim.findOne({ _id: objectId }).exec();

    //     if (rank) {
    //       const updateOptions = {
    //         upsert: false,
    //         new: true,
    //         setDefaultsOnInsert: true,
    //       };
  
    //       const update = {
    //         $set: {
    //           claimed: true
    //         },
    //       };
    //       console.log('shared', shared)
    //       const lastFourDays = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
  
    //       let claimIds = await Claim.distinct("_id", { fid: rank?.fid, createdAt: { $gt: lastFourDays, $lte: rank?.createdAt }, claimed: false });
  
    //       for (const claimId of claimIds) {
    //         const user = await Claim.findOneAndUpdate({ _id: claimId }, update, updateOptions);
    //         console.log('user', user, claimId)
    //       }
    //     }

    //     if (rank) {
    //       return rank
    //     } else {
    //       return null
    //     }
    //   } catch (error) {
    //     console.error("Error while fetching casts:", error);
    //     return null
    //   }  
    // }

    // let reward = null

    // if (id) {
    //   reward = await getReward(id);
    // }


    // console.log('reward', reward)




    const backgroundImg = `${baseURL}/images/backgroundframe3.png`

    const svg = await satori(
      <div style={{
        width: '100%',
        height: '100%',
        padding: 30,
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#43238a',
        justifyContent: 'center',
        alignItems: 'center', 
      }}>


        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.0rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '5px 5px 0px 5px'}}>
          {/* <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '30px', margin: '0px 0 0 0', padding: '0px 0 0 0'}}>Impact Fund</div> */}
          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '28px', margin: '0', padding: '0px 0 10px 0', fontWeight: '400'}}>I joined Impact 2.0</div>
          {/* <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '20px', margin: '0', padding: '10px 0 0 0', fontWeight: '400'}}>reward 2700+ creators & builders for their impact with your $degen allowance</div> */}
        </div>








        {(userData) && (<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '10px 5px 0px 5px'}}>

          <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid #eeeeeeaa', borderRadius: '88px', padding: '3px 10px 3px 3px', background: '#eeeeeeaa', width: 'auto', margin: '0 5px 0 0'}}>
            {userData && userData?.pfp && userData?.pfp !== null && (<img src={userData?.pfp} width={40} height={40} style={{borderRadius: '80px', border: '2px solid #eee', backgroundColor: '#8363ca'}} />)}
            <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '18px', margin: '0'}}>{userData?.username && userData?.username !== null ? `@${userData?.username}` : '  no user found'}</div>
          </div>

          {/* <div style={{display: 'flex', flexDirection: 'row', color: 'white', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', borderRadius: '88px', padding: '3px 10px 3px 3px', width: 'auto', margin: '0 5px 0 0'}}>
            <div style={{display: 'flex', textAlign: 'center', color: '#eee', fontSize: '22px', margin: '0'}}>is auto-funding</div>
          </div> */}


        </div>)}




        <div style={{display: 'flex', flexDirection: 'row', fontSize: '13px', justifyContent: "center", alignItems: 'center', gap: '0.75rem', margin: '20px 0', flexWrap: 'wrap', width: '100%'}}>
          <div className={`btn-select ${userData.boost ? 'cast-act-lt btn-brd-lt' : 'blu-drk btn-brd'}`} style={{display: 'flex', flexDirection: 'column', minWidth: '150px', color: (userData.boost) ? '#000' : '#cde', height: '113px', border: '1px solid #eee', borderRadius: '16px', justifyContent: 'center', backgroundColor: (userData.boost) ? '#eeeeeebb' : '#111122bb'}}>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
              <div style={{fontSize: '17px', fontWeight: '700', margin: '0 0 5px 0'}}>Boost</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: "center", alignItems: 'center', gap: '0.5rem'}}>
              {/* <Impact size={15} color={schedule?.creator_fund == 100 ? '#147' : '#5af'} /> */}
              <div>Creator</div>
              <div style={{fontSize: '14px', fontWeight: '700'}}>100%</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: "center", alignItems: 'center', gap: '0.5rem'}}>
              {/* <IoBuild size={15} color={schedule?.creator_fund == 100 ? '#147' : '#5af'} /> */}
              <div>Dev</div>
              <div style={{fontSize: '14px', fontWeight: '700'}}>0%</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: "center", alignItems: 'center', gap: '0.5rem'}}>
              {/* <IoIosRocket size={15} color={schedule?.creator_fund == 100 ? '#147' : '#5af'} /> */}
              <div>Growth</div>
              <div style={{fontSize: '14px', fontWeight: '700'}}>0%</div>
            </div>
            {/* <div style={{display: 'flex', flexDirection: 'row', margin: '5px 0 0 0', color: schedule?.creator_fund == 100 ? '#111' : "#9df", fontSize: '11px'}}>
              <div>1.0x Score Boost</div>
            </div> */}
          </div>
          <div className={`btn-select ${userData.validator ? 'cast-act-lt btn-brd-lt' : 'blu-drk btn-brd'}`} style={{display: 'flex', flexDirection: 'column', minWidth: '150px', color: (userData.validator) ? '#000' : '#cde', height: '113px', border: '1px solid #eee', borderRadius: '16px', justifyContent: 'center', backgroundColor: (userData.validator) ? '#eeeeeebb' : '#111122bb'}}>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
              <div style={{fontSize: '17px', fontWeight: '700', margin: '0 0 5px 0'}}>Validate</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
              {/* <Impact size={15} color={schedule?.creator_fund == 80 ? '#147' : '#5af'} /> */}
              <div>Creator</div>
              <div style={{fontSize: '14px', fontWeight: '700'}}>80%</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
              {/* <IoBuild size={15} color={schedule?.creator_fund == 80 ? '#147' : '#5af'} /> */}
              <div>Dev</div>
              <div style={{fontSize: '14px', fontWeight: '700'}}>10%</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
              {/* <IoIosRocket size={15} color={schedule?.creator_fund == 80 ? '#147' : '#5af'} /> */}
              <div>Growth</div>
              <div style={{fontSize: '14px', fontWeight: '700'}}>10%</div>
            </div>
            {/* <div style={{display: 'flex', flexDirection: 'row', margin: '5px 0 0 0', color: schedule?.creator_fund == 80 ? '#111' : "#9df", fontSize: '11px'}}>
              <div>1.25x Score Boost</div>
            </div> */}
          </div>



        </div>



        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.0rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '5px 5px 0px 5px'}}>
          {/* <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '30px', margin: '0px 0 0 0', padding: '0px 0 0 0'}}>Impact Fund</div> */}
          {/* <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '28px', margin: '0', padding: '0px 0 0 0', fontWeight: '400'}}>Support Farcaster's growth</div> */}

          {/* <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '14px', margin: '0', padding: '0px 0 0 0', fontWeight: '400'}}>reward 2700+ creators & builders for their impact with your $degen allowance</div> */}
        </div>











        {/* {pointsStaked && (<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '0px 5px 0px 5px'}}>

          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '16px', margin: '0', padding: '0px 0 0 0'}}>is staking {pointsStaked} $impact</div>

        </div>)}

        {uniqueCasts && (<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '5px 5px 0px 5px'}}>

          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '19px', margin: '0', padding: '0px 0 0 0'}}>on {uniqueCasts} casts</div>

        </div>)}

        {uniqueCreators && (<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '5px 5px 0px 5px'}}>

          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '21px', margin: '0', padding: '0px 0 0 0'}}>from {uniqueCreators} creators</div>

        </div>)} */}

        {/* {userData && (<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.0rem', border: '0px solid #eeeeeeaa', width: '50%', margin: '15px 5px 10px 5px'}}>
          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '18px', margin: '0px 0 0 0', padding: '0px 0 0 0'}}>subscribe to Auto-Fund @{userData.username}'s {rounded}+ creators in the frame</div> */}
          {/* <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '25px', margin: '0', padding: '5px 0 0 0', fontWeight: '400'}}>rewards you for your impact</div> */}
        {/* </div>)} */}

        {/* {(Math.floor(reward?.degen_total) > 0) && (<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '0px 5px 15px 5px'}}>

          {Math.floor(reward?.degen_total) > 0 && (<div style={{display: 'flex', flexDirection: 'column', textAlign: 'center', color: '#dee', margin: '0', padding: '0 5px 0 0', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{display: 'flex', fontSize: '86px'}}>{Math.floor(reward?.degen_total).toLocaleString() || 0}</div>
            <div style={{display: 'flex', fontSize: '25px', margin: '-10px 0 0 0'}}>$DEGEN</div>
          </div>)}


        </div>)} */}






        {/* {(!reward || Math.floor(reward?.degen_total) == 0) && (<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '60px 5px 60px 5px'}}>

          <div style={{display: 'flex', textAlign: 'center', color: '#cdd', fontSize: '30px', margin: '0', padding: '20px 0 20px 0'}}>{start ? 'check your rewards' : 'no rewards to claim today'}</div>
          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '36px', margin: '0', padding: '0px 0 0 0'}}>Impact Alpha</div> 
          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '15px', margin: '0', padding: '25px 0 0 0', fontWeight: '400'}}>curate, auto-fund or invite to /impact to win</div>

          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '25px', margin: '0px 0 0 0', padding: '0px 0 0 0'}}>Impact Daily Rewards</div>

        </div>)} */}



      </div>
      ,
      {
        width: 600, height: 314, 
        fonts: [{
          data: fontData, 
          name: 'Inter', 
          style: 'normal', 
          weight: 600
        }]
      }
    );

    const svgBuffer = Buffer.from(svg);
    const convertSvgToPng = promisify(svg2img);
    const pngBuffer = await convertSvgToPng(svgBuffer, { format: 'png', width: 600, height: 314 });


    // async function updateHash(id) {
    //   try {
    //     const objectId = new mongoose.Types.ObjectId(id)
    //     console.log(id)
    //     await connectToDatabase();
    //     let claim = await Claim.findOne({ _id: objectId }).exec();
    //     if (claim) {
    //       claim.cast_hash = 'true';
    //       await claim.save();
    //     }
    //     return 
    //   } catch (error) {
    //     console.error("Error while fetching claim:", error);
    //     return
    //   }  
    // }

    // const updated = await updateHash(id)

    // Set the content type to PNG and send the response
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'max-age=10');
    res.send(pngBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating image');
  }
}