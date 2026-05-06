// src/screens/ReportScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Image, ActivityIndicator, Platform,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, SIZES, SHADOWS } from '../theme';

const ISSUE_TYPES = ['pothole', 'cracking', 'flooding', 'signDamage', 'bridgeDamage', 'roadblock', 'other'];
const SEVERITIES = ['low', 'moderate', 'high', 'critical'];
const SEV_COLORS = { low: COLORS.conditionGood, moderate: COLORS.warning, high: '#F97316', critical: COLORS.conditionBad };

export default function ReportScreen({ navigation }) {
  const { t, addReport } = useApp();
  const [issueType, setIssueType] = useState('');
  const [severity, setSeverity] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    setDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    } catch (e) {}
    setDetecting(false);
  };

  const pickImage = async (source) => {
    try {
      let result;
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Camera permission needed'); return; }
        result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, allowsEditing: true });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Gallery permission needed'); return; }
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, allowsEditing: true });
      }
      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Error picking image');
    }
  };

  const showImageOptions = () => {
    Alert.alert(t('addPhoto'), '', [
      { text: t('takePhoto'), onPress: () => pickImage('camera') },
      { text: t('chooseFromGallery'), onPress: () => pickImage('gallery') },
      { text: t('close'), style: 'cancel' },
    ]);
  };

  const handleSubmit = async () => {
    if (!issueType || !severity || !description.trim()) {
      Alert.alert(t('fillAllFields'));
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    try {
      await addReport({
        type: issueType,
        severity,
        description: description.trim(),
        photo,
        latitude: location?.latitude || 37.9601,
        longitude: location?.longitude || 58.3261,
        status: 'open',
      });
      setSubmitted(true);
    } catch (e) {
      Alert.alert(t('reportError'));
    }
    setSubmitting(false);
  };

  const resetForm = () => {
    setIssueType('');
    setSeverity('');
    setDescription('');
    setPhoto(null);
    setSubmitted(false);
    detectLocation();
  };

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Text style={{ fontSize: 60 }}>✅</Text>
        </View>
        <Text style={styles.successTitle}>{t('reportSubmitted')}</Text>
        <Text style={styles.successDesc}>{t('reportSuccess')}</Text>
        <TouchableOpacity style={styles.newReportBtn} onPress={resetForm}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.newReportBtnText}>Täze habar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.homeBtnText}>Baş sahypa</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('reportTitle')}</Text>
        <Text style={styles.headerSub}>{t('reportDesc')}</Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>

        {/* Issue Type */}
        <Text style={styles.sectionLabel}>{t('issueType')} <Text style={styles.required}>*</Text></Text>
        <View style={styles.typeGrid}>
          {ISSUE_TYPES.map((type) => {
            const icons = { pothole: '🕳️', cracking: '⚡', flooding: '🌊', signDamage: '⚠️', bridgeDamage: '🌉', roadblock: '🚧', other: '📍' };
            return (
              <TouchableOpacity
                key={type}
                style={[styles.typeCard, issueType === type && styles.typeCardActive]}
                onPress={() => setIssueType(type)}
              >
                <Text style={styles.typeEmoji}>{icons[type]}</Text>
                <Text style={[styles.typeName, issueType === type && styles.typeNameActive]}>{t(type)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Severity */}
        <Text style={styles.sectionLabel}>{t('severity')} <Text style={styles.required}>*</Text></Text>
        <View style={styles.sevRow}>
          {SEVERITIES.map((sev) => (
            <TouchableOpacity
              key={sev}
              style={[styles.sevChip, severity === sev && { backgroundColor: SEV_COLORS[sev], borderColor: SEV_COLORS[sev] }]}
              onPress={() => setSeverity(sev)}
            >
              <Text style={[styles.sevText, severity === sev && { color: '#fff' }]}>{t(sev)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={styles.sectionLabel}>{t('description')} <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.textArea}
          placeholder={t('descriptionPlaceholder')}
          placeholderTextColor={COLORS.muted}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />

        {/* Photo */}
        <Text style={styles.sectionLabel}>{t('addPhoto')}</Text>
        {photo ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity style={styles.removePhoto} onPress={() => setPhoto(null)}>
              <Ionicons name="close-circle" size={28} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.photoBtn} onPress={showImageOptions}>
            <Ionicons name="camera-outline" size={32} color={COLORS.accent} />
            <Text style={styles.photoBtnText}>{t('addPhoto')}</Text>
          </TouchableOpacity>
        )}

        {/* Location */}
        <Text style={styles.sectionLabel}>{t('yourLocation')}</Text>
        <View style={styles.locationCard}>
          <View style={[styles.locationIcon, { backgroundColor: location ? COLORS.accent + '20' : COLORS.light }]}>
            <Ionicons name={location ? 'location' : 'location-outline'} size={22} color={location ? COLORS.accent : COLORS.muted} />
          </View>
          <View style={styles.locationInfo}>
            {detecting ? (
              <View style={styles.detectingRow}>
                <ActivityIndicator size="small" color={COLORS.accent} />
                <Text style={styles.detectingText}>{t('detectingLocation')}</Text>
              </View>
            ) : location ? (
              <>
                <Text style={styles.locationDetected}>✓ {t('locationDetected')}</Text>
                <Text style={styles.locationCoords}>
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Text>
              </>
            ) : (
              <Text style={styles.locationError}>{t('locationError')}</Text>
            )}
          </View>
          <TouchableOpacity onPress={detectLocation} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={18} color={COLORS.accent} />
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.submitBtnText}>{t('submitReport')}</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: { backgroundColor: COLORS.primary, paddingTop: 50, paddingHorizontal: SIZES.md, paddingBottom: SIZES.lg },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4, lineHeight: 18 },
  form: { flex: 1 },
  formContent: { padding: SIZES.md, gap: 4 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: SIZES.md, marginBottom: SIZES.sm },
  required: { color: COLORS.danger },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm },
  typeCard: { width: '30%', backgroundColor: '#fff', borderRadius: SIZES.borderRadius, padding: 10, alignItems: 'center', gap: 4, borderWidth: 2, borderColor: COLORS.light, ...SHADOWS.small },
  typeCardActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '10' },
  typeEmoji: { fontSize: 24 },
  typeName: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', textAlign: 'center' },
  typeNameActive: { color: COLORS.accent },
  sevRow: { flexDirection: 'row', gap: SIZES.sm, flexWrap: 'wrap' },
  sevChip: { paddingHorizontal: SIZES.md, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.light, backgroundColor: '#fff' },
  sevText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  textArea: { backgroundColor: '#fff', borderRadius: SIZES.borderRadius, padding: SIZES.md, fontSize: 14, color: COLORS.text, minHeight: 100, borderWidth: 1.5, borderColor: COLORS.light, ...SHADOWS.small },
  photoBtn: { backgroundColor: '#fff', borderRadius: SIZES.borderRadius, borderWidth: 2, borderColor: COLORS.accent, borderStyle: 'dashed', padding: SIZES.xl, alignItems: 'center', gap: SIZES.sm },
  photoBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 14 },
  photoContainer: { position: 'relative' },
  photo: { width: '100%', height: 200, borderRadius: SIZES.borderRadius },
  removePhoto: { position: 'absolute', top: 8, right: 8, backgroundColor: '#fff', borderRadius: 14 },
  locationCard: { backgroundColor: '#fff', borderRadius: SIZES.borderRadius, padding: SIZES.md, flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, ...SHADOWS.small },
  locationIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  locationInfo: { flex: 1 },
  detectingRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  detectingText: { color: COLORS.textSecondary, fontSize: 13 },
  locationDetected: { color: COLORS.accent, fontWeight: '700', fontSize: 14 },
  locationCoords: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  locationError: { color: COLORS.danger, fontSize: 13 },
  refreshBtn: { padding: SIZES.sm },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadius, padding: SIZES.md + 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SIZES.sm, marginTop: SIZES.lg, ...SHADOWS.medium },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  successContainer: { flex: 1, backgroundColor: COLORS.offWhite, justifyContent: 'center', alignItems: 'center', padding: SIZES.xl },
  successIcon: { marginBottom: SIZES.lg },
  successTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: SIZES.sm },
  successDesc: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SIZES.xl, lineHeight: 22 },
  newReportBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.borderRadius, padding: SIZES.md, flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, ...SHADOWS.medium },
  newReportBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  homeBtn: { marginTop: SIZES.md, padding: SIZES.sm },
  homeBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 14 },
});
