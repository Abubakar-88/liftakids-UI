
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FaSave, FaTimes, FaEye, FaUpload, FaTrash } from 'react-icons/fa';
import { createBlog } from '../../../api/blogApi';

const CreateBlog = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    content: '',
    category: '',
    tags: '',
    featuredImage: '',
    published: true,
    featured: false,
    // SEO Fields
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

  const [activeTab, setActiveTab] = useState('content'); // content, seo

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
      await createBlog(formData, 1); // adminId from context
      navigate('/admin/articles');
    } catch (error) {
      console.error('Error creating blog:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create New Article</h1>
          <p className="text-gray-500 mt-1">Write and publish a new blog post</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/articles')}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <FaTimes className="mr-2" /> Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center disabled:opacity-50"
          >
            <FaSave className="mr-2" /> {loading ? 'Publishing...' : 'Publish Article'}
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
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">Recommended: 50-60 characters for SEO</p>
                <button
                  type="button"
                  onClick={generateSlug}
                  className="text-xs text-teal-600 hover:text-teal-700"
                >
                  Generate Slug
                </button>
              </div>
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
                placeholder="Brief summary of the article (max 500 characters)"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.shortDescription.length}/500 characters
              </p>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
              <div className="flex gap-3">
                <input
                  type="url"
                  name="featuredImage"
                  value={formData.featuredImage}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <FaUpload className="inline mr-1" /> Upload
                </button>
              </div>
              {formData.featuredImage && (
                <div className="mt-2 relative inline-block">
                  <img src={formData.featuredImage} alt="Preview" className="h-24 w-32 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <FaTrash className="h-3 w-3" />
                  </button>
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
                  placeholder="e.g., Education, Success Story, Announcement"
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
                <span className="text-sm text-gray-700">Publish immediately</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Feature this article (starred)</span>
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
                Use relevant keywords naturally in your content.
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
                placeholder="SEO optimized title (leave empty to use main title)"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters. {formData.metaTitle?.length || 0}/160</p>
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
                placeholder="Brief description for search results (150-160 characters recommended)"
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
              <p className="text-xs text-gray-500 mt-1">Comma-separated keywords</p>
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
              <p className="text-xs text-gray-500 mt-1">Leave empty to use auto-generated URL</p>
            </div>

            {/* OG Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Open Graph Image (Social Media)</label>
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

export default CreateBlog;