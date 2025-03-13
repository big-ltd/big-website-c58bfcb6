
import React from 'react';
import { Check } from 'lucide-react';

const stats = [
  { value: '10+', label: 'Years Experience' },
  { value: '200+', label: 'Projects Completed' },
  { value: '50+', label: 'Team Members' },
  { value: '98%', label: 'Client Satisfaction' }
];

const AboutSection = () => {
  return (
    <section id="about" className="section bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="w-full lg:w-1/2">
            <div className="relative">
              <div className="bg-white p-4 rounded-2xl shadow-lg max-w-md">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                  alt="Our team collaboration" 
                  className="w-full h-auto rounded-xl"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-6 max-w-xs">
                <div className="flex flex-wrap gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2">
            <div className="inline-block mb-4 px-4 py-1 bg-primary/10 rounded-full">
              <span className="text-primary font-medium">About Us</span>
            </div>
            <h2 className="title-text mb-6">
              Delivering <span className="gradient-text">Excellence</span> Since 2013
            </h2>
            <p className="subtitle-text mb-6">
              BIG LTD is a leading digital solutions provider committed to helping businesses thrive in the digital age. 
              Our team of experts combines technical expertise with creative thinking to deliver innovative solutions 
              that drive growth.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="mt-1 mr-3 flex-shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-3.5 w-3.5 text-green-500" />
                </div>
                <div>
                  <h4 className="text-base font-medium">Innovative Solutions</h4>
                  <p className="text-sm text-muted-foreground">We leverage the latest technologies to create innovative solutions.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-3 flex-shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-3.5 w-3.5 text-green-500" />
                </div>
                <div>
                  <h4 className="text-base font-medium">Customer-Centric Approach</h4>
                  <p className="text-sm text-muted-foreground">We put our clients at the center of everything we do.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-3 flex-shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-3.5 w-3.5 text-green-500" />
                </div>
                <div>
                  <h4 className="text-base font-medium">Continuous Improvement</h4>
                  <p className="text-sm text-muted-foreground">We continuously refine our processes to deliver better results.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
