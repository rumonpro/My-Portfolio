const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    name: { type: String, default: 'Admin User' },
    image: { type: String, default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' }
});

module.exports = mongoose.model('Profile', profileSchema);
