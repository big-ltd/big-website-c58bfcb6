import React from 'react';
import { ArrowRight, Zap, Clock, Lock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    title: 'Lightning Fast',
    description: 'Our solutions are optimized for performance to deliver the best user experience.',
    icon: Zap,
  },
  {
    title: 'Timely Delivery',
    description: 'We value your time and ensure that projects are delivered on schedule.',
    icon: Clock,
  },
  {
    title: 'Secure & Reliable',
    description: 'Security is our priority. We implement best practices to protect your data.',
    icon: Lock,
  },
  {
    title: 'Quality Assured',
    description: 'Our rigorous testing process ensures high-quality, bug-free solutions.',
    icon: Star,
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="section">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-primary mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 order-1 lg:order-2">
            <h2 className="title-text mb-6">
              Why Choose <span className="gradient-text">big ltd</span>
            </h2>
            <p className="subtitle-text mb-6">
              With years of experience in the digital industry, we've helped hundreds of businesses transform their digital presence. Our team of experts is committed to delivering exceptional results.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <div className="h-1 w-1 rounded-full bg-primary mr-2"></div>
                <span className="text-muted-foreground">Expert developers and designers</span>
              </div>
              <div className="flex items-center">
                <div className="h-1 w-1 rounded-full bg-primary mr-2"></div>
                <span className="text-muted-foreground">Dedicated project managers</span>
              </div>
              <div className="flex items-center">
                <div className="h-1 w-1 rounded-full bg-primary mr-2"></div>
                <span className="text-muted-foreground">Transparent communication</span>
              </div>
            </div>
            <Button className="group bg-gradient-primary hover:opacity-90">
              <span>Learn More</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
