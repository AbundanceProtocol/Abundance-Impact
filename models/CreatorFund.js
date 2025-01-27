import mongoose from 'mongoose';

const creatorFundSchema = new mongoose.Schema({
  fid: { type: Number, index: true },
  impact_points: Number,
  username: String,
  pfp: String,
  wallet: { type: String, index: true },
  points: { type: String, default: '$IMPACT', index: true },
  ham: { type: Number, default: 0, index: true, get: v => v.toFixed(2), set: v => parseFloat(v).toFixed(2) },
  degen: { type: Number, default: 0, index: true, get: v => v.toFixed(2), set: v => parseFloat(v).toFixed(2) },
  season: { type: Number, index: true },
  createdAt: { type: Date, default: () => new Date(), index: true }
});

const CreatorFund = mongoose.models.CreatorFund || mongoose.model('CreatorFund', creatorFundSchema);

export default CreatorFund;
