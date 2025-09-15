import mongoose from 'mongoose';

const { Schema } = mongoose;

const userFundingSchema = new mongoose.Schema({
  fid: { type: Number },
  username: { type: String },
  season_funding: [{
    season: { type: Number, required: true },
    total: { type: Number, default: 0 },
    hash: { type: String },
  }],
  total: { type: Number, default: 0 },
  network: { type: String, default: 'base' },
  wallet: [{ type: String }],
  multitip_total: { type: Number, default: 0 },
  rewards_total: { type: Number, default: 0 },
  sum: { type: Number, default: 0 },
  pfp: { type: String },
  createdAt: { type: Date, default: () => new Date(), index: true },
});

const UserFunding = mongoose.models.UserFunding || mongoose.model('UserFunding', userFundingSchema);

export default UserFunding;
