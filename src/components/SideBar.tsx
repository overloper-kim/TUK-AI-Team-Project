import { DropdownMenu, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Sidebar, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "./ui/sidebar";

function SideBar(): React.ReactElement {
  return (
    <SidebarProvider>
      <Sidebar className="dark text-white bg-[#202020]">
        <SidebarHeader className="text-center py-10">
          <h3 className="text-lg font-bold">ITS 자율주행 시뮬레이터</h3>
        </SidebarHeader>
        <SidebarMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="py-5 px-4">
                시뮬레이션 설정
              </SidebarMenuButton>
            </DropdownMenuTrigger>
          </DropdownMenu>
        </SidebarMenu>
      </Sidebar>
    </SidebarProvider>
  )
};

export default SideBar;