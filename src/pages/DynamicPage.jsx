// DynamicPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getPageBySlug } from '../api/pageApi';
import ContactForm from '../components/ContactForm';

const DynamicPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 👇 location.pathname এবং slug দুটোই dependency দিন
  useEffect(() => {
    console.log('🔄 DynamicPage mounted/updated');
    console.log('📍 Location:', location.pathname);
    console.log('📦 Slug from params:', slug);
    loadPageContent();
  }, [location.pathname, slug]); // 👈 দুটো dependency

  const loadPageContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // pathname থেকে slug বের করুন
      let pageSlug = location.pathname.replace('/', '');
      
      // যদি slug খালি থাকে, useParams থেকে নিন
      if (!pageSlug || pageSlug === '') {
        pageSlug = slug;
      }

      // যদি still খালি থাকে, home সেট করুন
      if (!pageSlug || pageSlug === '') {
        pageSlug = 'home';
      }

      console.log('🔍 Final slug to fetch:', pageSlug);

      // URL path to database slug mapping
      const routeToSlugMap = {
        'about-us': 'about-us',
        'about': 'about-us',
        'contact': 'contact',
        'contact-us': 'contact',
        'benefit-for-sponsor': 'benefit-for-sponsor',
        'benefits': 'benefit-for-sponsor'
      };

      const finalSlug = routeToSlugMap[pageSlug] || pageSlug;
      console.log('📡 API call with slug:', finalSlug);

      const data = await getPageBySlug(finalSlug);
      console.log('📄 Page data:', data);
      
      if (data) {
        setPageData(data);
      } else {
        setError('Page not found');
      }
    } catch (err) {
      console.error('❌ Error loading page:', err);
      setError('Failed to load page content');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
            <p className="text-gray-600">{error || 'The page you are looking for does not exist.'}</p>
            <Link 
              to="/" 
              className="mt-4 inline-block bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          {pageData.metaDescription && (
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              {pageData.metaDescription}
            </p>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600"
            dangerouslySetInnerHTML={{ __html: pageData.content }}
          />
          
          {/* Contact page এ Contact Form দেখাবে */}
          {pageData?.slug === 'contact' && (
            <div className="mt-12 border-t border-gray-200 pt-8">
              <ContactForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicPage;