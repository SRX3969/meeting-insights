import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useTheme } from "@/hooks/useTheme";
import { useDeleteMeeting, useMeetings } from "@/hooks/useMeetings";
import { Plus, FileText, Search, Moon, Sun, Monitor, Trash2, Settings, BarChart3 } from "lucide-react";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { data: meetings } = useMeetings();
  const deleteMeeting = useDeleteMeeting();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  const cycleTheme = () => {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
  };

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(() => navigate("/dashboard/meetings/new"))}>
            <Plus className="mr-2 h-4 w-4" />
            New Meeting
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate("/dashboard/meetings"))}>
            <FileText className="mr-2 h-4 w-4" />
            View All Meetings
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate("/dashboard/search"))}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </CommandItem>
          <CommandItem onSelect={() => run(cycleTheme)}>
            <ThemeIcon className="mr-2 h-4 w-4" />
            Toggle Dark Mode ({theme})
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate("/dashboard/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate("/dashboard"))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
        </CommandGroup>

        {meetings && meetings.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Meetings">
              {meetings.slice(0, 5).map((m) => (
                <CommandItem
                  key={m.id}
                  onSelect={() => run(() => navigate(`/dashboard/meeting/${m.id}`))}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {m.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
