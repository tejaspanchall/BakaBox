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
              <strong>Usage Data:</strong> We collect information about how you interact with our website, including:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Pages you visit and features you use</li>
              <li>Your interactions with anime-related content</li>
              <li>Performance metrics through Vercel Speed Insights</li>
              <li>Usage patterns through Vercel Analytics</li>
              <li>Radio streaming preferences and listening history</li>
              <li>Images uploaded for anime scene tracing (these are not stored permanently)</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Third-Party Account Data:</strong> When you use features that integrate with AniList (such as Life on Anime statistics 
              or birthday tracking), we access your public AniList profile data. We do not store this information permanently.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">How We Use Your Information</h2>
            <p className="text-gray-700 mb-2">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Provide, maintain, and improve our services</li>
              <li>Process and display anime scene search results</li>
              <li>Show relevant anime character birthdays</li>
              <li>Calculate and display anime watching statistics</li>
              <li>Provide radio streaming services</li>
              <li>Monitor website performance and user experience</li>
              <li>Analyze trends and usage patterns</li>
              <li>Prevent abuse and ensure security</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              Our website integrates with several third-party services:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li><strong>AniList API:</strong> Used to fetch anime and user data. Their privacy policy applies to data accessed through their service.</li>
              <li><strong>LISTEN.moe:</strong> Provides radio streaming services. Their terms and privacy policy apply to radio usage.</li>
              <li><strong>trace.moe:</strong> Used for anime scene searching. Uploaded images are processed according to their privacy policy.</li>
              <li><strong>Vercel Analytics & Speed Insights:</strong> Used to monitor website performance and usage patterns.</li>
            </ul>
            <p className="text-gray-700 mb-4">
              These services may collect information sent by your browser as part of their normal operations. Their collection and 
              use of information is governed by their respective privacy policies.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We do not permanently store any personal information or uploaded content. Images uploaded for anime scene 
              searching are processed in real-time and are not retained. AniList profile data is accessed only when needed 
              and is not stored on our servers.
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
              Last updated: March 15, 2024
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