
'use client';

import { ScrollArea } from "@/components/ui/scroll-area";
import { FileBarChart, Users,House } from "lucide-react";
import Link from "next/link";
import { useReports } from "@/providers/ReportProvider";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { studentsData } = useReports();
  const pathname = usePathname();

  return (
    <Sidebar className="w-64 border-r h-screen">
      <SidebarContent>
        {/* General Reports Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-lg font-bold text-red-700">
            TOEFL Reports
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={pathname === "/reports" ? "bg-secondary" : ""}
                >
                  <Link href="/reports" className="flex items-center">
                    <FileBarChart className="mr-2 h-4 w-4" />
                    <span>General Report</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Students Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-lg font-semibold">
            Students
          </SidebarGroupLabel>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <SidebarGroupContent>
              <SidebarMenu>
                {studentsData.map((student, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton
                      asChild
                      className={pathname === `/reports/${index}` ? "bg-secondary" : ""}
                    >
                      <Link 
                        href={`/reports/${index}`}
                        className="flex items-center"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        <span>{student.Nombre} {student["Apellido(s)"]}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </ScrollArea>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              {/* add a button to go to / */}
              <SidebarMenuButton
                asChild
                className={pathname === "/" ? "bg-blue-600" : "bg-red-700 text-white items-center justify-center"}
              >
                <Link href="/" className="flex items-center">
                  <House className="mr-2 h-4 w-4" />
                  <span>Inicio</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>    </Sidebar>
  );
}