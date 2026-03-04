'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const OLIVE = '#8C9A2E'
const WARM = '#C4A84F'
const OLIVE_LIGHT = '#A8B840'

const sections = [
  {
    title: '1. Information We Collect',
    content: [
      {
        sub: '1.1 Information You Provide',
        text: `When you create a Zyra account, we collect your name, email address, and password. If you choose to connect a third-party fitness service (such as Strava, Garmin Connect, Apple Health, Whoop, or Oura), we collect the data that service makes available through its API, including workout history, heart rate variability (HRV), sleep data, activity metrics, and recovery scores.`,
      },
      {
        sub: '1.2 Health and Fitness Data',
        text: `Zyra collects health and fitness data from connected devices and services, including but not limited to: heart rate data, sleep duration and sleep stages, activity and workout records, HRV measurements, recovery scores, GPS and route data, calorie estimates, and body composition data where available. This data is used solely to provide you with insights, analysis, and recommendations within the Zyra platform.`,
      },
      {
        sub: '1.3 Usage Data',
        text: `We automatically collect certain information when you use our service, including IP address, browser type and version, pages visited, time spent on pages, referring URLs, and device identifiers. This data is used to improve the platform and diagnose technical issues.`,
      },
      {
        sub: '1.4 Communications',
        text: `If you contact us via email or through the app, we retain those communications to respond to your inquiries and improve our support.`,
      },
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: [
      {
        sub: '2.1 Providing the Service',
        text: `We use your data to operate Zyra, including syncing your fitness data, generating AI-powered insights and recommendations, displaying your health metrics, and delivering personalized content within the platform.`,
      },
      {
        sub: '2.2 AI and Machine Learning',
        text: `Your health and fitness data is analyzed by our AI systems (powered by Anthropic's Claude API) to generate personalized insights, recommendations, and responses to your questions. This analysis is performed in real time and is not used to train third-party AI models. Your data is sent to Anthropic's API under their data processing agreement and is subject to Anthropic's API data privacy terms, which prohibit training on API inputs.`,
      },
      {
        sub: '2.3 Service Improvement',
        text: `We may use aggregated, de-identified data to improve the accuracy and relevance of our AI models, develop new features, and analyze usage patterns. This data cannot be used to identify you personally.`,
      },
      {
        sub: '2.4 Communications',
        text: `We may send you transactional emails (account creation, password resets, billing receipts) and, with your consent, product updates and newsletters. You may opt out of marketing communications at any time.`,
      },
    ],
  },
  {
    title: '3. Data Sharing and Disclosure',
    content: [
      {
        sub: '3.1 We Do Not Sell Your Data',
        text: `Zyra does not sell, rent, or trade your personal information or health data to third parties for marketing purposes. Period.`,
      },
      {
        sub: '3.2 Service Providers',
        text: `We share data with trusted service providers who help us operate Zyra, including Supabase (database and authentication), Anthropic (AI processing), and infrastructure providers. Each provider is bound by a data processing agreement requiring them to protect your data and use it only for the purposes we specify.`,
      },
      {
        sub: '3.3 Third-Party Integrations',
        text: `When you connect a third-party service (e.g., Strava), you authorize that service to share data with Zyra under the scope you approve during OAuth authorization. You can revoke these connections at any time from your account settings.`,
      },
      {
        sub: '3.4 Legal Requirements',
        text: `We may disclose your information if required by law, court order, or governmental authority, or if we believe disclosure is necessary to protect the rights, property, or safety of Zyra, our users, or the public.`,
      },
      {
        sub: '3.5 Business Transfers',
        text: `In the event of a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction. We will notify you via email and/or a prominent notice on our platform prior to such a transfer.`,
      },
    ],
  },
  {
    title: '4. Data Retention',
    content: [
      {
        sub: '4.1 Active Accounts',
        text: `We retain your personal data and health data for as long as your account is active or as needed to provide you services.`,
      },
      {
        sub: '4.2 Account Deletion',
        text: `If you delete your Zyra account, we will permanently delete your personal data and health data within 30 days, except where we are required to retain certain information for legal, regulatory, or legitimate business purposes (such as billing records, which are retained for 7 years as required by tax law).`,
      },
      {
        sub: '4.3 Backups',
        text: `Deleted data may persist in encrypted backup systems for up to 90 days before being permanently purged from all systems.`,
      },
    ],
  },
  {
    title: '5. Data Security',
    content: [
      {
        sub: '5.1 Encryption',
        text: `All data transmitted between your device and Zyra's servers is encrypted using TLS 1.2 or higher. Health data stored in our database is encrypted at rest using AES-256 encryption.`,
      },
      {
        sub: '5.2 Access Controls',
        text: `Access to your data is restricted to Zyra employees and contractors who need it to operate and improve the service. All team members with data access are required to complete data security training and are bound by confidentiality obligations.`,
      },
      {
        sub: '5.3 Infrastructure',
        text: `Our infrastructure is hosted on industry-standard cloud providers with SOC 2 Type II certification. We employ row-level security policies in our database to ensure users can only access their own data.`,
      },
      {
        sub: '5.4 Breach Notification',
        text: `In the event of a data breach affecting your personal information, we will notify you within 72 hours of becoming aware of the breach, consistent with applicable law.`,
      },
    ],
  },
  {
    title: '6. Your Rights and Choices',
    content: [
      {
        sub: '6.1 Access and Portability',
        text: `You have the right to access the personal data we hold about you and to receive a copy of your data in a machine-readable format. You can request a data export from your account settings or by emailing contact-us@joinzyra.com.`,
      },
      {
        sub: '6.2 Correction',
        text: `You may update or correct your account information at any time through your account settings. If you believe we hold inaccurate data about you, contact us and we will correct it promptly.`,
      },
      {
        sub: '6.3 Deletion',
        text: `You may request deletion of your account and all associated data at any time. Submit a deletion request from your account settings or email contact-us@joinzyra.com. We will process deletion within 30 days.`,
      },
      {
        sub: '6.4 Opt-Out of Communications',
        text: `You may unsubscribe from marketing emails at any time using the unsubscribe link in any marketing email. Transactional emails (e.g., billing receipts) cannot be opted out of while your account is active.`,
      },
      {
        sub: '6.5 Connected Services',
        text: `You can disconnect any third-party integration (Strava, Garmin, etc.) at any time from your account settings. Disconnecting a service removes Zyra's ability to sync new data but does not delete historical data already synced.`,
      },
      {
        sub: '6.6 GDPR / CCPA Rights',
        text: `If you are a resident of the European Economic Area (EEA) or California, you have additional rights under GDPR and CCPA respectively, including the right to object to processing, the right to restrict processing, and the right to lodge a complaint with a supervisory authority. To exercise any of these rights, contact us at contact-us@joinzyra.com.`,
      },
    ],
  },
  {
    title: '7. Cookies and Tracking',
    content: [
      {
        sub: '7.1 Essential Cookies',
        text: `We use cookies and similar technologies strictly necessary to operate the platform, including session cookies for authentication and security cookies to prevent cross-site request forgery.`,
      },
      {
        sub: '7.2 Analytics',
        text: `We may use privacy-respecting analytics tools to understand how users interact with Zyra. These tools collect anonymized usage data and do not track you across other websites.`,
      },
      {
        sub: '7.3 No Advertising Cookies',
        text: `Zyra does not use advertising or tracking cookies, and we do not allow third-party advertising networks to place cookies on our platform.`,
      },
    ],
  },
  {
    title: '8. Children\'s Privacy',
    content: [
      {
        sub: '',
        text: `Zyra is not intended for use by individuals under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that we have collected data from a child under 16, we will take steps to delete that information immediately. If you believe we have collected data from a child, please contact us at contact-us@joinzyra.com.`,
      },
    ],
  },
  {
    title: '9. International Data Transfers',
    content: [
      {
        sub: '',
        text: `Zyra is operated from the United States. If you are accessing Zyra from outside the United States, your data may be transferred to, stored, and processed in the United States or other countries where our service providers operate. By using Zyra, you consent to this transfer. Where required by law (e.g., GDPR), we ensure appropriate safeguards are in place for international transfers, including Standard Contractual Clauses.`,
      },
    ],
  },
  {
    title: '10. Changes to This Policy',
    content: [
      {
        sub: '',
        text: `We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email and by displaying a notice in the Zyra app at least 14 days before the changes take effect. Your continued use of Zyra after the effective date of the revised policy constitutes your acceptance of the changes. We encourage you to review this policy periodically.`,
      },
    ],
  },
  {
    title: '11. Contact Us',
    content: [
      {
        sub: '',
        text: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:`,
      },
    ],
  },
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0906] text-white">
      {/* Subtle grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(140,154,46,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(140,154,46,0.025)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-5 border-b border-white/[0.04]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-black" style={{ background: `linear-gradient(135deg, ${OLIVE}, ${WARM})` }}>Z</div>
          <span className="text-lg font-semibold tracking-tight">Zyra</span>
        </Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">← Back to home</Link>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs mb-6"
              style={{ borderColor: 'rgba(140,154,46,0.3)', background: 'rgba(140,154,46,0.08)', color: OLIVE_LIGHT }}>
              Legal
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-gray-500 text-sm">
              Effective date: <span className="text-gray-400">March 4, 2025</span>
              &nbsp;·&nbsp;
              Last updated: <span className="text-gray-400">March 4, 2025</span>
            </p>
            <p className="text-gray-400 mt-4 leading-relaxed">
              Zyra ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share your information when you use the Zyra platform, mobile app, and related services (collectively, the "Service"). Please read this policy carefully. By using Zyra, you agree to the practices described below.
            </p>
          </div>

          {/* Highlight box */}
          <div className="rounded-xl p-5 border mb-12" style={{ background: 'rgba(140,154,46,0.06)', borderColor: 'rgba(140,154,46,0.2)' }}>
            <p className="text-sm font-semibold mb-2" style={{ color: OLIVE_LIGHT }}>The short version</p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2"><span style={{ color: OLIVE_LIGHT }}>✓</span> We never sell your personal or health data.</li>
              <li className="flex items-start gap-2"><span style={{ color: OLIVE_LIGHT }}>✓</span> Your health data is used only to power your experience in Zyra.</li>
              <li className="flex items-start gap-2"><span style={{ color: OLIVE_LIGHT }}>✓</span> You can delete your account and all data at any time.</li>
              <li className="flex items-start gap-2"><span style={{ color: OLIVE_LIGHT }}>✓</span> We encrypt your data in transit and at rest.</li>
              <li className="flex items-start gap-2"><span style={{ color: OLIVE_LIGHT }}>✓</span> We comply with GDPR and CCPA.</li>
            </ul>
          </div>

          {/* Sections */}
          <div className="space-y-12">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                viewport={{ once: true }}
              >
                <h2 className="text-lg font-semibold mb-4 pb-3 border-b border-white/[0.05]">{section.title}</h2>
                <div className="space-y-5">
                  {section.content.map((item, j) => (
                    <div key={j}>
                      {item.sub && (
                        <p className="text-sm font-medium text-gray-300 mb-1.5">{item.sub}</p>
                      )}
                      <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                  {/* Contact details for section 11 */}
                  {section.title.startsWith('11.') && (
                    <div className="rounded-xl p-4 border border-white/[0.05] mt-3" style={{ background: '#0f0e0b' }}>
                      <p className="text-sm text-gray-300 font-medium">Zyra</p>
                      <a href="mailto:contact-us@joinzyra.com" className="text-sm mt-1 block transition-colors hover:text-white" style={{ color: OLIVE_LIGHT }}>
                        contact-us@joinzyra.com
                      </a>
                      <p className="text-xs text-gray-600 mt-3">We aim to respond to all privacy-related inquiries within 5 business days.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 px-10 flex items-center justify-between text-xs text-gray-600 mt-8">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-black" style={{ background: `linear-gradient(135deg, ${OLIVE}, ${WARM})` }}>Z</div>
          <span>Zyra © 2025</span>
        </div>
        <div className="flex gap-6">
          <Link href="/" className="hover:text-gray-400 transition-colors">Home</Link>
          <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
          <a href="mailto:contact-us@joinzyra.com" className="hover:text-gray-400 transition-colors">Contact</a>
        </div>
      </footer>
    </main>
  )
}
