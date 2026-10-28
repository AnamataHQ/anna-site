import { Check } from 'lucide-react';
import Image from 'next/image';

// Anna, one mark everywhere: the gradient mark on a paper disc. Three sizes
// (a 32 px avatar beside her messages, a section opener, the connector hub,
// which takes its size from the knot) and three states: idle, working (the
// typing dots) and done (the coral check). Always decorative.

export type AnnaMarkSize = 'avatar' | 'opener' | 'hub';
export type AnnaMarkState = 'idle' | 'working' | 'done';

const PIXELS: Record<AnnaMarkSize, number> = {
  avatar: 32,
  opener: 60,
  hub: 64,
};

export function AnnaMark({
  size,
  state = 'idle',
}: {
  size: AnnaMarkSize;
  state?: AnnaMarkState;
}) {
  return (
    <span
      className="anna-mark"
      data-size={size}
      data-state={state}
      aria-hidden="true"
    >
      <Image
        src="/brands/anna-color-transparent.svg"
        alt=""
        width={PIXELS[size]}
        height={PIXELS[size]}
      />
      {state === 'working' && (
        <span className="anna-mark-working">
          <span className="typing-dots">
            <i />
            <i />
            <i />
          </span>
        </span>
      )}
      {state === 'done' && (
        <span className="anna-mark-check">
          <Check strokeWidth={3.2} />
        </span>
      )}
    </span>
  );
}
