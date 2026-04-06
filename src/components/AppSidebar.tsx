import { Plus, Clock, FileText } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { Meeting } from "@/lib/types";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  meetings: Meeting[];
}

export function AppSidebar({ meetings }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="pt-5">
        {/* Logo */}
        <div className="px-4 pb-4">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-base font-semibold text-foreground">MeetNotes AI</span>
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary mx-auto">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/"
                    end
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover-bg"
                    activeClassName="bg-accent text-foreground font-medium"
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>New Meeting</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/history"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover-bg"
                    activeClassName="bg-accent text-foreground font-medium"
                  >
                    <Clock className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>History</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent meetings */}
        {!collapsed && meetings.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Recent
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {meetings.slice(0, 8).map((meeting) => (
                  <SidebarMenuItem key={meeting.id}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={`/meeting/${meeting.id}`}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover-bg truncate"
                        activeClassName="bg-accent text-foreground"
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{meeting.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
