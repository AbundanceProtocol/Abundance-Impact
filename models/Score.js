import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  fid: { type: Number, index: true },
  pfp: String,
  username: String,
  degen_tip_all: { type: Number, default: 0, index: true },
  ham_tip_all: { type: Number, default: 0, index: true },
  curator_points_all: { type: Number, default: 0, index: true },
  creator_points_all: { type: Number, default: 0, index: true },
  impact_score_all: { type: Number, default: 0, index: true },
  degen_tip_30d: { type: Number, default: 0, index: true },
  ham_tip_30d: { type: Number, default: 0, index: true },
  curator_points_30d: { type: Number, default: 0, index: true },
  creator_points_30d: { type: Number, default: 0, index: true },
  impact_score_30d: { type: Number, default: 0, index: true },
  createdAt: { type: Date, default: () => new Date() }
});

const Score = mongoose.models.Score || mongoose.model('Score', scoreSchema);

export default Score;
