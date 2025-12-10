import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { toast } from "sonner";
import { useConfigureStore } from "./useConfigreStore";

interface Obstacle {
  id: number;
  lane: number;
  z: number;
}

interface ObstacleStoreType {
  obstacles: Obstacle[];
  nextId: number;

  spawn: (laneCount: number, zOverride?: number, laneOverride?: number) => void;
  syncFromBackend: (obstacles: { lane: number; z: number }[]) => void;
  clear: () => void;
  moveForward: (speed: number) => void; // delta 이동량(프레임마다 더해짐)
}

export const useObstacleStore = create<ObstacleStoreType>()(
  immer((set) => ({
    obstacles: [],
    nextId: 1,

    spawn: (laneCount, zOverride, laneOverride) =>
      set((state) => {
        const lane = laneOverride ?? Math.floor(Math.random() * laneCount);
        const gap = 4 + Math.random() * 3; // 4~7
        const baseZ = -12;
        const currentMinZ =
          state.obstacles.length === 0
            ? baseZ
            : Math.min(...state.obstacles.map((o) => o.z));
        const sameLane = state.obstacles.filter((o) => o.lane === lane);
        const sameLaneMinZ =
          sameLane.length > 0 ? Math.min(...sameLane.map((o) => o.z)) : null;
        let z =
          zOverride ??
          (sameLaneMinZ !== null ? sameLaneMinZ : currentMinZ) - gap;

        const minDistance = 2;
        let safetyPass = 0;
        while (
          state.obstacles.some(
            (o) => o.lane === lane && Math.abs(o.z - z) < minDistance
          )
        ) {
          z -= minDistance;
          safetyPass += 1;
          if (safetyPass > 10) break; // 무한루프 방지
        }

        state.obstacles.push({
          id: state.nextId++,
          lane,
          z,
        });
      }),

    syncFromBackend: (obstacles) =>
      set((state) => {
        // 백엔드에서 내려온 장애물 상태를 그대로 반영 (id는 프론트에서 재할당)
        state.obstacles = obstacles.map((o, idx) => ({
          id: idx + 1,
          lane: o.lane,
          z: o.z,
        }));
        state.nextId = state.obstacles.length + 1;
      }),

    clear: () =>
      set((state) => {
        state.obstacles = [];
        state.nextId = 1;
      }),

    moveForward: (speed) =>
      set((state) => {
        state.obstacles.forEach((o) => {
          o.z += speed;
        });

        const passed = state.obstacles.filter((o) => o.z >= 40).length;
        state.obstacles = state.obstacles.filter((o) => o.z < 40);

        if (passed > 0) {
          const cfg = useConfigureStore.getState();
          const nextLearn = Math.max(0, cfg.learn - passed);
          cfg.setLearn(nextLearn);
          if (nextLearn === 0) {
            cfg.setRunning(false);
            state.obstacles = [];
            state.nextId = 1;
            cfg.setLearn(10);
            toast.success("학습이 완료되었습니다!");
          }
        }
      }),
  }))
);
