import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet, RefreshControl } from 'react-native';
import { COLORS, globalStyles } from '../styles';
import { getFruits, getStock, getWastage, getSales, addStock, computeStock } from '../api';

export default function StockScreen() {
  const [fruits, setFruits]     = useState([]);
  const [logs, setLogs]         = useState([]);
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [qty, setQty]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const load = useCallback(async () => {
    const [fr, st] = await Promise.all([getFruits(), getStock()]);
    setFruits(fr.data.sort((a, b) => a.name.localeCompare(b.name)));
    setLogs(st.data.slice(0, 20));
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    if (!selectedFruit) return Alert.alert('Select a fruit first');
    const q = parseFloat(qty);
    if (isNaN(q) || q <= 0) return Alert.alert('Enter valid quantity');
    setSubmitting(true);
    await addStock({ fruitId: selectedFruit._id, name: selectedFruit.name, qty: q });
    Alert.alert('✅ Added', `+${q.toFixed(2)} Kg of ${selectedFruit.name} logged!`);
    setQty(''); setSelectedFruit(null);
    setSubmitting(false); load();
  };

  return (
    <View style={globalStyles.screen}>
      {/* Picker Modal */}
      {showPicker && (
        <View style={StyleSheet.absoluteFillObject}>
          <TouchableOpacity style={styles.pickerOverlay} onPress={() => setShowPicker(false)}>
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerTitle}>📦 Select Fruit</Text>
              <ScrollView>
                {fruits.map(f => (
                  <TouchableOpacity key={f._id} style={styles.pickerItem} onPress={() => { setSelectedFruit(f); setShowPicker(false); }}>
                    <Text style={{ color: COLORS.textMain, fontWeight: '600', fontSize: 15 }}>🍊 {f.name}</Text>
                    <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>Buy ₹{f.buyPrice}/Kg</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />}
      >
        <Text style={globalStyles.pageTitle}>📦 Stock Inward</Text>

        <View style={globalStyles.card}>
          <Text style={styles.sectionTitle}>📥 Log New Batch</Text>
          <Text style={globalStyles.inputLabel}>Select Fruit</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setShowPicker(true)}>
            <Text style={{ color: selectedFruit ? COLORS.textMain : COLORS.textMuted }}>
              {selectedFruit ? `${selectedFruit.name} — ₹${selectedFruit.buyPrice}/Kg` : '-- Choose Fruit --'}
            </Text>
          </TouchableOpacity>
          <Text style={globalStyles.inputLabel}>Quantity Received (Kg)</Text>
          <TextInput style={globalStyles.input} value={qty} onChangeText={setQty} keyboardType="decimal-pad" placeholder="Enter kg..." placeholderTextColor={COLORS.textMuted} />
          <TouchableOpacity style={[globalStyles.btn, { opacity: submitting ? 0.7 : 1 }]} onPress={handleSubmit} disabled={submitting}>
            <Text style={globalStyles.btnText}>{submitting ? '⏳ Adding...' : '📥 Add Stock Batch'}</Text>
          </TouchableOpacity>
        </View>

        <View style={globalStyles.card}>
          <Text style={styles.sectionTitle}>🕒 Recent Inward Logs</Text>
          {logs.length === 0
            ? <Text style={globalStyles.emptyText}>No logs yet 📭</Text>
            : logs.map((log, i) => (
              <View key={i} style={styles.logRow}>
                <View>
                  <Text style={{ color: COLORS.textMain, fontWeight: '700' }}>🍊 {log.name}</Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2 }}>
                    {new Date(log.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={{ color: COLORS.primary, fontWeight: '900', fontSize: 16 }}>+{log.qty.toFixed(2)} Kg</Text>
              </View>
            ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: COLORS.primary, fontWeight: '700', fontSize: 15, marginBottom: 12 },
  picker:       { backgroundColor: 'rgba(5,26,10,0.8)', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 14, marginBottom: 12, minHeight: 48, justifyContent: 'center' },
  logRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(52,211,153,0.07)' },
  pickerOverlay:{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  pickerSheet:  { backgroundColor: '#041208', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '65%', borderTopWidth: 1, borderTopColor: COLORS.border },
  pickerTitle:  { color: COLORS.primary, fontWeight: '800', fontSize: 16, marginBottom: 14, textAlign: 'center' },
  pickerItem:   { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(52,211,153,0.08)' },
});
