import mongoose from 'mongoose';

const circleSchema = new mongoose.Schema({
  fid: { type: Number, index: true },
  time: { type: String, index: true },
  channels: { type: [String], default: [] },
  curators: { type: [Number], default: [] },
  points: { type: String, index: true },
  text: String,
  username: { type: String, index: true },
  user_pfp: String,
  curator: [
    {
      username: String,
      pfp: String,
      fid: Number,
    },
  ],
  ecosystem: String,
  referrer: Number,
  circles: { type: [String], default: [] },
  showcase: [
    {
      cast: { type: String, default: null },
      username: { type: String, default: null },
      pfp: { type: String, default: null },
      impact: Number,
      hash: { type: String, default: null },
    },
  ],
  type: { type: String, index: true },
  image: { type: Object, default: null },
  createdAt: { type: Date, default: () => new Date(), index: true },
});

const Circle = mongoose.models.Circle || mongoose.model('Circle', circleSchema);

export default Circle;
