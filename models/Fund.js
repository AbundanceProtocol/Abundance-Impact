import mongoose from 'mongoose';

const fundSchema = new mongoose.Schema({
  fid: { type: Number, index: true },
  degen_amount: { type: Number, index: true },
  points: { type: String, default: '$IMPACT', index: true },
  growth_fund: { type: Number, default: 15 },
  development_fund: { type: Number, default: 10 },
  creator_fund: { type: Number, default: 75 },
  createdAt: { type: Date, default: () => new Date(), index: true }
});

const Fund = mongoose.models.Fund || mongoose.model('Fund', fundSchema);

export default Fund;
