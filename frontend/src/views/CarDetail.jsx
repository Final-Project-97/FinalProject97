import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { PiArrowLeft, PiGasPump, PiGear, PiUsers } from "react-icons/pi";
import { getCarById } from "../api/cars";
import CarGallery from "../components/detail/CarGallery";
import CarInfo from "../components/detail/CarInfo";
import CarTabs from "../components/detail/CarTabs";
import CarActions from "../components/detail/CarActions";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function normalizeColors(car) {
  if (Array.isArray(car.colors) && car.colors.length > 0) {
    return car.colors.map((color) => typeof color === "string"
      ? { name: color, hexCode: "#64748b", imageUrl: car.thumbnailUrl, availability: "available" }
      : { ...color, imageUrl: color.imageUrl || car.thumbnailUrl });
  }
  return [{ name: "Standard", hexCode: "#64748b", imageUrl: car.thumbnailUrl, availability: "available" }];
}

export default function CarDetail() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    async function loadCar() {
      setIsLoading(true);
      setError("");
      try {
        const result = await getCarById(id);
        if (!result.data) throw new Error("Car not found.");
        const loadedCar = { ...result.data, colors: normalizeColors(result.data) };
        if (isActive) {
          setCar(loadedCar);
          setSelectedColor(loadedCar.colors[0]);
          setMainImage(loadedCar.colors[0].imageUrl || loadedCar.thumbnailUrl || "");
        }
      } catch (requestError) {
        if (isActive) setError(requestError.message || "Unable to load car details.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    }
    loadCar();
    return () => { isActive = false; };
  }, [id]);

  function handleColorChange(color) {
    setSelectedColor(color);
    setMainImage(color.imageUrl || car.thumbnailUrl || "");
  }

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-[#0C0E16] text-gray-400">Loading car details...</div>;
  if (error || !car) {
    return <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#0C0E16] px-4 text-center text-red-300"><p>{error || "Car not found."}</p><Link className="rounded-full bg-blue-600 px-5 py-2.5 font-semibold text-white" to="/catalog">Back to Catalog</Link></div>;
  }

  const specs = car.specs || {};
  const quickSpecs = [
    { icon: <PiUsers className="text-xl text-blue-400" />, label: "Capacity", value: `${specs.seats || "—"} Seats` },
    { icon: <PiGear className="text-xl text-blue-400" />, label: "Transmission", value: specs.transmission || "Not available" },
    { icon: <PiGasPump className="text-xl text-blue-400" />, label: "Engine & Fuel", value: [specs.engine, specs.fuelType].filter(Boolean).join(" · ") || "Not available" },
  ];
  const specsList = [
    { key: "Engine Model", value: specs.engine || "Not available" },
    { key: "Transmission Type", value: specs.transmission || "Not available" },
    { key: "Fuel Type", value: specs.fuelType || "Not available" },
    { key: "Seating Capacity", value: specs.seats ? `${specs.seats} Persons` : "Not available" },
    { key: "Body Type", value: car.type || "Not available" },
  ];

  return (
    <div className="min-h-screen bg-[#0C0E16] text-white py-8 lg:py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[350px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="mb-6"><Link className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white bg-[#141620] hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full transition-all" to="/catalog"><PiArrowLeft className="text-sm" /><span>Back to Catalog</span></Link></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-7"><CarGallery colors={car.colors} gallery={car.colors.map((color) => color.imageUrl).filter(Boolean)} image360Url={car.image360Url} mainImage={mainImage} onSelectColor={handleColorChange} onSelectImage={setMainImage} selectedColor={selectedColor} /></div>
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <CarInfo brand={car.brand} category={car.type} isTopProduct={car.isTopProduct} name={car.name} price={formatRupiah(car.basePrice)} priceNote="*Estimated OTR Jakarta. Monthly installments available." quickSpecs={quickSpecs} year={car.year || "2025"} />
            <CarTabs description={car.description || "No description is available for this car."} specs={specsList} />
            <CarActions carId={car._id} brand={car.brand} selectedColor={selectedColor?.name} tags={[`#${car.brand}`, `#${car.type}`, `#${car.name.replace(/\s+/g, "")}`].filter(Boolean)} />
          </div>
        </div>
      </div>
    </div>
  );
}
