// Hand pose definitions for ASL signs

export interface FingerPose {
  curl: number; // 0 = straight, 1 = fully curled
  spread: number; // -1 to 1, lateral spread
}

export interface HandPose {
  thumb: FingerPose;
  index: FingerPose;
  middle: FingerPose;
  ring: FingerPose;
  pinky: FingerPose;
  wristRotation: { x: number; y: number; z: number };
  palmDirection: 'forward' | 'back' | 'up' | 'down' | 'left' | 'right';
}

// Default relaxed hand pose
export const DEFAULT_POSE: HandPose = {
  thumb: { curl: 0.2, spread: 0.3 },
  index: { curl: 0.1, spread: 0 },
  middle: { curl: 0.1, spread: 0 },
  ring: { curl: 0.1, spread: 0 },
  pinky: { curl: 0.1, spread: 0 },
  wristRotation: { x: 0, y: 0, z: 0 },
  palmDirection: 'forward',
};

// ASL Alphabet poses
export const ASL_POSES: Record<string, HandPose> = {
  A: {
    thumb: { curl: 0, spread: 0.5 },
    index: { curl: 1, spread: 0 },
    middle: { curl: 1, spread: 0 },
    ring: { curl: 1, spread: 0 },
    pinky: { curl: 1, spread: 0 },
    wristRotation: { x: 0, y: 0, z: 0 },
    palmDirection: 'forward',
  },
  B: {
    thumb: { curl: 1, spread: -0.5 },
    index: { curl: 0, spread: 0 },
    middle: { curl: 0, spread: 0 },
    ring: { curl: 0, spread: 0 },
    pinky: { curl: 0, spread: 0 },
    wristRotation: { x: 0, y: 0, z: 0 },
    palmDirection: 'forward',
  },
  C: {
    thumb: { curl: 0.4, spread: 0.5 },
    index: { curl: 0.5, spread: 0.2 },
    middle: { curl: 0.5, spread: 0.1 },
    ring: { curl: 0.5, spread: 0 },
    pinky: { curl: 0.5, spread: -0.1 },
    wristRotation: { x: 0, y: 0.3, z: 0 },
    palmDirection: 'left',
  },
  D: {
    thumb: { curl: 0.6, spread: 0 },
    index: { curl: 0, spread: 0 },
    middle: { curl: 1, spread: 0 },
    ring: { curl: 1, spread: 0 },
    pinky: { curl: 1, spread: 0 },
    wristRotation: { x: 0, y: 0, z: 0 },
    palmDirection: 'forward',
  },
  E: {
    thumb: { curl: 0.7, spread: 0 },
    index: { curl: 0.9, spread: 0 },
    middle: { curl: 0.9, spread: 0 },
    ring: { curl: 0.9, spread: 0 },
    pinky: { curl: 0.9, spread: 0 },
    wristRotation: { x: 0, y: 0, z: 0 },
    palmDirection: 'forward',
  },
  F: {
    thumb: { curl: 0.7, spread: 0 },
    index: { curl: 0.8, spread: 0 },
    middle: { curl: 0, spread: 0 },
    ring: { curl: 0, spread: 0 },
    pinky: { curl: 0, spread: 0 },
    wristRotation: { x: 0, y: 0, z: 0 },
    palmDirection: 'forward',
  },
  G: {
    thumb: { curl: 0, spread: 0.8 },
    index: { curl: 0, spread: 0 },
    middle: { curl: 1, spread: 0 },
    ring: { curl: 1, spread: 0 },
    pinky: { curl: 1, spread: 0 },
    wristRotation: { x: 0, y: 1.57, z: 0 },
    palmDirection: 'left',
  },
  H: {
    thumb: { curl: 0.5, spread: 0 },
    index: { curl: 0, spread: 0.1 },
    middle: { curl: 0, spread: -0.1 },
    ring: { curl: 1, spread: 0 },
    pinky: { curl: 1, spread: 0 },
    wristRotation: { x: 0, y: 1.57, z: 0 },
    palmDirection: 'down',
  },
  I: {
    thumb: { curl: 0.8, spread: 0 },
    index: { curl: 1, spread: 0 },
    middle: { curl: 1, spread: 0 },
    ring: { curl: 1, spread: 0 },
    pinky: { curl: 0, spread: 0 },
    wristRotation: { x: 0, y: 0, z: 0 },
    palmDirection: 'forward',
  },
  K: {
    thumb: { curl: 0, spread: 0.5 },
    index: { curl: 0, spread: 0.2 },
    middle: { curl: 0, spread: -0.2 },
    ring: { curl: 1, spread: 0 },
    pinky: { curl: 1, spread: 0 },
    wristRotation: { x: 0, y: 0, z: 0 },
    palmDirection: 'forward',
  },
  L: {
    thumb: { curl: 0, spread: 1 },
    index: { curl: 0, spread: 0 },
    middle: { curl: 1, spread: 0 },
    ring: { curl: 1, spread: 0 },
    pinky: { curl: 1, spread: 0 },
    wristRotation: { x: 0, y: 0, z: 0 },
    palmDirection: 'forward',
  },
  O: {
    thumb: { curl: 0.5, spread: 0 },
    index: { curl: 0.7, spread: 0 },
    middle: { curl: 0.7, spread: 0 },
    ring: { curl: 0.7, spread: 0 },
    pinky: { curl: 0.7, spread: 0 },
    wristRotation: { x: 0, y: 0, z: 0 },
    palmDirection: 'forward',
  },
  R: {
    thumb: { curl: 0.8, spread: 0 },
    index: { curl: 0, spread: 0.15 },
    middle: { curl: 0, spread: -0.15 },
    ring: { curl: 1, spread: 0 },
    pinky: { curl: 1, spread: 0 },
    wristRotation: { x: 0, y: 0, z: 0 },
    palmDirection: 'forward',
  },
  S: {
    thumb: { curl: 0.5, spread: 0 },
    index: { curl: 1, spread: 0 },
    middle: { curl: 1, spread: 0 },
    ring: { curl: 1, spread: 0 },
    pinky: { curl: 1, spread: 0 },
    wristRotation: { x: 0, y: 0, z: 0 },
    palmDirection: 'forward',
  },
  U: {
    thumb: { curl: 0.8, spread: 0 },
    index: { curl: 0, spread: 0.1 },
    middle: { curl: 0, spread: -0.1 },
    ring: { curl: 1, spread: 0 },
    pinky: { curl: 1, spread: 0 },
    wristRotation: { x: 0, y: 0, z: 0 },
    palmDirection: 'forward',
  },
  V: {
    thumb: { curl: 0.8, spread: 0 },
    index: { curl: 0, spread: 0.3 },
    middle: { curl: 0, spread: -0.3 },
    ring: { curl: 1, spread: 0 },
    pinky: { curl: 1, spread: 0 },
    wristRotation: { x: 0, y: 0, z: 0 },
    palmDirection: 'forward',
  },
  W: {
    thumb: { curl: 0.8, spread: 0 },
    index: { curl: 0, spread: 0.2 },
    middle: { curl: 0, spread: 0 },
    ring: { curl: 0, spread: -0.2 },
    pinky: { curl: 1, spread: 0 },
    wristRotation: { x: 0, y: 0, z: 0 },
    palmDirection: 'forward',
  },
  Y: {
    thumb: { curl: 0, spread: 1 },
    index: { curl: 1, spread: 0 },
    middle: { curl: 1, spread: 0 },
    ring: { curl: 1, spread: 0 },
    pinky: { curl: 0, spread: -0.5 },
    wristRotation: { x: 0, y: 0, z: 0 },
    palmDirection: 'forward',
  },
};

