import mongoose from 'mongoose';

const scheduleTipSchema = new mongoose.Schema({
  fid: Number,
  uuid: String,
  search_shuffle: { type: Boolean, default: true},
  search_time: String,
  search_tags: { type: [String], default: []},
  search_channels: { type: [String], default: []},
  search_curators: { type: [Number], default: []},
  percent_tip: Number,
  schedule_time: { type: Date },
  schedule_count: Number,
  schedule_total: Number,
  createdAt: { type: Date, default: () => new Date() }
});

const ScheduleTip = mongoose.models.ScheduleTip || mongoose.model('ScheduleTip', scheduleTipSchema);

export default Allowlist;
