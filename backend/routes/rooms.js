const express = require('express');
const router = express.Router();
const {
    getRoomsByHotel,
    getRoom,
    createRoom,
    updateRoom,
    toggleAvailability,
    deleteRoom
} = require('../controllers/roomController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.get('/hotel/:hotelId', getRoomsByHotel);
router.get('/:id', getRoom);
router.post('/', auth, checkRole('admin'), createRoom);
router.put('/:id', auth, checkRole('admin'), updateRoom);
router.patch('/:id/availability', auth, checkRole('admin'), toggleAvailability);
router.delete('/:id', auth, checkRole('admin'), deleteRoom);

module.exports = router;
