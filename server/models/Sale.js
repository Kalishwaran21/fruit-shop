import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  buyPrice: { type: Number, required: true },
  qty: { type: Number, required: true },
  total: { type: Number, required: true }
});

const saleSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  items: [saleItemSchema],
  grandTotal: { type: Number, required: true }
});

export default mongoose.model('Sale', saleSchema);
