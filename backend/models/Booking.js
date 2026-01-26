const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    hotelName: {
        type: String,
        required: true
    },
    rooms: [{
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: true
        },
        roomNumber: String,
        roomType: String,
        price: Number
    }],
    checkInDate: {
        type: Date,
        required: [true, 'Check-in date is required']
    },
    checkOutDate: {
        type: Date,
        required: [true, 'Check-out date is required']
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    numberOfDays: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'cancelled_by_admin'],
        default: 'confirmed'
    },
    isHotelDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Validate check-out date is after check-in date
bookingSchema.pre('save', function (next) {
    if (this.checkOutDate <= this.checkInDate) {
        return next(new Error('Check-out date must be after check-in date'));
    }

    // Calculate number of days
    const diffTime = Math.abs(this.checkOutDate - this.checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
        return next(new Error('Minimum booking duration is 1 day'));
    }

    this.numberOfDays = diffDays;
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);
