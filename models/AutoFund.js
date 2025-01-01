import mongoose from 'mongoose';

const autoFundSchema = new mongoose.Schema({
  fid: { type: Number, index: true },
  degen_percent: { type: Number, default: 25, index: true },
  active: { type: Boolean, default: false, index: true },
  remaining: { type: Boolean, default: false, index: true },
  points: { type: String, default: '$IMPACT', index: true },
  growth_fund: { type: Number, default: 15 },
  development_fund: { type: Number, default: 10 },
  creator_fund: { type: Number, default: 75 },
  createdAt: { type: Date, default: () => new Date(), index: true }
});

const AutoFund = mongoose.models.AutoFund || mongoose.model('AutoFund', autoFundSchema);

export default AutoFund;
