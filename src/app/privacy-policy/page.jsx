'use client';

import React from 'react';
import Link from 'next/link';

const PrivacyPolicy = () => {
  return (
    <div className="font-['Chivo',_sans-serif]">
      <div className="max-w-4xl mx-auto px-5 py-10">
        <div className="bg-white p-8 rounded-2xl shadow-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Privacy Policy</h1>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Introduction</h2>
            <p className="text-gray-700 mb-4">
              Welcome to BakaBox. We respect your privacy and are committed to protecting the personal information 
              that you share with us. This Privacy Policy explains how we collect, use, and safeguard your information 
              when you visit our anime information website.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              <strong>Automatically Collected Information:</strong> When you visit our website, we may automatically 
              collect certain information about your device, including information about your web browser, IP address, 
              time zone, and some of the cookies that are installed on your device.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Usage Data:</strong> We may collect information about how you interact with our website, including 
              which pages you visit, what anime you view, and other actions you take while using our service.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">How We Use Your Information</h2>
            <p className="text-gray-700 mb-2">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Provide, maintain, and improve our services</li>
              <li>Understand and analyze how you use our website</li>
              <li>Develop new features and functionality</li>
              <li>Personalize your experience by showing you relevant anime content</li>
              <li>Monitor and analyze trends and usage of our website</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              Our website uses third-party services such as Anilist API to provide anime information. These services 
              may collect information sent by your browser as part of their normal operations. Their collection and 
              use of information is governed by their respective privacy policies.
            </p>
            <p className="text-gray-700 mb-4">
              We use analytics services like Vercel Analytics to help us understand how users interact with our website. 
              These tools collect information about your use of the website, which helps us improve our services.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Cookies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar tracking technologies to track activity on our website and hold certain information. 
              Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct 
              your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Data Security</h2>
            <p className="text-gray-700 mb-4">
              We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, 
              disclosure, alteration, and destruction.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our service is not intended for users under the age of 13. We do not knowingly collect personally identifiable 
              information from children under 13. If we discover that a child under 13 has provided us with personal information, 
              we will delete such information from our servers.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Changes to This Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy 
              Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-700">
              <a href="mailto:contact@bakabox.com" className="text-blue-600 hover:underline">contact@bakabox.com</a>
            </p>
          </section>
          
          <div className="mt-10 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              Last updated: March 2, 2025
            </p>
            <Link href="/" className="inline-block mt-4 text-blue-600 hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;