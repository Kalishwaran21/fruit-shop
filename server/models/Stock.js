import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  fruitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fruit', required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Stock', stockSchema);
