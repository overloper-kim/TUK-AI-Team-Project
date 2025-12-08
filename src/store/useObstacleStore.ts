import { create } from "zustand";
import { immer } from "zustand/middleware/immer";


interface Obstacle {
  id: number;
  lane: number;
  z: number;
}

interface ObstacleStoreType {
  obstacles: Obstacle[];
  nextId: number;

  spawn: (laneCount: number) => void;
  clear: () => void;
  moveForward: (speed: number) => void; // optional
}

export const useObstacleStore = create<ObstacleStoreType>()(
  immer((set, get) => ({
    obstacles: [],
    nextId: 1,

    spawn: (laneCount) =>
      set((state) => {
        const lane = Math.floor(Math.random() * laneCount);
        // 카메라가 바라보는 방향(-Z) 앞쪽에 바로 보이도록 음수 Z에서 시작
        const z = -60;
        state.obstacles.push({
          id: state.nextId++,
          lane,
          z,
        });
      }),

    clear: () =>
      set((state) => {
        state.obstacles = [];
        state.nextId = 1;
      }),

    moveForward: (speed) =>
      set((state) => {
        state.obstacles.forEach((o) => {
          o.z -= speed;
        });

        // 화면 밖으로 나간 장애물 제거
        state.obstacles = state.obstacles.filter((o) => o.z > -5);
      }),
  }))
);
