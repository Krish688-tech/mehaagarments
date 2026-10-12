import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  ShieldCheck,
  ShoppingBag,
  UserCheck,
} from "lucide-react";

const TermsConditions = () => {
  const lastUpdated = "October 1, 2026";

  return (
    <div className="bg-[#f7f5f2] text-[#171717] min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-black/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-24 pb-20 lg:pt-32 lg:pb-28">
          <div className="max-w-4xl">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-black/45 hover:text-black transition mb-10"
            >
              <ArrowLeft size={14} />
              Back to Home
            </Link>

            <p className="text-[10px] uppercase tracking-[0.35em] text-black/40 mb-5">
              Legal & Information
            </p>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal leading-[0.95] tracking-tight">
              Terms &
              <br />
              <span className="text-black/45">Conditions.</span>
            </h1>

            <p className="text-sm sm:text-base text-black/55 leading-7 max-w-2xl mt-8">
              These Terms & Conditions explain the rules that apply when you
              access or use the Mehaa Garments website, create an account,
              purchase products, submit reviews or otherwise interact with our
              services.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-8">
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-black/10 text-[11px] text-black/55">
                <FileText size={14} />
                Last updated: {lastUpdated}
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-black/10 text-[11px] text-black/55">
                <ShieldCheck size={14} />
                Applicable to India
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Highlights */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-black/5">
            <ShoppingBag size={20} className="text-black/45 mb-5" />

            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40 mb-2">
              Brand
            </p>

            <h3 className="font-serif text-xl">Mehaa Garments</h3>

            <p className="text-xs text-black/45 leading-6 mt-2">
              A unit of Ganesan Enterprises.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-black/5">
            <UserCheck size={20} className="text-black/45 mb-5" />

            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40 mb-2">
              Accounts
            </p>

            <h3 className="font-serif text-xl">Required</h3>

            <p className="text-xs text-black/45 leading-6 mt-2">
              An account is required to complete purchases.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-black/5">
            <CheckCircle2 size={20} className="text-black/45 mb-5" />

            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40 mb-2">
              Returns
            </p>

            <h3 className="font-serif text-xl">5 Days</h3>

            <p className="text-xs text-black/45 leading-6 mt-2">
              Eligible damaged or colour-fade issues only.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-black/5">
            <ShieldCheck size={20} className="text-black/45 mb-5" />

            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40 mb-2">
              Shipping
            </p>

            <h3 className="font-serif text-xl">Free India-Wide</h3>

            <p className="text-xs text-black/45 leading-6 mt-2">
              We currently ship only within India.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-24 lg:pb-32">
        <div className="space-y-16">
          {/* 01 */}
          <section>
            <SectionNumber number="01" title="Introduction & Acceptance" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                Welcome to Mehaa Garments. Mehaa Garments is a unit of
                <strong className="text-black/80"> Ganesan Enterprises</strong>
                , operating from No. 48, First Floor, Kalangnar Karunanithi
                Street, Salamedu, Villupuram, Tamil Nadu – 605401, India.
              </p>

              <p>
                By accessing or using the Mehaa Garments website, creating a
                customer account, placing an order, submitting a review or
                otherwise using our services, you agree to comply with these
                Terms & Conditions.
              </p>

              <p>
                If you do not agree with these Terms & Conditions, please do
                not use the website or place an order.
              </p>
            </div>
          </section>

          {/* 02 */}
          <section>
            <SectionNumber number="02" title="About Mehaa Garments" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                Mehaa Garments is the consumer-facing brand/unit of Ganesan
                Enterprises through which sarees and related products are
                offered for online purchase.
              </p>

              <p>
                References to "Mehaa Garments", "we", "us" or "our" in these
                Terms refer to Mehaa Garments and, where applicable, Ganesan
                Enterprises.
              </p>
            </div>
          </section>

          {/* 03 */}
          <section>
            <SectionNumber number="03" title="Eligibility & Customer Accounts" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                Customers are required to create an account to complete a
                purchase through the website.
              </p>

              <p>
                When creating an account, you agree to provide accurate,
                current and complete information. You are responsible for
                maintaining the accuracy of your account information.
              </p>

              <p>
                You are also responsible for maintaining the confidentiality
                of your login credentials and for activities carried out
                through your account.
              </p>

              <p>
                If you believe that your account has been accessed without
                authorization, please contact us promptly.
              </p>
            </div>
          </section>

          {/* 04 */}
          <section>
            <SectionNumber number="04" title="Account Security" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                Customers should use strong and reasonably secure credentials
                and should not share passwords or authentication information
                with others.
              </p>

              <p>
                Mehaa Garments will not ask you to disclose your password, card
                PIN, UPI PIN, OTP or other confidential authentication
                credentials through WhatsApp, phone calls or unsolicited
                messages.
              </p>

              <p>
                We may take reasonable steps to protect accounts and the
                website against unauthorized access, misuse and fraudulent
                activity.
              </p>
            </div>
          </section>

          {/* 05 */}
          <section>
            <SectionNumber number="05" title="Products & Product Information" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                We make reasonable efforts to display product descriptions,
                images, colours, specifications and other information as
                accurately as possible.
              </p>

              <p>
                However, colours shown on digital screens may vary depending
                on the customer's device, display settings, lighting and other
                factors.
              </p>

              <p>
                Sarees and other textile products may also contain natural or
                manufacturing variations. Such variations may occur in
                texture, weave, print, colour or finish and do not necessarily
                indicate a defect.
              </p>

              <p>
                Product availability may change without prior notice. We
                reserve the right to correct genuine product, pricing,
                availability or description errors.
              </p>
            </div>
          </section>

          {/* 06 */}
          <section>
            <SectionNumber number="06" title="Pricing & Taxes" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                Product prices displayed on the website are shown in Indian
                Rupees (INR), unless otherwise stated.
              </p>

              <p>
                Applicable taxes, charges or other amounts, where required,
                will be reflected during the purchasing process.
              </p>

              <p>
                Product prices may be changed at any time. A price change will
                not affect an order that has already been accepted and
                confirmed, except where correction of an obvious pricing or
                technical error is required.
              </p>
            </div>
          </section>

          {/* 07 */}
          <section>
            <SectionNumber number="07" title="Orders & Order Acceptance" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                Adding a product to your cart does not guarantee that the
                product will remain available until checkout.
              </p>

              <p>
                When you place an order, you are making a request to purchase
                the selected products under the applicable terms.
              </p>

              <p>
                An order may be accepted, declined or cancelled in situations
                including product unavailability, pricing or listing errors,
                suspected fraudulent activity, payment issues or circumstances
                beyond our reasonable control.
              </p>

              <p>
                Where an accepted order cannot be fulfilled and payment has
                already been received, the applicable amount will be refunded
                in accordance with our Refund & Cancellation Policy.
              </p>
            </div>
          </section>

          {/* 08 */}
          <section>
            <SectionNumber number="08" title="Payment Methods" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                Depending on availability at checkout, Mehaa Garments may
                provide payment options such as credit/debit cards, UPI,
                net banking, Cash on Delivery and other payment methods
                supported by our payment service providers.
              </p>

              <p>
                Payment processing may be handled by third-party payment
                service providers. Their applicable terms and security
                processes may also apply.
              </p>

              <p>
                Customers must provide accurate payment information and must
                not use payment instruments without authorization.
              </p>
            </div>
          </section>

          {/* 09 */}
          <section>
            <SectionNumber number="09" title="Cash on Delivery" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                Cash on Delivery (COD) may be available for eligible
                locations, products and orders.
              </p>

              <p>
                COD availability may depend on delivery location, order value,
                serviceability and other operational factors.
              </p>

              <p>
                We may restrict or decline COD orders where there is a history
                of repeated non-delivery, refused orders, suspected misuse or
                other legitimate operational concerns.
              </p>
            </div>
          </section>

          {/* 10 */}
          <section>
            <SectionNumber number="10" title="Shipping & Delivery" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                Mehaa Garments currently offers shipping within India. Standard
                shipping is provided free of charge unless a specific product
                or promotional condition states otherwise.
              </p>

              <p>
                Orders are generally processed and dispatched within
                <strong className="text-black/80"> 1–2 business days</strong>.
              </p>

              <p>
                After dispatch, estimated delivery is generally:
              </p>

              <ul className="space-y-3 pl-5 list-disc">
                <li>
                  Tamil Nadu: approximately 2–4 days after dispatch.
                </li>
                <li>
                  Other Indian states: approximately 3–7 days after dispatch.
                </li>
              </ul>

              <p>
                Delivery timelines are estimates and may be affected by
                courier operations, weather, public holidays, remote
                locations, incorrect address information, unforeseen events or
                other circumstances outside our reasonable control.
              </p>

              <p>
                For complete details, please refer to our{" "}
                <Link
                  to="/shipping-policy"
                  className="text-black underline underline-offset-4"
                >
                  Shipping Policy
                </Link>
                .
              </p>
            </div>
          </section>

          {/* 11 */}
          <section>
            <SectionNumber number="11" title="Returns & Refunds" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                Our return policy is limited to eligible product issues. A
                return request must generally be reported within
                <strong className="text-black/80"> 5 days of delivery</strong>.
              </p>

              <p>
                Eligible returns may include genuine product damage or
                qualifying colour-fade issues, subject to verification.
              </p>

              <p>
                Returns are generally not accepted for change of mind,
                preference, incorrect selection, normal textile variation or
                products that have been used, washed, altered or damaged after
                delivery.
              </p>

              <p>
                Eligible sale, clearance and promotional products may be
                excluded from returns, subject to applicable law.
              </p>

              <p>
                For complete eligibility requirements and refund procedures,
                please refer to our{" "}
                <Link
                  to="/refund-policy"
                  className="text-black underline underline-offset-4"
                >
                  Refund & Cancellation Policy
                </Link>
                .
              </p>
            </div>
          </section>

          {/* 12 */}
          <section>
            <SectionNumber number="12" title="No Exchange Policy" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                Mehaa Garments does not currently offer product exchanges.
              </p>

              <p>
                Where a product qualifies for a return under our applicable
                return policy, the eligible return and refund process will
                apply instead of an exchange.
              </p>

              <p>
                This policy does not limit any consumer rights or remedies that
                cannot lawfully be excluded under applicable law.
              </p>
            </div>
          </section>

          {/* 13 */}
          <section>
            <SectionNumber number="13" title="Custom Orders" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                Mehaa Garments may accept selected custom orders, particularly
                for Pattu sarees and blouses featuring Aari work.
              </p>

              <p>
                Custom orders may involve personalized specifications,
                measurements, colours, designs or workmanship requirements.
              </p>

              <p>
                Customers should carefully confirm all customization details
                before the order is finalized.
              </p>

              <p>
                Because customized products are prepared according to customer
                requirements, cancellation, return or refund availability may
                differ from standard products, subject to applicable law and
                the specific order terms communicated before confirmation.
              </p>
            </div>
          </section>

          {/* 14 */}
          <section>
            <SectionNumber number="14" title="Customer Reviews & Photos" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                Customers may submit ratings, reviews, comments and photographs
                relating to products purchased through Mehaa Garments.
              </p>

              <p>
                By submitting content, you represent that you have the
                necessary rights and permissions to submit that content and
                that your submission does not unlawfully infringe another
                person's intellectual property, privacy, publicity or other
                rights.
              </p>

              <p>
                You should not upload photographs containing another person
                unless you have the appropriate permission to share and publish
                the photograph.
              </p>

              <p>
                By submitting a review or photograph, you grant Mehaa Garments
                a non-exclusive, royalty-free, worldwide permission to host,
                reproduce, display and use that submitted content for
                operating, presenting and promoting the Mehaa Garments
                website, products and customer reviews, subject to applicable
                law.
              </p>

              <p>
                We may moderate, reject, remove or decline to publish submitted
                content that is unlawful, misleading, abusive, offensive,
                irrelevant, fraudulent, defamatory, infringing or otherwise
                inconsistent with our website standards.
              </p>

              <p>
                Customer reviews represent the views of the submitting
                customer and do not necessarily represent the views of Mehaa
                Garments.
              </p>
            </div>
          </section>

          {/* 15 */}
          <section>
            <SectionNumber number="15" title="Intellectual Property" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                Unless otherwise stated, the website and its contents,
                including logos, branding, product descriptions, photographs,
                graphics, layouts, text, design elements and other materials,
                are owned by or used by Mehaa Garments and/or Ganesan
                Enterprises with appropriate rights.
              </p>

              <p>
                You may use the website for personal and lawful shopping
                purposes. You must not copy, reproduce, modify, distribute,
                publish, sell, exploit or commercially use website content
                without appropriate authorization.
              </p>

              <p>
                Mehaa Garments and Ganesan Enterprises reserve all rights not
                expressly granted under these Terms.
              </p>
            </div>
          </section>

          {/* 16 */}
          <section>
            <SectionNumber number="16" title="Website Use" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                You agree to use the website only for lawful purposes and in a
                manner that does not interfere with the website, its security,
                availability or operation.
              </p>

              <p>You must not:</p>

              <ul className="space-y-3 pl-5 list-disc">
                <li>
                  Attempt to gain unauthorized access to accounts, systems or
                  restricted areas.
                </li>
                <li>
                  Introduce malicious code, viruses or other harmful material.
                </li>
                <li>
                  Use the website for fraudulent or unlawful transactions.
                </li>
                <li>
                  Scrape, copy or systematically collect website content
                  without permission.
                </li>
                <li>
                  Misuse promotional offers, referral benefits or other
                  website features.
                </li>
                <li>
                  Submit false, misleading, abusive or unlawful information.
                </li>
              </ul>
            </div>
          </section>

          {/* 17 */}
          <section>
            <SectionNumber number="17" title="Prohibited Activities" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                We may take reasonable action, including restricting or
                suspending an account or cancelling an order, where we
                reasonably believe that the website or services are being used
                for fraud, abuse, unlawful activity, payment misuse, repeated
                order abuse or other prohibited conduct.
              </p>

              <p>
                Any action taken under this section will remain subject to
                applicable law and the customer's lawful rights.
              </p>
            </div>
          </section>

          {/* 18 */}
          <section>
            <SectionNumber
              number="18"
              title="Third-Party Services & Payment Providers"
            />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                Our website may rely on third-party service providers for
                payment processing, shipping, cloud services, communications,
                analytics, authentication and other operational functions.
              </p>

              <p>
                These third parties may process information as necessary to
                provide their respective services and may have their own terms
                and privacy practices.
              </p>

              <p>
                Mehaa Garments is not responsible for independent services or
                websites operated by third parties, except to the extent
                required by applicable law.
              </p>
            </div>
          </section>

          {/* 19 */}
          <section>
            <SectionNumber number="19" title="Limitation of Liability" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                We take reasonable steps to operate the website and provide
                products and services reliably. However, the website may
                occasionally be unavailable because of maintenance, technical
                issues, network failures, service-provider issues or events
                beyond our reasonable control.
              </p>

              <p>
                To the extent permitted by applicable law, Mehaa Garments and
                Ganesan Enterprises will not be responsible for losses that
                arise solely from circumstances beyond our reasonable control.
              </p>

              <p>
                Nothing in these Terms is intended to exclude or limit any
                liability, consumer right or remedy that cannot lawfully be
                excluded or limited under applicable law.
              </p>
            </div>
          </section>

          {/* 20 */}
          <section>
            <SectionNumber number="20" title="Changes to These Terms" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                We may update these Terms & Conditions from time to time to
                reflect changes to our services, business practices, legal
                requirements or website functionality.
              </p>

              <p>
                Updated Terms will be published on this page with a revised
                "Last updated" date.
              </p>

              <p>
                Your continued use of the website after an updated version is
                published constitutes acceptance of the updated Terms to the
                extent permitted by applicable law.
              </p>
            </div>
          </section>

          {/* 21 */}
          <section>
            <SectionNumber number="21" title="Governing Law & Jurisdiction" />

            <div className="space-y-5 text-sm text-black/60 leading-8">
              <p>
                These Terms & Conditions are intended to be governed by the
                applicable laws of India.
              </p>

              <p>
                Subject to applicable law and any mandatory consumer dispute
                resolution rights, courts having appropriate jurisdiction in
                Villupuram, Tamil Nadu may have jurisdiction over disputes
                arising in connection with these Terms or the services.
              </p>

              <p>
                Nothing in this section prevents a consumer from exercising
                any mandatory legal right or remedy available under applicable
                law.
              </p>
            </div>
          </section>

          {/* 22 */}
          <section>
            <SectionNumber number="22" title="Contact Information" />

            <div className="bg-white rounded-3xl border border-black/5 p-7 sm:p-9">
              <p className="text-[10px] uppercase tracking-[0.25em] text-black/40 mb-5">
                Mehaa Garments
              </p>

              <h3 className="font-serif text-2xl sm:text-3xl">
                A unit of Ganesan Enterprises
              </h3>

              <div className="mt-7 space-y-3 text-sm text-black/55 leading-7">
                <p>
                  No. 48, First Floor,
                  <br />
                  Kalangnar Karunanithi Street,
                  <br />
                  Salamedu,
                  <br />
                  Villupuram, Tamil Nadu – 605401,
                  <br />
                  India.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-7">
                <Link
                  to="/contact-us"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#111111] text-white text-xs uppercase tracking-[0.15em] hover:bg-black/80 transition"
                >
                  Contact Us
                  <ArrowUpRight size={14} />
                </Link>

                <Link
                  to="/privacy-policy"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-black/10 bg-[#f7f5f2] text-black text-xs uppercase tracking-[0.15em] hover:bg-white transition"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-black/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 lg:py-20">
          <div className="bg-[#111111] rounded-4xl px-7 sm:px-10 lg:px-14 py-12 lg:py-16 text-white">
            <div className="max-w-3xl">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-5">
                Shop with confidence
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight">
                Thoughtfully chosen sarees,
                <br />
                <span className="text-white/45">made for beautiful moments.</span>
              </h2>

              <p className="text-sm text-white/45 leading-7 max-w-xl mt-6">
                Explore the Mehaa Garments collection and discover sarees
                created to bring timeless elegance to every occasion.
              </p>

              <Link
                to="/shop"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3.5 rounded-full bg-white text-black text-xs uppercase tracking-[0.15em] hover:bg-white/90 transition"
              >
                Explore Collection
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const SectionNumber = ({ number, title }) => {
  return (
    <div className="flex items-start gap-5 mb-7">
      <span className="text-[10px] tracking-[0.2em] text-black/30 pt-2">
        {number}
      </span>

      <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal leading-tight">
        {title}
      </h2>
    </div>
  );
};

export default TermsConditions;