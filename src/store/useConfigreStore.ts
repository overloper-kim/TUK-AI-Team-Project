import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface SimConfigType {
  lane: number;
  setLane: (lane: number) => void;
  obs: number;
  setObs: (obs: number) => void;
  frequency: number;
  setFrequency: (fre: number) => void;
  learn: number;
  setLearn: (learn: number) => void;
  running: boolean,
  setRunning: (run: boolean) => void;
}

export const useConfigureStore = create<SimConfigType>() (
  immer((set) => ({
    lane: 1,
    obs: 1,
    frequency: 1,
    learn: 10,
    running: false,
    setLane: (lane) => set({
      lane: lane,
    }),
    setObs: (obs: number) => set({
      obs: obs,
    }),
    setFrequency: (fre: number) => set({
      frequency: fre,
    }),
    setLearn: (learn: number) => set({
      learn: learn,
    }),
    setRunning: (run: boolean) => set({
      running: run,
    })
  }))
);