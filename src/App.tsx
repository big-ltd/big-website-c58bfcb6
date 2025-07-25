
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ProtectedDeckUpload from "./components/ProtectedDeckUpload";
import ProtectedJobManagement from "./components/ProtectedJobManagement";
import Deck from "./pages/Deck";
import JobDetail from "./pages/JobDetail";
import AccountDeletionRedirect from "./components/AccountDeletionRedirect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/deckupload" element={<ProtectedDeckUpload />} />
          <Route path="/deck" element={<Deck />} />
          <Route path="/careers/:jobId" element={<JobDetail />} />
          <Route path="/careers/manage" element={<ProtectedJobManagement />} />
          <Route path="/account-deletion-form" element={<AccountDeletionRedirect />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
