import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
} from "./ui/sidebar";
import { Slider } from "./ui/slider";

function SideBar(): React.ReactElement {

  const [lane, setLane] = useState<number>(1);
  const [obstacle, setObstacle] = useState<number>(1);
  const [frequency, setFrequency] = useState<number>(1);
  const [learning, setLearning] = useState<number>(10);

  return (
    <SidebarProvider className="w-fit">
      <Sidebar className="dark text-white bg-[#202020]">
        <SidebarHeader className="text-center py-10">
          <h3 className="text-lg font-bold text-[#E67E22]">
            ITS 자율주행 시뮬레이터
          </h3>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="text-md font-bold">차선 설정</SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <div className="py-3">
                      <Slider defaultValue={[0]} max={5} step={1} value={[lane]} onValueChange={(value) => {
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
                  <SidebarMenuButton className="text-md font-bold">장애물 개수</SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <div className="py-3">
                      <Slider defaultValue={[0]} max={10} step={1} value={[obstacle]} onValueChange={(value) => {
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
                  <SidebarMenuButton className="text-md font-bold">학습 횟수</SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <div className="py-3">
                      <Slider defaultValue={[0]} max={100} step={10} />
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
