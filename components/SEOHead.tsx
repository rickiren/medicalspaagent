import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  businessName?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Cynthia.ai - AI Medical Spa Receptionist',
  description = 'Increase bookings, answer questions instantly, and impress every visitor — powered by your spa\'s real services, pricing, and treatments. Fully custom to your business.',
  image = '/og-image.png',
  url,
  businessName,
}) => {
  useEffect(() => {
    const baseUrl = window.location.origin;
    const fullUrl = url || window.location.href;
    const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

    // Update or create meta tags
    const updateMetaTag = (property: string, content: string, isProperty = true) => {
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update title
    document.title = title;

    // Update description
    updateMetaTag('description', description, false);

    // Open Graph tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', fullImageUrl);
    updateMetaTag('og:url', fullUrl);
    updateMetaTag('og:type', 'website');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', false);
    updateMetaTag('twitter:title', title, false);
    updateMetaTag('twitter:description', description, false);
    updateMetaTag('twitter:image', fullImageUrl, false);

    // Additional meta tags
    updateMetaTag('title', title, false);
  }, [title, description, image, url, businessName]);

  return null;
};

