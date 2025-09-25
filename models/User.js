import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  invited_by: { type: Number, default: null },
  fid: { type: String, index: true },
  uuid: { type: String, default: "" }, //encrypted
  token: String, //encrypted
  notified: { type: Boolean, default: false, index: true },
  ecosystem_points: { type: String, index: true },
  ecosystem_name: String,
  pfp: String,
  wallet: String,
  username: { type: String, index: true },
  display_name: String,
  set_cast_hash: String,
  need_cast_hash: { type: Boolean, default: true },
  power_badge: Boolean,
  impact_allowance: { type: Number, default: 30 },
  remaining_i_allowance: { type: Number, default: 30 },
  quality_allowance: { type: Number, default: 30 },
  remaining_q_allowance: { type: Number, default: 30 },
  invite_bonus: { type: Number, default: 0 },
  boost: { type: Boolean, default: false, index: true },
  impact_boost: { type: Boolean, default: false, index: true },
  validator: { type: Boolean, default: false, index: true },
  spam_label: { type: Boolean, default: false, index: true },
  staking_bonus: { type: Number, default: 0 },
  quality_score_change: { type: Number, default: 0 },
  quality_bonus_added: { type: Number, default: 0 },
  tips_received: [{type: Schema.Types.ObjectId, ref: 'Tip'}],
  impact_reviews: [{type: Schema.Types.ObjectId, ref: 'Impact'}],
  quality_reviews: [{type: Schema.Types.ObjectId, ref: 'Quality'}],
  quality_score: [{type: Schema.Types.ObjectId, ref: 'Quality'}],
  next_update: Date,
  createdAt: { type: Date, default: () => new Date(), index: true }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
