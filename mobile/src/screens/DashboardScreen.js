import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { COLORS, globalStyles } from '../styles';
import { getFruits, getStock, getWastage, getSales, computeStock } from '../api';

function StatCard({ label, value, color }) {
  return (
    <View style={[globalStyles.card, { flex: 1, marginHorizontal: 4, borderLeftWidth: 3, borderLeftColor: color }]}>
      <Text style={[globalStyles.label, { fontSize: 10 }]}>{label}</Text>
      <Text style={[globalStyles.value, { color, fontSize: 18 }]}>₹{value.toFixed(2)}</Text>
    </View>
  );
}

function AlertBanner({ stockDetails }) {
  const empty = stockDetails.filter(f => f.current <= 0);
  const low   = stockDetails.filter(f => f.current > 0 && f.current < 15);
  if (empty.length === 0 && low.length === 0) return null;
  return (
    <View style={styles.alertBox}>
      <Text style={styles.alertTitle}>⚠️ Stock Alert</Text>
      {empty.length > 0 && (
        <Text style={styles.alertRed}>🔴 Out of Stock: {empty.map(f => f.name).join(', ')}</Text>
      )}
      {low.length > 0 && (
        <Text style={styles.alertYellow}>🟡 Low Stock: {low.map(f => `${f.name} (${f.current.toFixed(1)}Kg)`).join(', ')}</Text>
      )}
    </View>
  );
}

export default function DashboardScreen() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [fr, st, wa, sa] = await Promise.all([getFruits(), getStock(), getWastage(), getSales()]);
      const fruits   = fr.data;
      const stock    = st.data;
      const wastage  = wa.data;
      const sales    = sa.data;
      const computed = computeStock(fruits, stock, wastage, sales);

      const now = new Date();
      let todayRev = 0, todayProfit = 0, weekRev = 0, monthRev = 0;
      sales.forEach(bill => {
        const d = new Date(bill.date);
        const diff = Math.ceil(Math.abs(now - d) / 86400000);
        let profit = 0;
        bill.items.forEach(i => profit += (i.price - i.buyPrice) * i.qty);
        if (now.toDateString() === d.toDateString()) { todayRev += bill.grandTotal; todayProfit += profit; }
        if (diff <= 7) weekRev += bill.grandTotal;
        if (now.getMonth() === d.getMonth()) monthRev += bill.grandTotal;
      });

      // Last 7 days chart
      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        return {
          label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
          value: sales.filter(b => new Date(b.date).toDateString() === d.toDateString())
                      .reduce((s, b) => s + b.grandTotal, 0),
        };
      });

      setData({ todayRev, todayProfit, weekRev, monthRev, computed, sales, last7 });
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return (
    <View style={[globalStyles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  const { todayRev, todayProfit, weekRev, monthRev, computed, sales, last7 } = data;

  return (
    <ScrollView
      style={globalStyles.screen}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.primary} />}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>🌿 FreshFruits Pro</Text>
        <Text style={styles.heroSub}>Inventory & Sales Dashboard</Text>
        <Text style={styles.heroFruits}>🍎 🍌 🥭 🍇 🍊</Text>
      </View>

      {/* Alert */}
      <AlertBanner stockDetails={computed} />

      {/* Stats */}
      <View style={{ flexDirection: 'row', marginBottom: 14 }}>
        <StatCard label="Today's Sales"  value={todayRev}    color={COLORS.primary} />
        <StatCard label="Today's Profit" value={todayProfit} color={COLORS.blue}    />
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 14 }}>
        <StatCard label="Weekly Sales"   value={weekRev}  color={COLORS.accent}  />
        <StatCard label="Monthly Sales"  value={monthRev} color={COLORS.purple}  />
      </View>

      {/* Last 7 Days Bar */}
      <View style={globalStyles.card}>
        <Text style={styles.sectionTitle}>📅 Last 7 Days Revenue</Text>
        {last7.map((d, i) => (
          <View key={i} style={{ marginBottom: 8 }}>
            <View style={styles.row}>
              <Text style={styles.barLabel}>{d.label}</Text>
              <Text style={styles.barValue}>₹{d.value.toFixed(0)}</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, {
                width: `${last7.reduce((m, x) => Math.max(m, x.value), 0) > 0
                  ? (d.value / last7.reduce((m, x) => Math.max(m, x.value), 0)) * 100
                  : 0}%`,
                backgroundColor: i === 6 ? COLORS.primary : 'rgba(52,211,153,0.35)',
              }]} />
            </View>
          </View>
        ))}
      </View>

      {/* Stock Levels */}
      <View style={globalStyles.card}>
        <Text style={styles.sectionTitle}>🥝 Stock Levels</Text>
        {computed.map(f => {
          const color = f.current <= 0 ? COLORS.danger : f.current < 15 ? COLORS.accent : COLORS.primary;
          return (
            <View key={f._id} style={styles.stockRow}>
              <Text style={styles.stockName}>🍊 {f.name}</Text>
              <Text style={[styles.stockQty, { color }]}>{Math.max(f.current, 0).toFixed(1)} Kg</Text>
            </View>
          );
        })}
      </View>

      {/* Recent Invoices */}
      <View style={globalStyles.card}>
        <Text style={styles.sectionTitle}>🧾 Recent Invoices</Text>
        {sales.slice(0, 6).map((s, i) => (
          <View key={i} style={styles.invoiceRow}>
            <View>
              <Text style={{ color: COLORS.textMain, fontWeight: '700' }}>#{s.invoiceId}</Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2 }}>
                {new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                {' · '}{s.items.length} item{s.items.length > 1 ? 's' : ''}
              </Text>
            </View>
            <Text style={{ color: COLORS.accent, fontWeight: '800', fontSize: 16 }}>₹{s.grandTotal.toFixed(2)}</Text>
          </View>
        ))}
        {sales.length === 0 && <Text style={globalStyles.emptyText}>No sales yet 🍃</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: 'rgba(5,46,22,0.8)', borderRadius: 18, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(52,211,153,0.25)' },
  heroTitle: { fontSize: 24, fontWeight: '900', color: COLORS.primary },
  heroSub:   { color: 'rgba(134,239,172,0.7)', marginTop: 4, fontSize: 13 },
  heroFruits:{ fontSize: 26, marginTop: 10, letterSpacing: 4 },
  alertBox:  { backgroundColor: 'rgba(251,191,36,0.08)', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(251,191,36,0.25)', borderLeftWidth: 4, borderLeftColor: COLORS.accent },
  alertTitle:{ color: COLORS.accent, fontWeight: '800', marginBottom: 6 },
  alertRed:  { color: COLORS.danger, fontSize: 13, marginBottom: 3 },
  alertYellow:{ color: COLORS.accent, fontSize: 13 },
  sectionTitle: { color: COLORS.primary, fontWeight: '700', fontSize: 15, marginBottom: 12 },
  barLabel: { color: COLORS.textMuted, fontSize: 11, flex: 1 },
  barValue: { color: COLORS.textMain, fontSize: 11, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  barTrack: { height: 8, backgroundColor: 'rgba(52,211,153,0.08)', borderRadius: 4, overflow: 'hidden' },
  barFill:  { height: 8, borderRadius: 4 },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(52,211,153,0.07)' },
  stockName:{ color: COLORS.textMain, fontSize: 14 },
  stockQty: { fontWeight: '800', fontSize: 14 },
  invoiceRow:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(52,211,153,0.07)' },
});
