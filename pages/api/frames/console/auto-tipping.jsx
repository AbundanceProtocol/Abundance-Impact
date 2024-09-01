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
import connectToDatabase from "../../../../libs/mongodb";
import { numToText } from "../../../../utils/utils";
import mongoose from 'mongoose';

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const cache = new NodeCache({ stdTTL: 60 });


export default async function handler(req, res) {
  const { status, curators } = req.query

  // console.log('id', id)
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


          <div style={{display: 'flex', flexDirection: 'column', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: (status == 'curators') ? '1px solid #686cae99' : 'none', borderRadius: '16px', padding: '10px', margin: '15px', background: (status == 'curators') ? '#220a4dbb' : 'none', width: '500px'}}>

            <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '28px', margin: '5px 20px 5px 20px'}}>{`Auto-tip: automatically distribute your tip allowance to your nominees`}</div>

          </div>

          <div style={{display: 'flex', flexDirection: 'column', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: (status == 'all') ? '1px solid #686cae99' : 'none', borderRadius: '16px', padding: '10px', margin: '15px', background: (status == 'all') ? '#220a4dbb' : 'none', width: '500px'}}>

            <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '24px', margin: '5px 20px 5px 20px'}}>{`Auto-tip all: automatically distribute allowance to nominees throughout the ecosystem`}</div>

          </div>

          <div style={{display: 'flex', flexDirection: 'column', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid #686cae99', borderRadius: '16px', padding: '10px', margin: '15px', background: '#220a4dbb', width: '500px'}}>

            <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '26px', margin: '5px 20px 5px 20px'}}>{`Add curator: auto distribute allowance to nominees of selected curators. Stop distribution to ecosystem if previously turned on`}</div>

          </div>

          <div style={{display: 'flex', flexDirection: 'column', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: (status == 'off') ? '1px solid #686cae99' : 'none', borderRadius: '16px', padding: '10px', margin: '15px', background: (status == 'off') ? '#220a4dbb' : 'none ', width: '500px'}}>

            <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '26px', margin: '5px 20px 5px 20px'}}>{`Stop auto-tip: stops automatic allowance distribution`}</div>

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
