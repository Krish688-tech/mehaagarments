import { useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reels = [
  {
    video:
      "https://res.cloudinary.com/dkp7rlfq4/video/upload/q_auto,w_720,vc_auto/Video01_eolbyq.mp4",
    title: "Maheshwari Saree",
    desc: "Elegant handcrafted cotton saree with rich texture",
    slug: "cotton-elegance",
  },
  {
    video:
      "https://res.cloudinary.com/dkp7rlfq4/video/upload/q_auto,w_720,vc_auto/Video3_prr64u.mp4",
    title: "Silk Classic",
    desc: "Premium silk saree for festive occasions",
    slug: "silk-heritage",
  },
  {
    video:
      "https://res.cloudinary.com/dkp7rlfq4/video/upload/q_auto,w_720,vc_auto/Video04_kyt20y.mp4",
    title: "Soft Cotton",
    desc: "Lightweight saree for daily comfort",
    slug: "festive-glow",
  },
  {
    video:
      "https://res.cloudinary.com/dkp7rlfq4/video/upload/q_auto,w_720,vc_auto/Video02_o5ur3k.mp4",
    title: "Royal Pattu",
    desc: "Traditional bridal collection",
    slug: "royal-weaves",
  },
  {
    video:
      "https://res.cloudinary.com/dkp7rlfq4/video/upload/q_auto,w_720,vc_auto/Video03_qukffd.mp4",
    title: "Modern Drape",
    desc: "Fusion of modern and ethnic style",
    slug: "modern-tradition",
  },
];

const ReelScroll = () => {
  const sectionRef = useRef(null);
  const slidesRef = useRef([]);
  const videoRefs = useRef([]);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {
      const slides = slidesRef.current.filter(Boolean);

      if (!slides.length) return;

      const HOLD_DURATION = 2.2;
      const TRANSITION_DURATION = 1;

      slides.forEach((slide, i) => {
        if (i !== 0) {
          gsap.set(slide, {
            yPercent: 100,
            opacity: 0,
          });
        }
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${slides.length * 180}%`,
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Hold the first reel before moving to the second
      tl.to(
        {},
        {
          duration: HOLD_DURATION,
        },
      );

      slides.forEach((slide, i) => {
        if (i === 0) return;

        // Transition to next reel
        tl.to(slide, {
          yPercent: 0,
          opacity: 1,
          duration: TRANSITION_DURATION,
          ease: "power3.out",
        });

        // Play only the current reel
        tl.call(() => {
          videoRefs.current.forEach((video, index) => {
            if (!video) return;

            if (index === i) {
              if (video.paused) {
                const promise = video.play();

                if (promise) {
                  promise.catch(() => {});
                }
              }
            } else {
              video.pause();
            }
          });
        });

        // Hold the current reel before the next transition
        tl.to(
          {},
          {
            duration: HOLD_DURATION,
          },
        );
      });

      // Play first reel immediately
      const firstVideo = videoRefs.current[0];

      if (firstVideo) {
        const promise = firstVideo.play();

        if (promise) {
          promise.catch(() => {});
        }
      }
    }, section);

    return () => {
      videoRefs.current.forEach((video) => {
        if (video) {
          video.pause();
        }
      });

      ctx.revert();
    };
  }, []);

  return (
    <div className="w-full bg-white">
      {/* ==========================================
          CREATIVE SPACE / REELS INTRO
      ========================================== */}

      <section className="relative flex min-h-[55vh] items-center justify-center overflow-hidden bg-white px-6 py-24 md:min-h-[60vh]">
        <div className="absolute left-1/2 top-0 h-20 w-px -translate-x-1/2 bg-black/10 md:h-28" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.45em] text-gray-400 md:text-xs">
            The Mehaa Reels
          </p>

          <h2 className="text-4xl font-light leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-7xl">
            Sarees in Motion
          </h2>

          <div className="mx-auto mt-6 h-px w-12 bg-gray-300 md:mt-8 md:w-16" />

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-gray-500 md:mt-8 md:text-base md:leading-8">
            Discover the details, textures and beauty behind every drape. A
            closer look at the sarees that define Mehaa Garments.
          </p>
        </div>

        <div className="absolute bottom-0 left-1/2 h-16 w-px -translate-x-1/2 bg-black/10 md:h-20" />
      </section>

      {/* ==========================================
          REEL SCROLL SECTION
      ========================================== */}

      <section
        ref={sectionRef}
        className="relative z-20 isolate h-screen w-full overflow-hidden bg-black"
      >
        {reels.map((item, i) => (
          <div
            key={item.title}
            ref={(el) => {
              slidesRef.current[i] = el;
            }}
            onClick={() => navigate(`/collections/${item.slug}`)}
            className="absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center"
            style={{ zIndex: i }}
          >
            {/* VIDEO */}

            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              src={item.video}
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* DARK OVERLAY */}

            <div className="absolute inset-0 bg-black/40" />

            {/* CONTENT */}

            <div className="relative z-10 max-w-2xl px-6 text-center text-white md:px-10">
              <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-white/70 md:text-xs">
                Mehaa Garments
              </p>

              <h2 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-6xl">
                {item.title}
              </h2>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/80 sm:text-base md:text-lg md:leading-8">
                {item.desc}
              </p>

              <p className="mt-3 text-xs uppercase tracking-[0.25em] text-white/50 md:text-sm">
                From Mehaa Garments
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/collections/${item.slug}`);
                }}
                className="mt-7 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-black transition-all duration-500 hover:gap-5 hover:bg-white/90 sm:px-7 sm:py-3.5 sm:text-sm"
              >
                Buy Now
                <span className="text-base">→</span>
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default ReelScroll;
