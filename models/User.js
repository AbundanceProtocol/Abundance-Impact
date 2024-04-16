import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  invited_by: { type: Number, default: null },
  fid: String,
  pfp: String,
  wallet: String,
  username: String,
  display_name: String,
  set_cast_hash: String,
  need_cast_hash: { type: Boolean, default: true },
  power_badge: Boolean,
  impact_allowance: Number,
  remaining_i_allowance: Number,
  quality_allowance: Number,
  remaining_q_allowance: Number,
  invite_bonus: { type: Number, default: 0 },
  staking_bonus: { type: Number, default: 0 },
  quality_score_change: { type: Number, default: 0 },
  quality_bonus_added: { type: Number, default: 0 },
  tips_received: [{type: Schema.Types.ObjectId, ref: 'Tip'}],
  impact_reviews: [{type: Schema.Types.ObjectId, ref: 'Impact'}],
  quality_reviews: [{type: Schema.Types.ObjectId, ref: 'Quality'}],
  quality_score: [{type: Schema.Types.ObjectId, ref: 'Quality'}],
  next_update: Date,
  createdAt: { type: Date, default: () => new Date() }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
