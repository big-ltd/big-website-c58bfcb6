
import React from 'react';

const CareersSection = () => {
  return (
    <section id="careers" className="pb-4" style={{backgroundColor: '#ffffff', paddingTop: '6.5rem'}}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 rounded-[2rem] p-6 shadow-sm" style={{backgroundColor: '#f4f9f5'}}>
          <div className="md:w-1/3 flex justify-center">
            <img 
              src="/lovable-uploads/2314ddd8-80f3-4da7-bd5f-decd889478d0.png" 
              alt="Cartoon rabbit character" 
              className="w-48 h-auto object-contain"
            />
          </div>
          
          <div className="md:w-2/3">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Careers</h2>
            <p className="mb-3" style={{fontWeight: 400, fontSize: '1.2rem'}}>
              Join us in delivering mobile games that players love - Send your CV to <a href="mailto:careers@big.com.cy" className="text-primary font-medium hover:underline">careers@big.com.cy</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareersSection;
