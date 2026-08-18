import { useState } from "react";
import { Link, useParams } from "react-router";
import { PiArrowLeft, PiUsers, PiGear, PiGasPump } from "react-icons/pi";

import CarGallery from "../components/detail/CarGallery";
import CarInfo from "../components/detail/CarInfo";
import CarTabs from "../components/detail/CarTabs";
import CarActions from "../components/detail/CarActions";

// Manual Database (3 Mobil)
const CARS_DATABASE = {
  "honda-brio-rs": {
    id: "honda-brio-rs",
    name: "Honda Brio RS CVT",
    brand: "Honda",
    type: "Hatchback",
    basePrice: 263200000,
    description: "City car sporty paling laris di Indonesia, irit, lincah, dan resale value tinggi.",
    specs: {
      engine: "1.2L i-VTEC",
      transmission: "CVT Automatic",
      fuelType: "Gasoline",
      seats: 5,
    },
    isTopProduct: true,
    thumbnailUrl: "https://asset.honda-indonesia.com/colors/vaC7VxycnfrqhaHL48dKeYXptkRZE1oaFAP1SKli.png",
    colors: [
      {
        name: "Phoenix Orange Pearl Two Tone",
        hexCode: "#CC6633",
        imageUrl: "https://asset.honda-indonesia.com/colors/vaC7VxycnfrqhaHL48dKeYXptkRZE1oaFAP1SKli.png",
        availability: "available",
      },
      {
        name: "Electric Lime Metallic",
        hexCode: "#CBF418",
        imageUrl: "https://asset.honda-indonesia.com/colors/euqS00voL7Bf85GtPK8vkjFV1PzmzlGIMBKlOswi.png",
        availability: "available",
      },
      {
        name: "Stellar Diamond Pearl",
        hexCode: "#BBC8CD",
        imageUrl: "https://asset.honda-indonesia.com/colors/iah1dJwwvnafOFTmvHas68HJSFYYGZz7vZs7YzpK.png",
        availability: "available",
      },
      {
        name: "Meteoroid Gray Metallic",
        hexCode: "#828385",
        imageUrl: "https://asset.honda-indonesia.com/colors/Rpo6PzayZgX1ycKOM860d5OGLa4SlorgVvbiSQ3t.png",
        availability: "available",
      },
      {
        name: "Crystal Black Pearl",
        hexCode: "#383838",
        imageUrl: "https://asset.honda-indonesia.com/colors/H4SFMJltJu47ptl4YrqxZyQAI9gbY92GmIjqEMb4.png",
        availability: "available",
      },
    ],
    image360Url: "https://www.honda-indonesia.com/assets/3d/brio-color/index.html",
  },
  "toyota-avanza": {
    id: "toyota-avanza",
    name: "Toyota Avanza 1.5 G CVT",
    brand: "Toyota",
    type: "MPV",
    basePrice: 282100000,
    description: "MPV 7-seater sejuta umat dengan DNGA, irit, dan mudah dirawat di seluruh Indonesia.",
    specs: {
      engine: "1.5L 2NR-VE",
      transmission: "CVT",
      fuelType: "Gasoline",
      seats: 7,
    },
    isTopProduct: false,
    thumbnailUrl: "https://medias.auto2000.co.id/sys-master-hybrismedia/h66/h68/8831557468190/avanza-g-white_optimized.png",
    colors: [
      {
        name: "White",
        hexCode: "#F5F5F5",
        imageUrl: "https://medias.auto2000.co.id/sys-master-hybrismedia/h66/h68/8831557468190/avanza-g-white_optimized.png",
        availability: "available",
      },
      {
        name: "Silver Metallic",
        hexCode: "#C0C4C8",
        imageUrl: "https://medias.auto2000.co.id/sys-master-hybrismedia/ha6/h64/8831557337118/avanza-g-silver_optimized.png",
        availability: "available",
      },
      {
        name: "Black",
        hexCode: "#1A1A1A",
        imageUrl: "https://medias.auto2000.co.id/sys-master-hybrismedia/h25/h6c/8831557599262/avanza-g-black_optimized.png",
        availability: "available",
      },
    ],
  },
  "toyota-raize": {
    id: "toyota-raize",
    name: "Toyota Raize 1.0T G AT",
    brand: "Toyota",
    type: "SUV",
    basePrice: 277800000,
    description: "Compact SUV turbo 1.0L yang gesit di kota dengan opsi dua-tone sporty.",
    specs: {
      engine: "1.0L Turbo 1KR-VET",
      transmission: "Automatic",
      fuelType: "Gasoline",
      seats: 5,
    },
    isTopProduct: false,
    thumbnailUrl: "https://medias.auto2000.co.id/sys-master-hybrismedia/h19/h8d/8846828306462/raize_white%20(1).png",
    colors: [
      {
        name: "White Two Tone",
        hexCode: "#F2F2F0",
        imageUrl: "https://medias.auto2000.co.id/sys-master-hybrismedia/h19/h8d/8846828306462/raize_white%20(1).png",
        availability: "available",
      },
      {
        name: "Black Metallic",
        hexCode: "#1C1C1C",
        imageUrl: "https://medias.auto2000.co.id/sys-master-hybrismedia/h03/h51/8824194269214/Raize%20Black_Colour%20View.png",
        availability: "available",
      },
      {
        name: "Turmeric Yellow Two Tone",
        hexCode: "#E3B505",
        imageUrl: "https://medias.auto2000.co.id/sys-master-hybrismedia/h2c/h45/8824246468638/Yellow_cupblack_velgblack.png",
        availability: "limited",
      },
    ],
  },
};

