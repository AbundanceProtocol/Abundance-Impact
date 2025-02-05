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
import User from '../../../../models/User';
import ScheduleTip from '../../../../models/ScheduleTip';
// import ImpactFrame from '../../../../models/ImpactFrame';
import { formatNum } from '../../../../utils/utils'


const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const cache = new NodeCache({ stdTTL: 60 });

export default async function handler(req, res) {
  const { id } = req.query

  // console.log('at1 status', curators, points, typeof curators, time, channel)
  try {
    const fontPath = path.join(process.cwd(), 'public', 'Inter-SemiBold.ttf');
    const fontData = fs.readFileSync(fontPath);
    // const login = needLogin == 'true'
    // console.log('at2 login', login, needLogin)

    await connectToDatabase();



    async function getSched(id) {
      try {
        const objectId = new mongoose.Types.ObjectId(id)
        console.log(id)
        await connectToDatabase();
        let sched = await ScheduleTip.findOne({ _id: objectId }).select('fid active_cron special_fund').exec();

        console.log('sched', sched)
        if (sched?.fid && sched?.active_cron && sched?.special_fund > 0) {

          let user = await User.findOne({ fid: sched?.fid.toString() }).select('username pfp').exec();

          return user
        } else {
          return null
        }
      } catch (error) {
        console.error("Error while fetching casts:", error);
        return null
      }  
    }

    let user = null

    if (id) {
      user = await getSched(id);
    }
    

    console.log('user', user)




    const backgroundImg = `${baseURL}/images/fund2.jpg`

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






        {user && (<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '0px 5px 5px 5px'}}>




          <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid #eeeeeeaa', borderRadius: '88px', padding: '2px 10px 2px 2px', background: '#eeeeeeaa', width: 'auto', margin: '0 5px 0 0'}}>
            {user && user?.pfp && user?.pfp !== null && (<img src={user?.pfp} width={35} height={35} style={{borderRadius: '80px', border: '1px solid #eee', backgroundColor: '#8363ca'}} />)}
            <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '22px', margin: '0'}}>{user?.username && user?.username !== null ? `@${user?.username}` : ' no user found'}</div>
          </div>

          <div style={{display: 'flex', flexDirection: 'row', color: 'white', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', borderRadius: '88px', padding: '3px 10px 3px 3px', width: 'auto', margin: '0 5px 0 0'}}>
            <div style={{display: 'flex', textAlign: 'center', color: '#eee', fontSize: '22px', margin: '0'}}>is auto-funding</div>
          </div>

        </div>)}

        <div style={{height: '250px', margin: '120px'}}>&nbsp;</div>



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

    // Set the content type to PNG and send the response
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'max-age=10');
    res.send(pngBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating image');
  }
}