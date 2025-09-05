import satori from "satori";
import path from 'path'
import fs from 'fs';
import { promisify } from 'util';
import svg2img from 'svg2img';
import fetch from 'isomorphic-unfetch';
import NodeCache from 'node-cache';
import Tip from "../../../../models/Tip";
import Cast from "../../../../models/Cast";
import Circle from "../../../../models/Circle";
import User from "../../../../models/User";
import ScheduleTip from "../../../../models/ScheduleTip";
import connectToDatabase from "../../../../libs/mongodb";
import { numToText } from "../../../../utils/utils";
import mongoose from 'mongoose';
import sharp from "sharp";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const cache = new NodeCache({ stdTTL: 60 });


export default async function handler(req, res) {
  const { fid } = req.query

  try {
    const fontPath = path.join(process.cwd(), 'public', 'Inter-SemiBold.ttf');
    const fontData = fs.readFileSync(fontPath);

    async function getCircle(fid) {
      try {
        // console.log(id)
        await connectToDatabase();
        let circle = null
        if (fid) {
          circle = await Circle.findOne({ fid }).sort({ createdAt: -1 }).exec();
        // } else if (id) {
        //   const objectId = new mongoose.Types.ObjectId(id)
        //   circle = await Circle.findOne({ _id: objectId }).exec();
        }
        if (circle && !circle?.image) {
          return {circles: circle.circles, text: circle.text, showcase: circle.showcase, userPfp: circle.user_pfp || null, curator: circle.curator || [], timeframe: circle.time || '', channels: circle.channels || [], image: null}
        } else if (circle && circle?.image) {
          return {circles: circle.circles, text: circle.text, showcase: circle.showcase, userPfp: circle.user_pfp || null, curator: circle.curator || [], timeframe: circle.time || '', image: null, channels: circle.channels || []}
        } else {
          return {circles: [], text: '', showcase: [], userPfp: null, curator: [], timeframe: '', image: null}
        }
      } catch (error) {
        console.error("Error while fetching casts:", error);
        return {circles: [], text: '', showcase: [], userPfp: null, curator: [], timeframe: '', channels: [], image: null}
      }  
    }

    async function updateImage(fid, image) {
      try {
        // console.log(id)
        await connectToDatabase();
        let circle = null
        
        if (fid) {
          circle = await Circle.findOne({ fid }).sort({ createdAt: -1 }).exec();
        // } else if (id) {
        //   const objectId = new mongoose.Types.ObjectId(id)
        //   circle = await Circle.findOne({ _id: objectId }).exec();
        }

        if (circle) {
          circle.image = image;
          await circle.save();
        }
        return 
      } catch (error) {
        console.error("Error while fetching casts:", error);
        return
      }  
    }

    async function getImageFileSize(url) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          const contentLength = response.headers.get('content-length');
          if (contentLength) {
            // typical "Cast preview unavailable" image size
            if (parseInt(contentLength, 10) < 14500) {
              return true
            }
          }
          return false
        } else {
          console.error('Failed to fetch the image:', response.status, response.statusText);
          return false;
        }
      } catch (error) {
        console.error('Error fetching the image size:', error);
        return false;
      }
    }

    async function getUser(fid) {
      try {

        const schedule = await ScheduleTip.findOne({fid: Number(fid)}).select('active_cron').exec();

        let autoFund = false
        if (schedule) {
          autoFund = schedule?.active_cron || false
        }


        await connectToDatabase();
        const user = await User.findOne({fid: fid.toString(), ecosystem_points: '$IMPACT'})
        if (user) {
          return {
            username: user?.username || '', 
            pfp: user?.pfp,
            boost: user?.boost || false,
            validator: user?.validator || false,
            impact_boost: user?.impact_boost || false,
            autoFund: autoFund || false
          }
        }




        return {username: null, pfp: null, boost: false, validator: false, impact_boost: false, autoFund: false}
      } catch (error) {
        console.error('Error handling GET request:', error);
        return {username: null, pfp: null, boost: false, validator: false, impact_boost: false, autoFund: false}
      }        
    }
    const {username, pfp, boost, validator, impact_boost, autoFund} = await getUser(fid)

    // Icon SVG paths for Satori
    const starIcon = "M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z";
    const shieldIcon = "M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.8 11.8 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7 7 0 0 0 1.048-.625 11.8 11.8 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.54 1.54 0 0 0-1.044-1.263 63 63 0 0 0-2.887-.87C9.843.266 8.69 0 8 0m2.146 5.146a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793z"; 
    const rocketIcon = "M12.17 9.53c2.307-2.592 3.278-4.684 3.641-6.218.21-.887.214-1.58.16-2.065a3.6 3.6 0 0 0-.108-.563 2 2 0 0 0-.078-.23V.453c-.073-.164-.168-.234-.352-.295a2 2 0 0 0-.16-.045 4 4 0 0 0-.57-.093c-.49-.044-1.19-.03-2.08.188-1.536.374-3.618 1.343-6.161 3.604l-2.4.238h-.006a2.55 2.55 0 0 0-1.524.734L.15 7.17a.512.512 0 0 0 .433.868l1.896-.271c.28-.04.592.013.955.132.232.076.437.16.655.248l.203.083c.196.816.66 1.58 1.275 2.195.613.614 1.376 1.08 2.191 1.277l.082.202c.089.218.173.424.249.657.118.363.172.676.132.956l-.271 1.9a.512.512 0 0 0 .867.433l2.382-2.386c.41-.41.668-.949.732-1.526zm.11-3.699c-.797.8-1.93.961-2.528.362-.598-.6-.436-1.733.361-2.532.798-.799 1.93-.96 2.528-.361s.437 1.732-.36 2.531Z M5.205 10.787a7.6 7.6 0 0 0 1.804 1.352c-1.118 1.007-4.929 2.028-5.054 1.903-.126-.127.737-4.189 1.839-5.18.346.69.837 1.35 1.411 1.925"; 
    const fundIcon = "M7.964 1.527c-2.977 0-5.571 1.704-6.32 4.125h-.55A1 1 0 0 0 .11 6.824l.254 1.46a1.5 1.5 0 0 0 1.478 1.243h.263c.3.513.688.978 1.145 1.382l-.729 2.477a.5.5 0 0 0 .48.641h2a.5.5 0 0 0 .471-.332l.482-1.351c.635.173 1.31.267 2.011.267.707 0 1.388-.095 2.028-.272l.543 1.372a.5.5 0 0 0 .465.316h2a.5.5 0 0 0 .478-.645l-.761-2.506C13.81 9.895 14.5 8.559 14.5 7.069q0-.218-.02-.431c.261-.11.508-.266.705-.444.315.306.815.306.815-.417 0 .223-.5.223-.461-.026a1 1 0 0 0 .09-.255.7.7 0 0 0-.202-.645.58.58 0 0 0-.707-.098.74.74 0 0 0-.375.562c-.024.243.082.48.32.654a2 2 0 0 1-.259.153c-.534-2.664-3.284-4.595-6.442-4.595m7.173 3.876a.6.6 0 0 1-.098.21l-.044-.025c-.146-.09-.157-.175-.152-.223a.24.24 0 0 1 .117-.173c.049-.027.08-.021.113.012a.2.2 0 0 1 .064.199m-8.999-.65a.5.5 0 1 1-.276-.96A7.6 7.6 0 0 1 7.964 3.5c.763 0 1.497.11 2.18.315a.5.5 0 1 1-.287.958A6.6 6.6 0 0 0 7.964 4.5c-.64 0-1.255.09-1.826.254ZM5 6.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0"

    let showcase = null

    let impactLabel = ''

    let counter = 0
    if (boost) {
      counter++
    }
    if (validator) {
      counter++
    }
    if (impact_boost) {
      counter++
    }
    if (autoFund) {
      counter++
    }

    if (counter == 1) {
      if (boost) {
        impactLabel = 'Signal Booster'
      } else if (validator) {
        impactLabel = 'Impact Defender'
      } else if (impact_boost) {
        impactLabel = 'Impact Booster'
      } else if (autoFund) {
        impactLabel = 'Impact Funder'
      }
    } else if (counter == 2) {
      impactLabel = 'Prime Impactor'
    } else if (counter == 3) {
      impactLabel = 'Star Impactor'
    } else if (counter == 4) {
      impactLabel = 'Super Impactor'
    }



    let threshold = true


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
  
  
  



  
            {threshold && (
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '3px 5px 10px 2px', height: '240px'}}>
               




                               {/* User Info Section */}
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '1rem', margin: '0 0 2rem 0'}}>
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'}}>
                    {pfp && (<img src={pfp} width={100} height={100} style={{borderRadius: '50px', border: '2px solid #eee', backgroundColor: '#8363ca'}} />)}


                  </div>

                  {/* Super Impactor Text Box */}
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid #eeeeee00', borderRadius: '16px', padding: '10px 20px', background: '#eeeeee00', minWidth: '150px', gap: '1rem'}}>
                    <div style={{display: 'flex', textAlign: 'center', color: '#def', fontSize: '36px', margin: '0', fontWeight: '700'}}>{impactLabel}</div>
                  {username && (
                      <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid #eeeeeeaa', borderRadius: '16px', padding: '3px 10px', background: '#eeeeeeaa', width: 'auto', margin: '0'}}>
                        <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '18px', margin: '0'}}>{`@${username}`}</div>
                      </div>
                    )}

                  </div>
                </div>









               {/* Large Icons Section */}
               <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '1rem'}}>
                 
                 {/* Boost icon */}
                 {boost && (
                   <svg width="80" height="80" viewBox="0 0 16 16" fill="currentColor" style={{color: '#ace'}}>
                     <path d={starIcon} />
                   </svg>
                 )}
                 
                 {/* Validator icon */}
                 {validator && (
                   <svg width="80" height="80" viewBox="0 0 16 16" fill="currentColor" style={{color: '#ace'}}>
                     <path d={shieldIcon} />
                   </svg>
                 )}
                 
                 {autoFund && (
                   <svg width="80" height="80" viewBox="0 0 16 16" fill="currentColor" style={{color: '#ace'}}>
                     <path d={fundIcon} />
                   </svg>
                 )}



                 {/* Impact boost icon */}
                 {impact_boost && (
                   <svg width="80" height="80" viewBox="0 0 16 16" fill="currentColor" style={{color: '#ace'}}>
                     <path d={rocketIcon} />
                   </svg>
                 )}




                 
                 {/* Show message if no icons */}
                 {!boost && !validator && !impact_boost && !autoFund && (
                   <div style={{display: 'flex', textAlign: 'center', color: '#ddeeffee', fontSize: '24px', margin: '0'}}>
                     No badges yet
                   </div>
                 )}
               </div>
 

 
             </div>
           )}
  
  


  
  
  
  
          {(showcase && showcase?.length >= 1) && (<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '120px'}}>
  
  
  
  
          <div style={{gap: '0.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', flexDirection: 'row'}}>
           
            {showcase?.length >= 1 && (
              showcase.map((show, index) => (
                <div key={index} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: '65px', maxWidth: '140px', position: 'relative'}}>
                  <img src={show.cast} width={100} height={100} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '10px', border: '2px solid #eee', backgroundColor: '#8363ca', minWidth: '65px', maxWidth: '170px'}} />
                  {show?.impact && (
                    <div style={{position: 'absolute', bottom: 0, right: 0, transform: 'translate(-0%, -0%)', backgroundColor: '#86c', color: '#fff', fontSize: '15px', padding: '2px 4px', borderRadius: '3px' }}>
                      {show.impact.toString()}
                    </div>
                  )}
                </div>
              ))
            )
              
            }
          </div>
          </div>)}
  
  
  

        </div>
        ,
        {
          width: 600, height: 400, 
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
      const pngBuffer = await convertSvgToPng(svgBuffer, { format: 'png', width: 600, height: 400 });
  
      const compressedBuffer = await sharp(pngBuffer)
        .png({ quality: 50, compressionLevel: 9 })
        .toBuffer();
  
      // const updated = await updateImage(fid, compressedBuffer)

      // Set the content type to PNG and send the response
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'max-age=10');
      // res.send(pngBuffer);
      res.send(compressedBuffer);
    // }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating image');
  }
}
