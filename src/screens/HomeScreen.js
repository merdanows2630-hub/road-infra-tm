// src/screens/HomeScreen.js
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SIZES, SHADOWS } from '../theme';
import { STATISTICS, SAMPLE_INCIDENTS } from '../data/sampleData';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { t, language, reports } = useApp();
  const allReports = [...reports, ...SAMPLE_INCIDENTS.slice(0, 3)];

  const getTypeName = (type) => {
    return t(type) || type;
  };

  const getIncidentEmoji = (type) => {
    const emojis = { pothole: '🕳️', cracking: '⚡', flooding: '🌊', signDamage: '⚠️', bridgeDamage: '🌉', roadblock: '🚧', other: '📍' };
    return emojis[type] || '📍';
  };

  const StatCard = ({ label, value, unit, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value.toLocaleString()}<Text style={styles.statUnit}> {unit}</Text></Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.appName}>{t('appName')}</Text>
            <Text style={styles.appSubtitle}>{t('appSubtitle')}</Text>
          </View>
          <View style={styles.flag}>
            <Text style={{ fontSize: 30 }}>🇹🇲</Text>
          </View>
        </View>

        {/* Hero banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroText}>{t('welcome')}</Text>
          <Text style={styles.heroDesc}>{t('welcomeDesc')}</Text>
          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => navigation.navigate('Map')}
          >
            <Ionicons name="map" size={16} color={COLORS.primary} />
            <Text style={styles.heroBtnText}>{t('map')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>{t('quickStats')}</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label={t('totalRoads')}
            value={STATISTICS.totalRoads}
            unit={t('km')}
            icon="map-outline"
            color={COLORS.primary}
          />
          <StatCard
            label={t('goodCondition')}
            value={STATISTICS.goodConditionKm}
            unit={t('km')}
            icon="checkmark-circle-outline"
            color={COLORS.conditionGood}
          />
          <StatCard
            label={t('badCondition')}
            value={STATISTICS.badConditionKm}
            unit={t('km')}
            icon="alert-circle-outline"
            color={COLORS.conditionBad}
          />
          <StatCard
            label={t('activeReports')}
            value={STATISTICS.activeReports + reports.length}
            unit=""
            icon="document-text-outline"
            color={COLORS.warning}
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Tiz işler</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
            onPress={() => navigation.navigate('Map')}
          >
            <Ionicons name="map" size={26} color="#fff" />
            <Text style={styles.actionBtnText}>{t('map')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.accent }]}
            onPress={() => navigation.navigate('Report')}
          >
            <Ionicons name="add-circle" size={26} color="#fff" />
            <Text style={styles.actionBtnText}>{t('report')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.warning }]}
            onPress={() => navigation.navigate('Statistics')}
          >
            <Ionicons name="bar-chart" size={26} color="#fff" />
            <Text style={styles.actionBtnText}>{t('statistics')}</Text>
          </TouchableOpacity>
        </View>

        {/* Road condition legend */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>{t('roadCondition')}</Text>
          <View style={styles.legendRow}>
            {['good', 'medium', 'bad'].map((cond) => {
              const colors = { good: COLORS.conditionGood, medium: COLORS.conditionMedium, bad: COLORS.conditionBad };
              const percents = { good: 60, medium: 25, bad: 15 };
              return (
                <View key={cond} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors[cond] }]} />
                  <Text style={styles.legendText}>{t(cond)}</Text>
                  <Text style={[styles.legendPct, { color: colors[cond] }]}>{percents[cond]}%</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, { flex: 60, backgroundColor: COLORS.conditionGood }]} />
            <View style={[styles.progressSegment, { flex: 25, backgroundColor: COLORS.conditionMedium }]} />
            <View style={[styles.progressSegment, { flex: 15, backgroundColor: COLORS.conditionBad }]} />
          </View>
        </View>

        {/* Recent Reports */}
        <View style={styles.reportsHeader}>
          <Text style={styles.sectionTitle}>{t('recentReports')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Statistics')}>
            <Text style={styles.viewAllBtn}>{t('viewAll')}</Text>
          </TouchableOpacity>
        </View>

        {allReports.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-outline" size={40} color={COLORS.muted} />
            <Text style={styles.emptyText}>{t('noReports')}</Text>
          </View>
        ) : (
          allReports.slice(0, 5).map((report, idx) => (
            <View key={report.id || idx} style={styles.reportCard}>
              <View style={styles.reportEmoji}>
                <Text style={{ fontSize: 22 }}>{getIncidentEmoji(report.type)}</Text>
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportType}>{getTypeName(report.type)}</Text>
                <Text style={styles.reportDate}>📅 {report.date}</Text>
                <Text style={styles.reportDesc} numberOfLines={2}>
                  {language === 'ru' ? (report.descriptionRu || report.description) :
                   language === 'en' ? (report.descriptionEn || report.description) :
                   report.description}
                </Text>
              </View>
              <View style={[styles.reportStatus, {
                backgroundColor: report.status === 'open' ? '#FEF3C7' : '#D1FAE5'
              }]}>
                <Text style={[styles.reportStatusText, {
                  color: report.status === 'open' ? COLORS.warning : COLORS.success
                }]}>
                  {report.status === 'open' ? '🔴' : '🟡'}
                </Text>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: { backgroundColor: COLORS.primary, paddingTop: 50, paddingHorizontal: SIZES.md, paddingBottom: SIZES.md },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  appName: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  appSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  flag: {},
  heroBanner: { backgroundColor: COLORS.accent + '20', borderRadius: SIZES.borderRadius, padding: SIZES.md, borderWidth: 1, borderColor: COLORS.accent + '40' },
  heroText: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  heroDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 18, marginBottom: SIZES.sm },
  heroBtn: { backgroundColor: COLORS.accent, borderRadius: 20, paddingHorizontal: SIZES.md, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  heroBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  body: { flex: 1, paddingHorizontal: SIZES.md },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginTop: SIZES.lg, marginBottom: SIZES.sm },
  statsGrid: { gap: SIZES.sm },
  statCard: { backgroundColor: '#fff', borderRadius: SIZES.borderRadius, padding: SIZES.md, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, ...SHADOWS.small, gap: SIZES.sm },
  statIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  statInfo: { flex: 1 },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  statUnit: { fontSize: 13, fontWeight: '400', color: COLORS.textSecondary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: SIZES.sm },
  actionBtn: { flex: 1, borderRadius: SIZES.borderRadius, padding: SIZES.md, alignItems: 'center', gap: 6, ...SHADOWS.small },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  legendCard: { backgroundColor: '#fff', borderRadius: SIZES.borderRadius, padding: SIZES.md, ...SHADOWS.small, marginTop: 4 },
  legendTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.sm },
  legendRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SIZES.sm },
  legendItem: { alignItems: 'center', gap: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: COLORS.textSecondary },
  legendPct: { fontSize: 14, fontWeight: '800' },
  progressBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' },
  progressSegment: { height: '100%' },
  reportsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewAllBtn: { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  emptyCard: { backgroundColor: '#fff', borderRadius: SIZES.borderRadius, padding: SIZES.xl, alignItems: 'center', gap: SIZES.sm, ...SHADOWS.small },
  emptyText: { color: COLORS.muted, fontSize: 14 },
  reportCard: { backgroundColor: '#fff', borderRadius: SIZES.borderRadius, padding: SIZES.md, flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, marginBottom: SIZES.sm, ...SHADOWS.small },
  reportEmoji: { width: 44, height: 44, backgroundColor: COLORS.offWhite, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  reportInfo: { flex: 1 },
  reportType: { fontWeight: '700', color: COLORS.text, fontSize: 14 },
  reportDate: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  reportDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  reportStatus: { borderRadius: 20, padding: 6 },
  reportStatusText: { fontSize: 16 },
});
