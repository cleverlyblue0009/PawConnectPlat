import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const Header = () => {
  const { user, isAuthenticated, isShelter, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-3xl">🐾</div>
            <div>
              <h1 className="text-2xl font-bold text-rust">PawConnect</h1>
              <p className="text-xs text-gray-500 -mt-1">Connecting Hearts</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/browse" className="text-gray-700 hover:text-rust font-medium transition-colors">
              Find Pets
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-rust font-medium transition-colors">
              About Us
            </Link>
            <Link to="/shelters" className="text-gray-700 hover:text-rust font-medium transition-colors">
              For Shelters
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-rust font-medium transition-colors">
              Contact
            </Link>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-rust"
                >
                  <div className="w-10 h-10 rounded-full bg-rust text-white flex items-center justify-center font-semibold">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <span className="font-medium">{user?.firstName}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-rust-50 hover:text-rust"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-rust-50 hover:text-rust"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Profile
                    </Link>
                    {isShelter && (
                      <Link
                        to="/my-pets"
                        className="block px-4 py-2 text-gray-700 hover:bg-rust-50 hover:text-rust"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Pets
                      </Link>
                    )}
                    <hr className="my-2" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/auth?mode=login" className="text-rust font-semibold hover:text-rust-600">
                  Sign In
                </Link>
                <Link to="/auth?mode=register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pb-4 space-y-2">
            <Link
              to="/browse"
              className="block py-2 text-gray-700 hover:text-rust"
              onClick={() => setShowMobileMenu(false)}
            >
              Find Pets
            </Link>
            <Link
              to="/about"
              className="block py-2 text-gray-700 hover:text-rust"
              onClick={() => setShowMobileMenu(false)}
            >
              About Us
            </Link>
            <Link
              to="/shelters"
              className="block py-2 text-gray-700 hover:text-rust"
              onClick={() => setShowMobileMenu(false)}
            >
              For Shelters
            </Link>
            <Link
              to="/contact"
              className="block py-2 text-gray-700 hover:text-rust"
              onClick={() => setShowMobileMenu(false)}
            >
              Contact
            </Link>
            <hr className="my-2" />
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block py-2 text-gray-700 hover:text-rust"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleLogout();
                  }}
                  className="block w-full text-left py-2 text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth?mode=login"
                  className="block py-2 text-rust font-semibold"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="block py-2 text-rust font-semibold"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
