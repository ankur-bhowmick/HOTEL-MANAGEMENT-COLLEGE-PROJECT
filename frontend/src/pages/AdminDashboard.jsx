import { useState, useEffect } from 'react';
import api from '../utils/api';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userBookings, setUserBookings] = useState([]);
    const [stats, setStats] = useState({ totalEarnings: 0, totalBookings: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(3);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Get current users
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(users.length / usersPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

    const fetchDashboardData = async () => {
        try {
            const usersRes = await api.get('/auth/users');
            const statsRes = await api.get('/bookings/stats');

            // Sort logic: Admins first, then by registration date (latest first)
            const sortedUsers = usersRes.data.users.sort((a, b) => {
                // First level: Role (admin should be on top)
                if (a.role === 'admin' && b.role !== 'admin') return -1;
                if (a.role !== 'admin' && b.role === 'admin') return 1;

                // Second level: Date (latest first)
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            setUsers(sortedUsers);
            setStats(statsRes.data.stats);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch dashboard data');
            setLoading(false);
        }
    };

    const fetchUserBookings = async (user) => {
        try {
            setSelectedUser(user);
            const response = await api.get(`/bookings/user/${user._id}`);
            setUserBookings(response.data.bookings);
        } catch (error) {
            setError(`Failed to fetch bookings for ${user.name}`);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) return <div className="loading">Loading Dashboard...</div>;

    return (
        <div className="container">
            <div className="page-header">
                <h2>Admin Dashboard</h2>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* Stats Section */}
            <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '40px' }}>
                <div className="card" style={{ textAlign: 'center', borderColor: 'var(--primary)' }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>Total Earnings</p>
                    <h1 style={{ color: 'var(--primary)', fontSize: '32px' }}>₹{stats.totalEarnings}</h1>
                </div>
                <div className="card" style={{ textAlign: 'center', borderColor: 'var(--secondary)' }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>Total Bookings</p>
                    <h1 style={{ color: 'var(--secondary)', fontSize: '32px' }}>{stats.totalBookings}</h1>
                </div>
                <div className="card" style={{ textAlign: 'center', borderColor: 'var(--success)' }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>Total Users</p>
                    <h1 style={{ color: 'var(--success)', fontSize: '32px' }}>{users.length}</h1>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 1fr' : '1fr', gap: '30px' }}>
                {/* Users List */}
                <div>
                    <h3>Registered Users</h3>
                    <div className="table-container" style={{ marginTop: '15px' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.map(u => (
                                    <tr key={u._id} style={{ backgroundColor: selectedUser?._id === u._id ? 'var(--background)' : 'transparent' }}>
                                        <td><strong>{u.name}</strong></td>
                                        <td>{u.email}</td>
                                        <td><span className="status-badge status-available" style={{ fontSize: '10px' }}>{u.role}</span></td>
                                        <td>
                                            <button
                                                onClick={() => fetchUserBookings(u)}
                                                className="btn btn-secondary btn-small"
                                                style={{ borderRadius: '4px' }}
                                            >
                                                View Bookings
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {users.length > usersPerPage && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                            <button
                                className="btn btn-primary btn-small"
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={{ padding: '5px 10px', borderRadius: '4px' }}
                            >
                                Previous
                            </button>

                            <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-light)' }}>
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                className="btn btn-primary btn-small"
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                style={{ padding: '5px 10px', borderRadius: '4px' }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>

                {/* Specific User Bookings */}
                {selectedUser && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Bookings for {selectedUser.name}</h3>
                            <button className="btn btn-small" onClick={() => setSelectedUser(null)}>Close</button>
                        </div>
                        <div style={{ marginTop: '15px' }}>
                            {userBookings.length > 0 ? (
                                <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
                                    {userBookings.map(b => (
                                        <div key={b._id} className="card" style={{ padding: '15px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <strong>{b.hotelId?.name}</strong>
                                                <span className={`status-badge status-${b.status}`}>{b.status}</span>
                                            </div>
                                            <p style={{ fontSize: '12px', marginTop: '5px' }}>
                                                {formatDate(b.checkInDate)} - {formatDate(b.checkOutDate)} ({b.numberOfDays} days)
                                            </p>
                                            <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', marginTop: '5px' }}>
                                                Total Paid: ₹{b.totalPrice}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>No bookings found for this user.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
