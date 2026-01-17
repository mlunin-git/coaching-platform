"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8 pb-12">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="space-y-4 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-gray-900">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              How we protect your data and respect your privacy
            </p>
          </div>

          {/* Warning Banner */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">⚠️ Work in Progress</span> - This privacy policy is still under development and may change. No guarantee of accuracy or completeness.
            </p>
          </div>

          {/* Last Updated */}
          <p className="text-sm text-gray-500">
            Last Updated: 2026-01-17
          </p>
        </div>

        {/* Content Grid */}
        <div className="space-y-6">
            {/* Introduction */}
            <section className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Safe Space (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, or &quot;Company&quot;) operates the
                coaching platform website. This page informs you of our policies
                regarding the collection, use, and disclosure of personal data
                when you use our service.
              </p>
            </section>

            {/* Data Collection */}
            <section className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Data We Collect
              </h2>
              <p className="mb-4 text-gray-700">
                We may collect the following types of information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <strong>Account Information:</strong> Name, email address, and
                  password (hashed and encrypted)
                </li>
                <li>
                  <strong>Profile Data:</strong> User role (coach or client),
                  preferred language, and profile settings
                </li>
                <li>
                  <strong>Usage Data:</strong> Planning groups, ideas, events,
                  tasks, and other content you create
                </li>
                <li>
                  <strong>Analytics Data:</strong> Page views, session duration,
                  and navigation patterns (see Analytics Tracking section for details)
                </li>
                <li>
                  <strong>Technical Data:</strong> Browser type, operating system,
                  and user agent (no IP addresses collected)
                </li>
                <li>
                  <strong>Communication Data:</strong> Messages exchanged between
                  coaches and clients
                </li>
              </ul>
            </section>

            {/* Data Usage */}
            <section className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How We Use Your Data
              </h2>
              <p className="mb-4 text-gray-700">We use the collected data for:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Providing and maintaining the service</li>
                <li>Managing user accounts and authentication</li>
                <li>Enabling communication between coaches and clients</li>
                <li>Improving and optimizing our platform</li>
                <li>Detecting and preventing fraudulent activity</li>
                <li>Responding to user inquiries and support requests</li>
              </ul>
            </section>

            {/* Analytics Tracking */}
            <section className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Analytics Tracking
              </h2>
              <p className="mb-4 text-gray-700">
                We track user interactions to understand how our platform is used
                and to improve the user experience. This includes:
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What We Track:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Page views and navigation patterns</li>
                    <li>Time spent on each page (session duration)</li>
                    <li>Browser type and operating system (user agent)</li>
                    <li>Unique session identifier (generated per browser tab)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What We Don&apos;t Track:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>IP addresses</li>
                    <li>Precise geolocation data</li>
                    <li>Personal identification details of anonymous users</li>
                    <li>Mouse movements or keystroke data</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Session Management:</h3>
                  <p className="text-gray-700 text-sm">
                    Session tracking uses your browser&apos;s sessionStorage, which is
                    cleared when you close the browser tab or window. Each new tab
                    generates a unique session identifier. Authenticated users are
                    linked to their accounts; anonymous users are tracked with a null
                    user identifier.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Data Retention:</h3>
                  <p className="text-gray-700 text-sm">
                    Analytics events are retained in our database indefinitely. Session
                    data stored in your browser (sessionStorage) expires automatically
                    when you close the tab. You can delete your analytics history by
                    requesting account deletion.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Data Security
              </h2>
              <p className="text-gray-700 mb-4">
                The security of your data is important to us. We implement
                industry-standard security measures including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Encryption of data in transit (HTTPS/TLS)</li>
                <li>Hashed and salted password storage</li>
                <li>
                  Row-Level Security (RLS) policies in the database to control
                  data access
                </li>
                <li>Regular security assessments</li>
              </ul>
              <p className="text-sm text-gray-600 bg-gray-50 rounded p-4 border-l-2 border-gray-300">
                However, no method of transmission over the Internet is 100%
                secure. We cannot guarantee absolute security of your data.
              </p>
            </section>

            {/* Data Retention */}
            <section className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Data Retention
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal data as long as your account is active.
                You may request deletion of your account and associated data at
                any time. Some data may be retained for legal compliance
                purposes.
              </p>
            </section>

            {/* Third-Party Services */}
            <section className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Third-Party Services
              </h2>
              <p className="text-gray-700 leading-relaxed">
                This platform uses{" "}
                <strong>Supabase</strong> for backend services including
                database hosting and authentication. Please refer to Supabase&apos;s
                privacy policy for their data handling practices.
              </p>
            </section>

            {/* User Rights */}
            <section className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-cyan-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Rights
              </h2>
              <p className="mb-4 text-gray-700">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>Right to access your personal data</li>
                <li>Right to correct inaccurate data</li>
                <li>Right to delete your data (right to be forgotten)</li>
                <li>Right to data portability</li>
              </ul>
              <p className="text-gray-700">
                To exercise these rights, please contact us with your request.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Changes to This Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this privacy policy from time to time. We will
                notify you of any changes by updating the &quot;Last Updated&quot; date.
                Your continued use of the service constitutes your acceptance
                of the updated policy.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-sky-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Us
              </h2>
              <p className="text-gray-700 mb-4">
                If you have questions about this privacy policy or our data
                handling practices, please reach out through our GitHub
                repository:
              </p>
              <a
                href="https://github.com/mlunin-git/coaching-platform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 font-medium text-sm"
              >
                github.com/mlunin-git/coaching-platform
              </a>
            </section>

            {/* Disclaimer */}
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-xl shadow-md">
              <p className="text-sm text-red-800 leading-relaxed">
                <span className="font-semibold">⚠️ Disclaimer:</span> This privacy policy is provided as-is
                with no guarantee of accuracy, completeness, or legal validity.
                This is an open-source project under development. Users should
                review and customize this policy according to their jurisdiction
                and specific needs. We are not responsible for any legal
                consequences resulting from the use of this policy.
              </p>
            </div>
          </div>
      </main>
    </div>
  );
}
