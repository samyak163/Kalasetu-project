import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-brand-900 text-gray-400" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link to="/" className="text-3xl font-display font-bold text-white">
              Kala<span className="text-brand-300">Setu</span>
            </Link>
            <p className="text-brand-200/70 text-base">
              Connecting you with the heart of craftsmanship. Discover unique, handmade products from local artisans.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-brand-200 tracking-wider uppercase">Discover</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link to="/" className="text-base text-brand-200/60 hover:text-white transition-colors">Home</Link></li>
                  <li><Link to="/search" className="text-base text-brand-200/60 hover:text-white transition-colors">Browse Artisans</Link></li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-brand-200 tracking-wider uppercase">For Artisans</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link to="/artisan/login" className="text-base text-brand-200/60 hover:text-white transition-colors">Artisan Login</Link></li>
                  <li><Link to="/artisan/register" className="text-base text-brand-200/60 hover:text-white transition-colors">Join as Artisan</Link></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-brand-200 tracking-wider uppercase">For Customers</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link to="/user/login" className="text-base text-brand-200/60 hover:text-white transition-colors">Customer Login</Link></li>
                  <li><Link to="/user/register" className="text-base text-brand-200/60 hover:text-white transition-colors">Sign Up</Link></li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-brand-200 tracking-wider uppercase">Legal</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link to="/privacy" className="text-base text-brand-200/60 hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-base text-brand-200/60 hover:text-white transition-colors">Terms & Conditions</Link></li>
                  <li><Link to="/shipping" className="text-base text-brand-200/60 hover:text-white transition-colors">Shipping Policy</Link></li>
                  <li><Link to="/refunds" className="text-base text-brand-200/60 hover:text-white transition-colors">Cancellation & Refund</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-brand-800 pt-8">
          <p className="text-base text-brand-200/50 xl:text-center">
            &copy; {new Date().getFullYear()} KalaSetu. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
