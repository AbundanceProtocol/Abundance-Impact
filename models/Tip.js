import mongoose from 'mongoose';

const tipSchema = new mongoose.Schema({
  receiver_fid: Number,
  tipper_fid: Number,
  cast_hash: String,
  tip: [{
    currency: String,
    amount: Number
  }],
  createdAt: { type: Date, default: () => new Date() }
});

const Tip = mongoose.models.Tip || mongoose.model('Tip', tipSchema);

export default Tip;
