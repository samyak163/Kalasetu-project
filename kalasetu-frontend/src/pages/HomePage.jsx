import React from 'react';

// Import all the components we just created
import HeroSearch from '../components/HeroSearch';
import Categories from '../components/Categories';
import FeaturedArtisans from '../components/FeaturedArtisans';
import HowItWorks from '../components/HowItWorks';

// The HomePage component's only job is to assemble the other components in order.
const HomePage = () => {
    return (
        <>
            <HeroSearch />
            <Categories />
            <FeaturedArtisans />
            <HowItWorks />
        </>
    );
};

export default HomePage;
