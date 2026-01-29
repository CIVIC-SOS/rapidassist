import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Header.css'

function Header() {
    const location = useLocation()
    const { isAuthenticated, isAdmin, user, logout } = useAuth()
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)

    const toggleMobileMenu = () => setShowMobileMenu(!showMobileMenu)
    const closeMobileMenu = () => setShowMobileMenu(false)

    const handleLogout = () => {
        logout()
        setShowUserMenu(false)
    }

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo" onClick={closeMobileMenu}>
<<<<<<< HEAD
                    {/* <span className="logo-icon">🆘</span> */}
                    <span className="logo-text">Rapid<span>Assist</span></span>
=======
                    <img src="/logo.png" alt="Rapid Assist Logo" className="logo-img" />
>>>>>>> 8b7f8413b67e5817a7d3133c6e01d5caaa60a520
                </Link>

                <nav className={`nav ${showMobileMenu ? 'mobile-open' : ''}`}>
                    <NavLink
                        to="/"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/community"
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={closeMobileMenu}
                    >
                        Community
                    </NavLink>

                    {isAuthenticated && (
                        <>
                            <NavLink
                                to="/report"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={closeMobileMenu}
                            >
                                Report
                            </NavLink>

                            {isAdmin ? (
                                <NavLink
                                    to="/admin"
                                    className={({ isActive }) => `nav-link admin-link ${isActive ? 'active' : ''}`}
                                    onClick={closeMobileMenu}
                                >
                                    Admin
                                </NavLink>
                            ) : (
                                <NavLink
                                    to="/dashboard"
                                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                    onClick={closeMobileMenu}
                                >
                                    Dashboard
                                </NavLink>
                            )}
                        </>
                    )}
                </nav>

                <div className="header-actions">
                    {isAuthenticated ? (
                        <div className="user-menu-container">
                            <button
                                className="user-menu-trigger"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <span className="user-avatar">{/* 👤 */}</span>
                                <span className="user-name">{user?.name?.split(' ')[0]}</span>
                                <span className="dropdown-arrow">▼</span>
                            </button>

                            {showUserMenu && (
                                <>
                                    <div className="menu-backdrop" onClick={() => setShowUserMenu(false)} />
                                    <div className="user-dropdown">
                                        <div className="dropdown-header">
                                            <span className="dropdown-avatar">{/* {user?.name?.charAt(0)} */}</span>
                                            <div>
                                                <div className="dropdown-name">{user?.name}</div>
                                                <div className="dropdown-type">
                                                    {isAdmin ? 'Administrator' : 'Citizen'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="dropdown-divider" />

                                        {!isAdmin && (
                                            <Link
                                                to="/profile"
                                                className="dropdown-item"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                Profile Settings
                                            </Link>
                                        )}

                                        <Link
                                            to={isAdmin ? "/admin" : "/dashboard"}
                                            className="dropdown-item"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
                                        </Link>

                                        <div className="dropdown-divider" />

                                        <button className="dropdown-item logout" onClick={handleLogout}>
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-outline" onClick={closeMobileMenu}>
                            Login
                        </Link>
                    )}


                    <button
                        className="mobile-menu-toggle"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle menu"
                    >
                        {showMobileMenu ? 'Close' : 'Menu'}
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
