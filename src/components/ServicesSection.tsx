
import React from 'react';
import { Check, Code, Server, Smartphone, Palette, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const services = [
  {
    title: 'Web Development',
    description: 'Custom web applications built with the latest technologies to meet your specific needs.',
    icon: Code,
    gradient: 'from-[#5E3BA5] to-[#361E75]',
  },
  {
    title: 'Mobile Applications',
    description: 'Native and cross-platform mobile apps that deliver seamless user experiences.',
    icon: Smartphone,
    gradient: 'from-[#5E3BA5] to-[#361E75]',
  },
  {
    title: 'Cloud Solutions',
    description: 'Scalable and secure cloud infrastructure for your business applications.',
    icon: Server,
    gradient: 'from-[#5E3BA5] to-[#361E75]',
  },
  {
    title: 'UI/UX Design',
    description: 'Intuitive and engaging user interfaces designed for optimal user experience.',
    icon: Palette,
    gradient: 'from-[#5E3BA5] to-[#361E75]',
  },
  {
    title: 'Data Analytics',
    description: 'Gain valuable insights from your data to make informed business decisions.',
    icon: BarChart3,
    gradient: 'from-[#5E3BA5] to-[#361E75]',
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="section bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="title-text mb-4">Our <span className="gradient-text">Services</span></h2>
          <p className="subtitle-text max-w-2xl mx-auto">
            We provide a comprehensive range of digital services to help your business thrive in the digital landscape.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={cn(
                "inline-flex p-3 rounded-lg bg-gradient-to-br mb-4",
                service.gradient
              )}>
                <service.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-muted-foreground mb-4">{service.description}</p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm">Custom solutions</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm">Expert team</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm">Ongoing support</span>
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
