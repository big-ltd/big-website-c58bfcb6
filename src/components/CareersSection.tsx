
import React from 'react';

const CareersSection = () => {
  return (
    <section id="careers" className="bg-gray-50 pt-10 md:pt-14 pb-4">
      <div className="container mx-auto px-4">
        <div className="text-center mb-2">
          <div className="inline-block mb-3 px-4 py-1 bg-primary/10 rounded-full">
            <span className="text-primary font-medium">Careers</span>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-6 bg-white rounded-xl p-6 shadow-sm">
          <div className="md:w-1/3 flex justify-center">
            <img 
              src="/lovable-uploads/37bf31f6-7130-4c68-a753-8f706c64fa90.png" 
              alt="Cartoon rabbit character" 
              className="w-48 h-auto object-contain"
            />
          </div>
          
          <div className="md:w-2/3">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Join the fun</h2>
            <p className="text-xl md:text-2xl mb-3">
              Join us in delivering mobile games that players love - Send your CV to <a href="mailto:careers@big.com.cy" className="text-primary font-medium hover:underline">careers@big.com.cy</a>
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
