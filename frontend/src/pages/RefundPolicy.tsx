import React from "react";
import {
  Shield,
  Clock,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Calendar,
  Package,
  HelpCircle,
} from "lucide-react";

const RefundPolicy: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Refund & Returns Policy
        </h1>
        <p className="text-gray-600">Last Updated: {currentYear}</p>
        <p className="text-gray-500 mt-2">
          Understanding your rights for limited drop purchases
        </p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3">
          <div>
            <h2 className="text-lg font-semibold text-orange-800 mb-2">
              Important Notice for Limited Drops
            </h2>
            <p className="text-orange-700">
              Due to the exclusive and limited nature of our products, all sales
              are final for limited drop items unless they arrive damaged or
              defective. Please read this policy carefully before completing
              your purchase.
            </p>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            1. Limited Drop Product Policy
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            &rArr; <strong>All sales are final</strong> for limited edition and
            limited stock products.
          </p>
          <p>
            &rArr; Limited drops are exclusive releases with restricted
            quantities.
          </p>
          <p>
            &rArr; Once a limited drop item is purchased, it cannot be returned
            for a refund due to change of mind.
          </p>
          <p>
            &rArr; The "5-minute reservation window" is your opportunity to
            review the product before purchase.
          </p>
          <p>
            &rArr; By completing checkout, you acknowledge and accept this
            no-refund policy for limited drops.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            2. Eligibility for Refunds
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            <strong className="text-gray-900">
              Refunds are ONLY available in these cases:
            </strong>
          </p>
          <p>
            &rArr; <strong>Damaged Products:</strong> Item arrives physically
            damaged or broken.
          </p>
          <p>
            &rArr; <strong>Defective Products:</strong> Item has manufacturer
            defects affecting functionality.
          </p>
          <p>
            &rArr; <strong>Wrong Item Sent:</strong> You receive a different
            product than what you ordered.
          </p>
          <p>
            &rArr; <strong>Missing Items:</strong> Your order is incomplete
            compared to the confirmation.
          </p>
          <p>
            &rArr; <strong>Duplicate Charge:</strong> You were charged multiple
            times for the same order.
          </p>
          <p className="mt-3 p-3 bg-red-50 rounded-lg text-red-700">
            <strong>✗ Refunds are NOT provided for:</strong> Change of mind,
            wrong size selection, buyer's remorse, price drops on other
            platforms, or inability to resell.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            3. Return Window & Deadlines
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            &rArr; You must report any issues within <strong>7 days</strong> of
            receiving your product.
          </p>
          <p>
            &rArr; After 7 days, all sales are considered final and accepted.
          </p>
          <p>
            &rArr; Return requests for damaged/defective items must be submitted
            within 48 hours of delivery.
          </p>
          <p>
            &rArr; We reserve the right to deny refund requests submitted after
            these deadlines.
          </p>
          <p>
            &rArr; Due to limited stock, we cannot offer exchanges - only
            refunds for eligible claims.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            4. Refund Process
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            <strong className="text-gray-900">Step 1: Submit a Claim</strong>
          </p>
          <p>
            &rArr; Email <strong>refunds@dropzone.com</strong> with your order
            number.
          </p>
          <p>&rArr; Include photos/videos showing the damage or defect.</p>
          <p>&rArr; Provide a detailed description of the issue.</p>

          <p className="mt-3">
            <strong className="text-gray-900">Step 2: Review Process</strong>
          </p>
          <p>
            &rArr; Our team reviews your claim within{" "}
            <strong>2-3 business days</strong>.
          </p>
          <p>&rArr; We may request additional information or photos.</p>
          <p>
            &rArr; Approved claims receive a return shipping label (free for
            damaged/defective items).
          </p>

          <p className="mt-3">
            <strong className="text-gray-900">Step 3: Return & Refund</strong>
          </p>
          <p>&rArr; Ship the item back within 14 days of approval.</p>
          <p>
            &rArr; Once received and inspected, refunds are processed within 5-7
            business days.
          </p>
          <p>&rArr; Refunds are issued to your original payment method.</p>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            5. Reservation & Stock Implications
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            &rArr; <strong>Canceling a reservation</strong> (within 5 minutes)
            does NOT require a refund - no payment was taken.
          </p>
          <p>
            &rArr; <strong>After checkout</strong>, the 5-minute hold converts
            to a binding purchase.
          </p>
          <p>
            &rArr; If you receive a refund for a damaged item, the stock is NOT
            replenished (item is defective).
          </p>
          <p>
            &rArr; We cannot hold or reserve limited drop items while a refund
            is being processed.
          </p>
          <p>
            &rArr; Canceling a valid order to "re-reserve" is not permitted and
            may result in account suspension.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            6. Chargebacks & Disputes
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            &rArr; Please contact us FIRST before filing a chargeback with your
            bank.
          </p>
          <p>
            &rArr; Unauthorized chargebacks for valid purchases will result in
            immediate account suspension.
          </p>
          <p>
            &rArr; We will provide evidence of your reservation, checkout, and
            delivery to dispute false claims.
          </p>
          <p>
            &rArr; Users who file fraudulent chargebacks are permanently banned
            from DropZone.
          </p>
          <p>&rArr; Legal action may be pursued for chargeback abuse.</p>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            7. Non-Refundable Items
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>The following items are strictly non-refundable:</p>
          <p>&rArr; Digital products, download codes, or gift cards.</p>
          <p>
            &rArr; Items marked as "Final Sale" or "No Returns" in the product
            description.
          </p>
          <p>
            &rArr; Products damaged due to user error, misuse, or normal wear
            and tear.
          </p>
          <p>&rArr; Items purchased from unauthorized resellers.</p>
          <p>
            &rArr; Shipping fees, customs duties, or taxes (non-refundable).
          </p>
          <p>
            &rArr; Products without original packaging or proof of purchase.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            8. Shipping Damage Claims
          </h2>
        </div>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>&rArr; Inspect your package immediately upon delivery.</p>
          <p>
            &rArr; Take photos of the damaged box AND product before opening.
          </p>
          <p>
            &rArr; Report shipping damage within <strong>48 hours</strong> of
            delivery.
          </p>
          <p>&rArr; Keep all original packaging for inspection.</p>
          <p>
            &rArr; We will file claims with the shipping carrier on your behalf.
          </p>
          <p>
            &rArr; Refunds for shipping damage are issued once the carrier
            approves the claim.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          9. Cancellation Policy
        </h2>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>
            &rArr; <strong>Before Checkout:</strong> You can cancel your
            reservation anytime within the 5-minute window - no penalty.
          </p>
          <p>
            &rArr; <strong>After Checkout:</strong> Orders cannot be canceled
            once payment is processed.
          </p>
          <p>
            &rArr; The 5-minute reservation period is your "cooling off" window
            to review the purchase.
          </p>
          <p>
            &rArr; We cannot cancel orders to "fix" or "modify" them - you must
            complete the purchase as-is.
          </p>
          <p>&rArr; Address changes cannot be made after checkout.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          10. Contact for Refund Requests
        </h2>
        <div className="space-y-3 text-gray-700 ml-4">
          <p>To request a refund or report an issue:</p>
          <p>• Email: refunds@dropzone.com</p>
          <p>• Subject line: "REFUND REQUEST - [Order Number]"</p>
          <p>• Include: Order number, photos/videos, description of issue</p>
          <p>• Phone support: Available for order issues only (not refunds)</p>
          <p>• Response time: Within 2-3 business days</p>
          <p className="mt-3 p-3 bg-blue-50 rounded-lg">
            <strong>Tip:</strong> Save your order confirmation email - you'll
            need the order number for all refund requests.
          </p>
        </div>
      </section>

      <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>
          By completing a purchase on DropZone, you acknowledge that you have
          read, understood, and agree to this Refund Policy.
        </p>
        <p className="mt-2">
          For limited drop products, all sales are final unless damaged or
          defective.
        </p>
      </div>
    </div>
  );
};

export default RefundPolicy;
