
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

const CareersSection = () => {
  const jobs = [
    {
      title: "Game Developer",
      location: "Remote",
      type: "Full-time"
    },
    {
      title: "Art Director", 
      location: "Remote",
      type: "Full-time"
    }
  ];

  const handleJobApply = (jobTitle: string) => {
    window.location.href = `mailto:careers@big.com.cy?subject=I want to be the ${jobTitle}`;
  };

  const handleMorePositions = () => {
    window.location.href = `mailto:careers@big.com.cy?subject=General Application`;
  };

  return (
    <section id="careers" className="pb-4" style={{backgroundColor: '#ffffff', marginTop: '6.5rem'}}>
      <div className="container mx-auto px-4">
        {/* Careers Header Panel with Job Board Inside */}
        <div className="max-w-4xl mx-auto rounded-[2rem] p-6 shadow-sm mb-8" style={{backgroundColor: '#f4f9f5'}}>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="md:w-1/3 flex justify-center">
              <img 
                src="/lovable-uploads/2314ddd8-80f3-4da7-bd5f-decd889478d0.png" 
                alt="Cartoon rabbit character" 
                className="w-48 h-auto object-contain"
              />
            </div>
            
            <div className="md:w-2/3 flex flex-col">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Careers</h2>
              <p className="mb-6" style={{fontWeight: 400, fontSize: '1.2rem'}}>
                Join us in delivering mobile games that players love - Send your CV to <a href="mailto:careers@big.com.cy" className="text-primary font-medium hover:underline">careers@big.com.cy</a>
              </p>

              {/* Job Board - Inside the panel, to the right of the image */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {jobs.map((job, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow rounded-[2rem] md:col-span-2">
                    <CardContent className="p-6">
                      <h4 className="font-normal mb-3" style={{fontSize: '1.2rem'}}>{job.title}</h4>
                      <div className="text-base text-muted-foreground mb-4">
                        <span className="font-light">{job.location}, {job.type}</span>
                      </div>
                      <div className="flex justify-end">
                        <button 
                          onClick={() => handleJobApply(job.title)}
                          className="flex items-center gap-2 text-primary hover:underline"
                          style={{fontSize: '1rem'}}
                        >
                          <Mail size={16} />
                          Apply
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            
                {/* More Positions Card - Takes only 1 column to make it narrower */}
                <Card className="hover:shadow-md transition-shadow rounded-[2rem] md:col-span-1">
                  <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div className="text-center">
                      <div className="text-2xl mb-2">...</div>
                      <h4 className="font-normal mb-4" style={{fontSize: '1.2rem'}}>More</h4>
                    </div>
                    <div className="flex justify-end">
                      <button 
                        onClick={handleMorePositions}
                        className="flex items-center gap-2 text-primary hover:underline"
                        style={{fontSize: '1rem'}}
                      >
                        <Mail size={16} />
                        Apply
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareersSection;
