import React from 'react';
import LegalPage from './LegalPage';

const Security: React.FC = () => {
  return (
    <LegalPage title="Security" lastUpdated="December 15, 2024">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. Our Security Commitment</h2>
          <p className="mb-4">
            At Cynthia.ai Systems, security is fundamental to everything we do. We understand that medical spas and aesthetic practices handle sensitive patient information, and we are committed to providing enterprise-grade security to protect your data and your patients' information.
          </p>
          <p>
            We implement multiple layers of security controls, follow industry best practices, and undergo regular security assessments to ensure the highest level of protection.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. Data Encryption</h2>
          
          <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1 Encryption in Transit</h3>
          <p className="mb-4">
            All data transmitted between your devices and our servers is encrypted using industry-standard TLS 1.3 encryption. This ensures that:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>All API communications are secured</li>
            <li>Voice and video streams are encrypted end-to-end</li>
            <li>Web traffic uses HTTPS with strong cipher suites</li>
            <li>Certificate pinning prevents man-in-the-middle attacks</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Encryption at Rest</h3>
          <p className="mb-4">
            All stored data, including customer information, appointment records, and health data, is encrypted at rest using AES-256 encryption. This includes:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Database records</li>
            <li>File storage and backups</li>
            <li>Audio and video recordings</li>
            <li>Configuration and business data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. Access Controls and Authentication</h2>
          
          <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1 Multi-Factor Authentication (MFA)</h3>
          <p className="mb-4">
            We require multi-factor authentication for all administrative accounts to prevent unauthorized access. This includes:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Password requirements (minimum complexity, regular rotation)</li>
            <li>Two-factor authentication (2FA) via authenticator apps or SMS</li>
            <li>Biometric authentication where supported</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Role-Based Access Control (RBAC)</h3>
          <p className="mb-4">
            We implement role-based access control to ensure that users only have access to the data and features necessary for their role:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Principle of least privilege</li>
            <li>Regular access reviews and audits</li>
            <li>Automatic access revocation upon role changes</li>
            <li>Separation of duties for sensitive operations</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.3 Session Management</h3>
          <p>
            We implement secure session management with automatic timeout, secure session tokens, and protection against session hijacking and fixation attacks.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. Infrastructure Security</h2>
          
          <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.1 Cloud Security</h3>
          <p className="mb-4">
            Our infrastructure is hosted on leading cloud platforms with robust security controls:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>ISO 27001, SOC 2 Type II, and HIPAA-compliant data centers</li>
            <li>Redundant systems and automatic failover</li>
            <li>DDoS protection and mitigation</li>
            <li>Network segmentation and firewalls</li>
            <li>Intrusion detection and prevention systems</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Application Security</h3>
          <p className="mb-4">We follow secure development practices:</p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Regular security code reviews</li>
            <li>Automated vulnerability scanning</li>
            <li>Dependency scanning for known vulnerabilities</li>
            <li>Secure coding standards and training</li>
            <li>Penetration testing by third-party security firms</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">5. Monitoring and Incident Response</h2>
          
          <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.1 Continuous Monitoring</h3>
          <p className="mb-4">We maintain 24/7 security monitoring including:</p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Real-time threat detection and alerting</li>
            <li>Security Information and Event Management (SIEM)</li>
            <li>Anomaly detection and behavioral analysis</li>
            <li>Log aggregation and analysis</li>
            <li>Network traffic monitoring</li>
          </ul>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.2 Incident Response</h3>
          <p className="mb-4">We have a comprehensive incident response plan that includes:</p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Dedicated security incident response team</li>
            <li>Rapid detection and containment procedures</li>
            <li>Forensic investigation capabilities</li>
            <li>Customer notification procedures</li>
            <li>Post-incident review and improvement</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">6. Data Backup and Recovery</h2>
          <p className="mb-4">
            We maintain comprehensive backup and disaster recovery procedures:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Automated daily backups with point-in-time recovery</li>
            <li>Geographically distributed backup storage</li>
            <li>Regular backup restoration testing</li>
            <li>Disaster recovery plans with defined RTO and RPO</li>
            <li>Business continuity planning</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">7. Compliance and Certifications</h2>
          <p className="mb-4">
            We maintain compliance with industry standards and regulations:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li><strong className="text-white">HIPAA:</strong> Business Associate Agreements and HIPAA-compliant infrastructure</li>
            <li><strong className="text-white">SOC 2 Type II:</strong> Annual audits of security, availability, and confidentiality controls</li>
            <li><strong className="text-white">GDPR:</strong> Compliance with European data protection regulations</li>
            <li><strong className="text-white">CCPA:</strong> Compliance with California privacy regulations</li>
            <li><strong className="text-white">ISO 27001:</strong> Information security management system certification (in progress)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">8. Vulnerability Management</h2>
          <p className="mb-4">
            We maintain a proactive vulnerability management program:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Regular vulnerability assessments and penetration testing</li>
            <li>Automated vulnerability scanning</li>
            <li>Patch management and timely security updates</li>
            <li>Bug bounty program for responsible disclosure</li>
            <li>Third-party security audits</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">9. Employee Security</h2>
          <p className="mb-4">
            We ensure our team maintains high security standards:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Background checks for all employees</li>
            <li>Security awareness training and regular updates</li>
            <li>Confidentiality agreements and security policies</li>
            <li>Regular security training on phishing, social engineering, and best practices</li>
            <li>Clear security incident reporting procedures</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">10. Third-Party Security</h2>
          <p className="mb-4">
            We carefully vet all third-party vendors and service providers:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Security assessments before onboarding</li>
            <li>Contractual security requirements</li>
            <li>Regular security reviews and audits</li>
            <li>Business Associate Agreements for healthcare data</li>
            <li>Vendor risk management program</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">11. Security Best Practices for Users</h2>
          <p className="mb-4">
            We recommend the following security best practices:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Use strong, unique passwords for your account</li>
            <li>Enable multi-factor authentication</li>
            <li>Keep your devices and browsers updated</li>
            <li>Be cautious of phishing attempts</li>
            <li>Log out when using shared devices</li>
            <li>Report any suspicious activity immediately</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">12. Security Updates and Notifications</h2>
          <p className="mb-4">
            We are committed to transparency about security:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li>Regular security updates and patches</li>
            <li>Security advisories for significant issues</li>
            <li>Timely notification of security incidents affecting customers</li>
            <li>Security blog and updates on our practices</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">13. Reporting Security Issues</h2>
          <p className="mb-4">
            If you discover a security vulnerability, please report it responsibly:
          </p>
          <p className="mb-4">
            <strong className="text-white">Email:</strong> security@cynthia.ai<br />
            <strong className="text-white">PGP Key:</strong> [Available upon request]
          </p>
          <p>
            We appreciate responsible disclosure and will work with security researchers to address vulnerabilities promptly. We do not pursue legal action against security researchers who act in good faith and follow responsible disclosure practices.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">14. Contact Us</h2>
          <p>
            For security-related questions or concerns, please contact our security team:
          </p>
          <p className="mt-4">
            <strong className="text-white">Cynthia.ai Systems - Security Team</strong><br />
            Email: security@cynthia.ai<br />
            Address: [Your Business Address]
          </p>
        </section>
      </div>
    </LegalPage>
  );
};

export default Security;

