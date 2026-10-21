import { ReactNode } from 'react';
import { StyleProp, Text, TextStyle, View } from 'react-native';

type Props = {
  text: string;
  color?: string;
  style?: StyleProp<TextStyle>;
};

/** Renders light Markdown: **bold**, *italic*, `code`, lists, and line breaks. */
export function RichText({ text, color = '#102029', style }: Props) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');

  return (
    <View style={{ gap: 6 }}>
      {lines.map((raw, i) => {
        const line = raw.trimEnd();
        if (!line.trim()) return <View key={`b${i}`} style={{ height: 4 }} />;

        const bullet = /^[-*•]\s+/.test(line);
        const numbered = /^\d+[.)]\s+/.test(line);
        const content = bullet ? line.replace(/^[-*•]\s+/, '') : numbered ? line.replace(/^\d+[.)]\s+/, '') : line;
        const prefix = bullet ? '• ' : numbered ? `${line.match(/^\d+/)?.[0]}. ` : '';

        return (
          <Text key={`l${i}`} style={[{ color, lineHeight: 22, fontSize: 15 }, style]}>
            {prefix ? <Text style={{ fontWeight: '700', color }}>{prefix}</Text> : null}
            {renderInline(content, color)}
          </Text>
        );
      })}
    </View>
  );
}

function renderInline(input: string, color: string): ReactNode[] {
  // Match **bold**, *italic*, or `code` (non-greedy, no nested crosses)
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(input))) {
    if (match.index > last) {
      nodes.push(input.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(
        <Text key={`b${key++}`} style={{ fontWeight: '800', color }}>
          {token.slice(2, -2)}
        </Text>
      );
    } else if (token.startsWith('*')) {
      nodes.push(
        <Text key={`i${key++}`} style={{ fontStyle: 'italic', color }}>
          {token.slice(1, -1)}
        </Text>
      );
    } else {
      nodes.push(
        <Text key={`c${key++}`} style={{ fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.06)', color }}>
          {token.slice(1, -1)}
        </Text>
      );
    }
    last = match.index + token.length;
  }

  if (last < input.length) nodes.push(input.slice(last));
  return nodes;
}
