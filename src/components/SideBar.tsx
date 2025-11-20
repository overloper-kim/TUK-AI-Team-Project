import { useState } from "react";
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

function SideBar(): React.ReactElement {

  const [lane, setLane] = useState<number>(1);
  const [obstacle, setObstacle] = useState<number>(1);
  const [frequency, setFrequency] = useState<number>(1);
  const [learning, setLearning] = useState<number>(10);
  
  const startSimulation = async(event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    await axios.post('http://127.0.0.1:3000/sim_start', {
      lane: lane,
      obs: obstacle,
      frequency: frequency,
      learn: learning,
    }).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);
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
    })
  };

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
                      <Slider defaultValue={[0]} min={1} max={5} step={1} value={[lane]} onValueChange={(value) => {
                        setLane(value[0])
                      }}/>
                      <p className="text-right py-3">
                        {lane} 차선
                      </p>
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
                        <Button className="w-full my-2 bg-blue-500 text-white font-bold" onClick={startSimulation}>시뮬레이션 시작</Button>
                        <Button className="w-full my-2 bg-red-500 text-white font-bold">시뮬레이션 정지</Button>
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
