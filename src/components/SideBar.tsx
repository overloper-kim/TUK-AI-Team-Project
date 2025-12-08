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
  const obstacle =  useConfigureStore((s) => s.obs);
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

  // 목표 개수까지 즉시 채우기
  const ensureObstacleCount = () => {
    const { obs: target, lane: laneNow } = useConfigureStore.getState();
    const { obstacles } = useObstacleStore.getState();
    const deficit = Math.max(0, target - obstacles.length);
    for (let i = 0; i < deficit; i += 1) {
      spawn(laneNow);
    }
  };

  // 인터벌이 최신 설정을 참조하도록 store에서 직접 읽음
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

  // 주기 변경이나 러닝 상태 변화에 따라 인터벌 재설정
  useEffect(() => {
    if (!running) return;
    startInterval();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [frequency, running]);

  // 장애물 목표 개수가 바뀌면 즉시 채워줌
  useEffect(() => {
    if (!running) return;
    ensureObstacleCount();
  }, [obstacle, running]);

  const returnSwal = () => {
    return (
        Swal.fire({
          draggable: true,
          title: "시뮬레이션 오류",
          text: "시뮬레이션 오류가 발생했습니다. 로그를 확인하세요.",
          icon: "error",
          confirmButtonText: "확인",
          background: "#404040",
          color: "#FFFFFF",
          confirmButtonColor: "#FF1313",
        })
    )
  }
  
  const startSimulation = async(event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    await axios.post('http://127.0.0.1:3000/sim_start', {
      lane: lane,
      obs: obstacle,
      frequency: frequency,
      learn: learning,
    }).then((res) => {
      console.log(res);
      toast.success("시뮬레이션이 시작 되었습니다.");
    }).catch((err) => {
      console.log(err);
      returnSwal();
    });

    // 차량 위치 초기화 후 러닝 상태를 켜서 훅/인터벌이 동작하도록 함
    resetCar(lane);
    setRunning(true);
    clear();
    // 시작 시 바로 목표 개수까지 채우기
    ensureObstacleCount();
    // 주기 기다리지 않고 즉시 인터벌 시작
    startInterval();
  };

  const stopSimulation = async(event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    await axios.post('http://127.0.0.1:3000/sim_stop', {
      sim_state: "stop"
    }).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);
      returnSwal();
    });

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    clear();
    toast.success("시뮬레이션이 중단 되었습니다.");
    setRunning(false);
  };

  // 차선 설정
  const setThreeLine = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setLane(3);
  };

  const setFiveLine = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setLane(5);
  }

  return (
    <SidebarProvider className="w-fit">
      <Sidebar className="dark text-white bg-[#202020]">
        <SidebarHeader className="text-center py-5">
          <h3 className="text-md">
            시뮬레이터 설정
          </h3>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="p-3">차선 설정</SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <div className="py-3">
                      {/* <Slider defaultValue={[0]} min={3} max={5} step={2} value={[lane]} onValueChange={(value) => {
                        setLane(value[0])
                      }}/>
                      <p className="text-right py-3">
                        {lane} 차선
                      </p> */}
                      <div>
                        <Button onClick={setThreeLine} className="w-full my-2">3차선 설정</Button>
                        <Button onClick={setFiveLine} className="w-full my-2">5차선 설정</Button>
                      </div>
                    </div>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="p-3">장애물 개수</SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <div className="py-3">
                      <Slider defaultValue={[0]} min={1} max={10} step={1} value={[obstacle]} onValueChange={(value) => {
                        setObstacle(value[0])
                      }} />
                      <p className="text-right py-3">
                        {obstacle} 개
                      </p>
                    </div>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="p-3">장애물 생성 주기</SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <div className="py-3">
                      <Slider defaultValue={[0]} min={1} max={10} step={1} value={[frequency]} onValueChange={(value) => {
                        setFrequency(value[0])
                      }} />
                      <p className="text-right py-3">
                        {frequency} 초
                      </p>
                    </div>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="p-3">반복 횟수</SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <div className="py-3">
                      <Slider defaultValue={[0]} min={10} max={100} step={10} value={[learning]} onValueChange={(value) => {
                        setLearning(value[0])
                      }} />
                      <p className="text-right py-3">
                        {learning} 회
                      </p>
                      <div className="py-3">
                        <Button className="w-full my-2 bg-blue-500 text-white font-bold" disabled={running} onClick={startSimulation}>시뮬레이션 시작</Button>
                        <Button className="w-full my-2 bg-red-500 text-white font-bold" disabled={!running} onClick={stopSimulation}>시뮬레이션 정지</Button>
                        <Button className="w-full my-2 bg-green-500 text-white font-bold">학습 파일 가져오기</Button>
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
