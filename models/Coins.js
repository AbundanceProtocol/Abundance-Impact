import mongoose from 'mongoose';

const { Schema } = mongoose;

const coinsSchema = new mongoose.Schema({
  coin: String,
  value: Number,
  createdAt: { type: Date, default: () => new Date() }
});

const Coins = mongoose.models.Coins || mongoose.model('Coins', coinsSchema);

export default Coins;
