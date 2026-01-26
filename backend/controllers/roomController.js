const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');

// @desc    Get all rooms for a hotel
// @route   GET /api/rooms/hotel/:hotelId
// @access  Public
exports.getRoomsByHotel = async (req, res) => {
    try {
        const rooms = await Room.find({ hotelId: req.params.hotelId }).populate('hotelId', 'name city');

        res.json({
            success: true,
            count: rooms.length,
            rooms
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('hotelId', 'name city address');

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json({
            success: true,
            room
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create room
// @route   POST /api/rooms
// @access  Private/Admin
exports.createRoom = async (req, res) => {
    try {
        const { hotelId, roomNumber, type, price } = req.body;

        // Check if hotel exists
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        const room = await Room.create({
            hotelId,
            roomNumber,
            type,
            price,
            isAvailable: true
        });

        res.status(201).json({
            success: true,
            message: 'Room added successfully!',
            room
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Room number already exists for this hotel' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private/Admin
exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const updatedRoom = await Room.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Room updated successfully!',
            room: updatedRoom
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle room availability
// @route   PATCH /api/rooms/:id/availability
// @access  Private/Admin
exports.toggleAvailability = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        room.isAvailable = !room.isAvailable;
        await room.save();

        res.json({
            success: true,
            message: `Room status changed to ${room.isAvailable ? 'Available' : 'Unavailable'}`,
            room
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Check if there are any confirmed bookings for this room
        const activeBookings = await Booking.findOne({
            'rooms.roomId': req.params.id,
            status: 'confirmed'
        });

        if (activeBookings) {
            return res.status(400).json({
                message: 'Cannot delete room with active confirmed bookings. Please cancel or complete bookings first.'
            });
        }

        await Room.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Room deleted'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
