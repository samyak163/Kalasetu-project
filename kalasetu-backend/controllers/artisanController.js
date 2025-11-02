import Artisan from '../models/artisanModel.js';

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

// New: Nearby artisans based on lat/lng and radius (km)
const getNearbyArtisans = async (req, res) => {
    try {
        const { lat, lng, radiusKm, radius, limit = 20 } = req.query;

        if (lat == null || lng == null) {
            return res.status(400).json({ message: 'lat and lng query parameters are required' });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const rKm = radiusKm != null ? parseFloat(radiusKm) : null;
        const rMeters = radius != null ? parseFloat(radius) : null;
        const maxDistance = rMeters != null
            ? Math.max(0, rMeters)
            : Math.max(0, (rKm != null ? rKm : 10)) * 1000; // default 10km
        const maxResults = Math.min(100, Math.max(1, parseInt(limit)));

        // Use aggregation with $geoNear to compute distance
        const results = await Artisan.aggregate([
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: [longitude, latitude] },
                    distanceField: 'distance',
                    maxDistance: maxDistance || undefined,
                    spherical: true,
                    key: 'location',
                },
            },
            { $project: { password: 0 } },
            { $limit: maxResults },
        ]);

        // Return as array; distance is in meters
        return res.status(200).json({ data: results });
    } catch (error) {
        console.error('Error fetching nearby artisans:', error);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
 
export { getAllArtisans, getArtisanById, getArtisanByPublicId, getNearbyArtisans, updateArtisanProfile };