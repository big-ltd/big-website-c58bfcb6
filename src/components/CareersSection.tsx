
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Mail } from 'lucide-react';

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
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 rounded-[2rem] p-6 shadow-sm mb-8" style={{backgroundColor: '#f4f9f5'}}>
          <div className="md:w-1/3 flex justify-center">
            <img 
              src="/lovable-uploads/2314ddd8-80f3-4da7-bd5f-decd889478d0.png" 
              alt="Cartoon rabbit character" 
              className="w-48 h-auto object-contain"
            />
          </div>
          
          <div className="md:w-2/3">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Careers</h2>
            <p className="mb-3" style={{fontWeight: 400, fontSize: '1.2rem'}}>
              Join us in delivering mobile games that players love - Send your CV to <a href="mailto:careers@big.com.cy" className="text-primary font-medium hover:underline">careers@big.com.cy</a>
            </p>
          </div>
        </div>

        {/* Job Board */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {jobs.map((job, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow rounded-[2rem]">
                <CardContent className="p-6">
                  <h4 className="font-normal mb-2" style={{fontSize: '1.2rem'}}>{job.title}</h4>
                  <div className="flex items-center gap-2 text-base text-muted-foreground mb-3">
                    <MapPin size={14} />
                    <span className="font-light">{job.location}</span>
                    <span>•</span>
                    <span className="font-normal">{job.type}</span>
                  </div>
                  <Button 
                    onClick={() => handleJobApply(job.title)}
                    variant="outline"
                    className="w-full"
                    style={{fontSize: '1rem'}}
                  >
                    <Mail size={16} className="mr-2" />
                    Apply
                  </Button>
                </CardContent>
              </Card>
            ))}
            
            {/* More Positions Card */}
            <Card className="hover:shadow-md transition-shadow rounded-[2rem]">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                <div className="text-2xl mb-2">...</div>
                <h4 className="font-normal mb-2" style={{fontSize: '1.2rem'}}>More Positions</h4>
                <Button 
                  onClick={handleMorePositions}
                  variant="outline"
                  className="w-full"
                  style={{fontSize: '1rem'}}
                >
                  <Mail size={16} className="mr-2" />
                  Apply
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareersSection;
