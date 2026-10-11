import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { Button, Card, Chip } from '../src/components/UI';
import { useDestinations } from '../src/context/DestinationsContext';
import { colors, radius, spacing } from '../src/theme';

// Rough bounding box of India used to place pins on the locator map.
const LAT_MIN = 6;
const LAT_MAX = 37;
const LON_MIN = 67;
const LON_MAX = 98;

const open = (url: string) => Linking.openURL(url).catch(() => undefined);

export default function MapScreen() {
  const params = useLocalSearchParams<{ destinationId?: string }>();
  const { destinations } = useDestinations();
  const [id, setId] = useState(params.destinationId ?? destinations[0]?.id);
  const dest = destinations.find((d) => d.id === id);
  const [box, setBox] = useState({ w: 0, h: 0 });

  const q = dest ? `${dest.lat},${dest.lon}` : '';

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      <Text style={{ color: colors.muted, marginBottom: spacing.md }}>
        Tap a pin to select a place, then open it in Google Maps for live directions.
      </Text>

      <View
        onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        style={{ height: 320, backgroundColor: '#DDEFF1', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}
      >
        <Text style={{ position: 'absolute', right: 12, bottom: 8, color: colors.muted, fontSize: 11 }}>India locator (not to scale)</Text>
        {box.w > 0
          ? destinations.map((d) => {
              const x = ((d.lon - LON_MIN) / (LON_MAX - LON_MIN)) * box.w;
              const y = (1 - (d.lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * box.h;
              const active = d.id === id;
              return (
                <Pressable
                  key={d.id}
                  onPress={() => setId(d.id)}
                  style={{ position: 'absolute', left: x - 16, top: y - 16, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', zIndex: active ? 2 : 1 }}
                >
                  <View
                    style={{
                      width: active ? 22 : 14,
                      height: active ? 22 : 14,
                      borderRadius: 11,
                      backgroundColor: active ? colors.accent : colors.primary,
                      borderWidth: 2,
                      borderColor: '#fff',
                    }}
                  />
                  {active ? (
                    <Text style={{ position: 'absolute', top: -14, width: 110, textAlign: 'center', fontSize: 11, fontWeight: '800', color: colors.text }}>
                      {d.name}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })
          : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: spacing.md }}>
        {destinations.map((d) => (
          <Chip key={d.id} label={`${d.emoji} ${d.name}`} selected={id === d.id} onPress={() => setId(d.id)} />
        ))}
      </ScrollView>

      {dest ? (
        <Card>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
            {dest.emoji} {dest.name}
          </Text>
          <Text style={{ color: colors.muted, marginTop: 2 }}>
            {dest.region} · {dest.lat.toFixed(3)}, {dest.lon.toFixed(3)}
          </Text>
          <View style={{ gap: 10, marginTop: spacing.lg }}>
            <Button title="Open in Google Maps" onPress={() => open(`https://www.google.com/maps/search/?api=1&query=${q}`)} />
            <Button title="Get directions" variant="outline" onPress={() => open(`https://www.google.com/maps/dir/?api=1&destination=${q}`)} />
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
