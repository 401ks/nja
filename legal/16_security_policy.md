# Security Policy

**Version:** 1.0
**Effective Date:** [07.25.2026]
**Last Updated:** [07.20.2026]

---

## Document Purpose

This Security Policy describes the security measures, practices, and commitments that NaijaAssets implements to protect the Platform, User data, and systems. It provides transparency regarding our security posture and outlines our approach to safeguarding the Platform.

## Contact Information

**Security Inquiries:** legal@legal.naijaassets.com
**Primary Website:** https://naijaassets.com

---

## Table of Contents

1. Security Philosophy
2. Technical Security Measures
3. Organizational Security Measures
4. Data Protection
5. Access Control
6. Incident Response
7. Vulnerability Management
8. Third-Party Security
9. User Security Responsibilities
10. Security Contact
11. Related Policies
12. Changes to This Policy
13. Contact

---

## 1. Security Philosophy

NaijaAssets operates on a zero-trust architecture. We assume that no part of the system is inherently trustworthy and verify every access request, transaction, and privilege assertion. Security is integrated into every layer of the Platform, from infrastructure to application logic.

## 2. Technical Security Measures

### 2.1 Encryption

- Data in transit is encrypted using industry-standard TLS/SSL protocols
- Data at rest is encrypted using strong encryption algorithms
- Sensitive data, including payment information, is encrypted using additional layers of protection
- Downloaded content is encrypted and may only be played within authorized Platform applications

### 2.2 Authentication

- User authentication is handled through Supabase Auth or equivalent secure authentication services
- Passwords are stored using strong, salted hashing algorithms
- Future support for OAuth, SSO, and enterprise authentication methods
- JWT-based authentication for API access with server-side verification of every privileged action

### 2.3 Authorization

- All access control decisions are made server-side
- The frontend never determines permissions
- Backend verifies every privileged action
- Protected resources are never exposed through URLs or client-side data

### 2.4 Infrastructure Security

- Cloud infrastructure with industry-standard security configurations
- Network segmentation and firewall protection
- Rate limiting to prevent abuse and denial-of-service attacks
- Audit logging of system events and access attempts
- Regular security updates and patch management

## 3. Organizational Security Measures

### 3.1 Policies and Procedures

We maintain internal security policies, standards, and procedures that govern how we develop, deploy, and operate the Platform. These policies evolve as the Platform and threat landscape change.

### 3.2 Training

Our personnel receive security awareness training appropriate to their roles. We emphasize secure coding practices, data protection, and incident reporting.

### 3.3 Access Controls

Access to production systems, sensitive data, and administrative functions is restricted based on the principle of least privilege. Access is regularly reviewed and revoked when no longer needed.

## 4. Data Protection

### 4.1 Data Classification

We classify data based on sensitivity and apply appropriate controls accordingly. Personal Information and sensitive user data receive the highest level of protection.

### 4.2 Data Minimization

We collect and retain only the data reasonably necessary to provide the Platform and Services, as described in our Privacy Policy.

### 4.3 Data Retention

Data is retained only for as long as necessary to fulfill the purposes for which it was collected, subject to legal and regulatory requirements. Retention policies are described in our Privacy Policy.

## 5. Access Control

### 5.1 Account Security

- Accounts are protected by password authentication with appropriate security requirements
- Users are responsible for maintaining the confidentiality of their credentials
- Suspicious activity may trigger additional verification requirements
- Accounts may be suspended to protect the User or the Platform

### 5.2 API Security

- APIs use JWT or equivalent token-based authentication
- Rate limits are applied to prevent abuse
- API access is logged and monitored for anomalous activity

### 5.3 Administrative Access

- Administrative access to the Platform is strictly limited
- All administrative actions are logged and auditable
- Multi-factor authentication may be required for administrative accounts

## 6. Incident Response

### 6.1 Response Plan

We maintain an incident response plan to address security incidents, data breaches, and other security events. The plan includes procedures for detection, containment, eradication, recovery, and notification.

### 6.2 Notification

In the event of a security incident that materially affects User data, we will notify affected Users and relevant regulatory authorities as required by applicable law.

### 6.3 Cooperation

We cooperate with law enforcement and regulatory authorities in the investigation of security incidents, where required or appropriate.

## 7. Vulnerability Management

### 7.1 Monitoring

We continuously monitor the Platform for security vulnerabilities, unusual activity, and potential threats through automated monitoring systems, audit logging, and security assessments.

### 7.2 Assessments

We conduct regular security assessments, including vulnerability scanning and penetration testing, to identify and remediate potential weaknesses.

### 7.3 Responsible Disclosure

We encourage responsible disclosure of security vulnerabilities. If you believe you have discovered a security vulnerability in the Platform, please contact us immediately at legal@legal.naijaassets.com.

## 8. Third-Party Security

### 8.1 Vendor Assessment

We assess the security practices of third-party Service Providers who process data on our behalf, including cloud infrastructure providers, payment processors, AI model providers, and analytics services.

### 8.2 Contractual Protections

Our agreements with Service Providers include appropriate data protection and security obligations, consistent with applicable law and industry standards.

### 8.3 Limitations

Despite our efforts, we cannot guarantee the security practices of third-party providers. Users should review the security policies of third-party services integrated with the Platform.

## 9. User Security Responsibilities

### 9.1 Account Protection

Users play an important role in maintaining the security of their accounts:

- Use strong, unique passwords for your Platform account
- Never share your account credentials with others
- Log out of your account when using shared devices
- Enable additional security features when available
- Notify us immediately of any unauthorized access or account compromise

### 9.2 Device Security

Users should maintain reasonable security measures on their devices, including:

- Keeping operating systems and software up to date
- Using antivirus and anti-malware protection
- Avoiding insecure networks when accessing the Platform
- Not installing unauthorized software that may compromise security

### 9.3 Reporting

Report security concerns, vulnerabilities, or suspicious activity to legal@legal.naijaassets.com.

## 10. Security Contact

For security-related inquiries, vulnerability reports, or incident notifications:

**Email:** legal@legal.naijaassets.com
**Subject:** Security Matter

## 11. Related Policies

This Security Policy should be read in conjunction with:

- **Privacy Policy** — Data protection and privacy practices
- **Terms of Service** — Governing legal relationship
- **Acceptable Use Policy** — Prohibited activities and access violations
- **Data Processing Addendum** — Data processing terms (where applicable)

## 12. Changes to This Policy

Security is an evolving discipline. We may update this Security Policy as our security practices, technology, and legal obligations evolve. Changes will be posted on the Platform.

## 13. Contact

**Email:** legal@legal.naijaassets.com
**Website:** https://naijaassets.com

---

*This Security Policy was last updated on 07.20.2026.*
