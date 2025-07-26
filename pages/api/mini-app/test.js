export default function handler(req, res) {
  if (req.method === "POST") {
    console.log("Test endpoint received:");
    return res.status(200).json({ success: true });
  }
  res.setHeader("Allow", ["POST"]);
  return res.status(405).send("Method Not Allowed");
}