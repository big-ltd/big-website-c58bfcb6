
import React from 'react';
import { Briefcase, Mail } from 'lucide-react';

const CareersSection = () => {
  return (
    <section id="careers" className="section bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-block mb-4 px-4 py-1 bg-primary/10 rounded-full">
            <span className="text-primary font-medium">Careers</span>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-primary rounded-xl shadow-sm p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <Briefcase className="h-10 w-10 mr-3" />
              <h3 className="text-2xl font-bold">Join Our Team</h3>
            </div>
            
            <p className="text-lg mb-6 text-center">
              Join us and help create mobile games that players love. If you have what it takes - Send your CV to careers@big-ltd.com
            </p>
            
            <div className="flex justify-center">
              <a 
                href="mailto:careers@big-ltd.com" 
                className="inline-flex items-center bg-white text-primary px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                Send Your CV
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareersSection;
