import mongoose from 'mongoose';

const allowlistSchema = new mongoose.Schema({
  fid: Number,
  points: String,
  createdAt: { type: Date, default: () => new Date() }
});

const Allowlist = mongoose.models.Allowlist || mongoose.model('Allowlist', allowlistSchema);

export default Allowlist;
