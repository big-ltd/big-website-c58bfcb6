
import React from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ContactSection = () => {
  return (
    <section id="contact" className="section bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-block mb-4 px-4 py-1 bg-primary/10 rounded-full">
            <span className="text-primary font-medium">Contact</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h3 className="text-2xl font-bold mb-6">Contact Us</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                  <Input id="name" placeholder="Your name" className="w-full" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                  <Input id="email" type="email" placeholder="Your email" className="w-full" />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-muted-foreground mb-1">Subject</label>
                <Input id="subject" placeholder="How can we help you?" className="w-full" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-muted-foreground mb-1">Message</label>
                <Textarea id="message" placeholder="Your message" className="w-full min-h-[150px]" />
              </div>
              <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </form>
          </div>
          
          <div className="flex flex-col justify-center">
            <div>
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="mr-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium mb-1">Our Office</h4>
                    <p className="text-muted-foreground">123 Business Street, New York, NY 10001, United States</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mr-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium mb-1">Phone</h4>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mr-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium mb-1">Email</h4>
                    <p className="text-muted-foreground">info@bigltd.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
