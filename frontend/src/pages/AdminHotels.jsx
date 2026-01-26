import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AdminHotels = () => {
    const [hotels, setHotels] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showHotelForm, setShowHotelForm] = useState(false);
    const [showRoomForm, setShowRoomForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [hotelForm, setHotelForm] = useState({
        name: '',
        address: '',
        city: '',
        description: ''
    });

    const [roomForm, setRoomForm] = useState({
        hotelId: '',
        roomNumber: '',
        type: 'Single',
        price: ''
    });

    const navigate = useNavigate();

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

    const fetchRoomsByHotel = async (hotelId) => {
        try {
            const response = await api.get(`/rooms/hotel/${hotelId}`);
            setRooms(response.data.rooms);
        } catch (error) {
            setError('Failed to fetch rooms');
        }
    };

    const handleCreateHotel = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/hotels', hotelForm);
            setSuccess(response.data.message || 'Hotel created successfully');
            setShowHotelForm(false);
            setHotelForm({ name: '', address: '', city: '', description: '' });
            fetchHotels();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create hotel');
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/rooms', roomForm);
            setSuccess(response.data.message || 'Room created successfully');
            setShowRoomForm(false);
            setRoomForm({ hotelId: '', roomNumber: '', type: 'Single', price: '' });
            if (roomForm.hotelId) {
                fetchRoomsByHotel(roomForm.hotelId);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create room');
        }
    };

    const handleDeleteHotel = async (hotelId) => {
        if (!window.confirm('Are you sure? This will delete all rooms in this hotel.')) {
            return;
        }

        try {
            const response = await api.delete(`/hotels/${hotelId}`);
            setSuccess(response.data.message || 'Hotel deleted successfully');
            fetchHotels();
        } catch (error) {
            setError('Failed to delete hotel');
        }
    };

    const handleToggleAvailability = async (roomId) => {
        try {
            const response = await api.patch(`/rooms/${roomId}/availability`);
            setSuccess(response.data.message || 'Room availability updated');
            if (rooms.length > 0) {
                fetchRoomsByHotel(rooms[0].hotelId._id);
            }
        } catch (error) {
            setError('Failed to update room availability');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="container">
            <div className="page-header">
                <h2>Admin Dashboard</h2>
                <div>
                    <button onClick={() => setShowHotelForm(true)} className="btn btn-primary">
                        Add Hotel
                    </button>
                    <button onClick={() => setShowRoomForm(true)} className="btn btn-success" style={{ marginLeft: '10px' }}>
                        Add Room
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* Hotel Form Modal */}
            {showHotelForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Add New Hotel</h3>
                        <form onSubmit={handleCreateHotel}>
                            <div className="form-group">
                                <label>Hotel Name</label>
                                <input
                                    type="text"
                                    value={hotelForm.name}
                                    onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    value={hotelForm.address}
                                    onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    value={hotelForm.city}
                                    onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={hotelForm.description}
                                    onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowHotelForm(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Hotel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Room Form Modal */}
            {showRoomForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Add New Room</h3>
                        <form onSubmit={handleCreateRoom}>
                            <div className="form-group">
                                <label>Select Hotel</label>
                                <select
                                    value={roomForm.hotelId}
                                    onChange={(e) => setRoomForm({ ...roomForm, hotelId: e.target.value })}
                                    required
                                >
                                    <option value="">Choose a hotel</option>
                                    {hotels.map(hotel => (
                                        <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Room Number</label>
                                <input
                                    type="text"
                                    value={roomForm.roomNumber}
                                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Room Type</label>
                                <select
                                    value={roomForm.type}
                                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                                >
                                    <option value="Single">Single</option>
                                    <option value="Double">Double</option>
                                    <option value="Suite">Suite</option>
                                    <option value="Deluxe">Deluxe</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Price per Night</label>
                                <input
                                    type="number"
                                    value={roomForm.price}
                                    onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })}
                                    required
                                    min="0"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowRoomForm(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-success">
                                    Create Room
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Hotels List */}
            <div className="card-grid">
                {hotels.map(hotel => (
                    <div key={hotel._id} className="card">
                        <h3>{hotel.name}</h3>
                        <p><strong>City:</strong> {hotel.city}</p>
                        <p><strong>Address:</strong> {hotel.address}</p>
                        {hotel.description && <p>{hotel.description}</p>}
                        <div className="card-actions">
                            <button
                                onClick={() => fetchRoomsByHotel(hotel._id)}
                                className="btn btn-primary btn-small"
                            >
                                View Rooms
                            </button>
                            <button
                                onClick={() => handleDeleteHotel(hotel._id)}
                                className="btn btn-danger btn-small"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {hotels.length === 0 && (
                <div className="empty-state">
                    <h3>No hotels yet</h3>
                    <p>Click "Add Hotel" to create your first hotel</p>
                </div>
            )}

            {/* Rooms List */}
            {rooms.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                    <h2>Rooms</h2>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Room Number</th>
                                    <th>Type</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map(room => (
                                    <tr key={room._id}>
                                        <td>{room.roomNumber}</td>
                                        <td>{room.type}</td>
                                        <td>₹{room.price}/night</td>
                                        <td>
                                            <span className={`status-badge ${room.isAvailable ? 'status-available' : 'status-unavailable'}`}>
                                                {room.isAvailable ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleToggleAvailability(room._id)}
                                                className="btn btn-secondary btn-small"
                                            >
                                                Toggle Status
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHotels;
