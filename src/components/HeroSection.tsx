
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative pt-28 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gray-900">
      {/* Background gradient elements */}
      <div className="absolute top-0 left-[10%] w-72 h-72 bg-[#5E3BA5]/20 rounded-full filter blur-3xl opacity-70 animate-float"></div>
      <div className="absolute bottom-10 right-[5%] w-80 h-80 bg-[#361E75]/20 rounded-full filter blur-3xl opacity-70 animate-float" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2 mb-12 lg:mb-0 animate-fade-in">
            <h1 className="title-text mb-6 text-white">
              Transforming Ideas Into <span className="gradient-text">Digital Reality</span>
            </h1>
            <p className="subtitle-text mb-8 max-w-lg text-gray-300">
              We specialize in building innovative digital solutions that help businesses grow. 
              Our expertise spans across web development, mobile applications, and cloud solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg py-6 px-8">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="border-2 py-6 px-8 text-lg text-white border-white/20 hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
          <div className="w-full lg:w-1/2 animate-fade-in-slow">
            <div className="relative">
              <div className="bg-gradient-primary p-1 rounded-2xl shadow-xl">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <img 
                    src="/lovable-uploads/63308921-38b2-4e2c-8b5e-2fefa4ca6fc7.png" 
                    alt="Match Story Game" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-4 max-w-xs animate-float">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <p className="font-medium">Featured Game Development</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
