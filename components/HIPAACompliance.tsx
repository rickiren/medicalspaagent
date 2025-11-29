import React from 'react';
import LegalPage from './LegalPage';

const HIPAACompliance: React.FC = () => {
  return (
    <LegalPage title="HIPAA Compliance" lastUpdated="December 15, 2024">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. Our Commitment to HIPAA Compliance</h2>
          <p className="mb-4">
            Cynthia.ai Systems is committed to maintaining the highest standards of health information privacy and security. We understand the critical importance of protecting Protected Health Information (PHI) and are dedicated to full compliance with the Health Insurance Portability and Accountability Act (HIPAA) and its implementing regulations.
          </p>
          <p>
            When we provide services to healthcare providers, we act as a Business Associate and enter into Business Associate Agreements (BAAs) that establish our responsibilities for protecting PHI.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. What is HIPAA?</h2>
          <p className="mb-4">
            HIPAA is a federal law that establishes national standards to protect sensitive patient health information from being disclosed without the patient's consent or knowledge. The HIPAA Privacy Rule and Security Rule set forth requirements for:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Protecting the privacy of individually identifiable health information</li>
            <li>Setting standards for the security of electronic protected health information</li>
            <li>Outlining breach notification requirements</li>
            <li>Establishing standards for Business Associate relationships</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. Our HIPAA Compliance Measures</h2>
          
          <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1 Administrative Safeguards</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Designated HIPAA Security Officer responsible for compliance oversight</li>
            <li>Comprehensive workforce training on HIPAA requirements and privacy practices</li>
            <li>Access management policies limiting PHI access to authorized personnel only</li>
            <li>Regular risk assessments and security audits</li>
            <li>Incident response procedures for security breaches</li>
            <li>Business Associate Agreements with all third-party vendors handling PHI</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Physical Safeguards</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Secure data centers with controlled access and environmental controls</li>
            <li>Workstation security measures and device encryption</li>
            <li>Media controls for secure storage and disposal of PHI</li>
            <li>Facility access controls and visitor management</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.3 Technical Safeguards</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li><strong className="text-white">Encryption:</strong> End-to-end encryption for data in transit (TLS 1.3) and encryption at rest (AES-256)</li>
            <li><strong className="text-white">Access Controls:</strong> Unique user identification, automatic logoff, and role-based access controls</li>
            <li><strong className="text-white">Audit Controls:</strong> Comprehensive logging and monitoring of all PHI access and modifications</li>
            <li><strong className="text-white">Integrity Controls:</strong> Mechanisms to ensure PHI is not improperly altered or destroyed</li>
            <li><strong className="text-white">Transmission Security:</strong> Secure communication protocols and network security measures</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. Business Associate Agreements (BAAs)</h2>
          <p className="mb-4">
            When we provide services to Covered Entities (healthcare providers), we enter into Business Associate Agreements that:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Define our permitted uses and disclosures of PHI</li>
            <li>Establish our obligation to safeguard PHI</li>
            <li>Require us to report any security incidents or breaches</li>
            <li>Ensure our subcontractors also comply with HIPAA requirements</li>
            <li>Provide for the return or destruction of PHI upon termination</li>
          </ul>
          <p>
            We will only use and disclose PHI as permitted by the BAA and as necessary to provide our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">5. Minimum Necessary Standard</h2>
          <p className="mb-4">
            We follow the HIPAA "minimum necessary" standard, which means we only access, use, or disclose the minimum amount of PHI necessary to accomplish the intended purpose.
          </p>
          <p>
            Our AI systems are designed to process only the information necessary to provide the requested service, and we implement access controls to ensure employees only access PHI needed for their job functions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">6. Breach Notification</h2>
          <p className="mb-4">
            In the event of a security breach involving PHI, we will:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Immediately investigate and contain the breach</li>
            <li>Notify affected Covered Entities without unreasonable delay, and in any case within 60 days</li>
            <li>Provide detailed information about the breach, including the types of information involved</li>
            <li>Assist with breach notification to affected individuals if required</li>
            <li>Report breaches affecting 500+ individuals to the Department of Health and Human Services</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">7. Patient Rights</h2>
          <p className="mb-4">
            We support Covered Entities in fulfilling their obligations regarding patient rights under HIPAA, including:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Right to access PHI</li>
            <li>Right to request amendments to PHI</li>
            <li>Right to request restrictions on uses and disclosures</li>
            <li>Right to request confidential communications</li>
            <li>Right to receive an accounting of disclosures</li>
          </ul>
          <p>
            If you are a patient and wish to exercise these rights, please contact your healthcare provider directly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">8. Training and Awareness</h2>
          <p className="mb-4">
            All Cynthia.ai Systems employees who may come into contact with PHI receive comprehensive HIPAA training, including:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>HIPAA Privacy and Security Rule requirements</li>
            <li>Our policies and procedures for protecting PHI</li>
            <li>How to identify and report security incidents</li>
            <li>Best practices for handling sensitive health information</li>
          </ul>
          <p>
            Training is provided upon hire and updated annually or as regulations change.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">9. Ongoing Compliance Monitoring</h2>
          <p className="mb-4">
            We maintain ongoing compliance through:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Regular security risk assessments and audits</li>
            <li>Continuous monitoring of system access and activity</li>
            <li>Periodic reviews and updates of policies and procedures</li>
            <li>Third-party security assessments and penetration testing</li>
            <li>Staying current with HIPAA regulatory updates</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">10. Third-Party Vendors</h2>
          <p className="mb-4">
            We only work with third-party vendors who have demonstrated HIPAA compliance. All vendors that handle PHI must:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Sign a Business Associate Agreement</li>
            <li>Implement appropriate security safeguards</li>
            <li>Undergo security assessments</li>
            <li>Comply with HIPAA requirements</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">11. Questions and Concerns</h2>
          <p className="mb-4">
            If you have questions about our HIPAA compliance practices or wish to report a potential privacy or security concern, please contact us:
          </p>
          <p>
            <strong className="text-white">Cynthia.ai Systems - HIPAA Compliance Officer</strong><br />
            Email: hipaa@cynthia.ai<br />
            Address: [Your Business Address]
          </p>
          <p className="mt-4">
            You may also file a complaint with the U.S. Department of Health and Human Services Office for Civil Rights if you believe your privacy rights have been violated.
          </p>
        </section>
      </div>
    </LegalPage>
  );
};

export default HIPAACompliance;

