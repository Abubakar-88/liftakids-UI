import React from 'react';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; 
import { useParams } from 'react-router-dom';
import { getPageBySlug } from '../api/pageApi';
import ContactForm from '../components/ContactForm';
const DynamicPage = () => {
  const { slug } = useParams();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPageContent();
  }, [slug]);

  // Contact form auto-injection
  useEffect(() => {
    if (pageData?.slug === 'contact') {
      // Contact form will be rendered in the JSX
      // No need for DOM manipulation
    }
  }, [pageData]);
  const loadPageContent = async () => {
    try {
      setLoading(true);
      
      // Determine which slug to use based on the route
      let pageSlug = slug;
      
      // If no slug in params, check the current path
      if (!pageSlug) {
        const path = window.location.pathname;
        pageSlug = path.substring(1); // Remove leading slash
      }

      // Map route paths to page slugs
      const routeToSlugMap = {
        'about': 'about-us',
        'benefits': 'benefit-for-sponsor', 
        'contact': 'contact'
      };

      // Use mapped slug or fallback to the original
      const finalSlug = routeToSlugMap[pageSlug] || pageSlug;

      const data = await getPageBySlug(finalSlug);
      
      if (data) {
        setPageData(data);
      } else {
        setError('Page not found');
      }
    } catch (err) {
      console.error('Error loading page:', err);
      setError('Failed to load page content');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
        
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600">{error}</p>
          <Link 
            to="/" 
            className="mt-4 inline-block bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Coming Soon</h1>
          <p className="text-gray-600">This page is under construction.</p>
        </div>
      </div>
    );
  }

  return (
    
    <div className="min-h-screen bg-white">
        <Navbar />
      {/* Page Header */}
      <div className="bg-teal-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{pageData.title}</h1>
          {pageData.metaDescription && (
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              {pageData.metaDescription}
            </p>
          )}
        </div>
      </div>

      {/* Page Content */}
   <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Render HTML content safely */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: pageData.content }}
          />
          
          {/* Automatically show contact form for contact page */}
          {pageData?.slug === 'contact' && (
            <div className="mt-12">
              <ContactForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicPage;