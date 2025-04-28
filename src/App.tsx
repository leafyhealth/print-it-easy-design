
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
import LabelsPage from "./pages/labels/LabelsPage";
import LabelHistoryPage from "./pages/labels/LabelHistoryPage";
import { setupStorageBucket } from "./lib/setupStorage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // Initialize storage on app start - but don't block rendering
  useEffect(() => {
    // Use setTimeout to make sure this runs after initial render
    setTimeout(() => {
      setupStorageBucket().catch(err => {
        console.log('Storage setup failed, continuing with fallback images');
      });
    }, 1000);
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
            <Route path="/labels" element={<LabelsPage />} />
            <Route path="/labels/history" element={<LabelHistoryPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
