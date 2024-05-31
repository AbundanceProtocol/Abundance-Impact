import mongoose from 'mongoose';

const ecosystemRulesSchema = new mongoose.Schema({
  fid: Number,
  ecosystem_name: String,
  ecosystem_points_name: String,
  ecosystem_moderators: [Number],
  condition_channels: { type: Boolean, default: true},
  channels: [String],
  condition_powerbadge: { type: Boolean, default: false},
  condition_following_channel: { type: Boolean, default: true},
  condition_following_owner: { type: Boolean, default: true},
  condition_holding_nft: { type: Boolean, default: false},
  nfts: [{
    nft_address: String,
    nft_chain
  }],
  condition_holding_erc20: { type: Boolean, default: false},
  erc20s: [{
    erc20_address: String,
    erc20_chain: String
  }],
  createdAt: { type: Date, default: () => new Date() }
});

const EcosystemRules = mongoose.models.EcosystemRules || mongoose.model('EcosystemRules', ecosystemRulesSchema);

export default EcosystemRules;
