import mongoose from 'mongoose';

const impactSchema = new mongoose.Schema({
  curator_fid: { type: Number, index: true },
  target_cast_hash: { type: String, index: true },
  parent_hash: String,
  author_pfp: String,
  creator_username: String,
  creator_fid: { type: Number, index: true },
  points: { type: String, index: true },
  quality_adjusted: { type: Number, default: 0, index: true },
  impact_points: { type: Number, default: 0, index: true },
  createdAt: { type: Date, default: () => new Date(), index: true }
});

const Impact = mongoose.models.Impact || mongoose.model('Impact', impactSchema);

export default Impact;
