import connectToDatabase from "../../../libs/mongodb";
import Miniapp from "../../../models/Miniapp";

export default async function handler(req, res) {
  if (req.method === "POST") {
    console.log("Test endpoint received:");

    async function logMiniapp() {
      try {
        await connectToDatabase();
        const doc = new Miniapp({
          event: data.event.event || "",
          url: data.event.notificationDetails?.url || ""
        });
        await doc.save();
        return 'logged'
      } catch (error) {
        return null
      }
    }

    const isLogged = await logMiniapp()

    console.log('isLogged', isLogged)

    return res.status(200).json({ success: true });
  }
  res.setHeader("Allow", ["POST"]);
  return res.status(405).send("Method Not Allowed");
}