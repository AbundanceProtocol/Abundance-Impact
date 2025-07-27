import { 
  parseWebhookEvent, 
  verifyAppKeyWithNeynar,
  setUserNotificationDetails,
  sendFrameNotification
} from "@farcaster/miniapp-node";
import axios from "axios";
import Miniapp from "../../models/Miniapp";
import connectToDatabase from "../../libs/mongodb";
import { encryptPassword } from '../../utils/utils';

const secretKey = process.env.SECRET_KEY

export const handler = async (event) => {
  try {
    const data = await parseWebhookEvent(JSON.parse(event.body), verifyAppKeyWithNeynar);

    console.log("✅ Received Farcaster event:", data);
    console.log("Event type:", data.event.event, "| Fid:", data.fid);

    if (data.fid === 9326 && data.event.notificationDetails) {
      await axios({
        method: "post",
        url: data.event.notificationDetails.url,
        data: {
          notificationId: `fid-${Date.now()}`,
          title: "Welcome!",
          body: "Thanks for enabling notifications!",
          targetUrl: "https://impact.abundance.id",
          tokens: [data.event.notificationDetails.token],
        },
        timeout: 5000,
      });
      console.log("Notification sent to FID 9326");
    }

    async function updateToken(data) {
      try {
        const encryptedToken = encryptPassword(data.event.notificationDetails?.token, secretKey);

        await connectToDatabase();

        const userNotif = await Miniapp.findOne({ fid: data.fid });
        if (userNotif) {
          userNotif.active = true;
          userNotif.url = data.event.notificationDetails?.url;
          userNotif.token = encryptedToken;
          await userNotif.save();
        } else {
          const newNotif = new Miniapp({
            fid: data.fid,
            active: true,
            url: data.event.notificationDetails?.url,
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

    async function removeNotif(data) {
      try {
        await connectToDatabase();

        const userNotif = await Miniapp.findOne({ fid: data.fid });
        if (userNotif) {
          userNotif.active = false;
          userNotif.url = '';
          userNotif.token = '';
          await userNotif.save();
        }
        return 'removed'
      } catch (error) {
        console.error('Error: ', error)
        return null
      }
    }


    if (data.event.event == 'notifications_enabled' || data.event.event == 'frame_added') {
      await updateToken(data)
    } else if (data.event.event == 'notifications_disabled' || data.event.event == 'frame_removed') {
      await removeNotif(data)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };

  } catch (error) {
    console.error("❌ Error verifying Mini App webhook:", error.name, error.message);
    const status =
      error.name === "VerifyJsonFarcasterSignature.InvalidAppKeyError"
        ? 401
        : error.name.startsWith("VerifyJsonFarcasterSignature.VerifyAppKey")
        ? 500
        : 400;
    return {
      statusCode: status,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
