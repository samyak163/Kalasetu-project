import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  {
    name: 'Pottery',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=500&auto=format&fit=crop',
  },
  {
    name: 'Weaving',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=500&auto=format&fit=crop',
  },
  {
    name: 'Jewelry Making',
    image: 'https://images.unsplash.com/photo-1515562141589-67f0d569b6c4?q=80&w=500&auto=format&fit=crop',
  },
  {
    name: 'Woodwork',
    image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=500&auto=format&fit=crop',
  },
  {
    name: 'Painting',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=500&auto=format&fit=crop',
  },
  {
    name: 'Block Printing',
    image: 'https://images.unsplash.com/photo-1604076913837-52ab5f9e5d04?q=80&w=500&auto=format&fit=crop',
  },
  {
    name: 'Textile Design',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=500&auto=format&fit=crop',
  },
  {
    name: 'Metalwork',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=500&auto=format&fit=crop',
  },
  {
    name: 'Stone Carving',
    image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=500&auto=format&fit=crop',
  },
  {
    name: 'Embroidery',
    image: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?q=80&w=500&auto=format&fit=crop',
  },
  {
    name: 'Leather Craft',
    image: 'https://images.unsplash.com/photo-1473188588951-666fce8e7c68?q=80&w=500&auto=format&fit=crop',
  },
  {
    name: 'Glass Art',
    image: 'https://images.unsplash.com/photo-1543060829-a0029874b4a2?q=80&w=500&auto=format&fit=crop',
  },
];

const CategoryBrowse = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    navigate(`/search?q=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
        Explore by Craft
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {CATEGORIES.map(({ name, image }) => (
          <button
            key={name}
            onClick={() => handleCategoryClick(name)}
            className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 aspect-[4/3]"
          >
            <img
              src={image}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
              <span className="text-white text-sm sm:text-base font-semibold text-center px-2">
                {name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryBrowse;
