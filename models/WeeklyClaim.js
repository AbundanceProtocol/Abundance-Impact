import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  fid: { type: Number, index: true },
  username: { type: String, index: true },
  pfp: { type: String, index: true },
  degen_mon: { type: Number, default: 0, index: true },
  degen_tue: { type: Number, default: 0, index: true },
  degen_wed: { type: Number, default: 0, index: true },
  degen_thur: { type: Number, default: 0, index: true },
  degen_fri: { type: Number, default: 0, index: true },
  degen_sat: { type: Number, default: 0, index: true },
  degen_sut: { type: Number, default: 0, index: true },
  // degen_amount: { type: Number, index: true },
  degen_total: { type: Number, default: 0, index: true },
  // ham_amount: { type: Number, index: true },
  // ham_total: { type: Number, index: true },
  // days_unclaimed: { type: Number, index: true },
  points: { type: String, default: '$IMPACT', index: true },
  claimed: { type: Boolean, default: false, index: true },
  cast_hash: { type: String, default: null, index: true },
  season: { type: Number, default: 4 },
  createdAt: { type: Date, default: () => new Date(), index: true }
});

const Claim = mongoose.models.Claim || mongoose.model('Claim', claimSchema);

export default Claim;
