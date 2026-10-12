import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const BrandIntro = () => {
  const sectionRef = useRef();
  const imageRef = useRef();
  const textRef = useRef();
  const headingRef = useRef();
  const paraRef = useRef();


  useEffect(() => {
  const ctx = gsap.context(() => {
    // ✅ check text exists before splitting
    if (!textRef.current) return;

    const split = new SplitText(textRef.current, {
      type: "lines",
      linesClass: "line",
    });

    gsap.from(split.lines, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
      },
      y: 100,
      opacity: 0,
      stagger: 0.08,
      duration: 1.2,
      ease: "power4.out",
    });

    // ✅ image animation (moved inside useEffect)
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          scrub: true,
        },
        y: 50,
      });
    }

    // ✅ revert safely
    return () => split.revert();
  }, sectionRef);

  return () => ctx.revert();
}, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 px-6 overflow-hidden bg-white"
    >
      {/* Background Image */}
      <div className="absolute inset-0 flex justify-center items-center opacity-20">
        <img
          ref={imageRef}
          src="https://res.cloudinary.com/dkp7rlfq4/image/upload/v1778057804/Mehaa_Silk_Saree_pn00f2.jpg"
          alt="Mehaa Silk Saree"
          className="w-125 object-contain"
        />
      </div>

      {/* Text */}
      <div className="relative max-w-5xl mx-auto text-center">
        <p
          ref={textRef}
          className="text-2xl md:text-4xl leading-relaxed font-light text-gray-800"
        >
          ❝Mehaa Garments brings you timeless sarees crafted with elegance,
          blending tradition and modern design to celebrate every woman’s
          beauty❞
        </p>
      </div>
    </section>
  );
};

export default BrandIntro;
