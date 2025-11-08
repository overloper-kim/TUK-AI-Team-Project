import { Sidebar, SidebarHeader, SidebarProvider } from "./ui/sidebar";

function SideBar(): React.ReactElement {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          ITS 자율주행 시뮬레이터
        </SidebarHeader>
      </Sidebar>
    </SidebarProvider>
  )
};

export default SideBar;