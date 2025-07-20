
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft } from 'lucide-react';
import { useJob } from '@/hooks/useJobs';
import { Link } from 'react-router-dom';

const JobDetail = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { data: job, isLoading, error } = useJob(jobId || '');

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">Loading job details...</div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return <Navigate to="/404" replace />;
  }

  const handleApply = () => {
    window.location.href = `mailto:careers@big.com.cy?subject=Application for ${job.title}`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            to="/#careers" 
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="rounded-[2rem]" style={{ backgroundColor: '#f5f4f9' }}>
                <CardContent className="p-6">
                  <h1 className="text-2xl font-bold mb-4">{job.title}</h1>
                  
                  <div className="space-y-4 mb-6">
                    <div className="text-muted-foreground">
                      <span>{job.location}, {job.type}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleApply}
                    className="w-full rounded-[2rem] bg-primary hover:bg-primary/90"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="rounded-[2rem]">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold mb-6">Job Description</h2>
                <div className="prose prose-lg max-w-none">
                  {job.description.split('\n').map((paragraph, index) => {
                    if (paragraph.trim() === '') return null;
                    
                    if (paragraph.startsWith('•')) {
                      return (
                        <li key={index} className="ml-4 mb-2">
                          {paragraph.substring(1).trim()}
                        </li>
                      );
                    }
                    
                    if (paragraph.includes(':') && paragraph.length < 100) {
                      return (
                        <h3 key={index} className="text-lg font-semibold mt-6 mb-3">
                          {paragraph}
                        </h3>
                      );
                    }
                    
                    return (
                      <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
