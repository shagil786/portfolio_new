"use client";

/**
 * Lightweight Web Audio synth so the project ships with zero audio assets.
 * Every cue is generated on the fly. Respects the global mute flag passed in.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

type Tone = { freq: number; dur: number; type?: OscillatorType; gain?: number };

function play(tones: Tone[]) {
  const audio = getCtx();
  if (!audio) return;
  let t = audio.currentTime;
  tones.forEach(({ freq, dur, type = "square", gain = 0.04 }) => {
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(audio.destination);
    osc.start(t);
    osc.stop(t + dur);
    t += dur * 0.9;
  });
}

export const sfx = {
  blip: (muted: boolean) => !muted && play([{ freq: 660, dur: 0.06 }]),
  type: (muted: boolean) => !muted && play([{ freq: 1200, dur: 0.02, gain: 0.015 }]),
  unlock: (muted: boolean) =>
    !muted && play([
      { freq: 440, dur: 0.08 },
      { freq: 660, dur: 0.08 },
      { freq: 880, dur: 0.14 },
    ]),
  achievement: (muted: boolean) =>
    !muted && play([
      { freq: 523, dur: 0.1, type: "triangle" },
      { freq: 659, dur: 0.1, type: "triangle" },
      { freq: 784, dur: 0.1, type: "triangle" },
      { freq: 1046, dur: 0.2, type: "triangle" },
    ]),
  error: (muted: boolean) =>
    !muted && play([{ freq: 180, dur: 0.16, type: "sawtooth", gain: 0.05 }]),
  boot: (muted: boolean) =>
    !muted && play([
      { freq: 220, dur: 0.12, type: "sine" },
      { freq: 330, dur: 0.12, type: "sine" },
      { freq: 523, dur: 0.3, type: "sine" },
    ]),
};
