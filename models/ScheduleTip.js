import mongoose from 'mongoose';

const scheduleTipSchema = new mongoose.Schema({
  fid: { type: Number, index: true },
  uuid: String, //encrypted
  code: { type: String, index: true },
  search_shuffle: { type: Boolean, default: true},
  search_time: String,
  search_tags: { type: [String], default: []},
  search_channels: { type: [String], default: []},
  search_curators: { type: [Number], default: []},
  percent_tip: Number,
  points: { type: String, default: '$IMPACT', index: true },
  currencies: { type: [String], default: ['$DEGEN', '$TN100x']},
  schedule_time: String,
  schedule_count: Number,
  schedule_total: Number,
  ecosystem_name: String,
  cron_job_id: Number,
  active_cron: { type: Boolean, default: false},
  percent_allowance: { type: Number, default: 25 },
  percent_allowance_active: { type: Boolean, default: false, index: true },
  amount_degen_allowance: { type: Number, default: 0 },
  amount_degen_allowance_active: { type: Boolean, default: false, index: true },
  creator_fund: { type: Number, default: 80 },
  development_fund: { type: Number, default: 10 },
  growth_fund: { type: Number, default: 10 },
  createdAt: { type: Date, default: () => new Date(), index: true }
});

const ScheduleTip = mongoose.models.ScheduleTip || mongoose.model('ScheduleTip', scheduleTipSchema);

export default ScheduleTip;
