import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Modal, Animated } from 'react-native';
import { COLORS, globalStyles } from '../styles';
import { getFruits, getStock, getWastage, getSales, addSale, computeStock } from '../api';

export default function BillingScreen() {
  const [fruits, setFruits]       = useState([]);
  const [currentStock, setCurrentStock] = useState({});
  const [cart, setCart]           = useState([]);
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [qty, setQty]             = useState('');
  const [loading, setLoading]     = useState(true);
  const [invoiceModal, setInvoiceModal] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const invoiceId = React.useRef(Math.floor(100000 + Math.random() * 900000).toString());

  const loadData = useCallback(async () => {
    const [fr, st, wa, sa] = await Promise.all([getFruits(), getStock(), getWastage(), getSales()]);
    const sorted = fr.data.sort((a, b) => a.name.localeCompare(b.name));
    setFruits(sorted);
    const computed = computeStock(sorted, st.data, wa.data, sa.data);
    const map = {};
    computed.forEach(f => map[f.name] = f.current);
    setCurrentStock(map);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const addToCart = () => {
    if (!selectedFruit) return Alert.alert('Select a fruit first');
    const q = parseFloat(qty);
    if (isNaN(q) || q <= 0) return Alert.alert('Enter valid quantity');
    const avail = currentStock[selectedFruit.name] || 0;
    const inCart = cart.find(i => i.name === selectedFruit.name);
    const cumQty = q + (inCart ? inCart.qty : 0);
    if (cumQty > avail) return Alert.alert('Insufficient Stock', `Only ${avail.toFixed(2)} Kg available`);
    if (inCart) {
      setCart(cart.map(i => i.name === selectedFruit.name ? { ...i, qty: cumQty, total: cumQty * i.price } : i));
    } else {
      setCart([...cart, { name: selectedFruit.name, price: selectedFruit.price, buyPrice: selectedFruit.buyPrice, qty: q, total: q * selectedFruit.price }]);
    }
    setQty(''); setSelectedFruit(null);
  };

  const grandTotal = cart.reduce((s, i) => s + i.total, 0);

  const checkout = async () => {
    if (cart.length === 0) return Alert.alert('Cart is empty!');
    const payload = { invoiceId: invoiceId.current, items: cart, grandTotal, date: new Date().toISOString() };
    await addSale(payload);
    setInvoiceModal(payload);
    setCart([]);
    invoiceId.current = Math.floor(100000 + Math.random() * 900000).toString();
    loadData();
  };

  const avail = selectedFruit ? (currentStock[selectedFruit.name] || 0) : 0;

  return (
    <View style={globalStyles.screen}>
      {/* Invoice Modal */}
      <Modal visible={!!invoiceModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.invoiceCard}>
            <Text style={styles.invoiceHeader}>✅ Invoice Generated!</Text>
            <View style={styles.invoiceMeta}>
              <Text style={styles.invoiceId}>#{invoiceModal?.invoiceId}</Text>
              <Text style={styles.invoiceDate}>{invoiceModal ? new Date(invoiceModal.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</Text>
            </View>
            {invoiceModal?.items.map((item, i) => (
              <View key={i} style={styles.invoiceRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.invoiceItem}>🍊 {item.name}</Text>
                  <Text style={styles.invoiceQty}>{item.qty.toFixed(2)} Kg × ₹{item.price.toFixed(2)}</Text>
                </View>
                <Text style={styles.invoiceTotal}>₹{item.total.toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandLabel}>Grand Total</Text>
              <Text style={styles.grandValue}>₹{invoiceModal?.grandTotal.toFixed(2)}</Text>
            </View>
            <Text style={styles.thankYou}>🍎 Thank you! FreshFruits Pro</Text>
            <TouchableOpacity style={globalStyles.btn} onPress={() => setInvoiceModal(null)}>
              <Text style={globalStyles.btnText}>✅ Close Invoice</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text style={globalStyles.pageTitle}>🧾 New Invoice</Text>

        {/* Fruit Selector */}
        <Text style={globalStyles.inputLabel}>🍑 Select Fruit</Text>
        <TouchableOpacity style={styles.picker} onPress={() => setShowPicker(true)}>
          <Text style={{ color: selectedFruit ? COLORS.textMain : COLORS.textMuted }}>
            {selectedFruit ? `${selectedFruit.name} — ₹${selectedFruit.price}/Kg (${(currentStock[selectedFruit.name]||0).toFixed(1)} Kg avail)` : '-- Choose Fruit --'}
          </Text>
        </TouchableOpacity>

        {/* Fruit picker modal */}
        <Modal visible={showPicker} transparent animationType="slide">
          <TouchableOpacity style={styles.pickerOverlay} onPress={() => setShowPicker(false)}>
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerTitle}>Select Fruit</Text>
              <ScrollView>
                {fruits.map(f => {
                  const a = currentStock[f.name] || 0;
                  return (
                    <TouchableOpacity key={f._id} style={styles.pickerItem} onPress={() => { setSelectedFruit(f); setShowPicker(false); }}>
                      <Text style={{ color: COLORS.textMain, fontWeight: '600' }}>{f.name}</Text>
                      <Text style={{ color: a <= 0 ? COLORS.danger : a < 15 ? COLORS.accent : COLORS.primary, fontSize: 13 }}>
                        {a.toFixed(1)} Kg  ₹{f.price}/Kg
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        <Text style={globalStyles.inputLabel}>⚖️ Quantity (Kg)</Text>
        <TextInput
          style={globalStyles.input} value={qty}
          onChangeText={setQty} keyboardType="decimal-pad"
          placeholder={selectedFruit ? `Max: ${avail.toFixed(2)} Kg` : 'Enter kg...'}
          placeholderTextColor={COLORS.textMuted}
        />
        <TouchableOpacity style={globalStyles.btn} onPress={addToCart}>
          <Text style={globalStyles.btnText}>➕ Add to Cart</Text>
        </TouchableOpacity>

        {/* Cart */}
        <View style={[globalStyles.card, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>🛒 Current Bill</Text>
          {cart.length === 0
            ? <Text style={globalStyles.emptyText}>No items yet</Text>
            : cart.map((item, idx) => (
              <View key={idx} style={styles.cartRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: COLORS.textMain, fontWeight: '700' }}>🍊 {item.name}</Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>{item.qty.toFixed(2)} Kg × ₹{item.price.toFixed(2)}</Text>
                </View>
                <Text style={{ color: COLORS.accent, fontWeight: '800', marginRight: 10 }}>₹{item.total.toFixed(2)}</Text>
                <TouchableOpacity onPress={() => setCart(cart.filter((_, i) => i !== idx))} style={globalStyles.btnDanger}>
                  <Text style={{ color: COLORS.danger, fontWeight: '700', fontSize: 12, paddingHorizontal: 6 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          {cart.length > 0 && (
            <>
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandLabel}>Grand Total</Text>
                <Text style={styles.grandValue}>₹{grandTotal.toFixed(2)}</Text>
              </View>
              <TouchableOpacity style={[globalStyles.btn, { marginTop: 12 }]} onPress={checkout}>
                <Text style={globalStyles.btnText}>🎊 Complete Checkout</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  invoiceCard:   { backgroundColor: 'rgba(4,18,8,0.98)', borderRadius: 22, padding: 22, width: '100%', maxWidth: 440, borderWidth: 1, borderColor: 'rgba(52,211,153,0.35)' },
  invoiceHeader: { color: COLORS.primary, fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 16 },
  invoiceMeta:   { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(52,211,153,0.07)', borderRadius: 10, padding: 12, marginBottom: 16 },
  invoiceId:     { color: COLORS.primary, fontWeight: '800', fontSize: 18 },
  invoiceDate:   { color: COLORS.textMuted, fontSize: 13 },
  invoiceRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(52,211,153,0.08)' },
  invoiceItem:   { color: COLORS.textMain, fontWeight: '700', fontSize: 14 },
  invoiceQty:    { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  invoiceTotal:  { color: COLORS.accent, fontWeight: '800', fontSize: 16 },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(52,211,153,0.15)' },
  grandLabel:    { color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', fontSize: 12 },
  grandValue:    { color: COLORS.primary, fontWeight: '900', fontSize: 26 },
  thankYou:      { color: COLORS.textMuted, textAlign: 'center', fontSize: 12, marginVertical: 12, opacity: 0.6 },
  picker:        { backgroundColor: 'rgba(5,26,10,0.8)', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 14, marginBottom: 12 },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  pickerSheet:   { backgroundColor: '#041208', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%', borderTopWidth: 1, borderTopColor: COLORS.border },
  pickerTitle:   { color: COLORS.primary, fontWeight: '800', fontSize: 16, marginBottom: 14, textAlign: 'center' },
  pickerItem:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(52,211,153,0.08)' },
  sectionTitle:  { color: COLORS.primary, fontWeight: '700', fontSize: 15, marginBottom: 12 },
  cartRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(52,211,153,0.07)' },
});
