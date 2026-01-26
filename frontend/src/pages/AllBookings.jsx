import { useState, useEffect } from 'react';
import api from '../utils/api';

const AllBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAllBookings();
    }, []);

    const fetchAllBookings = async () => {
        try {
            const response = await api.get('/bookings');
            setBookings(response.data.bookings);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch bookings');
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="container">
            <div className="page-header">
                <h2>All Bookings</h2>
            </div>

            {error && <div className="error-message">{error}</div>}

            {bookings.length > 0 ? (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Hotel</th>
                                <th>Rooms</th>
                                <th>Check-in</th>
                                <th>Check-out</th>
                                <th>Days</th>
                                <th>Total Price</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(booking => (
                                <tr key={booking._id}>
                                    <td>
                                        <div>{booking.userId?.name}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{booking.userId?.email}</div>
                                    </td>
                                    <td>
                                        <div>{booking.hotelId?.name || booking.hotelName}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            {booking.hotelId?.city || 'N/A'}
                                            {booking.isHotelDeleted && <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}> (DELETED)</span>}
                                        </div>
                                    </td>
                                    <td>
                                        {booking.rooms.map((room, index) => (
                                            <div key={index} style={{ fontSize: '12px' }}>
                                                {room.roomNumber} ({room.roomType})
                                            </div>
                                        ))}
                                    </td>
                                    <td>{formatDate(booking.checkInDate)}</td>
                                    <td>{formatDate(booking.checkOutDate)}</td>
                                    <td>{booking.numberOfDays}</td>
                                    <td>₹{booking.totalPrice}</td>
                                    <td>
                                        <span className={`status-badge status-${booking.status}`}>
                                            {booking.status === 'cancelled_by_admin' ? 'HOTEL REMOVED' : booking.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <h3>No bookings yet</h3>
                    <p>Bookings will appear here once users start booking rooms</p>
                </div>
            )}
        </div>
    );
};

export default AllBookings;
