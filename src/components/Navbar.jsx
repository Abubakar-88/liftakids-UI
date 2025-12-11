// Navbar.jsx - Updated version
import { useState, useEffect } from 'react';
import { FaTimes, FaHome, FaSearch, FaInfoCircle, FaHandHoldingHeart, FaUser, FaBlog, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getAllPages } from '../api/pageApi'; // আপনার existing API

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dynamicPages, setDynamicPages] = useState([]);

  // Load dynamic pages on component mount
  useEffect(() => {
    loadDynamicPages();
  }, []);

  const loadDynamicPages = async () => {
    try {
      const pages = await getAllPages();
      // Filter only published pages for navigation
      const publishedPages = pages.filter(page => page.published);
      setDynamicPages(publishedPages);
    } catch (error) {
      console.error('Error loading dynamic pages:', error);
    }
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery(''); // Clear search when closing
    }
  };

  // Static navigation items
  const staticNavItems = [
    { name: 'Home', path: '/', icon: <FaHome /> },
    { name: 'Search for Sponsor', path: '/search', icon: <FaSearch /> },
    { name: 'Register/Login', path: '/chose-option', icon: <FaUser /> },
    { name: 'Blog', path: '/blog', icon: <FaBlog /> }
  ];

  // Dynamic navigation items from database
  const dynamicNavItems = dynamicPages.map(page => ({
    name: page.title,
    path: `/${page.slug}`,
    icon: getIconForPage(page.slug)
  }));

  // Combine static and dynamic navigation items
  const allNavItems = [...staticNavItems, ...dynamicNavItems];

  // Helper function to get icons for dynamic pages
  function getIconForPage(slug) {
    const iconMap = {
      'about-us': <FaInfoCircle />,
      'contact': <FaEnvelope />,
      'benefit-for-sponsor': <FaHandHoldingHeart />,
    };
    return iconMap[slug] || <FaInfoCircle />; // Default icon
  }

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center mb-4 md:mb-8 p-4 bg-white shadow-sm">
        <button 
          className="text-3xl font-bold hover:text-teal-600 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes /> : '☰'}
        </button>

        {/* Conditional rendering of title or search bar */}
        {!showSearch ? (
          <h1 className="text-xl md:text-2xl font-semibold text-teal-600">Lift A Kids</h1>
        ) : (
          <div className="flex-grow mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for students, sponsors..."
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        )}

        <button 
          onClick={toggleSearch}
          className="text-2xl hover:text-teal-600 transition-colors"
        >
          {showSearch ? <FaTimes /> : <FaSearch />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40" 
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Side Navigation Menu */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-teal-600">Menu</h2>
        </div>
        <nav className="mt-4">
          <ul className="space-y-2">
            {allNavItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mr-3 text-teal-500">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Navbar;