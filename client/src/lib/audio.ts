import { loadSettings } from "./settings";

// Tiny WebAudio synth — no asset files, generates SFX procedurally so the bundle
// stays small. Each cue is a short envelope on top of one or two oscillators.

export type SfxId =
  | "food-eat"
  | "kill"
  | "death"
  | "boost-start"
  | "ui-click"
  | "achievement";

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let lastPlayedAt = new Map<SfxId, number>();

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
    masterGain = ctx.createGain();
    masterGain.gain.value = readVolume();
    masterGain.connect(ctx.destination);
    window.addEventListener("slithera-settings-change", () => {
      if (masterGain) masterGain.gain.value = readVolume();
    });
  } catch {
    return null;
  }
  return ctx;
}

function readVolume(): number {
  const s = loadSettings();
  return Math.max(0, Math.min(1, s.masterVolume / 100)) * 0.5; // overall ceiling
}

function shouldThrottle(id: SfxId, ms: number): boolean {
  const now = performance.now();
  const last = lastPlayedAt.get(id) ?? 0;
  if (now - last < ms) return true;
  lastPlayedAt.set(id, now);
  return false;
}

function playTone(opts: {
  freq: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  glide?: number;     // detune target
  attack?: number;
}): void {
  const c = ensureContext();
  if (!c || !masterGain) return;
  if (c.state === "suspended") void c.resume();
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, now);
  if (typeof opts.glide === "number") {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.glide), now + opts.duration);
  }
  const attack = opts.attack ?? 0.005;
  const release = opts.duration - attack;
  const peak = (opts.volume ?? 0.3);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peak, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + Math.max(0.02, release));
  osc.connect(gain).connect(masterGain);
  osc.start(now);
  osc.stop(now + opts.duration + 0.05);
}

function playNoise(duration: number, volume = 0.2, filterFreq = 1200): void {
  const c = ensureContext();
  if (!c || !masterGain) return;
  if (c.state === "suspended") void c.resume();
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * duration), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = filterFreq;
  const gain = c.createGain();
  const now = c.currentTime;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  src.connect(filter).connect(gain).connect(masterGain);
  src.start(now);
}

export function playSfx(id: SfxId): void {
  switch (id) {
    case "food-eat":
      if (shouldThrottle(id, 35)) return;
      playTone({ freq: 880, duration: 0.07, type: "triangle", volume: 0.18, glide: 1320 });
      break;
    case "kill":
      playTone({ freq: 220, duration: 0.18, type: "sawtooth", volume: 0.32, glide: 90 });
      playNoise(0.12, 0.18, 600);
      break;
    case "death":
      playTone({ freq: 380, duration: 0.45, type: "sawtooth", volume: 0.4, glide: 60 });
      playNoise(0.3, 0.22, 320);
      break;
    case "boost-start":
      if (shouldThrottle(id, 200)) return;
      playTone({ freq: 320, duration: 0.12, type: "sine", volume: 0.18, glide: 720, attack: 0.01 });
      break;
    case "ui-click":
      if (shouldThrottle(id, 60)) return;
      playTone({ freq: 1200, duration: 0.04, type: "square", volume: 0.08 });
      break;
    case "achievement":
      playTone({ freq: 660, duration: 0.16, type: "triangle", volume: 0.22, glide: 990 });
      window.setTimeout(() => playTone({ freq: 990, duration: 0.22, type: "triangle", volume: 0.22, glide: 1320 }), 110);
      break;
  }
}

// Activate audio on the first user gesture (browsers gate WebAudio behind user input)
export function unlockAudioOnFirstGesture(): void {
  if (typeof window === "undefined") return;
  const unlock = () => {
    const c = ensureContext();
    if (c && c.state === "suspended") void c.resume();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}
