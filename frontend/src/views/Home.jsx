import FloatAI from "../components/home/FloatAI";
import Hero from "../components/home/Hero";
import Product360 from "../components/home/Product360";
import Stats from "../components/home/Stasts";

export default function Home() {
  return (
    <>
      <div className="bg-[#141620]">
        <Hero />
        <Stats />
        <Product360 />
        <FloatAI />
      </div>
    </>
  );
}
