const Profile = require('../models/Profile');

exports.getProfile = async (req, res) => {
    try {
        let profile = await Profile.findOne();
        if (!profile) {
            // Create default profile if none exists
            profile = new Profile();
            await profile.save();
        }
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        let profile = await Profile.findOne();
        if (!profile) {
            profile = new Profile(req.body);
        } else {
            profile.name = req.body.name || profile.name;
            profile.image = req.body.image || profile.image;
        }
        const updatedProfile = await profile.save();
        res.json(updatedProfile);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
