import mongoose from 'mongoose';

const ecosystemRulesSchema = new mongoose.Schema({
  fid: Number,
  owner_name: String,
  ecosystem_name: String,
  ecosystem_points_name: String,
  ecosystem_moderators: [Number],
  ecosystem_rules: [String],
  condition_channels: { type: Boolean, default: true},
  channels: [{
    url: String,
    name: String
  }],
  condition_points_threshold: { type: Number, default: 1},
  condition_curators_threshold: { type: Number, default: 1},
  condition_powerbadge: { type: Boolean, default: false},
  condition_following_channel: { type: Boolean, default: true},
  condition_following_owner: { type: Boolean, default: true},
  condition_holding_nft: { type: Boolean, default: false},
  percent_tipped: { type: Number, default: 10},
  upvote_value: { type: Number, default: 1},
  downvote_value: { type: Number, default: 1},
  points_per_tip: { type: Number, default: 1},
  nfts: [{
    nft_address: String,
    nft_chain: String
  }],
  condition_holding_erc20: { type: Boolean, default: false},
  erc20s: [{
    erc20_address: String,
    erc20_chain: String,
    min: Number
  }],
  createdAt: { type: Date, default: () => new Date() }
});

const EcosystemRules = mongoose.models.EcosystemRules || mongoose.model('EcosystemRules', ecosystemRulesSchema);

export default EcosystemRules;
