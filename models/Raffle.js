import mongoose from 'mongoose';

const raffleSchema = new mongoose.Schema({
  fid: { type: Number, index: true },
  pfp: String,
  username: String,
  points:  { type: String, default: '$IMPACT', index: true }, 
  degen_tip_7d: { type: Number, default: 0, index: true },
  ham_tip_7d: { type: Number, default: 0, index: true },
  curator_points_7d: { type: Number, default: 0, index: true },
  creator_points_7d: { type: Number, default: 0, index: true },
  promotion_points_7d: { type: Number, default: 0, index: true },
  impact_score_7d: { type: Number, default: 0, index: true },
  degen_tip_3d: { type: Number, default: 0, index: true },
  ham_tip_3d: { type: Number, default: 0, index: true },
  curator_points_3d: { type: Number, default: 0, index: true },
  creator_points_3d: { type: Number, default: 0, index: true },
  promotion_points_3d: { type: Number, default: 0, index: true },
  impact_score_3d: { type: Number, default: 0, index: true },
  degen_tip_24h: { type: Number, default: 0, index: true },
  ham_tip_24h: { type: Number, default: 0, index: true },
  curator_points_24h: { type: Number, default: 0, index: true },
  creator_points_24h: { type: Number, default: 0, index: true },
  promotion_points_24h: { type: Number, default: 0, index: true },
  impact_score_24h: { type: Number, default: 0, index: true },
  createdAt: { type: Date, default: () => new Date() }
});

const Raffle = mongoose.models.Raffle || mongoose.model('Raffle', raffleSchema);

export default Raffle;
