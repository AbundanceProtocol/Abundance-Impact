import satori from "satori";
import path from 'path'
import fs from 'fs';
import { promisify } from 'util';
import svg2img from 'svg2img';
import connectToDatabase from "../../../libs/mongodb";
import User from "../../../models/User";

const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;

export default async function handler(req, res) {
  const { curators, points, time, ecosystem } = req.query

  console.log('at1 status', curators, points, typeof curators, time)
  try {
    const fontPath = path.join(process.cwd(), 'public', 'Inter-SemiBold.ttf');
    const fontData = fs.readFileSync(fontPath);
    // const login = needLogin == 'true'
    // console.log('at2 login', login, needLogin)
    const timeframe = [
      { value: 'none', label: 'None' },
      { value: '24h', label: '24 Hours' },
      { value: '3d', label: '3 Days' },
      { value: '7d', label: '7 Days' },
      { value: '30d', label: '30 Days' },
      { value: 'all', label: 'All time' },
    ]
    const timeText = timeframe.find(item => item.value === time);
    

    async function getUsernames(curators, points) {
      const curatorsArray = curators.split(',').map(curator => Number(curator.trim()))
      try {
        await connectToDatabase()
        const usernames = await User.find({ fid: { $in: curatorsArray }, ecosystem_points: points }).select('username pfp').exec();
        if (usernames) {
          return usernames
        } else {
          return []
        }
      } catch (error) {
        console.error('Error getting usernames', error);
        return []
      }
    }

    let usernames = []
    if (curators) {
      usernames = await getUsernames(curators, points)
    }
    // console.log('usernames', usernames)
    // let removeUsernames = []
    // if (remove) {
    //   removeUsernames = await getUsernames(remove, points)
    // }

    // let addedUsernames = []
    // if (add) {
    //   addedUsernames = await getUsernames(add, points)
    // }

    console.log('at3 usernames', usernames)


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

          <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '26px', border: '1px solid #eeeeeeaa', background: '#eeeeeeaa', margin: '65px 15px 15px 15px', padding: '10px 20px', width: '400px', borderRadius: '16px'}}>Multi-tip creators & builders curated by:</div>

          {usernames?.length > 0 ? (<div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid #eeeeeeaa', borderRadius: '16px', padding: '10px', margin: '45px 15px 45px 15px', background: '#eeeeeeaa', width: (usernames[0]?.username.length > 11) ? '450px' : '300px'}}>

            <img src={usernames[0]?.pfp} width={90} height={90} style={{borderRadius: '80px', border: '2px solid #eee', backgroundColor: '#8363ca'}} />


            <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '28px', margin: '5px 10px 5px 10px', width: (usernames[0]?.username.length > 11) ? '450px' : 'auto', justifyContent: 'center', alignItems: 'center'}}>@{usernames[0]?.username}</div>
          </div>) : (
            <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '28px', border: '1px solid #eeeeeeaa', background: '#eeeeeeaa', margin: '45px 15px 45px 15px', padding: '10px 20px', width: '300px', borderRadius: '16px'}}>Abundance Ecosystem</div>

          )}


          <div style={{display: 'flex', flexDirection: 'row', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '0px solid #eeeeeeaa', borderRadius: '0px', padding: '0px', margin: '15px', width: '500px'}}>


            <div style={{display: 'flex', flexDirection: 'column', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid #eeeeeeaa', borderRadius: '16px', padding: '5px 10px', margin: '0 5px 3px 5px', background: '#eeeeeeaa', width: 'auto', justifyContent: 'center', alignItems: 'center'}}>
              <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '16px', margin: '2px 0px', width: 'auto', justifyContent: 'center', alignItems: 'center', padding: '0 10px'}}>ecosystem</div>
              <div style={{display: 'flex', textAlign: 'center', color:  '#220a4d', fontSize: '19px', margin: '2px 0px', width: 'auto', justifyContent: 'center', alignItems: 'center', padding: '0 20px'}}>Abundance</div>
            </div>


            <div style={{display: 'flex', flexDirection: 'column', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid #eeeeeeaa', borderRadius: '16px', padding: '5px 10px', margin: '0 5px 3px 5px', background: '#eeeeeeaa', width: 'auto', justifyContent: 'center', alignItems: 'center'}}>
              <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '16px', margin: '2px 0px', width: 'auto', justifyContent: 'center', alignItems: 'center'}}>timeframe</div>
              <div style={{display: 'flex', textAlign: 'center', color:  '#220a4d', fontSize: '19px', margin: '2px 0px', width: 'auto', justifyContent: 'center', alignItems: 'center', padding: '0 20px'}}>{timeText.label}</div>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', color: 'black', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid #eeeeeeaa', borderRadius: '16px', padding: '5px 10px', margin: '0 5px 3px 5px', background: '#eeeeeeaa', width: 'auto', justifyContent: 'center', alignItems: 'center'}}>
              <div style={{display: 'flex', textAlign: 'center', color: '#220a4d', fontSize: '16px', margin: '2px 0px', width: 'auto', justifyContent: 'center', alignItems: 'center'}}>curator reward</div>
              <div style={{display: 'flex', textAlign: 'center', color:  '#220a4d', fontSize: '19px', margin: '2px 0px', width: 'auto', justifyContent: 'center', alignItems: 'center', padding: '0 20px'}}>10%</div>
            </div>

          </div>

          <div style={{display: 'flex', textAlign: 'center', color: '#eff', fontSize: '18px', margin: '55px 10px 0px 10px', width: 'auto', justifyContent: 'center', alignItems: 'center'}}>/impact by @abundance&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;explore curation in mini-app</div>
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
