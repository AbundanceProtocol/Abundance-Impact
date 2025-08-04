import connectToDatabase from '../../../libs/mongodb';
import Miniapp from '../../../models/Miniapp';
import { encryptPassword } from '../../../utils/utils';

const secretKey = process.env.SECRET_KEY


export default async function handler(req, res) {
  const { fid, notif } = req.body;
  if (req.method !== 'POST' || !fid || !notif) {
    res.status(405).json({ error: 'Method not allowed' });
  } else {
    try {


      async function updateToken(fid, notif) {
        try {
          const encryptedToken = encryptPassword(notif?.token, secretKey);
  
          await connectToDatabase();
  
          const userNotif = await Miniapp.findOne({ fid });
          if (userNotif) {
            userNotif.active = true;
            userNotif.url = notif?.url;
            userNotif.token = encryptedToken;
            await userNotif.save();
          } else {
            const newNotif = new Miniapp({
              fid: Number(fid),
              active: true,
              url: notif?.url,
              token: encryptedToken,
            });
            await newNotif.save();
          }
          return 'updated'
        } catch (error) {
          console.error('Error: ', error)
          return null
        }
      }


      const updated = await updateToken(fid, notif)

      res.status(200).send({ message: `Notification saved successfully`, updated });
    } catch (error) {
      console.error("Error while fetching casts:", error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
