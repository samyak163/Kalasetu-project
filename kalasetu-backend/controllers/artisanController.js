import Artisan from '../models/artisanModel.js';
import { trackEvent } from '../utils/posthog.js';
import * as Sentry from '@sentry/node';

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

const getArtisanByPublicId = async (req, res) => {
    try {
        const artisan = await Artisan.findOne({ publicId: req.params.publicId }).select('-password');
        if (artisan) {
            res.json(artisan);
        } else {
            res.status(404).json({ message: 'Artisan not found' });
        }
    } catch (error) {
        console.error('Error fetching artisan by publicId:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getAllArtisans = async (req, res) => {
    try {
        const artisans = await Artisan.find({}).select('-password');
        res.json(artisans);
    } catch (error) {
        console.error('Error fetching all artisans:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getArtisanById = async (req, res) => {
    try {
        const artisan = await Artisan.findById(req.params.id).select('-password');
        if (artisan) {
            res.json(artisan);
        } else {
            res.status(404).json({ message: 'Artisan not found' });
        }
    } catch (error) {
        console.error('Error fetching artisan by id:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Update artisan profile
const updateArtisanProfile = async (req, res) => {
    try {
        const artisanId = req.user._id;

        // Whitelist of fields that can be updated via this endpoint
        const allowedFields = [
            'fullName', 'businessName', 'craft', 'bio', 'about',
            'location', 'address', 'skills', 'languages',
            'socialLinks', 'workingHours', 'minimumBookingNotice',
            'profileImageUrl', 'profileImage', 'coverImageUrl',
        ];

        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const artisan = await Artisan.findByIdAndUpdate(
            artisanId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!artisan) {
            return res.status(404).json({ message: 'Artisan not found' });
        }

        return res.status(200).json({
            success: true,
            data: artisan,
        });
    } catch (error) {
        console.error('Error updating artisan profile:', error);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Nearby artisans with filters and distance in km
const getNearbyArtisans = async (req, res) => {
    try {
        const { lat, lng, radius = 50, radiusKm = 50, limit = 20, skills = '', minRating = 0 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ 
                success: false,
                message: 'Latitude and longitude are required' 
            });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);

        // Validate coordinates
        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid coordinates' 
            });
        }

        // Use radius or radiusKm (radius is in km)
        const radiusInKm = parseFloat(radius) || parseFloat(radiusKm) || 100;
        const radiusInMeters = radiusInKm * 1000;
        const maxResults = Math.min(200, Math.max(1, parseInt(limit) || 50)); // Increased max from 100 to 200, default from 20 to 50

        // Set timeout for the query
        const queryTimeout = 10000; // 10 seconds

        try {
            // Try geospatial search first
            const pipeline = [
                {
                    $geoNear: {
                        near: { type: 'Point', coordinates: [longitude, latitude] },
                        distanceField: 'distance',
                        maxDistance: radiusInMeters,
                        spherical: true,
                        key: 'location',
                    },
                },
                { $addFields: { distanceKm: { $round: [{ $divide: ['$distance', 1000] }, 1] } } },
            ];

            const match = {};
            if (skills) {
                const skillsArray = String(skills).split(',').map(s => s.trim()).filter(Boolean);
                if (skillsArray.length) match.skills = { $in: skillsArray };
            }
            if (parseFloat(minRating) > 0) {
                match.averageRating = { $gte: parseFloat(minRating) };
            }
            // Note: isActive field may not exist in all schemas

            if (Object.keys(match).length) pipeline.push({ $match: match });

            pipeline.push({ $project: { password: 0 } }, { $limit: maxResults });

            // Execute with timeout
            const queryPromise = Artisan.aggregate(pipeline);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Query timeout')), queryTimeout)
            );

            const results = await Promise.race([queryPromise, timeoutPromise]);

            // Track with PostHog
            trackEvent(
                (req.user?.id || req.user?._id || 'anonymous').toString(),
                'nearby_artisans_searched',
                {
                    latitude,
                    longitude,
                    radius: radiusInKm,
                    results_count: results.length,
                    has_skills_filter: !!skills
                }
            );

            return res.status(200).json({
                success: true,
                artisans: results,
                count: results.length,
                searchCenter: { latitude, longitude },
                radiusKm: radiusInKm,
            });
        } catch (geoError) {
            console.warn('Geospatial query failed or timed out, using fallback:', geoError.message);
            
            // Fallback: return top-rated artisans
            const fallbackArtisans = await Artisan.find({})
                .select('fullName businessName profileImageUrl craft location address averageRating totalReviews publicId')
                .sort({ averageRating: -1 })
                .limit(maxResults)
                .lean();

            return res.status(200).json({
                success: true,
                artisans: fallbackArtisans,
                count: fallbackArtisans.length,
                searchCenter: { latitude, longitude },
                radiusKm: radiusInKm,
                message: 'No artisans found nearby. Showing top-rated artisans.'
            });
        }
    } catch (error) {
        console.error('Error fetching nearby artisans:', error);
        
        if (Sentry) {
            Sentry.captureException(error);
        }

        // Final fallback: return top-rated artisans on any error
        try {
            const fallbackArtisans = await Artisan.find({})
                .select('fullName businessName profileImageUrl craft location address averageRating totalReviews publicId')
                .sort({ averageRating: -1 })
                .limit(20)
                .lean();

            return res.status(200).json({
                success: true,
                artisans: fallbackArtisans,
                count: fallbackArtisans.length,
                message: 'Showing top-rated artisans'
            });
        } catch (fallbackError) {
            return res.status(500).json({ 
                success: false,
                message: 'Failed to fetch artisans',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};
 
export { getAllArtisans, getArtisanById, getArtisanByPublicId, getNearbyArtisans, updateArtisanProfile };