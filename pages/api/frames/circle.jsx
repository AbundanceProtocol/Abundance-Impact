import satori from "satori";
import path from 'path'
import fs from 'fs';
import { promisify } from 'util';
import svg2img from 'svg2img';
import fetch from 'isomorphic-unfetch';
import NodeCache from 'node-cache';
import Tip from "../../../models/Tip";
import Cast from "../../../models/Cast";
import connectToDatabase from "../../../libs/mongodb";
import { numToText } from "../../../utils/utils";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const cache = new NodeCache({ stdTTL: 60 });


export default async function handler(req, res) {
  const { text, username, pfp, fids } = req.query

  console.log(fids)
  try {
    const fontPath = path.join(process.cwd(), 'public', 'Inter-SemiBold.ttf');
    const fontData = fs.readFileSync(fontPath);

    async function getPFPs(fids) {
      try {
        const fidsArray = Array.isArray(fids) ? fids : fids.split(',').map(fid => parseInt(fid.trim(), 10));

        await connectToDatabase();
        const result = await Cast.find({ author_fid: { $in: fidsArray } }, {author_fid: 1, author_pfp: 1, _id: 0} ).limit(40)

        if (result) {
          const uniqueUsers = result.reduce((acc, current) => {
            if (!acc.find(item => item.author_fid === current.author_fid)) {
              acc.push(current);
            }
            return acc;
          }, []);
          return uniqueUsers
        } else {
          return []
        }
      } catch (error) {
        console.error('Error getting PFPs:', error)
        return []
      }
    }

    const circlePFPs = await getPFPs(fids);

    const splitArray = (arr) => {
      // Calculate the midpoint
      const midpoint = Math.ceil(arr.length / 2);
    
      // Split the array into two parts
      const firstHalf = arr.slice(0, midpoint);
      const secondHalf = arr.slice(midpoint);
    
      return [firstHalf, secondHalf];
    };

    const [firstHalf, secondHalf] = splitArray(circlePFPs);

    console.log(circlePFPs)
    console.log(firstHalf)
    console.log(secondHalf)

    const backgroundImg = `https://impact.abundance.id/images/background.jpg`
    // if (articleData.username) {
    //   username = '@' + articleData.username
    // }
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
          {firstHalf.map((creator, index) => <img key={index} src={creator.author_pfp} width={90} height={90} style={{borderRadius: '80px', border: '2px solid #eee', backgroundColor: '#8363ca'}} />)}
        </div>
        <div style={{display: 'flex', flexDirection: 'column', color: 'white', 
        fontSize: '22px', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '30px', margin: '75px 20px 5px 20px'}}>{`@${username} contributed`}</div>
          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '28px', margin: '5px 20px 5px 20px'}}>{`to ${numToText(fids?.length)} artists and builders`}</div>
          <div style={{display: 'flex', textAlign: 'center', color: '#cde', fontSize: '24px', margin: '5px 20px 5px 20px'}}>{text}</div>
          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '26px', margin: '5px 20px 75px 20px'}}>{`via /impact`}</div>
          {/* <div style={{display: 'flex', textAlign: 'left', padding: '15px 0 0 0'}}>b</div> */}
        </div>
        <div style={{gap: '0.5rem', display: 'flex', flexDirection: 'row'}}>
          {secondHalf.map((creator, index) => <img key={index} src={creator.author_pfp} width={90} height={90} style={{borderRadius: '50px', border: '2px solid #eee'}} />)}
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
