import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { optimizeImage } from '../utils/cloudinary.js';
import useCategories from '../hooks/useCategories.js';
import { mockCategories } from '../data/mockData.js';

const CATEGORY_IMAGES = {
  Handicrafts: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=500&auto=format&fit=crop',
  'Home Services': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=500&auto=format&fit=crop',
  'Food & Catering': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=500&auto=format&fit=crop',
  'Clothing & Tailoring': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=500&auto=format&fit=crop',
  'Wellness & Beauty': 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=500&auto=format&fit=crop',
};

const Categories = () => {
  const { categories, loading, error } = useCategories();

  const displayCategories = useMemo(() => {
    const active = Array.isArray(categories) && categories.length > 0 ? categories : mockCategories;
    return active.slice(0, 5).map((category) => ({
      ...category,
      image: category.image || CATEGORY_IMAGES[category.name] || CATEGORY_IMAGES.Handicrafts,
    }));
  }, [categories]);

  return (
    <section className="bg-[#F5F5F5] py-16 px-4 sm:px-8">
      <div className="container mx-auto max-w-7xl">
        <h3 className="text-3xl font-bold text-center text-[#1A1A1A] mb-2">Explore by Category</h3>
        <p className="text-center text-gray-600 mb-10">Find the service you need by browsing our most popular categories.</p>

        {error && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            Could not load live categories right now. Showing curated categories instead.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {loading && categories.length === 0
            ? Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`category-skeleton-${index}`}
                  className="h-40 animate-pulse rounded-lg bg-gray-200"
                />
              ))
            : displayCategories.map((category) => (
                <Link
                  to={`/search?category=${encodeURIComponent(category.name)}`}
                  key={category.name}
                  className="relative rounded-lg overflow-hidden group cursor-pointer shadow-lg"
                >
                  <img
                    src={optimizeImage(category.image, { width: 480, height: 160 })}
                    loading="lazy"
                    alt={category.name}
                    className="w-full h-40 object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center p-2">
                    <h4 className="text-white text-lg md:text-xl font-bold text-center">{category.name}</h4>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;