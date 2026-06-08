import React from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Clock,
  ShoppingBag,
  AlertCircle,
  FileText,
  CheckCircle,
} from "lucide-react";

const TermOfServices: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Terms of Service
        </h1>
        <p className="text-gray-600">Last Updated: {currentYear}</p>
        <p className="text-gray-500 mt-2">
          Please read these terms carefully before using DropZone
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              Important Notice
            </h2>
            <p className="text-blue-700">
              By accessing or using DropZone, you agree to be bound by these
              Terms of Service. If you disagree with any part of the terms, you
              may not access the service.
            </p>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            1. Account Terms
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>&rArr; You must be at least 18 years old to use this service.</p>
          <p>
            &rArr; You must provide accurate and complete information when
            creating an account.
          </p>
          <p>
            &rArr; You are responsible for maintaining the security of your
            account and password.
          </p>
          <p>
            &rArr; You are responsible for all activities that occur under your
            account.
          </p>
          <p>
            &rArr; We reserve the right to suspend or terminate accounts that
            violate these terms.
          </p>
        </div>
      </section>
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            2. Reservation Policy
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            &rArr; When you reserve a product, the item is locked for{" "}
            <strong>5 minutes</strong>.
          </p>
          <p>
            &rArr; You must complete checkout within the 5-minute window to
            secure the item.
          </p>
          <p>
            &rArr; If you do not complete checkout within 5 minutes, the
            reservation expires and stock is released.
          </p>
          <p>
            &rArr; You may cancel a reservation at any time before checkout.
          </p>
          <p>
            &rArr; Each user may have multiple active reservations for different
            products.
          </p>
          <p>
            &rArr; You cannot reserve the same product twice simultaneously.
          </p>
        </div>
      </section>
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            3. Purchases and Payments
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            &rArr; All prices are listed in USD and are subject to change
            without notice.
          </p>
          <p>
            &rArr; We reserve the right to refuse any order you place with us.
          </p>
          <p>
            &rArr; We may limit or cancel quantities purchased per person, per
            household, or per order.
          </p>
          <p>
            &rArr; In the event of a pricing error, we reserve the right to
            cancel your order.
          </p>
          <p>
            &rArr; Payment must be completed at checkout to finalize your
            purchase.
          </p>
        </div>
      </section>
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            4. Product Availability
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            &rArr; Products are offered on a first-come, first-served basis
            while supplies last.
          </p>
          <p>
            &rArr; Stock levels are displayed in real-time but may not reflect
            simultaneous reservations.
          </p>
          <p>&rArr; We do not guarantee that any product will be in stock.</p>
          <p>
            &rArr; Limited edition items may have quantity restrictions per
            user.
          </p>
          <p>
            &rArr; We reserve the right to discontinue any product at any time.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            5. User Conduct
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            &rArr; You agree not to use automated scripts or bots to interact
            with the service.
          </p>
          <p>
            &rArr; You agree not to manipulate the reservation system or stock
            levels.
          </p>
          <p>
            &rArr; You agree not to resell products for commercial purposes.
          </p>
          <p>
            &rArr; You agree not to use the service for any illegal purpose.
          </p>
          <p>
            &rArr; Violation of these terms may result in immediate account
            suspension.
          </p>
        </div>
      </section>
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            6. Limitation of Liability
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            &rArr; The service is provided "as is" without warranties of any
            kind.
          </p>
          <p>
            &rArr; We are not liable for any indirect, incidental, or
            consequential damages.
          </p>
          <p>
            &rArr; We are not responsible for technical issues beyond our
            control.
          </p>
          <p>
            &rArr; Our maximum liability is limited to the amount paid for
            products purchased.
          </p>
          <p>
            &rArr; Some jurisdictions do not allow certain liability
            limitations.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          7. Modifications to Service
        </h2>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            &rArr; We reserve the right to modify or discontinue the service at
            any time.
          </p>
          <p>&rArr; We may update these Terms of Service from time to time.</p>
          <p>
            &rArr; Continued use of the service constitutes acceptance of
            modified terms.
          </p>
          <p>
            &rArr; We will notify users of significant changes via email or
            website notice.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          8. Governing Law
        </h2>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            &rArr; These terms shall be governed by and construed in accordance
            with applicable laws.
          </p>
          <p>
            &rArr; Any disputes arising from these terms shall be resolved
            through arbitration.
          </p>
          <p>
            &rArr; You agree to submit to the exclusive jurisdiction of the
            courts.
          </p>
        </div>
      </section>

      {/* Section 9: Contact */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          9. Contact Information
        </h2>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>If you have any questions about these Terms, please contact us:</p>
          <p>• Email: support@dropzone.com</p>
          <p>
            • Through our website:
            https://dropzone-frontend.onrender.com/contact
          </p>
        </div>
      </section>
    </div>
  );
};

export default TermOfServices;
