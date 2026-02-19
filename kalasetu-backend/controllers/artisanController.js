/**
 * @file artisanController.js — Public Artisan Browsing
 *
 * Handles PUBLIC (unauthenticated) artisan discovery — listing, searching,
 * filtering, and viewing artisan profiles. No auth middleware required.
 *
 * Endpoints:
 *  GET /api/artisans              — Paginated list of active artisans (sorted by rating)
 *  GET /api/artisans/:id          — Get artisan by MongoDB ObjectId
 *  GET /api/artisans/p/:publicId  — Get artisan by public nanoid (URL-friendly)
 *  GET /api/artisans/nearby       — Geospatial search with distance (2dsphere)
 *  GET /api/artisans/featured     — Top 8 artisans for homepage display
 *  PUT /api/artisans/profile      — Update profile (legacy, prefer artisanProfileController)
 *
 * Security: PUBLIC_FIELDS whitelist ensures sensitive data (bank details,
 * verification documents, auth tokens, OTP codes) is never exposed.
 *
 * Geospatial: getNearbyArtisans uses MongoDB $geoNear aggregation with
 * fallback to top-rated artisans if the geo query fails or times out.
 *
 * @see artisanProfileController.js — Authenticated profile management
 * @see routes/artisanRoutes.js — Route definitions for /api/artisans/*
 */

import Artisan from '../models/artisanModel.js';
import { trackEvent } from '../utils/posthog.js';
import * as Sentry from '@sentry/node';

// Fields safe for public consumption (excludes bank details, verification docs, auth tokens, OTP)
const PUBLIC_FIELDS = [
  'publicId', 'slug', 'fullName', 'craft',
  'businessName', 'tagline', 'location', 'bio',
  'profileImageUrl', 'coverImageUrl', 'portfolioImageUrls',
  'isActive', 'isVerified', 'emailVerified',
  'yearsOfExperience', 'teamSize', 'languagesSpoken', 'certifications',
  'businessPhone', 'whatsappNumber',
  'workingHours', 'emergencyServices', 'serviceRadius', 'minimumBookingNotice',
  'profileViews', 'totalBookings', 'completedBookings', 'averageRating', 'totalReviews',
  'responseRate', 'acceptanceRate',
  'autoAcceptBookings', 'bufferTimeBetweenBookings', 'maxBookingsPerDay',
  'subscriptionPlan', 'isOnline', 'vacationMode',
  'createdAt', 'updatedAt',
].join(' ');

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
        const artisan = await Artisan.findOne({ publicId: req.params.publicId }).select(PUBLIC_FIELDS);
        if (artisan) {
            res.json(artisan);
        } else {
            res.status(404).json({ message: 'Artisan not found' });
        }
    } catch (error) {
        console.error('Error fetching artisan by publicId:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAllArtisans = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
        const skip = (page - 1) * limit;

        const [artisans, total] = await Promise.all([
            Artisan.find({ isActive: true }).select(PUBLIC_FIELDS)
                .sort({ averageRating: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Artisan.countDocuments({ isActive: true }),
        ]);

        res.json({
            artisans,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('Error fetching all artisans:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getArtisanById = async (req, res) => {
    try {
        const artisan = await Artisan.findById(req.params.id).select(PUBLIC_FIELDS);
        if (artisan) {
            res.json(artisan);
        } else {
            res.status(404).json({ message: 'Artisan not found' });
        }
    } catch (error) {
        console.error('Error fetching artisan by id:', error);
        res.status(500).json({ message: 'Server Error' });
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
        return res.status(500).json({ message: 'Server Error' });
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
                        query: { isActive: true },
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
            if (Object.keys(match).length) pipeline.push({ $match: match });

            pipeline.push({
                $project: {
                    password: 0, bankDetails: 0, verificationDocuments: 0,
                    resetPasswordToken: 0, resetPasswordExpires: 0,
                    emailVerificationToken: 0, emailVerificationExpires: 0,
                    emailVerificationCode: 0, phoneVerificationCode: 0, phoneVerificationExpires: 0,
                    pendingEmail: 0, pendingPhoneNumber: 0,
                    otpCode: 0, otpExpires: 0, otpAttempts: 0,
                    loginAttempts: 0, lockUntil: 0, firebaseUid: 0,
                    gstNumber: 0, notifications: 0,
                }
            }, { $limit: maxResults });

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
            
            // Fallback: return top-rated active artisans
            const fallbackArtisans = await Artisan.find({ isActive: true })
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
 
// Featured artisans: top-rated active artisans for homepage display
const getFeaturedArtisans = async (req, res) => {
    try {
        const artisans = await Artisan.find({ isActive: true })
            .select(PUBLIC_FIELDS)
            .sort({ averageRating: -1 })
            .limit(8)
            .lean();

        res.json({ success: true, data: artisans });
    } catch (error) {
        console.error('Error fetching featured artisans:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch featured artisans' });
    }
};

export { getAllArtisans, getArtisanById, getArtisanByPublicId, getNearbyArtisans, updateArtisanProfile, getFeaturedArtisans };