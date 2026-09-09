import { useEffect, useRef, useState } from 'react';
import { Text, TextProps } from 'react-native';

type Props = Omit<TextProps, 'children'> & {
  value: number;
  duration?: number;
  formatter?: (n: number) => string;
  // Skip the tween and just show the final value immediately (reduce-motion).
  disabled?: boolean;
};

// Animates a number from its previous value up (or down) to `value` on
// every change, via requestAnimationFrame — plain JS/state so it works
// identically on web and native without any extra native driver wiring.
export function CountUpText({ value, duration = 900, formatter, disabled, style, ...rest }: Props) {
  const [display, setDisplay] = useState(disabled ? value : 0);
  const fromRef = useRef(disabled ? value : 0);

  useEffect(() => {
    if (disabled) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }
    const from = fromRef.current;
    const to = value;
    let raf = 0;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const elapsed = t - start;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, disabled]);

  // A formatter gets the raw (unrounded) value so it can keep decimals
  // (e.g. `$${n.toFixed(2)}`) — only the no-formatter integer display path
  // rounds, since that one renders the number as-is.
  return (
    <Text style={style} {...rest}>
      {formatter ? formatter(display) : Math.round(display)}
    </Text>
  );
}
