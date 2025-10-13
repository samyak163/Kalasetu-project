import React from 'react';
import { mockFeaturedArtisans } from '../data/mockData';

const FeaturedArtisans = () => (
    <section className="bg-white py-16 px-4 sm:px-8">
        <div className="container mx-auto max-w-7xl">
            <h3 className="text-3xl font-bold text-center text-[#1A1A1A] mb-2">Featured Local Talent</h3>
            <p className="text-center text-gray-600 mb-10">Meet some of the top-rated professionals on KalaSetu.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {mockFeaturedArtisans.map(artisan => (
                    <div key={artisan.name} className="bg-white rounded-lg overflow-hidden shadow-xl border border-gray-200 group cursor-pointer transition-transform duration-300 transform hover:-translate-y-2">
                        <div className="relative h-56">
                            <img src={artisan.image} alt={artisan.craft} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-6 relative">
                           <div className="flex justify-center -mt-16">
                               <img src={artisan.profilePic} alt={artisan.name} className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover" />
                           </div>
                           <div className="pt-6 text-center">
                             <h4 className="text-xl font-bold text-[#1A1A1A]">{artisan.name}</h4>
                             <p className="text-gray-500 text-sm">{artisan.craft}</p>
                           </div>
                           <div className="mt-6 flex justify-between items-center text-sm border-t pt-4">
                               <p className="text-gray-600">{artisan.location}</p>
                               <div className="flex items-center space-x-1 text-yellow-500 font-bold bg-yellow-100 px-2 py-1 rounded-full">
                                   <span>★</span><span>{artisan.rating}</span>
                               </div>
                           </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default FeaturedArtisans;
