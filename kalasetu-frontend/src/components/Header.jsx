import React from 'react';

const Header = () => (
    <header className="bg-[#1A1A1A] text-white py-4 px-8 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center max-w-7xl">
            <h1 className="text-2xl font-bold text-[#A55233]">Kala<span className="text-white">Setu</span></h1>
            <nav className="hidden md:flex items-center space-x-6">
                <a href="#" className="hover:text-[#A55233] transition-colors">Home</a>
                <a href="#" className="hover:text-[#A55233] transition-colors">Categories</a>
                <a href="#" className="hover:text-[#A55233] transition-colors">About Us</a>
            </nav>
            <div className="flex items-center space-x-4">
                <button className="hidden md:block border border-white px-4 py-2 rounded-md hover:bg-white hover:text-[#1A1A1A] transition-colors text-sm">For Artisans</button>
                <button className="bg-[#A55233] px-4 py-2 rounded-md hover:bg-[#8e462b] transition-colors text-sm">Login / Sign Up</button>
            </div>
        </div>
    </header>
);

export default Header;
