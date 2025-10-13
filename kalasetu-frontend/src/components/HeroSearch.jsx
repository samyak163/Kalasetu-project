import React from 'react';
// THE FIX: Added .jsx extension to the local import
import { SearchIcon, LocationIcon, CurrentLocationIcon } from './Icons.jsx';

// ... (rest of the component is the same)
const HeroSearch = () => (
    <section className="relative text-white py-20 md:py-32 px-4 sm:px-8">
        <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1599580506433-e6a8d67f1de2?q=80&w=1920&auto=format&fit=crop" className="w-full h-full object-cover" alt="Artisan marketplace" />
            <div className="absolute inset-0 bg-black opacity-60"></div>
        </div>
        <div className="relative container mx-auto text-center z-10 max-w-4xl">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Find Local Artisans in Your City</h2>
            <p className="text-md md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">Discover and connect with the best local talent, from handmade crafts to essential home services.</p>
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-2 flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
                <div className="flex-1 w-full flex items-center">
                    <span className="text-gray-500 pl-2"><LocationIcon /></span>
                    <input type="text" placeholder="Kothrud, Pune" className="w-full p-2 text-gray-800 focus:outline-none" />
                    <button className="text-gray-600 hover:text-[#A55233] p-2" title="Use current location"><CurrentLocationIcon /></button>
                </div>
                <div className="w-full md:w-px bg-gray-200 h-px md:h-8"></div>
                <div className="flex-1 w-full flex items-center">
                    <span className="text-gray-500 pl-2"><SearchIcon /></span>
                    <input type="text" placeholder="What service are you looking for?" className="w-full p-2 text-gray-800 focus:outline-none" />
                </div>
                <button className="w-full md:w-auto bg-[#A55233] text-white px-6 py-3 rounded-md hover:bg-[#8e462b] transition-colors font-semibold">Search</button>
            </div>
        </div>
    </section>
);

export default HeroSearch;