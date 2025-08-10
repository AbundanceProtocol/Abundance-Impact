import mongoose from 'mongoose';

const distributionSchema = new mongoose.Schema({
  fid: { type: Number, index: true },
  distribution: { type: Number, index: true },
  createdAt: { type: Date, default: () => new Date(), index: true }
});

const Distribution = mongoose.models.Distribution || mongoose.model('Distribution', distributionSchema);

export default Distribution;
