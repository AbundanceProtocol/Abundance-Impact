import mongoose from 'mongoose';

const miniappSchema = new mongoose.Schema({
  fid: { type: Number, index: true },
  active: { type: Boolean, index: true },
  url: { type: String, index: true },
  token: { type: String, index: true }, // encrypted
  createdAt: { type: Date, default: () => new Date(), index: true }
});

const Miniapp = mongoose.models.Miniapp || mongoose.model('Miniapp', miniappSchema);

export default Miniapp;
