import satori from "satori";
import path from 'path'
import fs from 'fs';
import { promisify } from 'util';
import svg2img from 'svg2img';

import connectToDatabase from "../../../../libs/mongodb";
import User from '../../../../models/User';

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;

export default async function handler(req, res) {
  const { status } = req.query

  console.log('oo1 status', status)
  try {
    const fontPath = path.join(process.cwd(), 'public', 'Inter-SemiBold.ttf');
    const fontData = fs.readFileSync(fontPath);

    let userStatus = status || 'opted-in'

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
        <div style={{display: 'flex', flexDirection: 'column', color: 'white', 
        fontSize: '22px', alignItems: 'center', justifyContent: 'center'}}>

          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '24px', margin: '5px 20px 5px 20px', padding: '0'}}>Opt-out Menu</div>


          {userStatus == 'opted-in' && (<div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid #686cae99', borderRadius: '16px', padding: '10px', margin: '15px 15px 45px 15px', background: '#ffeebbbb', width: '500px'}}>
            <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '20px', margin: '5px 10px 5px 10px', width: '500px', justifyContent: 'center', alignItems: 'center'}}>You are currently opted-in. Are you sure you want to opt out of /impact?</div>
          </div>)}

          {userStatus == 'opted-in' && (<div style={{display: 'flex', flexDirection: 'column', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid #eeeeeeaa', borderRadius: '16px', padding: '10px', margin: '15px 15px 45px 15px', background: '#eeeeeeaa', width: '500px'}}>
            <div style={{display: 'flex', textAlign: 'left', color: '#220a4d', fontSize: '18px', margin: '5px 10px 5px 10px', width: '100%', justifyContent: 'center', alignItems: 'center'}}>Note: Opt-out will make your casts ineligible for boosting and rewards through /impact and @impactbot will not display nominations for your casts.</div>
            <div style={{display: 'flex', textAlign: 'left', color: '#220a4d', fontSize: '18px', margin: '5px 10px 5px 10px', width: '100%', justifyContent: 'center', alignItems: 'center'}}>You can opt-in at any time through a frame or in the app</div>
          </div>)}

          {userStatus == 'opted-out' && (<div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid #686cae99', borderRadius: '16px', padding: '10px', margin: '15px 15px 45px 15px', background: '#ffeebbbb', width: '500px'}}>
            <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '20px', margin: '5px 10px 5px 10px', width: '500px', justifyContent: 'center', alignItems: 'center'}}>You are currently opted-out. Would you like to opt into /impact?</div>
          </div>)}

        
        </div>
      </div>
      ,
      {
        width: 600, height: 600, 
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
    const pngBuffer = await convertSvgToPng(svgBuffer, { format: 'png', width: 600, height: 600 });

    // Set the content type to PNG and send the response
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.send(pngBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating image');
  }
}
