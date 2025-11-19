import React from "react";

function Header(): React.ReactElement {
  return (
    <header>
      <div className="px-5 py-7 bg-[#2B2B2B]">
        <h3 className="text-lg font-bold text-orange-400">ITS 자율주행 시뮬레이터 모니터링</h3>
      </div>
    </header>
  )
}

export default Header;