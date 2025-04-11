import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300">Last updated: January 01, 2021</p>
          <p className="text-gray-300 mt-6">
            These Terms of Service ("Terms", "Terms of Service", "Terms and Conditions") govern your relationship with Match Story, our mobile application (the "Service") operated by Big Ltd ("BIG", "us", "we", or "our").
          </p>
          <p className="text-gray-300 mt-4">
            Please read these Terms and Conditions carefully before using any of our mobile applications.
          </p>
          <p className="text-gray-300 mt-4">
            Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.
          </p>
          <p className="text-gray-300 mt-4">
            By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Purchases</h2>
          <p className="text-gray-300">
            If you wish to purchase any product or service made available through the Service ("Purchase"), you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number, the expiration date of your credit card, your billing address, and your shipping information.
          </p>
          <p className="text-gray-300 mt-4">
            You represent and warrant that: (i) you have the legal right to use any credit card(s) or other payment method(s) in connection with any Purchase; and that (ii) the information you supply to us is true, correct and complete.
          </p>
          <p className="text-gray-300 mt-4">
            By submitting such information, you grant us the right to provide the information to third parties for purposes of facilitating the completion of Purchases.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Availability, Errors and Inaccuracies</h2>
          <p className="text-gray-300">
            We are constantly updating our offerings of products and services on the Service. The products or services available on our Service may be mispriced, described inaccurately, or unavailable, and we may experience delays in updating information on the Service and in our advertising on other web sites.
          </p>
          <p className="text-gray-300 mt-4">
            We cannot and do not guarantee the accuracy or completeness of any information, including prices, product images, specifications, availability, and services. We reserve the right to change or update information and to correct errors, inaccuracies, or omissions at any time without prior notice.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Accounts</h2>
          <p className="text-gray-300">
            When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>
          <p className="text-gray-300 mt-4">
            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.
          </p>
          <p className="text-gray-300 mt-4">
            You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </p>
          <p className="text-gray-300 mt-4">
            You may not use as a username the name of another person or entity or that is not lawfully available for use, a name or trademark that is subject to any rights of another person or entity other than you without appropriate authorization, or a name that is otherwise offensive, vulgar or obscene.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Intellectual Property</h2>
          <p className="text-gray-300">
            The Service and its original content, features and functionality are and will remain the exclusive property of BIG and its licensors. The Service is protected by copyright, trademark, and other laws of both Cyprus and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of BIG.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Links To Other Web Sites</h2>
          <p className="text-gray-300">
            Our Service may contain links to third-party web sites or services that are not owned or controlled by BIG.
          </p>
          <p className="text-gray-300 mt-4">
            BIG has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that BIG shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such web sites or services.
          </p>
          <p className="text-gray-300 mt-4">
            We strongly advise you to read the terms and conditions and privacy policies of any third-party web sites or services that you visit.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Termination</h2>
          <p className="text-gray-300">
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
          <p className="text-gray-300 mt-4">
            Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Limitation Of Liability</h2>
          <p className="text-gray-300">
            In no event shall BIG, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Disclaimer</h2>
          <p className="text-gray-300">
            Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
          </p>
          <p className="text-gray-300 mt-4">
            BIG its subsidiaries, affiliates, and its licensors do not warrant that a) the Service will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Governing Law</h2>
          <p className="text-gray-300">
            These Terms shall be governed and construed in accordance with the laws of the Republic of Cyprus, without regard to its conflict of law provisions.
          </p>
          <p className="text-gray-300 mt-4">
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have between us regarding the Service.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Changes</h2>
          <p className="text-gray-300">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
          <p className="text-gray-300 mt-4">
            By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4">Contact Us</h2>
          <p className="text-gray-300">
            If you have any questions about these Terms, please contact us at <a href="mailto:contact@big-ltd.com" className="text-primary hover:underline">contact@big-ltd.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
