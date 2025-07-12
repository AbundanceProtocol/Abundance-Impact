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
// import Impact from '../../../../models/Impact';
import User from '../../../../models/User';
// import Claim from '../../../../models/Claim';
// import ScheduleTip from '../../../../models/ScheduleTip';
// import { formatNum } from '../../../../utils/utils'


const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const cache = new NodeCache({ stdTTL: 60 });

export default async function handler(req, res) {
  const { fid, booster, validator, count } = req.query

  try {
    const fontPath = path.join(process.cwd(), 'public', 'Inter-SemiBold.ttf');
    const fontData = fs.readFileSync(fontPath);
    const iBooster = booster == 'true' || false
    const iValidator = validator == 'true' || false
    // console.log('at2 login', login, needLogin)

    // await connectToDatabase();



    async function getCuratorData(fid) {
      try {
        await connectToDatabase();

        const userData = await User.findOne({fid: fid.toString(), ecosystem_points: '$IMPACT'}).select('fid username pfp boost validator')


        console.log('userData', userData)
        
        
        return userData
      } catch (error) {
        console.error("Error while fetching casts:", error);
        return null
      }
    }



    const userData = await getCuratorData(Number(fid))
    console.log('fid 01', fid, booster, validator)

    console.log('userData', userData)

    




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
          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '28px', margin: '0', padding: '0px 0 10px 0', fontWeight: '400'}}>{'I joined Impact 2.0'}</div>
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




        <div style={{display: 'flex', flexDirection: 'row', fontSize: '15px', justifyContent: "center", alignItems: 'center', gap: '0.75rem', margin: '20px 0', flexWrap: 'wrap', width: '100%'}}>
          <div className={`btn-select ${iBooster ? 'cast-act-lt btn-brd-lt' : 'blu-drk btn-brd'}`} style={{display: 'flex', flexDirection: 'column', minWidth: '220px', color: (iBooster) ? '#000' : '#cde', height: '123px', border: '1px solid #eee', borderRadius: '16px', justifyContent: 'center', backgroundColor: (iBooster) ? '#eeeeeebb' : '#111122bb'}}>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
              <div style={{fontSize: '19px', fontWeight: '700', margin: '0 0 5px 0'}}>{iBooster ? 'Booster' : 'Boost'}</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: "center", alignItems: 'center', gap: '0.5rem'}}>
              <div>{iBooster ? 'allowing Impact 2.0' : 'allow Impact 2.0'}</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: "center", alignItems: 'center', gap: '0.5rem'}}>
              <div>to boost impactful casts</div>
            </div>

            <div style={{fontSize: '13px', fontWeight: '400', display: 'flex', flexDirection: 'row', justifyContent: "center", alignItems: 'center', gap: '0.5rem', margin: '8px 0 0 0'}}>
              <div>(earn rewards)</div>
            </div>

          </div>
          <div className={`btn-select ${iValidator ? 'cast-act-lt btn-brd-lt' : 'blu-drk btn-brd'}`} style={{display: 'flex', flexDirection: 'column', minWidth: '220px', color: (iValidator) ? '#000' : '#cde', height: '123px', border: '1px solid #eee', borderRadius: '16px', justifyContent: 'center', backgroundColor: (iValidator) ? '#eeeeeebb' : '#111122bb'}}>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: "center", alignItems: 'center', gap: '0.75rem'}}>
              <div style={{fontSize: '19px', fontWeight: '700', margin: '0 0 5px 0'}}>{iValidator ? 'Validator' : 'Validate'}</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: "center", alignItems: 'center', gap: '0.5rem'}}>
              <div>{iValidator ? 'validating the quality' : 'validate the quality'}</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: "center", alignItems: 'center', gap: '0.5rem'}}>
              <div>of impactful casts</div>
            </div>

            <div style={{fontSize: '13px', fontWeight: '400', display: 'flex', flexDirection: 'row', justifyContent: "center", alignItems: 'center', gap: '0.5rem', margin: '8px 0 0 0'}}>
              <div>(earn rewards)</div>
            </div>


          </div>



        </div>



        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.0rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '5px 5px 0px 5px'}}>

        </div>












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