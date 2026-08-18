import { useState } from "react";
import CarCard from "../components/catalog/CarCard";

// Manual Data
const DUMMY_CARS = [
   {
      id: "honda-brio-rs",
      name: "Honda Brio RS CVT",
      brand: "Honda",
      type: "Hatchback",
      basePrice: 263200000,
      thumbnailUrl: "https://asset.honda-indonesia.com/colors/vaC7VxycnfrqhaHL48dKeYXptkRZE1oaFAP1SKli.png",
      specs: {
         engine: "1.2L i-VTEC",
         transmission: "CVT",
         fuelType: "Gasoline",
         seats: 5,
      },
   },
   {
      id: "toyota-avanza",
      name: "Toyota Avanza 1.5 G CVT",
      brand: "Toyota",
      type: "MPV",
      basePrice: 282100000,
      thumbnailUrl: "https://medias.auto2000.co.id/sys-master-hybrismedia/h66/h68/8831557468190/avanza-g-white_optimized.png",
      specs: {
         engine: "1.5L 2NR-VE",
         transmission: "CVT",
         fuelType: "Gasoline",
         seats: 7,
      },
   },
   {
      id: "toyota-raize",
      name: "Toyota Raize 1.0T G AT",
      brand: "Toyota",
      type: "SUV",
      basePrice: 277800000,
      thumbnailUrl: "https://medias.auto2000.co.id/sys-master-hybrismedia/h19/h8d/8846828306462/raize_white%20(1).png",
      specs: {
         engine: "1.0L Turbo 1KR-VET",
         transmission: "Automatic",
         fuelType: "Gasoline",
         seats: 5,
      },
   },
];

export default function Catalog() {
   const [selectedBrand, setSelectedBrand] = useState("All");

   const filteredCars = selectedBrand === "All"
      ? DUMMY_CARS
      : DUMMY_CARS.filter((c) => c.brand === selectedBrand);

   return (
      <div className="min-h-screen bg-[#0C0E16] text-white py-10 lg:py-16 relative overflow-hidden">
         <div className="absolute top-1/3 right-1/4 w-[450px] h-[350px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/10">
               <div>
                  <span className="text-gray-400 text-xs font-semibold tracking-widest uppercase">
                     VEHICLE SHOWCASE
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                     Explore Car Catalog
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                     Browse available models, compare specs, and find the perfect car.
                  </p>
               </div>

               {/* Brand Filter */}
               <div className="flex items-center gap-1 bg-[#141620] p-1 rounded-full border border-white/10">
                  {["All", "Honda", "Toyota"].map((brand) => (
                     <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all cursor-pointer ${selectedBrand === brand
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-400 hover:text-white"
                           }`}
                     >
                        {brand}
                     </button>
                  ))}
               </div>
            </div>

            {/* Car Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredCars.map((car) => (
                  <CarCard key={car.id} car={car} />
               ))}
            </div>

         </div>
      </div>
   );
}