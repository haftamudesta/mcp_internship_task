import React from "react";
import {
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Database,
  Trash2,
  Lock,
} from "lucide-react";

const PrivacyPolicy: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-gray-600">Last Updated: {currentYear}</p>
        <p className="text-gray-500 mt-2">
          Your privacy matters. Learn how we protect your information
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3">
          <div>
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              Our Commitment to Privacy
            </h2>
            <p className="text-green-700">
              At DropZone, we take your privacy seriously. This policy explains
              what information we collect, how we use it, and your rights
              regarding your personal data.
            </p>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            1. Information We Collect
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            <strong className="text-gray-900">1.1 Personal Information:</strong>{" "}
            When you create an account, we collect your name, email address, and
            encrypted password.
          </p>
          <p>
            <strong className="text-gray-900">1.2 Transaction Data:</strong> We
            collect information about your reservations, purchases, and order
            history.
          </p>
          <p>
            <strong className="text-gray-900">1.3 Usage Information:</strong> We
            automatically collect data about how you interact with our service,
            including pages viewed, time spent, and actions taken.
          </p>
          <p>
            <strong className="text-gray-900">1.4 Device Information:</strong>{" "}
            We collect your IP address, browser type, operating system, and
            device identifiers.
          </p>
          <p>
            <strong className="text-gray-900">1.5 Payment Information:</strong>{" "}
            All payments are processed through secure third-party providers. We
            do not store credit card details on our servers.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            2. How We Use Your Information
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>&rArr; To create and manage your user account on DropZone.</p>
          <p>&rArr; To process product reservations and time-limited holds.</p>
          <p>&rArr; To complete checkout transactions and fulfill orders.</p>
          <p>
            &rArr; To send reservation confirmations, expiration alerts, and
            important updates.
          </p>
          <p>
            &rArr; To improve our service, analyze usage patterns, and fix
            technical issues.
          </p>
          <p>
            &rArr; To prevent fraud, unauthorized access, and other security
            issues.
          </p>
          <p>
            &rArr; To comply with legal obligations and enforce our Terms of
            Service.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            3. Information Sharing
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            <strong className="text-gray-900">We Do Not Sell Your Data.</strong>{" "}
            We only share your information in these limited circumstances:
          </p>
          <p>
            &rArr; <strong>Service Providers:</strong> We share necessary data
            with trusted third parties who help us operate (payment processors,
            email services, cloud hosting).
          </p>
          <p>
            &rArr; <strong>Legal Requirements:</strong> We may disclose
            information if required by law, court order, or to protect our
            rights.
          </p>
          <p>
            &rArr; <strong>Business Transfers:</strong> If DropZone is acquired
            or merges with another company, your data may be transferred.
          </p>
          <p>
            &rArr; <strong>With Your Consent:</strong> We will ask for your
            permission before sharing for any other purpose.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            4. Data Retention
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            &rArr; <strong>Active Accounts:</strong> We keep your data as long
            as your account is active.
          </p>
          <p>
            &rArr; <strong>Reservation Data:</strong> Automatically deleted
            immediately upon expiration or cancellation.
          </p>
          <p>
            &rArr; <strong>Transaction History:</strong> Retained for 7 years to
            comply with tax and legal requirements.
          </p>
          <p>
            &rArr; <strong>Inactive Accounts:</strong> Permanently deleted after
            24 months of inactivity.
          </p>
          <p>
            &rArr; <strong>Analytics Data:</strong> Anonymized and retained for
            up to 26 months.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            5. Your Rights
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>Depending on your location, you have the right to:</p>
          <p>
            &rArr; <strong>Access</strong> - Request a copy of all data we hold
            about you.
          </p>
          <p>
            &rArr; <strong>Correct</strong> - Update inaccurate or incomplete
            information.
          </p>
          <p>
            &rArr; <strong>Delete</strong> - Request permanent deletion of your
            account and data.
          </p>
          <p>
            &rArr; <strong>Restrict</strong> - Limit how we process your
            information.
          </p>
          <p>
            &rArr; <strong>Export</strong> - Receive your data in a portable
            format.
          </p>
          <p>
            &rArr; <strong>Opt-out</strong> - Unsubscribe from marketing
            communications.
          </p>
          <p className="mt-3 p-3 bg-gray-50 rounded-lg">
            <strong>To exercise these rights:</strong> Email{" "}
            <strong>privacy@dropzone.com</strong> with your request. We respond
            within 5 business days.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            6. Data Security
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            &rArr; All data is encrypted in transit using TLS/SSL protocols.
          </p>
          <p>&rArr; Passwords are hashed and salted using bcrypt encryption.</p>
          <p>
            &rArr; We perform regular security audits and vulnerability testing.
          </p>
          <p>
            &rArr; Access to personal data is restricted to authorized personnel
            only.
          </p>
          <p>
            &rArr; While we implement industry-standard security, no method of
            transmission is 100% secure.
          </p>
          <p>
            &rArr; In case of a data breach, we will notify affected users
            within 72 hours.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            7. Cookies & Tracking
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            &rArr; <strong>Essential Cookies:</strong> Required for login,
            reservations, and cart functionality. Cannot be disabled.
          </p>
          <p>
            &rArr; <strong>Analytics Cookies:</strong> Help us understand how
            users interact with DropZone.
          </p>
          <p>
            &rArr; <strong>Session Storage:</strong> Temporarily stores
            reservation state and user preferences.
          </p>
          <p>
            &rArr; You can disable non-essential cookies in your browser
            settings.
          </p>
          <p>
            &rArr; Disabling cookies may affect reservation and checkout
            functionality.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            8. Children's Privacy
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            &rArr; DropZone is not intended for users under 13 years of age.
          </p>
          <p>
            &rArr; We do not knowingly collect information from children under
            13.
          </p>
          <p>
            &rArr; If you believe a child has provided us with personal
            information, please contact us immediately.
          </p>
          <p>&rArr; We will promptly delete any such data upon verification.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          9. Updates to This Policy
        </h2>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>&rArr; We may update this Privacy Policy from time to time.</p>
          <p>
            &rArr; Material changes will be notified via email or website
            notice.
          </p>
          <p>
            &rArr; The "Last Updated" date at the top indicates when changes
            were made.
          </p>
          <p>
            &rArr; Continued use of DropZone after changes constitutes
            acceptance.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          10. Contact Information
        </h2>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            If you have questions about this Privacy Policy or your data, please
            contact us:
          </p>
          <p>• Email: privacy@dropzone.com</p>
          <p>• For data deletion requests: account-deletion@dropzone.com</p>
          <p>
            • Through our website:{" "}
            https://dropzone-frontend.onrender.com/contact
          </p>
          <p>• Response time: Within 5 business days</p>
        </div>
      </section>

      <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>
          By using DropZone, you acknowledge that you have read and understood
          this Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
