import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  User, 
  LogOut, 
  Settings, 
  Heart,
  Menu,
  X 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const isActivePage = (path) => {
    return router.pathname === path;
  };

  useEffect(() => {
    // Close menus when route changes
    setIsMenuOpen(false);
    setShowUserMenu(false);
  }, [router.pathname]);

  return (
    <nav className="glass-effect sticky top-0 z-50 border-b border-cyan-500/20 bg-black/90 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Extreme Left */}
          <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
            <Image 
              src="/logo.jpeg" 
              alt="आरोग्यPath Logo" 
              width={120} 
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link 
              href="/" 
              className={`${
                isActivePage('/') 
                  ? 'text-cyan-400 font-medium' 
                  : 'text-gray-300 hover:text-cyan-400'
              } transition-colors`}
            >
              Home
            </Link>
            <Link 
              href="/diagnosis" 
              className={`${
                isActivePage('/diagnosis') 
                  ? 'text-cyan-400 font-medium' 
                  : 'text-gray-300 hover:text-cyan-400'
              } transition-colors`}
            >
              AI Diagnosis
            </Link>
            <Link 
              href="/hospitals" 
              className={`${
                isActivePage('/hospitals') 
                  ? 'text-cyan-400 font-medium' 
                  : 'text-gray-300 hover:text-cyan-400'
              } transition-colors`}
            >
              Find Hospitals
            </Link>
            <Link 
              href="/contact" 
              className={`${
                isActivePage('/contact') 
                  ? 'text-cyan-400 font-medium' 
                  : 'text-gray-300 hover:text-cyan-400'
              } transition-colors`}
            >
              Contact
            </Link>
          </div>

          {/* Auth Buttons - Extreme Right */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-black" />
                  </div>
                  <span className="hidden sm:block text-gray-200 font-medium">
                    {user?.firstName || 'User'}
                  </span>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-lg rounded-lg shadow-lg shadow-cyan-500/20 border border-cyan-500/30 py-2">
                    <div className="px-4 py-3 border-b border-cyan-500/20">
                      <p className="text-sm font-medium text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
                    </div>
                    <Link 
                      href="/profile" 
                      className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </Link>
                    <Link 
                      href="/settings" 
                      className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Link>
                    <hr className="my-1 border-cyan-500/20" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link 
                  href="/login"
                  className="text-gray-300 hover:text-cyan-400 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup"
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-black px-4 py-2 rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all font-medium shadow-lg shadow-cyan-500/50"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-cyan-500/20 py-4 bg-black">
            <div className="space-y-2">
              <Link 
                href="/"
                className="block px-4 py-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/diagnosis"
                className="block px-4 py-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
              >
                AI Diagnosis
              </Link>
              <Link 
                href="/hospitals"
                className="block px-4 py-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
              >
                Find Hospitals
              </Link>
              <Link 
                href="/contact"
                className="block px-4 py-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
              >
                Contact
              </Link>
              
              {!isAuthenticated() && (
                <>
                  <hr className="my-2 border-cyan-500/20" />
                  <Link 
                    href="/login"
                    className="block px-4 py-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/signup"
                    className="block px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all font-medium mx-4 shadow-lg shadow-cyan-500/50"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}