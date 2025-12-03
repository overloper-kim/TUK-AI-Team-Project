import AiDisplay from "./components/AiDisplay";
import Header from "./components/Header";
import SideBar from "./components/SideBar"
import { Toaster } from "./components/ui/sonner";
import { useConfigureStore } from "./store/useConfigreStore";
// import axios from "axios";

function App(): React.ReactElement {

  const lane = useConfigureStore((s) => s.lane);

  return (
    <main className="bg-[#404040] flex flex-row">
      <Toaster className="dark"/>
      <SideBar/>
      <div className="flex w-full flex-col">
        <Header/>
        <section className="size-full">
          <AiDisplay carState={{x: 10, y: 20, stop: false}} laneCount={lane} />
        </section>
      </div>
    </main>
  )
}

export default App;