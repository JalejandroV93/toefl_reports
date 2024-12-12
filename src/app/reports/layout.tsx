"use client";

//import { Sidebar } from "@/components/ui/Csidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <SidebarProvider>
      <div className="print:hidden">
        <AppSidebar />
      </div>
        <main className="flex-1 overflow-y-auto p-6">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}
