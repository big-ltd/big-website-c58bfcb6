
import React from 'react';
import NavBar from '@/components/NavBar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import TeamSection from '@/components/TeamSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <NavBar />
      <HeroSection />
      <AboutSection />
      <TeamSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
