import mongoose from 'mongoose';

const qualitySchema = new mongoose.Schema({
  curator_fid: { type: Number, index: true },
  target_cast_hash: { type: String, index: true },
  points: { type: String, index: true },
  quality_points: { type: Number, default: 0 },
  createdAt: { type: Date, default: () => new Date(), index: true }
});

const Quality = mongoose.models.Quality || mongoose.model('Quality', qualitySchema);

export default Quality;
