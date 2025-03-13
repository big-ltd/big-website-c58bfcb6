
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Privacy = () => {
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
        
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 mb-4">
            B.I.G Berry Interactive Games Ltd. and/or its group companies, (collectively referred to as "BIG") has adopted this privacy policy ("Privacy Policy") to explain how BIG collects, stores, and uses the information collected in connection with BIG's products and services.
          </p>
          
          <p className="text-gray-300 mb-4">BIG's services include</p>
          <ul className="list-disc pl-6 mb-4 text-gray-300">
            <li>Company website (https://www.big.yo);</li>
            <li>Match Story mobile application on iOS and Android.</li>
          </ul>
          
          <p className="text-gray-300 mb-8">(collectively, the "Services").<br />
          By accessing the Services in any way you agree to this privacy policy and to the disclosure and processing of information as described herein.</p>
          
          <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
          <p className="text-gray-300 mb-8">
            We only collect information about you if we have a reason to do so; for example, to provide our Services, to communicate with you, or to make our Services better. We collect information in three ways: if and when you provide information to us, automatically through operating our Services, and from outside sources. Let's go over the information that we collect.
          </p>
          
          <h2 className="text-2xl font-bold mb-4">Information You Provide to Us</h2>
          <p className="text-gray-300 mb-4">
            The amount and type of information depends on the context and how we use the information. Here is one example:
          </p>
          <ul className="list-disc pl-6 mb-8 text-gray-300">
            <li>Contact form information: We ask for basic information from you in order to be able to provide assistance with our services. For example, we ask you to provide an email address so that we can return a message.</li>
          </ul>
          
          <h2 className="text-2xl font-bold mb-4">Information We Collect Automatically</h2>
          <p className="text-gray-300 mb-4">
            We collect some information automatically. Here are a few examples:
          </p>
          <ul className="list-disc pl-6 mb-8 text-gray-300">
            <li className="mb-3">Log Information: Like most online service providers, we collect information that web browsers, mobile devices, and servers typically make available, such as the browser type, IP address, unique device identifiers, language preference, referring site, the date and time of access, operating system, and mobile network information. We collect log information when you use our Services.</li>
            <li className="mb-3">Usage Information: We collect information about your usage of our Services. For example, we collect information about the actions that users perform on a website or mobile application, along with information about your device (e.g., screen size, name of cellular network, and mobile device manufacturer). We use this information to get insights on how people use our Services, so we can make our Services better.</li>
            <li className="mb-3">Location Information: We may determine the approximate location of your device from your IP address. We collect and use this information to, for example, calculate how many people visit our Services from certain geographic regions. We may also collect information about your precise location via our mobile apps (when, for example, you post a photograph with location information) if you allow us to do so through your mobile device operating system's permissions.</li>
            <li>Information from Cookies & Other Technologies: We use cookies and other technologies like pixel tags to help us identify and track visitors, usage, and access preferences for our Services, as well as track and understand email campaign effectiveness and to deliver targeted ads.</li>
          </ul>
          
          <h2 className="text-2xl font-bold mb-4">Purposes for Using Information</h2>
          <p className="text-gray-300 mb-4">
            We use information about you as mentioned above and for the purposes listed below:
          </p>
          <ul className="list-disc pl-6 mb-8 text-gray-300">
            <li>To provide our Services;</li>
            <li>To further develop and improve our Services;</li>
            <li>To monitor and analyse trends and better understand how users interact with our Services, which helps us improve our Services and make them easier to use;</li>
            <li>To measure, gauge, and improve the effectiveness of our advertising, and better understand user engagement;</li>
            <li>To monitor and prevent any problems with our Services, protect the security of our Services;</li>
            <li>To communicate with you, for example through an email, to provide customer support;</li>
            <li>To personalize your experience using our Services.</li>
          </ul>
          
          <h2 className="text-2xl font-bold mb-4">Legal Bases for Collecting and Using Information</h2>
          <p className="text-gray-300 mb-8">
            A note here for those in the European Union about our legal grounds for processing information about you under EU data protection laws, which is that our use of your information is based on the grounds that: (1) The use is necessary in order to fulfill our commitments to you under the applicable terms of service or other agreements with you or is necessary to administer your account or (2) The use is necessary for compliance with a legal obligation; or (3) The use is necessary in order to protect your vital interests or those of another person; or (4) We have a legitimate interest in using your information -- for example, to provide and update our Services; to improve our Services so that we can offer you an even better user experience; to safeguard our Services; to communicate with you; to measure, gauge, and improve the effectiveness of our advertising; to understand our user retention and attrition; to monitor and prevent any problems with our Services; and to personalize your experience; or (5) You have given us your consent--for example before we place certain cookies on your device and access and analyze them later on.
          </p>
          
          <h2 className="text-2xl font-bold mb-4">How We Share Information</h2>
          <p className="text-gray-300 mb-4">
            We do not sell our users' private personal information. We share information about you in the limited circumstances spelled out below and with appropriate safeguards on your privacy:
          </p>
          <ul className="list-disc pl-6 mb-8 text-gray-300">
            <li className="mb-3">Subsidiaries, Employees, and Independent Contractors: We may disclose information about you to our subsidiaries, our employees, and individuals who are our independent contractors that need to know the information in order to help us provide our Services or to process the information on our behalf. We require our subsidiaries, employees, and independent contractors to follow this Privacy Policy for personal information that we share with them.</li>
            <li>Third Party Vendors: We may share information about you with third party vendors who need to know information about you in order to provide their services to us, or to provide their services to you or your site. This group includes vendors that help us provide our Services to you, those that assist us with our marketing efforts (e.g. by providing tools for identifying a specific marketing target group or improving our marketing campaigns), those that help us understand and enhance our Services (like analytics providers), and companies that make products available on our websites, who may need information about you in order to, for example, provide technical or other support services to you. We require vendors to agree to privacy commitments in order to share information with them.</li>
          </ul>
          
          <h2 className="text-2xl font-bold mb-4">Information Shared Publicly</h2>
          <p className="text-gray-300 mb-8">
            Information that you choose to make public is disclosed publicly. That means, of course, that information like your public profile, are all available to others. Public information may also be indexed by search engines or used by third parties. Please keep all of this in mind when deciding what you would like to share.
          </p>
          
          <h2 className="text-2xl font-bold mb-4">How Long We Keep Information</h2>
          <p className="text-gray-300 mb-8">
            We generally discard information about you when we no longer need the information for the purposes for which we collect and use it and we are not legally required to continue to keep it.
          </p>
          
          <h2 className="text-2xl font-bold mb-4">Security</h2>
          <p className="text-gray-300 mb-8">
            While no online service is 100% secure, we work very hard to protect information about you against unauthorized access, use, alteration, or destruction, and take reasonable measures to do so, such as monitoring our Services for potential vulnerabilities and attacks.
          </p>
          
          <h2 className="text-2xl font-bold mb-4">Choices</h2>
          <p className="text-gray-300 mb-4">
            You have several choices available when it comes to information about you:
          </p>
          <ul className="list-disc pl-6 mb-8 text-gray-300">
            <li className="mb-3">Limit the Information that You Provide: If you have an account with us, you can choose not to provide the optional account information, profile information, and transaction and billing information. Please keep in mind that if you do not provide this information, certain features of our Services may not be accessible.</li>
            <li className="mb-3">Limit Access to Information on Your Mobile Device: Your mobile device operating system should provide you with the ability to discontinue our ability to collect stored information or location information via our mobile apps. If you do so, you may not be able to use certain features (like adding a location to a photograph, for example).</li>
            <li className="mb-3">Opt-Out of Marketing Communications: You may opt out of receiving promotional communications from us. Just follow the instructions in those communications or let us know. If you opt out of promotional communications, we may still send you other communications, like those about your account and legal notices.</li>
            <li className="mb-3">Set Your Browser to Reject Cookies: You can usually choose to set your browser to remove or reject browser cookies before using BIG's websites, with the drawback that certain features of BIG's websites may not function properly without the aid of cookies.</li>
            <li>Close Your Account: You can close your account. Please keep in mind that we may continue to retain your information after closing your account, as described in How Long We Keep Information above.</li>
          </ul>
          
          <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
          <p className="text-gray-300 mb-4">
            If you are located in certain countries, including those that fall under the scope of the European General Data Protection Regulation (AKA the "GDPR"), data protection laws give you rights with respect to your personal data, subject to any exemptions provided by the law, including the rights to:
          </p>
          <ul className="list-disc pl-6 mb-8 text-gray-300">
            <li>Request access to your personal data;</li>
            <li>Request correction or deletion of your personal data;</li>
            <li>Object to our use and processing of your personal data;</li>
            <li>Request that we limit our use and processing of your personal data; and</li>
            <li>Request portability of your personal data.</li>
          </ul>
          <p className="text-gray-300 mb-8">
            You can usually access, correct, or delete your personal data using your account settings and tools that we offer, but if you aren't able to do that, or you would like to contact us about one of the other rights, scroll down to How to Reach Us to, well, find out how to reach us. EU individuals also have the right to make a complaint to a government supervisory authority.
          </p>
          
          <h2 className="text-2xl font-bold mb-4">Controllers and Responsible Companies</h2>
          <p className="text-gray-300 mb-8">
            BIG's Services are worldwide. Different BIG companies are the controller (or co-controller) of personal information, which means that they are the company responsible for processing that information, based on the particular service and the location of the individual using our Services. Depending on the Services you use, more than one company may be the controller of your personal data. Generally, the "controller" is the BIG company that entered into the contract with you under the Terms of Service for the product or service you use.
          </p>
          
          <h2 className="text-2xl font-bold mb-4">How to Reach Us</h2>
          <p className="text-gray-300 mb-8">
            If you have a question about this Privacy Policy, or you would like to contact us about any of the rights mentioned in the Your Rights section above, please contact us by sending an email to support@big-ltd.com
          </p>
          
          <h2 className="text-2xl font-bold mb-4">Transferring Information</h2>
          <p className="text-gray-300 mb-4">
            Because BIG's Services are offered worldwide, the information about you that we process when you use the Services in the EU may be used, stored, and/or accessed by individuals operating outside the European Economic Area (EEA) who work for us, other members of our group of companies, or third party data processors. This is required for the purposes listed in the How and Why We Use Information section above. When providing information about you to entities outside the EEA, we will take appropriate measures to ensure that the recipient protects your personal information adequately in accordance with this Privacy Policy as required by applicable law. These measures include:
          </p>
          <ul className="list-disc pl-6 mb-8 text-gray-300">
            <li>In the case of US based entities, entering into European Commission approved standard contractual arrangements with them, or ensuring they have signed up to the EU-US Privacy Shield; or</li>
            <li>In the case of entities based in other countries outside the EEA, entering into European Commission approved standard contractual arrangements with them.</li>
          </ul>
          <p className="text-gray-300 mb-8">
            You can ask us for more information about the steps we take to protect your personal information when transferring it from the EU.
          </p>
          
          <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
          <p className="text-gray-300 mb-8">
            Our Services do not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. In the case we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we will be able to do necessary actions.
          </p>
          
          <h2 className="text-2xl font-bold mb-4">Ads and Analytics Services Provided by Others</h2>
          <p className="text-gray-300 mb-8">
            Ads appearing on any of our Services may be delivered by advertising networks. Other parties may also provide analytics services via our Services. These ad networks and analytics providers may set tracking technologies (like cookies) to collect information about your use of our Services and across other websites and online services. These technologies allow these third parties to recognize your device to compile information about you or others who use your device. This information allows us and other companies to, among other things, analyse and track usage, determine the popularity of certain content, and deliver advertisements that may be more targeted to your interests. Please note this Privacy Policy only covers the collection of information by BIG and does not cover the collection of information by any third party advertisers or analytics providers.
          </p>
          
          <h2 className="text-2xl font-bold mb-4">Privacy Policy Changes</h2>
          <p className="text-gray-300 mb-8">
            Although most changes are likely to be minor, BIG may change its Privacy Policy from time to time. BIG encourages visitors to frequently check this page for any changes to its Privacy Policy. If we make changes, we will notify you by revising the change log below. Your further use of the Services after a change to our Privacy Policy will be subject to the updated policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
