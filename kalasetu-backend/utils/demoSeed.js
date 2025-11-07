import Artisan from '../models/artisanModel.js';
import CallHistory from '../models/callHistoryModel.js';
import User from '../models/userModel.js';

const DEMO_ARTISAN_EMAIL_REGEX = /@demo\.kalasetu\.com$/i;
const ENABLE_USER_DEMO_SEEDING = process.env.ENABLE_USER_DEMO_SEEDING !== 'false';

export const seedDemoDataForUser = async (user) => {
  if (!ENABLE_USER_DEMO_SEEDING) return;
  if (!user?._id) return;

  try {
    const demoArtisans = await Artisan.find({ email: { $regex: DEMO_ARTISAN_EMAIL_REGEX } })
      .select('_id fullName publicId location craft profileImage profileImageUrl')
      .limit(6)
      .lean();

    if (!demoArtisans.length) {
      return;
    }

    const bookmarkIds = demoArtisans.slice(0, 3).map((artisan) => artisan._id);
    if (bookmarkIds.length) {
      await User.findByIdAndUpdate(
        user._id,
        { $addToSet: { bookmarks: { $each: bookmarkIds } } },
        { new: true }
      );
    }

    const existingCallHistory = await CallHistory.countDocuments({ user: user._id });
    if (existingCallHistory === 0) {
      const now = Date.now();
      const callEntries = demoArtisans.slice(0, 3).map((artisan, idx) => ({
        artisan: artisan._id,
        user: user._id,
        startedAt: new Date(now - (idx + 1) * 60 * 60 * 1000),
        endedAt: new Date(now - (idx + 1) * 60 * 60 * 1000 + 15 * 60 * 1000),
        durationSec: 15 * 60 - idx * 60,
        type: 'video',
        status: 'completed',
      }));

      if (callEntries.length) {
        await CallHistory.insertMany(callEntries);
      }
    }
  } catch (error) {
    console.error('Demo seeding error for user:', error.message);
  }
};

export const seedDemoDataForUsers = async (users) => {
  if (!ENABLE_USER_DEMO_SEEDING) return;
  if (!Array.isArray(users) || users.length === 0) return;

  for (const user of users) {
    await seedDemoDataForUser(user);
  }
};


