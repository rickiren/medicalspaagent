import React from 'react';
import LegalPage from './LegalPage';

const PrivacyPolicy: React.FC = () => {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="December 15, 2024">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
          <p className="mb-4">
            Cynthia.ai Systems ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI receptionist service for medical spas and aesthetic practices.
          </p>
          <p>
            Please read this Privacy Policy carefully. By using our Service, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1 Information You Provide</h3>
          <p className="mb-4">We collect information that you provide directly to us, including:</p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Account registration information (name, email address, phone number)</li>
            <li>Business information (practice name, address, services offered, pricing)</li>
            <li>Booking and appointment information</li>
            <li>Customer inquiries and communications</li>
            <li>Payment and billing information</li>
            <li>Visual images (when using our visual analysis features)</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Automatically Collected Information</h3>
          <p className="mb-4">When you use our Service, we automatically collect certain information, including:</p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Device information (IP address, browser type, operating system)</li>
            <li>Usage data (pages visited, features used, time spent)</li>
            <li>Audio recordings of voice interactions (for service improvement)</li>
            <li>Log files and analytics data</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.3 Health Information</h3>
          <p className="mb-4">
            In the course of providing our Service, we may process health-related information, including:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Treatment inquiries and preferences</li>
            <li>Visual analysis data (skin conditions, body concerns)</li>
            <li>Medical history information shared during consultations</li>
            <li>Appointment and treatment history</li>
          </ul>
          <p className="mt-4">
            This information is protected under applicable health privacy laws, including HIPAA where applicable.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Provide, maintain, and improve our Service</li>
            <li>Process appointments and bookings</li>
            <li>Respond to customer inquiries and provide customer support</li>
            <li>Send administrative information, updates, and marketing communications</li>
            <li>Personalize your experience and provide relevant treatment recommendations</li>
            <li>Analyze usage patterns and improve our AI models</li>
            <li>Detect, prevent, and address technical issues and security threats</li>
            <li>Comply with legal obligations and enforce our terms</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. Information Sharing and Disclosure</h2>
          <p className="mb-4">We do not sell your personal information. We may share your information in the following circumstances:</p>
          
          <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.1 Service Providers</h3>
          <p className="mb-4">
            We may share information with third-party service providers who perform services on our behalf, such as:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Cloud hosting and storage providers</li>
            <li>Payment processors</li>
            <li>Booking system integrations (Calendly, Acuity, etc.)</li>
            <li>AI and machine learning service providers</li>
            <li>Analytics and monitoring services</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Business Transfers</h3>
          <p className="mb-4">
            If we are involved in a merger, acquisition, or asset sale, your information may be transferred as part of that transaction.
          </p>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.3 Legal Requirements</h3>
          <p>
            We may disclose your information if required to do so by law or in response to valid requests by public authorities.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">5. HIPAA Compliance</h2>
          <p className="mb-4">
            When we act as a Business Associate under HIPAA, we enter into Business Associate Agreements (BAAs) with our healthcare provider clients. We implement appropriate safeguards to protect Protected Health Information (PHI) in accordance with HIPAA requirements.
          </p>
          <p>
            Our security measures include encryption, access controls, audit logs, and regular security assessments to ensure compliance with HIPAA standards.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">6. Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>End-to-end encryption for data in transit</li>
            <li>Encryption at rest for stored data</li>
            <li>Regular security audits and penetration testing</li>
            <li>Access controls and authentication mechanisms</li>
            <li>Secure data centers with physical security measures</li>
            <li>Regular backups and disaster recovery procedures</li>
          </ul>
          <p>
            However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
          <p className="mb-4">
            We retain your information for as long as necessary to provide our Service and fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
          </p>
          <p>
            When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal, regulatory, or business purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">8. Your Rights and Choices</h2>
          <p className="mb-4">Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li><strong className="text-white">Access:</strong> Request access to your personal information</li>
            <li><strong className="text-white">Correction:</strong> Request correction of inaccurate information</li>
            <li><strong className="text-white">Deletion:</strong> Request deletion of your personal information</li>
            <li><strong className="text-white">Portability:</strong> Request a copy of your data in a portable format</li>
            <li><strong className="text-white">Opt-out:</strong> Opt-out of marketing communications</li>
            <li><strong className="text-white">Restriction:</strong> Request restriction of processing</li>
          </ul>
          <p>
            To exercise these rights, please contact us at privacy@cynthia.ai. We will respond to your request within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">9. Children's Privacy</h2>
          <p>
            Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">10. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. We take appropriate measures to ensure your information receives adequate protection.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="mt-4">
            <strong className="text-white">Cynthia.ai Systems</strong><br />
            Email: privacy@cynthia.ai<br />
            Address: [Your Business Address]
          </p>
        </section>
      </div>
    </LegalPage>
  );
};

export default PrivacyPolicy;

