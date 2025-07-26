export default function handler(req, res) {
  if (req.method === "POST") {
    console.log("✅ Received at test endpoint:");
    // console.log("req.bod", req.body);
    return res.status(200).json({ success: true });
  }
  return res.status(405).json({ error: "Method Not Allowed" });
}