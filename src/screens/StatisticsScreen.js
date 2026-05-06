// src/screens/StatisticsScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SIZES, SHADOWS, getConditionColor } from '../theme';
import { STATISTICS } from '../data/sampleData';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - SIZES.md * 2 - 32;

export default function StatisticsScreen() {
  const { t, language, reports } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  const totalReports = STATISTICS.activeReports + reports.length;
  const totalGoodPct = Math.round((STATISTICS.goodConditionKm / STATISTICS.totalRoads) * 100);
  const totalMedPct = Math.round((STATISTICS.mediumConditionKm / STATISTICS.totalRoads) * 100);
  const totalBadPct = Math.round((STATISTICS.badConditionKm / STATISTICS.totalRoads) * 100);

  const getRegionName = (key) => {
    try { return t(`regions.${key}`); } catch { return key; }
  };

  const TABS = [
    { key: 'overview', label: language === 'ru' ? 'Обзор' : language === 'en' ? 'Overview' : 'Genel' },
    { key: 'regions', label: language === 'ru' ? 'Велаяты' : language === 'en' ? 'Regions' : 'Welaýat' },
    { key: 'reports', label: language === 'ru' ? 'Отчёты' : language === 'en' ? 'Reports' : 'Habarlar' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('statsTitle')}</Text>
        <Text style={styles.headerSub}>{t('statsDesc')}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false} contentContainerStyle={styles.bodyContent}>

        {activeTab === 'overview' && (
          <>
            {/* Summary cards */}
            <View style={styles.summaryRow}>
              <SummaryCard value={STATISTICS.totalRoads.toLocaleString()} label={t('totalRoads')} unit="km" icon="map" color={COLORS.primary} />
              <SummaryCard value={totalReports} label={t('activeReports')} unit="" icon="document-text" color={COLORS.warning} />
            </View>

            {/* Condition breakdown */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('roadsByCondition')}</Text>

              {/* Big donut-like visual */}
              <View style={styles.conditionBars}>
                {[
                  { cond: 'good', pct: totalGoodPct, km: STATISTICS.goodConditionKm },
                  { cond: 'medium', pct: totalMedPct, km: STATISTICS.mediumConditionKm },
                  { cond: 'bad', pct: totalBadPct, km: STATISTICS.badConditionKm },
                ].map(({ cond, pct, km }) => (
                  <View key={cond} style={styles.condRow}>
                    <View style={styles.condLabelRow}>
                      <View style={[styles.condDot, { backgroundColor: getConditionColor(cond) }]} />
                      <Text style={styles.condLabel}>{t(cond)}</Text>
                      <Text style={styles.condKm}>{km.toLocaleString()} km</Text>
                      <Text style={[styles.condPct, { color: getConditionColor(cond) }]}>{pct}%</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: getConditionColor(cond) }]} />
                    </View>
                  </View>
                ))}
              </View>

              {/* Visual stacked bar */}
              <View style={styles.stackedBar}>
                <View style={[styles.stackSeg, { flex: totalGoodPct, backgroundColor: COLORS.conditionGood }]} />
                <View style={[styles.stackSeg, { flex: totalMedPct, backgroundColor: COLORS.conditionMedium }]} />
                <View style={[styles.stackSeg, { flex: totalBadPct, backgroundColor: COLORS.conditionBad }]} />
              </View>
            </View>

            {/* Monthly reports chart */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('reportsByMonth')}</Text>
              <SimpleBarChart data={STATISTICS.monthlyReports} color={COLORS.accent} />
            </View>
          </>
        )}

        {activeTab === 'regions' && (
          <>
            {STATISTICS.regionData.map((reg) => (
              <RegionCard key={reg.region} data={reg} t={t} language={language} />
            ))}
          </>
        )}

        {activeTab === 'reports' && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{language === 'ru' ? 'Типы проблем' : language === 'en' ? 'Issue Types' : 'Mesele görnüşleri'}</Text>
              {[
                { type: 'pothole', emoji: '🕳️', count: 18, color: COLORS.conditionBad },
                { type: 'cracking', emoji: '⚡', count: 12, color: COLORS.warning },
                { type: 'flooding', emoji: '🌊', count: 7, color: '#3B82F6' },
                { type: 'signDamage', emoji: '⚠️', count: 5, color: COLORS.conditionMedium },
                { type: 'bridgeDamage', emoji: '🌉', count: 3, color: '#8B5CF6' },
                { type: 'other', emoji: '📍', count: 2, color: COLORS.muted },
              ].map(({ type, emoji, count, color }) => (
                <View key={type} style={styles.reportTypeRow}>
                  <Text style={styles.reportEmoji}>{emoji}</Text>
                  <Text style={styles.reportTypeName}>{t(type)}</Text>
                  <View style={styles.reportCountBar}>
                    <View style={[styles.reportBarFill, { width: `${(count / 18) * 100}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={[styles.reportCount, { color }]}>{count}</Text>
                </View>
              ))}
            </View>

            {/* User reports */}
            {reports.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{language === 'ru' ? 'Мои отчёты' : language === 'en' ? 'My Reports' : 'Meniň habarlarym'}</Text>
                {reports.map((r, i) => (
                  <View key={i} style={styles.myReportRow}>
                    <Text style={{ fontSize: 20 }}>📍</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.myReportType}>{t(r.type)}</Text>
                      <Text style={styles.myReportDate}>{r.date}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: COLORS.warning + '20' }]}>
                      <Text style={[styles.statusText, { color: COLORS.warning }]}>open</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function SummaryCard({ value, label, unit, icon, color }) {
  return (
    <View style={[styles.summaryCard, { borderTopColor: color }]}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.summaryValue}>{value}<Text style={styles.summaryUnit}> {unit}</Text></Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function RegionCard({ data, t, language }) {
  const names = { ru: { ahal: 'Ахал', balkan: 'Балкан', dashoguz: 'Дашогуз', lebap: 'Лебап', mary: 'Мары', ashgabat: 'Ашхабад' }, en: { ahal: 'Ahal', balkan: 'Balkan', dashoguz: 'Dashoguz', lebap: 'Lebap', mary: 'Mary', ashgabat: 'Ashgabat' }, tm: { ahal: 'Ahal', balkan: 'Balkan', dashoguz: 'Daşoguz', lebap: 'Lebap', mary: 'Mary', ashgabat: 'Aşgabat' } };
  const name = names[language]?.[data.region] || data.region;
  return (
    <View style={styles.regionCard}>
      <View style={styles.regionHeader}>
        <Text style={styles.regionName}>{name} {t('region') || 'welaýaty'}</Text>
        <Text style={styles.regionKm}>{data.km.toLocaleString()} km</Text>
      </View>
      <View style={styles.regionBars}>
        {[{ cond: 'good', pct: data.good }, { cond: 'medium', pct: data.medium }, { cond: 'bad', pct: data.bad }].map(({ cond, pct }) => (
          <View key={cond} style={styles.regionBarRow}>
            <Text style={styles.regionBarLabel}>{t(cond)}</Text>
            <View style={styles.regionBarTrack}>
              <View style={[styles.regionBarFill, { width: `${pct}%`, backgroundColor: getConditionColor(cond) }]} />
            </View>
            <Text style={[styles.regionBarPct, { color: getConditionColor(cond) }]}>{pct}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SimpleBarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.count));
  return (
    <View style={styles.barChart}>
      {data.map((d, i) => (
        <View key={i} style={styles.barChartCol}>
          <Text style={styles.barChartCount}>{d.count}</Text>
          <View style={styles.barChartTrack}>
            <View style={[styles.barChartBar, { height: `${(d.count / max) * 100}%`, backgroundColor: color }]} />
          </View>
          <Text style={styles.barChartLabel}>{d.month}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: { backgroundColor: COLORS.primary, paddingTop: 50, paddingHorizontal: SIZES.md, paddingBottom: SIZES.md },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  tabRow: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, paddingBottom: SIZES.sm, gap: SIZES.sm },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  tabActive: { backgroundColor: COLORS.accent },
  tabText: { color: 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: COLORS.primary, fontWeight: '800' },
  body: { flex: 1 },
  bodyContent: { padding: SIZES.md, gap: SIZES.md },
  summaryRow: { flexDirection: 'row', gap: SIZES.sm },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: SIZES.borderRadius, padding: SIZES.md, alignItems: 'center', borderTopWidth: 4, ...SHADOWS.small, gap: 4 },
  summaryValue: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  summaryUnit: { fontSize: 13, fontWeight: '400', color: COLORS.textSecondary },
  summaryLabel: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: SIZES.borderRadius, padding: SIZES.md, ...SHADOWS.small },
  cardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: SIZES.md },
  conditionBars: { gap: SIZES.sm },
  condRow: { gap: 6 },
  condLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  condDot: { width: 10, height: 10, borderRadius: 5 },
  condLabel: { flex: 1, fontSize: 13, color: COLORS.text, fontWeight: '600' },
  condKm: { fontSize: 12, color: COLORS.textSecondary },
  condPct: { fontSize: 14, fontWeight: '800', width: 40, textAlign: 'right' },
  barTrack: { height: 6, backgroundColor: COLORS.light, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  stackedBar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginTop: SIZES.md },
  stackSeg: { height: '100%' },
  barChart: { flexDirection: 'row', height: 120, alignItems: 'flex-end', gap: 8, paddingTop: 20 },
  barChartCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barChartCount: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 4 },
  barChartTrack: { width: '100%', flex: 1, justifyContent: 'flex-end', backgroundColor: COLORS.light, borderRadius: 4, overflow: 'hidden' },
  barChartBar: { width: '100%', borderRadius: 4 },
  barChartLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
  reportTypeRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.light },
  reportEmoji: { fontSize: 20, width: 30 },
  reportTypeName: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.text },
  reportCountBar: { width: 80, height: 6, backgroundColor: COLORS.light, borderRadius: 3, overflow: 'hidden' },
  reportBarFill: { height: '100%', borderRadius: 3 },
  reportCount: { fontSize: 14, fontWeight: '800', width: 24, textAlign: 'right' },
  regionCard: { backgroundColor: '#fff', borderRadius: SIZES.borderRadius, padding: SIZES.md, ...SHADOWS.small },
  regionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.sm },
  regionName: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  regionKm: { fontSize: 13, color: COLORS.textSecondary },
  regionBars: { gap: 6 },
  regionBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  regionBarLabel: { fontSize: 12, color: COLORS.textSecondary, width: 50 },
  regionBarTrack: { flex: 1, height: 6, backgroundColor: COLORS.light, borderRadius: 3, overflow: 'hidden' },
  regionBarFill: { height: '100%', borderRadius: 3 },
  regionBarPct: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
  myReportRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.light },
  myReportType: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  myReportDate: { fontSize: 12, color: COLORS.textSecondary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
});
