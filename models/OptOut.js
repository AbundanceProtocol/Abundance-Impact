import mongoose from 'mongoose';

const { Schema } = mongoose;

const optOutSchema = new mongoose.Schema({
  fid: Number,
  points: [String],
  opt_in: { type: Boolean, default: false },
  createdAt: { type: Date, default: () => new Date() }
});

const OptOut = mongoose.models.OptOut || mongoose.model('OptOut', optOutSchema);

export default OptOut;
