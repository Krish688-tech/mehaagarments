import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Clock3,
} from "lucide-react";

import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";

const ContactUs = () => {
  const whatsappNumber = "919999999999";

  const whatsappMessage = encodeURIComponent(
    "Hello Mehaa Garments, I would like to know more about your sarees."
  );

  return (
    <main className="bg-[#f7f5f2] text-[#171717]">
      {/* Hero */}
      <section className="pt-32 sm:pt-36 lg:pt-40 pb-20 px-5 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-gray-500 mb-6">
              Get In Touch
            </p>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-8xl leading-[0.95] font-normal tracking-tight">
              We would love
              <br />
              <span className="text-gray-400">to hear from you.</span>
            </h1>

            <p className="max-w-2xl text-sm sm:text-base text-gray-500 leading-8 mt-8">
              Have a question about a saree, need help with an order, or
              looking for something special? Our team is here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="px-5 sm:px-8 lg:px-12 pb-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-5">
          {/* WhatsApp */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            className="group bg-[#171717] text-white rounded-4xl p-8 sm:p-10 min-h-75 flex flex-col justify-between hover:bg-[#222222] transition"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <MessageCircle size={21} />
              </div>

              <ArrowUpRight
                size={21}
                className="text-white/40 group-hover:text-white transition"
              />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-4">
                Fastest Response
              </p>

              <h2 className="font-serif text-3xl">
                Chat on WhatsApp
              </h2>

              <p className="text-sm text-white/50 leading-7 mt-4">
                Ask about products, orders, custom sarees or anything else.
                We are happy to help.
              </p>

              <p className="text-sm text-white/80 mt-6">
                Start a conversation →
              </p>
            </div>
          </a>

          {/* Phone */}
          <a
            href="tel:+919999999999"
            className="group bg-white border border-gray-200 rounded-4xl p-8 sm:p-10 min-h-75 flex flex-col justify-between hover:border-gray-400 transition"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-full bg-[#f7f5f2] flex items-center justify-center">
                <Phone size={19} />
              </div>

              <ArrowUpRight
                size={21}
                className="text-gray-300 group-hover:text-black transition"
              />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                Call Us
              </p>

              <h2 className="font-serif text-3xl">
                Speak with us
              </h2>

              <p className="text-sm text-gray-500 leading-7 mt-4">
                For product enquiries, order assistance and customer support,
                you can reach us by phone.
              </p>

              <p className="text-sm text-black mt-6">
                +91 99999 99999
              </p>
            </div>
          </a>

          {/* Email */}
          <div className="group bg-white border border-gray-200 rounded-4xl p-8 sm:p-10 min-h-75 flex flex-col justify-between">
            <div className="w-12 h-12 rounded-full bg-[#f7f5f2] flex items-center justify-center">
              <Mail size={19} />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-4">
                Email
              </p>

              <h2 className="font-serif text-3xl">
                Coming Soon
              </h2>

              <p className="text-sm text-gray-500 leading-7 mt-4">
                Our official business email will be available soon. Until
                then, please contact us through WhatsApp or phone.
              </p>

              <p className="text-sm text-gray-400 mt-6">
                Official email coming soon
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Information */}
      <section className="bg-white border-y border-gray-200 px-5 sm:px-8 lg:px-12 py-20 lg:py-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 lg:gap-24">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-5">
              Visit / Business Information
            </p>

            <h2 className="font-serif text-4xl sm:text-5xl leading-tight">
              Mehaa Garments
            </h2>

            <p className="text-sm text-gray-500 leading-7 max-w-xl mt-6">
              We are an India-based saree business offering carefully selected
              sarees for everyday elegance, festive occasions and special
              celebrations.
            </p>

            <div className="mt-9 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f7f5f2] flex items-center justify-center shrink-0">
                  <MapPin size={17} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                    Business Address
                  </p>

                  <p className="text-sm text-gray-600 leading-7 mt-2">
                    Your GST Registered Business Address
                    <br />
                    Tamil Nadu, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f7f5f2] flex items-center justify-center shrink-0">
                  <Phone size={17} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                    Phone / WhatsApp
                  </p>

                  <a
                    href="tel:+919999999999"
                    className="text-sm text-gray-600 mt-2 inline-block hover:text-black transition"
                  >
                    +91 99999 99999
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f7f5f2] flex items-center justify-center shrink-0">
                  <Clock3 size={17} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                    Customer Support
                  </p>

                  <p className="text-sm text-gray-600 leading-7 mt-2">
                    Monday – Saturday
                    <br />
                    Business hours via WhatsApp and phone
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div className="bg-[#f7f5f2] rounded-4xl p-8 sm:p-12 flex flex-col justify-center">
            <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center">
              <MessageCircle size={23} />
            </div>

            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mt-8">
              Need Personal Assistance?
            </p>

            <h2 className="font-serif text-4xl sm:text-5xl mt-4 leading-tight">
              Let us help you
              <br />
              find your saree.
            </h2>

            <p className="text-sm text-gray-500 leading-7 mt-6 max-w-md">
              Tell us what you are looking for, your preferred colour, fabric,
              occasion or budget. Our team can help you explore suitable
              options through WhatsApp.
            </p>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-3 mt-8 w-fit px-7 py-3.5 rounded-full bg-black text-white text-sm hover:bg-gray-800 transition"
            >
              Chat With Us
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Custom Orders */}
      <section className="px-5 sm:px-8 lg:px-12 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="border border-gray-200 rounded-4xl bg-white p-8 sm:p-12 lg:p-16">
            <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-5">
                  Custom Orders
                </p>

                <h2 className="font-serif text-4xl sm:text-5xl leading-tight">
                  Looking for something
                  <br />
                  made specially for you?
                </h2>

                <p className="text-sm text-gray-500 leading-7 max-w-2xl mt-6">
                  We accept selected custom orders for Pattu sarees and
                  blouses with Aari work. Share your requirements with us
                  through WhatsApp and our team will guide you through the
                  process.
                </p>
              </div>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  "Hello Mehaa Garments, I am interested in a custom Pattu saree / blouse with Aari work."
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-full bg-black text-white text-sm hover:bg-gray-800 transition whitespace-nowrap"
              >
                Discuss Custom Order
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Social */}
      <section className="px-5 sm:px-8 lg:px-12 pb-28">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-5">
            Follow Mehaa Garments
          </p>

          <h2 className="font-serif text-4xl sm:text-5xl">
            Stay connected with us.
          </h2>

          <div className="flex items-center justify-center gap-3 mt-8">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-black hover:text-white transition"
            >
              <FaInstagram size={18} />
            </a>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-black hover:text-white transition"
            >
              <FaFacebookF size={18} />
            </a>

            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-black hover:text-white transition"
            >
              <FaYoutube size={18} />
            </a>
          </div>

          <div className="mt-10">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 text-sm border-b border-black pb-2 hover:text-gray-500 hover:border-gray-400 transition"
            >
              Explore Our Sarees
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactUs;