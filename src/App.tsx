import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TeacherLogin from "./pages/TeacherLogin";
import TeacherConfirm from "./pages/TeacherConfirm";
import SchoolLogin from "./pages/SchoolLogin";
import SchoolConfirm from "./pages/SchoolConfirm";
import Home from "./pages/Home";
import Attendance from "./pages/Attendance";
import MealAttendance from "./pages/MealAttendance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TeacherLogin />} />
          <Route path="/teacher-confirm" element={<TeacherConfirm />} />
          <Route path="/school-login" element={<SchoolLogin />} />
          <Route path="/school-confirm" element={<SchoolConfirm />} />
          <Route path="/home" element={<Home />} />
          <Route path="/attendance/:classId" element={<Attendance />} />
          <Route path="/meal-attendance/:classId" element={<MealAttendance />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
