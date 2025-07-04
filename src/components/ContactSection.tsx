
import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

const ContactSection = () => {
  return (
    <section id="contact" className="bg-gray-50 pt-10 md:pt-14">
      <div className="container mx-auto px-4 pb-4">
        <div className="text-center mb-2">
          <div className="inline-block mb-3 px-4 py-1 bg-primary/10 rounded-full">
            <span className="text-primary font-medium">Contact</span>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-2xl font-bold mb-5">Contact Information</h3>
            <div className="space-y-5">
              <div className="flex items-start">
                <div className="mr-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-base font-medium mb-1">Our Office</h4>
                  <p className="text-muted-foreground">Kypranoros 13, 1061 Nicosia, Cyprus</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-base font-medium mb-1">Phone</h4>
                  <p className="text-muted-foreground">(+357) 25 123994</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-base font-medium mb-1">Email</h4>
                  <p className="text-muted-foreground">contact@big.com.cy</p>
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
