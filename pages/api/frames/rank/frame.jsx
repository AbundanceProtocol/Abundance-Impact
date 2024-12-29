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
import ImpactFrame from '../../../../models/ImpactFrame';
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


    async function getRank(id) {
      try {
        const objectId = new mongoose.Types.ObjectId(id)
        console.log(id)
        await connectToDatabase();
        let rank = await ImpactFrame.findOne({ _id: objectId }).exec();
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

    let rank = await getRank(id);

    console.log('rank', rank)




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






        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '5px 5px 5px 5px'}}>

          <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid #eeeeeeaa', borderRadius: '88px', padding: '3px 10px 3px 3px', background: '#eeeeeeaa', width: 'auto', margin: '0 5px 0 0'}}>
            {rank && rank?.pfp && rank?.pfp !== null && (<img src={rank?.pfp} width={60} height={60} style={{borderRadius: '80px', border: '2px solid #eee', backgroundColor: '#8363ca'}} />)}
            <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '32px', margin: '0'}}>{rank?.username && rank?.username !== null ? `@${rank?.username}` : ' no user found'}</div>
          </div>

        </div>

          


        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '5px 5px 0px 5px'}}>

          <div style={{display: 'flex', textAlign: 'center', color: '#dee', fontSize: '32px', margin: '0', padding: '0 5px 0 0'}}>impact score:</div>

          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '26px', margin: '0', padding: '5px 0 0 0'}}>{rank?.impact_score_all && ' ' + rank?.impact_score_all || 0}</div>

        </div>


        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '0px 5px 0px 5px'}}>

          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '16px', margin: '0', padding: '0px 0 0 0'}}>{rank?.impact_score_all_rank ? 'Higher than ' + rank?.impact_score_all_rank + '% of users' : 'Higher than 0% of users'}</div>

        </div>

        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '10px 5px 0px 5px'}}>

          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '16px', margin: '0', padding: '0px 0 0 0'}}>{rank?.raffle_score ? 'Raffle Score: ' + rank?.raffle_score + '  -  Raffle tickets: ' + rank?.raffle_tickets : 'Raffle Score: 0  -  Raffle tickets: 0'}</div>

        </div>

 


        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', gap: '2.0rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '0px'}}>


          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '0.5rem', border: '0px solid #eeeeeeaa', width: '260px', margin: '30px 5px 10px 2px'}}>

            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: '0.0rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '0'}}>

              <div style={{display: 'flex', flexDirection: 'column', color: 'black', alignItems: 'center', justifyContent: 'flex-start', gap: '0.15rem', border: '0px solid #eeeeeeaa', borderRadius: '16px', padding: '3px 5px', margin: '0', width: 'auto'}}>
                <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '20px', margin: '0'}}>{`My Top Contributors:`}</div>
                <div style={{display: 'flex', textAlign: 'center', color: '#dee', fontSize: '14px', margin: '0'}}>{`($degen)`}</div>
              </div>

            </div>


            {rank?.contributor?.length > 0 ? (
              rank?.contributor?.map((user, index) => (<div key={index} style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
                <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid #eeeeeeaa', borderRadius: '16px', padding: '2px 5px', background: '#eeeeeeaa', width: 'auto', margin: '0'}}>
                  {user && (<img src={user?.pfp} width={25} height={25} style={{borderRadius: '80px', border: '1px solid #eee', backgroundColor: '#8363ca'}} />)}
                  <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '16px', margin: '0'}}>{`@${user?.username}`}</div>
                </div>
                <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '15px', margin: '0', padding: '0'}}>{user?.degen && formatNum(user?.degen || 0)}</div>
              </div>))
            ) : (<div style={{display: 'flex', textAlign: 'center', color: '#dee', fontSize: '18px', margin: '0'}}>{`No contributors found`}</div>)}
          </div>



          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '0.5rem', border: '0px solid #eeeeeeaa', width: '260px', margin: '30px 5px 10px 2px'}}>

          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.0rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '0'}}>

            <div style={{display: 'flex', flexDirection: 'column', color: 'black', alignItems: 'center', justifyContent: 'flex-start', gap: '0.15rem', border: '0px solid #eeeeeeaa', borderRadius: '16px', padding: '3px 5px', margin: '0', width: 'auto'}}>
              <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '20px', margin: '0'}}>{`My Top Curators:`}</div>
              <div style={{display: 'flex', textAlign: 'center', color: '#dee', fontSize: '14px', margin: '0'}}>{`(pts)`}</div>
            </div>

          </div>


          {rank?.curator?.length > 0 ? (
            rank?.curator?.map((user, index) => (<div key={index} style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
              <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid #eeeeeeaa', borderRadius: '16px', padding: '2px 5px', background: '#eeeeeeaa', width: 'auto', margin: '0'}}>
                {user && (<img src={user?.pfp} width={25} height={25} style={{borderRadius: '80px', border: '1px solid #eee', backgroundColor: '#8363ca'}} />)}
                <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '16px', margin: '0'}}>{`@${user?.username}`}</div>
              </div>
              <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '15px', margin: '0', padding: '0'}}>{user?.impact && user?.impact}</div>
            </div>))
          ) : (<div style={{display: 'flex', textAlign: 'center', color: '#dee', fontSize: '18px', margin: '0'}}>{`No curators found`}</div>)}
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
    res.setHeader('Cache-Control', 'max-age=10');
    res.send(pngBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating image');
  }
}