import satori from "satori";
import path from 'path'
import fs from 'fs';
import { promisify } from 'util';
import svg2img from 'svg2img';
import fetch from 'isomorphic-unfetch';
import NodeCache from 'node-cache';
import sharp from "sharp";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const cache = new NodeCache({ stdTTL: 60 });


export default async function handler(req, res) {
  const { channel } = req.query

  try {
    const fontPath = path.join(process.cwd(), 'public', 'Inter-SemiBold.ttf');
    const fontData = fs.readFileSync(fontPath);

    async function getUser(channel) {
      try {
        const response = await fetch(`https://api.farcaster.xyz/v1/channel?channelId=${channel}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();

        const channelData = data?.result?.channel || null

        const pfp = channelData?.imageUrl || null

        return pfp;
      } catch (error) {
        console.error('Error fetching channel data:', error);
        return null;
      }
    };

    const pfp = await getUser(channel)

    // console.log('pfp', pfp, 'channel', channel)

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
  
    
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '3px 5px 10px 2px', height: '240px'}}>
  

            <div style={{display: 'flex', textAlign: 'center', color: '#ddeeffee', fontSize: '52px', margin: '0', width: '300px'}}>Curated Channel</div>


            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '3px 5px 10px 2px', height: '240px'}}>
            <img src={pfp || `https://ipfs.decentralized-content.com/ipfs/bafkreialf5usxssf2eu3e5ct37zzdd553d7lg7oywvdszmrg5p2zpkta7u`} width={100} height={100} style={{borderRadius: '80px', border: '2px solid #eee', backgroundColor: '#8363ca'}} />

            {channel && (<div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid #eeeeeeaa', borderRadius: '16px', padding: '3px 10px', background: '#eeeeeeaa', width: 'auto', margin: '0'}}>

              <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '22px', margin: '0'}}>{`/${channel || ''}`}</div>
            </div>)}

          </div>
  
          </div>
    
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
