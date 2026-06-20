import express from 'express';
import Fruit from '../models/Fruit.js';
import Stock from '../models/Stock.js';
import Wastage from '../models/Wastage.js';
import Sale from '../models/Sale.js';

const router = express.Router();

// --- Fruits ---
router.get('/fruits', async (req, res) => {
  try {
    const fruits = await Fruit.find().sort({ name: 1 }).lean();
    res.json(fruits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/fruits', async (req, res) => {
  try {
    const { name, buyPrice, price } = req.body;
    const newFruit = new Fruit({ name, buyPrice, price });
    await newFruit.save();
    res.status(201).json(newFruit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/fruits/:id', async (req, res) => {
  try {
    const updatedFruit = await Fruit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedFruit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/fruits/:id', async (req, res) => {
  try {
    await Fruit.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fruit deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Stock Entry ---
router.get('/stock', async (req, res) => {
  try {
    const stock = await Stock.find().sort({ timestamp: -1 }).lean();
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/stock', async (req, res) => {
  try {
    const { fruitId, name, qty } = req.body;
    const newStock = new Stock({ fruitId, name, qty });
    await newStock.save();
    res.status(201).json(newStock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- Wastage ---
router.get('/wastage', async (req, res) => {
  try {
    const wastage = await Wastage.find().sort({ timestamp: -1 }).lean();
    res.json(wastage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/wastage', async (req, res) => {
  try {
    const { fruitId, name, qty } = req.body;
    const newWastage = new Wastage({ fruitId, name, qty });
    await newWastage.save();
    res.status(201).json(newWastage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- Sales (Billing) ---
router.get('/sales', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ date: -1 }).lean();
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/sales', async (req, res) => {
  try {
    const { invoiceId, items, grandTotal } = req.body;
    const newSale = new Sale({ invoiceId, items, grandTotal });
    await newSale.save();
    res.status(201).json(newSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
