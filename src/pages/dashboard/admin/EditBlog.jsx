// pages/dashboard/admin/EditBlog.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FaSave, FaTimes, FaTrash, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getBlogById, updateBlog, deleteBlog } from '../../../api/blogApi';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    content: '',
    category: '',
    tags: '',
    featuredImage: '',
    published: true,
    featured: false,
    slug: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    canonicalUrl: '',
    index: true,
    follow: true,
    ogType: 'article',
    ogImage: '',
    twitterCard: 'summary_large_image',
    schemaType: 'BlogPosting'
  });

  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    setFetching(true);
    try {
      const data = await getBlogById(id);
      setFormData({
        title: data.title || '',
        shortDescription: data.shortDescription || '',
        content: data.content || '',
        category: data.category || '',
        tags: data.tags || '',
        featuredImage: data.featuredImage || '',
        published: data.published !== undefined ? data.published : true,
        featured: data.featured || false,
        slug: data.slug || '',
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        metaKeywords: data.metaKeywords || '',
        canonicalUrl: data.canonicalUrl || '',
        index: data.index !== undefined ? data.index : true,
        follow: data.follow !== undefined ? data.follow : true,
        ogType: data.ogType || 'article',
        ogImage: data.ogImage || '',
        twitterCard: data.twitterCard || 'summary_large_image',
        schemaType: data.schemaType || 'BlogPosting'
      });
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to fetch blog details');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (value) => {
    setFormData(prev => ({ ...prev, content: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const adminId = localStorage.getItem('adminId') || 1;
      await updateBlog(id, formData, adminId);
      toast.success('Blog updated successfully!');
      navigate('/admin/articles');
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error(error.response?.data || 'Failed to update blog');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const adminId = localStorage.getItem('adminId') || 1;
        await deleteBlog(id, adminId);
        toast.success('Blog deleted successfully!');
        navigate('/admin/articles');
      } catch (error) {
        console.error('Error deleting blog:', error);
        toast.error('Failed to delete blog');
      }
    }
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setFormData(prev => ({ ...prev, slug }));
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Article</h1>
          <p className="text-gray-500 mt-1">Update your blog post</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/articles')}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <FaTimes className="mr-2" /> Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
          >
            <FaTrash className="mr-2" /> Delete
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center disabled:opacity-50"
          >
            <FaSave className="mr-2" /> {loading ? 'Updating...' : 'Update Article'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'content' 
                ? 'text-teal-600 border-b-2 border-teal-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'seo' 
                ? 'text-teal-600 border-b-2 border-teal-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            SEO Settings
          </button>
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter article title"
              />
              <button
                type="button"
                onClick={generateSlug}
                className="text-xs text-teal-600 hover:text-teal-700 mt-1"
              >
                Generate Slug
              </button>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
              <div className="flex items-center">
                <span className="text-gray-500 text-sm mr-2">/blog/</span>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="auto-generated-from-title"
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                required
                rows="3"
                maxLength="500"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Brief summary of the article"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.shortDescription.length}/500 characters
              </p>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
              <input
                type="url"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="https://example.com/image.jpg"
              />
              {formData.featuredImage && (
                <div className="mt-2">
                  <img src={formData.featuredImage} alt="Preview" className="h-24 w-32 object-cover rounded" />
                </div>
              )}
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Education, Success Story"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="comma, separated, tags"
                />
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                className="bg-white rounded-lg"
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image', 'video'],
                    ['clean']
                  ]
                }}
              />
            </div>

            {/* Settings */}
            <div className="flex gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Published</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Featured</span>
              </label>
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>SEO Tips:</strong> Meta title should be 50-60 characters, meta description 150-160 characters.
              </p>
            </div>

            {/* Meta Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                maxLength="160"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="SEO optimized title"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.metaTitle?.length || 0}/160 characters</p>
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                rows="2"
                maxLength="320"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Brief description for search results"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.metaDescription?.length || 0}/320 characters</p>
            </div>

            {/* Meta Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
              <input
                type="text"
                name="metaKeywords"
                value={formData.metaKeywords}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>

            {/* Canonical URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
              <input
                type="url"
                name="canonicalUrl"
                value={formData.canonicalUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="https://example.com/blog/canonical-url"
              />
            </div>

            {/* OG Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Open Graph Image</label>
              <input
                type="url"
                name="ogImage"
                value={formData.ogImage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="https://example.com/social-image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x630 pixels</p>
            </div>

            {/* Robots Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="index"
                  checked={formData.index}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Allow search engines to index</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="follow"
                  checked={formData.follow}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Allow search engines to follow links</span>
              </label>
            </div>

            {/* Twitter Card Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter Card Type</label>
              <select
                name="twitterCard"
                value={formData.twitterCard}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary with Large Image</option>
              </select>
            </div>

            {/* Schema Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schema.org Type</label>
              <select
                name="schemaType"
                value={formData.schemaType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="BlogPosting">Blog Posting</option>
                <option value="Article">Article</option>
                <option value="NewsArticle">News Article</option>
              </select>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EditBlog;