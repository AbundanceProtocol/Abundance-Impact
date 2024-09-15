import satori from "satori";
import path from 'path'
import fs from 'fs';
import { promisify } from 'util';
import svg2img from 'svg2img';

import connectToDatabase from "../../../../libs/mongodb";
import User from '../../../../models/User';

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;

export default async function handler(req, res) {
  const { points } = req.query

  try {
    const fontPath = path.join(process.cwd(), 'public', 'Inter-SemiBold.ttf');
    const fontData = fs.readFileSync(fontPath);
    
    const backgroundImg = `https://impact.abundance.id/images/backgroundframe.jpg`

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

          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '24px', margin: '5px 20px 5px 20px', padding: '0'}}>Main Menu</div>

          <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid #eeeeeeaa', borderRadius: '16px', padding: '10px', margin: '15px', background: '#eeeeeeaa', width: '500px'}}>
            <div style={{display: 'flex', textAlign: 'left', color:  '#220a4d', fontSize: '17px', margin: '5px 10px 5px 10px', width: '140px'}}>What&apos;s /impact:</div>
            <div style={{display: 'flex', textAlign: 'left', color: '#220a4d', fontSize: '16px', margin: '5px 10px 5px 0px', width: '360px'}}>What is /impact and it works</div>
          </div>

          <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid #eeeeeeaa', borderRadius: '16px', padding: '10px', margin: '15px', background: '#eeeeeeaa', width: '500px'}}>
            <div style={{display: 'flex', textAlign: 'left', color:  '#220a4d', fontSize: '17px', margin: '5px 10px 5px 10px', width: '140px'}}>Explore curation:</div>
            <div style={{display: 'flex', textAlign: 'left', color: '#220a4d', fontSize: '16px', margin: '5px 10px 5px 0px', width: '360px'}}>See curator&apos;s cast nominations</div>
          </div>



          <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid #eeeeeeaa', borderRadius: '16px', padding: '10px', margin: '15px', background: '#eeeeeeaa', width: '500px'}}>
            <div style={{display: 'flex', textAlign: 'left', color:  '#220a4d', fontSize: '17px', margin: '5px 10px 5px 10px', width: '140px'}}>Get Cast Action:</div>
            <div style={{display: 'flex', textAlign: 'left', color: '#220a4d', fontSize: '16px', margin: '5px 10px 5px 0px', width: '360px'}}>Install /impact&apos;s {points} Console in your Farcaster client</div>
          </div>
        
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
