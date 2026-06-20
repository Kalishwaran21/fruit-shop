import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet, Modal, RefreshControl } from 'react-native';
import { COLORS, globalStyles } from '../styles';
import { getFruits, addFruit, updateFruit, deleteFruit } from '../api';

export default function MenuScreen() {
  const [fruits, setFruits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', buyPrice: '', price: '' });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const r = await getFruits();
    setFruits(r.data.sort((a, b) => a.name.localeCompare(b.name)));
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    if (!form.name || !form.buyPrice || !form.price) return Alert.alert('Fill all fields');
    if (editId) { await updateFruit(editId, form); }
    else        { await addFruit(form); }
    setShowForm(false); setEditId(null);
    setForm({ name: '', buyPrice: '', price: '' });
    load();
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Fruit', `Remove ${name} from catalog?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteFruit(id); load(); } },
    ]);
  };

  const startEdit = (f) => {
    setEditId(f._id);
    setForm({ name: f.name, buyPrice: String(f.buyPrice), price: String(f.price) });
    setShowForm(true);
  };

  const margin = form.buyPrice && form.price
    ? (parseFloat(form.price || 0) - parseFloat(form.buyPrice || 0)).toFixed(2)
    : null;

  return (
    <View style={globalStyles.screen}>
      {/* Form Modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowForm(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.formSheet}>
            <Text style={styles.formTitle}>{editId ? '✏️ Edit Fruit' : '➕ Add New Fruit'}</Text>
            <Text style={globalStyles.inputLabel}>Fruit Name</Text>
            <TextInput style={globalStyles.input} value={form.name} onChangeText={v => setForm({ ...form, name: v })} placeholder="e.g. Mango" placeholderTextColor={COLORS.textMuted} editable={!editId} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={globalStyles.inputLabel}>Buy Price (₹/Kg)</Text>
                <TextInput style={globalStyles.input} value={form.buyPrice} onChangeText={v => setForm({ ...form, buyPrice: v })} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={COLORS.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={globalStyles.inputLabel}>Sell Price (₹/Kg)</Text>
                <TextInput style={globalStyles.input} value={form.price} onChangeText={v => setForm({ ...form, price: v })} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={COLORS.textMuted} />
              </View>
            </View>
            {margin && (
              <View style={styles.marginPreview}>
                <Text style={{ color: parseFloat(margin) >= 0 ? COLORS.primary : COLORS.danger, fontWeight: '700' }}>
                  {parseFloat(margin) >= 0 ? '📈' : '📉'} Profit Margin: ₹{margin}/Kg
                </Text>
              </View>
            )}
            <TouchableOpacity style={globalStyles.btn} onPress={handleSubmit}>
              <Text style={globalStyles.btnText}>{editId ? '✅ Update Fruit' : '➕ Add to Catalog'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />}
      >
        <View style={styles.header}>
          <Text style={globalStyles.pageTitle}>📋 Fruit Catalog</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => { setEditId(null); setForm({ name: '', buyPrice: '', price: '' }); setShowForm(true); }}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {fruits.length === 0
          ? <Text style={globalStyles.emptyText}>No fruits yet. Tap "+ Add" to start! 🍎</Text>
          : fruits.map(f => {
            const m = f.price - f.buyPrice;
            return (
              <View key={f._id} style={globalStyles.card}>
                <View style={styles.fruitHeader}>
                  <Text style={styles.fruitName}>🍊 {f.name}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => startEdit(f)}>
                      <Text style={{ color: COLORS.accent, fontWeight: '700', fontSize: 12 }}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={globalStyles.btnDanger} onPress={() => handleDelete(f._id, f.name)}>
                      <Text style={{ color: COLORS.danger, fontSize: 14, paddingHorizontal: 4 }}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <View style={styles.priceBox}>
                    <Text style={globalStyles.label}>Buy</Text>
                    <Text style={{ color: COLORS.textMain, fontWeight: '700', fontSize: 15 }}>₹{f.buyPrice.toFixed(2)}/Kg</Text>
                  </View>
                  <View style={styles.priceBox}>
                    <Text style={globalStyles.label}>Sell</Text>
                    <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: 15 }}>₹{f.price.toFixed(2)}/Kg</Text>
                  </View>
                  <View style={styles.priceBox}>
                    <Text style={globalStyles.label}>Margin</Text>
                    <Text style={{ color: m >= 0 ? COLORS.primary : COLORS.danger, fontWeight: '700', fontSize: 15 }}>₹{m.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  addBtn:      { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText:  { color: '#052e16', fontWeight: '800', fontSize: 14 },
  fruitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fruitName:   { color: COLORS.textMain, fontWeight: '800', fontSize: 16 },
  editBtn:     { backgroundColor: 'rgba(251,191,36,0.15)', borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)', borderRadius: 8, padding: 8 },
  priceBox:    { flex: 1, backgroundColor: 'rgba(52,211,153,0.05)', borderRadius: 8, padding: 10 },
  marginPreview: { backgroundColor: 'rgba(52,211,153,0.06)', borderRadius: 8, padding: 10, marginBottom: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  formSheet:   { backgroundColor: '#041208', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderTopColor: COLORS.border },
  formTitle:   { color: COLORS.primary, fontWeight: '800', fontSize: 18, marginBottom: 18, textAlign: 'center' },
});
