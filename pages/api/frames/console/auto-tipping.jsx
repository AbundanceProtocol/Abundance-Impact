import satori from "satori";
import path from 'path'
import fs from 'fs';
import { promisify } from 'util';
import svg2img from 'svg2img';

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;

export default async function handler(req, res) {
  const { status, curators } = req.query

  console.log('status', status)
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

          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '24px', margin: '5px 20px 5px 20px', padding: '0'}}>Auto-tip Menu</div>


          <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: (status == 'all') ? '2px solid #686cae99' : '1px solid #eeeeeeaa', borderRadius: '16px', padding: '10px', margin: '15px', background: (status == 'all') ? '#220a4dbb' : '#eeeeeeaa', width: '500px'}}>

            <div style={{display: 'flex', textAlign: 'left', color:  (status == 'all') ? '#eff' : '#220a4d', fontSize: '17px', margin: '5px 10px 5px 10px', width: '180px'}}>Auto-tip all:</div>

            <div style={{display: 'flex', textAlign: 'left', color:  (status == 'all') ? '#eff' : '#220a4d', fontSize: '16px', margin: '5px 10px 5px 0px', width: '100%'}}>automatically distribute leftover $degen allowance to nominees throughout the ecosystem</div>

          </div>

          <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: (status == 'curators') ? '2px solid #686cae99' : '1px solid #eeeeeeaa', borderRadius: '16px', padding: '10px', margin: '15px', background: (status == 'curators') ? '#220a4dbb' : '#eeeeeeaa', width: '500px'}}>

            <div style={{display: 'flex', textAlign: 'left', color:  (status == 'curators') ? '#eff' : '#220a4d', fontSize: '17px', margin: '5px 10px 5px 10px', width: '180px'}}>Auto-tip:</div>

            <div style={{display: 'flex', textAlign: 'left', color:  (status == 'curators') ? '#eff' : '#220a4d', fontSize: '16px', margin: '5px 10px 5px 0px', width: '100%'}}>automatically distribute your tip allowance to your nominees</div>

          </div>

          <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: (status == 'add') ? '2px solid #686cae99' : '1px solid #eeeeeeaa', borderRadius: '16px', padding: '10px', margin: '15px', background: (status == 'add') ? '#220a4dbb' : '#eeeeeeaa', width: '500px'}}>

            <div style={{display: 'flex', textAlign: 'left', color:  (status == 'add') ? '#eff' : '#220a4d', fontSize: '17px', margin: '5px 10px 5px 10px', width: '180px'}}>Add curator:</div>

            <div style={{display: 'flex', textAlign: 'left', color:  (status == 'add') ? '#eff' : '#220a4d', fontSize: '16px', margin: '5px 10px 5px 0px', width: '100%'}}>find and add curator to your auto-tip distribution. stops distribution to ecosystem if previously turned on</div>

          </div>

          <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: (status == 'off') ? '2px solid #686cae99' : '1px solid #eeeeeeaa', borderRadius: '16px', padding: '10px', margin: '15px', background: (status == 'off') ? '#220a4dbb' : '#eeeeeeaa', width: '500px'}}>

            <div style={{display: 'flex', textAlign: 'left', color:  (status == 'off') ? '#eff' : '#220a4d', fontSize: '17px', margin: '5px 10px 5px 10px', width: '180px'}}>Stop Auto-tip:</div>

            <div style={{display: 'flex', textAlign: 'left', color:  (status == 'off') ? '#eff' : '#220a4d', fontSize: '16px', margin: '5px 10px 5px 0px', width: '100%'}}>stop automatic allowance distribution</div>

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
