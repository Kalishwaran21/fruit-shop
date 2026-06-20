import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { COLORS, globalStyles } from '../styles';
import { getFruits, getStock, getWastage, getSales, computeStock } from '../api';

export default function LevelsScreen() {
  const [stockDetails, setStockDetails] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [fr, st, wa, sa] = await Promise.all([getFruits(), getStock(), getWastage(), getSales()]);
    setStockDetails(computeStock(fr.data, st.data, wa.data, sa.data));
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const empty = stockDetails.filter(f => f.current <= 0);
  const low   = stockDetails.filter(f => f.current > 0 && f.current < 15);

  return (
    <ScrollView
      style={globalStyles.screen}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />}
    >
      <Text style={globalStyles.pageTitle}>📊 Live Stock Levels</Text>

      {/* Alert banner */}
      {(empty.length > 0 || low.length > 0) && (
        <View style={styles.alertBox}>
          <Text style={styles.alertTitle}>⚠️ Stock Alert</Text>
          {empty.length > 0 && <Text style={{ color: COLORS.danger, fontSize: 13 }}>🔴 Out of Stock: {empty.map(f => f.name).join(', ')}</Text>}
          {low.length  > 0 && <Text style={{ color: COLORS.accent, fontSize: 13, marginTop: 4 }}>🟡 Low Stock: {low.map(f => `${f.name} (${f.current.toFixed(1)}Kg)`).join(', ')}</Text>}
        </View>
      )}

      {stockDetails.length === 0
        ? <Text style={globalStyles.emptyText}>No fruits configured yet 📭</Text>
        : stockDetails.map(f => {
          let color = COLORS.primary, label = '✅ Good', bgColor = 'rgba(52,211,153,0.08)';
          if (f.current <= 0)       { color = COLORS.danger;  label = '🔴 Out of Stock'; bgColor = 'rgba(248,113,113,0.08)'; }
          else if (f.current < 15)  { color = COLORS.accent;  label = '🟡 Low Stock';    bgColor = 'rgba(251,191,36,0.08)'; }

          return (
            <View key={f._id} style={[globalStyles.card, { borderLeftWidth: 3, borderLeftColor: color }]}>
              <View style={styles.fruitHeader}>
                <Text style={{ color: COLORS.textMain, fontWeight: '800', fontSize: 16 }}>🍊 {f.name}</Text>
                <Text style={[styles.badge, { backgroundColor: bgColor, color }]}>{label}</Text>
              </View>
              <View style={styles.statsGrid}>
                {[
                  { label: 'Inward',  value: f.inward.toFixed(1),  color: COLORS.primary },
                  { label: 'Sold',    value: f.sold.toFixed(1),    color: COLORS.blue    },
                  { label: 'Wasted',  value: f.wasted.toFixed(1),  color: COLORS.danger  },
                  { label: 'Available', value: Math.max(f.current, 0).toFixed(1), color },
                ].map(stat => (
                  <View key={stat.label} style={styles.statBox}>
                    <Text style={{ color: stat.color, fontWeight: '800', fontSize: 16 }}>{stat.value}</Text>
                    <Text style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 2 }}>{stat.label} Kg</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  alertBox:   { backgroundColor: 'rgba(251,191,36,0.07)', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(251,191,36,0.25)', borderLeftWidth: 4, borderLeftColor: COLORS.accent },
  alertTitle: { color: COLORS.accent, fontWeight: '800', marginBottom: 6 },
  fruitHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, fontWeight: '700', fontSize: 12, overflow: 'hidden' },
  statsGrid:  { flexDirection: 'row', gap: 8 },
  statBox:    { flex: 1, backgroundColor: 'rgba(52,211,153,0.05)', borderRadius: 8, padding: 10, alignItems: 'center' },
});
