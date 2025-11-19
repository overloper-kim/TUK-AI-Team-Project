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

function SideBar(): React.ReactElement {
  return (
    <SidebarProvider className="w-fit">
      <Sidebar className="dark text-white bg-[#202020]">
        <SidebarHeader className="text-center py-10">
          <h3 className="text-lg font-bold text-[#E67E22]">
            ITS 자율주행 시뮬레이터
          </h3>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroupLabel className="px-3 text-md text-white">
            시뮬레이션 옵션
          </SidebarGroupLabel>
          <SidebarMenu>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>차선 설정</SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <div>차로 개수</div>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>차선 설정</SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <div>차로 개수</div>
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
