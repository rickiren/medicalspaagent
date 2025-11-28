import React from 'react';
import { ContactInfo } from '../utils/contactExtractor';

interface ContactInfoViewerProps {
  contactInfo: ContactInfo | null;
}

const ContactInfoViewer: React.FC<ContactInfoViewerProps> = ({ contactInfo }) => {
  if (!contactInfo) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          No contact information available. Scrape the website to extract contact details.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emails */}
          {contactInfo.emails && contactInfo.emails.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">📧 Emails</label>
              <div className="space-y-1">
                {contactInfo.emails.map((email, idx) => (
                  <a
                    key={idx}
                    href={`mailto:${email}`}
                    className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {email}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Phones */}
          {contactInfo.phones && contactInfo.phones.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">☎️ Phone Numbers</label>
              <div className="space-y-1">
                {contactInfo.phones.map((phone, idx) => (
                  <a
                    key={idx}
                    href={`tel:${phone.replace(/\D/g, '')}`}
                    className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {phone}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Addresses */}
          {contactInfo.addresses && contactInfo.addresses.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">📍 Addresses</label>
              <div className="space-y-2">
                {contactInfo.addresses.map((address, idx) => (
                  <p key={idx} className="text-sm text-slate-600">
                    {address}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {contactInfo.social && Object.values(contactInfo.social).some(v => v !== null) && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">📱 Social Media</label>
              <div className="space-y-2">
                {contactInfo.social.instagram && (
                  <a
                    href={contactInfo.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Instagram: {contactInfo.social.instagram}
                  </a>
                )}
                {contactInfo.social.facebook && (
                  <a
                    href={contactInfo.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Facebook: {contactInfo.social.facebook}
                  </a>
                )}
                {contactInfo.social.tiktok && (
                  <a
                    href={contactInfo.social.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    TikTok: {contactInfo.social.tiktok}
                  </a>
                )}
                {contactInfo.social.youtube && (
                  <a
                    href={contactInfo.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    YouTube: {contactInfo.social.youtube}
                  </a>
                )}
                {contactInfo.social.twitter && (
                  <a
                    href={contactInfo.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Twitter/X: {contactInfo.social.twitter}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Booking Links */}
          {contactInfo.bookingLinks && contactInfo.bookingLinks.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">📅 Booking Links</label>
              <div className="space-y-1">
                {contactInfo.bookingLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Contact Page */}
          {contactInfo.contactPage && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">💬 Contact Page</label>
              <a
                href={contactInfo.contactPage}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
              >
                {contactInfo.contactPage}
              </a>
            </div>
          )}

          {/* Maps Link */}
          {contactInfo.mapsLink && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">🧭 Google Maps</label>
              <a
                href={contactInfo.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
              >
                {contactInfo.mapsLink}
              </a>
            </div>
          )}

          {/* Hours */}
          {contactInfo.hours && contactInfo.hours.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">🕒 Hours</label>
              <div className="space-y-1">
                {contactInfo.hours.map((hour, idx) => (
                  <p key={idx} className="text-sm text-slate-600">
                    {hour}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* JSON Preview */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900">
            View Raw JSON
          </summary>
          <pre className="mt-2 p-4 bg-slate-50 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(contactInfo, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default ContactInfoViewer;

