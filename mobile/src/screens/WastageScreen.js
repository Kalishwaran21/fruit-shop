import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet, RefreshControl } from 'react-native';
import { COLORS, globalStyles } from '../styles';
import { getFruits, getStock, getWastage, getSales, addWastage, computeStock } from '../api';

export default function WastageScreen() {
  const [fruits, setFruits]       = useState([]);
  const [logs, setLogs]           = useState([]);
  const [stockMap, setStockMap]   = useState({});
  const [selectedFruit, setSelectedFruit] = useState(null);
  const [qty, setQty]             = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const load = useCallback(async () => {
    const [fr, st, wa, sa] = await Promise.all([getFruits(), getStock(), getWastage(), getSales()]);
    const sorted = fr.data.sort((a, b) => a.name.localeCompare(b.name));
    setFruits(sorted);
    setLogs(wa.data.slice(0, 20));
    const computed = computeStock(sorted, st.data, wa.data, sa.data);
    const map = {};
    computed.forEach(f => map[f._id] = f.current);
    setStockMap(map);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    if (!selectedFruit) return Alert.alert('Select a fruit first');
    const q = parseFloat(qty);
    if (isNaN(q) || q <= 0) return Alert.alert('Enter valid quantity');
    const avail = stockMap[selectedFruit._id] || 0;
    if (q > avail) return Alert.alert('Insufficient Stock', `Only ${avail.toFixed(2)} Kg available`);
    setSubmitting(true);
    await addWastage({ fruitId: selectedFruit._id, name: selectedFruit.name, qty: q });
    Alert.alert('📋 Logged', `Wastage of ${q.toFixed(2)} Kg ${selectedFruit.name} recorded.`);
    setQty(''); setSelectedFruit(null);
    setSubmitting(false); load();
  };

  return (
    <View style={globalStyles.screen}>
      {showPicker && (
        <View style={StyleSheet.absoluteFillObject}>
          <TouchableOpacity style={styles.pickerOverlay} onPress={() => setShowPicker(false)}>
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerTitle}>🗑️ Select Fruit</Text>
              <ScrollView>
                {fruits.map(f => {
                  const avail = stockMap[f._id] || 0;
                  return (
                    <TouchableOpacity key={f._id} style={[styles.pickerItem, avail <= 0 && { opacity: 0.4 }]}
                      onPress={() => { if (avail > 0) { setSelectedFruit(f); setShowPicker(false); } }}
                      disabled={avail <= 0}
                    >
                      <Text style={{ color: COLORS.textMain, fontWeight: '600', fontSize: 15 }}>🍊 {f.name}</Text>
                      <Text style={{ color: avail <= 0 ? COLORS.danger : avail < 15 ? COLORS.accent : COLORS.primary, fontSize: 12 }}>
                        {avail.toFixed(1)} Kg available {avail <= 0 ? '🔴' : avail < 15 ? '🟡' : '✅'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />}
      >
        <Text style={globalStyles.pageTitle}>🗑️ Wastage / Damage</Text>

        <View style={[globalStyles.card, { borderLeftWidth: 3, borderLeftColor: COLORS.danger }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.danger }]}>🚨 Report Damaged Goods</Text>
          <Text style={globalStyles.inputLabel}>Select Fruit</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setShowPicker(true)}>
            <Text style={{ color: selectedFruit ? COLORS.textMain : COLORS.textMuted }}>
              {selectedFruit ? `${selectedFruit.name} — ${(stockMap[selectedFruit._id]||0).toFixed(1)} Kg available` : '-- Choose Fruit --'}
            </Text>
          </TouchableOpacity>
          <Text style={globalStyles.inputLabel}>Quantity Lost (Kg)</Text>
          <TextInput style={globalStyles.input} value={qty} onChangeText={setQty} keyboardType="decimal-pad" placeholder="Enter wasted kg..." placeholderTextColor={COLORS.textMuted} />
          <TouchableOpacity
            style={[styles.dangerBtn, { opacity: submitting ? 0.7 : 1 }]}
            onPress={handleSubmit} disabled={submitting}
          >
            <Text style={styles.dangerBtnText}>{submitting ? '⏳ Logging...' : '🗑️ Submit Wastage'}</Text>
          </TouchableOpacity>
        </View>

        <View style={globalStyles.card}>
          <Text style={styles.sectionTitle}>🕒 Recent Wastage Logs</Text>
          {logs.length === 0
            ? <Text style={globalStyles.emptyText}>No wastage logged yet ✨</Text>
            : logs.map((log, i) => (
              <View key={i} style={styles.logRow}>
                <View>
                  <Text style={{ color: COLORS.textMain, fontWeight: '700' }}>🗑️ {log.name}</Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2 }}>
                    {new Date(log.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={{ color: COLORS.danger, fontWeight: '900', fontSize: 16 }}>-{log.qty.toFixed(2)} Kg</Text>
              </View>
            ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontWeight: '700', fontSize: 15, marginBottom: 12 },
  picker:       { backgroundColor: 'rgba(5,26,10,0.8)', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 14, marginBottom: 12, minHeight: 48, justifyContent: 'center' },
  dangerBtn:    { backgroundColor: 'rgba(248,113,113,0.15)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.4)', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
  dangerBtnText:{ color: COLORS.danger, fontWeight: '800', fontSize: 16 },
  logRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(52,211,153,0.07)' },
  pickerOverlay:{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  pickerSheet:  { backgroundColor: '#041208', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '65%', borderTopWidth: 1, borderTopColor: COLORS.border },
  pickerTitle:  { color: COLORS.primary, fontWeight: '800', fontSize: 16, marginBottom: 14, textAlign: 'center' },
  pickerItem:   { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(52,211,153,0.08)' },
});
