export interface FaceFeature {
  vector: Float32Array;
  registeredAt: number;
  userName: string;
  role: string;
}

const GRID = 4;
const BINS = 2;
const VECTOR_DIM = GRID * GRID * BINS * BINS * BINS; // 4*4*8 = 128
const SIMILARITY_THRESHOLD = 0.65;
const STORAGE_KEY = 'bank_face_features';

export const loadStoredFeatures = (): Record<string, FaceFeature> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const out: Record<string, FaceFeature> = {};
    for (const k of Object.keys(parsed)) {
      out[k] = { ...parsed[k], vector: new Float32Array(parsed[k].vector) };
    }
    return out;
  } catch (e) {
    console.warn('[faceAuth] loadStoredFeatures failed', e);
    return {};
  }
};

const saveFeature = (key: string, feat: FaceFeature) => {
  try {
    const all = loadStoredFeatures();
    all[key] = {
      ...feat,
      vector: Array.from(feat.vector) as unknown as Float32Array,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.warn('[faceAuth] saveFeature failed', e);
  }
};

export const clearStoredFeatures = () => localStorage.removeItem(STORAGE_KEY);

const cosineSimilarity = (a: Float32Array, b: Float32Array): number => {
  let dot = 0,
    normA = 0,
    normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? -1 : dot / denom;
};

const isSkinTone = (r: number, g: number, b: number): boolean => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return r > 95 && g > 40 && b > 20 && max - min > 10 && Math.abs(r - g) > 10 && r >= g && r >= b;
};

export const extractFaceFeature = (source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): Float32Array => {
  const canvas = document.createElement('canvas');
  const W = 128;
  const H = 128;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  try {
    ctx.drawImage(source, 0, 0, W, H);
  } catch (e) {
    console.warn('[faceAuth] drawImage failed', e);
  }
  const imgData = ctx.getImageData(0, 0, W, H).data;

  const vector = new Float32Array(VECTOR_DIM);
  const cellW = Math.floor(W / GRID);
  const cellH = Math.floor(H / GRID);
  const dimsPerCell = BINS * BINS * BINS;
  let totalPixels = 0;
  let totalSkin = 0;
  let idx = 0;

  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      const histogram = new Float32Array(dimsPerCell);
      let cellSkin = 0;
      let cellTotal = 0;
      for (let y = gy * cellH; y < Math.min((gy + 1) * cellH, H); y++) {
        for (let x = gx * cellW; x < Math.min((gx + 1) * cellW, W); x++) {
          const pi = (y * W + x) * 4;
          const r = imgData[pi];
          const g = imgData[pi + 1];
          const b = imgData[pi + 2];
          cellTotal++;
          if (!isSkinTone(r, g, b)) continue;
          cellSkin++;
          const rb = Math.min(BINS - 1, Math.floor((r / 255) * BINS));
          const gb = Math.min(BINS - 1, Math.floor((g / 255) * BINS));
          const bb = Math.min(BINS - 1, Math.floor((b / 255) * BINS));
          histogram[rb * BINS * BINS + gb * BINS + bb]++;
        }
      }
      totalPixels += cellTotal;
      totalSkin += cellSkin;
      const norm = Math.max(1, cellSkin);
      for (let k = 0; k < dimsPerCell; k++) {
        vector[idx++] = histogram[k] / norm;
      }
    }
  }

  let mean = 0;
  for (let i = 0; i < idx; i++) mean += vector[i];
  mean /= idx;
  let variance = 0;
  for (let i = 0; i < idx; i++) variance += (vector[i] - mean) ** 2;
  const std = Math.sqrt(variance / idx + 1e-8);
  for (let i = 0; i < idx; i++) vector[i] = (vector[i] - mean) / std;

  return vector;
};

export const registerFace = (
  userId: string,
  userName: string,
  role: string,
  source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): FaceFeature => {
  const vector = extractFaceFeature(source);
  const feat: FaceFeature = { vector, userName, role, registeredAt: Date.now() };
  saveFeature(userId, feat);
  console.log(`[faceAuth] registered ${userName} (${userId}), vec[0..3]=[${vector[0].toFixed(3)}, ${vector[1].toFixed(3)}, ${vector[2].toFixed(3)}, ${vector[3].toFixed(3)}]`);
  return feat;
};

export interface VerifyResult {
  success: boolean;
  similarity: number;
  matchedUser?: string;
  matchedRole?: string;
}

export const verifyFace = (
  source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
  expectedUserId?: string
): VerifyResult => {
  const vector = extractFaceFeature(source);
  const stored = loadStoredFeatures();
  console.log(`[faceAuth] verify against ${Object.keys(stored).length} users, probe vec[0..3]=[${vector[0].toFixed(3)}, ${vector[1].toFixed(3)}, ${vector[2].toFixed(3)}, ${vector[3].toFixed(3)}]`);

  if (expectedUserId && stored[expectedUserId]) {
    const sim = cosineSimilarity(vector, stored[expectedUserId].vector);
    console.log(`[faceAuth] expected user ${expectedUserId} similarity=${sim.toFixed(4)} threshold=${SIMILARITY_THRESHOLD}`);
    return {
      success: sim >= SIMILARITY_THRESHOLD,
      similarity: sim,
      matchedUser: sim >= SIMILARITY_THRESHOLD ? stored[expectedUserId].userName : undefined,
      matchedRole: sim >= SIMILARITY_THRESHOLD ? stored[expectedUserId].role : undefined,
    };
  }

  let bestSim = -1;
  let bestKey: string | null = null;
  for (const k of Object.keys(stored)) {
    const sim = cosineSimilarity(vector, stored[k].vector);
    console.log(`[faceAuth] user ${k} sim=${sim.toFixed(4)}`);
    if (sim > bestSim) {
      bestSim = sim;
      bestKey = k;
    }
  }

  console.log(`[faceAuth] best=${bestKey} sim=${bestSim.toFixed(4)} threshold=${SIMILARITY_THRESHOLD}`);

  return {
    success: bestSim >= SIMILARITY_THRESHOLD,
    similarity: bestSim,
    matchedUser: bestKey && bestSim >= SIMILARITY_THRESHOLD ? stored[bestKey].userName : undefined,
    matchedRole: bestKey && bestSim >= SIMILARITY_THRESHOLD ? stored[bestKey].role : undefined,
  };
};

export const hasRegisteredFace = (userId: string): boolean => !!loadStoredFeatures()[userId];
