import express from "express";
import serverless from "serverless-http";
import {
  parseWebhookEvent,
  verifyAppKeyWithNeynar
} from "@farcaster/miniapp-node";
import axios from "axios";
import Miniapp from '../../models/Miniapp';
import connectToDatabase from '../../libs/mongodb';

const app = express();
app.use(express.json());

app.post("/", async (req, res) => {
  try {
    const data = await parseWebhookEvent(req.body, verifyAppKeyWithNeynar);

    console.log("✅ Received Farcaster event:", data);
    console.log("✅ Farcaster event payload:", JSON.stringify(data, null, 2));
    console.log("Event type:", data.event.event, "| Fid:", data.fid);


    const db = await connectToDatabase();
    const doc = new Miniapp({
      event: data.event.event || "",
      url: data.event.notificationDetails?.url || ""
    });
    await doc.save();

    console.log("🗄️ Logged event to MongoDB:", doc);

    // await axios({
    //   method: "post",
    //   url: "https://impact.abundance.id/api/mini-app/test",
    //   data: {
    //     fid: data.fid,
    //     event: data.event.event,
    //     payload: data,
    //   },
    //   timeout: 5000,
    // });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error verifying Mini App webhook:", error.name, error.message);
    const status = error.name === "VerifyJsonFarcasterSignature.InvalidAppKeyError"
      ? 401
      : error.name.startsWith("VerifyJsonFarcasterSignature.VerifyAppKey")
        ? 500
        : 400;
    res.status(status).json({ success: false, error: error.message });
  }
});

export const handler = serverless(app);





// import {
//   ParseWebhookEvent,
//   parseWebhookEvent,
//   verifyAppKeyWithNeynar,
// } from "@farcaster/frame-node";
// import { NextRequest } from "next/server";
// import {
//   deleteUserNotificationDetails,
//   setUserNotificationDetails,
// } from "~/lib/kv";
// import { sendFrameNotification } from "~/lib/notifs";

// export async function POST(request) {
//   const requestJson = await request.json();

//   let data;
//   try {
//     data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
//   } catch (e) {
//     const error = e;

//     switch (error.name) {
//       case "VerifyJsonFarcasterSignature.InvalidDataError":
//       case "VerifyJsonFarcasterSignature.InvalidEventDataError":
//         // The request data is invalid
//         return Response.json(
//           { success: false, error: error.message },
//           { status: 400 }
//         );
//       case "VerifyJsonFarcasterSignature.InvalidAppKeyError":
//         // The app key is invalid
//         return Response.json(
//           { success: false, error: error.message },
//           { status: 401 }
//         );
//       case "VerifyJsonFarcasterSignature.VerifyAppKeyError":
//         // Internal error verifying the app key (caller may want to try again)
//         return Response.json(
//           { success: false, error: error.message },
//           { status: 500 }
//         );
//     }
//   }

//   const fid = data.fid;
//   const event = data.event;

//   switch (event.event) {
//     case "frame_added":
//       if (event.notificationDetails) {
//         await setUserNotificationDetails(fid, event.notificationDetails);
//         await sendFrameNotification({
//           fid,
//           title: "Welcome to Frames v2",
//           body: "Frame is now added to your client",
//         });
//       } else {
//         await deleteUserNotificationDetails(fid);
//       }

//       break;
//     case "frame_removed":
//       await deleteUserNotificationDetails(fid);

//       break;
//     case "notifications_enabled":
//       await setUserNotificationDetails(fid, event.notificationDetails);
//       await sendFrameNotification({
//         fid,
//         title: "Ding ding ding",
//         body: "Notifications are now enabled",
//       });

//       break;
//     case "notifications_disabled":
//       await deleteUserNotificationDetails(fid);

//       break;
//   }

//   return Response.json({ success: true });
// }