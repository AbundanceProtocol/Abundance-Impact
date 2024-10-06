import { getSSLHubRpcClient, Message } from "@farcaster/hub-nodejs";
import qs from "querystring";

import connectToDatabase from "../../../../libs/mongodb";
import User from '../../../../models/User';
import Impact from '../../../../models/Impact';
import Quality from '../../../../models/Quality';
import Cast from "../../../../models/Cast";
import EcosystemRules from "../../../../models/EcosystemRules";
import ScheduleTip from "../../../../models/ScheduleTip";
import { encryptPassword, generateRandomString } from '../../../../utils/utils'
import { metaButton } from '../../../../utils/frames'
import { init, validateFramesMessage } from "@airstack/frames";

const easyCronKey = process.env.EASYCRON_API_KEY;
const baseURL = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_URL_PROD : process.env.NEXT_PUBLIC_BASE_URL_DEV;
const secretKey = process.env.SECRET_KEY

const HubURL = process.env.NEYNAR_HUB
const client = HubURL ? getSSLHubRpcClient(HubURL) : undefined;
// const apiKey = process.env.NEYNAR_API_KEY

export default async function handler(req, res) {
  init(process.env.AIRSTACK_API_KEY ?? '')
  const body = await req.body;
  const {isValid, message} = await validateFramesMessage(body)

  const { untrustedData } = req.body
  const { time, curators, eco, ecosystem } = req.query;

  if (req.method === 'POST') {
    const params = { time, curators, eco, ecosystem }
    const points = '$' + eco
    const curatorFid = message?.data?.fid
    // const castHash = req.body.untrustedData.castId.hash
    // const authorFid = message?.data?.frameActionBody?.castId?.fid
    console.log('28', time, curators, eco, ecosystem)

    let autoTipImg = `${baseURL}/api/frames/tip/auto-tipping?${qs.stringify({ status: 'off', curators: [], points, remove: curators })}`

    let button1 = metaButton(1, 'auto-tip-all', params)
    let button2 = metaButton(2, 'auto-tip-remove', params)
    let button3 = metaButton(3, 'auto-tip-stop', params)
    let button4 = metaButton(4, 'back', params)
    let textField = ``
    let postUrl = `<meta name="fc:frame:post_url" content='${baseURL}' />`

    async function getUuid(fid, points) {
      try {
        await connectToDatabase();
        let userData = await User.findOne({ fid, ecosystem_points: points }).select('uuid ecosystem_name').exec();
        
        if (userData) {
          return {encryptedUuid: userData.uuid, ecoName: userData.ecosystem_name}
        } else {
          return {encryptedUuid: null, ecoName: null}
        }
      } catch (error) {
        console.error("Error while fetching data:", error);
        return {encryptedUuid: null, ecoName: null}
      }  
    }

    const {encryptedUuid, ecoName} = await getUuid(curatorFid, points)

    if (!encryptedUuid) {

      autoTipImg = `${baseURL}/api/frames/tip/auto-tipping?${qs.stringify({ status: 'off', curators: [], points, needLogin: true })}`
      console.log('77', autoTipImg)

      button1 = metaButton(1, 'login', params, points)
      button2 = metaButton(2, 'refresh', params)
      button3 = metaButton(3, 'back', params)
      button4 = ''

    } else if (curators) {

      async function setSchedule(fid, points, ecoName, encryptedUuid, curators) {

        const formatCurators = (curators) => {
          if (!Array.isArray(curators)) {
            curators = [curators];
          }
          return curators.map(curator => {
            const parsedCurator = parseInt(curator, 10);
            return isNaN(parsedCurator) ? null : parsedCurator;
          }).filter(curator => curator !== null);
        };

        const formattedCurators = formatCurators(curators);

        let schedule = null
        try {
          await connectToDatabase();
          schedule = await ScheduleTip.findOne({ fid }).exec();

          if (schedule) {

            let curatorsMatch = false;
            if (schedule?.search_curators && schedule.search_curators.length > 0) {
              const curatorArray = Array.isArray(curators) ? curators : [curators];
              curatorsMatch = curatorArray.some(curator => 
                schedule.search_curators.some(searchCurator => 
                  String(searchCurator) === String(curator)
                )
              );
            }

            schedule.search_shuffle = true
            schedule.search_time = 'all'
            schedule.search_tags = []
            schedule.search_channels = []
            schedule.search_curators = schedule.search_curators.filter(curator => 
              !formattedCurators.includes(curator))
            schedule.points = points
            schedule.percent_tip = 100
            schedule.ecosystem_name = ecoName
            schedule.currencies = ['$DEGEN', '$TN100x', '$HUNT', '$WILD']
            schedule.schedule_time = "45 18 * * *"
            schedule.active_cron = true
          } else {
            schedule = new ScheduleTip({ 
              fid: fid,
              uuid: encryptedUuid,
              search_shuffle: true,
              search_time: 'all',
              search_tags: [],
              search_channels: [],
              search_curators: [],
              points: points,
              percent_tip: 100,
              ecosystem_name: ecoName,
              currencies: ['$DEGEN', '$TN100x', '$HUNT', '$WILD'],
              schedule_time: "45 18 * * *",
              schedule_count: 1,
              schedule_total: 1,
              active_cron: true
            });
          }
          await schedule.save()
          return schedule
        } catch (error) {
          console.error("Error while fetching data:", error);
          return null
        }  
      }
  
      const schedule = await setSchedule(curatorFid, points, ecoName, encryptedUuid, curators)
  
      if (schedule?.active_cron) {

        if (schedule?.search_curators?.length > 0) {

          autoTipImg = `${baseURL}/api/frames/tip/auto-tipping?${qs.stringify({ status: 'curators', curators: schedule?.search_curators, points, add: curators })}`
          
          button1 = metaButton(1, 'auto-tip-add', params)
          button2 = metaButton(2, 'auto-tip-all', params)
          button3 = metaButton(3, 'auto-tip-stop', params)
          button4 = metaButton(4, 'back', params)

        } else {

          autoTipImg = `${baseURL}/api/frames/tip/auto-tipping?${qs.stringify({ status: 'all', curators: [], points, add: curators })}`
          
          button1 = metaButton(1, 'auto-tip-add', params)
          button2 = metaButton(2, 'auto-tip-self', params)
          button3 = metaButton(3, 'auto-tip-stop', params)
          button4 = metaButton(4, 'back', params)

        }

      } else {

        autoTipImg = `${baseURL}/api/frames/tip/auto-tipping?${qs.stringify({ status: 'off', curators: [], points, add: curators })}`

        button1 = metaButton(1, 'auto-tip-add', params)
        button2 = metaButton(2, 'auto-tip-self', params)
        button3 = metaButton(3, 'auto-tip-all', params)
        button4 = metaButton(4, 'back', params)

      }

    } else {

      autoTipImg = `${baseURL}/api/frames/tip/auto-tipping?${qs.stringify({ status: 'off', curators: [], points })}`
      console.log('216', autoTipImg)

      button1 = metaButton(1, 'auto-tip', params)
      button2 = metaButton(2, 'auto-tip-all', params)
      button3 = metaButton(3, 'back', params)
      button4 = ''
        
    }
    
    let metatags = button1 + button2 + button3 + button4 + textField + postUrl

    try {

      console.log('autoTipImg1', autoTipImg)

      res.setHeader('Content-Type', 'text/html');
      res.status(200)
      .send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Impact Nav</title>
            <meta name="fc:frame" content="vNext">
            <meta property="og:title" content="Impact Nav">
            <meta property='og:image' content='${autoTipImg}' />
            <meta property="fc:frame:image:aspect_ratio" content="1:1" />
            <meta property="fc:frame:image" content='${autoTipImg}' />
            ${metatags}
          </head>
          <body>
            <div>Tip frame</div>
          </body>
        </html>
      `);
      return;

    } catch (error) {

      console.log('autoTipImg2', autoTipImg)

      res.setHeader('Content-Type', 'text/html');
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Impact Nav</title>
            <meta name="fc:frame" content="vNext">
            <meta property="og:title" content="Impact Nav">
            <meta property='og:image' content='${autoTipImg}' />
            <meta property="fc:frame:image:aspect_ratio" content="1:1" />
            <meta property="fc:frame:image" content='${autoTipImg}' />
            ${metatags}
          </head>
          <body>
            <div>Tip frame</div>
          </body>
        </html>
      `);
      return;
    }

  } else {
    res.setHeader('Allow', ['POST']);
    res.status(401).send(`Request failed`);
  }
}