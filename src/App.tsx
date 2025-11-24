import AiDisplay from "./components/AiDisplay";
import Header from "./components/Header";
import SideBar from "./components/SideBar"
import { Toaster } from "./components/ui/sonner";
import axios from "axios";

function App(): React.ReactElement {

  const getSimulationConfig = () => {
    axios.get("http://127.0.0.1/configure").then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);
    });
  }

  return (
    <main className="bg-[#404040] flex flex-row">
      <Toaster className="dark"/>
      <SideBar/>
      <div className="flex w-full flex-col">
        <Header/>
        <section className="size-full">
          <AiDisplay carState={{x: 10, y: 20, stop: false}} laneCount={3} />
        </section>
      </div>
    </main>
  )
}

export default App;