import { useEffect, useMemo, useState } from "react";
import CarCard from "../components/catalog/CarCard";
import { getCars } from "../api/cars";

export default function Catalog() {
   const [cars, setCars] = useState([]);
   const [selectedType, setSelectedType] = useState("All");
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState("");

   useEffect(() => {
      let isActive = true;
      async function loadCars() {
         try {
            const result = await getCars();
            if (isActive) setCars(result.data || []);
         } catch (requestError) {
            if (isActive) setError(requestError.message || "Unable to load the car catalog.");
         } finally {
            if (isActive) setIsLoading(false);
         }
      }
      loadCars();
      return () => { isActive = false; };
   }, []);

   const types = useMemo(
      () => ["All", ...new Set(cars.map((car) => car.type).filter(Boolean))],
      [cars],
   );
   const filteredCars = selectedType === "All"
      ? cars
      : cars.filter((car) => car.type?.toLowerCase() === selectedType.toLowerCase());

   return (
      <div className="min-h-screen bg-[#0C0E16] text-white py-8 sm:py-12 lg:py-16 relative overflow-hidden">
         <div className="absolute top-1/3 right-1/4 w-[450px] h-[350px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 pb-6 border-b border-white/10">
               <div>
                  <span className="text-gray-400 text-[11px] font-semibold tracking-widest uppercase">Vehicle Showcase</span>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-1">Explore Car Catalog</h1>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">Browse available models, compare specs, and find the perfect car.</p>
               </div>
               {!isLoading && !error && cars.length > 0 && (
                  <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                     <div className="flex items-center gap-1 bg-[#141620] p-1 rounded-full border border-white/10 w-max">
                        {types.map((type) => (
                           <button className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${selectedType === type ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:text-white"}`} key={type} onClick={() => setSelectedType(type)} type="button">{type}</button>
                        ))}
                     </div>
                  </div>
               )}
            </div>
            {isLoading && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Loading catalog">{[1, 2, 3].map((item) => <div className="h-[460px] animate-pulse rounded-2xl bg-white/5" key={item} />)}</div>}
            {!isLoading && error && <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-8 text-center text-red-200" role="alert">{error}</div>}
            {!isLoading && !error && filteredCars.length === 0 && <div className="rounded-2xl border border-dashed border-white/15 p-16 text-center text-gray-400">No active cars are available.</div>}
            {!isLoading && !error && filteredCars.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredCars.map((car) => <CarCard car={car} key={car._id || car.slug} />)}</div>}
         </div>
      </div>
   );
}
