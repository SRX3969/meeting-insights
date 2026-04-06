import { SidebarTrigger } from "@/components/ui/sidebar";

export function MeetingHeader() {
  return (
    <header className="flex items-center gap-3 border-b border-border px-6 h-14">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
    </header>
  );
}
