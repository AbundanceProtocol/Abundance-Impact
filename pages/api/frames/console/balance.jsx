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
import { FaUser } from "react-icons/fa";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const cache = new NodeCache({ stdTTL: 60 });


export default async function handler(req, res) {
  // const { id } = req.query
  const { iB, qB, qT, author, iA, qA, ecosystem, login, pt, cu  } = req.query;

  console.log('24', iB, qB, qT, author, iA, qA, ecosystem, login, pt, cu)
  
  try {
    const fontPath = path.join(process.cwd(), 'public', 'Inter-SemiBold.ttf');
    const fontData = fs.readFileSync(fontPath);


    let ecosystemName = ecosystem || ''
    let username =  author || ''
    let curator =  cu || ''
    let impactBalance = iA || 0
    let points = pt || '$POINTS'
    let qdau = qA || 0
    let castImpact = iB || 0
    let castQdauCount = qT || 0
    let castQdauBalance = qB || 0

    const svg = await satori(
      <div style={{
        width: '100%',
        height: '100%',
        padding: 30,
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, #001144, #556699)`,
        justifyContent: 'center',
        alignItems: 'center', 
      }}>

        <div style={{display: 'flex', flexDirection: 'column', color: 'white', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '24px', margin: '5px 20px 15px 30px', padding: '0 0 10px 0'}}>{`${ecosystemName} Ecosystem`}</div>

          {(login == true) ? (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', border: '2px solid #ccc', background: '#33333355', padding: '15px 50px 20px 50px', borderRadius: '16px'}}>

              <div style={{display: 'flex', flexDirection: 'column', color: 'white', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '23px', margin: '2px'}}>{`Login required`}</div>
              </div>

            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', border: '2px solid #ccc', background: '#33333355', padding: '15px 50px 20px 50px', borderRadius: '16px'}}>

              <div style={{display: 'flex', flexDirection: 'column', color: 'white', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '23px', margin: '2px'}}>{`@${curator} balance`}</div>
              </div>

              <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'}}>

                <div style={{display: 'flex', flexDirection: 'row', color: 'white', alignItems: 'center', justifyContent: 'center', background: '#eeeeee22', borderRadius: '8px', padding: '3px 9px', border: '1px solid #ccc'}}>
                  <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '20px', margin: '2px', fontWeight: '600'}}>{impactBalance}</div>
                  <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '16px', margin: '2px'}}>{points}</div>
                </div>
                <div style={{display: 'flex', flexDirection: 'row', color: 'white', alignItems: 'center', justifyContent: 'center', background: '#eeeeee22', borderRadius: '8px', padding: '3px 9px', border: '1px solid #ccc'}}>
                  <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '20px', margin: '2px', fontWeight: '600'}}>{qdau}</div>
                  <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '16px', margin: '2px'}}>{`qDAU`}</div>
                </div>
              </div>
            </div>
          )}

          <div style={{display: 'flex', flexDirection: 'column', color: 'white', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '2px solid #ccc', borderRadius: '16px', padding: '10px 0 20px 0', margin: '45px 0 30px 0', background: '#33333355', width: '500px'}}>

            <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '25px', margin: '5px 20px 5px 20px', padding: '5px 15px'}}>{`@${username}'s cast`}</div>

            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '5px 30px 20px 30px'}}>

              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#eeeeee22', borderRadius: '10px', padding: '10px 20px', border: '1px solid #ccc', width: '200px'}}>

                <div style={{display: 'flex', flexDirection: 'row', color: 'white', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>

                  <div style={{display: 'flex', textAlign: 'center', color: '#bdf', fontSize: '30px', margin: '0px'}}>&#9733;</div>

                  <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '30px', margin: '0px'}}>{castImpact}</div>
                </div>

                <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '20px', margin: '0px', padding: '0 0 5px 0'}}>{points}</div>
              </div>

              <div style={{display: 'flex', flexDirection: 'column', color: 'white', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#eeeeee11', borderRadius: '10px', padding: '10px 20px', border: '1px solid #ccc', width: '200px'}}>

                <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '30px', margin: '0px'}}>{`${castQdauBalance} (${castQdauCount})`}</div>

                <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '20px', margin: '0px', padding: '0 0 5px 0'}}>{`qDAU`}</div>

              </div>
            </div>
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
