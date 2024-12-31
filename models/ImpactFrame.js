import mongoose from 'mongoose';

const impactFrameSchema = new mongoose.Schema({
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
  points: { type: String, default: '$IMPACT', index: true }, 
  degen_received_all: { type: Number, default: 0, index: true },
  ham_received_all: { type: Number, default: 0, index: true },
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
  raffle_tickets: { type: Number, default: 0, index: true },
  raffle_score: { type: Number, default: 0, index: true },
  createdAt: { type: Date, default: () => new Date() }
});

const ImpactFrame = mongoose.models.ImpactFrame || mongoose.model('ImpactFrame', impactFrameSchema);

export default ImpactFrame;
