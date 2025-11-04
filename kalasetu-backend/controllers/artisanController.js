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
        const artisanId = req.user._id || req.user.id;
        const updates = req.body;

        // Remove sensitive fields that shouldn't be updated this way
        delete updates.password;
        delete updates.publicId;
        delete updates.loginAttempts;
        delete updates.lockUntil;

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
        const { lat, lng, radiusKm = 50, limit = 20, skills = '', minRating = 0 } = req.query;

        if (lat == null || lng == null) {
            return res.status(400).json({ message: 'lat and lng query parameters are required' });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const rKm = parseFloat(radiusKm) || 50;
        const maxDistance = Math.max(0, rKm) * 1000;
        const maxResults = Math.min(100, Math.max(1, parseInt(limit)));

        const pipeline = [
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: [longitude, latitude] },
                    distanceField: 'distance',
                    maxDistance,
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
            match.rating = { $gte: parseFloat(minRating) };
        }
        if (Object.keys(match).length) pipeline.push({ $match: match });

        pipeline.push({ $project: { password: 0 } }, { $limit: maxResults });

        const results = await Artisan.aggregate(pipeline);

        // Track with PostHog
        trackEvent({
            distinctId: req.user?.id || req.user?._id || 'anonymous',
            event: 'nearby_artisans_searched',
            properties: {
                latitude,
                longitude,
                radius: radiusKm,
                results_count: results.length,
                has_skills_filter: !!skills
            }
        });

        return res.status(200).json({
            success: true,
            artisans: results,
            count: results.length,
            searchCenter: { latitude, longitude },
            radiusKm: rKm,
        });
    } catch (error) {
        console.error('Error fetching nearby artisans:', error);
        
        if (Sentry) {
            Sentry.captureException(error);
        }

        return res.status(500).json({ 
            success: false,
            message: 'Failed to fetch nearby artisans',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
 
export { getAllArtisans, getArtisanById, getArtisanByPublicId, getNearbyArtisans, updateArtisanProfile };