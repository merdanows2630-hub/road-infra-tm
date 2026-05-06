// src/screens/MapScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView, ActivityIndicator, Alert, Platform,
} from 'react-native';
import MapView, { Polygon, Polyline, Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { TM_BOUNDARY, TM_CENTER, TM_DELTA } from '../data/tmBoundary';
import { SAMPLE_ROADS, SAMPLE_INCIDENTS } from '../data/sampleData';
import { COLORS, SIZES, SHADOWS, getConditionColor, getSeverityColor, getIncidentIcon } from '../theme';

const FILTERS = ['filterAll', 'good', 'medium', 'bad'];

export default function MapScreen({ navigation }) {
  const { t, mapType, reports } = useApp();
  const mapRef = useRef(null);
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filter, setFilter] = useState('filterAll');
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [detailModal, setDetailModal] = useState(false);

  const allIncidents = [...SAMPLE_INCIDENTS, ...reports.map(r => ({
    ...r,
    latitude: r.latitude || 38.5,
    longitude: r.longitude || 58.5,
  }))];

  const filteredRoads = SAMPLE_ROADS.filter(
    r => filter === 'filterAll' || r.condition === filter
  );

  const getMyLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('locationPermission'));
        setLoadingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setUserLocation(coords);
      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.5, longitudeDelta: 0.5 }, 1000);
    } catch (e) {
      Alert.alert(t('locationError'));
    }
    setLoadingLocation(false);
  };

  const zoomToTurkmenistan = () => {
    mapRef.current?.animateToRegion({ ...TM_CENTER, ...TM_DELTA }, 1000);
  };

  const getRoadName = (road) => {
    const { language } = useApp() || {};
    return road.name;
  };

  const mapTypeValue = mapType === 'satellite' ? 'satellite' : mapType === 'hybrid' ? 'hybrid' : 'standard';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('mapTitle')}</Text>
          <Text style={styles.headerSub}>{filteredRoads.length} {t('totalRoads')} • {allIncidents.length} {t('activeReports')}</Text>
        </View>
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive, {
                borderColor: f === 'good' ? COLORS.conditionGood : f === 'medium' ? COLORS.conditionMedium : f === 'bad' ? COLORS.conditionBad : COLORS.primary
              }]}
              onPress={() => setFilter(f)}
            >
              {f !== 'filterAll' && (
                <View style={[styles.filterDot, {
                  backgroundColor: f === 'good' ? COLORS.conditionGood : f === 'medium' ? COLORS.conditionMedium : COLORS.conditionBad
                }]} />
              )}
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {t(f)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        mapType={mapTypeValue}
        initialRegion={{ ...TM_CENTER, ...TM_DELTA }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        onPress={() => { setSelectedRoad(null); setSelectedIncident(null); }}
      >
        {/* Turkmenistan boundary */}
        <Polygon
          coordinates={TM_BOUNDARY}
          strokeColor={COLORS.primary}
          strokeWidth={2}
          fillColor="rgba(10, 37, 64, 0.06)"
        />

        {/* Road polylines */}
        {filteredRoads.map((road) => (
          <Polyline
            key={road.id}
            coordinates={road.coordinates}
            strokeColor={getConditionColor(road.condition)}
            strokeWidth={road.type === 'highway' ? 5 : road.type === 'primaryRoad' ? 4 : 3}
            lineDashPattern={road.condition === 'bad' ? [8, 4] : undefined}
            tappable
            onPress={() => {
              setSelectedRoad(road);
              setSelectedIncident(null);
              setDetailModal(true);
            }}
          />
        ))}

        {/* Incident markers */}
        {allIncidents.map((incident) => (
          <Marker
            key={incident.id}
            coordinate={{ latitude: incident.latitude, longitude: incident.longitude }}
            onPress={() => {
              setSelectedIncident(incident);
              setSelectedRoad(null);
              setDetailModal(true);
            }}
          >
            <View style={[styles.markerContainer, { borderColor: getSeverityColor(incident.severity) }]}>
              <Text style={styles.markerEmoji}>{getIncidentIcon(incident.type)}</Text>
            </View>
          </Marker>
        ))}

        {/* User location marker */}
        {userLocation && (
          <Marker coordinate={userLocation} title={t('myLocation')}>
            <View style={styles.userMarker}>
              <Ionicons name="navigate" size={16} color="#fff" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.mapBtn} onPress={zoomToTurkmenistan}>
          <Text style={styles.mapBtnEmoji}>🇹🇲</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapBtn} onPress={getMyLocation}>
          {loadingLocation ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons name="navigate" size={20} color={COLORS.primary} />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapBtn} onPress={() => navigation.navigate('Report')}>
          <Ionicons name="add" size={22} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {[['good', '━━'], ['medium', '━ ━'], ['bad', '┄ ┄']].map(([cond, dash]) => (
          <View key={cond} style={styles.legendItem}>
            <Text style={[styles.legendLine, { color: getConditionColor(cond) }]}>{dash}</Text>
            <Text style={styles.legendText}>{t(cond)}</Text>
          </View>
        ))}
      </View>

      {/* Detail Modal */}
      <Modal visible={detailModal} transparent animationType="slide" onRequestClose={() => setDetailModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDetailModal(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            {selectedRoad && (
              <RoadDetail road={selectedRoad} t={t} onClose={() => setDetailModal(false)} />
            )}
            {selectedIncident && (
              <IncidentDetail incident={selectedIncident} t={t} onClose={() => setDetailModal(false)} />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function RoadDetail({ road, t, onClose }) {
  const condColor = getConditionColor(road.condition);
  return (
    <View>
      <View style={styles.modalHeader}>
        <View style={[styles.condBadge, { backgroundColor: condColor + '20' }]}>
          <View style={[styles.condDot, { backgroundColor: condColor }]} />
          <Text style={[styles.condText, { color: condColor }]}>{t(road.condition)}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.modalTitle}>{road.name}</Text>
      <View style={styles.detailRows}>
        <DetailRow icon="construct-outline" label={t('roadType')} value={t(road.type)} />
        <DetailRow icon="resize-outline" label={t('roadLength')} value={`${road.length} ${t('km')}`} />
        <DetailRow icon="location-outline" label={t('region')} value={road.region} />
        <DetailRow icon="calendar-outline" label={t('lastInspected')} value={road.lastInspected} />
      </View>
    </View>
  );
}

function IncidentDetail({ incident, t, onClose }) {
  const sevColor = getSeverityColor(incident.severity);
  return (
    <View>
      <View style={styles.modalHeader}>
        <View style={[styles.condBadge, { backgroundColor: sevColor + '20' }]}>
          <Text style={styles.modalEmoji}>{getIncidentIcon(incident.type)}</Text>
          <Text style={[styles.condText, { color: sevColor }]}>{t(incident.severity)}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.modalTitle}>{t(incident.type)}</Text>
      <Text style={styles.modalDesc}>{incident.description}</Text>
      <View style={styles.detailRows}>
        <DetailRow icon="calendar-outline" label="Senesi" value={incident.date} />
        <DetailRow icon="alert-circle-outline" label={t('severity')} value={t(incident.severity)} />
      </View>
    </View>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={18} color={COLORS.accent} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  header: { backgroundColor: COLORS.primary, paddingTop: 50, paddingHorizontal: SIZES.md, paddingBottom: SIZES.sm },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  filterRow: { backgroundColor: COLORS.primary, paddingBottom: SIZES.sm },
  filterScroll: { paddingHorizontal: SIZES.md, gap: SIZES.sm },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, backgroundColor: 'rgba(255,255,255,0.1)' },
  filterChipActive: { backgroundColor: '#fff' },
  filterDot: { width: 8, height: 8, borderRadius: 4 },
  filterText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: COLORS.primary },
  map: { flex: 1 },
  markerContainer: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, ...SHADOWS.small },
  markerEmoji: { fontSize: 16 },
  userMarker: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  mapControls: { position: 'absolute', right: SIZES.md, bottom: 100, gap: SIZES.sm },
  mapBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', ...SHADOWS.medium },
  mapBtnEmoji: { fontSize: 22 },
  legend: { position: 'absolute', left: SIZES.md, bottom: 100, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: SIZES.borderRadius, padding: 10, gap: 4, ...SHADOWS.small },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendLine: { fontSize: 14, fontWeight: '900', width: 28 },
  legendText: { fontSize: 11, color: COLORS.text, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SIZES.md, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: COLORS.light, borderRadius: 2, alignSelf: 'center', marginBottom: SIZES.md },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.sm },
  condBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  condDot: { width: 8, height: 8, borderRadius: 4 },
  condText: { fontSize: 13, fontWeight: '700' },
  modalEmoji: { fontSize: 16 },
  closeBtn: { padding: 4 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: SIZES.sm },
  modalDesc: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SIZES.md },
  detailRows: { gap: SIZES.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, paddingVertical: SIZES.xs, borderBottomWidth: 1, borderBottomColor: COLORS.light },
  detailLabel: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
  detailValue: { fontSize: 13, fontWeight: '700', color: COLORS.text },
});
