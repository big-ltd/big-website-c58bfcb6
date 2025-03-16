
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Invest from "./pages/Invest";

const queryClient = new QueryClient();

const App = () => {
  const [isInvestSubdomain, setIsInvestSubdomain] = useState(false);

  useEffect(() => {
    // Check if the current hostname is the invest subdomain
    const hostname = window.location.hostname;
    setIsInvestSubdomain(hostname === 'invest.big-ltd.com');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {isInvestSubdomain ? (
              <>
                {/* For invest subdomain, show Invest page for all routes */}
                <Route path="/" element={<Invest />} />
                <Route path="/*" element={<Invest />} />
              </>
            ) : (
              <>
                {/* Regular routes for main domain */}
                <Route path="/" element={<Index />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/invest" element={<Invest />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </>
            )}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
