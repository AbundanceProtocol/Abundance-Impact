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
        await connectToDatabase();
        const user = await User.findOne({fid: fid.toString(), ecosystem_points: '$IMPACT'})
        if (user) {
          return {username: user?.username || '', pfp: user?.pfp}
        }
        // const base = "https://client.warpcast.com/";
        // const url = `${base}v2/user-by-fid?fid=${Number(fid)}`;
        // const response = await fetch(url, {
        //   headers: {
        //     accept: "application/json",
        //   },
        // });
  
        // if (response) {
        //   const user = await response.json()
        //   if (user) {
        //     const userProfile = user?.result?.user
        //     console.log('userProfile', userProfile)
        //     return {username: userProfile?.username, pfp: userProfile?.pfp?.url}
        //   }
        // }
        return {username: null, pfp: null}
      } catch (error) {
        console.error('Error handling GET request:', error);
        return {username: null, pfp: null}
      }        
    }
    const {username, pfp} = await getUser(fid)





    let {circles, text, showcase, userPfp, curator, timeframe, channels, image} = await getCircle(fid);

    let threshold = true

    if (text) {
      const numbers = text.match(/\d+/g).map(Number);
      const numTest = numbers.some(number => number >= 100);
      if (!numTest) {
        threshold = false
      }
    }

    // if (image) {
    //   try {
    //     const buffer = image.buffer
    //     res.setHeader('Content-Type', 'image/png');
    //     res.setHeader('Cache-Control', 'max-age=10');
    //     // res.send(pngBuffer);
    //     res.send(buffer);
    //     return
    //   } catch (err) {
    //     console.error('Error deserializing BSON:', err);
    //     res.status(500).send('Error generating image');
    //     return
    //   }
    // } else {
      if (showcase?.length > 0 && showcase[0]?.impact) {
        showcase.sort((a, b) => b.impact - a.impact);

        for (let show of showcase) {
          if (show?.cast?.startsWith('https://client.warpcast.com/v2/cast-image?castHash=')) {
            const isUnavailable = await getImageFileSize(show?.cast)
            if (isUnavailable) {
              show.cast = show?.pfp
            }
          }
        }
      }
  
      let time = 'all time'
      if (timeframe == '24h') {
        time = '24 hr'
      } else if (timeframe == '3d') {
        time = '3 days'
      } else if (timeframe == '7d') {
        time = '7 days'
      } else if (timeframe == '30d') {
        time = '30 days'
      }
  
      if (circles?.length > 4) {
        circles = circles.slice(0, 4)
      }
  
      // const splitCircles = (arr) => {
      //   // Calculate the midpoint
      //   const midpoint = Math.ceil(arr.length / 2);
      
      //   // Split the array into two parts
      //   const firstHalf = arr.slice(0, midpoint);
      //   const secondHalf = arr.slice(midpoint);
      
      //   return [firstHalf, secondHalf];
      // };
  
      // const [firstHalf, secondHalf] = splitCircles(circles);
  
      if (showcase?.length > 5) {
        showcase = showcase.slice(0, 5)
      }

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
  
  
  



  
          {threshold && (<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '3px 5px 10px 2px', height: '240px'}}>
  

            <div style={{display: 'flex', textAlign: 'center', color: '#ddeeffee', fontSize: '52px', margin: '0', width: '300px'}}>Impact Curator</div>


            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '3px 5px 10px 2px', height: '240px'}}>
            {pfp && (<img src={pfp} width={100} height={100} style={{borderRadius: '80px', border: '2px solid #eee', backgroundColor: '#8363ca'}} />)}

            {username && (<div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid #eeeeeeaa', borderRadius: '16px', padding: '3px 10px', background: '#eeeeeeaa', width: 'auto', margin: '0'}}>

              <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '22px', margin: '0'}}>{`@${username}`}</div>
            </div>)}

          </div>


  
          </div>)}
  
  


  
  
  
  
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '120px'}}>
  
  
  
  
          <div style={{gap: '0.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', flexDirection: 'row'}}>
           
            {showcase?.length == 0 ? (
              <div style={{height: '130px', color: '#fff', fontSize: '17px'}}>&nbsp;</div>
            ) : showcase?.length >= 1 ? (
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
            ) : (
              <div key={index} className='frame-btn' style={{color: '#fff', fontSize: '17px'}}>&nbsp;</div>
            )
              
            }
          </div>
          </div>
  
  
  
  
  
          {/* <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '18px', margin: showcase?.length > 0 ? '30px 10px 0px 10px' : '25px 10px 0px 10px', width: 'auto', justifyContent: 'center', alignItems: 'center'}}>/impact by @abundance&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;explore curation in mini-app</div> */}
  
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
