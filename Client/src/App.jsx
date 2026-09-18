import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/UI/Navbar';
import Footer from './components/UI/Footer';
import HomePage from './Pages/HomePage';
import ServicePage from './Pages/ServicePage';
import AboutPage from './Pages/AboutPage';
import TeamPage from './Pages/TeamPage';
import ReviewsPage from './Pages/ReviewsPage';
import ContactPage from './Pages/ContactPage';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('denta_current_page') || 'home';
  });

  useEffect(() => {
    localStorage.setItem('denta_current_page', currentPage);
  }, [currentPage]);

  useEffect(() => {
    // Initialize Lenis for smooth scrolling across the site
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  const handleNavigateToContact = () => {
    setCurrentPage('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.__navigateToContact = handleNavigateToContact;
  }, [handleNavigateToContact]);

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#0f172a] font-sans antialiased flex flex-col selection:bg-[#0ea5e9] selection:text-white">
      {/* Navbar Component */}
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {/* Active Page View */}
      {currentPage === 'contact' ? (
        <ContactPage />
      ) : currentPage === 'reviews' ? (
        <ReviewsPage onNavigateToContact={handleNavigateToContact} />
      ) : currentPage === 'team' ? (
        <TeamPage onNavigateToContact={handleNavigateToContact} />
      ) : currentPage === 'about' ? (
        <AboutPage onNavigateToContact={handleNavigateToContact} />
      ) : currentPage === 'services' ? (
        <ServicePage onNavigateToContact={handleNavigateToContact} />
      ) : (
        <HomePage onNavigateToContact={handleNavigateToContact} />
      )}

      {/* Footer Component */}
      <Footer onNavigateToContact={handleNavigateToContact} />
    </div>
  );
}

export default App;
