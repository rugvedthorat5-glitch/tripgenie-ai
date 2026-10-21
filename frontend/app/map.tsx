import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Platform, ScrollView, Text, View } from 'react-native';
import { IndiaMap } from '../src/components/IndiaMap';
import { Button, Card, Chip } from '../src/components/UI';
import { useDestinations } from '../src/context/DestinationsContext';
import { colors, spacing } from '../src/theme';

const open = (url: string) => Linking.openURL(url).catch(() => undefined);

export default function MapScreen() {
  const params = useLocalSearchParams<{ destinationId?: string }>();
  const { destinations } = useDestinations();
  const [id, setId] = useState(params.destinationId ?? destinations[0]?.id);
  const dest = destinations.find((d) => d.id === id);
  const [locNote, setLocNote] = useState('');
  const [myLoc, setMyLoc] = useState<{ lat: number; lon: number } | null>(null);
  const [asking, setAsking] = useState(false);

  const q = dest ? `${dest.lat},${dest.lon}` : '';

  const requestLocation = async () => {
    setAsking(true);
    setLocNote('');
    try {
      // Optional permission — app works fully without it.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Location = require('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocNote('Location permission denied. You can still use Google Maps links without sharing your location.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setMyLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      setLocNote('Location ready — use “Directions from me” below.');
    } catch {
      setLocNote(
        Platform.OS === 'web'
          ? 'Live location is limited on web. Use Google Maps directions with a typed start point.'
          : 'Could not read location. You can still open Google Maps without granting permission.'
      );
    } finally {
      setAsking(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }} style={{ backgroundColor: colors.bg }}>
      <Text style={{ color: colors.muted, marginBottom: spacing.md, lineHeight: 21, fontSize: 14 }}>
        Real OpenStreetMap of India with destination pins. Pinch to zoom, tap a pin, then open Google Maps for navigation and nearby places.
      </Text>

      <IndiaMap destinations={destinations} selectedId={id} onSelect={setId} height={360} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: spacing.md }}>
        {destinations.map((d) => (
          <Chip key={d.id} label={`${d.emoji} ${d.name}`} selected={id === d.id} onPress={() => setId(d.id)} />
        ))}
      </ScrollView>

      <Button title={asking ? 'Requesting…' : 'Use my location (optional)'} variant="outline" onPress={requestLocation} loading={asking} />
      {locNote ? <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 20 }}>{locNote}</Text> : null}

      {dest ? (
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
            {dest.emoji} {dest.name}
          </Text>
          <Text style={{ color: colors.muted, marginTop: 2 }}>
            {dest.region} · {dest.lat.toFixed(3)}, {dest.lon.toFixed(3)}
          </Text>
          <View style={{ gap: 10, marginTop: spacing.lg }}>
            <Button title="Open in Google Maps" onPress={() => open(`https://www.google.com/maps/search/?api=1&query=${q}`)} />
            <Button title="Get directions" variant="outline" onPress={() => open(`https://www.google.com/maps/dir/?api=1&destination=${q}`)} />
            {myLoc ? (
              <Button
                title="Directions from me"
                variant="outline"
                onPress={() =>
                  open(`https://www.google.com/maps/dir/?api=1&origin=${myLoc.lat},${myLoc.lon}&destination=${q}`)
                }
              />
            ) : null}
          </View>
          <Text style={{ fontWeight: '800', color: colors.text, marginTop: spacing.lg, marginBottom: 8 }}>Nearby</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {[
              ['🍽️ Restaurants', 'restaurants'],
              ['🏨 Hotels', 'hotels'],
              ['🎡 Attractions', 'tourist attractions'],
              ['🏥 Hospitals', 'hospital'],
              ['🏧 ATMs', 'atm'],
            ].map(([label, term]) => (
              <Chip key={term} label={label} onPress={() => open(`https://www.google.com/maps/search/${encodeURIComponent(term)}+near+${q}`)} />
            ))}
          </View>
        </Card>
      ) : null}
    </ScrollView>
  );
}
