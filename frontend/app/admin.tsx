import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Redirect } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../src/context/AuthContext';
import { useDestinations } from '../src/context/DestinationsContext';
import { useExtras } from '../src/context/ExtrasContext';
import { useTrips } from '../src/context/TripsContext';
import { INTERESTS } from '../src/data/destinations';
import { api } from '../src/services/api';
import { checkBackend } from '../src/services/health';
import { colors, radius, shadowSoft, spacing } from '../src/theme';
import { Destination } from '../src/types';
import { isAdmin } from '../src/utils/roles';

const PALETTE: [string, string][] = [
  ['#14B8C4', '#0E7C86'],
  ['#F2994A', '#D9622B'],
  ['#3FB67C', '#1F7A52'],
  ['#8E7CC3', '#5A4A9C'],
  ['#E56B8A', '#B23A5E'],
  ['#6C8EBF', '#3A5A8C'],
];

const EMOJI_SUGGESTIONS = ['📍', '🏖️', '⛰️', '🕌', '🌲', '🏰', '⛵', '🐘', '🌅'];

const num = (s: string) => parseFloat(s.replace(/[^0-9.\-]/g, ''));

type AdminTab = 'dashboard' | 'destinations' | 'form';

export default function Admin() {
  const { user, ready } = useAuth();
  const insets = useSafeAreaInsets();
  const {
    destinations,
    allDestinations,
    customIds,
    hiddenIds,
    hiddenCount,
    addDestination,
    updateDestination,
    removeDestination,
    unhideDestination,
    resetCatalog,
    refresh,
  } = useDestinations();
  const { trips } = useTrips();
  const { reviews, favorites } = useExtras();

  // Tab State
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [emoji, setEmoji] = useState('📍');
  const [cost, setCost] = useState('3000');
  const [places, setPlaces] = useState('');
  const [desc, setDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [pickingPhoto, setPickingPhoto] = useState(false);
  const [lat, setLat] = useState('20.5937');
  const [lon, setLon] = useState('78.9629');
  const [tags, setTags] = useState<string[]>(['Culture']);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Search & Filter in Catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('All');

  // Backend Health State
  const [backendStatus, setBackendStatus] = useState<string>('Online');
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [pinging, setPinging] = useState(false);
  const [serverStats, setServerStats] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    checkHealth();
    api
      .get('/admin/stats')
      .then((res) => setServerStats(res.data?.stats || null))
      .catch(() => setServerStats(null));
  }, [destinations.length, trips.length, hiddenCount]);

  if (!ready) return null;
  if (!isAdmin(user?.email, user?.role)) return <Redirect href="/(tabs)/profile" />;

  const checkHealth = async () => {
    setPinging(true);
    const t0 = Date.now();
    try {
      const res = await checkBackend();
      setPingLatency(Date.now() - t0);
      setBackendStatus(res.ok ? 'Online' : 'Warning');
    } catch {
      setBackendStatus('Offline');
    } finally {
      setPinging(false);
    }
  };

  const toggleTag = (t: string) => {
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  };

  const pickPhoto = async () => {
    setPickingPhoto(true);
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.6,
        base64: true,
      });
      if (!res.canceled && res.assets[0]) {
        if (res.assets[0].base64) {
          setImageUrl(`data:image/jpeg;base64,${res.assets[0].base64}`);
        } else if (res.assets[0].uri) {
          setImageUrl(res.assets[0].uri);
        }
      }
    } catch {
      setFormError('Could not open photo library');
    } finally {
      setPickingPhoto(false);
    }
  };

  const clearForm = () => {
    setEditId(null);
    setName('');
    setRegion('');
    setEmoji('📍');
    setImageUrl('');
    setCost('3000');
    setPlaces('');
    setDesc('');
    setLat('20.5937');
    setLon('78.9629');
    setTags(['Culture']);
    setFormError('');
  };

  const startEdit = (d: Destination) => {
    setEditId(d.id);
    setName(d.name);
    setRegion(d.region);
    setEmoji(d.emoji);
    setImageUrl(d.imageUrl || '');
    setCost(String(d.avgDailyCost));
    setPlaces(d.highlights.join(', '));
    setDesc(d.description);
    setLat(String(d.lat));
    setLon(String(d.lon));
    setTags(d.tags || []);
    setFormError('');
    setActiveTab('form');
  };

  const saveDestination = async () => {
    const c = num(cost);
    const highlights = places.split(',').map((s) => s.trim()).filter(Boolean);
    if (name.trim().length < 2) return setFormError('Enter a destination name (min 2 chars)');
    if (!region.trim()) return setFormError('Enter the state or region');
    if (!c || c < 500) return setFormError('Enter a daily cost of at least ₹500');
    if (!highlights.length) return setFormError('Add at least one top place (comma-separated)');
    if (!tags.length) return setFormError('Select at least one category tag');
    const la = lat ? num(lat) : 20.5937;
    const lo = lon ? num(lon) : 78.9629;
    if (isNaN(la) || isNaN(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) {
      return setFormError('Latitude or longitude is not valid');
    }
    setFormError('');
    setSaving(true);

    try {
      if (editId) {
        await updateDestination(editId, {
          name: name.trim(),
          region: region.trim(),
          emoji: emoji.trim() || '📍',
          imageUrl: imageUrl.trim(),
          avgDailyCost: c,
          highlights,
          description: desc.trim() || `${name.trim()} is an iconic destination in ${region.trim()}.`,
          lat: la,
          lon: lo,
          tags,
        });
        clearForm();
        setActiveTab('destinations');
        return;
      }

      const d: Destination = {
        id: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36),
        name: name.trim(),
        region: region.trim(),
        country: 'India',
        lat: la,
        lon: lo,
        emoji: emoji.trim() || '📍',
        imageUrl: imageUrl.trim(),
        colors: PALETTE[destinations.length % PALETTE.length],
        rating: 4.8,
        tags,
        bestSeason: 'Oct - Mar',
        avgDailyCost: c,
        description: desc.trim() || `${name.trim()} is a top attraction in ${region.trim()}.`,
        highlights,
        climate: 'Warm',
      };
      await addDestination(d);
      clearForm();
      setActiveTab('destinations');
      refresh();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to save destination');
    } finally {
      setSaving(false);
    }
  };

  const confirmAction = (title: string, onYes: () => void) => {
    if (Platform.OS === 'web') return onYes();
    Alert.alert(title, 'This action will take effect immediately.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', style: 'destructive', onPress: onYes },
    ]);
  };

  // Filtered Catalog
  const filteredDestinations = useMemo(() => {
    return allDestinations.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.region.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (tagFilter === 'All') return true;
      if (tagFilter === 'Hidden') return hiddenIds.includes(d.id) || d.hidden;
      if (tagFilter === 'Custom') return customIds.includes(d.id);
      return d.tags.includes(tagFilter);
    });
  }, [allDestinations, searchQuery, tagFilter, hiddenIds, customIds]);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Admin Console</Text>
          <View style={styles.statusPill}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: backendStatus === 'Online' ? '#10B981' : '#F59E0B' },
              ]}
            />
            <Text style={styles.statusPillText}>
              Cloud Backend {pingLatency ? `(${pingLatency}ms)` : 'Active'}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={checkHealth}
          disabled={pinging}
          style={({ pressed }) => [styles.pingBtn, pressed && { opacity: 0.7 }]}
        >
          {pinging ? (
            <ActivityIndicator size="small" color="#0C7A86" />
          ) : (
            <Ionicons name="refresh-outline" size={18} color="#0C7A86" />
          )}
        </Pressable>
      </View>

      {/* iOS Segmented Navigation Bar */}
      <View style={styles.segmentedContainer}>
        <Pressable
          onPress={() => setActiveTab('dashboard')}
          style={[styles.segmentBtn, activeTab === 'dashboard' && styles.segmentBtnActive]}
        >
          <Ionicons
            name={activeTab === 'dashboard' ? 'grid' : 'grid-outline'}
            size={16}
            color={activeTab === 'dashboard' ? '#0C7A86' : '#64748B'}
          />
          <Text
            style={[styles.segmentText, activeTab === 'dashboard' && styles.segmentTextActive]}
          >
            Dashboard
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('destinations')}
          style={[styles.segmentBtn, activeTab === 'destinations' && styles.segmentBtnActive]}
        >
          <Ionicons
            name={activeTab === 'destinations' ? 'map' : 'map-outline'}
            size={16}
            color={activeTab === 'destinations' ? '#0C7A86' : '#64748B'}
          />
          <Text
            style={[styles.segmentText, activeTab === 'destinations' && styles.segmentTextActive]}
          >
            Destinations ({destinations.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            if (activeTab !== 'form') clearForm();
            setActiveTab('form');
          }}
          style={[styles.segmentBtn, activeTab === 'form' && styles.segmentBtnActive]}
        >
          <Ionicons
            name={editId ? 'create' : activeTab === 'form' ? 'add-circle' : 'add-circle-outline'}
            size={16}
            color={activeTab === 'form' ? '#0C7A86' : '#64748B'}
          />
          <Text style={[styles.segmentText, activeTab === 'form' && styles.segmentTextActive]}>
            {editId ? 'Edit' : '+ Add New'}
          </Text>
        </Pressable>
      </View>

      {/* Main Tab Views */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <View style={styles.tabSection}>
            {/* Admin Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>SP</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.profileName}>Shraddha Pethkar</Text>
                <Text style={styles.profileRole}>Super Administrator · TripGenie AI</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </View>
            </View>

            {/* Metric Tiles Grid */}
            <Text style={styles.sectionHeader}>Platform Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <View style={[styles.metricIconWrap, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="location" size={20} color="#0284C7" />
                </View>
                <Text style={styles.metricValue}>{destinations.length}</Text>
                <Text style={styles.metricLabel}>Live Places</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={[styles.metricIconWrap, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="eye-off" size={20} color="#D97706" />
                </View>
                <Text style={styles.metricValue}>{hiddenCount}</Text>
                <Text style={styles.metricLabel}>Hidden</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={[styles.metricIconWrap, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="airplane" size={20} color="#16A34A" />
                </View>
                <Text style={styles.metricValue}>{serverStats?.trips ?? trips.length}</Text>
                <Text style={styles.metricLabel}>Trips Created</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={[styles.metricIconWrap, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="heart" size={20} color="#DC2626" />
                </View>
                <Text style={styles.metricValue}>{serverStats?.favorites ?? favorites.length}</Text>
                <Text style={styles.metricLabel}>Favorites</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={[styles.metricIconWrap, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="chatbubble-ellipses" size={20} color="#9333EA" />
                </View>
                <Text style={styles.metricValue}>{serverStats?.reviews ?? reviews.length}</Text>
                <Text style={styles.metricLabel}>Reviews</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={[styles.metricIconWrap, { backgroundColor: '#CCFBF1' }]}>
                  <Ionicons name="people" size={20} color="#0D9488" />
                </View>
                <Text style={styles.metricValue}>{serverStats?.users ?? 2}</Text>
                <Text style={styles.metricLabel}>Accounts</Text>
              </View>
            </View>

            {/* Cloud Infrastructure Card */}
            <Text style={styles.sectionHeader}>Production Infrastructure</Text>
            <View style={styles.infraCard}>
              <View style={styles.infraRow}>
                <Ionicons name="cloud-done-outline" size={18} color="#0C7A86" />
                <Text style={styles.infraKey}>Host:</Text>
                <Text style={styles.infraVal} numberOfLines={1}>
                  blanchedalmond-wildcat-125853.hostingersite.com
                </Text>
              </View>

              <View style={styles.infraRow}>
                <Ionicons name="sparkles-outline" size={18} color="#8B5CF6" />
                <Text style={styles.infraKey}>AI Engine:</Text>
                <Text style={styles.infraVal}>Google Gemini 2.5 Flash</Text>
              </View>

              <View style={styles.infraRow}>
                <Ionicons name="server-outline" size={18} color="#10B981" />
                <Text style={styles.infraKey}>Storage Mode:</Text>
                <Text style={styles.infraVal}>Cloud Memory Fallback / Live Seeded</Text>
              </View>
            </View>

            {/* Management Quick Actions */}
            <Text style={styles.sectionHeader}>Maintenance</Text>
            <View style={styles.actionRow}>
              <Pressable
                onPress={() => setActiveTab('destinations')}
                style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.8 }]}
              >
                <Ionicons name="list" size={18} color="#0C7A86" />
                <Text style={styles.actionButtonText}>Manage Catalog</Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  confirmAction('Reset entire catalog to 50 defaults and unhide all?', resetCatalog)
                }
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.actionButtonDanger,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Ionicons name="refresh" size={18} color="#EF4444" />
                <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Reset Defaults</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* TAB 2: DESTINATIONS CATALOG MANAGER */}
        {activeTab === 'destinations' && (
          <View style={styles.tabSection}>
            {/* Search Input Bar */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#94A3B8" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by name, region or state..."
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
              />
              {searchQuery ? (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </Pressable>
              ) : null}
            </View>

            {/* Category Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {['All', 'Custom', 'Hidden', 'Beaches', 'Mountains', 'Heritage', 'Culture'].map((chip) => (
                <Pressable
                  key={chip}
                  onPress={() => setTagFilter(chip)}
                  style={[styles.filterChip, tagFilter === chip && styles.filterChipActive]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      tagFilter === chip && styles.filterChipTextActive,
                    ]}
                  >
                    {chip}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.listHeaderRow}>
              <Text style={styles.listHeaderCount}>
                Showing {filteredDestinations.length} places
              </Text>
              <Pressable
                onPress={() => {
                  clearForm();
                  setActiveTab('form');
                }}
                style={styles.headerAddBtn}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.headerAddBtnText}>Add Place</Text>
              </Pressable>
            </View>

            {/* Destination Items List */}
            {filteredDestinations.map((d) => {
              const isHidden = hiddenIds.includes(d.id) || d.hidden;
              const isCustom = customIds.includes(d.id);

              return (
                <View key={d.id} style={styles.destinationCard}>
                  {d.imageUrl ? (
                    <Image source={{ uri: d.imageUrl }} style={styles.destinationImage} />
                  ) : (
                    <View style={styles.destinationEmojiBox}>
                      <Text style={{ fontSize: 28 }}>{d.emoji || '📍'}</Text>
                    </View>
                  )}

                  <View style={styles.destinationDetails}>
                    <View style={styles.destinationTitleRow}>
                      <Text style={styles.destinationName}>{d.name}</Text>
                      {isHidden ? (
                        <View style={[styles.badgePill, { backgroundColor: '#FEE2E2' }]}>
                          <Text style={[styles.badgeText, { color: '#DC2626' }]}>Hidden</Text>
                        </View>
                      ) : (
                        <View style={[styles.badgePill, { backgroundColor: '#DCFCE7' }]}>
                          <Text style={[styles.badgeText, { color: '#16A34A' }]}>Active</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.destinationRegion}>
                      {d.region} · ₹{d.avgDailyCost}/day
                    </Text>

                    <View style={styles.tagsRow}>
                      {(d.tags || []).slice(0, 3).map((t) => (
                        <View key={t} style={styles.tagItem}>
                          <Text style={styles.tagItemText}>{t}</Text>
                        </View>
                      ))}
                      {isCustom ? (
                        <View style={[styles.tagItem, { backgroundColor: '#EDE9FE' }]}>
                          <Text style={[styles.tagItemText, { color: '#7C3AED' }]}>Custom</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Actions */}
                    <View style={styles.cardActionsRow}>
                      <Pressable onPress={() => startEdit(d)} style={styles.actionPill}>
                        <Ionicons name="create-outline" size={14} color="#0C7A86" />
                        <Text style={styles.actionPillText}>Edit</Text>
                      </Pressable>

                      {isHidden ? (
                        <Pressable
                          onPress={() => unhideDestination(d.id)}
                          style={[styles.actionPill, { backgroundColor: '#DCFCE7' }]}
                        >
                          <Ionicons name="eye-outline" size={14} color="#16A34A" />
                          <Text style={[styles.actionPillText, { color: '#16A34A' }]}>Unhide</Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          onPress={() =>
                            confirmAction(`Hide ${d.name} from travelers?`, () =>
                              removeDestination(d.id)
                            )
                          }
                          style={[styles.actionPill, { backgroundColor: '#F1F5F9' }]}
                        >
                          <Ionicons name="eye-off-outline" size={14} color="#64748B" />
                          <Text style={[styles.actionPillText, { color: '#64748B' }]}>Hide</Text>
                        </Pressable>
                      )}

                      {isCustom && (
                        <Pressable
                          onPress={() =>
                            confirmAction(`Permanently delete custom place ${d.name}?`, () =>
                              removeDestination(d.id)
                            )
                          }
                          style={[styles.actionPill, { backgroundColor: '#FEE2E2' }]}
                        >
                          <Ionicons name="trash-outline" size={14} color="#DC2626" />
                          <Text style={[styles.actionPillText, { color: '#DC2626' }]}>Delete</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 3: ADD / EDIT DESTINATION FORM */}
        {activeTab === 'form' && (
          <View style={styles.tabSection}>
            <View style={styles.formHeaderRow}>
              <Text style={styles.formTitle}>
                {editId ? `Editing: ${name || 'Place'}` : 'Create New Destination'}
              </Text>
              {editId && (
                <Pressable onPress={clearForm} style={styles.cancelEditBtn}>
                  <Text style={styles.cancelEditBtnText}>Cancel Edit</Text>
                </Pressable>
              )}
            </View>

            {formError ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            ) : null}

            <View style={styles.formCard}>
              <Text style={styles.fieldLabel}>Destination Name *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Udaipur, Alleppey, Spiti"
                placeholderTextColor="#94A3B8"
                style={styles.fieldInput}
              />

              <Text style={styles.fieldLabel}>State or Region *</Text>
              <TextInput
                value={region}
                onChangeText={setRegion}
                placeholder="e.g. Rajasthan, Kerala, Himachal"
                placeholderTextColor="#94A3B8"
                style={styles.fieldInput}
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Emoji Icon</Text>
                  <TextInput
                    value={emoji}
                    onChangeText={setEmoji}
                    maxLength={4}
                    style={[styles.fieldInput, { textAlign: 'center', fontSize: 20 }]}
                  />
                </View>
                <View style={{ flex: 2 }}>
                  <Text style={styles.fieldLabel}>Avg Daily Cost (₹) *</Text>
                  <TextInput
                    value={cost}
                    onChangeText={setCost}
                    keyboardType="number-pad"
                    placeholder="3500"
                    placeholderTextColor="#94A3B8"
                    style={styles.fieldInput}
                  />
                </View>
              </View>

              {/* Quick Emoji suggestions */}
              <View style={styles.emojiSuggestionsRow}>
                {EMOJI_SUGGESTIONS.map((em) => (
                  <Pressable
                    key={em}
                    onPress={() => setEmoji(em)}
                    style={[
                      styles.emojiPill,
                      emoji === em && { borderColor: colors.primary, backgroundColor: '#E0F2FE' },
                    ]}
                  >
                    <Text style={{ fontSize: 16 }}>{em}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Top Sightseeing Places (comma-separated) *</Text>
              <TextInput
                value={places}
                onChangeText={setPlaces}
                placeholder="e.g. City Palace, Lake Pichola, Bagore Ki Haveli"
                placeholderTextColor="#94A3B8"
                style={styles.fieldInput}
              />

              <Text style={styles.fieldLabel}>Photo Image</Text>
              {imageUrl ? (
                <View style={styles.photoPreviewCard}>
                  <Image source={{ uri: imageUrl }} style={styles.photoPreviewImage} />
                  <View style={styles.photoPreviewActions}>
                    <Pressable onPress={pickPhoto} style={styles.photoActionBtn}>
                      <Text style={styles.photoActionBtnText}>Change Photo</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setImageUrl('')}
                      style={[styles.photoActionBtn, { backgroundColor: '#FEE2E2' }]}
                    >
                      <Text style={[styles.photoActionBtnText, { color: '#DC2626' }]}>Remove</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={{ gap: 8, marginBottom: 12 }}>
                  <Pressable
                    onPress={pickPhoto}
                    disabled={pickingPhoto}
                    style={styles.uploadPhotoBtn}
                  >
                    <Ionicons name="camera-outline" size={18} color="#0C7A86" />
                    <Text style={styles.uploadPhotoBtnText}>
                      {pickingPhoto ? 'Loading...' : 'Upload from Device Gallery'}
                    </Text>
                  </Pressable>
                  <TextInput
                    value={imageUrl}
                    onChangeText={setImageUrl}
                    placeholder="Or paste an image URL (https://...)"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    style={[styles.fieldInput, { fontSize: 13 }]}
                  />
                </View>
              )}

              <Text style={styles.fieldLabel}>Short Description</Text>
              <TextInput
                value={desc}
                onChangeText={setDesc}
                multiline
                numberOfLines={3}
                placeholder="Highlight unique travel experience, best sights..."
                placeholderTextColor="#94A3B8"
                style={[styles.fieldInput, { minHeight: 70, textAlignVertical: 'top' }]}
              />

              <Text style={styles.fieldLabel}>Categories & Tags *</Text>
              <View style={styles.tagsContainer}>
                {INTERESTS.map((t) => {
                  const sel = tags.includes(t);
                  return (
                    <Pressable
                      key={t}
                      onPress={() => toggleTag(t)}
                      style={[styles.tagSelectChip, sel && styles.tagSelectChipActive]}
                    >
                      <Text
                        style={[
                          styles.tagSelectChipText,
                          sel && styles.tagSelectChipTextActive,
                        ]}
                      >
                        {t}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.formBtnRow}>
                <Pressable
                  onPress={saveDestination}
                  disabled={saving}
                  style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.85 }]}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons
                        name={editId ? 'checkmark-circle' : 'add-circle'}
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.submitBtnText}>
                        {editId ? 'Save Changes' : 'Add to Catalog'}
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  statusPillText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  pingBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedContainer: {
    flexDirection: 'row',
    padding: 6,
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    ...shadowSoft,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#0C7A86',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  tabSection: {
    marginTop: 6,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0C7A86',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  profileRole: {
    fontSize: 12,
    color: '#0C7A86',
    fontWeight: '600',
    marginTop: 2,
  },
  profileEmail: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    width: '31%',
    flexGrow: 1,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  infraCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    marginBottom: 16,
  },
  infraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infraKey: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  infraVal: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    gap: 8,
  },
  actionButtonDanger: {
    backgroundColor: '#FEE2E2',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0C7A86',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  filterScroll: {
    marginTop: 10,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#0C7A86',
    borderColor: '#0C7A86',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  listHeaderCount: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C7A86',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  headerAddBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  destinationCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    gap: 12,
  },
  destinationImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  destinationEmojiBox: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationDetails: {
    flex: 1,
  },
  destinationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  destinationName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  destinationRegion: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  tagItem: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagItemText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#E0F2FE',
    gap: 4,
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0C7A86',
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  cancelEditBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  cancelEditBtnText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  formCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  fieldInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  emojiSuggestionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  emojiPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  photoPreviewCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  photoPreviewImage: {
    width: '100%',
    height: 160,
  },
  photoPreviewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  photoActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#E0F2FE',
  },
  photoActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0C7A86',
  },
  uploadPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0C7A86',
    borderStyle: 'dashed',
    backgroundColor: '#F0FDFA',
    gap: 8,
  },
  uploadPhotoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0C7A86',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  tagSelectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagSelectChipActive: {
    backgroundColor: '#0C7A86',
    borderColor: '#0C7A86',
  },
  tagSelectChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  tagSelectChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  formBtnRow: {
    marginTop: 10,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0C7A86',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
