import React from "react";

function Header(): React.ReactElement {
  return (
    <header>
      <div className="px-2 py-5 bg-[#2B2B2B]">
        <h3 className="text-white">시뮬레이터 모니터링</h3>
      </div>
    </header>
  )
}

export default Header;