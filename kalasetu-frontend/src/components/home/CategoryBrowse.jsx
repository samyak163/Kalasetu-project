import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { name: 'Pottery', emoji: '\uD83C\uDFFA' },
  { name: 'Weaving', emoji: '\uD83E\uDDF5' },
  { name: 'Jewelry Making', emoji: '\uD83D\uDC8D' },
  { name: 'Woodwork', emoji: '\uD83E\uDEB5' },
  { name: 'Painting', emoji: '\uD83C\uDFA8' },
  { name: 'Block Printing', emoji: '\uD83D\uDDA8\uFE0F' },
  { name: 'Textile Design', emoji: '\uD83D\uDC58' },
  { name: 'Metalwork', emoji: '\u2692\uFE0F' },
  { name: 'Stone Carving', emoji: '\uD83D\uDDFF' },
  { name: 'Embroidery', emoji: '\uD83E\uDEA1' },
  { name: 'Leather Craft', emoji: '\uD83D\uDC5C' },
  { name: 'Glass Art', emoji: '\uD83D\uDD2E' },
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
        {CATEGORIES.map(({ name, emoji }) => (
          <button
            key={name}
            onClick={() => handleCategoryClick(name)}
            className="group flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-gray-200 hover:border-[#A55233] hover:scale-[1.03] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#A55233] focus:ring-offset-2"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
              {emoji}
            </span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#A55233] transition-colors">
              {name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryBrowse;
