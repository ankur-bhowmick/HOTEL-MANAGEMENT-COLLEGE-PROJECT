const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getAllBookings,
    cancelBooking,
    getBooking,
    getDashboardStats,
    getBookingsByUser
} = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.post('/', auth, checkRole('user'), createBooking);
router.get('/my-bookings', auth, checkRole('user'), getMyBookings);
router.get('/', auth, checkRole('admin'), getAllBookings);
router.get('/stats', auth, checkRole('admin'), getDashboardStats);
router.get('/user/:userId', auth, checkRole('admin'), getBookingsByUser);
router.get('/:id', auth, getBooking);
router.patch('/:id/cancel', auth, checkRole('user'), cancelBooking);

module.exports = router;
