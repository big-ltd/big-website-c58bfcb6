
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const CareersSection = () => {
  const isMobile = useIsMobile();
  const jobs = [
    {
      title: "BI/AI Engineer",
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

  const handlePartnerWithUs = () => {
    window.location.href = `mailto:contact@big.com.cy?subject=I want to hear more about big`;
  };

  return (
    <section id="careers" className="pb-12" style={{backgroundColor: '#ffffff', marginTop: '3rem'}}>
      <div className="container mx-auto px-4">
        {/* Careers Header Panel with Job Board Inside */}
        <div className="max-w-4xl mx-auto rounded-[2rem] p-6 shadow-sm mb-8" style={{backgroundColor: '#f5f4f9'}}>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="md:w-1/3 flex justify-center">
              <img 
                src="/lovable-uploads/0d12268c-e54d-4f9e-9464-f80b1ef2cbc5.png" 
                alt="Cartoon rabbit character" 
                className="w-48 h-auto object-contain"
              />
            </div>
            
            <div className="md:w-2/3 flex flex-col">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-3 mt-4">Careers</h2>
              <p className="mb-8" style={{fontWeight: 400, fontSize: '1.2rem'}}>
                Join us in delivering mobile games that players love - Send your CV to <a href="mailto:careers@big.com.cy" className="text-primary font-medium hover:underline">careers@big.com.cy</a>
              </p>

              {/* Job Board - Inside the panel, to the right of the image */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {jobs.map((job, index) => (
                  <Card 
                    key={index} 
                    className="hover:shadow-md transition-shadow rounded-[2rem] md:col-span-2 cursor-pointer"
                    onClick={() => handleJobApply(job.title)}
                  >
                    <CardContent style={{padding: '1.2rem'}} className="flex flex-col h-full">
                      <h4 className="font-normal" style={{fontSize: '1.2rem', marginBottom: '0.2rem'}}>{job.title}</h4>
                      <div className="text-base text-muted-foreground flex-grow mb-4">
                        <span className="font-light">{job.location}, {job.type}</span>
                      </div>
                      <div className="flex justify-end">
                        <div className="flex items-center gap-2 text-primary" style={{fontSize: '1rem'}}>
                          <Mail size={16} />
                          Apply
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            
                {/* More Positions Card - Takes only 1 column to make it narrower */}
                <Card 
                  className="hover:shadow-md transition-shadow rounded-[2rem] md:col-span-1 cursor-pointer"
                  onClick={handleMorePositions}
                >
                  <CardContent style={{padding: '1.2rem'}} className="flex flex-col h-full">
                    {isMobile ? (
                      // Mobile layout: Move Apply button up, keep it aligned right with consistent styling
                      <>
                        <h4 className="font-normal" style={{fontSize: '1.2rem', marginBottom: '0.2rem'}}>More</h4>
                        <div className="flex-grow mb-0 flex justify-end">
                          <div className="flex items-center gap-2 text-primary" style={{fontSize: '1rem'}}>
                            <Mail size={16} />
                            Apply
                          </div>
                        </div>
                      </>
                    ) : (
                      // Desktop layout: Center "More" above email icon, remove "Apply" text
                      <div className="flex flex-col items-center justify-center h-full">
                        <h4 className="font-normal text-center mb-2" style={{fontSize: '1.2rem'}}>More</h4>
                        <div className="text-primary">
                          <Mail size={16} />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Partner with Us Link */}
        <div className="max-w-4xl mx-auto text-center">
          <p style={{fontWeight: 400, fontSize: '1.2rem'}}>
            Want to partner with us? Contact us at{' '}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handlePartnerWithUs();
              }}
              className="text-primary font-medium hover:underline"
            >
              contact@big.com.cy
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default CareersSection;
