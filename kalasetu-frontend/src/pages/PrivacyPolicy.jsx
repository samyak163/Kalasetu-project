import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
        <p className="text-sm text-gray-500">Last Updated: November 1, 2025</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">1. Introduction</h2>
          <p>
            Welcome to KalaSetu. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you about how we look after your personal data when you visit our 
            website and tell you about your privacy rights and how the law protects you.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">2. Information We Collect</h2>
          <p>We collect and process the following types of personal data:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Identity Data:</strong> Name, username, profile picture</li>
            <li><strong>Contact Data:</strong> Email address, phone number</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
            <li><strong>Profile Data:</strong> Your interests, preferences, feedback, and survey responses</li>
            <li><strong>Usage Data:</strong> Information about how you use our website and services</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">3. How We Use Your Information</h2>
          <p>We use your personal data for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To register you as a new USER or artisan</li>
            <li>To manage your account and provide USER support</li>
            <li>To process and deliver orders</li>
            <li>To send you updates about your orders and account</li>
            <li>To improve our website and services</li>
            <li>To protect against fraud and ensure security</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">4. Data Security</h2>
          <p>
            We have implemented appropriate security measures to prevent your personal data from being 
            accidentally lost, used, or accessed in an unauthorized way. We limit access to your personal 
            data to those employees, agents, contractors, and other third parties who have a business need to know.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">5. Third-Party Services</h2>
          <p>We use the following third-party services that may collect your data:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Firebase:</strong> For authentication and user management</li>
            <li><strong>Cloudinary:</strong> For image storage and delivery</li>
            <li><strong>Razorpay:</strong> For payment processing</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">6. Your Legal Rights</h2>
          <p>Under data protection laws, you have rights including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Right to access your personal data</li>
            <li>Right to correct your personal data</li>
            <li>Right to erase your personal data</li>
            <li>Right to object to processing of your personal data</li>
            <li>Right to data portability</li>
            <li>Right to withdraw consent</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">7. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our website and store 
            certain information. You can instruct your browser to refuse all cookies or to indicate when 
            a cookie is being sent.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 mt-8">8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            <strong>Email:</strong> privacy@kalasetu.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
