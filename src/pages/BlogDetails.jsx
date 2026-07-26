
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaArrowLeft, FaCalendar, FaUser, FaTag, FaEye, 
  FaHeart, FaShare, FaClock, FaFacebook, FaTwitter, 
  FaLinkedin, FaWhatsapp, FaEnvelope
} from 'react-icons/fa';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import BlogSeo from '../components/BlogSeo';
import { getBlogBySlug } from '../api/blogApi';

const BlogDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const data = await getBlogBySlug(slug);
      console.log('📄 Blog data:', data);
      setBlog(data);
      setLikes(data.likeCount || 0);
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Blog not found');
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!blog) return;
    try {
      const response = await fetch(`http://localhost:8082/LiftAKids/api/blogs/public/${blog.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes);
        setLiked(true);
        toast.success('Liked!');
      }
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this article: ${blog?.title}`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offscreen/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`,
      email: `mailto:?subject=${encodeURIComponent(blog?.title)}&body=${encodeURIComponent(text + '\n\n' + url)}`
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } else {
      window.open(shareUrls[platform], '_blank');
    }
  };

  const getReadingTime = (content) => {
    if (!content) return '3 min read';
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-64 p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Blog not found</h1>
          <p className="text-gray-500 mb-4">The article you're looking for doesn't exist.</p>
          <Link to="/blog" className="text-blue-600 hover:text-blue-800">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
  <>
    <BlogSeo blog={blog} />
    
    <article className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <button
          onClick={() => navigate('/blog')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Back to Blog
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative">
        {blog.featuredImage && (
          <div className="w-full h-[300px] md:h-[400px] overflow-hidden">
            <img 
              src={blog.featuredImage} 
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          </div>
        )}
        
        <div className={`${blog.featuredImage ? 'absolute bottom-0 left-0 right-0' : 'relative'} p-6 md:p-10 text-white`}>
          <div className="max-w-4xl mx-auto">
            {blog.category && (
              <span className="inline-block px-3 py-1 bg-blue-500/20 backdrop-blur-sm text-blue-200 text-sm font-medium rounded-full mb-4">
                {blog.category}
              </span>
            )}
            
            <h1 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">
              {blog.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 text-left">
              <span className="flex items-center"><FaUser className="mr-2" /> {blog.author}</span>
              <span className="flex items-center">
                <FaCalendar className="mr-2" /> 
                {format(new Date(blog.publishedAt || blog.createdAt), 'MMM dd, yyyy')}
              </span>
              <span className="flex items-center text-left"><FaClock className="mr-2" /> {getReadingTime(blog.content)}</span>
              <span className="flex items-center"><FaEye className="mr-2" /> {blog.viewCount || 0} views</span>
            </div>
          </div>
        </div>
      </div>

      {/* 👇 CONTENT BODY - HTML Render */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 lg:p-10">
          
          {/* Short Description */}
          {blog.shortDescription && (
            <div className="text-base md:text-lg text-gray-600 border-l-4 border-blue-500 pl-4 mb-6 italic">
              {blog.shortDescription}
            </div>
          )}

          {/* 👇 MAIN CONTENT - HTML properly rendered */}
          <div 
            className="blog-content-wrapper text-left"
            style={{
              maxWidth: '100%',
              overflow: 'hidden'
            }}
          >
            <div 
              className="prose prose-sm sm:prose-base lg:prose-lg max-w-none 
                       prose-headings:text-gray-800 prose-p:text-gray-700 
                       prose-a:text-blue-600 prose-img:rounded-lg
                       prose-img:max-w-full prose-img:h-auto
                       prose-ul:list-disc prose-ul:pl-5
                       prose-li:mb-1
                       break-words overflow-hidden"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Tags */}
          {blog.tags && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {blog.tags.split(',').map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    <FaTag className="inline mr-1" /> {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  disabled={liked}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <FaHeart className={liked ? 'fill-red-500 text-red-500' : ''} />
                  <span>{likes}</span>
                </button>
                
                <button
                  onClick={() => handleShare('copy')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
                >
                  <FaShare /> Share
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button onClick={() => handleShare('facebook')} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <FaFacebook />
                </button>
                <button onClick={() => handleShare('twitter')} className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
                  <FaTwitter />
                </button>
                <button onClick={() => handleShare('linkedin')} className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800">
                  <FaLinkedin />
                </button>
                <button onClick={() => handleShare('whatsapp')} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                  <FaWhatsapp />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  </>
);
}
export default BlogDetails;