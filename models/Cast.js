import mongoose from 'mongoose';

const { Schema } = mongoose;

const castSchema = new mongoose.Schema({
  author_fid: Number,
  author_pfp: String,
  author_username: String,
  author_display_name: String,
  author: {type: Schema.Types.ObjectId, ref: 'User'},
  points: String,
  cast_hash: String,
  cast_text: String,
  cast_media: [{
    url: { type: String, required: true },
    content_type: { type: String, required: true },
  }],
  cast_channel: String,
  cast_tags: [String],
  quality_balance: Number,
  impact_total: { type: Number, default: 0 },
  tips_received: [{type: Schema.Types.ObjectId, ref: 'Tip'}],
  quality_absolute: { type: Number, default: 0 },
  impact_points: [{type: Schema.Types.ObjectId, ref: 'Impact'}],
  quality_points: [{type: Schema.Types.ObjectId, ref: 'Quality'}],
  createdAt: { type: Date, default: () => new Date() }
});

const Cast = mongoose.models.Cast || mongoose.model('Cast', castSchema);

export default Cast;