export default function CarDetail() {
  const { id } = useParams();

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);

  // Ambil mobil berdasarkan ID URL (Fallback ke Brio RS)
  const currentCar = CARS_DATABASE[id] || CARS_DATABASE["honda-brio-rs"];
  const carId = CARS_DATABASE[id] ? id : "honda-brio-rs";

  const [selectedColor, setSelectedColor] = useState(currentCar.colors[0]);
  const [mainImage, setMainImage] = useState(currentCar.colors[0].imageUrl);

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setMainImage(color.imageUrl);
  };

  // Quick Specs
  const quickSpecs = [
    { icon: <PiUsers className="text-xl text-blue-400" />, label: "Capacity", value: `${currentCar.specs.seats} Seats` },
    { icon: <PiGear className="text-xl text-blue-400" />, label: "Transmission", value: currentCar.specs.transmission },
    { icon: <PiGasPump className="text-xl text-blue-400" />, label: "Engine & Fuel", value: `${currentCar.specs.engine} · ${currentCar.specs.fuelType}` },
  ];

  // Specs List
  const specsList = [
    { key: "Engine Model", value: currentCar.specs.engine },
    { key: "Transmission Type", value: currentCar.specs.transmission },
    { key: "Fuel Type", value: currentCar.specs.fuelType },
    { key: "Seating Capacity", value: `${currentCar.specs.seats} Persons` },
    { key: "Body Type", value: currentCar.type },
  ];

  return (
    <div className="min-h-screen bg-[#0C0E16] text-white py-8 lg:py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[350px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">

        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/cars"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white bg-[#141620] hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full transition-all"
          >
            <PiArrowLeft className="text-sm" />
            <span>Back to Catalog</span>
          </Link>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Gallery */}
          <div className="lg:col-span-7">
            <CarGallery
              colors={currentCar.colors}
              gallery={currentCar.colors.map((c) => c.imageUrl)}
              selectedColor={selectedColor}
              onSelectColor={handleColorChange}
              mainImage={mainImage}
              onSelectImage={setMainImage}
              image360Url={currentCar.image360Url}
            />
          </div>

          {/* Car Info & Actions */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <CarInfo
              category={currentCar.type}
              brand={currentCar.brand}
              year="2025"
              name={currentCar.name}
              price={formatRupiah(currentCar.basePrice)}
              priceNote="*Estimated OTR Jakarta. Monthly installments available."
              quickSpecs={quickSpecs}
            />

            <CarTabs
              description={currentCar.description}
              specs={specsList}
            />

            <CarActions
              carId={carId}
              tags={[`#${currentCar.brand}`, `#${currentCar.type}`, `#${currentCar.name.replace(/\s+/g, "")}`]}
            />
          </div>

        </div>

      </div>
    </div>
  );
}