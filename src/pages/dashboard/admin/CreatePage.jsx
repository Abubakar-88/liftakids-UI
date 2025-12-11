import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSlugAvailability, savePage, } from '../../../api/pageApi';
import { toast } from 'react-toastify';

const CreatePage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    published: true,
    sortOrder: 0
  });

  const [slugStatus, setSlugStatus] = useState({
    available: null,
    valid: null,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-check slug when title changes
    if (name === 'title' && !formData.slug) {
      const generatedSlug = generateSlug(value);
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
      checkSlugAvailability(generatedSlug);
    }

    // Check slug when slug field changes
    if (name === 'slug') {
      checkSlugAvailability(value);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove invalid chars
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/-+/g, '-') // Replace multiple - with single -
      .trim();
  };

  const checkSlugAvailability = async (slug) => {
    if (!slug) {
      setSlugStatus({ available: null, valid: null, message: '' });
      return;
    }

    setSlugChecking(true);
    try {
      const response = await checkSlugAvailability(slug);
      setSlugStatus({
        available: response.available,
        valid: response.valid,
        message: response.available 
          ? 'Slug is available!' 
          : 'Slug is already taken'
      });
    } catch (error) {
      console.error('Error checking slug:', error);
      setSlugStatus({
        available: false,
        valid: false,
        message: 'Error checking slug availability'
      });
    } finally {
      setSlugChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.slug || !formData.title || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!slugStatus.available) {
      toast.error('Please choose an available slug');
      return;
    }

    if (!slugStatus.valid) {
      toast.error('Please use a valid slug format (letters, numbers, hyphens only)');
      return;
    }

    setSaving(true);
    try {
      await savePage(formData);
      toast.success(`Page "${formData.title}" created successfully!`);
      navigate('/admin/pages');
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error('Failed to create page');
    } finally {
      setSaving(false);
    }
  };

  const getSlugStatusColor = () => {
    if (!slugStatus.available && !slugStatus.valid) return 'text-red-600';
    if (slugStatus.available && slugStatus.valid) return 'text-green-600';
    return 'text-yellow-600';
  };

  const getSlugStatusIcon = () => {
    if (slugChecking) return '⏳ Checking...';
    if (!slugStatus.available && !slugStatus.valid) return '❌';
    if (slugStatus.available && slugStatus.valid) return '✅';
    return '⚠️';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Page</h1>
              <p className="text-gray-600 mt-1">Add a new custom page to your website</p>
            </div>
            <button
              onClick={() => navigate('/admin/pages')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Pages
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
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
                      placeholder="Enter page title (e.g., Our Services, FAQ, Careers)"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      This will be displayed as the main heading of your page
                    </p>
                  </div>

                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                      URL Slug *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">/page/</span>
                      </div>
                      <input
                        type="text"
                        id="slug"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        required
                        className="pl-16 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="about-us"
                      />
                    </div>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getSlugStatusColor()}`}>
                        {getSlugStatusIcon()} {slugStatus.message}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Use only letters, numbers, and hyphens. This will be used in the URL.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                      Page Content *
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      required
                      rows={15}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder="Enter your page content here. You can use HTML for formatting."
                    />
                    <div className="mt-2 p-3 bg-gray-50 rounded border">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Content Tips:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Use <code>&lt;h1&gt;</code> for main title (already added from page title)</li>
                        <li>• Use <code>&lt;h2&gt;</code>, <code>&lt;h3&gt;</code> for subheadings</li>
                        <li>• Use <code>&lt;p&gt;</code> for paragraphs</li>
                        <li>• Use <code>&lt;ul&gt;</code> and <code>&lt;li&gt;</code> for lists</li>
                        <li>• Add classes like <code>class="bg-blue-50 p-4 rounded"</code> for styling</li>
                      </ul>
                    </div>
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
                    <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      id="sortOrder"
                      name="sortOrder"
                      value={formData.sortOrder}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Lower numbers appear first in navigation
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
                      Publish immediately
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
                      placeholder="Optional - defaults to page title"
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
                      placeholder="Brief description for search engines"
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
                    disabled={saving || !slugStatus.available || !slugStatus.valid}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Page...
                      </>
                    ) : (
                      'Create Page'
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

              {/* Quick Templates Card */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Quick Templates</h3>
                </div>
                <div className="p-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        content: `<div class="prose max-w-none">
                        <h1>${formData.title || 'Page Title'}</h1>
                        <p class="lead">Start with an engaging introduction about your topic.</p>
                        
                        <h2>Main Section</h2>
                        <p>Add your main content here. Explain what this page is about.</p>
                        
                        <div class="bg-blue-50 p-4 rounded-lg my-4">
                            <h3 class="text-blue-800">Important Note</h3>
                            <p>Use boxes like this to highlight important information.</p>
                        </div>
                        
                        <h2>Additional Information</h2>
                        <p>Include any additional details your visitors might need.</p>
                        
                        <ul>
                            <li>List important points</li>
                            <li>Use bullet points for readability</li>
                            <li>Keep content organized</li>
                        </ul>
                        </div>`
                      }));
                    }}
                    className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50 text-sm"
                  >
                    Basic Content Template
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        content: `<div class="prose max-w-none">
                        <h1>${formData.title || 'Service Name'}</h1>
                        
                        <div class="grid md:grid-cols-2 gap-8 my-6">
                            <div>
                            <h3>Features</h3>
                            <ul class="list-disc list-inside space-y-2">
                                <li>Feature one description</li>
                                <li>Feature two description</li>
                                <li>Feature three description</li>
                            </ul>
                            </div>
                            <div>
                            <h3>Benefits</h3>
                            <ul class="list-disc list-inside space-y-2">
                                <li>Benefit one description</li>
                                <li>Benefit two description</li>
                                <li>Benefit three description</li>
                            </ul>
                            </div>
                        </div>
                        </div>`
                      }));
                    }}
                    className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50 text-sm"
                  >
                    Service/Product Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;