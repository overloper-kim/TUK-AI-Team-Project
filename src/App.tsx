import Header from "./components/Header"
import SideBar from "./components/SideBar"

function App(): React.ReactElement {
  return (
    <main className="bg-[#404040]">
      <SideBar/>
      <div className="flex flex-row">
        <section>
          <p>시뮬레이션 환경</p>
        </section>
        <section>

        </section>
      </div>
    </main>
  )
}

export default App;