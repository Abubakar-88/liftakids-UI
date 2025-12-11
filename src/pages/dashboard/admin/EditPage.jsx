import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPageBySlug, savePage } from '../../../api/pageApi';
import { toast } from 'react-toastify';

const EditPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    slug: slug || '',
    title: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    published: true,
    sortOrder: 0
  });

  const [previewMode, setPreviewMode] = useState(false);

  // Predefined page templates
  const predefinedPages = {
    'about-us': { 
      title: 'About Us', 
      defaultContent: `<div class="prose max-w-none">
  <h1>About Our Organization</h1>
  <p class="lead">Welcome to our organization. We are committed to making a difference in our community.</p>
  
  <h2>Our Story</h2>
  <p>Share your organization's history, mission, and values here. Explain what makes your organization unique.</p>
  
  <h2>Our Mission</h2>
  <p>Describe your organization's mission and the impact you aim to make.</p>
  
  <h2>Our Vision</h2>
  <p>Outline your vision for the future and the goals you're working towards.</p>
  
  <h2>Our Team</h2>
  <p>Introduce your team members and their roles in the organization.</p>
</div>` 
    },
    'contact': { 
      title: 'Contact Us', 
      defaultContent: `<div class="prose max-w-none">
  <h1>Contact Us</h1>
  <p>We'd love to hear from you. Get in touch with us using the information below.</p>
  
  <h2>Contact Information</h2>
  <div class="grid md:grid-cols-2 gap-6">
    <div>
      <h3>Address</h3>
      <p>123 Business Street<br>City, State 12345<br>Country</p>
    </div>
    <div>
      <h3>Contact Details</h3>
      <p>Email: info@example.com<br>Phone: +1 (555) 123-4567<br>Hours: Mon-Fri 9AM-5PM</p>
    </div>
  </div>
  
  <h2>Send Us a Message</h2>
  <p>Use the contact form on this page to send us a message directly.</p>
</div>` 
    },
    'mission-vision': { 
      title: 'Mission & Vision', 
      defaultContent: `<div class="prose max-w-none">
  <h1>Mission & Vision</h1>
  
  <div class="bg-blue-50 p-6 rounded-lg mb-6">
    <h2 class="text-blue-800">Our Mission</h2>
    <p class="text-lg">State your organization's mission here. This should be a clear, concise statement of your purpose.</p>
  </div>
  
  <div class="bg-green-50 p-6 rounded-lg mb-6">
    <h2 class="text-green-800">Our Vision</h2>
    <p class="text-lg">Describe your vision for the future. What change do you hope to see in the world?</p>
  </div>
  
  <div class="bg-purple-50 p-6 rounded-lg">
    <h2 class="text-purple-800">Our Values</h2>
    <ul class="list-disc list-inside">
      <li><strong>Value 1:</strong> Description of your first core value</li>
      <li><strong>Value 2:</strong> Description of your second core value</li>
      <li><strong>Value 3:</strong> Description of your third core value</li>
    </ul>
  </div>
</div>` 
    },
    'privacy-policy': { 
      title: 'Privacy Policy', 
      defaultContent: `<div class="prose max-w-none">
  <h1>Privacy Policy</h1>
  <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>
  
  <h2>Introduction</h2>
  <p>Welcome to our Privacy Policy. This document explains how we collect, use, and protect your personal information.</p>
  
  <h2>Information We Collect</h2>
  <p>Describe the types of information you collect from users.</p>
  
  <h2>How We Use Your Information</h2>
  <p>Explain how you use the collected information.</p>
  
  <h2>Data Protection</h2>
  <p>Describe your data protection measures and security practices.</p>
  
  <h2>Your Rights</h2>
  <p>Explain users' rights regarding their personal data.</p>
  
  <h2>Contact Us</h2>
  <p>Provide contact information for privacy-related inquiries.</p>
</div>` 
    }
  };

  useEffect(() => {
    loadPage();
  }, [slug]);

  const loadPage = async () => {
    try {
      if (slug) {
        // Try to load existing page
        const data = await getPageBySlug(slug);
        if (data) {
          setFormData(data);
        } else {
          // Set defaults for new page
          const predefined = predefinedPages[slug];
          setFormData({
            slug: slug,
            title: predefined?.title || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            content: predefined?.defaultContent || '<p>Start writing your page content here...</p>',
            metaTitle: predefined?.title || '',
            metaDescription: '',
            metaKeywords: '',
            published: true,
            sortOrder: Object.keys(predefinedPages).indexOf(slug) + 1 || 0
          });
        }
      }
    } catch (error) {
      console.error('Error loading page:', error);
      toast.error('Failed to load page data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (e) => {
    setFormData(prev => ({ ...prev, content: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await savePage(formData);
      toast.success(`Page "${formData.title}" saved successfully`);
      navigate('/admin/pages');
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {formData.id ? 'Edit Page' : 'Create Page'} - {formData.title}
              </h1>
              <p className="text-gray-600 mt-1">
                {formData.id ? 'Update your page content' : 'Create a new static page for your website'}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handlePreview}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {previewMode ? 'Edit Mode' : 'Preview Mode'}
              </button>
              <button
                onClick={() => navigate('/admin/pages')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Pages
              </button>
            </div>
          </div>
        </div>

        {previewMode ? (
          /* Preview Mode */
          <div className="bg-white rounded-lg shadow-lg">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Page Preview</h2>
              <p className="text-sm text-gray-600">This is how your page will look to visitors</p>
            </div>
            <div className="p-8">
              <article className="prose prose-lg max-w-none">
                <h1>{formData.title}</h1>
                <div dangerouslySetInnerHTML={{ __html: formData.content }} />
              </article>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Page Content Card */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Page Content</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Page Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter page title"
                      />
                    </div>

                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                        Page Content *
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleContentChange}
                        required
                        rows={20}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                        placeholder="Enter your page content (HTML supported)"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        You can use HTML tags for formatting. Basic styling is provided by Tailwind CSS.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Column */}
              <div className="space-y-6">
                {/* Page Settings Card */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Page Settings</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                        URL Slug *
                      </label>
                      <input
                        type="text"
                        id="slug"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        required
                        readOnly={!!predefinedPages[slug]}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          predefinedPages[slug] ? 'bg-gray-100' : ''
                        }`}
                        placeholder="about-us"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        This will be used in the URL: /page/{formData.slug}
                      </p>
                    </div>

                    <div>
                      <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        id="sortOrder"
                        name="sortOrder"
                        value={formData.sortOrder}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Lower numbers appear first in lists
                      </p>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="published"
                        name="published"
                        checked={formData.published}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                        Publish this page
                      </label>
                    </div>
                  </div>
                </div>

                {/* SEO Settings Card */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">SEO Settings</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        id="metaTitle"
                        name="metaTitle"
                        value={formData.metaTitle}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Page title for search engines"
                      />
                    </div>

                    <div>
                      <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Description
                      </label>
                      <textarea
                        id="metaDescription"
                        name="metaDescription"
                        value={formData.metaDescription}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Brief description for search results"
                      />
                    </div>

                    <div>
                      <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        id="metaKeywords"
                        name="metaKeywords"
                        value={formData.metaKeywords}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Comma-separated keywords"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions Card */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Actions</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save Page'
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/admin/pages')}
                      className="w-full inline-flex justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditPage;