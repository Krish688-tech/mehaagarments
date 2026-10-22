import { useNavigate } from "react-router-dom";

const uniqueCategories = [
  {
    id: "cotton-elegance",
    image:
      "https://res.cloudinary.com/dkp7rlfq4/image/upload/v1792590401/Mehaa_garments_cotton_elegance_psscuk.jpg",
    slug: "cotton-elegance",
    title: "Cotton Elegance",
    description:
      "Lightweight sarees perfect for everyday comfort and graceful styling.",
  },
  {
    id: "silk-heritage",
    image:
      "https://res.cloudinary.com/dkp7rlfq4/image/upload/v1792688760/mehaa_garments_Golden_Portrait_in_Silk_Heritage_xe96pk.webp",
    slug: "silk-heritage",
    title: "Silk Heritage",
    description:
      "Rich silk sarees crafted for timeless celebrations and special occasions.",
  },
  {
    id: "festive-glow",
    image:
      "https://res.cloudinary.com/dkp7rlfq4/image/upload/v1792688760/mehaa_garments_South_Indian_Festive_Portrait_gdiblo.webp",
    slug: "festive-glow",
    title: "Festive Glow",
    description:
      "Vibrant sarees that bring colour, elegance and life to every occasion.",
  },
  {
    id: "modern-tradition",
    image:
      "https://res.cloudinary.com/dkp7rlfq4/image/upload/v1792688759/mehaa_garments_morden_tradition_ny6uid.webp",
    slug: "modern-tradition",
    title: "Modern Tradition",
    description:
      "Contemporary styles inspired by timeless Indian craftsmanship.",
  },
  {
    id: "royal-weaves",
    image:
      "https://res.cloudinary.com/dkp7rlfq4/image/upload/v1792688760/Mehaa_Garments_Royal_weaves_qmtecs.webp",
    slug: "royal-weaves",
    title: "Royal Weaves",
    description:
      "Premium handcrafted sarees featuring rich textures and intricate detailing.",
  },
];

export default function OurUnique() {
  const navigate = useNavigate();

  const handleCategoryClick = (slug) => {
    navigate(`/collections/${slug}`);
  };

  return (
    <section
      className="w-full bg-[#f8f5f0] px-4 py-12 text-[#29231f] sm:px-6 sm:py-16 lg:px-12 lg:py-20"
      aria-labelledby="mehaa-collections-title"
    >
      {/* SECTION INTRODUCTION */}
      <div className="mx-auto mb-9 max-w-375 text-center sm:mb-12">
        {/* Main heading */}
        <h2 className="mt-4 mb-5 text-4xl font-light tracking-[-0.03em] text-[#1d1d1d] md:text-6xl lg:text-7xl">
          Our Uniques
        </h2>

        {/* Eyebrow */}
        <p className="mb-5 flex items-center justify-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-[#9f3942] sm:text-xs sm:tracking-[0.35em]">
          <span className="h-px w-8 bg-[#9f3942]" />
          The Mehaa Collection Journal
          <span className="h-px w-8 bg-[#9f3942]" />
        </p>

        {/* Editorial title and description */}
        <div className="mx-auto grid grid-cols-1 justify-items-center gap-4 md:gap-5">
          <h2
            id="mehaa-collections-title"
            className="font-serif text-4xl font-normal leading-[1.12] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            A World of Sarees,
            <span className="mt-2 block italic text-[#a34249]">
              A Story of Elegance.
            </span>
          </h2>

          <p className="mx-auto max-w-lg text-sm leading-7 text-[#756c64] sm:text-base sm:leading-8">
            From everyday grace to unforgettable celebrations, discover
            collections that bring your personal style to life.
          </p>
        </div>

        {/* Curated by Mehaa */}
        <div className="mt-6 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.28em] text-[#9f3942]">
          <span className="h-px w-8 bg-[#a34249]" />
          Curated by Mehaa
          <span className="h-px w-8 bg-[#a34249]" />
        </div>
      </div>

      {/* STATIC COLLECTION GRID */}
      <div className="mx-auto grid max-w-400 grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-7">
        {uniqueCategories.map((category, index) => (
          <article
            key={category.id}
            className="flex min-w-0 flex-col border border-[#e7dfd5] bg-white"
          >
            {/* IMAGE */}
            <button
              type="button"
              onClick={() => handleCategoryClick(category.slug)}
              className="group relative block w-full cursor-pointer overflow-hidden bg-[#eee8df] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9f3942]"
              aria-label={`Explore ${category.title}`}
            >
              <div className="relative aspect-4/5 w-full overflow-hidden">
                <img
                  src={category.image}
                  alt={`${category.title} saree collection`}
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>

              <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-black/20 text-[10px] tracking-wider text-white">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="absolute bottom-4 left-4 text-[9px] uppercase tracking-[0.2em] text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.9)] sm:tracking-[0.25em]">
                The Art of Indian Elegance
              </span>
            </button>

            {/* COLLECTION DETAILS */}
            <div className="flex flex-1 flex-col p-5 sm:p-6 lg:p-7">
              <p className="mb-3 text-[9px] uppercase tracking-[0.28em] text-[#9f3942]">
                Mehaa Garments
              </p>

              <h3 className="font-serif text-2xl font-normal leading-tight sm:text-3xl">
                {category.title}
                <span className="text-[#a34249]">.</span>
              </h3>

              <p className="mt-3 text-xs leading-6 text-[#756c64] sm:text-sm sm:leading-7">
                {category.description}
              </p>

              <button
                type="button"
                onClick={() => handleCategoryClick(category.slug)}
                className="mt-6 flex w-full items-center justify-between gap-3 border-t border-[#e7dfd5] pt-4 text-left text-[9px] font-medium uppercase tracking-[0.17em] text-[#9f3942] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9f3942] sm:text-[10px] sm:tracking-[0.2em]"
              >
                <span>Discover Collection</span>
                <span className="text-lg" aria-hidden="true">
                  →
                </span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
