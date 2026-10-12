import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CreditCard,
  ShieldCheck,
  IndianRupee,
  Banknote,
  AlertCircle,
  RefreshCcw,
  MessageCircle,
} from "lucide-react";

const PaymentPolicy = () => {
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
              Payment
              <br />
              <span className="text-gray-400">Policy.</span>
            </h1>

            <p className="max-w-2xl text-sm sm:text-base text-gray-500 leading-8 mt-8">
              This Payment Policy explains the payment methods available at
              Mehaa Garments and how we handle successful, failed, pending,
              cancelled and refunded transactions.
            </p>

            <p className="text-xs text-gray-400 mt-6">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Payment Highlights */}
      <section className="px-5 sm:px-8 lg:px-12 pb-16">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black text-white rounded-2xl p-6">
            <CreditCard size={21} />

            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 mt-5">
              Online Payments
            </p>

            <h2 className="font-serif text-2xl mt-2">
              Secure Checkout
            </h2>

            <p className="text-xs text-white/50 leading-6 mt-3">
              Online payments are processed through our authorised payment
              gateway.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <Banknote size={21} />

            <p className="text-[10px] uppercase tracking-[0.22em] text-gray-400 mt-5">
              Cash on Delivery
            </p>

            <h2 className="font-serif text-2xl mt-2">
              COD Available
            </h2>

            <p className="text-xs text-gray-500 leading-6 mt-3">
              Customers may choose Cash on Delivery where the option is
              available for their order and location.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <ShieldCheck size={21} />

            <p className="text-[10px] uppercase tracking-[0.22em] text-gray-400 mt-5">
              Payment Security
            </p>

            <h2 className="font-serif text-2xl mt-2">
              Protected
            </h2>

            <p className="text-xs text-gray-500 leading-6 mt-3">
              Payment credentials are handled through the applicable payment
              service provider.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <RefreshCcw size={21} />

            <p className="text-[10px] uppercase tracking-[0.22em] text-gray-400 mt-5">
              Refunds
            </p>

            <h2 className="font-serif text-2xl mt-2">
              As Per Policy
            </h2>

            <p className="text-xs text-gray-500 leading-6 mt-3">
              Eligible refunds are processed according to our Refund &
              Cancellation Policy.
            </p>
          </div>
        </div>
      </section>

      {/* Accepted Payments */}
      <section className="px-5 sm:px-8 lg:px-12 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-4xl overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-12 lg:p-16">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-5">
                  Payment Methods
                </p>

                <h2 className="font-serif text-4xl sm:text-5xl leading-tight">
                  Choose the way
                  <br />
                  you prefer to pay.
                </h2>

                <p className="text-sm text-gray-500 leading-7 mt-6 max-w-lg">
                  Mehaa Garments offers online payment options through our
                  payment gateway as well as Cash on Delivery for eligible
                  orders.
                </p>
              </div>

              <div className="bg-[#f7f5f2] p-8 sm:p-12 lg:p-16">
                <div className="space-y-7">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0">
                      <CreditCard size={18} />
                    </div>

                    <div>
                      <h3 className="font-serif text-2xl">
                        Cards
                      </h3>

                      <p className="text-sm text-gray-500 leading-6 mt-2">
                        Eligible debit and credit card payments may be
                        available through the payment gateway.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0">
                      <IndianRupee size={18} />
                    </div>

                    <div>
                      <h3 className="font-serif text-2xl">
                        UPI
                      </h3>

                      <p className="text-sm text-gray-500 leading-6 mt-2">
                        UPI payment options may be available through the
                        payment gateway depending on the payment environment
                        and provider availability.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0">
                      <Banknote size={18} />
                    </div>

                    <div>
                      <h3 className="font-serif text-2xl">
                        Cash on Delivery
                      </h3>

                      <p className="text-sm text-gray-500 leading-6 mt-2">
                        COD is available for eligible orders and delivery
                        locations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0">
                      <ShieldCheck size={18} />
                    </div>

                    <div>
                      <h3 className="font-serif text-2xl">
                        Net Banking & Other Options
                      </h3>

                      <p className="text-sm text-gray-500 leading-6 mt-2">
                        Additional payment methods may be displayed at
                        checkout depending on the payment gateway and
                        availability at the time of purchase.
                      </p>
                    </div>
                  </div>
                </div>
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
                  href="#online"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Online Payments
                </a>

                <a
                  href="#cod"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Cash on Delivery
                </a>

                <a
                  href="#security"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Payment Security
                </a>

                <a
                  href="#failed"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Failed Payments
                </a>

                <a
                  href="#pending"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Pending Payments
                </a>

                <a
                  href="#duplicate"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Duplicate Payments
                </a>

                <a
                  href="#successful"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Successful Payments
                </a>

                <a
                  href="#refunds"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Refunds
                </a>

                <a
                  href="#fraud"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Fraud Prevention
                </a>

                <a
                  href="#contact"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Payment Support
                </a>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <article className="max-w-4xl">
            {/* Online */}
            <section id="online" className="pb-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                01
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Online Payments
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  Mehaa Garments accepts online payments through its designated
                  payment gateway.
                </p>

                <p>
                  Depending on availability at checkout, customers may be
                  offered payment methods such as debit cards, credit cards,
                  UPI, net banking and other payment methods supported by the
                  payment service provider.
                </p>

                <p>
                  The payment methods displayed at checkout may vary depending
                  on the payment provider, transaction amount, customer
                  location, bank, device or other applicable factors.
                </p>

                <p>
                  Customers should complete payment only through the official
                  Mehaa Garments checkout or other payment instructions
                  provided directly by Mehaa Garments.
                </p>
              </div>
            </section>

            {/* COD */}
            <section id="cod" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                02
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Cash on Delivery
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  Cash on Delivery is available for eligible Mehaa Garments
                  orders and delivery locations.
                </p>

                <p>
                  COD orders may be subject to order verification before
                  dispatch. We may contact the customer through the registered
                  phone number or WhatsApp for confirmation.
                </p>

                <p>
                  Customers should ensure that the recipient is available to
                  receive the package and make the applicable payment at the
                  time of delivery.
                </p>

                <p>
                  If a COD order cannot be delivered or is repeatedly refused,
                  Mehaa Garments may review the customer's future COD
                  eligibility.
                </p>
              </div>
            </section>

            {/* Security */}
            <section
              id="security"
              className="border-t border-gray-200 py-14"
            >
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                03
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Payment Security
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  Online payment information is processed through the
                  applicable payment service provider.
                </p>

                <p>
                  Mehaa Garments does not intentionally request customers to
                  provide complete card numbers, card PINs, UPI PINs, CVV
                  numbers, OTPs or payment passwords through WhatsApp, phone
                  calls, email or social media.
                </p>

                <p>
                  Customers should never share OTPs, UPI PINs, card PINs,
                  passwords or other confidential payment credentials with
                  anyone claiming to represent Mehaa Garments.
                </p>

                <p>
                  If you receive a suspicious payment request, please contact
                  Mehaa Garments through the official contact details shown on
                  our website before making any payment.
                </p>
              </div>
            </section>

            {/* Failed */}
            <section id="failed" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                04
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Failed Payments
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  A payment may fail because of bank restrictions, insufficient
                  funds, incorrect payment information, network interruptions,
                  payment gateway issues, authentication failure or other
                  reasons.
                </p>

                <p>
                  If the payment fails and no amount has been successfully
                  charged, the customer may attempt the payment again using an
                  available payment method.
                </p>

                <p>
                  Customers should avoid making repeated payments immediately
                  if the payment status is unclear. Instead, check the order
                  status or contact us so that the transaction can be verified.
                </p>

                <p>
                  If your bank account has been debited even though the order
                  is not confirmed, please contact us with the relevant
                  transaction details so that we can investigate the payment
                  status.
                </p>
              </div>
            </section>

            {/* Pending */}
            <section id="pending" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                05
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Pending Payments
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  Occasionally, a payment may remain pending because the bank
                  or payment provider has not yet returned a final payment
                  status.
                </p>

                <p>
                  In such cases, customers should avoid making another payment
                  for the same order until the status has been checked.
                </p>

                <p>
                  Mehaa Garments may verify the payment status with the
                  applicable payment service provider before confirming or
                  cancelling the order.
                </p>
              </div>
            </section>

            {/* Duplicate */}
            <section
              id="duplicate"
              className="border-t border-gray-200 py-14"
            >
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                06
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Duplicate Payments
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  If a customer is charged more than once for the same order
                  because of a duplicate transaction, the additional
                  transaction will be reviewed and, where confirmed, handled
                  through the applicable refund process.
                </p>

                <p>
                  Customers should provide the order number and relevant
                  transaction information when reporting a suspected duplicate
                  payment.
                </p>
              </div>
            </section>

            {/* Successful */}
            <section
              id="successful"
              className="border-t border-gray-200 py-14"
            >
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                07
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Successful Payments
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  After a successful online payment is confirmed, the order
                  may proceed to processing and dispatch in accordance with our
                  Shipping Policy.
                </p>

                <p>
                  Customers should retain their order confirmation and payment
                  transaction details until the order has been successfully
                  delivered.
                </p>

                <p>
                  Payment confirmation alone does not change the applicable
                  cancellation, return, refund or other terms of the order.
                </p>
              </div>
            </section>

            {/* Refunds */}
            <section id="refunds" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                08
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Refunds & Reversals
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  Eligible refunds are processed in accordance with the Mehaa
                  Garments Refund & Cancellation Policy.
                </p>

                <p>
                  For prepaid orders, an approved refund will generally be
                  processed through the original payment method or the
                  applicable payment/refund mechanism.
                </p>

                <p>
                  For Cash on Delivery orders, an approved refund may require
                  customers to provide appropriate bank or payment details.
                </p>

                <p>
                  The time required for a refund to appear in a customer's
                  account may depend on the payment provider, bank or other
                  financial institution.
                </p>

                <p>
                  If a payment is automatically reversed by the payment
                  provider because an order was not successfully completed,
                  the timing of the reversal will depend on the relevant bank
                  or payment provider.
                </p>
              </div>
            </section>

            {/* Fraud */}
            <section id="fraud" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                09
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Fraud Prevention
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  Mehaa Garments may use reasonable verification and fraud
                  prevention measures to protect customers and the business
                  from unauthorised or suspicious transactions.
                </p>

                <p>
                  An order may be delayed, reviewed or cancelled where there
                  are reasonable concerns regarding payment authenticity,
                  identity, delivery information or potential fraudulent
                  activity, subject to applicable law.
                </p>

                <p>
                  We may request additional information where reasonably
                  necessary to verify an order.
                </p>

                <p>
                  We will never ask customers to disclose their UPI PIN, card
                  PIN, OTP or payment password.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section id="contact" className="border-t border-gray-200 pt-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                10
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Payment Support
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  If you experience a payment issue, please contact Mehaa
                  Garments with your order number and relevant payment
                  information.
                </p>

                <p>
                  For your security, do not send your complete card number,
                  CVV, UPI PIN, OTP, password or other confidential payment
                  credentials.
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
            Need help with a payment?
          </h2>

          <p className="text-sm text-white/50 leading-7 max-w-xl mx-auto mt-5">
            If your payment failed, is pending, or your account was charged
            without an order confirmation, contact our support team.
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

export default PaymentPolicy;