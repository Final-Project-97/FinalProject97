import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { PiCalculator, PiCreditCard, PiLightbulb, PiSpinner, PiCaretDown, PiCar } from "react-icons/pi";
import { simulateCredit } from "../../api/ai";
import { getCars } from "../../api/cars";
import AiAccessPrompt from "../../components/shared/AiAccessPrompt";
import useAuth from "../../context/useAuth";

const tenorOptions = [12, 24, 36, 48, 60];

export default function Credit() {
  const { isAuthenticated, updateAiTokens } = useAuth();
  const [searchParams] = useSearchParams();

  const [carsList, setCarsList] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isCarDropdownOpen, setIsCarDropdownOpen] = useState(false);

  const [form, setForm] = useState({
    carPrice: 263200000,
    downPaymentPercentage: 30,
    tenorMonths: 48,
    interestRate: 6.5,
  });

  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginRequired, setLoginRequired] = useState(false);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  const carIdQuery = searchParams.get("car");
  const downPayment = Math.round(form.carPrice * (form.downPaymentPercentage / 100));
  const principalLoan = form.carPrice - downPayment;

  // Format Currency IDR
  const formatPrice = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  // Slider Progress Calculation
  const dpPercent = ((form.downPaymentPercentage - 10) / (70 - 10)) * 100;
  const interestPercent = ((form.interestRate - 3) / (12 - 3)) * 100;

  const getSliderStyle = (percent) => ({
    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percent}%, #ffffff ${percent}%, #ffffff 100%)`,
  });

  // Fetch Cars for Selection
  useEffect(() => {
    async function loadCatalog() {
      try {
        const response = await getCars();
        const cars = Array.isArray(response) ? response : response.data || [];
        setCarsList(cars);

        if (carIdQuery) {
          const match = cars.find((c) => c.slug === carIdQuery || c.id === carIdQuery || c._id === carIdQuery);
          if (match) {
            setSelectedCar(match);
            setForm((prev) => ({ ...prev, carPrice: Number(match.basePrice) || prev.carPrice }));
            return;
          }
        }

        if (cars.length > 0 && !selectedCar) {
          setSelectedCar(cars[0]);
          setForm((prev) => ({ ...prev, carPrice: Number(cars[0].basePrice) || prev.carPrice }));
        }
      } catch {
        // Fallback
      }
    }

    loadCatalog();
  }, [carIdQuery]);

  function handleSelectCar(car) {
    setSelectedCar(car);
    setForm((prev) => ({ ...prev, carPrice: Number(car.basePrice) || prev.carPrice }));
    setIsCarDropdownOpen(false);
  }

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: Number(value) }));
  }

  // Submit Simulation
  async function handleSubmit(e) {
    e.preventDefault();
    setLoginRequired(false);
    setUpgradeRequired(false);

    if (!isAuthenticated) {
      setLoginRequired(true);
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await simulateCredit({
        carPrice: form.carPrice,
        downPayment,
        tenorMonths: form.tenorMonths,
        interestRatePerYear: form.interestRate,
      });
      updateAiTokens(response.data?.remainingTokens);
      setResult(response.data);
    } catch (err) {
      if (err.status === 401) setLoginRequired(true);
      else if (err.status === 403 || err.code === "TOKEN_EXHAUSTED") setUpgradeRequired(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  const calc = result?.calculation;
  const insight = result?.aiFinancialInsight;

  return (
    <div className="min-h-screen bg-[#0C0E16] text-white py-6 sm:py-10 lg:py-16 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-[400px] sm:w-[450px] h-[350px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">

        {/* Header */}
        <div className="mb-6 sm:mb-8 pb-5 border-b border-white/10">
          <span className="text-blue-500 text-[11px] font-bold tracking-widest uppercase">
            FINANCIAL
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-1">
            Credit <span className="text-blue-500">Simulation</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Calculate monthly installments and plan your dream car purchase.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Form Column */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-6 bg-[#141620] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl"
          >
            <div className="space-y-4">

              {/* Select Car Model */}
              <div className="relative">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-semibold text-white">Select Vehicle Model</span>
                  <span className="text-blue-400 font-bold">{formatPrice(form.carPrice)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCarDropdownOpen(!isCarDropdownOpen)}
                  className="w-full h-12 bg-[#0C0E16] hover:bg-white/5 border border-white/10 rounded-xl px-3.5 flex items-center justify-between text-xs text-white transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <PiCar className="text-base text-blue-400 shrink-0" />
                    <span className="font-medium truncate">
                      {selectedCar?.name || "Choose a vehicle from catalog..."}
                    </span>
                  </div>
                  <PiCaretDown className={`text-xs text-gray-400 transition-transform shrink-0 ${isCarDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Car Dropdown Menu */}
                {isCarDropdownOpen && (
                  <>
                    <div
                      onClick={() => setIsCarDropdownOpen(false)}
                      className="fixed inset-0 z-30"
                    />
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0C0E16] border border-white/15 rounded-xl p-1.5 shadow-2xl z-40 max-h-60 overflow-y-auto flex flex-col gap-1">
                      {carsList.map((car) => {
                        const isMatch = selectedCar?.name === car.name;
                        return (
                          <button
                            key={car.id || car._id || car.slug}
                            type="button"
                            onClick={() => handleSelectCar(car)}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${isMatch
                                ? "bg-blue-600/20 text-blue-400 font-semibold"
                                : "text-gray-300 hover:text-white hover:bg-white/5"
                              }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <img
                                src={car.thumbnailUrl || car.colors?.[0]?.imageUrl || ""}
                                alt={car.name}
                                className="w-9 h-7 object-contain bg-white/5 rounded"
                              />
                              <div className="truncate">
                                <p className="truncate font-medium">{car.name}</p>
                                <p className="text-[10px] text-gray-400">{car.brand} · {car.type}</p>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-white shrink-0 ml-2">
                              {formatPrice(car.basePrice)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Down Payment */}
              <div>
                <div className="flex justify-between text-xs mb-2.5">
                  <span className="font-semibold text-white">Down Payment (DP)</span>
                  <span className="text-blue-400 font-bold text-[11px] sm:text-xs">
                    {form.downPaymentPercentage}% — {formatPrice(downPayment)}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  step="5"
                  value={form.downPaymentPercentage}
                  style={getSliderStyle(dpPercent)}
                  onChange={(e) => updateForm("downPaymentPercentage", e.target.value)}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1.5">
                  <span>10%</span>
                  <span>70%</span>
                </div>
              </div>

              {/* Tenor */}
              <div>
                <div className="flex justify-between text-xs mb-2.5">
                  <span className="font-semibold text-white">Tenor</span>
                  <span className="text-blue-400 font-bold text-[11px] sm:text-xs">
                    {form.tenorMonths} Months ({form.tenorMonths / 12} Years)
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {tenorOptions.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => updateForm("tenorMonths", t)}
                      className={`text-[11px] sm:text-xs py-2 rounded-xl transition-all cursor-pointer ${form.tenorMonths === t
                          ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25"
                          : "bg-white/5 text-gray-400 hover:text-white border border-white/5"
                        }`}
                    >
                      {t}mo
                    </button>
                  ))}
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <div className="flex justify-between text-xs mb-2.5">
                  <span className="font-semibold text-white">Annual Interest Rate</span>
                  <span className="text-blue-400 font-bold">{form.interestRate}%</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.5"
                  value={form.interestRate}
                  style={getSliderStyle(interestPercent)}
                  onChange={(e) => updateForm("interestRate", e.target.value)}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1.5">
                  <span>3%</span>
                  <span>12%</span>
                </div>
              </div>

              {/* Summary Box */}
              <div className="bg-[#0C0E16] p-3.5 sm:p-4 rounded-xl border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Car Model</span>
                  <span className="text-white font-semibold truncate max-w-[200px]">{selectedCar?.name || "Selected Car"}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Vehicle Price (OTR)</span>
                  <span className="text-white font-semibold">{formatPrice(form.carPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>DP ({form.downPaymentPercentage}%)</span>
                  <span className="text-white font-semibold">{formatPrice(downPayment)}</span>
                </div>
                <div className="flex justify-between text-gray-400 pt-2 border-t border-white/5">
                  <span className="font-bold text-white">Loan Principal</span>
                  <span className="text-blue-400 font-bold">{formatPrice(principalLoan)}</span>
                </div>
              </div>
            </div>

            {/* Submit Action (Pill Button Rounded-Full matching Home) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || upgradeRequired}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold py-3.5 px-7 rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all cursor-pointer"
              >
                <PiCalculator className="text-base" />
                <span>{isSubmitting ? "Calculating..." : "Calculate Installment"}</span>
              </button>

              {loginRequired && (
                <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-center mt-3">
                  Please <Link to="/login" className="font-bold underline">sign in</Link> to calculate credit.
                </p>
              )}

              {upgradeRequired && <AiAccessPrompt />}
            </div>
          </form>

          {/* Result Column */}
          <div className="lg:col-span-6">
            {isSubmitting && (
              <div className="min-h-[360px] sm:min-h-[420px] flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-[#141620] border border-white/10 rounded-2xl gap-3">
                <PiSpinner className="text-4xl text-blue-500 animate-spin" />
                <p className="text-xs font-medium text-gray-400">
                  Computing installments and financial score...
                </p>
              </div>
            )}

            {!isSubmitting && !calc && (
              <div className="min-h-[360px] sm:min-h-[420px] flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-[#141620] border border-white/10 rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-2xl mb-4">
                  <PiCreditCard />
                </div>
                <h3 className="text-base font-bold text-white mb-1">No calculation result yet</h3>
                <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                  Select a vehicle model on the left and click Calculate Installment.
                </p>
              </div>
            )}

            {!isSubmitting && calc && (
              <div className="bg-[#141620] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl">
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    ESTIMATED MONTHLY INSTALLMENT
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-1">
                    {formatPrice(calc.monthlyInstallment)} <span className="text-xs text-gray-400 font-normal">/ month</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Tenor duration: {calc.tenorMonths || form.tenorMonths} months ({(calc.tenorMonths || form.tenorMonths) / 12} years)
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-[#0C0E16] p-3.5 rounded-xl border border-white/5">
                    <span className="text-gray-400 block text-[10px] mb-0.5">On The Road Price</span>
                    <span className="font-bold text-white text-sm">{formatPrice(calc.onTheRoadPrice || form.carPrice)}</span>
                  </div>
                  <div className="bg-[#0C0E16] p-3.5 rounded-xl border border-white/5">
                    <span className="text-gray-400 block text-[10px] mb-0.5">Down Payment ({form.downPaymentPercentage}%)</span>
                    <span className="font-bold text-white text-sm">{formatPrice(calc.downPayment || downPayment)}</span>
                  </div>
                  <div className="bg-[#0C0E16] p-3.5 rounded-xl border border-white/5">
                    <span className="text-gray-400 block text-[10px] mb-0.5">Loan Principal</span>
                    <span className="font-bold text-white text-sm">{formatPrice(principalLoan)}</span>
                  </div>
                  <div className="bg-[#0C0E16] p-3.5 rounded-xl border border-white/5">
                    <span className="text-gray-400 block text-[10px] mb-0.5">Total Payment</span>
                    <span className="font-bold text-white text-sm">{formatPrice(calc.totalPayment)}</span>
                  </div>
                </div>

                {insight && (
                  <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 items-start">
                    <PiLightbulb className="text-xl text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-blue-300">
                        {insight.financialHealthStatus || "AI Financial Insight"}
                      </h4>
                      <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                        {insight.insightText}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}