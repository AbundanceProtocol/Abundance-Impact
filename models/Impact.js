import mongoose from 'mongoose';

const impactSchema = new mongoose.Schema({
  curator_fid: Number,
  target_cast_hash: String,
  creator_fid: Number,
  impact_points: { type: Number, default: 0 },
  createdAt: { type: Date, default: () => new Date() }
});

const Impact = mongoose.models.Impact || mongoose.model('Impact', impactSchema);

export default Impact;
