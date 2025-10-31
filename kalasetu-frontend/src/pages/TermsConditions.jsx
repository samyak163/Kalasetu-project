import React from 'react';

const TermsConditions = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
      
      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
        <p className="text-sm text-gray-500">Last Updated: November 1, 2025</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">1. Agreement to Terms</h2>
          <p>
            By accessing or using KalaSetu, you agree to be bound by these Terms and Conditions. 
            If you disagree with any part of these terms, you may not access our service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">2. Use of Service</h2>
          <p>Our service allows you to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Browse and discover handmade products from local artisans</li>
            <li>Create an account as a customer or artisan</li>
            <li>Purchase products from artisans</li>
            <li>List and sell your handmade products (as an artisan)</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">3. User Accounts</h2>
          <p>When creating an account, you must:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain the security of your account and password</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Be at least 18 years old or have parental consent</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">4. Artisan Responsibilities</h2>
          <p>If you register as an artisan, you agree to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Sell only authentic handmade products</li>
            <li>Provide accurate product descriptions and images</li>
            <li>Honor the prices and terms you set for your products</li>
            <li>Fulfill orders in a timely manner</li>
            <li>Provide quality customer service to buyers</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">5. Prohibited Activities</h2>
          <p>You may not:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the service for any illegal purpose</li>
            <li>Sell counterfeit or stolen items</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Post false or misleading information</li>
            <li>Attempt to bypass security measures</li>
            <li>Use automated systems to access the service</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">6. Payment Terms</h2>
          <p>
            All payments are processed securely through our payment partner Razorpay. 
            Prices are listed in Indian Rupees (INR) and include applicable taxes. 
            Payment must be made in full before order processing begins.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">7. Intellectual Property</h2>
          <p>
            The KalaSetu platform, including its design, functionality, and content, is protected by 
            copyright and other intellectual property laws. You may not copy, modify, or distribute 
            any part of our service without our written permission.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">8. Limitation of Liability</h2>
          <p>
            KalaSetu acts as a marketplace connecting buyers and artisans. We are not responsible for 
            the quality, safety, or legality of products sold, the accuracy of listings, or the ability 
            of artisans to complete transactions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">9. Termination</h2>
          <p>
            We reserve the right to terminate or suspend your account at our sole discretion, without 
            notice, for conduct that we believe violates these Terms or is harmful to other users, us, 
            or third parties, or for any other reason.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any 
            material changes by posting the new Terms on this page.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">11. Contact Us</h2>
          <p>
            For questions about these Terms & Conditions, please contact us at:
            <br />
            <strong>Email:</strong> support@kalasetu.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsConditions;
