import Navbar from "../components/Navbar";
import  Hero  from "../components/Hero";
import  Categories  from "../components/Categories";
import FeaturedProducts from "../components/FeaturedProducts";
import OurUnique from "../components/OurUnique";
import ReelsSection from "../components/ReelsSection";
import CustomPattuStudio from "../components/CustomPattuStudio";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Categories />
      <FeaturedProducts />
      <OurUnique />
      <ReelsSection />
      <CustomPattuStudio />
    </>
  );
}