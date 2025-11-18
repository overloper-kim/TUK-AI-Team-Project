import {
  Sidebar,
  SidebarContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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
          <SidebarMenuSub>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton>차선 개수</SidebarMenuSubButton>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton>장애물 설정</SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}

export default SideBar;
