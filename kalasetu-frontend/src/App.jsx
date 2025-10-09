// --- Helper Components (Icons) ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const CurrentLocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2c-4.418 0-8 3.582-8 8s8 14 8 14 8-9.582 8-8-3.582-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z" />
    </svg>
);
const FindIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);
const ConnectIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
);
const ReviewIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
);


// --- Mock Data ---
const mockCategories = [
    { name: 'Handicrafts', image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=500&auto=format&fit=crop' },
    { name: 'Home Services', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=500&auto=format&fit=crop' },
    { name: 'Food & Catering', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=500&auto=format&fit=crop' },
    { name: 'Clothing & Tailoring', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=500&auto=format&fit=crop' },
    { name: 'Wellness & Beauty', image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=500&auto=format&fit=crop' },
];

const mockFeaturedArtisans = [
    { name: 'Rohan Joshi', craft: 'Home Catering', location: 'Kothrud, Pune', rating: 4.9, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=600&auto=format&fit=crop', profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop' },
    { name: 'Priya Sharma', craft: 'Handmade Pottery', location: 'Koregaon Park, Pune', rating: 4.8, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=600&auto=format&fit=crop', profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&auto=format&fit=crop' },
    { name: 'Aniket Verma', craft: 'Leather Craftsman', location: 'Deccan Gymkhana, Pune', rating: 4.9, image: 'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=600&auto=format&fit=crop', profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' }
];

// --- Components ---

const Header = () => (
    <header className="bg-slate-900 text-white py-3 px-3 shadow-xl sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-none">
            <h1 
                className="font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent" 
                style={{fontSize: 'clamp(1.2rem, 5vw, 2rem)'}}
            >
                Kala<span className="text-white">Setu</span>
            </h1>
            <nav className="hidden md:flex items-center space-x-6">
                <a href="#" className="hover:text-orange-400 transition-colors text-sm">Home</a>
                <a href="#" className="hover:text-orange-400 transition-colors text-sm">Categories</a>
                <a href="#" className="hover:text-orange-400 transition-colors text-sm">About Us</a>
            </nav>
            <div className="flex items-center space-x-2">
                <button className="hidden sm:block border border-orange-400 text-orange-400 px-2 py-1 rounded hover:bg-orange-400 hover:text-slate-900 transition-all text-xs">
                    For Artisans
                </button>
                <button className="bg-gradient-to-r from-orange-500 to-red-500 px-2 py-1 rounded hover:from-orange-600 hover:to-red-600 transition-all text-xs">
                    Login / Sign Up
                </button>
            </div>
        </div>
    </header>
);

const HeroSearch = () => (
    <section className="relative text-white" style={{minHeight: '70vh', padding: '2rem 1rem'}}>
        <div className="absolute inset-0">
            <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop" 
                className="w-full h-full object-cover" 
                alt="Artisan marketplace background" 
            />
            <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        </div>
        <div className="relative z-10 text-center flex flex-col justify-center h-full">
            <h2 
                className="font-extrabold mb-4 leading-tight"
                style={{fontSize: 'clamp(1.8rem, 8vw, 4rem)'}}
            >
                Find Local Artisans in <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Your City</span>
            </h2>
            <p 
                className="text-gray-200 mb-8 max-w-3xl mx-auto"
                style={{fontSize: 'clamp(0.9rem, 4vw, 1.25rem)'}}
            >
                Discover and connect with the best local talent, from handmade crafts to essential home services.
            </p>
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-4 space-y-3">
                <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-gray-500 mr-3"><LocationIcon /></span>
                    <input 
                        type="text" 
                        placeholder="Kothrud, Pune" 
                        className="flex-1 text-gray-800 bg-transparent focus:outline-none"
                        style={{fontSize: 'clamp(0.9rem, 4vw, 1rem)'}}
                    />
                    <button className="text-gray-600 hover:text-orange-500 p-2 transition-colors">
                        <CurrentLocationIcon />
                    </button>
                </div>
                <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-gray-500 mr-3"><SearchIcon /></span>
                    <input 
                        type="text" 
                        placeholder="What service are you looking for?" 
                        className="flex-1 text-gray-800 bg-transparent focus:outline-none"
                        style={{fontSize: 'clamp(0.9rem, 4vw, 1rem)'}}
                    />
                </div>
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-semibold shadow-lg">
                    Search Now
                </button>
            </div>
        </div>
    </section>
);

const Categories = () => (
    <section className="bg-gradient-to-b from-gray-50 to-white py-12 px-3">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h3 
                    className="font-bold text-slate-900 mb-4"
                    style={{fontSize: 'clamp(1.5rem, 6vw, 2.5rem)'}}
                >
                    Explore by <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Category</span>
                </h3>
                <p 
                    className="text-gray-600 max-w-2xl mx-auto"
                    style={{fontSize: 'clamp(0.9rem, 4vw, 1.125rem)'}}
                >
                    Find the service you need by browsing our most popular categories.
                </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {mockCategories.map((category, index) => (
                    <div key={category.name} className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                        <div className="aspect-square relative">
                            <img 
                                src={category.image} 
                                alt={category.name} 
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-orange-600/80 transition-all duration-500"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center p-2">
                            <h4 
                                className="text-white font-bold text-center leading-tight group-hover:scale-110 transition-transform duration-300"
                                style={{fontSize: 'clamp(0.75rem, 3.5vw, 1.125rem)'}}
                            >
                                {category.name}
                            </h4>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const FeaturedArtisans = () => (
    <section className="bg-white py-12 px-3">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h3 
                    className="font-bold text-slate-900 mb-4"
                    style={{fontSize: 'clamp(1.5rem, 6vw, 2.5rem)'}}
                >
                    Featured Local <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Talent</span>
                </h3>
                <p 
                    className="text-gray-600 max-w-2xl mx-auto"
                    style={{fontSize: 'clamp(0.9rem, 4vw, 1.125rem)'}}
                >
                    Meet some of the top-rated professionals on KalaSetu.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockFeaturedArtisans.map((artisan, index) => (
                    <div key={artisan.name} className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 group cursor-pointer transform hover:-translate-y-3 transition-all duration-500 hover:shadow-2xl">
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <img 
                                src={artisan.image} 
                                alt={artisan.craft} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                        <div className="p-4 pt-0 relative">
                            <div className="relative -mt-12 mb-4 text-center">
                                <img 
                                    src={artisan.profilePic} 
                                    alt={artisan.name} 
                                    className="w-20 h-20 rounded-full border-4 border-white shadow-xl object-cover mx-auto group-hover:scale-110 transition-transform duration-300" 
                                />
                            </div>
                            <div className="text-center space-y-2">
                                <h4 
                                    className="font-bold text-slate-900"
                                    style={{fontSize: 'clamp(1rem, 4vw, 1.5rem)'}}
                                >{artisan.name}</h4>
                                <p 
                                    className="text-gray-500 font-medium"
                                    style={{fontSize: 'clamp(0.8rem, 3.5vw, 1rem)'}}
                                >{artisan.craft}</p>
                            </div>
                            <div className="mt-4 flex justify-between items-center text-sm">
                                <div className="flex items-center text-gray-600">
                                    <LocationIcon />
                                    <span className="ml-1 truncate" style={{fontSize: 'clamp(0.7rem, 3vw, 0.875rem)'}}>
                                        {artisan.location}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1 text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                                    <span className="text-yellow-500">★</span>
                                    <span className="text-slate-700" style={{fontSize: 'clamp(0.7rem, 3vw, 0.875rem)'}}>
                                        {artisan.rating}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const HowItWorks = () => (
    <section className="bg-gradient-to-b from-gray-50 to-white py-12 px-3">
        <div className="max-w-7xl mx-auto text-center">
            <div className="mb-12">
                <h3 
                    className="font-bold text-slate-900 mb-4"
                    style={{fontSize: 'clamp(1.5rem, 6vw, 2.5rem)'}}
                >
                    Getting Started is <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Easy</span>
                </h3>
                <p 
                    className="text-gray-600 max-w-2xl mx-auto"
                    style={{fontSize: 'clamp(0.9rem, 4vw, 1.125rem)'}}
                >
                    Connect with local artisans in just three simple steps
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center group">
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <FindIcon />
                    </div>
                    <div className="bg-orange-500 text-white text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center mb-3">1</div>
                    <h4 
                        className="font-semibold text-slate-900 mb-2"
                        style={{fontSize: 'clamp(1rem, 4vw, 1.5rem)'}}
                    >Find Your Artisan</h4>
                    <p 
                        className="text-gray-600"
                        style={{fontSize: 'clamp(0.8rem, 3.5vw, 1rem)'}}
                    >Use our powerful search to discover the perfect professional for your needs.</p>
                </div>
                <div className="flex flex-col items-center group">
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <ConnectIcon />
                    </div>
                    <div className="bg-orange-500 text-white text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center mb-3">2</div>
                    <h4 
                        className="font-semibold text-slate-900 mb-2"
                        style={{fontSize: 'clamp(1rem, 4vw, 1.5rem)'}}
                    >Connect Directly</h4>
                    <p 
                        className="text-gray-600"
                        style={{fontSize: 'clamp(0.8rem, 3.5vw, 1rem)'}}
                    >View their portfolio, read reviews, and contact them directly. No middleman.</p>
                </div>
                <div className="flex flex-col items-center group">
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <ReviewIcon />
                    </div>
                    <div className="bg-orange-500 text-white text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center mb-3">3</div>
                    <h4 
                        className="font-semibrel text-slate-900 mb-2"
                        style={{fontSize: 'clamp(1rem, 4vw, 1.5rem)'}}
                    >Share Your Feedback</h4>
                    <p 
                        className="text-gray-600"
                        style={{fontSize: 'clamp(0.8rem, 3.5vw, 1rem)'}}
                    >Leave a review after the service to help build a trusted community.</p>
                </div>
            </div>
        </div>
    </section>
);

const Footer = () => (
    <footer className="bg-gradient-to-r from-slate-900 to-slate-800 text-gray-300 py-8 px-3">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left mb-6">
                <div>
                    <h3 
                        className="font-bold mb-3 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent"
                        style={{fontSize: 'clamp(1rem, 4vw, 1.5rem)'}}
                    >
                        Kala<span className="text-white">Setu</span>
                    </h3>
                    <p 
                        className="text-gray-400"
                        style={{fontSize: 'clamp(0.8rem, 3.5vw, 1rem)'}}
                    >
                        Connecting communities, one craft at a time.
                    </p>
                </div>
                <div>
                    <h4 className="font-semibold text-white mb-3 text-base">Explore</h4>
                    <div className="space-y-2">
                        <a href="#" className="block hover:text-orange-400 transition-colors text-sm">Categories</a>
                        <a href="#" className="block hover:text-orange-400 transition-colors text-sm">About Us</a>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-white mb-3 text-base">For Artisans</h4>
                    <div className="space-y-2">
                        <a href="#" className="block hover:text-orange-400 transition-colors text-sm">Join Our Community</a>
                        <a href="#" className="block hover:text-orange-400 transition-colors text-sm">Success Stories</a>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-white mb-3 text-base">Follow Us</h4>
                    <div className="flex space-x-4 justify-center md:justify-start">
                        <a href="#" className="hover:text-orange-400 transition-colors text-sm">Facebook</a>
                        <a href="#" className="hover:text-orange-400 transition-colors text-sm">Instagram</a>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-700 pt-4 text-center">
                <p className="text-xs text-gray-400">
                    © {new Date().getFullYear()} KalaSetu. All rights reserved.
                </p>
            </div>
        </div>
    </section>
);

export default function App() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased" style={{margin: 0, padding: 0}}>
      <Header />
      <main>
        <HeroSearch />
        <Categories />
        <FeaturedArtisans />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}