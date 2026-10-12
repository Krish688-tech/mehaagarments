import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ShieldCheck,
  LockKeyhole,
  Database,
  UserRound,
  Cookie,
  Mail,
} from "lucide-react";

const PrivacyPolicy = () => {
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
              Privacy
              <br />
              <span className="text-gray-400">Policy.</span>
            </h1>

            <p className="max-w-2xl text-sm sm:text-base text-gray-500 leading-8 mt-8">
              Your privacy matters to us. {/**This Privacy Policy explains how
              Mehaa Garments collects, uses, stores and protects information
              when you visit our website, place an order or communicate with
              us.**/} Mehaa Garments respects your privacy and is committed to protecting and responsibly handling your personal information. This Privacy Policy explains how we collect, use, store, disclose and protect personal information when you visit our website, create an account, place an order, communicate with us through WhatsApp or otherwise use our services. We handle personal information in accordance with applicable Indian data-protection, consumer-protection and other applicable laws and regulations.
            </p>

            <p className="text-xs text-gray-400 mt-6">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Trust Cards */}
      <section className="px-5 sm:px-8 lg:px-12 pb-16">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <ShieldCheck size={20} />

            <h2 className="font-serif text-xl mt-5">
              Responsible Use
            </h2>

            <p className="text-xs text-gray-500 leading-6 mt-3">
              We use customer information for legitimate business purposes
              such as processing and delivering orders.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <LockKeyhole size={20} />

            <h2 className="font-serif text-xl mt-5">
              Secure Transactions
            </h2>

            <p className="text-xs text-gray-500 leading-6 mt-3">
              Payment transactions are processed through authorised payment
              service providers.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <Database size={20} />

            <h2 className="font-serif text-xl mt-5">
              Limited Collection
            </h2>

            <p className="text-xs text-gray-500 leading-6 mt-3">
              We seek to collect information that is relevant to providing
              our products and services.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <UserRound size={20} />

            <h2 className="font-serif text-xl mt-5">
              Your Privacy
            </h2>

            <p className="text-xs text-gray-500 leading-6 mt-3">
              You can contact us regarding questions or requests relating to
              your personal information.
            </p>
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
                  href="#introduction"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Introduction
                </a>

                <a
                  href="#information"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Information We Collect
                </a>

                <a
                  href="#use"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  How We Use Information
                </a>

                <a
                  href="#orders"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Orders & Payments
                </a>

                <a
                  href="#whatsapp"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  WhatsApp Communication
                </a>

                <a
                  href="#cookies"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Cookies
                </a>

                <a
                  href="#sharing"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Sharing Information
                </a>

                <a
                  href="#security"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Data Security
                </a>

                <a
                  href="#retention"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Data Retention
                </a>

                <a
                  href="#rights"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Your Privacy Choices
                </a>

                <a
                  href="#children"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Children's Privacy
                </a>

                <a
                  href="#changes"
                  className="block text-sm text-gray-500 hover:text-black transition"
                >
                  Policy Changes
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
            {/* 01 */}
            <section id="introduction" className="pb-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                01
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Introduction
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  Welcome to Mehaa Garments. We respect your privacy and are
                  committed to handling your personal information responsibly.
                </p>

                <p>
                  This Privacy Policy describes how Mehaa Garments collects,
                  uses, stores and protects personal information when you use
                  our website, create an account, place an order, contact us,
                  communicate through WhatsApp or otherwise interact with our
                  services.
                </p>

                <p>
                  By using our website or providing your personal information,
                  you acknowledge that you have read and understood this
                  Privacy Policy.
                </p>
              </div>
            </section>

            {/* 02 */}
            <section id="information" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                02
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Information We Collect
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  Depending on how you interact with Mehaa Garments, we may
                  collect information necessary to provide our products and
                  services.
                </p>

                <h3 className="font-medium text-black">
                  Information you provide
                </h3>

                <ul className="list-disc pl-5 space-y-2">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Mobile or telephone number</li>
                  <li>Billing and shipping address</li>
                  <li>Account login information</li>
                  <li>Order and purchase information</li>
                  <li>Customer support communications</li>
                  <li>Product reviews and photographs you choose to submit</li>
                  <li>Information provided for custom orders</li>
                </ul>

                <h3 className="font-medium text-black pt-2">
                  Information collected automatically
                </h3>

                <p>
                  When you visit our website, certain technical information
                  may be collected automatically, such as browser type,
                  device information, approximate location derived from
                  technical data, IP address, pages visited and information
                  about how you interact with the website.
                </p>
              </div>
            </section>

            {/* 03 */}
            <section id="use" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                03
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                How We Use Your Information
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  We may use personal information for purposes including:
                </p>

                <ul className="list-disc pl-5 space-y-2">
                  <li>Creating and managing customer accounts.</li>

                  <li>
                    Processing, confirming and fulfilling orders.
                  </li>

                  <li>
                    Delivering products to the address provided by you.
                  </li>

                  <li>
                    Processing payments and confirming payment status.
                  </li>

                  <li>
                    Providing customer service and resolving complaints.
                  </li>

                  <li>
                    Communicating with you about your order or enquiry.
                  </li>

                  <li>
                    Handling returns, refunds and eligible customer requests.
                  </li>

                  <li>
                    Processing eligible custom-order enquiries.
                  </li>

                  <li>
                    Improving our website, products and customer experience.
                  </li>

                  <li>
                    Detecting and preventing fraudulent, unauthorised or
                    potentially harmful activity.
                  </li>

                  <li>
                    Complying with applicable legal, tax, accounting and
                    regulatory obligations.
                  </li>
                </ul>

                <p>
                  Where consent is required for a particular processing
                  activity, we will seek consent in an appropriate manner.
                </p>
              </div>
            </section>

            {/* 04 */}
            <section id="orders" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                04
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Orders & Payments
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  When you place an order through our website, we need
                  information such as your name, contact number and delivery
                  address to process and fulfil the order.
                </p>

                <p>
                  Online payments may be processed through third-party
                  payment service providers. Mehaa Garments does not
                  intentionally store complete card numbers, UPI credentials,
                  passwords or other sensitive payment authentication
                  information when such information is handled directly by
                  the payment service provider.
                </p>

                <p>
                  Payment providers may independently process information in
                  accordance with their own privacy policies and applicable
                  security requirements.
                </p>

                <p>
                  For Cash on Delivery orders, we may use your contact and
                  delivery information to confirm and fulfil the order.
                </p>
              </div>
            </section>

            {/* 05 */}
            <section id="whatsapp" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                05
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                WhatsApp Communication
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  Mehaa Garments provides customer support and may also
                  facilitate sales through WhatsApp.
                </p>

                <p>
                  If you choose to contact us through WhatsApp, information
                  shared during the conversation may include your name, phone
                  number, product preferences, order information, delivery
                  details and other information you voluntarily provide.
                </p>

                <p>
                  WhatsApp is operated by Meta Platforms, Inc. and its
                  affiliated entities. Your use of WhatsApp is also subject to
                  WhatsApp's applicable terms and privacy practices.
                </p>

                <p>
                  Customers should avoid sending unnecessary sensitive
                  personal information through WhatsApp.
                </p>
              </div>
            </section>

            {/* 06 */}
            <section id="cookies" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                06
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl flex items-center gap-3">
                Cookies & Similar Technologies
                <Cookie size={22} className="text-gray-400" />
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  Our website may use cookies and similar technologies to
                  support essential website functionality, remember
                  preferences, improve performance and understand how visitors
                  interact with our website.
                </p>

                <p>
                  Some cookies may be provided by third-party services used
                  by our website. Depending on your browser and applicable
                  settings, you may be able to manage or restrict cookies.
                </p>

                <p>
                  Restricting certain cookies may affect the availability or
                  functionality of some website features.
                </p>
              </div>
            </section>

            {/* 07 */}
            <section id="sharing" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                07
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Sharing of Information
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  We do not sell your personal information as a standalone
                  commercial product.
                </p>

                <p>
                  We may share information with service providers where
                  necessary to operate our business and provide services to
                  you.
                </p>

                <p>These may include:</p>

                <ul className="list-disc pl-5 space-y-2">
                  <li>Payment service providers</li>
                  <li>Shipping and logistics partners</li>
                  <li>Website hosting and cloud service providers</li>
                  <li>Technology and infrastructure providers</li>
                  <li>Customer support and communication services</li>
                  <li>Analytics or website performance providers</li>
                </ul>

                <p>
                  We may also disclose information where required by law,
                  regulation, legal process, governmental authority or where
                  reasonably necessary to protect our legal rights, customers,
                  business or website.
                </p>
              </div>
            </section>

            {/* 08 */}
            <section id="security" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                08
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Data Security
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  We take reasonable technical and organisational measures to
                  protect personal information against unauthorised access,
                  misuse, alteration, disclosure or destruction.
                </p>

                <p>
                  Our website may use technologies such as encrypted
                  connections, authentication controls and access restrictions
                  to help protect customer information.
                </p>

                <p>
                  However, no internet transmission or electronic storage
                  system can be guaranteed to be completely secure. Customers
                  should also take reasonable precautions to protect their
                  account credentials and devices.
                </p>
              </div>
            </section>

            {/* 09 */}
            <section id="retention" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                09
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Data Retention
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  We retain personal information only for as long as
                  reasonably necessary for the purposes for which it was
                  collected, including fulfilling orders, providing services,
                  resolving disputes and meeting applicable legal, tax,
                  accounting or regulatory requirements.
                </p>

                <p>
                  When information is no longer required and there is no
                  applicable legal or legitimate reason to retain it, we may
                  delete, anonymise or otherwise dispose of it securely.
                </p>
              </div>
            </section>

            {/* 10 */}
            <section id="rights" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                10
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Your Privacy Choices
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  Depending on applicable law and the circumstances of the
                  processing, you may have rights relating to your personal
                  information.
                </p>

                <p>These may include requesting:</p>

                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Information about the personal data we process about you.
                  </li>

                  <li>
                    Correction of inaccurate or incomplete personal
                    information.
                  </li>

                  <li>
                    Withdrawal of consent where processing is based on
                    consent.
                  </li>

                  <li>
                    Deletion or erasure of personal information where
                    applicable and legally permissible.
                  </li>

                  <li>
                    Assistance regarding privacy-related complaints or
                    concerns.
                  </li>
                </ul>

                <p>
                  Some information may need to be retained where required or
                  permitted by applicable law, including information necessary
                  for completed transactions, legal compliance or dispute
                  resolution.
                </p>

                <p>
                  To make a privacy-related request, please contact Mehaa
                  Garments using the contact details provided below.
                </p>
              </div>
            </section>

            {/* 11 */}
            <section id="children" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                11
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Children's Privacy
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  Our website is intended for general consumers and is not
                  specifically directed toward children.
                </p>

                <p>
                  We do not knowingly seek to collect personal information
                  from children in circumstances where such collection is not
                  permitted by applicable law.
                </p>

                <p>
                  If you believe that a child has provided personal
                  information to us inappropriately, please contact us so that
                  we can review the matter and take appropriate action.
                </p>
              </div>
            </section>

            {/* 12 */}
            <section id="changes" className="border-t border-gray-200 py-14">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                12
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Changes to This Policy
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  We may update this Privacy Policy from time to time to
                  reflect changes in our services, business practices,
                  technology or applicable legal requirements.
                </p>

                <p>
                  When we make changes, the updated version will be published
                  on this page with a revised "Last updated" date.
                </p>

                <p>
                  We encourage customers to review this page periodically to
                  stay informed about how their information is handled.
                </p>
              </div>
            </section>

            {/* 13 */}
            <section
              id="contact"
              className="border-t border-gray-200 pt-14"
            >
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                13
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Contact Us
              </h2>

              <div className="space-y-5 text-sm sm:text-[15px] text-gray-600 leading-8 mt-6">
                <p>
                  If you have questions about this Privacy Policy or wish to
                  raise a privacy-related request, please contact us.
                </p>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#f7f5f2] flex items-center justify-center shrink-0">
                      <Mail size={18} />
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                        Privacy Contact
                      </p>

                      <p className="font-serif text-xl mt-2">
                        Mehaa Garments
                      </p>

                      <p className="text-sm text-gray-500 leading-7 mt-3">
                        GST Registered Business Address
                        <br />
                        Tamil Nadu, India
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
            Questions about your privacy?
          </h2>

          <p className="text-sm text-white/50 leading-7 max-w-xl mx-auto mt-5">
            Our team is happy to help with privacy-related questions,
            account information or customer support.
          </p>

          <Link
            to="/contact-us"
            className="inline-flex items-center gap-3 mt-8 px-7 py-3.5 rounded-full bg-white text-black text-sm hover:bg-white/90 transition"
          >
            Contact Mehaa Garments
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default PrivacyPolicy;