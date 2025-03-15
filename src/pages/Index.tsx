
import React from 'react';
import NavBar from '@/components/NavBar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import GamesSection from '@/components/GamesSection';
import CareersSection from '@/components/CareersSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen space-y-0 bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <HeroSection />
      <AboutSection />
      <GamesSection />
      <CareersSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
