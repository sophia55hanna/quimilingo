import type { SoundName } from '../types/chemistry';

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
  }
  if (audioContext.state === 'suspended') {
    void audioContext.resume();
  }
  return audioContext;
}

function tone(
  ctx: AudioContext,
  frequency: number,
  startOffset: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.14,
): void {
  const start = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

const patterns: Record<SoundName, (ctx: AudioContext) => void> = {
  correct: (ctx) => {
    tone(ctx, 659.25, 0, 0.12, 'sine');
    tone(ctx, 987.77, 0.09, 0.22, 'sine');
  },
  wrong: (ctx) => {
    tone(ctx, 233.08, 0, 0.16, 'square', 0.06);
    tone(ctx, 174.61, 0.14, 0.28, 'square', 0.06);
  },
  complete: (ctx) => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(ctx, f, i * 0.11, 0.25, 'triangle', 0.12));
    tone(ctx, 1318.51, 0.5, 0.45, 'sine', 0.1);
  },
  click: (ctx) => tone(ctx, 440, 0, 0.05, 'triangle', 0.05),
  match: (ctx) => tone(ctx, 880, 0, 0.09, 'sine', 0.08),
};

export function playSound(name: SoundName): void {
  try {
    const ctx = getContext();
    if (ctx) patterns[name](ctx);
  } catch {
    // Áudio é um recurso opcional: falhas (ex.: política de autoplay) são ignoradas.
  }
}
