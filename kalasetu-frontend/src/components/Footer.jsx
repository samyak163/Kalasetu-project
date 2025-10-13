import React from 'react';

const Footer = () => (
    <footer className="bg-[#1A1A1A] text-gray-300 py-10 px-4 sm:px-8">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left max-w-7xl">
            <div>
                <h3 className="text-xl font-bold text-[#A55233] mb-2">Kala<span className="text-white">Setu</span></h3>
                <p className="text-sm">Connecting communities, one craft at a time.</p>
            </div>
            <div>
                <h4 className="font-semibold text-white mb-2">Explore</h4>
                <a href="#" className="block hover:text-[#A55233] text-sm mb-1">Categories</a>
                <a href="#" className="block hover:text-[#A55233] text-sm mb-1">About Us</a>
            </div>
            <div>
                <h4 className="font-semibold text-white mb-2">For Artisans</h4>
                <a href="#" className="block hover:text-[#A55233] text-sm mb-1">Join Our Community</a>
                <a href="#" className="block hover:text-[#A55233] text-sm mb-1">How It Works</a>
            </div>
            <div>
                <h4 className="font-semibold text-white mb-2">Follow Us</h4>
                <div className="flex space-x-4 justify-center md:justify-start">
                    <a href="#" className="hover:text-[#A55233]">Social 1</a>
                    <a href="#" className="hover:text-[#A55233]">Social 2</a>
                </div>
            </div>
        </div>
        <div className="container mx-auto mt-8 border-t border-gray-700 pt-4 text-center text-sm max-w-7xl">
            <p>&copy; {new Date().getFullYear()} KalaSetu. All rights reserved.</p>
        </div>
    </footer>
);

export default Footer;
