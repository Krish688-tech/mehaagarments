import { Link } from "react-router-dom";
import { ArrowUpRight, Heart, Sparkles, ShieldCheck } from "lucide-react";

const AboutUs = () => {
  return (
    <main className="bg-[#f7f5f2] text-[#171717]">
      {/* Hero */}
      <section className="pt-32 sm:pt-36 lg:pt-40 pb-20 px-5 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-gray-500 mb-6">
              About Mehaa Garments
            </p>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-8xl leading-[0.95] font-normal tracking-tight">
              Where tradition
              <br />
              <span className="text-gray-400">meets elegance.</span>
            </h1>

            <p className="max-w-2xl text-sm sm:text-base text-gray-500 leading-8 mt-8">
              Mehaa Garments brings together the timeless beauty of Indian
              sarees with a thoughtfully curated shopping experience for the
              modern woman.
            </p>

            {/* Business Identity */}
            <div className="mt-8 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-white border border-black/10">
              <span className="w-1.5 h-1.5 rounded-full bg-black/40" />

              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-gray-500">
                A unit of Ganesan Enterprises
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="px-5 sm:px-8 lg:px-12 pb-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="aspect-4/5 rounded-4xl overflow-hidden bg-white">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85"
              alt="Traditional Indian saree"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="max-w-xl">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-5">
              Our Story
            </p>

            <h2 className="font-serif text-4xl sm:text-5xl leading-tight">
              Sarees that carry a story.
            </h2>

            <div className="space-y-5 mt-7 text-sm sm:text-base text-gray-500 leading-8">
              <p>
                <strong className="text-gray-800 font-medium">
                  Mehaa Garments is a unit of Ganesan Enterprises,
                </strong>{" "}
                bringing together a passion for Indian sarees and a thoughtful
                approach to online shopping. Based in Villupuram, Tamil Nadu,
                we are committed to making beautiful sarees accessible to
                customers across India.
              </p>

              <p>
                At Mehaa Garments, we believe a saree is more than a piece of
                clothing. It carries culture, craftsmanship, memories and the
                personality of the woman who wears it.
              </p>

              <p>
                Our collection is thoughtfully selected to bring together
                traditional Indian craftsmanship and contemporary elegance,
                making it easier to find a saree for every celebration,
                occasion and beautiful everyday moment.
              </p>

              <p>
                From graceful cotton sarees to rich silk and festive
                collections, every piece is chosen with attention to fabric,
                colour, craftsmanship and overall quality.
              </p>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-3 mt-8 px-6 py-3.5 rounded-full bg-black text-white text-sm hover:bg-gray-800 transition"
            >
              Explore Our Collection
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Business Information */}
      <section className="px-5 sm:px-8 lg:px-12 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-4xl p-8 sm:p-10 lg:p-12">
            <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-16 items-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-5">
                  Our Business
                </p>

                <h2 className="font-serif text-3xl sm:text-4xl leading-tight">
                  Mehaa Garments
                  <br />
                  <span className="text-gray-400">
                    A unit of Ganesan Enterprises.
                  </span>
                </h2>
              </div>

              <div className="lg:border-l lg:border-gray-200 lg:pl-16">
                <p className="text-sm text-gray-500 leading-7">
                  Mehaa Garments operates as a unit of Ganesan Enterprises,
                  with its business address in Villupuram, Tamil Nadu. We
                  serve customers across India through our online store,
                  offering thoughtfully selected sarees and selected custom
                  orders.
                </p>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">
                    Business Address
                  </p>

                  <p className="text-sm text-gray-600 leading-7">
                    No. 48, First Floor,
                    <br />
                    Kalangnar Karunanithi Street,
                    <br />
                    Salamedu, Villupuram,
                    <br />
                    Tamil Nadu – 605401, India.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white border-y border-gray-200 px-5 sm:px-8 lg:px-12 py-20 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-5">
              What We Believe
            </p>

            <h2 className="font-serif text-4xl sm:text-5xl">
              Thoughtful in every detail.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
            <div className="border-t border-gray-200 pt-7">
              <div className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center mb-6">
                <Sparkles size={18} />
              </div>

              <h3 className="font-serif text-2xl">Curated Elegance</h3>

              <p className="text-sm text-gray-500 leading-7 mt-4">
                We carefully select sarees that balance traditional beauty,
                quality fabrics and contemporary styling.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-7">
              <div className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center mb-6">
                <Heart size={18} />
              </div>

              <h3 className="font-serif text-2xl">Made for Moments</h3>

              <p className="text-sm text-gray-500 leading-7 mt-4">
                Whether it is a wedding, festival, family celebration or
                everyday occasion, we believe there is a saree for every
                memorable moment.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-7">
              <div className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center mb-6">
                <ShieldCheck size={18} />
              </div>

              <h3 className="font-serif text-2xl">Customer Trust</h3>

              <p className="text-sm text-gray-500 leading-7 mt-4">
                We strive to make every interaction transparent, personal and
                dependable, from selecting your saree to receiving it at your
                doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Orders */}
      <section className="px-5 sm:px-8 lg:px-12 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#171717] text-white rounded-4xl overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-12 lg:p-16">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6">
                  Custom Orders
                </p>

                <h2 className="font-serif text-4xl sm:text-5xl leading-tight">
                  Something made
                  <br />
                  especially for you.
                </h2>

                <p className="text-sm text-white/55 leading-7 mt-7 max-w-lg">
                  We also accept selected custom orders for Pattu sarees and
                  blouse designs with Aari work. Speak with our team through
                  WhatsApp to discuss your requirements and create something
                  personal.
                </p>

                <a
                  href="https://wa.me/919999999999"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 mt-8 px-6 py-3.5 rounded-full bg-white text-black text-sm hover:bg-white/90 transition"
                >
                  Talk to Us on WhatsApp
                  <ArrowUpRight size={16} />
                </a>
              </div>

              <div className="min-h-80 lg:min-h-full bg-white/5">
                <img
                  src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1200&q=85"
                  alt="Indian traditional saree craftsmanship"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="px-5 sm:px-8 lg:px-12 pb-28">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400 mb-6">
            Mehaa Garments
          </p>

          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight">
            Your occasion.
            <br />
            Your saree. Your story.
          </h2>

          <p className="text-sm text-gray-500 leading-7 max-w-xl mx-auto mt-6">
            Explore our collections and discover a saree that feels uniquely
            yours.
          </p>

          <Link
            to="/shop"
            className="inline-flex items-center gap-3 mt-8 px-7 py-3.5 rounded-full bg-black text-white text-sm hover:bg-gray-800 transition"
          >
            Shop Sarees
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;