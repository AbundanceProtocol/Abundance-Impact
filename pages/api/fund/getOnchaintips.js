import connectToDatabase from '../../../libs/mongodb';
import OnchainTip from '../../../models/OnchainTip';

export default async function handler(req, res) {
  const { fid } = req.query
  const points = '$IMPACT'
  if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method Not Allowed', message: 'Failed to provide required data' });
  } else {
    try {

      await connectToDatabase();

      const fidNum = Number(fid);
      const extracted = await OnchainTip.aggregate([
        { $match: { "receiver.fid": fidNum } },
        { $project: {
            tipAmount: { $arrayElemAt: ["$tip.amount", 0] },
            tipValue: { $arrayElemAt: ["$tip.value", 0] },
            receiver: {
              $filter: {
                input: "$receiver",
                as: "r",
                cond: { $eq: ["$$r.fid", fidNum] }
              }
            }
        }}
      ]);

      let total = 0;
      if (extracted && extracted.length > 0) {
        for (const obj of extracted) {
          const receiverAmount = obj.receiver[0].amount || 0;
          const tipAmount = typeof obj.tipAmount === 'number' ? obj.tipAmount : 0;
          const tipValue = typeof obj.tipValue === 'number' ? obj.tipValue : 0;
          if (tipAmount !== 0) {
            total += (receiverAmount / tipAmount) * tipValue;
          }
        }
      }

      res.status(200).json({ data: total || 0 });
    } catch (error) {
      console.error('Error handling GET request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

