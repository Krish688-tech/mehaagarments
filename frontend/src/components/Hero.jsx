import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const imageRef = useRef();
  const titleRef = useRef();
  const subtitleRef = useRef();
  const buttonRef = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    const tl = gsap.timeline();

    // Background zoom (initial intro)
    tl.fromTo(
      imageRef.current,
      { scale: 1.2 },
      { scale: 1, duration: 2, ease: "power3.out" }
    )
      .fromTo(
        titleRef.current,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 },
        "-=1.5"
      )
      .fromTo(
        subtitleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 },
        "-=0.8"
      )
      .fromTo(
        buttonRef.current,
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
        },
        "-=0.6"
      );
  }, []);

  return (
    <section
      id="home"
      className="h-screen flex items-center justify-center text-center relative overflow-hidden"
    >
      {/* Background Image */}
      <img
        ref={imageRef}
        src="https://res.cloudinary.com/dkp7rlfq4/image/upload/v1777964626/Mehaa_Garments_tkwlvf.png"
        alt="Saree"
        className="absolute w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute w-full h-full bg-linear-to-t from-black/70 via-black/30 to-transparent"></div>

      {/* Content */}
      <div className="relative text-white px-6">
        <h1
          ref={titleRef}
          className="text-5xl md:text-6xl font-bold leading-tight"
        >
          Elegance in Every Saree
        </h1>

        <p ref={subtitleRef} className="mt-4 text-lg md:text-xl">
          Discover timeless tradition with modern style
        </p>

        <button
          ref={buttonRef}
          onClick={() => navigate("/shop")}
          className="mt-8 px-8 py-3 bg-linear-to-t from-pink-400 via-pink-500 to-pink-600 text-white rounded-full font-medium transition transform hover:scale-105 shadow-lg cursor-pointer"
        >
          Explore Collection
        </button>
      </div>
    </section>
  );
};

export default Hero;