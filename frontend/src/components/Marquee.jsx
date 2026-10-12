import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MarqueeScroll = () => {
  const sectionRef = useRef();
  const textRef = useRef();

  useEffect(() => {
    gsap.fromTo(
      textRef.current,
      { x: "40%" }, // start more to the right
      {
        x: "-60%", // move further left → faster visual movement
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6, // 🔥 smaller = faster response
        },
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className="overflow-hidden py-20">
      <div className="whitespace-nowrap">
        <h2
          ref={textRef}
          className="text-[70px] md:text-[140px] font-semibold text-gray-300 tracking-[0.15em]"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          MEHAA GARMENTS • COTTON SAREES • ELEGANT STYLE • MEHAA GARMENTS •
        </h2>
      </div>
    </section>
  );
};

export default MarqueeScroll;