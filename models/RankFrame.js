import mongoose from 'mongoose';

const rankFrameSchema = new mongoose.Schema({
  fid: Number,
  pfp: String,
  username: String,
  contributor: [
    {
      username: { type: String, default: null },
      pfp: { type: String, default: null },
      impact: Number,
      ham: Number,
      degen: Number
    },
  ],
  curator: [
    {
      username: { type: String, default: null },
      pfp: { type: String, default: null },
      impact: Number,
    },
  ],
  points:  { type: String, default: '$IMPACT', index: true }, 
  degen_tip_all: { type: Number, default: 0, index: true },
  degen_tip_all_rank: { type: Number, default: 0, index: true },
  ham_tip_all: { type: Number, default: 0, index: true },
  ham_tip_all_rank: { type: Number, default: 0, index: true },
  curator_points_all: { type: Number, default: 0, index: true },
  curator_points_all_rank: { type: Number, default: 0, index: true },
  creator_points_all: { type: Number, default: 0, index: true },
  creator_points_all_rank: { type: Number, default: 0, index: true },
  impact_score_all: { type: Number, default: 0, index: true },
  impact_score_all_rank: { type: Number, default: 0, index: true },
  degen_tip_7d: { type: Number, default: 0, index: true },
  degen_tip_7d_rank: { type: Number, default: 0, index: true },
  ham_tip_7d: { type: Number, default: 0, index: true },
  ham_tip_7d_rank: { type: Number, default: 0, index: true },
  curator_points_7d: { type: Number, default: 0, index: true },
  curator_points_7d_rank: { type: Number, default: 0, index: true },
  creator_points_7d: { type: Number, default: 0, index: true },
  creator_points_7d_rank: { type: Number, default: 0, index: true },
  promotion_points_7d: { type: Number, default: 0, index: true },
  promotion_points_7d_rank: { type: Number, default: 0, index: true },
  impact_score_7d: { type: Number, default: 0, index: true },
  impact_score_7d_rank: { type: Number, default: 0, index: true },
  createdAt: { type: Date, default: () => new Date() }
});

const RankFrame = mongoose.models.RankFrame || mongoose.model('RankFrame', rankFrameSchema);

export default RankFrame;
