// components/BlogSeo.jsx
import { Helmet } from 'react-helmet-async';

const BlogSeo = ({ blog }) => {
  // Default values if blog is undefined
  const defaultTitle = 'Lift A Kid';
  const defaultDescription = 'Support madrasha child education through donations and sponsorships.';
  const defaultImage = '/default-og-image.jpg';
  const defaultUrl = '/';
  
  // Safety checks
  const title = blog?.metaTitle || blog?.title || defaultTitle;
  const description = blog?.metaDescription || blog?.shortDescription || defaultDescription;
  const image = blog?.ogImage || blog?.featuredImage || defaultImage;
  const url = `/blog/${blog?.slug || ''}`;
  const author = blog?.author || 'Lift A Kid';
  const publishedAt = blog?.publishedAt || blog?.createdAt || new Date().toISOString();
  const category = blog?.category || 'General';
  const keywords = blog?.metaKeywords || 'education, donation, sponsorship, children';
  const canonical = blog?.canonicalUrl || url;
  const index = blog?.index !== undefined ? blog.index : true;
  const follow = blog?.follow !== undefined ? blog.follow : true;
  const ogType = blog?.ogType || 'article';
  const twitterCard = blog?.twitterCard || 'summary_large_image';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>  {/* 👈 Always a string */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />
      <meta name="author" content={author} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Lift A Kid" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@LiftAKid" />
      
      {/* Article Meta */}
      <meta property="article:published_time" content={publishedAt} />
      <meta property="article:modified_time" content={publishedAt} />
      <meta property="article:author" content={author} />
      <meta property="article:section" content={category} />
      
      {/* Robots */}
      <meta name="robots" content={`${index ? 'index' : 'noindex'}, ${follow ? 'follow' : 'nofollow'}`} />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": title,
          "description": description,
          "image": image,
          "author": {
            "@type": "Person",
            "name": author
          },
          "datePublished": publishedAt,
          "dateModified": publishedAt,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url
          }
        })}
      </script>
    </Helmet>
  );
};

export default BlogSeo;