// Common word poses
export const WORD_POSES: Record<string, HandPose[]> = {
  hello: [
    {
      thumb: { curl: 0, spread: 0.3 },
      index: { curl: 0, spread: 0.1 },
      middle: { curl: 0, spread: 0 },
      ring: { curl: 0, spread: -0.1 },
      pinky: { curl: 0, spread: -0.2 },
      wristRotation: { x: 0, y: 0, z: 0.3 },
      palmDirection: 'forward',
    },
  ],
  'thank you': [
    {
      thumb: { curl: 0, spread: 0 },
      index: { curl: 0, spread: 0 },
      middle: { curl: 0, spread: 0 },
      ring: { curl: 0, spread: 0 },
      pinky: { curl: 0, spread: 0 },
      wristRotation: { x: -0.3, y: 0, z: 0 },
      palmDirection: 'up',
    },
  ],
  'i love you': [
    {
      thumb: { curl: 0, spread: 1 },
      index: { curl: 0, spread: 0 },
      middle: { curl: 1, spread: 0 },
      ring: { curl: 1, spread: 0 },
      pinky: { curl: 0, spread: -0.3 },
      wristRotation: { x: 0, y: 0, z: 0 },
      palmDirection: 'forward',
    },
  ],
  yes: [
    {
      thumb: { curl: 0.5, spread: 0 },
      index: { curl: 1, spread: 0 },
      middle: { curl: 1, spread: 0 },
      ring: { curl: 1, spread: 0 },
      pinky: { curl: 1, spread: 0 },
      wristRotation: { x: 0.3, y: 0, z: 0 },
      palmDirection: 'forward',
    },
  ],
  no: [
    {
      thumb: { curl: 0, spread: 0.5 },
      index: { curl: 0, spread: 0 },
      middle: { curl: 0, spread: -0.1 },
      ring: { curl: 1, spread: 0 },
      pinky: { curl: 1, spread: 0 },
      wristRotation: { x: 0, y: 0, z: 0 },
      palmDirection: 'forward',
    },
  ],
  please: [
    {
      thumb: { curl: 0.2, spread: 0 },
      index: { curl: 0, spread: 0 },
      middle: { curl: 0, spread: 0 },
      ring: { curl: 0, spread: 0 },
      pinky: { curl: 0, spread: 0 },
      wristRotation: { x: 0, y: 0, z: 0 },
      palmDirection: 'up',
    },
  ],
  sorry: [
    {
      thumb: { curl: 0.5, spread: 0 },
      index: { curl: 1, spread: 0 },
      middle: { curl: 1, spread: 0 },
      ring: { curl: 1, spread: 0 },
      pinky: { curl: 1, spread: 0 },
      wristRotation: { x: 0, y: 0, z: 0 },
      palmDirection: 'up',
    },
  ],
  help: [
    {
      thumb: { curl: 0, spread: 0.5 },
      index: { curl: 1, spread: 0 },
      middle: { curl: 1, spread: 0 },
      ring: { curl: 1, spread: 0 },
      pinky: { curl: 1, spread: 0 },
      wristRotation: { x: 0, y: 0, z: 0 },
      palmDirection: 'up',
    },
  ],
};

// Get pose for a word or letter
export function getPoseForSign(sign: string): HandPose | null {
  const normalizedSign = sign.toLowerCase().trim();

  // Check word poses first
  if (WORD_POSES[normalizedSign]) {
    return WORD_POSES[normalizedSign][0];
  }

  // Check if it's a single letter
  if (sign.length === 1 && ASL_POSES[sign.toUpperCase()]) {
    return ASL_POSES[sign.toUpperCase()];
  }

  return null;
}
