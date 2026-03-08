import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <h1 className="navbar-title">🏨 Zentarastay</h1>

                {user && (
                    <div className="navbar-links">
                        {isAdmin ? (
                            <>
                                <Link to="/admin/dashboard">Dashboard</Link>
                                <Link to="/admin/hotels">Hotels</Link>
                                <Link to="/admin/bookings">All Bookings</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/user/dashboard">Hotels</Link>
                                <Link to="/user/bookings">My Bookings</Link>
                            </>
                        )}

                        {/* User Profile */}
                        <div className="navbar-user">
                            <div className="user-profile">
                                <div className="user-avatar">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>

                                {/* Hover Modal */}
                                <div className="user-profile-modal">
                                    <p className="user-name">{user.name}</p>
                                    <p className="user-email">{user.email}</p>
                                    <p className="user-role">{user.role}</p>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="btn-logout-icon"
                                title="Logout"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
