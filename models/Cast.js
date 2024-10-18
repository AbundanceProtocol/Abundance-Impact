import mongoose from 'mongoose';

const { Schema } = mongoose;

const castSchema = new mongoose.Schema({
  author_fid: { type: Number, required: true },
  author_pfp: { type: String, required: true },
  author_username: { type: String, required: true },
  author_display_name: { type: String, required: true },
  author: {type: Schema.Types.ObjectId, ref: 'User'},
  points: { type: String, index: true },
  cast_hash: { type: String, required: true },
  cast_text: String,
  cast_media: [{
    url: { type: String, required: true },
    content_type: { type: String, required: true },
  }],
  cast_channel: { type: String, index: true },
  cast_tags: [String],
  quality_balance: Number,
  impact_total: { type: Number, default: 0, index: true },
  tips_received: [{type: Schema.Types.ObjectId, ref: 'Tip'}],
  quality_absolute: { type: Number, default: 0 },
  impact_points: [{type: Schema.Types.ObjectId, ref: 'Impact'}],
  quality_points: [{type: Schema.Types.ObjectId, ref: 'Quality'}],
  createdAt: { type: Date, default: () => new Date(), index: true }
});

const Cast = mongoose.models.Cast || mongoose.model('Cast', castSchema);

export default Cast;
