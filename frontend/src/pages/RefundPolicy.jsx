import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock3,
  IndianRupee,
  MessageCircle,
  PackageCheck,
} from "lucide-react";

const RefundPolicy = () => {
  const lastUpdated = "1 October 2026";

  return (
    <main className="bg-[#f7f5f2] text-[#171717]">
      {/* Hero */}
      <section className="pt-32 sm:pt-36 lg:pt-40 pb-16 px-5 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-gray-500 mb-6">
              Mehaa Garments
            </p>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[0.95] font-normal tracking-tight">
              Refund &
              <br />
              <span className="text-gray-400">Cancellation Policy.</span>
            </h1>

            <p className="max-w-2xl text-sm sm:text-base text-gray-500 leading-8 mt-8">
              We want every Mehaa Garments order to reach you in the expected
              condition. This policy explains order cancellation, eligible
              returns, refunds and the process for reporting an issue.
            </p>

            <p className="text-xs text-gray-400 mt-6">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Policy Highlights */}
      <section className="px-5 sm:px-8 lg:px-12 pb-16">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black text-white rounded-2xl p-6">
            <RotateCcw size={21} />

            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 mt-5">
              Eligible Returns
            </p>

            <h2 className="font-serif text-2xl mt-2">
              5 Days
            </h2>

            <p className="text-xs text-white/50 leading-6 mt-3">
              Eligible issues must be reported within 5 days of delivery.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <CheckCircle2 size={21} />

            <p className="text-[10px] uppercase tracking-[0.22em] text-gray-400 mt-5">
              Eligible Issues
            </p>

            <h2 className="font-serif text-2xl mt-2">
              Damage / Colour Fade
            </h2>

            <p className="text-xs text-gray-500 leading-6 mt-3">
              Returns are accepted only for eligible damaged or colour-fade
              issues.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <XCircle size={21} />

            <p className="text-[10px] uppercase tracking-[0.22em] text-gray-400 mt-5">
              Exchange
            </p>

            <h2 className="font-serif text-2xl mt-2">
              Not Available
            </h2>

            <p className="text-xs text-gray-500 leading-6 mt-3">
              Mehaa Garments does not currently offer product exchanges.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <IndianRupee size={21} />

            <p className="text-[10px] uppercase tracking-[0.22em] text-gray-400 mt-5">
              Eligible Refund
            </p>

            <h2 className="font-serif text-2xl mt-2">
              Refund Provided
            </h2>

            <p className="text-xs text-gray-500 leading-6 mt-3">
              Eligible returned products are refunded after verification.
            </p>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="px-5 sm:px-8 lg:px-12 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#171717] text-white rounded-4xl p-8 sm:p-12 lg:p-14">
            <div className="grid lg:grid-cols-[auto_1fr] gap-7 items-start">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                <PackageCheck size={23} />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                  Please Read Before Requesting a Return
                </p>

                <h2 className="font-serif text-3xl sm:text-4xl mt-4">
                  Our return policy is issue-specific.
                </h2>

                <p className="text-sm text-white/55 leading-7 max-w-3xl mt-5">
                  Mehaa Garments accepts returns only where the product has an
                  eligible damage issue or qualifying colour-fade issue. We do
                  not accept general returns because of change of mind,
                  preference, colour preference or other reasons outside the
                  eligible return conditions described in this policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="px-5 sm:px-8 lg:px-12 pb-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[240px_1fr] gap-12 lg:gap-20">
          {/* Contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-5">
                On this page
              </p>

              <nav className="space-y-3">
                <a
                  href="#cancellation"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Cancellation
                </a>

                <a
                  href="#eligible"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Eligible Returns
                </a>

                <a
                  href="#not-eligible"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Non-Eligible Returns
                </a>

                <a
                  href="#sale"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Sale Products
                </a>

                <a
                  href="#custom"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Custom Orders
                </a>

                <a
                  href="#report"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Reporting an Issue
                </a>

                <a
                  href="#verification"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Verification
                </a>

                <a
                  href="#return-shipping"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Return Shipping
                </a>

                <a
                  href="#refund"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Refunds
                </a>

                <a
                  href="#exchange"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Exchanges
                </a>

                <a
                  href="#contact"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Contact
                </a>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <article className="max-w-4xl">
            {/* Cancellation */}
            <section id="cancellation" className="pb-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                01
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Order Cancellation
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  Customers may request cancellation of an order before the
                  order has been dispatched.
                </p>

                <p>
                  Cancellation requests should be made as soon as possible
                  through our available customer support channels, preferably
                  through WhatsApp or phone.
                </p>

                <p>
                  Once an order has been dispatched, cancellation may no
                  longer be possible through the normal cancellation process.
                  In such circumstances, customers should contact us and we
                  will review the situation based on the order status.
                </p>

                <p>
                  For Cash on Delivery orders, cancellation requests are also
                  subject to the order's dispatch status and verification
                  status.
                </p>
              </div>
            </section>

            {/* Eligible Returns */}
            <section id="eligible" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                02
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Eligible Returns
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  Returns are accepted only for products that have an eligible
                  issue such as:
                </p>

                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Product damage that occurred before or during delivery.
                  </li>

                  <li>
                    Qualifying colour-fade issues attributable to the product
                    and reported within the applicable return period.
                  </li>
                </ul>

                <p>
                  The issue must be reported to Mehaa Garments within
                  <strong className="text-black"> 5 days of delivery</strong>.
                </p>

                <p>
                  The return period is calculated from the date on which the
                  order is recorded as delivered by the applicable logistics
                  partner.
                </p>

                <p>
                  Customers should contact us as soon as an issue is noticed
                  rather than waiting until the end of the return period.
                </p>
              </div>
            </section>

            {/* Non Eligible */}
            <section
              id="not-eligible"
              className="border-t border-gray-200 py-14"
            >
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                03
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Non-Eligible Returns
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  The following situations are generally not eligible for
                  return under this policy:
                </p>

                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Change of mind after receiving the product.
                  </li>

                  <li>
                    Change of preference regarding colour, design, fabric or
                    style where the product received matches the order.
                  </li>

                  <li>
                    Products that have been used, worn, washed or altered.
                  </li>

                  <li>
                    Damage caused after delivery through improper use,
                    washing, storage, ironing or handling.
                  </li>

                  <li>
                    Minor variations that are inherent to handcrafted,
                    woven or traditionally produced textiles and do not
                    constitute product damage.
                  </li>

                  <li>
                    Requests submitted after the applicable 5-day return
                    period.
                  </li>
                </ul>

                <p>
                  Eligibility is determined after reviewing the information
                  and evidence provided by the customer and, where necessary,
                  inspecting the returned product.
                </p>
              </div>
            </section>

            {/* Sale Products */}
            <section id="sale" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                04
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Sale & Promotional Products
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  Products specifically identified as sale, clearance or
                  promotional products are not eligible for return under our
                  standard return policy.
                </p>

                <p>
                  This restriction does not affect rights or remedies that
                  cannot lawfully be excluded under applicable law.
                </p>

                <p>
                  Customers are encouraged to review the product description
                  and applicable terms before placing an order for a sale or
                  promotional product.
                </p>
              </div>
            </section>

            {/* Custom */}
            <section id="custom" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                05
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Custom Orders
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  Mehaa Garments accepts selected custom orders for Pattu
                  sarees and blouses with Aari work.
                </p>

                <p>
                  Because custom products may be prepared according to
                  customer-specific requirements, customers should confirm all
                  relevant details before the custom order is accepted.
                </p>

                <p>
                  Custom orders are not eligible for return merely because of
                  a change of mind or change in personal preference.
                </p>

                <p>
                  If a custom product is received with an eligible
                  manufacturing or delivery-related damage issue, the customer
                  should contact us within 5 days of delivery so that the
                  matter can be reviewed.
                </p>
              </div>
            </section>

            {/* Report */}
            <section id="report" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                06
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                How to Report a Return Issue
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  If you receive a damaged product or identify a qualifying
                  colour-fade issue, contact Mehaa Garments within 5 days of
                  delivery.
                </p>

                <p>
                  For faster assistance, customers should provide:
                </p>

                <ul className="list-disc pl-5 space-y-2">
                  <li>Order number</li>
                  <li>Customer name</li>
                  <li>Registered mobile number</li>
                  <li>Clear photographs of the issue</li>
                  <li>Video evidence where reasonably useful</li>
                  <li>A brief description of the problem</li>
                </ul>

                <p>
                  Customers can contact us through WhatsApp or other customer
                  support channels displayed on our website.
                </p>
              </div>
            </section>

            {/* Verification */}
            <section
              id="verification"
              className="border-t border-gray-200 py-14"
            >
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                07
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Return Verification
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  After receiving a return request, Mehaa Garments may review
                  the photographs, videos, order details and other information
                  provided by the customer.
                </p>

                <p>
                  Where necessary, we may arrange for the product to be
                  returned for physical inspection before approving the
                  refund.
                </p>

                <p>
                  The returned product should be kept in the condition in which
                  the issue was discovered and should not be unnecessarily
                  altered, washed, repaired or modified before our review.
                </p>

                <p>
                  A return does not automatically mean that a refund has been
                  approved. Refund eligibility will be confirmed after the
                  applicable review.
                </p>
              </div>
            </section>

            {/* Return Shipping */}
            <section
              id="return-shipping"
              className="border-t border-gray-200 py-14"
            >
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                08
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Return Shipping
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  For a return that is accepted as eligible under this policy,
                  the customer will not be required to bear the return
                  shipping cost.
                </p>

                <p>
                  Mehaa Garments will coordinate or provide the applicable
                  return shipping instructions for eligible returns.
                </p>

                <p>
                  Customers should not independently send a product to an
                  address without first contacting Mehaa Garments and receiving
                  return instructions.
                </p>

                <p>
                  If a return is found not to qualify under this policy,
                  additional instructions may be provided based on the
                  circumstances.
                </p>
              </div>
            </section>

            {/* Refund */}
            <section id="refund" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                09
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Refunds
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  Where a return is approved, the applicable refund will be
                  processed after the return has been received and verified,
                  where physical inspection is required.
                </p>

                <p>
                  Refunds for prepaid orders will generally be processed
                  through the original payment method or through the applicable
                  payment/refund mechanism used for the transaction.
                </p>

                <p>
                  For Cash on Delivery orders, refund arrangements will be
                  communicated to the customer after the eligible return has
                  been approved. We may request appropriate bank or payment
                  details required to process the refund.
                </p>

                <p>
                  The time taken for the refunded amount to appear in the
                  customer's account may depend on the payment provider,
                  banking institution or other financial intermediary.
                </p>

                <p>
                  We will communicate relevant refund information to the
                  customer once the refund has been initiated.
                </p>
              </div>
            </section>

            {/* Exchange */}
            <section id="exchange" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                10
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Exchange Policy
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  Mehaa Garments does not currently offer product exchanges.
                </p>

                <p>
                  If an order qualifies for a return under this policy, the
                  applicable remedy will generally be a refund after the return
                  has been reviewed and approved.
                </p>

                <p>
                  Customers who wish to purchase a different product may place
                  a new order separately.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section
              id="contact"
              className="border-t border-gray-200 pt-14"
            >
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                11
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Need Help With a Return?
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  If you believe your order has an eligible issue, please
                  contact us within the applicable 5-day period.
                </p>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#f7f5f2] flex items-center justify-center shrink-0">
                      <MessageCircle size={18} />
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                        Customer Support
                      </p>

                      <p className="font-serif text-xl mt-2">
                        Mehaa Garments
                      </p>

                      <p className="text-sm text-gray-500 leading-7 mt-3">
                        For return and refund assistance, please contact us
                        through WhatsApp or phone.
                      </p>

                      <p className="text-sm text-gray-500 mt-3">
                        Phone / WhatsApp: +91 99999 99999
                      </p>

                      <p className="text-sm text-gray-400 mt-2">
                        Official business email coming soon
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </article>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#171717] text-white px-5 sm:px-8 lg:px-12 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-5">
            Mehaa Garments
          </p>

          <h2 className="font-serif text-4xl sm:text-5xl">
            Need assistance with your order?
          </h2>

          <p className="text-sm text-white/50 leading-7 max-w-xl mx-auto mt-5">
            Contact our team through WhatsApp and we'll help you with your
            order or eligible return request.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-white text-black text-sm hover:bg-white/90 transition"
            >
              WhatsApp Support
              <ArrowUpRight size={16} />
            </a>

            <Link
              to="/contact-us"
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full border border-white/20 text-white text-sm hover:bg-white/10 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default RefundPolicy;