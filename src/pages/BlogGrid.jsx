
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaCalendar, FaUser, FaEye, FaHeart, 
  FaClock, FaTag, FaArrowRight, FaFilter
} from 'react-icons/fa';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';  // 👈 Navbar import করুন
import { 
  getAllPublishedBlogs, 
  getFeaturedBlogs, 
  getBlogsByCategory,
  searchBlogs,
  getAllCategories
} from '../api/blogApi';

const BlogGrid = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'ALL') {
      fetchBlogs();
    } else {
      fetchBlogsByCategory(selectedCategory);
    }
  }, [currentPage, selectedCategory]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [allBlogs, featured, categoriesData] = await Promise.all([
        getAllPublishedBlogs(0, 9, 'createdAt', 'desc'),
        getFeaturedBlogs(0, 3),
        getAllCategories()
      ]);
      
      console.log('📚 All Blogs:', allBlogs);
      console.log('⭐ Featured Blogs:', featured);
      console.log('📂 Categories:', categoriesData);
      
      setBlogs(allBlogs.content || []);
      setTotalPages(allBlogs.totalPages || 1);
      setFeaturedBlogs(featured.content || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await getAllPublishedBlogs(currentPage, 9, 'createdAt', 'desc');
      setBlogs(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogsByCategory = async (category) => {
    setLoading(true);
    try {
      const data = await getBlogsByCategory(category, currentPage, 9);
      setBlogs(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching blogs by category:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchBlogs();
      return;
    }
    
    setLoading(true);
    try {
      const data = await searchBlogs(searchTerm, 0, 9);
      setBlogs(data.content || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(0);
    } catch (error) {
      console.error('Error searching blogs:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(0);
  };

  const handleBlogClick = (slug) => {
    navigate(`/blog/${slug}`);
  };

  const getReadingTime = (content) => {
    if (!content) return '3 min read';
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  // Skeleton loader
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-5">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div className="flex items-center gap-4">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );

  // Check if blogs is empty
  console.log('📊 Current blogs state:', blogs);
  console.log('📊 Blogs length:', blogs.length);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 👇 Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Our Blog</h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
              Stories, updates and insights from our community
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-3 pl-14 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
              />
              <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Featured Blogs */}
      {featuredBlogs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 -mt-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FaHeart className="text-red-500 mr-2" /> Featured Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredBlogs.map((blog) => (
              <div
                key={blog.id}
                onClick={() => handleBlogClick(blog.slug)}
                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="relative h-48 overflow-hidden">
                  {blog.featuredImage ? (
                    <img 
                      src={blog.featuredImage} 
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-400 to-teal-400 flex items-center justify-center">
                      <FaHeart className="text-white text-4xl opacity-50" />
                    </div>
                  )}
                  <span className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                    Featured
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{blog.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{blog.shortDescription}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center">
                      <FaUser className="mr-1" /> {blog.author}
                    </span>
                    <span className="flex items-center">
                      <FaClock className="mr-1" /> {getReadingTime(blog.content)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="font-semibold text-gray-700 flex items-center">
            <FaFilter className="mr-2" /> Categories:
          </span>
          <button
            onClick={() => handleCategoryChange('ALL')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">{blogs.length} articles found</p>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Blog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-lg">No articles found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                fetchBlogs();
              }}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className={`grid ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          } gap-6`}>
            {blogs.map((blog) => (
              <div
                key={blog.id}
                onClick={() => handleBlogClick(blog.slug)}
                className={`bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer 
                  transform transition-all hover:shadow-xl hover:-translate-y-1 ${
                  viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
                }`}
              >
                {/* Image */}
                <div className={`${viewMode === 'list' ? 'md:w-64 md:flex-shrink-0' : ''} relative overflow-hidden`}>
                  <div className={`${viewMode === 'list' ? 'h-full min-h-[200px]' : 'h-48'} bg-gray-100`}>
                    {blog.featuredImage ? (
                      <img 
                        src={blog.featuredImage} 
                        alt={blog.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-400 to-teal-400 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">📝</span>
                      </div>
                    )}
                  </div>
                  {blog.featured && (
                    <span className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 p-5 ${viewMode === 'list' ? 'flex flex-col justify-center' : ''}`}>
                  {blog.category && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full mb-3">
                      {blog.category}
                    </span>
                  )}

                  <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                    {blog.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {blog.shortDescription}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center">
                      <FaUser className="mr-1" /> {blog.author}
                    </span>
                    <span className="flex items-center">
                      <FaCalendar className="mr-1" /> 
                      {format(new Date(blog.createdAt), 'MMM dd, yyyy')}
                    </span>
                    <span className="flex items-center">
                      <FaClock className="mr-1" /> {getReadingTime(blog.content)}
                    </span>
                    <span className="flex items-center">
                      <FaEye className="mr-1" /> {blog.viewCount || 0}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors">
                    Read Article <FaArrowRight className="ml-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogGrid;