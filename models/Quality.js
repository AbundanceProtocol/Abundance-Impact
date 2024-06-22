import mongoose from 'mongoose';

const qualitySchema = new mongoose.Schema({
  curator_fid: Number,
  target_cast_hash: String,
  points: String,
  quality_points: { type: Number, default: 0 },
  createdAt: { type: Date, default: () => new Date() }
});

const Quality = mongoose.models.Quality || mongoose.model('Quality', qualitySchema);

export default Quality;
