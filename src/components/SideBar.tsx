import React, { useEffect, useRef } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
} from "./ui/sidebar";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { useConfigureStore } from "@/store/useConfigreStore";
import { useObstacleStore } from "@/store/useObstacleStore";
import { useCarStore } from "@/store/useCarStore";

function SideBar(): React.ReactElement {
  const lane = useConfigureStore((s) => s.lane);
  const obstacle = useConfigureStore((s) => s.obs);
  const frequency = useConfigureStore((s) => s.frequency);
  const learning = useConfigureStore((s) => s.learn);
  const running = useConfigureStore((s) => s.running);
  const setLane = useConfigureStore((s) => s.setLane);
  const setObstacle = useConfigureStore((s) => s.setObs);
  const setFrequency = useConfigureStore((s) => s.setFrequency);
  const setLearning = useConfigureStore((s) => s.setLearn);
  const setRunning = useConfigureStore((s) => s.setRunning);
  const timerRef = useRef<number | null>(null);

  const spawn = useObstacleStore((s) => s.spawn);
  const clear = useObstacleStore((s) => s.clear);
  const resetCar = useCarStore((s) => s.reset);

  const ensureObstacleCount = () => {
    const { obs: target, lane: laneNow } = useConfigureStore.getState();
    const { obstacles } = useObstacleStore.getState();
    const deficit = Math.max(0, target - obstacles.length);
    if (deficit === 0) return;

    const existingLanes = new Set(obstacles.map((o) => o.lane));
    const allLanes = Array.from({ length: laneNow }, (_, i) => i);
    const freeLanes = allLanes.filter((l) => !existingLanes.has(l));

    let remaining = deficit;

    while (remaining > 0 && freeLanes.length > 0) {
      const laneIdx = Math.floor(Math.random() * freeLanes.length);
      const laneForSpawn = freeLanes.splice(laneIdx, 1)[0];
      spawn(laneNow, undefined, laneForSpawn);
      remaining -= 1;
    }

    for (let i = 0; i < remaining; i += 1) {
      spawn(laneNow);
    }
  };

  const spawnLoop = () => {
    const { running } = useConfigureStore.getState();
    if (!running) return;
    ensureObstacleCount();
  };

  const startInterval = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const freq = useConfigureStore.getState().frequency;
    timerRef.current = window.setInterval(spawnLoop, freq * 1000);
  };

  useEffect(() => {
    if (!running) return;
    startInterval();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [frequency, running]);

  useEffect(() => {
    if (!running) return;
    ensureObstacleCount();
  }, [obstacle, running]);

  const returnSwal = () => {
    return Swal.fire({
      draggable: true,
      title: "시뮬레이션 오류",
      text: "시뮬레이션 오류가 발생했습니다. 로그를 확인해주세요.",
      icon: "error",
      confirmButtonText: "확인",
      background: "#404040",
      color: "#FFFFFF",
      confirmButtonColor: "#FF1313",
    });
  };

  const startSimulation = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    await axios
      .post("http://127.0.0.1:3000/sim_start", {
        lane: lane,
        obs: obstacle,
        frequency: frequency,
        learn: Boolean(learning),
      })
      .then((res) => {
        console.log(res);
        toast.success("시뮬레이션이 시작되었습니다");

        resetCar(lane);
        setRunning(true);
        clear();
      })
      .catch((err) => {
        console.log(err);
        returnSwal();
      });
  };

  const stopSimulation = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    // running을 먼저 내려 프론트 웹소켓을 의도적으로 종료
    setRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    await axios
      .post("http://127.0.0.1:3000/sim_stop", {
        sim_state: "stop",
      })
      .then((res) => {
        setLearning(10);
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
        returnSwal();
      });

    clear();
    toast.success("시뮬레이션이 중단되었습니다");
  };

  const setThreeLine = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setLane(3);
  };

  const setFiveLine = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setLane(5);
  };

  return (
    <SidebarProvider className="w-fit">
      <Sidebar className="dark text-white bg-[#202020]">
        <SidebarHeader className="text-center py-5">
          <h3 className="text-md">시뮬레이션 설정</h3>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="p-3">
                    차선 설정
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <div className="py-3">
                      <div>
                        <Button
                          onClick={setThreeLine}
                          disabled={running}
                          className="w-full my-2"
                        >
                          3차선 설정
                        </Button>
                        <Button
                          onClick={setFiveLine}
                          disabled={running}
                          className="w-full my-2"
                        >
                          5차선 설정
                        </Button>
                      </div>
                    </div>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="p-3">
                    장애물 개수
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <div className="py-3">
                      <Slider
                        defaultValue={[0]}
                        min={1}
                        max={10}
                        step={1}
                        value={[obstacle]}
                        onValueChange={(value) => {
                          setObstacle(value[0]);
                        }}
                        disabled={running}
                      />
                      <p className="text-right py-3">{obstacle} 개</p>
                    </div>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  {/* <SidebarMenuButton className="p-3">
                    장애물 생성 주기
                  </SidebarMenuButton> */}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <div className="py-3">
                      <Slider
                        defaultValue={[0]}
                        min={1}
                        max={10}
                        step={1}
                        value={[frequency]}
                        onValueChange={(value) => {
                          setFrequency(value[0]);
                        }}
                        disabled={running}
                      />
                      <p className="text-right py-3">{frequency} 초</p>
                    </div>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="p-3">
                    반복 횟수
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <div className="py-3">
                      <Slider
                        defaultValue={[0]}
                        min={10}
                        max={100}
                        step={10}
                        value={[learning]}
                        onValueChange={(value) => {
                          setLearning(value[0]);
                        }}
                        disabled={running}
                      />
                      <p className="text-right py-3">{learning} 회</p>
                      <div className="py-3">
                        <Button
                          className="w-full my-2 bg-blue-500 text-white font-bold"
                          disabled={running}
                          onClick={startSimulation}
                        >
                          시뮬레이션 시작
                        </Button>
                        <Button
                          className="w-full my-2 bg-red-500 text-white font-bold"
                          disabled={!running}
                          onClick={stopSimulation}
                        >
                          시뮬레이션 정지
                        </Button>
                        {/* <Button className="w-full my-2 bg-green-500 text-white font-bold" disabled>
                          학습 파일 가져오기
                        </Button> */}
                      </div>
                    </div>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}

export default SideBar;
