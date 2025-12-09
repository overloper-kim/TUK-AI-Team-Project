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
  clear: () => void;
  moveForward: (speed: number) => void; // delta 보정된 속도값 전달
}

export const useObstacleStore = create<ObstacleStoreType>()(
  immer((set) => ({
    obstacles: [],
    nextId: 1,

    spawn: (laneCount, zOverride, laneOverride) =>
      set((state) => {
        // 완전 랜덤 차선 선택(override가 있으면 우선)
        const lane =
          laneOverride ?? Math.floor(Math.random() * laneCount);
        // z 간격도 약간 랜덤하게 줘서 겹침 최소화
        const gap = 3 + Math.random() * 3; // 3~6
        // 기본 시작 위치를 더 카메라 근처로 당김
        const baseZ = -8;
        const currentMinZ =
          state.obstacles.length === 0
            ? baseZ
            : Math.min(...state.obstacles.map((o) => o.z));
        const z = zOverride ?? currentMinZ - gap;
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
          // 카메라(+Z) 쪽으로 전진
          o.z += speed;
        });

        // 카메라를 지나친 장애물 제거
        const passed = state.obstacles.filter((o) => o.z >= 40).length;
        state.obstacles = state.obstacles.filter((o) => o.z < 40);

        // 안전 통과한 개수만큼 learn 감소 (0 아래로 내려가지 않게 처리)
        if (passed > 0) {
          const cfg = useConfigureStore.getState();
          const nextLearn = Math.max(0, cfg.learn - passed);
          cfg.setLearn(nextLearn);
          // 학습 횟수가 0이 되면 시뮬레이션 종료
          if (nextLearn === 0) {
            cfg.setRunning(false);
            state.obstacles = [];
            state.nextId = 1;
            cfg.setLearn(10);
            toast.success("학습이 완료되었습니다.");
          }
        }
      }),
  }))
);
