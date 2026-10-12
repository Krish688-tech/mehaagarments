import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Truck,
  MapPin,
  Clock3,
  PackageCheck,
  IndianRupee,
  MessageCircle,
} from "lucide-react";

const ShippingPolicy = () => {
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
              Shipping
              <br />
              <span className="text-gray-400">Policy.</span>
            </h1>

            <p className="max-w-2xl text-sm sm:text-base text-gray-500 leading-8 mt-8">
              We want your Mehaa Garments order to reach you safely and on
              time. This policy explains our dispatch process, delivery
              timelines, shipping coverage and important delivery information.
            </p>

            <p className="text-xs text-gray-400 mt-6">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Shipping Highlights */}
      <section className="px-5 sm:px-8 lg:px-12 pb-16">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black text-white rounded-2xl p-6">
            <Truck size={21} />

            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 mt-5">
              Shipping
            </p>

            <h2 className="font-serif text-2xl mt-2">
              Free Across India
            </h2>

            <p className="text-xs text-white/50 leading-6 mt-3">
              We currently offer free standard shipping across India.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <Clock3 size={21} />

            <p className="text-[10px] uppercase tracking-[0.22em] text-gray-400 mt-5">
              Dispatch
            </p>

            <h2 className="font-serif text-2xl mt-2">
              1–2 Business Days
            </h2>

            <p className="text-xs text-gray-500 leading-6 mt-3">
              Orders are normally processed and dispatched within 1–2 business
              days.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <PackageCheck size={21} />

            <p className="text-[10px] uppercase tracking-[0.22em] text-gray-400 mt-5">
              Delivery
            </p>

            <h2 className="font-serif text-2xl mt-2">
              2–7 Days
            </h2>

            <p className="text-xs text-gray-500 leading-6 mt-3">
              Delivery time depends on the destination and logistics network.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <MapPin size={21} />

            <p className="text-[10px] uppercase tracking-[0.22em] text-gray-400 mt-5">
              Coverage
            </p>

            <h2 className="font-serif text-2xl mt-2">
              India Only
            </h2>

            <p className="text-xs text-gray-500 leading-6 mt-3">
              We currently ship only to addresses within India.
            </p>
          </div>
        </div>
      </section>

      {/* Delivery Estimate */}
      <section className="px-5 sm:px-8 lg:px-12 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-4xl overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-12 lg:p-16">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-5">
                  Delivery Timeline
                </p>

                <h2 className="font-serif text-4xl sm:text-5xl leading-tight">
                  From our hands
                  <br />
                  to your doorstep.
                </h2>

                <p className="text-sm text-gray-500 leading-7 mt-6 max-w-lg">
                  Once your order is confirmed, we prepare it for dispatch.
                  Delivery timelines begin after the order has been dispatched
                  and may vary depending on your location and the courier
                  network.
                </p>
              </div>

              <div className="bg-[#f7f5f2] p-8 sm:p-12 lg:p-16 flex items-center">
                <div className="w-full">
                  <div className="flex gap-5">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                      <span className="text-xs">01</span>
                    </div>

                    <div className="pb-10">
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                        Order Processing
                      </p>

                      <h3 className="font-serif text-2xl mt-2">
                        1–2 Business Days
                      </h3>

                      <p className="text-sm text-gray-500 leading-6 mt-2">
                        Your order is verified, packed and prepared for
                        dispatch.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5">
                    <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
                      <span className="text-xs">02</span>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                        Delivery
                      </p>

                      <h3 className="font-serif text-2xl mt-2">
                        2–7 Days
                      </h3>

                      <p className="text-sm text-gray-500 leading-6 mt-2">
                        Estimated delivery after dispatch, depending on your
                        location.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regional Delivery */}
      <section className="bg-white border-y border-gray-200 px-5 sm:px-8 lg:px-12 py-20 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-5">
              Estimated Delivery
            </p>

            <h2 className="font-serif text-4xl sm:text-5xl">
              Delivery across India.
            </h2>

            <p className="text-sm text-gray-500 leading-7 mt-5">
              The following are estimated standard delivery timelines after
              dispatch. Actual delivery may vary depending on the destination,
              courier operations, weather and other circumstances.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-[#f7f5f2] rounded-4xl p-8 sm:p-10">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center">
                  <MapPin size={18} />
                </div>

                <span className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  Tamil Nadu
                </span>
              </div>

              <h3 className="font-serif text-3xl mt-8">
                2–4 Days
              </h3>

              <p className="text-sm text-gray-500 leading-7 mt-3">
                Estimated standard delivery after your order has been
                dispatched.
              </p>
            </div>

            <div className="bg-[#f7f5f2] rounded-4xl p-8 sm:p-10">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center">
                  <MapPin size={18} />
                </div>

                <span className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  Other States
                </span>
              </div>

              <h3 className="font-serif text-3xl mt-8">
                3–7 Days
              </h3>

              <p className="text-sm text-gray-500 leading-7 mt-3">
                Estimated standard delivery after your order has been
                dispatched.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Charges */}
      <section className="px-5 sm:px-8 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-5">
              Shipping Charges
            </p>

            <h2 className="font-serif text-4xl sm:text-5xl leading-tight">
              Shipping is on us.
            </h2>

            <p className="text-sm text-gray-500 leading-7 mt-6 max-w-xl">
              Mehaa Garments currently provides free standard shipping across
              India. No separate standard shipping charge is added to eligible
              orders at checkout.
            </p>
          </div>

          <div className="bg-black text-white rounded-4xl p-8 sm:p-12">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <IndianRupee size={20} />
            </div>

            <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mt-7">
              Standard Shipping
            </p>

            <h3 className="font-serif text-5xl mt-3">
              ₹0
            </h3>

            <p className="text-sm text-white/50 leading-7 mt-4">
              Free standard shipping across India.
            </p>
          </div>
        </div>
      </section>

      {/* Important Information */}
      <section className="bg-white border-y border-gray-200 px-5 sm:px-8 lg:px-12 py-20 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-5">
            Important Information
          </p>

          <h2 className="font-serif text-4xl sm:text-5xl">
            Before your order arrives.
          </h2>

          <div className="mt-10 space-y-8">
            <div className="border-t border-gray-200 pt-7">
              <h3 className="font-serif text-2xl">
                1. Processing and Dispatch
              </h3>

              <p className="text-sm text-gray-500 leading-7 mt-3">
                Orders are generally processed and dispatched within 1–2
                business days after order confirmation and successful payment
                where applicable. Cash on Delivery orders may be subject to
                order verification before dispatch.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-7">
              <h3 className="font-serif text-2xl">
                2. Delivery Estimates
              </h3>

              <p className="text-sm text-gray-500 leading-7 mt-3">
                Delivery estimates are indicative and are calculated from the
                date of dispatch. Tamil Nadu orders generally take 2–4 days,
                while orders to other Indian states generally take 3–7 days.
                Certain locations may require additional time.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-7">
              <h3 className="font-serif text-2xl">
                3. Delays Beyond Our Control
              </h3>

              <p className="text-sm text-gray-500 leading-7 mt-3">
                Delivery may take longer because of circumstances outside our
                reasonable control, including severe weather, natural
                disasters, transportation disruptions, public holidays,
                strikes, government restrictions, courier delays or other
                unforeseen events.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-7">
              <h3 className="font-serif text-2xl">
                4. Incorrect Address or Contact Information
              </h3>

              <p className="text-sm text-gray-500 leading-7 mt-3">
                Customers are responsible for providing accurate name, mobile
                number and delivery address information. If an order cannot be
                delivered because of an incorrect or incomplete address,
                unavailable recipient or incorrect contact details, delivery
                may be delayed or the package may be returned to us.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-7">
              <h3 className="font-serif text-2xl">
                5. Delivery Attempts
              </h3>

              <p className="text-sm text-gray-500 leading-7 mt-3">
                Our logistics partner may make delivery attempts according to
                its operational procedures. Customers should remain available
                at the provided delivery address and respond to courier
                communications where necessary.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-7">
              <h3 className="font-serif text-2xl">
                6. Package Inspection
              </h3>

              <p className="text-sm text-gray-500 leading-7 mt-3">
                Customers are encouraged to check the outer package at the
                time of delivery. If the package appears visibly damaged,
                please document the condition with photographs or video where
                reasonably possible and contact Mehaa Garments promptly.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-7">
              <h3 className="font-serif text-2xl">
                7. Order Tracking
              </h3>

              <p className="text-sm text-gray-500 leading-7 mt-3">
                Where tracking information is available, we may provide
                shipment or tracking details through the website, order
                communication, email, SMS, WhatsApp or other available
                communication channels.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-7">
              <h3 className="font-serif text-2xl">
                8. India-Only Shipping
              </h3>

              <p className="text-sm text-gray-500 leading-7 mt-3">
                Mehaa Garments currently ships orders only to delivery
                addresses within India. We do not currently offer
                international shipping.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Orders */}
      <section className="px-5 sm:px-8 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#171717] text-white rounded-4xl p-8 sm:p-12 lg:p-16">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-5">
              Custom Orders
            </p>

            <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-end">
              <div>
                <h2 className="font-serif text-4xl sm:text-5xl leading-tight">
                  Made especially
                  <br />
                  for you.
                </h2>

                <p className="text-sm text-white/50 leading-7 max-w-2xl mt-6">
                  Mehaa Garments accepts selected custom orders for Pattu
                  sarees and blouses with Aari work. Custom orders may have
                  different preparation timelines, which will be communicated
                  to the customer before the order is confirmed.
                </p>
              </div>

              <a
                href={`https://wa.me/919999999999?text=${encodeURIComponent(
                  "Hello Mehaa Garments, I would like to enquire about a custom Pattu saree / blouse with Aari work."
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-full bg-white text-black text-sm hover:bg-white/90 transition whitespace-nowrap"
              >
                Enquire on WhatsApp
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="px-5 sm:px-8 lg:px-12 pb-28">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto">
            <MessageCircle size={21} />
          </div>

          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mt-7">
            Need Help?
          </p>

          <h2 className="font-serif text-4xl sm:text-5xl mt-4">
            We're here for you.
          </h2>

          <p className="text-sm text-gray-500 leading-7 max-w-xl mx-auto mt-5">
            If you have questions about your shipment, delivery address or
            order status, contact our customer support team.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-black text-white text-sm hover:bg-gray-800 transition"
            >
              WhatsApp Support
              <ArrowUpRight size={16} />
            </a>

            <Link
              to="/contact-us"
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full border border-gray-300 text-sm hover:border-black transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ShippingPolicy;