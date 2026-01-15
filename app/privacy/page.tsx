"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-8 pb-12">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ <strong>Work in Progress</strong> - This privacy policy is still
                under development and may change. No guarantee of accuracy or
                completeness.
              </p>
            </div>
            <p className="text-gray-600">
              Last Updated: 2026-01-15
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-gray-700">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Introduction
              </h2>
              <p>
                Safe Space (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, or &quot;Company&quot;) operates the
                coaching platform website. This page informs you of our policies
                regarding the collection, use, and disclosure of personal data
                when you use our service.
              </p>
            </section>

            {/* Data Collection */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Data We Collect
              </h2>
              <p className="mb-4">
                We may collect the following types of information:
              </p>
              <ul className="list-disc list-inside space-y-2">
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
                  <strong>Technical Data:</strong> IP address, browser type,
                  operating system, and usage patterns
                </li>
                <li>
                  <strong>Communication Data:</strong> Messages exchanged between
                  coaches and clients
                </li>
              </ul>
            </section>

            {/* Data Usage */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How We Use Your Data
              </h2>
              <p className="mb-4">We use the collected data for:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Providing and maintaining the service</li>
                <li>Managing user accounts and authentication</li>
                <li>Enabling communication between coaches and clients</li>
                <li>Improving and optimizing our platform</li>
                <li>Detecting and preventing fraudulent activity</li>
                <li>Responding to user inquiries and support requests</li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Data Security
              </h2>
              <p>
                The security of your data is important to us. We implement
                industry-standard security measures including:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>Encryption of data in transit (HTTPS/TLS)</li>
                <li>Hashed and salted password storage</li>
                <li>
                  Row-Level Security (RLS) policies in the database to control
                  data access
                </li>
                <li>Regular security assessments</li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                However, no method of transmission over the Internet is 100%
                secure. We cannot guarantee absolute security of your data.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Data Retention
              </h2>
              <p>
                We retain your personal data as long as your account is active.
                You may request deletion of your account and associated data at
                any time. Some data may be retained for legal compliance
                purposes.
              </p>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Third-Party Services
              </h2>
              <p>
                This platform uses{" "}
                <strong>Supabase</strong> for backend services including
                database hosting and authentication. Please refer to Supabase&apos;s
                privacy policy for their data handling practices.
              </p>
            </section>

            {/* User Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Rights
              </h2>
              <p className="mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Right to access your personal data</li>
                <li>Right to correct inaccurate data</li>
                <li>Right to delete your data (right to be forgotten)</li>
                <li>Right to data portability</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us with your request.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Changes to This Policy
              </h2>
              <p>
                We may update this privacy policy from time to time. We will
                notify you of any changes by updating the &quot;Last Updated&quot; date.
                Your continued use of the service constitutes your acceptance
                of the updated policy.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Us
              </h2>
              <p>
                If you have questions about this privacy policy or our data
                handling practices, please reach out through our GitHub
                repository:
              </p>
              <p className="mt-4">
                <a
                  href="https://github.com/mlunin-git/coaching-platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  github.com/mlunin-git/coaching-platform
                </a>
              </p>
            </section>

            {/* Disclaimer */}
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-8">
              <p className="text-sm text-red-800">
                <strong>Disclaimer:</strong> This privacy policy is provided as-is
                with no guarantee of accuracy, completeness, or legal validity.
                This is an open-source project under development. Users should
                review and customize this policy according to their jurisdiction
                and specific needs. We are not responsible for any legal
                consequences resulting from the use of this policy.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
