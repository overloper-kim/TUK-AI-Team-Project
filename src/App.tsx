import Header from "./components/Header";
import SideBar from "./components/SideBar"

function App(): React.ReactElement {
  return (
    <main className="bg-[#404040] flex flex-row">
      <SideBar/>
      <div className="flex w-full flex-col">
        <Header/>
        <section>
          <p>메인 화면</p>
        </section>
      </div>
    </main>
  )
}

export default App;