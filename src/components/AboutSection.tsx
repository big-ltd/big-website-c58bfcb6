
import React from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";

const AboutSection = () => {
  return (
    <section id="about" className="bg-gray-50 dark:bg-gray-900 pt-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="inline-block mb-3 px-4 py-1 bg-primary/10 rounded-full">
            <span className="text-primary font-medium">About</span>
          </div>
          
          <div className="w-full max-w-3xl animate-fade-in">
            <p className="subtitle-text mb-6 text-gray-700">
              Big is a mobile game developer and publisher based in Cyprus. We are all about creating games that players love and that inspire fandom. We believe that the freedom to pursue our passions—while staying attuned to what players want—makes game development truly rewarding.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
