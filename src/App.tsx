import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";

// Code-split the two heaviest pages (Leaflet + leaflet.heat on Heatmap,
// Chart.js on Dashboard) out of the initial bundle — neither library is
// needed until a visitor actually navigates to that route.
const LiveDemo = lazy(() => import("@/pages/LiveDemo"));
const Heatmap = lazy(() => import("@/pages/Heatmap"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const About = lazy(() => import("@/pages/About"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/live-demo" element={<LiveDemo />} />
            <Route path="/heatmap" element={<Heatmap />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
