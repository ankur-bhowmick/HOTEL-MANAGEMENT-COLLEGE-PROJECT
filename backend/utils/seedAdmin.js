const User = require('../models/User');

const createDefaultAdmin = async () => {
    try {
        const adminEmail = 'ankur.riu@gmail.com';

        // Check if admin already exists
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('Default admin already exists');
            return;
        }

        // Create default admin
        const admin = await User.create({
            name: 'Ankur Bhowmik',
            email: adminEmail,
            password: 'ankur2005@',
            role: 'admin'
        });

        console.log('Default admin created successfully');
        console.log(`Email: ${admin.email}`);
        console.log('Password: ankur2005@');
    } catch (error) {
        console.error('Error creating default admin:', error.message);
    }
};

module.exports = createDefaultAdmin;
