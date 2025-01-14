import mongoose from 'mongoose';

const fundSchema = new mongoose.Schema({
  fid: { type: Number, index: true },
  degen_amount: { type: Number, index: true },
  ham_amount: { type: Number, index: true },
  points: { type: String, default: '$IMPACT', index: true },
  growth_fund: { type: Number, default: 15 },
  growth_degen_amount: { type: Number, default: 0 },
  growth_ham_amount: { type: Number, default: 0 },
  development_fund: { type: Number, default: 10 },
  development_degen_amount: { type: Number, default: 0 },
  development_ham_amount: { type: Number, default: 0 },
  creator_fund: { type: Number, default: 75 },
  creator_degen_amount: { type: Number, default: 0 },
  creator_ham_amount: { type: Number, default: 0 },
  special_fund: { type: Number, default: 0 },
  special_degen_amount: { type: Number, default: 0 },
  special_ham_amount: { type: Number, default: 0 },
  funding_type: { type: String, default: 'remaining' },
  curator_fid: { type: [Number], default: [] },
  valid: { type: Boolean, default: true },
  createdAt: { type: Date, default: () => new Date(), index: true }
});

const Fund = mongoose.models.Fund || mongoose.model('Fund', fundSchema);

export default Fund;
