// src/screens/SettingsScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SIZES, SHADOWS } from '../theme';

const LANGUAGES = [
  { code: 'tm', label: 'Türkmençe', flag: '🇹🇲', nativeName: 'Türkmen dili' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', nativeName: 'Русский язык' },
  { code: 'en', label: 'English', flag: '🇬🇧', nativeName: 'English' },
];

const MAP_TYPES = [
  { key: 'standard', icon: 'map-outline' },
  { key: 'satellite', icon: 'earth-outline' },
  { key: 'hybrid', icon: 'layers-outline' },
];

export default function SettingsScreen() {
  const { t, language, changeLanguage, mapType, changeMapType, clearData } = useApp();
  const [notifications, setNotifications] = useState(true);

  const handleClearData = () => {
    Alert.alert(
      t('clearData'),
      t('clearDataConfirm'),
      [
        { text: t('no'), style: 'cancel' },
        { text: t('yes'), style: 'destructive', onPress: clearData },
      ]
    );
  };

  const SettingRow = ({ icon, label, right, onPress }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={20} color={COLORS.accent} />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {right}
        {onPress && <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settingsTitle')}</Text>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* Language Section */}
        <Text style={styles.sectionTitle}>{t('language')}</Text>
        <View style={styles.card}>
          {LANGUAGES.map((lang, index) => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.langRow, index < LANGUAGES.length - 1 && styles.rowBorder]}
              onPress={() => changeLanguage(lang.code)}
            >
              <Text style={styles.langFlag}>{lang.flag}</Text>
              <View style={styles.langInfo}>
                <Text style={styles.langLabel}>{lang.label}</Text>
                <Text style={styles.langNative}>{lang.nativeName}</Text>
              </View>
              {language === lang.code && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.accent} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Map Type */}
        <Text style={styles.sectionTitle}>{t('mapType')}</Text>
        <View style={styles.card}>
          <View style={styles.mapTypeRow}>
            {MAP_TYPES.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[styles.mapTypeBtn, mapType === m.key && styles.mapTypeBtnActive]}
                onPress={() => changeMapType(m.key)}
              >
                <Ionicons name={m.icon} size={24} color={mapType === m.key ? '#fff' : COLORS.textSecondary} />
                <Text style={[styles.mapTypeText, mapType === m.key && styles.mapTypeTextActive]}>
                  {t(m.key)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>{t('notifications')}</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Ionicons name="notifications-outline" size={20} color={COLORS.accent} />
              </View>
              <Text style={styles.settingLabel}>{t('enableNotifications')}</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.light, true: COLORS.accent }}
              thumbColor={notifications ? '#fff' : COLORS.muted}
            />
          </View>
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>{t('about')}</Text>
        <View style={styles.card}>
          <View style={styles.aboutHeader}>
            <View style={styles.aboutIcon}>
              <Text style={{ fontSize: 32 }}>🛣️</Text>
            </View>
            <View>
              <Text style={styles.aboutName}>{t('appName')}</Text>
              <Text style={styles.aboutVersion}>{t('version')}: 1.0.0</Text>
            </View>
          </View>
          <Text style={styles.aboutDesc}>{t('appDescription')}</Text>

          <View style={styles.aboutRows}>
            <View style={[styles.settingRow, styles.rowBorder]}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Ionicons name="person-outline" size={20} color={COLORS.accent} />
                </View>
                <Text style={styles.settingLabel}>{t('developer')}</Text>
              </View>
              <Text style={styles.settingValue}>Diplom işi 2025</Text>
            </View>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.accent} />
                </View>
                <Text style={styles.settingLabel}>{t('contact')}</Text>
              </View>
              <Text style={styles.settingValue}>roadinfra.tm</Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <Text style={styles.sectionTitle}>⚠️</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.dangerRow} onPress={handleClearData}>
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            <Text style={styles.dangerText}>{t('clearData')}</Text>
          </TouchableOpacity>
        </View>

        {/* App info footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>🛣️ Road Infrastructure TM</Text>
          <Text style={styles.footerSub}>© 2025 • Türkmenistan</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: { backgroundColor: COLORS.primary, paddingTop: 50, paddingHorizontal: SIZES.md, paddingBottom: SIZES.lg },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  body: { flex: 1, paddingHorizontal: SIZES.md },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1, marginTop: SIZES.lg, marginBottom: SIZES.sm, textTransform: 'uppercase' },
  card: { backgroundColor: '#fff', borderRadius: SIZES.borderRadius, overflow: 'hidden', ...SHADOWS.small },
  langRow: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md, gap: SIZES.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.light },
  langFlag: { fontSize: 28 },
  langInfo: { flex: 1 },
  langLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  langNative: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  checkmark: {},
  mapTypeRow: { flexDirection: 'row', padding: SIZES.sm, gap: SIZES.sm },
  mapTypeBtn: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 10, gap: 4, backgroundColor: COLORS.offWhite },
  mapTypeBtnActive: { backgroundColor: COLORS.primary },
  mapTypeText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  mapTypeTextActive: { color: '#fff' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SIZES.md },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, flex: 1 },
  settingIcon: { width: 36, height: 36, backgroundColor: COLORS.accent + '15', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 15, color: COLORS.text, fontWeight: '600' },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settingValue: { fontSize: 13, color: COLORS.textSecondary },
  aboutHeader: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md, padding: SIZES.md, borderBottomWidth: 1, borderBottomColor: COLORS.light },
  aboutIcon: { width: 56, height: 56, backgroundColor: COLORS.primary + '15', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  aboutName: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  aboutVersion: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  aboutDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, padding: SIZES.md, borderBottomWidth: 1, borderBottomColor: COLORS.light },
  aboutRows: {},
  dangerRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, padding: SIZES.md },
  dangerText: { fontSize: 15, color: COLORS.danger, fontWeight: '700' },
  footer: { alignItems: 'center', paddingVertical: SIZES.xl },
  footerText: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  footerSub: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
});
