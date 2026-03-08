import { useState, useEffect } from 'react';
import api from '../utils/api';
import PaymentModal from '../components/PaymentModal';

const UserDashboard = () => {
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Payment state
    const [showPayment, setShowPayment] = useState(false);
    const [pendingBooking, setPendingBooking] = useState(null);

    const [bookingForm, setBookingForm] = useState({
        hotelId: '',
        roomIds: [],
        checkInDate: '',
        checkOutDate: ''
    });

    useEffect(() => {
        fetchHotels();
    }, []);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const fetchHotels = async () => {
        try {
            const response = await api.get('/hotels');
            setHotels(response.data.hotels);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch hotels');
            setLoading(false);
        }
    };

    const handleBookRoom = async (hotelId) => {
        setBookingForm({
            ...bookingForm,
            hotelId,
            roomIds: []
        });

        try {
            const response = await api.get(`/rooms/hotel/${hotelId}`);
            const hotelRooms = response.data.rooms;
            const availableRooms = hotelRooms.filter(room => room.isAvailable);

            if (availableRooms.length === 0) {
                alert('The hotel is currently not for booking, try again later.');
                return;
            }

            setRooms(hotelRooms);
            setSelectedHotel(hotelId);
            setShowBookingForm(true);
        } catch (error) {
            setError('Failed to check room availability');
        }
    };

    // Calculate estimated total for live preview
    const calculateTotal = () => {
        if (!bookingForm.checkInDate || !bookingForm.checkOutDate || bookingForm.roomIds.length === 0) return { total: 0, days: 0 };
        const checkIn = new Date(bookingForm.checkInDate);
        const checkOut = new Date(bookingForm.checkOutDate);
        const days = Math.ceil(Math.abs(checkOut - checkIn) / (1000 * 60 * 60 * 24));
        if (days < 1) return { total: 0, days: 0 };
        const selectedRooms = rooms.filter(r => bookingForm.roomIds.includes(r._id));
        const total = selectedRooms.reduce((sum, room) => sum + (room.price * days), 0);
        return { total, days };
    };

    const { total: estimatedTotal, days: estimatedDays } = calculateTotal();

    // Step 1: User clicks "Proceed to Pay" → show payment modal
    const handleCreateBooking = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (bookingForm.roomIds.length === 0) {
            setError('Please select at least one room');
            return;
        }

        const selectedRooms = rooms.filter(r => bookingForm.roomIds.includes(r._id));
        const checkIn = new Date(bookingForm.checkInDate);
        const checkOut = new Date(bookingForm.checkOutDate);
        const days = Math.ceil(Math.abs(checkOut - checkIn) / (1000 * 60 * 60 * 24));

        if (days < 1) {
            setError('Minimum booking duration is 1 day');
            return;
        }

        const totalPrice = selectedRooms.reduce((sum, room) => sum + (room.price * days), 0);
        const hotel = hotels.find(h => h._id === bookingForm.hotelId);

        setPendingBooking({
            ...bookingForm,
            totalPrice,
            days,
            roomCount: selectedRooms.length,
            hotelName: hotel?.name || 'Hotel'
        });

        setShowBookingForm(false);
        setShowPayment(true);
    };

    // Step 2: Payment auto-completes → create booking via API
    const handlePaymentComplete = async () => {
        setShowPayment(false);
        setError('');

        try {
            const response = await api.post('/bookings', {
                hotelId: pendingBooking.hotelId,
                roomIds: pendingBooking.roomIds,
                checkInDate: pendingBooking.checkInDate,
                checkOutDate: pendingBooking.checkOutDate
            });
            setSuccess(response.data.message || 'Booking confirmed successfully!');
            setBookingForm({ hotelId: '', roomIds: [], checkInDate: '', checkOutDate: '' });
            setPendingBooking(null);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create booking');
            setPendingBooking(null);
        }
    };

    // Cancel payment → return to booking form
    const handlePaymentCancel = () => {
        setShowPayment(false);
        setPendingBooking(null);
        setShowBookingForm(true);
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="container">
            <div className="page-header">
                <h2>Available Hotels</h2>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* Booking Form Modal */}
            {showBookingForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Book Rooms</h3>
                        <form onSubmit={handleCreateBooking}>
                            <div className="form-group">
                                <label>Check-in Date</label>
                                <input
                                    type="date"
                                    value={bookingForm.checkInDate}
                                    onChange={(e) => setBookingForm({ ...bookingForm, checkInDate: e.target.value })}
                                    min={getMinDate()}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Check-out Date</label>
                                <input
                                    type="date"
                                    value={bookingForm.checkOutDate}
                                    onChange={(e) => setBookingForm({ ...bookingForm, checkOutDate: e.target.value })}
                                    min={bookingForm.checkInDate || getMinDate()}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Select Rooms (Hold Ctrl/Cmd to select multiple)</label>
                                <select
                                    multiple
                                    className="form-control"
                                    style={{
                                        width: '100%',
                                        height: '140px',
                                        padding: '10px',
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0',
                                        marginTop: '5px'
                                    }}
                                    value={bookingForm.roomIds}
                                    onChange={(e) => {
                                        const values = Array.from(e.target.selectedOptions, option => option.value);
                                        setBookingForm({ ...bookingForm, roomIds: values });
                                    }}
                                    required
                                >
                                    {rooms.filter(room => room.isAvailable).map(room => (
                                        <option key={room._id} value={room._id}>
                                            Room {room.roomNumber} - {room.type} (₹{room.price}/night)
                                        </option>
                                    ))}
                                </select>
                                <small style={{ color: '#64748b', marginTop: '5px', display: 'block' }}>
                                    Hold Ctrl (Windows) or Command (Mac) to select multiple rooms.
                                </small>
                            </div>

                            {/* Live Price Estimate */}
                            {estimatedTotal > 0 && (
                                <div className="booking-estimate">
                                    <div className="estimate-label">Estimated Total</div>
                                    <div className="estimate-amount">₹{estimatedTotal.toLocaleString('en-IN')}</div>
                                    <div className="estimate-detail">
                                        {bookingForm.roomIds.length} room(s) × {estimatedDays} night(s)
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowBookingForm(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-success">
                                    {estimatedTotal > 0
                                        ? `Proceed to Pay ₹${estimatedTotal.toLocaleString('en-IN')}`
                                        : 'Proceed to Pay'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            <PaymentModal
                isOpen={showPayment}
                amount={pendingBooking?.totalPrice || 0}
                hotelName={pendingBooking?.hotelName || ''}
                bookingDetails={pendingBooking ? {
                    checkInDate: pendingBooking.checkInDate,
                    checkOutDate: pendingBooking.checkOutDate,
                    roomCount: pendingBooking.roomCount,
                    days: pendingBooking.days
                } : null}
                onPaymentComplete={handlePaymentComplete}
                onCancel={handlePaymentCancel}
            />

            {/* Hotels List */}
            <div className="card-grid">
                {hotels.map(hotel => (
                    <div key={hotel._id} className="card">
                        <h3>{hotel.name}</h3>
                        <p><strong>📍 {hotel.city}</strong></p>
                        <p>{hotel.address}</p>
                        {hotel.description && <p style={{ marginTop: '10px', color: '#666' }}>{hotel.description}</p>}
                        <div className="card-actions">
                            <button
                                onClick={() => handleBookRoom(hotel._id)}
                                className="btn btn-success"
                                style={{ width: '100%' }}
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {hotels.length === 0 && (
                <div className="empty-state">
                    <h3>No hotels available</h3>
                    <p>Please check back later</p>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
