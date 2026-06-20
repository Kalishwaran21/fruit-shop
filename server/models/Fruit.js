import mongoose from 'mongoose';

const fruitSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  buyPrice: { type: Number, required: true },
  price: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Fruit', fruitSchema);
