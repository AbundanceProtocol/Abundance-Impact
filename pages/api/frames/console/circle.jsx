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
  const { id } = req.query

  console.log('id', id)
  try {
    const fontPath = path.join(process.cwd(), 'public', 'Inter-SemiBold.ttf');
    const fontData = fs.readFileSync(fontPath);

    async function getCircle(id) {
      try {
        const objectId = new mongoose.Types.ObjectId(id)
        console.log(id)
        await connectToDatabase();
        let circle = await Circle.findOne({ _id: objectId }).exec();
        if (circle) {
          return {circles: circle.circles, text: circle.text, username: circle.username}
        } else {
          return {circles: [], text: '', username: ''}
        }
      } catch (error) {
        console.error("Error while fetching casts:", error);
        return {circles: [], text: '', username: ''}
      }  
    }

    let {circles, text, username} = await getCircle(id);

    if (circles?.length > 10) {
      circles = circles.slice(0, 10)
    }

    const splitCircles = (arr) => {
      // Calculate the midpoint
      const midpoint = Math.ceil(arr.length / 2);
    
      // Split the array into two parts
      const firstHalf = arr.slice(0, midpoint);
      const secondHalf = arr.slice(midpoint);
    
      return [firstHalf, secondHalf];
    };

    const [firstHalf, secondHalf] = splitCircles(circles);


    const backgroundImg = `https://impact.abundance.id/images/background.jpg`

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
        <div style={{gap: '0.5rem', display: 'flex', flexDirection: 'row'}}>
          {(firstHalf?.length > 0) ? (firstHalf.map((creator, index) => <img key={index} src={creator} width={90} height={90} style={{borderRadius: '80px', border: '2px solid #eee', backgroundColor: '#8363ca'}} />)) : (<div style={{height: '90px'}}>&nbsp;</div>)}
        </div>
        <div style={{display: 'flex', flexDirection: 'column', color: 'white', 
        fontSize: '22px', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '30px', margin: '75px 20px 5px 20px'}}>{`@${username} contributed`}</div>
          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '28px', margin: '5px 20px 5px 20px'}}>{`to ${numToText(circles?.length)} ${circles?.length == 1 ? 'creator' : 'artists and builders'}`}</div>
          <div style={{display: 'flex', textAlign: 'center', color: '#cde', fontSize: '24px', margin: '5px 20px 5px 20px'}}>{text}</div>
          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '26px', margin: '5px 20px 75px 20px'}}>{`via /impact`}</div>
        </div>
        <div style={{gap: '0.5rem', display: 'flex', flexDirection: 'row'}}>
          {(secondHalf?.length > 0) ? (secondHalf.map((creator, index) => <img key={index} src={creator} width={90} height={90} style={{borderRadius: '50px', border: '2px solid #eee'}} />)) : (<div style={{height: '90px'}}>&nbsp;</div>)}
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
