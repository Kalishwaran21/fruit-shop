// Central API config — update IP to your computer's local IP!
// Find it by running: ipconfig  (look for IPv4 address, e.g. 192.168.1.5)
export const API_BASE = 'http://10.24.132.22:5000/api';

import axios from 'axios';

const api = axios.create({ baseURL: API_BASE, timeout: 10000 });

export const login          = (data)     => api.post('/login', data);
export const getFruits      = ()         => api.get('/fruits');
export const addFruit       = (data)     => api.post('/fruits', data);
export const updateFruit    = (id, data) => api.put(`/fruits/${id}`, data);
export const deleteFruit    = (id)       => api.delete(`/fruits/${id}`);

export const getStock       = ()         => api.get('/stock');
export const addStock       = (data)     => api.post('/stock', data);

export const getWastage     = ()         => api.get('/wastage');
export const addWastage     = (data)     => api.post('/wastage', data);

export const getSales       = ()         => api.get('/sales');
export const addSale        = (data)     => api.post('/sales', data);

// Compute live stock for each fruit
export const computeStock = (fruits, stockData, wastageData, salesData) => {
  return fruits.map(fruit => {
    let inward = 0, sold = 0, wasted = 0;
    stockData.forEach(l  => { if (l.fruitId === fruit._id) inward += l.qty; });
    wastageData.forEach(l => { if (l.fruitId === fruit._id) wasted += l.qty; });
    salesData.forEach(b   => b.items.forEach(i => { if (i.name === fruit.name) sold += i.qty; }));
    return { ...fruit, current: inward - sold - wasted, inward, sold, wasted };
  });
};
