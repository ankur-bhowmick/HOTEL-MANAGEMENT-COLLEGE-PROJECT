const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Public
exports.getAllHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find().populate('createdBy', 'name email');
        res.json({
            success: true,
            count: hotels.length,
            hotels
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single hotel
// @route   GET /api/hotels/:id
// @access  Public
exports.getHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id).populate('createdBy', 'name email');

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        res.json({
            success: true,
            hotel
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create hotel
// @route   POST /api/hotels
// @access  Private/Admin
exports.createHotel = async (req, res) => {
    try {
        const { name, address, city, description } = req.body;

        const hotel = await Hotel.create({
            name,
            address,
            city,
            description,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Hotel onboarded successfully!',
            hotel
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private/Admin
exports.updateHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        const updatedHotel = await Hotel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Hotel updated successfully!',
            hotel: updatedHotel
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private/Admin
exports.deleteHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        // Mark all bookings for this hotel as cancelled due to hotel deletion
        await Booking.updateMany(
            { hotelId: req.params.id },
            {
                status: 'cancelled_by_admin',
                isHotelDeleted: true
            }
        );

        // Delete all rooms associated with this hotel
        await Room.deleteMany({ hotelId: req.params.id });

        await Hotel.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Hotel deleted and all associated bookings have been cancelled.'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
