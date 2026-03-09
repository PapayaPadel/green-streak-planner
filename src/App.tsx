import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ColorScheme, ThemeMode } from '@/hooks/useSettings';
import { useEffect } from 'react';

const queryClient = new QueryClient();

// Add a tiny component to initialize theme on app load
function ThemeInit() {
  useEffect(() => {
    const stored = localStorage.getItem('tracker-settings');
    if (stored) {
      const settings = JSON.parse(stored);
      document.documentElement.classList.toggle('dark', settings.themeMode === 'dark');
      document.documentElement.setAttribute('data-scheme', settings.colorScheme || 'green');
    }
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeInit />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
