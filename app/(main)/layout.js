"use client";

// import Header from "@/components/Header/Header";
// import Sidebar from "@/components/Sidebar/Sidebar";
import { useState } from "react";
import dynamic from "next/dynamic";

const Header = dynamic(() => import("@/components/Header/Header"), {
  ssr: false,
});
const Sidebar = dynamic(() => import("@/components/Sidebar/Sidebar"), {
  ssr: false,
});

function MainLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

  
    return (
      <div className="flex h-screen overflow-hidden">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* <!-- ===== Sidebar End ===== --> */}
  
        {/* <!-- ===== Content Area Start ===== --> */}
          <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            {/* <!-- ===== Header Start ===== --> */}
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            {/* <!-- ===== Header End ===== --> */}
  
            {/* <!-- ===== Main Content Start ===== --> */}
            <main>
              <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                {children}
              </div>
            </main>
            {/* <!-- ===== Main Content End ===== --> */}
          </div>
          {/* <!-- ===== Content Area End ===== --> */}
      </div>
    );
}

export default MainLayout;
