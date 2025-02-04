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
import Circle from '../../../../models/Circle';
import CreatorFund from '../../../../models/CreatorFund';
import Claim from '../../../../models/Claim';
import ImpactFrame from '../../../../models/ImpactFrame';
import { formatNum } from '../../../../utils/utils'


const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const cache = new NodeCache({ stdTTL: 60 });

export default async function handler(req, res) {
  const { id, shared, start } = req.query

  // console.log('at1 status', curators, points, typeof curators, time, channel)
  try {
    const fontPath = path.join(process.cwd(), 'public', 'Inter-SemiBold.ttf');
    const fontData = fs.readFileSync(fontPath);
    // const login = needLogin == 'true'
    // console.log('at2 login', login, needLogin)

    await connectToDatabase();


    async function getReward(id) {
      try {
        const objectId = new mongoose.Types.ObjectId(id)
        console.log(id)
        await connectToDatabase();
        let rank = await Claim.findOne({ _id: objectId }).exec();

        if (shared) {
          const updateOptions = {
            upsert: false,
            new: true,
            setDefaultsOnInsert: true,
          };

          const update = {
            $set: {
              claimed: true
            },
          };

          const userFid = await Claim.findOne({ _id: objectId }).select('fid').exec().then(doc => doc.fid);

          console.log('userFid')
          const lastFourDays = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);

          const updatedDocs = await Claim.updateMany({ fid: userFid, createdAt: { $gt: lastFourDays } }, update, updateOptions);
        }

        if (rank) {
          return rank
        } else {
          return null
        }
      } catch (error) {
        console.error("Error while fetching casts:", error);
        return null
      }  
    }

    let reward = null

    if (id) {
      reward = await getReward(id);
    }


    console.log('reward', reward)




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






        {(Math.floor(reward?.degen_total) > 0) && (<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '5px 5px 15px 5px'}}>

          <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid #eeeeeeaa', borderRadius: '88px', padding: '3px 10px 3px 3px', background: '#eeeeeeaa', width: 'auto', margin: '0 5px 0 0'}}>
            {reward && reward?.pfp && reward?.pfp !== null && (<img src={reward?.pfp} width={30} height={30} style={{borderRadius: '80px', border: '2px solid #eee', backgroundColor: '#8363ca'}} />)}
            <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '20px', margin: '0'}}>{reward?.username && reward?.username !== null ? `@${reward?.username}` : ' no user found'}</div>
          </div>

        </div>)}


        {(Math.floor(reward?.degen_total) > 0) && (<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '0px 5px 0px 5px'}}>

          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '26px', margin: '0', padding: '0px 0 0 0'}}>I just claimed</div>

        </div>)}



        {(Math.floor(reward?.degen_total) > 0) && (<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '0px 5px 15px 5px'}}>

          {Math.floor(reward?.degen_total) > 0 && (<div style={{display: 'flex', flexDirection: 'column', textAlign: 'center', color: '#dee', margin: '0', padding: '0 5px 0 0', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{display: 'flex', fontSize: '86px'}}>{Math.floor(reward?.degen_total).toLocaleString() || 0}</div>
            <div style={{display: 'flex', fontSize: '25px', margin: '-10px 0 0 0'}}>$DEGEN</div>
          </div>)}

          {/* {Math.floor(reward?.ham) > 0 && (<div style={{display: 'flex', flexDirection: 'column', textAlign: 'center', color: '#dee', margin: '0', padding: '0 5px 0 0', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{display: 'flex', fontSize: '66px'}}>{Math.floor(reward?.ham).toLocaleString() || 0}</div>
            <div style={{display: 'flex', fontSize: '15px'}}>$HAM</div>
          </div>)} */}

        </div>)}



        {(Math.floor(reward?.degen_total) > 0) && (<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.0rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '5px 5px 10px 5px'}}>
          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '15px', margin: '0', padding: '5px 0 0 0', fontWeight: '400'}}>curate, auto-fund or invite to /impact to win</div>

          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '25px', margin: '0px 0 0 0', padding: '0px 0 0 0'}}>Impact Daily Rewards</div>

        </div>)}


        {(!reward || Math.floor(reward?.degen_total) == 0) && (<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '60px 5px 60px 5px'}}>

          <div style={{display: 'flex', textAlign: 'center', color: '#cdd', fontSize: '30px', margin: '0', padding: '20px 0 20px 0'}}>{start ? 'check your rewards' : 'no rewards to claim today'}</div>
          {/* <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '36px', margin: '0', padding: '0px 0 0 0'}}>Impact Alpha</div> */}
          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '15px', margin: '0', padding: '25px 0 0 0', fontWeight: '400'}}>curate, auto-fund or invite to /impact to win</div>

          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '25px', margin: '0px 0 0 0', padding: '0px 0 0 0'}}>Impact Daily Rewards</div>

        </div>)}



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