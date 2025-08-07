import mongoose from 'mongoose';

const { Schema } = mongoose;

const signalSchema = new mongoose.Schema({
  author_fid: { type: Number, required: true },
  curator_fid: { type: Number, required: true },
  cast_hash: { type: String, required: true },
  impact: { type: Number, required: true },
  validators: [{
    validator_fid: { type: Number },
    vote: { type: Number },
    confirmed: { type: Boolean, default: false },
    createdAt: { type: Date, default: () => new Date(), index: true },
  }],
  boosts: [{
    booster_fid: { type: Number },
    liked: { type: Boolean, default: false },
    createdAt: { type: Date, default: () => new Date(), index: true },
  }],
  stage: { type: String, default: 'signal' }, // signal, validation, challenge
  createdAt: { type: Date, default: () => new Date(), index: true },
});

const Signal = mongoose.models.Signal || mongoose.model('Signal', signalSchema);

export default Signal;
