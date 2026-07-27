export const BUILT_IN_MUSIC = [
  { id: "energy", name: "Impulso comercial", bpm: 120, mood: "Enérgica", bass: 110 },
  { id: "celebration", name: "Celebración moderna", bpm: 128, mood: "Festiva", bass: 130.81 },
  { id: "elegant", name: "Marca elegante", bpm: 96, mood: "Suave", bass: 98 },
  { id: "summer", name: "Color y verano", bpm: 112, mood: "Alegre", bass: 146.83 },
  { id: "impact", name: "Oferta impacto", bpm: 132, mood: "Potente", bass: 82.41 },
  { id: "inspiring", name: "Historia inspiradora", bpm: 100, mood: "Emotiva", bass: 123.47 },
];

function writeString(view, offset, text) {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
}

export function createBuiltInMusic(preset, duration = 12) {
  const sampleRate = 22050;
  const length = Math.ceil(Math.max(1, duration) * sampleRate);
  const samples = new Float32Array(length);
  const beatDuration = 60 / preset.bpm;
  let randomSeed = preset.id.length * 913;

  const random = () => {
    randomSeed = (randomSeed * 16807) % 2147483647;
    return randomSeed / 2147483647;
  };

  for (let index = 0; index < length; index += 1) {
    const time = index / sampleRate;
    const beatPosition = (time % beatDuration) / beatDuration;
    const halfBeatPosition = (time % (beatDuration / 2)) / (beatDuration / 2);
    const beatIndex = Math.floor(time / beatDuration);
    const bassEnvelope = Math.exp(-beatPosition * 8);
    const kick = Math.sin(2 * Math.PI * (54 - beatPosition * 20) * time) *
      Math.exp(-beatPosition * 18) * 0.42;
    const bassFrequency = preset.bass * ([1, 1.25, 1.5, 1.25][beatIndex % 4]);
    const bass = Math.sin(2 * Math.PI * bassFrequency * time) *
      bassEnvelope * 0.22;
    const hatEnvelope = Math.exp(-halfBeatPosition * 32);
    const hat = (random() * 2 - 1) * hatEnvelope * 0.07;
    const padEnvelope = Math.min(1, beatPosition * 5) * 0.08;
    const pad =
      (Math.sin(2 * Math.PI * preset.bass * 2 * time) +
        Math.sin(2 * Math.PI * preset.bass * 2.5 * time) * 0.6) *
      padEnvelope;
    samples[index] = Math.max(-1, Math.min(1, kick + bass + hat + pad));
  }

  const buffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(buffer);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, length * 2, true);

  for (let index = 0; index < length; index += 1) {
    view.setInt16(44 + index * 2, samples[index] * 0x7fff, true);
  }

  const blob = new Blob([buffer], { type: "audio/wav" });
  return {
    url: URL.createObjectURL(blob),
    duration,
    fileName: `${preset.name}.wav`,
    bpm: preset.bpm,
    presetId: preset.id,
  };
}
