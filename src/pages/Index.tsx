
import React from 'react';
import NavBar from '@/components/NavBar';
import HeroSection from '@/components/HeroSection';
import GamesSection from '@/components/GamesSection';
import CareersSection from '@/components/CareersSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen" style={{backgroundColor: '#ffffff'}}>
      <NavBar />
      <HeroSection />
      <GamesSection />
      <CareersSection />
      <Footer />
    </div>
  );
};

export default Index;
