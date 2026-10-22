
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const reels = [
  {
    video:
      
       "https://res.cloudinary.com/dkp7rlfq4/video/upload/q_auto,w_720,vc_auto/Video3_prr64u.mp4",
    title: "Cotton Elegance",
    desc: "Elegant handcrafted cotton saree with rich texture.",
    slug: "cotton-elegance",
    number: "01",
    label: "TIMELESS CRAFT",
  },
  {
    video:
     "https://res.cloudinary.com/dkp7rlfq4/video/upload/v1792655469/Silk_heritage_gf6jrw.mp4",
    title: "Silk Heritage",
    desc: "Premium silk saree for festive occasions.",
    slug: "silk-heritage",
    number: "02",
    label: "SILK STORIES",
  },
  {
    video:
      "https://res.cloudinary.com/dkp7rlfq4/video/upload/v1792658857/festive_glow_aovuzv.mp4",
    title: "Festive Glow",
    desc: "Lightweight saree for everyday comfort.",
    slug: "festive-glow",
    number: "03",
    label: "EVERYDAY GRACE",
  },
  {
    video:
      "https://res.cloudinary.com/dkp7rlfq4/video/upload/v1792663883/mehaa_garments_royal_weaves_hcdxqd.mp4",
    title: "Royal Weaves",
    desc: "Traditional elegance for your most special moments.",
    slug: "royal-weaves",
    number: "04",
    label: "ROYAL TRADITION",
  },
  {
    video:
      "https://res.cloudinary.com/dkp7rlfq4/video/upload/q_auto,w_720,vc_auto/Video01_eolbyq.mp4",
    title: "Modern Drape",
    desc: "Contemporary styling rooted in Indian tradition.",
    slug: "modern-tradition",
    number: "05",
    label: "A MODERN CLASSIC",
  },
];

const ReelCard = ({ item, index, registerVideo, onNavigate }) => {
  const cardRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const video = videoRef.current;

    if (!card || !video) return;

    registerVideo(index, video);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // The browser may block autoplay due to device settings.
          });
        } else {
          video.pause();
        }
      },
      {
        threshold: 0.35,
      },
    );

    observer.observe(card);

    return () => {
      observer.disconnect();
      video.pause();
      registerVideo(index, null);
    };
  }, [index, registerVideo]);

  return (
    <article ref={cardRef} className="group min-w-0">
      <button
        type="button"
        onClick={() => onNavigate(item.slug)}
        aria-label={`Explore ${item.title} collection`}
        className="relative block w-full overflow-hidden rounded-md bg-[#e9e1d6] text-left focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-[#8b7355]"
      >
        <div className="relative aspect-3/4 w-full overflow-hidden">
          <video
            ref={videoRef}
            src={item.video}
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            aria-label={item.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
          />

          {/* Cinematic overlay */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/5 to-black/20" />

          {/* Editorial category label */}
          <div className="pointer-events-none absolute left-4 top-5 flex items-center gap-2 sm:left-5 sm:top-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e8d5ae]" />
            <span className="text-[9px] font-medium tracking-[0.22em] text-white sm:text-[10px]">
              {item.label}
            </span>
          </div>

          {/* Film details */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
            <p className="mb-2 text-[9px] tracking-[0.25em] text-white/75 sm:text-[10px]">
              MEHAA GARMENTS
            </p>

            <h3 className="font-serif text-2xl font-normal leading-tight sm:text-3xl">
              {item.title}
            </h3>

            <p className="mt-2 max-w-60 text-xs leading-5 text-white/85 sm:text-sm sm:leading-6">
              {item.desc}
            </p>

            <div className="mt-5 flex items-center justify-between border-t border-white/35 pt-3">
              <span className="text-[9px] tracking-[0.2em] sm:text-[10px]">
                DISCOVER THE COLLECTION
              </span>

              <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Film footer */}
      <div className="flex items-center justify-between border-b border-[#dcd2c5] py-3">
        <span className="text-[10px] tracking-[0.2em] text-[#8a7968]">
          FILM NO. {item.number}
        </span>

        <button
          type="button"
          onClick={() => onNavigate(item.slug)}
          className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#4b3a2b] transition-colors hover:text-[#9a7652]"
        >
          Shop now ↗
        </button>
      </div>
    </article>
  );
};

const ReelsSection = () => {
  const navigate = useNavigate();
  const videosRef = useRef([]);

  const registerVideo = (index, video) => {
    videosRef.current[index] = video;
  };

  const handleNavigate = (slug) => {
    videosRef.current.forEach((video) => {
      if (video) video.pause();
    });

    navigate(`/collections/${slug}`);
  };

  return (
    <section className="overflow-hidden bg-[#faf9f7] px-4 py-14 sm:px-6 sm:py-16 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-360">
        {/* Centered editorial heading */}
        <header className="mx-auto mb-10 max-w-4xl text-center sm:mb-12 lg:mb-14">
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="h-px w-9 bg-[#9b8062]" />

            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#8b7355]">
              The Mehaa Reels
            </p>

            <span className="h-px w-9 bg-[#9b8062]" />
          </div>

          <h2 className="font-light tracking-[-0.035em] text-[#1d1d1d] text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
            Sarees in Motion
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#786d62] sm:mt-4 sm:text-base sm:leading-7">
            Discover the colours, textures and craftsmanship behind every
            beautiful drape.
          </p>

          {/* Supporting title stays centered on desktop and mobile */}
          {/**<div className="mt-6 border-t border-[#dfd5c9] pt-5 sm:mt-7 sm:pt-6">
            <h3 className="font-serif text-3xl font-normal leading-[1.08] tracking-[-0.035em] text-[#30261f] sm:text-4xl lg:text-5xl">
              Every Drape
              <br />
              <span className="italic text-[#967a5c]">
                Tells a Story.
              </span>
            </h3>

            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="font-serif text-2xl italic text-[#967a5c]">
                05
              </span>

              <span className="h-7 w-px bg-[#d7cbbc]" />

              <span className="text-left text-[9px] uppercase leading-5 tracking-[0.2em] text-[#786d62]">
                Fashion Films
                <br />
                By Mehaa
              </span>
            </div>
          </div>**/}
        </header>

        {/* Responsive video gallery */}
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-12">
          {reels.map((item, index) => (
            <ReelCard
              key={item.slug}
              item={item}
              index={index}
              registerVideo={registerVideo}
              onNavigate={handleNavigate}
            />
          ))}
        </div>

        {/* Closing editorial line */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[#dcd2c5] pt-6 sm:mt-16 sm:flex-row sm:items-center lg:mt-20">
          <p className="font-serif text-lg italic text-[#786d62]">
            Tradition, beautifully in motion.
          </p>

          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="inline-flex items-center gap-3 border-b border-[#8b7355] pb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#4b3a2b] transition-colors hover:text-[#9a7652]"
          >
            Explore all collections
            <span className="text-base">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReelsSection;
