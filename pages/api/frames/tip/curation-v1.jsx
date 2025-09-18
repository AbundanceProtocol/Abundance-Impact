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
import UserFunding from "../../../../models/UserFunding";
import CreatorFund from "../../../../models/CreatorFund";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const cache = new NodeCache({ stdTTL: 60 });


export default async function handler(req, res) {
  const { hash } = req.query

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

    async function getUser(hash) {
      try {
        
        await connectToDatabase();
        const cast = await Cast.findOne({cast_hash: hash}).select('impact_total').exec();

        if (cast) {
          return {
            impact: cast?.impact_total || 0
          }
        } else {
          return {impact: 0}
        }
        // const user = await User.findOne({fid: fid.toString(), ecosystem_points: '$IMPACT'})
        // if (user) {
        //   return {
        //     username: user?.username || '', 
        //     pfp: user?.pfp,
        //     sum: userFunding?.degen ? Math.floor(userFunding.degen) : 0
        //   }
        // } else {
        //   const cast = await Cast.findOne({author_fid: Number(fid)}).select('impact_total').exec();
        //   if (cast) {
        //     return {
        //       username: cast?.author_username || '', 
        //       pfp: cast?.author_pfp,
        //       sum: userFunding?.degen ? Math.floor(userFunding.degen) : 0
        //     }
        //   } else {
        //     return {username: null, pfp: null, sum: 0}
        //   }
        // }

      } catch (error) {
        console.error('Error handling GET request:', error);
        return {impact: 0}
      }        
    }
    const {impact} = await getUser(hash)


    const starIcon = "M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z";


    let showcase = null



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
               

              <div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: '2rem'}}>

                <svg width="40" height="40" viewBox="0 0 16 16" fill="currentColor" style={{color: 'transparent'}}>
                  <path d={starIcon} />
                </svg>


                <img src={'https://client.warpcast.com/v2/cast-image?castHash=' + hash} width={280} height={280} style={{borderRadius: '2px', border: '2px solid #eee', backgroundColor: '#8363ca'}} />

                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '10px 0 0 0'}}>
                  <svg width="40" height="40" viewBox="0 0 16 16" fill="currentColor" style={{color: '#ace'}}>
                    <path d={starIcon} />
                  </svg>

                  <div style={{display: 'flex', textAlign: 'center', color: '#def', fontSize: '22px', margin: '0', fontWeight: '700'}}>{impact || 0}</div>


                </div>


              </div>



                               {/* User Info Section */}


                {/* <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', margin: '0 0 0 0'}}>
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'}}>
                    {pfp && (<img src={pfp} width={75} height={75} style={{borderRadius: '50px', border: '2px solid #eee', backgroundColor: '#8363ca'}} />)}


                  </div>

                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid #eeeeee00', borderRadius: '16px', padding: '0px 20px', background: '#eeeeee00', minWidth: '150px', gap: '1rem'}}>

                  {username && (
                    <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid #eeeeeeaa', borderRadius: '16px', padding: '3px 10px', background: '#eeeeeeaa', width: 'auto', margin: '0'}}>
                      <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '22px', margin: '0'}}>{`@${username}`}</div>
                    </div>
                  )}

                </div>
              </div> */}



              {/* <div style={{display: 'flex', textAlign: 'center', color: '#def', fontSize: '40px', margin: '0', fontWeight: '700', margin: '30px 0 0 0'}}>{sum.toLocaleString()} $DEGEN</div>
              <div style={{display: 'flex', textAlign: 'center', color: '#def', fontSize: '20px', margin: '50px 0 0 0', fontWeight: '700'}}>Season 8</div> */}
              <div style={{display: 'flex', textAlign: 'center', color: '#def', fontSize: '22px', margin: '15px 0 0 0', fontWeight: '700'}}>cast nominated for Impact</div>



 

 
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
