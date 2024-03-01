const mongoose = require('mongoose');

// Define FacebookUser schema
const facebookUserSchema = new mongoose.Schema({
    facebookId: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true
    },
    email: {
        type: String,    
        required: true,
        unique: true
    },
    // Add more fields as needed
}, { timestamps: true });

// Create FacebookUser model
const FacebookUser = mongoose.model('FacebookUser', facebookUserSchema);

module.exports = FacebookUser;
