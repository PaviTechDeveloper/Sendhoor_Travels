import { MotionConfig } from 'framer-motion';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Home from '../pages/public/Home';
import Destinations from '../pages/public/Destinations';
import DestinationDetail from '../pages/public/DestinationDetail';
import Packages from '../pages/public/Packages';
import NotFound from '../pages/public/NotFound';
import BlogArticle from '../pages/public/BlogArticle';
import Admin from '../pages/owner/Admin';
import ScrollToTop from './ScrollToTop';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <div className="min-h-screen overflow-x-clip bg-white font-sans text-ink antialiased">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-ink"
          >
            Skip to content
          </a>
          <Navbar />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/destinations/:slug" element={<DestinationDetail />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/blog/:id" element={<BlogArticle />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </MotionConfig>
  );
}
