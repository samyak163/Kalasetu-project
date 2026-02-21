import { useEffect, useRef, useState } from 'react';

const BANNERS = [
  {
    src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop',
    alt: 'Discover traditional artisans',
    headline: 'Discover Traditional Artisans',
    sub: 'Handcrafted with love, delivered to your door',
  },
  {
    src: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=1920&auto=format&fit=crop',
    alt: 'Handmade craftsmanship',
    headline: 'Book Home Services',
    sub: 'Trusted professionals, verified by KalaSetu',
  },
  {
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1920&auto=format&fit=crop',
    alt: 'Artisan marketplace',
    headline: 'Support Local Artisans',
    sub: 'Every booking empowers a skilled craftsperson',
  },
];

/**
 * Full-width auto-rotating hero banner carousel.
 * 2:1 aspect ratio on mobile, 3:1 on desktop (md+).
 * Auto-advances every 5s, pauses on hover/touch.
 */
export default function HeroBannerCarousel() {
  const [current, setCurrent] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!paused.current) {
        setCurrent((prev) => (prev + 1) % BANNERS.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
      onTouchStart={() => { paused.current = true; }}
      onTouchEnd={() => { paused.current = false; }}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {BANNERS.map((banner, i) => (
          <div key={i} className="relative w-full shrink-0 aspect-[2/1] md:aspect-[3/1]">
            <img
              src={banner.src}
              alt={banner.alt}
              className="w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center">
              <div className="px-6 md:px-12 max-w-lg">
                <h2 className="text-xl md:text-3xl font-display font-bold text-white mb-1 md:mb-2">
                  {banner.headline}
                </h2>
                <p className="text-sm md:text-base text-white/80">{banner.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-black/30 ${
              i === current ? 'bg-white w-5' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
