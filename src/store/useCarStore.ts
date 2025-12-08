import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface CarStore {
  x: number; // world X
  z: number; // world Z
  targetLane: number;
  direction: 0 | 1 | 2; // left: 0, center: 1, right: 2
  setX: (x: number) => void;
  setTargetLane: (lane: number) => void;
  reset: (laneCount: number) => void;
}

export const useCarStore = create<CarStore>()(
  immer((set) => ({
    x: 0,
    z: 6,
    targetLane: 0,
    direction: 1,
    setX: (x) => set({ x }),
    setTargetLane: (lane) => set({ targetLane: lane }),
    reset: (laneCount) =>
      set(() => {
        const centerLane = (laneCount - 1) / 2;
        return {
          targetLane: centerLane,
          x: 0,
          z: 6,
        };
      }),
  }))
);
