import React, { useState, useEffect } from 'react';
import { BusinessConfig, Service, Location, FAQ, PreviewLandingPageData } from '../types';
import PreviewDataViewer from './PreviewDataViewer';
import ContactInfoViewer from './ContactInfoViewer';
import { ContactInfo } from '../utils/contactExtractor';

interface BusinessEditorProps {
  businessId: string | null;
  mode: 'create' | 'edit';
  onSave: () => void;
  onCancel: () => void;
  initialConfig?: BusinessConfig;
  initialDomain?: string;
}

const BusinessEditor: React.FC<BusinessEditorProps> = ({ 
  businessId, 
  mode, 
  onSave, 
  onCancel,
  initialConfig,
  initialDomain 
}) => {
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<BusinessConfig>({
    id: '',
    name: '',
    tagline: '',
    services: [{ name: '', description: '', price: 0, timeMinutes: 30 }],
    locations: [{ name: '', address: '', phone: '' }],
    hours: { 'mon-sun': '9am–6pm' },
    faqs: [],
    booking: { type: 'mock', requiresPayment: false },
    aiPersonality: { tone: 'friendly', identity: 'AI Receptionist' },
  });

  const [domain, setDomain] = useState('');
  const [jsonPreview, setJsonPreview] = useState('');
  const [previewData, setPreviewData] = useState<PreviewLandingPageData | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  useEffect(() => {
    if (mode === 'edit' && businessId) {
      loadBusiness();
    } else if (mode === 'create') {
      if (initialConfig) {
        setFormData(initialConfig);
        setDomain(initialDomain || '');
        setLoading(false);
      } else {
        setFormData({
          id: '',
          name: '',
          tagline: '',
          services: [{ name: '', description: '', price: 0, timeMinutes: 30 }],
          locations: [{ name: '', address: '', phone: '' }],
          hours: { 'mon-sun': '9am–6pm' },
          faqs: [],
          booking: { type: 'mock', requiresPayment: false },
          aiPersonality: { tone: 'friendly', identity: 'AI Receptionist' },
        });
        setDomain('');
        setLoading(false);
      }
    }
  }, [businessId, mode, initialConfig, initialDomain]);

  useEffect(() => {
    updateJsonPreview();
  }, [formData, domain]);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/businesses/${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to load business');
      }
      const data = await response.json();
      setFormData(data.config_json);
      setDomain(data.domain || '');
      setPreviewData(data.preview_data_json || null);
      setContactInfo(data.contact_info_json || null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading business:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateJsonPreview = () => {
    try {
      setJsonPreview(JSON.stringify(formData, null, 2));
    } catch (e) {
      setJsonPreview('Invalid JSON');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        id: formData.id,
        name: formData.name,
        domain: domain,
        config_json: formData,
      };

      const url = mode === 'create' ? '/api/businesses' : `/api/businesses/${businessId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save business');
      }

      onSave();
    } catch (err: any) {
      setError(err.message);
      console.error('Error saving business:', err);
    } finally {
      setSaving(false);
    }
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { name: '', description: '', price: 0, timeMinutes: 30 }],
    });
  };

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index),
    });
  };

  const updateService = (index: number, field: keyof Service, value: any) => {
    const services = [...formData.services];
    services[index] = { ...services[index], [field]: value };
    setFormData({ ...formData, services });
  };

  const addLocation = () => {
    setFormData({
      ...formData,
      locations: [...formData.locations, { name: '', address: '', phone: '' }],
    });
  };

  const removeLocation = (index: number) => {
    setFormData({
      ...formData,
      locations: formData.locations.filter((_, i) => i !== index),
    });
  };

  const updateLocation = (index: number, field: keyof Location, value: string) => {
    const locations = [...formData.locations];
    locations[index] = { ...locations[index], [field]: value };
    setFormData({ ...formData, locations });
  };

  const addFAQ = () => {
    setFormData({
      ...formData,
      faqs: [...(formData.faqs || []), { q: '', a: '' }],
    });
  };

  const removeFAQ = (index: number) => {
    setFormData({
      ...formData,
      faqs: formData.faqs?.filter((_, i) => i !== index) || [],
    });
  };

  const updateFAQ = (index: number, field: 'q' | 'a', value: string) => {
    const faqs = [...(formData.faqs || [])];
    faqs[index] = { ...faqs[index], [field]: value };
    setFormData({ ...formData, faqs });
  };

  const updateHours = (key: string, value: string) => {
    setFormData({
      ...formData,
      hours: { ...formData.hours, [key]: value },
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {mode === 'create' ? 'Create New AI Receptionist' : 'Edit Business Config'}
        </h2>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-8">
        {/* Basic Info */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business ID</label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="e.g., beverly-skin-clinic"
                disabled={mode === 'edit'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="e.g., Beverly Hills Laser Clinic"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="e.g., beverlyhillslaser.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="e.g., Elite Aesthetic Treatments"
              />
            </div>
          </div>
        </section>

        {/* Services */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Services</h3>
            <button
              onClick={addService}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm"
            >
              + Add Service
            </button>
          </div>
          <div className="space-y-4">
            {formData.services.map((service, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700">Service {index + 1}</span>
                  {formData.services.length > 1 && (
                    <button
                      onClick={() => removeService(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Name</label>
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) => updateService(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="e.g., Botox"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Price</label>
                    <input
                      type="number"
                      value={service.price}
                      onChange={(e) => updateService(index, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="250"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-600 mb-1">Description</label>
                    <input
                      type="text"
                      value={service.description}
                      onChange={(e) => updateService(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="Service description"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={service.timeMinutes}
                      onChange={(e) => updateService(index, 'timeMinutes', parseInt(e.target.value) || 30)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="30"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Locations */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Locations</h3>
            <button
              onClick={addLocation}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm"
            >
              + Add Location
            </button>
          </div>
          <div className="space-y-4">
            {formData.locations.map((location, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700">Location {index + 1}</span>
                  {formData.locations.length > 1 && (
                    <button
                      onClick={() => removeLocation(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Name</label>
                    <input
                      type="text"
                      value={location.name}
                      onChange={(e) => updateLocation(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="Main Office"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Address</label>
                    <input
                      type="text"
                      value={location.address}
                      onChange={(e) => updateLocation(index, 'address', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Phone</label>
                    <input
                      type="text"
                      value={location.phone}
                      onChange={(e) => updateLocation(index, 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="555-1234"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hours */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Hours</h3>
          <div className="space-y-2">
            {Object.entries(formData.hours).map(([key, value]) => (
              <div key={key} className="flex items-center gap-4">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => {
                    const newHours = { ...formData.hours };
                    delete newHours[key];
                    newHours[e.target.value] = value;
                    setFormData({ ...formData, hours: newHours });
                  }}
                  className="w-32 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="mon-fri"
                />
                <span className="text-slate-600">:</span>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateHours(key, e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="9am–6pm"
                />
                <button
                  onClick={() => {
                    const newHours = { ...formData.hours };
                    delete newHours[key];
                    setFormData({ ...formData, hours: newHours });
                  }}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newKey = prompt('Enter day range (e.g., mon-fri):');
                if (newKey) {
                  updateHours(newKey, '9am–6pm');
                }
              }}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm"
            >
              + Add Hours
            </button>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">FAQs</h3>
            <button
              onClick={addFAQ}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm"
            >
              + Add FAQ
            </button>
          </div>
          <div className="space-y-4">
            {(formData.faqs || []).map((faq, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700">FAQ {index + 1}</span>
                  <button
                    onClick={() => removeFAQ(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Question</label>
                    <input
                      type="text"
                      value={faq.q}
                      onChange={(e) => updateFAQ(index, 'q', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="Is laser painful?"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Answer</label>
                    <textarea
                      value={faq.a}
                      onChange={(e) => updateFAQ(index, 'a', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      rows={2}
                      placeholder="Most clients describe it as mildly warm."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Booking */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Booking Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Booking Type</label>
              <select
                value={formData.booking.type}
                onChange={(e) => setFormData({
                  ...formData,
                  booking: { ...formData.booking, type: e.target.value as 'mock' | 'calendly' | 'custom' },
                })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
              >
                <option value="mock">Mock (Test Mode)</option>
                <option value="calendly">Calendly</option>
                <option value="custom">Custom API</option>
              </select>
            </div>
            {formData.booking.type === 'calendly' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Calendar URL</label>
                <input
                  type="text"
                  value={formData.booking.calendarUrl || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    booking: { ...formData.booking, calendarUrl: e.target.value },
                  })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="https://calendly.com/example"
                />
              </div>
            )}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.booking.requiresPayment}
                onChange={(e) => setFormData({
                  ...formData,
                  booking: { ...formData.booking, requiresPayment: e.target.checked },
                })}
                className="mr-2"
              />
              <label className="text-sm text-slate-700">Requires Payment</label>
            </div>
          </div>
        </section>

        {/* AI Personality */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">AI Personality</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Identity</label>
              <input
                type="text"
                value={formData.aiPersonality.identity}
                onChange={(e) => setFormData({
                  ...formData,
                  aiPersonality: { ...formData.aiPersonality, identity: e.target.value },
                })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="AI Receptionist"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tone</label>
              <input
                type="text"
                value={formData.aiPersonality.tone}
                onChange={(e) => setFormData({
                  ...formData,
                  aiPersonality: { ...formData.aiPersonality, tone: e.target.value },
                })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="friendly, warm, informative"
              />
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
          <ContactInfoViewer contactInfo={contactInfo} />
        </section>

        {/* Preview Landing Page Data */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Preview Landing Page Data</h3>
          <PreviewDataViewer previewData={previewData} businessName={formData.name} />
        </section>

        {/* JSON Preview */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Business Config JSON</h3>
          <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs overflow-auto max-h-64">
            {jsonPreview}
          </pre>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.id || !formData.name}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Business'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessEditor;

