import { useState } from "react";
import { Link } from "react-router";
import {
  PiSparkle,
  PiLightning,
  PiHeart,
  PiArrowRight,
  PiSpinner,
  PiCaretDown,
  PiCheck,
  PiMinus,
  PiPlus,
  PiInfo
} from "react-icons/pi";
import { toast } from "react-toastify";
import { getRecommendations } from "../../api/ai";
import { getCarById } from "../../api/cars";
import { addWishlist } from "../../api/wishlist";
import AiAccessPrompt from "../../components/shared/AiAccessPrompt";
import useAuth from "../../context/useAuth";

const needOptions = ["Family", "City Car", "SUV", "MPV", "Hatchback", "Sedan", "Business", "Adventure"];
const fuelOptions = ["All", "Gasoline", "Hybrid", "Electric (EV)", "Diesel"];
const colorOptions = ["White", "Black", "Silver", "Blue", "Red", "Gray"];
const priorities = [
  "Comfort",
  "Fuel efficiency",
  "Performance",
  "Safety",
  "Maintenance cost",
];

export default function Recommend() {
  const { isAuthenticated, updateAiTokens } = useAuth();

  // Form State
  const [form, setForm] = useState({
    budgetMin: 200000000,
    budgetMax: 700000000,
    needType: "Family",
    fuelType: "All",
    passengers: 5,
    priority: "",
    selectedColor: "",
  });

  // Dropdown Open States
  const [isNeedOpen, setIsNeedOpen] = useState(false);
  const [isFuelOpen, setIsFuelOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  const [recommendations, setRecommendations] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginRequired, setLoginRequired] = useState(false);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  // Format Currency IDR
  const formatPrice = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  // Slider Progress Calculation
  const minBudgetPercent = ((form.budgetMin - 100000000) / (1000000000 - 100000000)) * 100;
  const maxBudgetPercent = ((form.budgetMax - 100000000) / (1500000000 - 100000000)) * 100;

  const getSliderStyle = (percent) => ({
    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percent}%, #ffffff ${percent}%, #ffffff 100%)`,
  });

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Add Recommended Car to Wishlist
  async function handleAddWishlist(rec) {
    if (!isAuthenticated) {
      toast.error("Please sign in first.");
      return;
    }
    try {
      await addWishlist({
        carId: rec.carId,
        selectedColor: rec.selectedColor || form.selectedColor || undefined,
        source: "recommendation",
        matchScore: rec.matchScore,
        aiReason: rec.aiReason,
      });
      toast.success("Added to your wishlist!");
    } catch (err) {
      toast.error(err.status === 409 ? "Already in your wishlist." : err.message);
    }
  }

  // Submit AI Recommendation Query with Strict Filter
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoginRequired(false);
    setUpgradeRequired(false);
    setHasSearched(true);

    if (!isAuthenticated) {
      setLoginRequired(true);
      return;
    }

    if (!form.priority) {
      setError("Please select your main priority.");
      return;
    }

    if (form.budgetMin > form.budgetMax) {
      setError("Minimum budget cannot be greater than maximum budget.");
      return;
    }

    setIsLoading(true);
    setRecommendations([]);

    try {
      const payload = {
        ...form,
        fuelType: form.fuelType === "All" ? undefined : form.fuelType,
      };

      const result = await getRecommendations(payload);
      updateAiTokens(result.data?.remainingTokens);
      const list = (result.data?.recommendations || []).filter((r) => r?.carId);

      const recsWithCar = await Promise.all(
        list.map(async (item) => {
          try {
            const carRes = await getCarById(item.carId);
            return { ...item, car: carRes.data || carRes };
          } catch {
            return { ...item, car: null };
          }
        })
      );

      // Strict Client-Side Filter: Only keep cars matching the strict user criteria
      const strictMatchingCars = recsWithCar.filter((item) => {
        const car = item.car;
        if (!car) return false;

        // 1. Strict Budget Verification
        const price = Number(car.basePrice) || 0;
        if (price > form.budgetMax || price < form.budgetMin) {
          return false;
        }

        // 2. Strict Fuel Type Verification
        if (form.fuelType && form.fuelType !== "All") {
          const carFuel = (car.specs?.fuelType || "").toLowerCase();
          const targetFuel = form.fuelType.toLowerCase().replace(" (ev)", "");
          if (!carFuel.includes(targetFuel)) {
            return false;
          }
        }

        // 3. Strict Type of Need Verification
        if (form.needType && form.needType !== "Family" && form.needType !== "Business" && form.needType !== "Adventure") {
          const carType = (car.type || "").toLowerCase();
          const targetType = form.needType.toLowerCase();
          if (targetType === "city car" && !carType.includes("hatchback") && !carType.includes("city")) {
            return false;
          } else if (targetType !== "city car" && !carType.includes(targetType)) {
            return false;
          }
        }

        return true;
      });

      setRecommendations(strictMatchingCars);
    } catch (err) {
      if (err.status === 401) setLoginRequired(true);
      else if (err.status === 403 || err.code === "TOKEN_EXHAUSTED") setUpgradeRequired(true);
      else setError(err.message || "Failed to generate AI recommendations.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0C0E16] text-white py-6 sm:py-10 lg:py-16 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-[400px] sm:w-[500px] h-[350px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">

        {/* Header */}
        <div className="mb-6 sm:mb-8 pb-5 border-b border-white/10">
          <div className="inline-flex items-center gap-1.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full mb-2.5">
            <PiSparkle className="text-sm" />
            <span>AI Powered</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
            Smart Car <span className="text-blue-500">Recommendations</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Personalized vehicle match based on your lifestyle, budget, and specs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Form Column */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-5 bg-[#141620] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl"
          >
            {/* Budget */}
            <div>
              <div className="flex justify-between items-center text-xs mb-2.5">
                <span className="font-semibold text-white">Budget Range</span>
                <span className="text-blue-400 font-bold text-[11px] sm:text-xs">
                  {formatPrice(form.budgetMin)} — {formatPrice(form.budgetMax)}
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-gray-400 block mb-1">Min</span>
                  <input
                    type="range"
                    min="100000000"
                    max="1000000000"
                    step="25000000"
                    value={form.budgetMin}
                    style={getSliderStyle(minBudgetPercent)}
                    onChange={(e) => updateForm("budgetMin", Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block mb-1">Max</span>
                  <input
                    type="range"
                    min="100000000"
                    max="1500000000"
                    step="25000000"
                    value={form.budgetMax}
                    style={getSliderStyle(maxBudgetPercent)}
                    onChange={(e) => updateForm("budgetMax", Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Type of Need & Fuel Type (Custom Dropdowns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Type of Need */}
              <div className="relative">
                <label className="text-xs font-semibold text-white block mb-2">Type of Need</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsNeedOpen(!isNeedOpen);
                    setIsFuelOpen(false);
                    setIsPriorityOpen(false);
                  }}
                  className="w-full h-11 bg-[#0C0E16] hover:bg-white/5 border border-white/10 rounded-xl px-3.5 flex items-center justify-between text-xs text-white transition-all cursor-pointer"
                >
                  <span className="font-medium truncate">{form.needType}</span>
                  <PiCaretDown className={`text-xs text-gray-400 transition-transform shrink-0 ${isNeedOpen ? "rotate-180" : ""}`} />
                </button>

                {isNeedOpen && (
                  <>
                    <div onClick={() => setIsNeedOpen(false)} className="fixed inset-0 z-30" />
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0C0E16] border border-white/15 rounded-xl p-1.5 shadow-2xl z-40 max-h-48 overflow-y-auto flex flex-col gap-0.5 animate-in fade-in duration-150">
                      {needOptions.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            updateForm("needType", type);
                            setIsNeedOpen(false);
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${form.needType === type
                              ? "bg-blue-600/20 text-blue-400 font-semibold"
                              : "text-gray-300 hover:text-white hover:bg-white/5"
                            }`}
                        >
                          <span>{type}</span>
                          {form.needType === type && <PiCheck className="text-xs text-blue-400" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Fuel Type */}
              <div className="relative">
                <label className="text-xs font-semibold text-white block mb-2">Fuel Type</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsFuelOpen(!isFuelOpen);
                    setIsNeedOpen(false);
                    setIsPriorityOpen(false);
                  }}
                  className="w-full h-11 bg-[#0C0E16] hover:bg-white/5 border border-white/10 rounded-xl px-3.5 flex items-center justify-between text-xs text-white transition-all cursor-pointer"
                >
                  <span className="font-medium truncate">{form.fuelType}</span>
                  <PiCaretDown className={`text-xs text-gray-400 transition-transform shrink-0 ${isFuelOpen ? "rotate-180" : ""}`} />
                </button>

                {isFuelOpen && (
                  <>
                    <div onClick={() => setIsFuelOpen(false)} className="fixed inset-0 z-30" />
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0C0E16] border border-white/15 rounded-xl p-1.5 shadow-2xl z-40 max-h-48 overflow-y-auto flex flex-col gap-0.5 animate-in fade-in duration-150">
                      {fuelOptions.map((fuel) => (
                        <button
                          key={fuel}
                          type="button"
                          onClick={() => {
                            updateForm("fuelType", fuel);
                            setIsFuelOpen(false);
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${form.fuelType === fuel
                              ? "bg-blue-600/20 text-blue-400 font-semibold"
                              : "text-gray-300 hover:text-white hover:bg-white/5"
                            }`}
                        >
                          <span>{fuel}</span>
                          {form.fuelType === fuel && <PiCheck className="text-xs text-blue-400" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* Passengers */}
            <div>
              <label className="text-xs font-semibold text-white block mb-2">Passengers</label>
              <div className="flex items-center justify-between bg-[#0C0E16] border border-white/10 rounded-xl p-1.5 h-11">
                <button
                  type="button"
                  onClick={() => updateForm("passengers", Math.max(2, form.passengers - 1))}
                  disabled={form.passengers <= 2}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all cursor-pointer"
                >
                  <PiMinus className="text-xs" />
                </button>
                <span className="text-xs font-bold text-white">
                  {form.passengers} <span className="text-gray-400 font-normal">People</span>
                </span>
                <button
                  type="button"
                  onClick={() => updateForm("passengers", Math.min(8, form.passengers + 1))}
                  disabled={form.passengers >= 8}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all cursor-pointer"
                >
                  <PiPlus className="text-xs" />
                </button>
              </div>
            </div>

            {/* Custom Priority Dropdown */}
            <div className="relative">
              <label className="text-xs font-semibold text-white block mb-2">Main Priority</label>
              <button
                type="button"
                onClick={() => {
                  setIsPriorityOpen(!isPriorityOpen);
                  setIsNeedOpen(false);
                  setIsFuelOpen(false);
                }}
                className="w-full h-11 bg-[#0C0E16] hover:bg-white/5 border border-white/10 rounded-xl px-3.5 flex items-center justify-between text-xs transition-all cursor-pointer"
              >
                <span className={form.priority ? "text-white font-medium" : "text-gray-400"}>
                  {form.priority || "Select a priority..."}
                </span>
                <PiCaretDown className={`text-xs text-gray-400 transition-transform ${isPriorityOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Priority Menu */}
              {isPriorityOpen && (
                <>
                  <div onClick={() => setIsPriorityOpen(false)} className="fixed inset-0 z-30" />
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0C0E16] border border-white/15 rounded-xl p-1.5 shadow-2xl z-40 flex flex-col gap-0.5 animate-in fade-in duration-150">
                    {priorities.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          updateForm("priority", p);
                          setIsPriorityOpen(false);
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${form.priority === p
                            ? "bg-blue-600/20 text-blue-400 font-semibold"
                            : "text-gray-300 hover:text-white hover:bg-white/5"
                          }`}
                      >
                        <span>{p}</span>
                        {form.priority === p && <PiCheck className="text-xs text-blue-400" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Color Preference */}
            <div>
              <label className="text-xs font-semibold text-white block mb-2">Color Preference (Optional)</label>
              <div className="flex flex-wrap gap-1.5">
                {colorOptions.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => updateForm("selectedColor", form.selectedColor === col ? "" : col)}
                    className={`text-xs px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${form.selectedColor === col
                        ? "bg-blue-600 text-white font-semibold"
                        : "bg-white/5 text-gray-400 hover:text-white border border-white/5"
                      }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading || upgradeRequired}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold py-3.5 px-7 rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all cursor-pointer"
            >
              <PiLightning className="text-base" />
              <span>{isLoading ? "Analyzing Catalog..." : "Get AI Recommendations"}</span>
            </button>

            {loginRequired && (
              <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-center">
                Please <Link to="/login" className="font-bold underline">sign in</Link> to use AI recommendations.
              </p>
            )}

            {upgradeRequired && <AiAccessPrompt />}

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center">
                {error}
              </p>
            )}
          </form>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3 bg-blue-600/10 border border-blue-500/25 p-4 rounded-xl text-xs text-gray-200">
              <PiLightning className="text-xl text-blue-400 shrink-0" />
              <span>Set your preferences, then let AI find the best matches from the RAC catalog.</span>
            </div>

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                <PiSpinner className="text-4xl text-blue-500 animate-spin" />
                <p className="text-xs font-medium">RAC AI is matching optimal cars...</p>
              </div>
            )}

            {/* Initial State (Before Search) */}
            {!isLoading && !hasSearched && recommendations.length === 0 && (
              <div className="text-center py-20 sm:py-24 bg-[#141620] border border-white/10 rounded-2xl p-6 sm:p-8 text-gray-400">
                <PiSparkle className="text-4xl text-blue-500/40 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white mb-1">Your recommendation results will appear here.</h3>
                <p className="text-xs">Adjust your preferences on the left and click Get AI Recommendations.</p>
              </div>
            )}

            {/* No Strict Matches Found Banner */}
            {!isLoading && hasSearched && recommendations.length === 0 && (
              <div className="text-center py-16 sm:py-20 bg-[#141620] border border-white/10 rounded-2xl p-6 sm:p-8 text-gray-300">
                <div className="w-12 h-12 bg-blue-600/15 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto text-blue-400 text-2xl mb-3">
                  <PiInfo />
                </div>
                <h3 className="text-base font-bold text-white mb-2">No exact vehicles found</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                  No vehicle in our current catalog strictly matches your combination of{" "}
                  <strong className="text-blue-400">{form.fuelType !== "All" ? `${form.fuelType} ` : ""}{form.needType}</strong>{" "}
                  within <strong className="text-white">{formatPrice(form.budgetMin)} - {formatPrice(form.budgetMax)}</strong>.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Try adjusting the fuel type to "All" or increasing your budget range.
                </p>
              </div>
            )}

            {/* Matching Results List */}
            {!isLoading && recommendations.map((item, idx) => {
              const car = item.car;
              const targetId = car?.slug || car?.id || car?._id || item.carId;

              return (
                <div
                  key={idx}
                  className="bg-[#141620] border border-white/10 rounded-2xl p-4 sm:p-5 hover:border-white/20 transition-all flex flex-col sm:flex-row gap-4 sm:gap-5 items-center"
                >
                  <div className="w-full sm:w-44 h-32 bg-[#0C0E16]/60 rounded-xl p-2 flex items-center justify-center shrink-0 border border-white/5">
                    <img
                      src={car?.thumbnailUrl || "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=400&auto=format&fit=crop"}
                      alt={car?.name || "Car"}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold text-blue-400 uppercase">
                          {car?.brand || "RAC"} · {car?.specs?.fuelType || car?.type || "Vehicle"}
                        </span>
                        <h3 className="text-base font-bold text-white truncate">{car?.name || "Vehicle"}</h3>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
                        {item.matchScore || 95}% Match
                      </span>
                    </div>

                    <p className="text-xs font-extrabold text-white mt-1">
                      {formatPrice(car?.basePrice)}
                    </p>

                    {item.aiReason && (
                      <p className="text-[11px] text-gray-400 mt-2 bg-white/5 p-2 rounded-lg leading-relaxed">
                        {item.aiReason}
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-3 mt-3 pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => handleAddWishlist(item)}
                        className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1"
                      >
                        <PiHeart /> Wishlist
                      </button>
                      <Link
                        to={`/cars/${targetId}`}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <span>Details</span>
                        <PiArrowRight className="text-xs" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}