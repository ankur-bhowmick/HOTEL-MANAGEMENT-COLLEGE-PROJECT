const express = require('express');
const router = express.Router();
const {
    getAllHotels,
    getHotel,
    createHotel,
    updateHotel,
    deleteHotel
} = require('../controllers/hotelController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.get('/', getAllHotels);
router.get('/:id', getHotel);
router.post('/', auth, checkRole('admin'), createHotel);
router.put('/:id', auth, checkRole('admin'), updateHotel);
router.delete('/:id', auth, checkRole('admin'), deleteHotel);

module.exports = router;
