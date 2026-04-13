import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Meetings from "./pages/Meetings";
import NewMeeting from "./pages/NewMeeting";
import DashboardMeetingDetail from "./pages/DashboardMeetingDetail";
import SearchPage from "./pages/SearchPage";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { CommandMenu } from "@/components/CommandMenu";

const queryClient = new QueryClient();

const ProtectedPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CommandMenu />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth/login" element={<Auth mode="login" />} />
              <Route path="/auth/signup" element={<Auth mode="signup" />} />

              <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
              <Route path="/dashboard/meetings" element={<ProtectedPage><Meetings /></ProtectedPage>} />
              <Route path="/dashboard/meetings/new" element={<ProtectedPage><NewMeeting /></ProtectedPage>} />
              <Route path="/dashboard/meeting/:id" element={<ProtectedPage><DashboardMeetingDetail /></ProtectedPage>} />
              <Route path="/dashboard/search" element={<ProtectedPage><SearchPage /></ProtectedPage>} />
              <Route path="/dashboard/settings" element={<ProtectedPage><Settings /></ProtectedPage>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
