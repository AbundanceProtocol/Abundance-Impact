import connectToDatabase from "../../../libs/mongodb";
import EcosystemRules from "../../../models/EcosystemRules";
import Impact from "../../../models/Impact";
import Tip from "../../../models/Tip";
import qs from "querystring";
const easyCronKey = process.env.EASYCRON_API_KEY;
const baseURL = process.env.NEXT_PUBLIC_BASE_URL_PROD;
const code = process.env.ECOSYSTEM_SECRET

export default async function handler(req, res) {
  const points = 'OP'
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
  } else {

    async function getEcosystems() {
      try {

        const cronUrl = `https://www.easycron.com/rest/add?${qs.stringify({
          token: easyCronKey,
          url: `${baseURL}/api/ecosystem/updateAllUsers?${qs.stringify({ points, code })}`,
          cron_expression: '59 23 * * *',
          cron_job_name: `${points}_Ecosystem`,
        })}`;
    
        const cronResponse = await fetch(cronUrl)
        return cronResponse

      } catch (error) {
        console.error('Error updating documents:', error);
        return null
      }

    }

    const ecosystems = await getEcosystems()    
    res.status(200).json({ ecosystems });
  }
}