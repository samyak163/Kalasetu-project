import React from 'react';
import { Search, MessageCircle, Star } from 'lucide-react';

const HowItWorks = () => (
    <section className="bg-gray-50 py-16 px-4 sm:px-8">
        <div className="container mx-auto text-center max-w-7xl">
            <h3 className="text-3xl font-bold text-gray-900 mb-12">Getting Started is Easy</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="flex flex-col items-center">
                    <div className="bg-brand-500 text-white p-4 rounded-full mb-4"><Search className="w-6 h-6" /></div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">1. Find Your Artisan</h4>
                    <p className="text-gray-600">Use our powerful search to discover the perfect professional for your needs.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-brand-500 text-white p-4 rounded-full mb-4"><MessageCircle className="w-6 h-6" /></div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">2. Connect Directly</h4>
                    <p className="text-gray-600">View their portfolio, read reviews, and contact them directly. No middleman.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-brand-500 text-white p-4 rounded-full mb-4"><Star className="w-6 h-6" /></div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">3. Share Your Feedback</h4>
                    <p className="text-gray-600">Leave a review after the service to help build a trusted community.</p>
                </div>
            </div>
        </div>
    </section>
);

export default HowItWorks;
