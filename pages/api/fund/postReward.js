import connectToDatabase from "../../../libs/mongodb";
import Claim from "../../../models/Claim";
import mongoose from "mongoose";
import ScheduleTip from "../../../models/ScheduleTip";

export default async function handler(req, res) {
  const { id } = req.body;
  // console.log(fid, castHash, qualityAmount)

  if (req.method !== "POST" || !id) {
    res.status(500).json({ error: "Method not allowed" });
  } else {
    try {
      console.log("id", id);

      async function getReward(id) {
        try {
          const objectId = new mongoose.Types.ObjectId(id);
          console.log(id);
          await connectToDatabase();
          let rank = await Claim.findOne({ _id: objectId }).exec();

          console.log("rank", rank);

          if (rank) {
            const updateOptions = {
              upsert: false,
              new: true,
              setDefaultsOnInsert: true
            };

            const update = {
              $set: {
                claimed: true
              }
            };
            // console.log("shared", shared);
            const lastFourDays = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);

            let claimIds = await Claim.distinct("_id", {
              fid: rank?.fid,
              createdAt: { $gt: lastFourDays, $lte: rank?.createdAt },
              claimed: false
            });

            for (const claimId of claimIds) {
              const user = await Claim.findOneAndUpdate({ _id: claimId }, update, updateOptions);
              console.log("user", user, claimId);
            }
          }
          console.log("rank", rank);

          if (rank) {
            return rank;
          } else {
            return null;
          }
        } catch (error) {
          console.error("Error while fetching casts:", error);
          return null;
        }
      }

      const claimed = await getReward(id);

      res.status(200).json({ claimed });
      return;
    } catch (error) {
      console.error("Error handling POST request:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
  }
}
