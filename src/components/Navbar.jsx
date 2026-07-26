// Navbar.jsx
import { useState, useEffect } from 'react';
import { FaTimes, FaHome, FaSearch, FaInfoCircle, FaHandHoldingHeart, FaUser, FaBlog, FaEnvelope } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { getAllPages } from '../api/pageApi';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dynamicPages, setDynamicPages] = useState([]);
  const location = useLocation();

  // Load dynamic pages
  useEffect(() => {
    loadDynamicPages();
  }, []);

  const loadDynamicPages = async () => {
    try {
      console.log('📡 Navbar: Loading dynamic pages...');
      const pages = await getAllPages();
      console.log('📄 Navbar: All pages:', pages);
      
      const publishedPages = pages.filter(page => page.published === true);
      console.log('✅ Navbar: Published pages:', publishedPages);
      
      setDynamicPages(publishedPages);
    } catch (error) {
      console.error('❌ Navbar: Error loading pages:', error);
    }
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery('');
    }
  };

  // Static navigation items
  const staticNavItems = [
    { name: 'Home', path: '/', icon: <FaHome /> },
    { name: 'Search for Sponsor', path: '/search', icon: <FaSearch /> },
    { name: 'Register/Login', path: '/chose-option', icon: <FaUser /> },
    { name: 'Blog', path: '/blog', icon: <FaBlog /> }
  ];

  // Dynamic navigation items from database (pages table)
  const dynamicNavItems = dynamicPages.map(page => {
    console.log(`📄 Creating nav item: ${page.title} -> /${page.slug}`);
    return {
      name: page.title,
      path: `/${page.slug}`,
      icon: getIconForPage(page.slug)
    };
  });

  // Static + Dynamic combine
  const allNavItems = [...staticNavItems, ...dynamicNavItems];

  function getIconForPage(slug) {
    const iconMap = {
      'about-us': <FaInfoCircle />,
      'contact': <FaEnvelope />,
      'benefit-for-sponsor': <FaHandHoldingHeart />,
    };
    return iconMap[slug] || <FaInfoCircle />;
  }

  // Current page title
  const isBlogDetail = location.pathname.startsWith('/blog/') && location.pathname !== '/blog';
  const currentPageTitle = isBlogDetail ? 'Blog Post' : 'Lift A Kid';

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

        {!showSearch ? (
          <h1 className="text-xl md:text-2xl font-semibold text-teal-600">
            {currentPageTitle}
          </h1>
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
        <nav className="mt-4 overflow-y-auto max-h-[calc(100vh-80px)]">
          <ul className="space-y-2">
            {allNavItems.map((item) => {
              const isActive = location.pathname === item.path || 
                              (item.path === '/blog' && location.pathname.startsWith('/blog/'));
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 transition-colors ${
                      isActive 
                        ? 'bg-teal-50 text-teal-600 font-semibold' 
                        : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className={`mr-3 ${isActive ? 'text-teal-600' : 'text-teal-500'}`}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Navbar;