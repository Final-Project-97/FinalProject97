import FloatAI from "../components/home/FloatAI";
import Hero from "../components/home/Hero";
import Product360 from "../components/home/Product360";
import Stats from "../components/home/Stasts";
import PreFooter from "../components/home/PreFooter";

export default function Home() {
  return (
    <div className="bg-[#0C0E16] min-h-screen">
      <Hero />
      <Stats />
      <Product360 />
      <PreFooter />
      <FloatAI />
    </div>
  );
}
