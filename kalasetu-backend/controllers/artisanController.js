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

export { getAllArtisans, getArtisanById, getArtisanByPublicId };