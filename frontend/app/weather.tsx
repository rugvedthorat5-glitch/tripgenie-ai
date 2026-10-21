import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Button, Card, Chip, SectionTitle } from '../src/components/UI';
import { useDestinations } from '../src/context/DestinationsContext';
import { advice, describe, fetchWeather, Weather } from '../src/services/weather';
import { colors, spacing } from '../src/theme';

const dayName = (iso: string, i: number) =>
  i === 0 ? 'Today' : new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' });

export default function WeatherScreen() {
  const params = useLocalSearchParams<{ destinationId?: string }>();
  const { destinations } = useDestinations();
  const [id, setId] = useState(params.destinationId ?? destinations[0]?.id);
  const [data, setData] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dest = destinations.find((d) => d.id === id);

  const load = useCallback(async () => {
    if (!dest) return;
    setLoading(true);
    setError('');
    try {
      setData(await fetchWeather(dest.lat, dest.lon));
    } catch {
      setData(null);
      setError('Could not load the forecast. Check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [dest]);

  useEffect(() => {
    load();
  }, [load]);

  const now = data ? describe(data.code) : null;

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
        {destinations.map((d) => (
          <Chip key={d.id} label={`${d.emoji} ${d.name}`} selected={id === d.id} onPress={() => setId(d.id)} />
        ))}
      </ScrollView>

      {loading ? <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xxl }} /> : null}

      {error ? (
        <Card>
          <Text style={{ color: colors.danger, marginBottom: spacing.md }}>{error}</Text>
          <Button title="Try again" onPress={load} />
        </Card>
      ) : null}

      {data && now && dest && !loading ? (
        <>
          <Card style={{ alignItems: 'center' }}>
            <Text style={{ color: colors.muted }}>{dest.name}, {dest.region}</Text>
            <Text style={{ fontSize: 64, marginTop: 4 }}>{now.emoji}</Text>
            <Text style={{ fontSize: 44, fontWeight: '800', color: colors.text }}>{Math.round(data.temp)}°C</Text>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{now.label}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 18, marginTop: spacing.lg }}>
              <View style={{ alignItems: 'center', minWidth: 70 }}>
                <Text style={{ color: colors.muted, fontSize: 12 }}>Feels like</Text>
                <Text style={{ fontWeight: '700', color: colors.text }}>{Math.round(data.feels)}°</Text>
              </View>
              <View style={{ alignItems: 'center', minWidth: 70 }}>
                <Text style={{ color: colors.muted, fontSize: 12 }}>Humidity</Text>
                <Text style={{ fontWeight: '700', color: colors.text }}>{Math.round(data.humidity)}%</Text>
              </View>
              <View style={{ alignItems: 'center', minWidth: 70 }}>
                <Text style={{ color: colors.muted, fontSize: 12 }}>Wind</Text>
                <Text style={{ fontWeight: '700', color: colors.text }}>{Math.round(data.wind)} km/h</Text>
              </View>
              <View style={{ alignItems: 'center', minWidth: 70 }}>
                <Text style={{ color: colors.muted, fontSize: 12 }}>Rain now</Text>
                <Text style={{ fontWeight: '700', color: colors.text }}>{data.rainMm.toFixed(1)} mm</Text>
              </View>
            </View>
          </Card>

          <Card style={{ marginTop: spacing.lg, backgroundColor: colors.chip }}>
            <Text style={{ fontWeight: '800', color: colors.primaryDark }}>Travel advice</Text>
            <Text style={{ color: colors.text, marginTop: 4, lineHeight: 21 }}>{advice(data)}</Text>
          </Card>

          <SectionTitle title="Next days" />
          <Card>
            {data.daily.map((d, i) => {
              const w = describe(d.code);
              return (
                <View
                  key={d.date}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}
                >
                  <Text style={{ width: 60, fontWeight: '700', color: colors.text }}>{dayName(d.date, i)}</Text>
                  <Text style={{ fontSize: 22, width: 36 }}>{w.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.muted }}>{w.label}</Text>
                    <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
                      Rain {d.rainMm.toFixed(1)} mm · {d.precipProb}% chance
                    </Text>
                  </View>
                  <Text style={{ fontWeight: '700', color: colors.text }}>
                    {Math.round(d.max)}° <Text style={{ color: colors.muted, fontWeight: '400' }}>/ {Math.round(d.min)}°</Text>
                  </Text>
                </View>
              );
            })}
          </Card>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: spacing.md }}>Forecast data: Open-Meteo.com</Text>
        </>
      ) : null}
    </ScrollView>
  );
}
