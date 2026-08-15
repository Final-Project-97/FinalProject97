import FloatAI from "../components/FloatAI";
import Hero from "../components/Hero";
import Product360 from "../components/Product360";
import Stats from "../components/Stasts";

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
