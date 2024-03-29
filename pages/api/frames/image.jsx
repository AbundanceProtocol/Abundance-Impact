import satori from "satori";
import path from 'path'
import fs from 'fs';
import { promisify } from 'util';
import svg2img from 'svg2img';
import fetch from 'isomorphic-unfetch';
import NodeCache from 'node-cache';

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const cache = new NodeCache({ stdTTL: 60 });

export default async function handler(req, res) {
  // console.log('api/frames/image 15:', req.query)
  // console.log('api/frames/image 16:', req.query.id)
  // console.log('api/frames/image 17:', req.query.page)
  
  try {
    const fontPath = path.join(process.cwd(), 'public', 'Inter-SemiBold.ttf');
    const fontData = fs.readFileSync(fontPath);
    const articleHash = req.query.id;
    let articleData = cache.get(articleHash);

    const page = Number(req.query.page);
    let threadText = '';
    let pageCount = '[/]'
    let username = ''

    if (!articleData) {
      const response = await fetch(`${baseURL}/api/getIPFS?hash=${articleHash}`);
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        articleData = await response.json();
        cache.set(articleHash, articleData);
      }
    }

    if (articleData) {
      const sliceFrom = (300 * page) + 0;
      const sliceTo = (300 * page) + 300;
      let beforeText = '';
      const totalPages = Math.ceil(articleData.text.length / 300)
      console.log(page, page !== 0)
      console.log(articleData.text.length)
      if (page !== 0) {
        beforeText = '...'
      }
      let afterText = '...';
      if (page+1 == totalPages) {
        afterText = '';
      }
      pageCount = ` [${Number(page)+1}/${totalPages}]`
      threadText = beforeText + articleData.text.slice(sliceFrom, sliceTo) + afterText + pageCount
    }
    
    if (articleData.username) {
      username = '@' + articleData.username
    }
    
    const svg = await satori(
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#16101f',
        padding: 30,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center', 
      }}>
        <div style={{display: 'flex', flexDirection: 'column', color: 'white', 
        fontSize: '22px'}}>
          <div style={{display: 'flex', textAlign: 'left', color: '#eff', 
        fontSize: '24px'}}>{username + ':'}</div>
          <div style={{display: 'flex', textAlign: 'left', padding: '15px 0 0 0'}}>{threadText}</div>
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

    // Set the content type to PNG and send the response
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'max-age=10');
    res.send(pngBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating image');
  }
}
