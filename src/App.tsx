
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import DesignerPage from "./pages/DesignerPage";
import TemplatesPage from "./pages/TemplatesPage";
import DataPage from "./pages/DataPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { setupStorageBucket } from "./lib/setupStorage";

const queryClient = new QueryClient();

const App = () => {
  // Initialize storage on app start
  useEffect(() => {
    setupStorageBucket().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/designer" element={<DesignerPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
