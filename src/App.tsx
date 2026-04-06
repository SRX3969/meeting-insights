import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MeetingHeader } from "@/components/MeetingHeader";
import { getMeetings } from "@/lib/meetings-store";
import { useState, useEffect } from "react";
import { Meeting } from "@/lib/types";
import Index from "./pages/Index";
import History from "./pages/History";
import MeetingDetail from "./pages/MeetingDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    setMeetings(getMeetings());
    const interval = setInterval(() => setMeetings(getMeetings()), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar meetings={meetings} />
        <div className="flex-1 flex flex-col min-w-0">
          <MeetingHeader />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/history" element={<History />} />
              <Route path="/meeting/:id" element={<MeetingDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
