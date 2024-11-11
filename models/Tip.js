import mongoose from 'mongoose';

const tipSchema = new mongoose.Schema({
  receiver_fid: { type: Number, index: true },
  tipper_fid: { type: Number, index: true },
  cast_hash: String,
  auto_tip: { type: Boolean, default: false, index: true },
  points: { type: String, index: true },
  tip: [{
    currency: String,
    amount: Number
  }],
  createdAt: { type: Date, default: () => new Date() }
});

const Tip = mongoose.models.Tip || mongoose.model('Tip', tipSchema);

export default Tip;
