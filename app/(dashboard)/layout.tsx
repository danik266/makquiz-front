"use client";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto h-screen relative pt-16 md:pt-0">
        {/* ↑ добавил pt-16 md:pt-0 */}
        {children}
      </div>
    </div>
  );
}