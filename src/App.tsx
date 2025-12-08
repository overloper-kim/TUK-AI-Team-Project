import AiDisplay from "./components/AiDisplay";
import Header from "./components/Header";
import SideBar from "./components/SideBar"
import { Toaster } from "./components/ui/sonner";
import { useConfigureStore } from "./store/useConfigreStore";
// import axios from "axios";

function App(): React.ReactElement {

  const lane = useConfigureStore((s) => s.lane);
  // 기본 차량 위치를 중앙 차선으로 두도록 laneCount에 맞춰 계산
  const carLaneCenter = (lane - 1) / 2;

  return (
    <main className="bg-[#404040] flex flex-row">
      <Toaster className="dark"/>
      <SideBar/>
      <div className="flex w-full flex-col">
        <Header/>
        <section className="size-full">
          <AiDisplay carState={{x: carLaneCenter, y: 0, stop: false}} laneCount={lane} />
        </section>
      </div>
    </main>
  )
}

export default App;