import { useState, useEffect } from 'react';
import api from '../utils/api';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchMyBookings();
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

    const fetchMyBookings = async () => {
        try {
            const response = await api.get('/bookings/my-bookings');
            setBookings(response.data.bookings);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch bookings');
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            const response = await api.patch(`/bookings/${bookingId}/cancel`);
            setSuccess(response.data.message || 'Booking cancelled successfully');
            fetchMyBookings();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="container">
            <div className="page-header">
                <h2>My Bookings</h2>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {bookings.length > 0 ? (
                <div className="card-grid">
                    {bookings.map(booking => (
                        <div key={booking._id} className="card" style={booking.isHotelDeleted ? { border: '2px solid var(--secondary)', background: 'var(--background)' } : {}}>
                            {booking.isHotelDeleted && (
                                <div style={{
                                    background: 'var(--secondary)',
                                    color: 'white',
                                    padding: '4px 10px',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    borderRadius: '4px',
                                    display: 'inline-block',
                                    marginBottom: '10px'
                                }}>
                                    HOTEL NO LONGER EXISTS
                                </div>
                            )}
                            <h3>{booking.hotelId?.name || booking.hotelName}</h3>
                            <p><strong>Location:</strong> {booking.hotelId?.city || 'Information unavailable'}</p>
                            <p><strong>Check-in:</strong> {formatDate(booking.checkInDate)}</p>
                            <p><strong>Check-out:</strong> {formatDate(booking.checkOutDate)}</p>
                            <p><strong>Duration:</strong> {booking.numberOfDays} day(s)</p>

                            <div style={{ marginTop: '10px' }}>
                                <strong>Rooms:</strong>
                                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    {booking.rooms.map((room, index) => (
                                        <li key={index}>
                                            Room {room.roomNumber} - {room.roomType} (₹{room.price}/night)
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <p style={{ marginTop: '10px' }}>
                                <strong>Total Price:</strong> ₹{booking.totalPrice}
                            </p>

                            <p>
                                <span className={`status-badge status-${booking.status}`}>
                                    {booking.status === 'cancelled_by_admin' ? 'CANCELLED (HOTEL REMOVED)' : booking.status.toUpperCase()}
                                </span>
                            </p>

                            {booking.status === 'confirmed' && !booking.isHotelDeleted && (new Date(booking.checkInDate) - new Date()) / (1000 * 60 * 60) >= 24 && (
                                <div className="card-actions">
                                    <button
                                        onClick={() => handleCancelBooking(booking._id)}
                                        className="btn btn-danger btn-small"
                                    >
                                        Cancel Booking
                                    </button>
                                </div>
                            )}
                            {booking.status === 'confirmed' && !booking.isHotelDeleted && (new Date(booking.checkInDate) - new Date()) / (1000 * 60 * 60) < 24 && (
                                <p style={{ fontSize: '12px', color: '#e67e22', marginTop: '10px' }}>
                                    Cancellation only available 24h before check-in.
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <h3>No bookings yet</h3>
                    <p>Start exploring hotels and make your first booking!</p>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
