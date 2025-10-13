import Artisan from '../models/artisanModel.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

const registerArtisan = async (req, res) => {
    const { fullName, email, phoneNumber, password, craft, location } = req.body;
    try {
        const emailExists = await Artisan.findOne({ email });
        // THE FIX: The check below was using the wrong variable. It should be 'emailExists'.
        if (emailExists) {
            res.status(400);
            throw new Error('This email is already registered');
        }
        const phoneExists = await Artisan.findOne({ phoneNumber });
        if (phoneExists) {
            res.status(400);
            throw new Error('This phone number is already registered');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const artisan = await Artisan.create({
            fullName, email, phoneNumber, password: hashedPassword, craft, location
        });
        if (artisan) {
            res.status(201).json({
                _id: artisan._id,
                fullName: artisan.fullName,
                email: artisan.email,
                publicId: artisan.publicId,
                token: generateToken(artisan._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid artisan data');
        }
    } catch (error) {
        res.status(res.statusCode || 400).json({ message: error.message });
    }
};

const loginArtisan = async (req, res) => {
    const { loginIdentifier, password } = req.body;
    try {
        const isEmail = loginIdentifier.includes('@');
        let artisan;
        if (isEmail) {
            artisan = await Artisan.findOne({ email: loginIdentifier });
        } else {
            artisan = await Artisan.findOne({ phoneNumber: loginIdentifier });
        }
        if (artisan && (await bcrypt.compare(password, artisan.password))) {
            res.json({
                _id: artisan._id,
                fullName: artisan.fullName,
                email: artisan.email,
                publicId: artisan.publicId,
                token: generateToken(artisan._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getArtisanByPublicId = async (req, res) => {
    try {
        const artisan = await Artisan.findOne({ publicId: req.params.publicId }).select('-password');
        if (artisan) {
            res.json(artisan);
        } else {
            res.status(404).json({ message: 'Artisan not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAllArtisans = async (req, res) => {
    try {
        const artisans = await Artisan.find({}).select('-password');
        res.json(artisans);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const getArtisanById = async (req, res) => {
    try {
        const artisan = await Artisan.findById(req.params.id).select('-password');
        if (artisan) {
            res.json(artisan);
        } else {
            res.status(404).json({ message: 'Artisan not found' });
        }
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

export { registerArtisan, loginArtisan, getAllArtisans, getArtisanById, getArtisanByPublicId };