import Artisan from '../models/artisanModel.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

// --- @desc    Register a new artisan
// --- @route   POST /api/artisans/register
// --- @access  Public
const registerArtisan = async (req, res) => {
    // 1. Get the data from the frontend
    const { fullName, email, password, craft, location } = req.body;

    try {
        // 2. Check if the artisan already exists
        const artisanExists = await Artisan.findOne({ email });
        if (artisanExists) {
            res.status(400); // Bad Request
            throw new Error('Artisan with this email already exists');
        }

        // 3. Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create the new artisan in the database
        const artisan = await Artisan.create({
            fullName,
            email,
            password: hashedPassword,
            craft,
            location,
        });

        // 5. If creation is successful, send back the artisan's data and a security token
        if (artisan) {
            res.status(201).json({
                _id: artisan._id,
                fullName: artisan.fullName,
                email: artisan.email,
                token: generateToken(artisan._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid artisan data');
        }
    } catch (error) {
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};

// --- @desc    Auth artisan & get token (Login)
// --- @route   POST /api/artisans/login
// --- @access  Public
const loginArtisan = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Find the artisan by email
        const artisan = await Artisan.findOne({ email });

        // 2. If artisan exists and the password matches, send back data and token
        if (artisan && (await bcrypt.compare(password, artisan.password))) {
            res.json({
                _id: artisan._id,
                fullName: artisan.fullName,
                email: artisan.email,
                token: generateToken(artisan._id),
            });
        } else {
            res.status(401); // Unauthorized
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};


// ... (registerArtisan and loginArtisan functions are already here above) ...

// --- @desc    Get all artisans
// --- @route   GET /api/artisans
// --- @access  Public
const getAllArtisans = async (req, res) => {
    try {
        // Find all documents in the Artisan collection
        const artisans = await Artisan.find({}).select('-password'); // .select('-password') prevents the hashed password from being sent
        res.json(artisans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- @desc    Get single artisan by ID
// --- @route   GET /api/artisans/:id
// --- @access  Public
const getArtisanById = async (req, res) => {
    try {
        const artisan = await Artisan.findById(req.params.id).select('-password');
        if (artisan) {
            res.json(artisan);
        } else {
            res.status(404).json({ message: 'Artisan not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { registerArtisan, loginArtisan, getAllArtisans, getArtisanById }; // <-- UPDATE THIS LINE