import mongoose from 'mongoose';

const impactSchema = new mongoose.Schema({
  curator_fid: Number,
  target_cast_hash: String,
  parent_hash: String,
  author_pfp: String,
  creator_username: String,
  creator_fid: Number,
  points: String,
  quality_adjusted: { type: Number, default: 0 },
  impact_points: { type: Number, default: 0 },
  createdAt: { type: Date, default: () => new Date() }
});

const Impact = mongoose.models.Impact || mongoose.model('Impact', impactSchema);

export default Impact;
