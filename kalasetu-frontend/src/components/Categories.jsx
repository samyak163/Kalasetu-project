import React from 'react';
import { mockCategories } from '../data/mockData';

const Categories = () => (
    <section className="bg-[#F5F5F5] py-16 px-4 sm:px-8">
        <div className="container mx-auto max-w-7xl">
            <h3 className="text-3xl font-bold text-center text-[#1A1A1A] mb-2">Explore by Category</h3>
            <p className="text-center text-gray-600 mb-10">Find the service you need by browsing our most popular categories.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {mockCategories.map(category => (
                    <div key={category.name} className="relative rounded-lg overflow-hidden group cursor-pointer shadow-lg">
                        <img src={category.image} alt={category.name} className="w-full h-40 object-cover transform group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center p-2">
                            <h4 className="text-white text-lg md:text-xl font-bold text-center">{category.name}</h4>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default Categories;
