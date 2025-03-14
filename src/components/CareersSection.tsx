
import React from 'react';

const CareersSection = () => {
  return (
    <section id="careers" className="section bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-block mb-4 px-4 py-1 bg-primary/10 rounded-full">
            <span className="text-primary font-medium">Careers</span>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8 bg-white rounded-xl p-8 shadow-sm">
          <div className="md:w-1/3 flex justify-center">
            <img 
              src="/lovable-uploads/2ad17f22-745c-4a1b-b332-bc3caec754ac.png" 
              alt="Cartoon rabbit character" 
              className="w-48 h-auto object-contain"
            />
          </div>
          
          <div className="md:w-2/3">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Join the fun</h2>
            <p className="text-lg mb-4">
              Join us in delivering mobile games that players love - Send your CV to <a href="mailto:careers@big-ltd.com" className="text-primary font-medium hover:underline">careers@big-ltd.com</a>
            </p>
            
            <div className="text-sm text-gray-500">
              <span>If you have the talent and experience don't hesitate to contact us.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareersSection;
