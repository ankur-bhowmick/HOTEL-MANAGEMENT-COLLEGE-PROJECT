const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

// Helper function to check date conflicts
const checkDateConflict = async (roomIds, checkInDate, checkOutDate, excludeBookingId = null) => {
    const query = {
        'rooms.roomId': { $in: roomIds },
        status: 'confirmed',
        $or: [
            {
                checkInDate: { $lt: checkOutDate },
                checkOutDate: { $gt: checkInDate }
            }
        ]
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    const conflictingBookings = await Booking.find(query);
    return conflictingBookings.length > 0;
};

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private/User
exports.createBooking = async (req, res) => {
    try {
        const { hotelId, roomIds, checkInDate, checkOutDate } = req.body;

        // Validate dates
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkIn < today) {
            return res.status(400).json({ message: 'Check-in date cannot be in the past' });
        }

        if (checkOut <= checkIn) {
            return res.status(400).json({ message: 'Check-out date must be after check-in date' });
        }

        // Calculate number of days
        const diffTime = Math.abs(checkOut - checkIn);
        const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (numberOfDays < 1) {
            return res.status(400).json({ message: 'Minimum booking duration is 1 day' });
        }

        // Check if hotel exists
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        // Check if all rooms exist and are available
        const rooms = await Room.find({ _id: { $in: roomIds }, hotelId });

        if (rooms.length !== roomIds.length) {
            return res.status(404).json({ message: 'One or more rooms not found or do not belong to this hotel' });
        }

        const unavailableRooms = rooms.filter(room => !room.isAvailable);
        if (unavailableRooms.length > 0) {
            return res.status(400).json({
                message: 'One or more rooms are not available',
                unavailableRooms: unavailableRooms.map(r => r.roomNumber)
            });
        }

        // Check for date conflicts
        const hasConflict = await checkDateConflict(roomIds, checkIn, checkOut);
        if (hasConflict) {
            return res.status(400).json({
                message: 'One or more rooms are already booked for the selected dates'
            });
        }

        // Calculate total price
        const totalPrice = rooms.reduce((sum, room) => sum + (room.price * numberOfDays), 0);

        // Prepare room details for booking
        const roomDetails = rooms.map(room => ({
            roomId: room._id,
            roomNumber: room.roomNumber,
            roomType: room.type,
            price: room.price
        }));

        // Create booking
        const booking = await Booking.create({
            userId: req.user.id,
            hotelId,
            hotelName: hotel.name,
            rooms: roomDetails,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            totalPrice,
            numberOfDays,
            status: 'confirmed'
        });

        const populatedBooking = await Booking.findById(booking._id)
            .populate('hotelId', 'name city address')
            .populate('userId', 'name email');

        res.status(201).json({
            success: true,
            message: 'Booking confirmed successfully!',
            booking: populatedBooking
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private/User
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .populate('hotelId', 'name city address')
            .populate('rooms.roomId', 'roomNumber type')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name email')
            .populate('hotelId', 'name city address')
            .populate('rooms.roomId', 'roomNumber type')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private/User
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user owns this booking
        if (booking.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        // Check if cancellation is within 24 hours of check-in
        const now = new Date();
        const checkIn = new Date(booking.checkInDate);
        const diffInHours = (checkIn - now) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return res.status(400).json({
                message: 'Cancellations must be made at least 24 hours before the check-in time.'
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({
            success: true,
            message: 'Booking cancelled successfully!',
            booking
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('hotelId', 'name city address')
            .populate('rooms.roomId', 'roomNumber type');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin' && booking.userId._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this booking' });
        }

        res.json({
            success: true,
            booking
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard stats (Earnings, etc.)
// @route   GET /api/bookings/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'confirmed' });
        const totalEarnings = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
        const totalBookings = bookings.length;

        // You can add more stats like bookings per month, etc.
        res.json({
            success: true,
            stats: {
                totalEarnings,
                totalBookings
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get bookings of a particular user
// @route   GET /api/bookings/user/:userId
// @access  Private/Admin
exports.getBookingsByUser = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.params.userId })
            .populate('hotelId', 'name city address')
            .populate('rooms.roomId', 'roomNumber type')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
