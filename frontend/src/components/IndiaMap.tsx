import { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, radius } from '../theme';
import { Destination } from '../types';

type Props = {
  destinations: Destination[];
  selectedId?: string;
  onSelect: (id: string) => void;
  height?: number;
};

function buildHtml(destinations: Destination[], selectedId?: string) {
  const markers = destinations.map((d) => ({
    id: d.id,
    name: d.name,
    emoji: d.emoji,
    lat: d.lat,
    lon: d.lon,
  }));
  const payload = JSON.stringify({ markers, selectedId: selectedId || markers[0]?.id || '' });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin: 0; height: 100%; width: 100%; background: #e8f2f4; }
    .pin {
      background: #0C7A86;
      color: #fff;
      border: 2px solid #fff;
      border-radius: 999px;
      width: 30px; height: 30px;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px;
      box-shadow: 0 4px 10px rgba(11,37,48,0.25);
    }
    .pin.active {
      background: #F06A4A;
      width: 36px; height: 36px;
      font-size: 16px;
      box-shadow: 0 6px 14px rgba(240,106,74,0.35);
    }
    .leaflet-tooltip.tg-tip {
      background: #0F2430; color: #fff; border: none; border-radius: 8px;
      padding: 4px 8px; font-weight: 700; font-size: 11px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .leaflet-tooltip.tg-tip::before { border-top-color: #0F2430; }
    .leaflet-control-attribution { font-size: 9px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const DATA = ${payload};
    const map = L.map('map', { zoomControl: true, attributionControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);

    function icon(active, emoji) {
      return L.divIcon({
        className: '',
        html: '<div class="pin' + (active ? ' active' : '') + '">' + (emoji || '📍') + '</div>',
        iconSize: active ? [36, 36] : [30, 30],
        iconAnchor: active ? [18, 18] : [15, 15],
      });
    }

    function post(id) {
      const msg = JSON.stringify({ type: 'select', id: id });
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(msg);
      } else if (window.parent && window.parent !== window) {
        window.parent.postMessage(msg, '*');
      }
    }

    function render(selectedId) {
      layer.clearLayers();
      DATA.markers.forEach(function (m) {
        const active = m.id === selectedId;
        const mk = L.marker([m.lat, m.lon], { icon: icon(active, m.emoji) })
          .addTo(layer)
          .bindTooltip(m.name, { permanent: active, direction: 'top', offset: [0, -14], className: 'tg-tip' });
        mk.on('click', function () { post(m.id); });
      });
      const sel = DATA.markers.find(function (m) { return m.id === selectedId; }) || DATA.markers[0];
      if (sel) {
        map.setView([sel.lat, sel.lon], selectedId ? 7 : 4.5, { animate: true });
      } else {
        map.setView([22.5, 79], 4.3);
      }
      setTimeout(function () { map.invalidateSize(); }, 120);
    }

    render(DATA.selectedId);

    function applySelection(id) {
      DATA.selectedId = id;
      render(id);
    }

    function onHostMessage(raw) {
      try {
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (data && data.type === 'select' && data.id) applySelection(data.id);
      } catch (err) {}
    }

    document.addEventListener('message', function (e) { onHostMessage(e.data); });
    window.addEventListener('message', function (e) { onHostMessage(e.data); });
  </script>
</body>
</html>`;
}

export function IndiaMap({ destinations, selectedId, onSelect, height = 340 }: Props) {
  const webRef = useRef<WebView>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const html = useMemo(() => buildHtml(destinations, selectedId), [destinations]);

  const pushSelection = (id?: string) => {
    if (!id) return;
    const msg = JSON.stringify({ type: 'select', id });
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(msg, '*');
    } else {
      webRef.current?.postMessage(msg);
    }
  };

  useEffect(() => {
    pushSelection(selectedId);
  }, [selectedId]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (ev: MessageEvent) => {
      if (typeof ev.data === 'string') {
        try {
          const data = JSON.parse(ev.data);
          if (data?.type === 'select' && data.id) onSelect(String(data.id));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onSelect]);

  const onMessage = (raw: string) => {
    try {
      const data = JSON.parse(raw);
      if (data?.type === 'select' && data.id) onSelect(String(data.id));
    } catch {
      // ignore
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.wrap, { height }]}>
        <iframe
          ref={iframeRef}
          title="India map"
          srcDoc={html}
          style={{ border: 'none', width: '100%', height: '100%' }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { height }]}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.web}
        onMessage={(e) => onMessage(e.nativeEvent.data)}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        mixedContentMode="always"
        nestedScrollEnabled
        onLoadEnd={() => pushSelection(selectedId)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primarySoft,
  },
  web: { flex: 1, backgroundColor: 'transparent' },
});
