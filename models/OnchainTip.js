import mongoose from 'mongoose';

const onchainTipSchema = new mongoose.Schema({
  tipper_fid: { type: Number, index: true },
  tipper_pfp: { type: String },
  tipper_username: { type: String },
  points: { type: String, default: '$IMPACT', index: true },
  tip: [{
    currency: String,
    amount: Number,
    value: Number
  }],
  receiver: [{
    fid: Number,
    pfp: String,
    username: String,
    amount: Number
  }],
  transaction_hash: { type: String },
  createdAt: { type: Date, default: () => new Date() }
});

const OnchainTip = mongoose.models.OnchainTip || mongoose.model('OnchainTip', onchainTipSchema);

export default OnchainTip;
