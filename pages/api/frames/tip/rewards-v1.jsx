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
        
        await connectToDatabase();
        const userFunding = await UserFunding.findOne({fid: fid}).select('sum').exec();

        const user = await User.findOne({fid: fid.toString(), ecosystem_points: '$IMPACT'})
        if (user) {
          return {
            username: user?.username || '', 
            pfp: user?.pfp,
            sum: userFunding?.sum ? Math.floor(userFunding.sum) : 0
          }
        }

        return {username: null, pfp: null, sum: 0}
      } catch (error) {
        console.error('Error handling GET request:', error);
        return {username: null, pfp: null, sum: 0}
      }        
    }
    const {username, pfp, sum} = await getUser(fid)


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
               





                               {/* User Info Section */}
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', margin: '0 0 0 0'}}>
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'}}>
                    {pfp && (<img src={pfp} width={75} height={75} style={{borderRadius: '50px', border: '2px solid #eee', backgroundColor: '#8363ca'}} />)}


                  </div>

                  {/* Super Impactor Text Box */}
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid #eeeeee00', borderRadius: '16px', padding: '0px 20px', background: '#eeeeee00', minWidth: '150px', gap: '1rem'}}>

                  {username && (
                    <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid #eeeeeeaa', borderRadius: '16px', padding: '3px 10px', background: '#eeeeeeaa', width: 'auto', margin: '0'}}>
                      <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '22px', margin: '0'}}>{`@${username}`}</div>
                    </div>
                  )}

                </div>
              </div>



              <div style={{display: 'flex', textAlign: 'center', color: '#def', fontSize: '40px', margin: '0', fontWeight: '700', margin: '30px 0 0 0'}}>{sum.toLocaleString()} $DEGEN</div>
              <div style={{display: 'flex', textAlign: 'center', color: '#def', fontSize: '30px', margin: '10px 0 0 0', fontWeight: '700'}}>Impact Rewards</div>




 

 
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
