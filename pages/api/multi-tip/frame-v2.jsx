import satori from "satori";
import path from 'path'
import fs from 'fs';
import { promisify } from 'util';
import svg2img from 'svg2img';
import fetch from 'isomorphic-unfetch';
import NodeCache from 'node-cache';
// import User from "../../../models/User";
import Circle from "../../../models/Circle";
import connectToDatabase from "../../../libs/mongodb";
// import { numToText } from "../../../utils/utils";
import mongoose from 'mongoose';

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


    async function getCircle(id) {
      try {
        const objectId = new mongoose.Types.ObjectId(id)
        console.log(id)
        await connectToDatabase();
        let circle = await Circle.findOne({ _id: objectId }).exec();
        if (circle) {
          return {showcase: circle.showcase, curator: circle.curator || [], timeframe: circle.time || '', channels: circle.channels || []}
        } else {
          return {showcase: [], curator: [], timeframe: '', channels: []}
        }
      } catch (error) {
        console.error("Error while fetching casts:", error);
        return {showcase: [], curator: [], timeframe: '', channels: []}
      }  
    }

    let {showcase, curator, timeframe, channels} = await getCircle(id);

    console.log('curator', curator)



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










        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '5px 5px 15px 5px'}}>

          <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid #eeeeeeaa', borderRadius: '88px', padding: '3px 10px 3px 3px', background: '#eeeeeeaa', width: 'auto', margin: '0 5px 0 0'}}>
            {curator.length > 0 && curator[0]?.pfp && curator[0]?.pfp !== null && (<img src={curator[0]?.pfp} width={40} height={40} style={{borderRadius: '80px', border: '2px solid #eee', backgroundColor: '#8363ca'}} />)}
            <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '22px', margin: '0'}}>{curator && curator[0]?.username !== null ? `@${curator[0]?.username}` : ' Ecosystem'}</div>
          </div>

          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '22px', margin: '0', padding: '0'}}>impact picks</div>


        </div>







        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.0rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '0px 5px 0px 5px'}}>

          <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', borderRadius: '16px', padding: '3px 5px', margin: '0', width: 'auto'}}>
            <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '18px', margin: '0'}}>{`picked over`}{time !== 'all time' && ' the last'}</div>
          </div>

          <div style={{display: 'flex', flexDirection: 'row', color: '#220a4d', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid #eeeeeeaa', borderRadius: '16px', padding: '3px 10px', background: '#eeeeeeaa', width: 'auto', margin: '0', fontSize: '18px'}}>{time}</div>

          <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', borderRadius: '16px', padding: '3px 5px', margin: '0', width: 'auto'}}>
            <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '18px', margin: '0'}}>{`in`}</div>
          </div>

          <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid #eeeeeeaa', borderRadius: '16px', padding: '3px 10px', background: '#eeeeeeaa', width: 'auto', margin: '0', fontSize: '18px'}}>
            <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '18px', margin: '0'}}>{`${channels?.length > 0 && channels[0] !== ' ' && channels[0] !== null ? '/' + channels[0] : 'all channels'}`}</div>
          </div>




          {/* <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid #eeeeeeaa', borderRadius: '16px', padding: '3px 10px', margin: '0', background: '#eeeeeeaa', width: 'auto'}}>
            <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '18px', margin: '0'}}>{text}</div>
          </div>

          <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', borderRadius: '16px', padding: '3px 5px', margin: '0', width: 'auto'}}>
            <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '18px', margin: '0'}}>{`to ${numToText(showcase?.length)} creator`}{showcase?.length > 1 && `s`}</div>
          </div> */}



        </div>
 

        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.0rem', border: '0px solid #eeeeeeaa', width: 'auto', margin: '3px 5px 10px 2px'}}>

          <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', borderRadius: '16px', padding: '3px 5px', margin: '0', width: 'auto'}}>
            <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '18px', margin: '0'}}>{`latest picks feature:`}</div>
          </div>

        </div>





        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '390px'}}>

          <div style={{gap: '0.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', flexDirection: 'row'}}>
          
            {showcase?.length == 0 ? (
              <div style={{height: '130px'}}>No casts</div>
            ) : showcase?.length == 1 ? (
              <img src={showcase[0].cast} height={390} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '10px', border: '2px solid #eee', backgroundColor: '#8363ca', minWidth: '180px', maxWidth: '560px'}} />
            ) : showcase?.length == 2 ? (
              showcase.map((show, index) => <img key={index} src={show.cast} height={210} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '10px', border: '2px solid #eee', backgroundColor: '#8363ca', minWidth: '110px', maxWidth: '265px'}} />)
            ) : showcase?.length == 3 || showcase?.length == 4 ? (
              showcase.map((show, index) => <img key={index} src={show.cast} height={190} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '10px', border: '2px solid #eee', backgroundColor: '#8363ca', minWidth: '110px', maxWidth: '265px'}} />)
            ) : showcase?.length >= 5 && showcase?.length <= 9 ? (
              showcase.map((show, index) => <img key={index} src={show.cast} height={125} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '10px', border: '2px solid #eee', backgroundColor: '#8363ca', minWidth: '65px', maxWidth: '170px'}} />)
            ) : (
              <div key={index} className='frame-btn'>No casts</div>
            )
            
            }
          </div>
        </div>





        <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '18px', margin: showcase?.length > 0 ? '30px 10px 0px 10px' : '25px 10px 0px 10px', width: 'auto', justifyContent: 'center', alignItems: 'center'}}>/impact by @abundance&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;explore curation in mini-app</div>

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