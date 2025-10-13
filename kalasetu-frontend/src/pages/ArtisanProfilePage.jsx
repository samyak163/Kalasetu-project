import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import the useParams hook

const ArtisanProfilePage = () => {
    // 1. useParams() reads the URL and finds the ':id' parameter we defined in our router.
    const { id } = useParams(); 

    // 2. We use state to hold the specific artisan's data.
    const [artisan, setArtisan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 3. useEffect hook to fetch the data for this one artisan.
    useEffect(() => {
        const fetchArtisanById = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                const response = await fetch(`${apiUrl}/api/artisans/${id}`); // Use the ID from the URL
                if (!response.ok) {
                    throw new Error('Artisan not found!');
                }
                const data = await response.json();
                setArtisan(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchArtisanById();
    }, [id]); // This effect re-runs if the 'id' in the URL ever changes.

    if (loading) {
        return <div className="text-center py-40">Loading profile...</div>;
    }

    if (error) {
        return <div className="text-center py-40 text-red-500">Error: {error}</div>;
    }

    if (!artisan) {
        return <div className="text-center py-40">Artisan not found.</div>;
    }

    // 4. A beautiful UI to display the fetched artisan data.
    return (
        <div>
            {/* Cover Image Section */}
            <div className="relative h-64 md:h-80 bg-gray-200">
                <img src={artisan.coverImageUrl} alt={`${artisan.fullName}'s work`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black opacity-30"></div>
            </div>

            {/* Profile Header Section */}
            <div className="container mx-auto max-w-5xl -mt-24 relative px-4">
                <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col md:flex-row items-center">
                    <img 
                        src={artisan.profileImageUrl} 
                        alt={artisan.fullName} 
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white object-cover -mt-16 md:-mt-24"
                    />
                    <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A]">{artisan.fullName}</h1>
                        <p className="text-lg text-[#A55233] font-semibold">{artisan.craft}</p>
                        <p className="text-md text-gray-600 mt-1">{artisan.location}</p>
                    </div>
                </div>
            </div>

            {/* Bio and Portfolio Section */}
            <div className="container mx-auto max-w-5xl mt-8 px-4 pb-16">
                <div className="bg-white rounded-lg shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">About Me</h2>
                    <p className="text-gray-700 leading-relaxed">{artisan.bio}</p>
                </div>
            </div>
        </div>
    );
};

export default ArtisanProfilePage;

