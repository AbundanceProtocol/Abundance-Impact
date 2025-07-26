import mongoose from 'mongoose';

const miniappSchema = new mongoose.Schema({
  event: { type: String, index: true },
  url: { type: String, index: true },
  createdAt: { type: Date, default: () => new Date(), index: true }
});

const Miniapp = mongoose.models.Miniapp || mongoose.model('Miniapp', miniappSchema);

export default Miniapp;
