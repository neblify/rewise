import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <p className="text-base font-semibold leading-7 text-indigo-600">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-6 text-xl leading-8 text-gray-700">
            <strong>Effective Date:</strong> January 28, 2026
          </p>
          <p className="mt-2 text-sm text-gray-500">
            <strong>Website:</strong> https://nios-prep.vercel.app/ ("we", "us",
            "our", "NIOS Prep")
          </p>
        </div>

        <div className="prose prose-indigo max-w-none space-y-8">
          <p>
            We are committed to protecting your privacy. This Privacy Policy
            explains what information we collect, how we use it, with whom we
            may share it, and what choices you have regarding your personal
            information.
          </p>
          <p>
            This policy applies to all visitors, users, and others who access or
            use the NIOS Prep website and any related services (collectively,
            the "Service").
          </p>
          <p>
            By using the Service, you agree to the collection and use of
            information in accordance with this policy. If you do not agree,
            please do not use the Service.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            1. Information We Collect
          </h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">
            A. Information You Provide Voluntarily
          </h3>
          <p>We may collect information you give us directly, such as:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              Name, email address, or phone number (if you contact us, submit a
              form, or sign up for updates/newsletter)
            </li>
            <li>Messages, feedback, or questions you send us</li>
            <li>Any other information you choose to provide</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">
            B. Automatically Collected Information
          </h3>
          <p>
            When you visit or interact with the Service, we and our service
            providers may automatically collect:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              Device information (browser type/version, operating system, device
              type, screen resolution)
            </li>
            <li>
              Network information (IP address, approximate geographic location
              derived from IP)
            </li>
            <li>
              Usage data (pages visited, time spent, links clicked,
              referring/exit pages)
            </li>
            <li>
              Cookies and similar technologies (see Cookies section below)
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6">
            C. Third-Party Analytics & Services
          </h3>
          <p>
            We use third-party tools to understand how people use the Service.
            These may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Vercel (hosting & basic analytics)</li>
            <li>Google Analytics / Google Tag Manager (usage statistics)</li>
            <li>
              Other minimal analytics or error-tracking tools (e.g. Sentry,
              Vercel Speed Insights)
            </li>
          </ul>
          <p className="mt-4">
            These services may collect anonymized or pseudonymized data about
            your interaction with the site.
          </p>
          <p>
            We do <strong>not</strong> knowingly collect special categories of
            personal data (health, religion, etc.) or data from children under
            13 (or the relevant age in your country). If we become aware we have
            collected such data, we will delete it.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            2. How We Use Your Information
          </h2>
          <p>We use the collected information to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Operate, maintain, and improve the Service</li>
            <li>Understand usage patterns and enhance user experience</li>
            <li>Respond to your comments, questions, or support requests</li>
            <li>
              Send occasional service-related communications (very low
              frequency)
            </li>
            <li>Detect, prevent, and address technical issues or abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p className="mt-4">
            We do <strong>not</strong> use your information for targeted
            advertising, profiling for commercial purposes, or selling personal
            data.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            3. Cookies and Tracking Technologies
          </h2>
          <p>We use minimal cookies and similar technologies:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              <strong>Necessary cookies</strong> — required for basic site
              functionality
            </li>
            <li>
              <strong>Analytics cookies</strong> — help us understand site usage
              (usually anonymized)
            </li>
          </ul>
          <p className="mt-4">
            You can control cookies through your browser settings. Most browsers
            allow you to refuse cookies or alert you when one is placed. Note
            that disabling cookies may limit some features.
          </p>
          <p>
            For more details → see our Cookie Policy (if you create a separate
            short section).
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            4. Sharing of Information
          </h2>
          <p>
            We do <strong>not</strong> sell your personal information.
          </p>
          <p>We may share information only in these limited cases:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              With service providers (Vercel, analytics providers) who process
              data on our behalf under strict confidentiality
            </li>
            <li>
              To comply with laws, respond to lawful requests, protect
              rights/safety, or enforce our terms
            </li>
            <li>
              In connection with a merger, acquisition, or sale of assets (with
              notice where required)
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            5. Data Storage & Security
          </h2>
          <p>
            Your data is primarily stored on Vercel infrastructure (servers
            located mainly in India).
          </p>
          <p>
            We implement reasonable technical and organizational measures to
            protect your information. However, no method of transmission or
            storage is 100% secure. We cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            6. Data Retention
          </h2>
          <p>
            We keep personal information only as long as necessary for the
            purposes described in this policy or as required by law.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Contact/support messages → typically kept 12–24 months</li>
            <li>
              Analytics data → usually kept 14–26 months (depending on provider
              settings)
            </li>
            <li>
              Automatically deleted when no longer needed or upon request (where
              applicable)
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            7. Your Rights
          </h2>
          <p>
            Depending on your location (e.g. GDPR, CCPA/CPRA, India DPDP Act),
            you may have rights to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your data ("right to be forgotten")</li>
            <li>Restrict or object to processing</li>
            <li>Data portability (where technically feasible)</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, contact us at the email below. We will
            respond within the time required by applicable law.
          </p>
          <p>
            We do not respond to "Do Not Track" browser signals as we do not
            engage in cross-site tracking for advertising.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            8. International Transfers
          </h2>
          <p>
            The Service is hosted in [multiple countries / primarily US or
            EU-based Vercel regions]. If you access the Service from outside the
            hosting region, your information may be transferred to and processed
            in other countries. We ensure appropriate safeguards are in place
            for such transfers where required.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            9. Children's Privacy
          </h2>
          <p>
            Our Service is not directed to children under 13 (or the minimum age
            required in your country). We do not knowingly collect personal
            information from children. If you believe we have collected such
            data, please contact us immediately.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            10. Changes to This Privacy Policy
          </h2>
          <p>
            We may update this policy from time to time. The updated version
            will be posted here with a revised "Effective Date". We encourage
            you to review it periodically.
          </p>
          <p>
            Significant changes will be communicated via a notice on the website
            (if feasible).
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            11. Contact Us
          </h2>
          <p>
            If you have questions about this Privacy Policy or our data
            practices, please contact:
            <strong> support@neblify.com </strong>
            Or reach out via any contact form available on the site.
          </p>

          <hr className="my-10 border-gray-200" />
          <p className="text-sm text-gray-500">
            Thank you for using NIOS Prep. We value your trust.
          </p>
        </div>
      </div>
    </div>
  );
}
