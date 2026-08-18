import { useState } from "react";
import { Link } from "react-router";
import { PiArrowRight, PiHeart, PiLightning, PiQuestion } from "react-icons/pi";
import { toast } from "react-toastify";
import { getRecommendations } from "../../api/ai";
import { getCarById } from "../../api/cars";
import { addWishlist } from "../../api/wishlist";
import useAuth from "../../context/useAuth";
import useShowrooms from "../../context/useShowrooms";
import "./Recommend.css";

const needOptions = ["Family", "City Car", "SUV", "MPV", "Business", "Adventure"];
const colorOptions = ["White", "Black", "Silver", "Blue", "Red", "Gray"];
const priorities = [
  "Comfort",
  "Fuel efficiency",
  "Performance",
  "Safety",
  "Maintenance cost",
];

const colorDots = {
  Black: "#171717",
  Blue: "#31558b",
  Gray: "#6b7280",
  Red: "#b9382f",
  Silver: "#aeb6c1",
  White: "#f4f4ef",
};

const initialForm = {
  budgetMin: 200000000,
  budgetMax: 700000000,
  needType: "Family",
  passengers: 5,
  priority: "",
  selectedColor: "",
};

function formatMillion(value) {
  return `Rp ${Math.round(Number(value) / 1000000)} million`;
}

function getCarColors(car) {
  if (!Array.isArray(car?.colors)) return [];

  return car.colors.slice(0, 4).map((color) =>
    typeof color === "string"
      ? colorDots[color] || color
      : color.hex || color.hexCode || colorDots[color.name] || "#334155",
  );
}

function Recommend() {
  const { isAuthenticated, updateAiTokens, user } = useAuth();
  const { showrooms } = useShowrooms();
  const [form, setForm] = useState(initialForm);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginRequired, setLoginRequired] = useState(false);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  function updateForm(name, value) {
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleAddWishlist(recommendation) {
    if (!isAuthenticated) {
      toast.error("Please sign in before adding a car to your wishlist.");
      return;
    }

    try {
      await addWishlist({
        carId: recommendation.carId,
        selectedColor: recommendation.selectedColor || form.selectedColor || undefined,
        source: "recommendation",
        matchScore: recommendation.matchScore,
        aiReason: recommendation.aiReason,
      });
      toast.success("Recommendation added to your wishlist.");
    } catch (wishlistError) {
      toast.error(
        wishlistError.status === 409
          ? "This car is already in your wishlist."
          : wishlistError.message,
      );
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoginRequired(false);
    setUpgradeRequired(false);

    if (!isAuthenticated) {
      setLoginRequired(true);
      return;
    }

    if (form.budgetMin > form.budgetMax) {
      setError("Minimum budget cannot be greater than maximum budget.");
      return;
    }

    if (!form.priority) {
      setError("Please select your main priority.");
      return;
    }

    setIsLoading(true);
    setRecommendations([]);

    try {
      const result = await getRecommendations(form);
      updateAiTokens(result.data?.remainingTokens);
      const recommendationList = (result.data?.recommendations || []).filter(
        (recommendation) => recommendation?.carId,
      );

      if (recommendationList.length === 0) {
        throw new Error("The AI did not return a valid catalog recommendation. Please try again.");
      }
      const recommendationsWithCars = await Promise.all(
        recommendationList.map(async (recommendation) => {
          try {
            const carResult = await getCarById(recommendation.carId);
            return { ...recommendation, car: carResult.data };
          } catch {
            return { ...recommendation, car: null };
          }
        }),
      );

      setRecommendations(recommendationsWithCars);
    } catch (requestError) {
      if (requestError.status === 401) {
        setLoginRequired(true);
      } else if (
        requestError.status === 403 ||
        requestError.code === "TOKEN_EXHAUSTED"
      ) {
        setUpgradeRequired(true);
      } else {
        setError(requestError.message || "Unable to get recommendations.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="recommend-page min-h-screen bg-[#0b0d15] text-white">
      <main className="recommend-container max-w-7xl mx-auto">
        <section className="recommend-hero mb-12 max-w-2xl">
          <div className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-500">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15">
              <PiQuestion className="text-xl" />
            </span>
            AI Powered
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Smart Car <span className="text-blue-500">Recommendations</span>
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
            Tell us what you need. Our AI will analyze the catalog and recommend
            the best options for you.
          </p>
          <span className="mt-4 inline-flex rounded-full border border-blue-500/50 px-4 py-1.5 text-sm font-medium text-blue-400">
            {user?.aiTokensRemaining ?? 3} AI tokens remaining
          </span>
        </section>

        <section className="recommend-grid grid items-start gap-8 lg:grid-cols-[470px_minmax(0,1fr)]">
          <form
            className="recommend-form space-y-7 rounded-2xl border border-white/10 bg-[#141720] p-6 shadow-2xl shadow-black/20"
            onSubmit={handleSubmit}
          >
            <div>
              <p className="font-semibold">
                Budget: {" "}
                <span className="text-blue-500">
                  {formatMillion(form.budgetMin)} – {formatMillion(form.budgetMax)}
                </span>
              </p>
              <div className="mt-4 grid grid-cols-[48px_1fr] items-center gap-x-4 gap-y-3 text-sm text-slate-400">
                <span>Min</span>
                <input
                  aria-label="Minimum budget"
                  className="recommend-range"
                  max="950000000"
                  min="50000000"
                  onChange={(event) => updateForm("budgetMin", Number(event.target.value))}
                  step="50000000"
                  type="range"
                  value={form.budgetMin}
                />
                <span>Max</span>
                <input
                  aria-label="Maximum budget"
                  className="recommend-range"
                  max="1000000000"
                  min="100000000"
                  onChange={(event) => updateForm("budgetMax", Number(event.target.value))}
                  step="50000000"
                  type="range"
                  value={form.budgetMax}
                />
              </div>
            </div>

            <fieldset>
              <legend className="mb-3 font-semibold">Type of need</legend>
              <div className="flex flex-wrap gap-2">
                {needOptions.map((option) => (
                  <button
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      form.needType === option
                        ? "border-blue-500 bg-blue-500/20 text-blue-400"
                        : "border-white/10 bg-white/5 text-slate-400 hover:border-white/25 hover:text-white"
                    }`}
                    key={option}
                    onClick={() => updateForm("needType", option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label className="font-semibold" htmlFor="passengers">
                Passengers: <span className="text-blue-500">{form.passengers} people</span>
              </label>
              <input
                className="recommend-range mt-5 w-full"
                id="passengers"
                max="8"
                min="1"
                onChange={(event) => updateForm("passengers", Number(event.target.value))}
                type="range"
                value={form.passengers}
              />
            </div>

            <label className="block" htmlFor="priority">
              <span className="mb-3 block font-semibold">Main priority</span>
              <select
                className="recommend-select select h-13 w-full rounded-2xl border-white/15 bg-white/5 text-base focus:border-blue-500"
                id="priority"
                onChange={(event) => updateForm("priority", event.target.value)}
                value={form.priority}
              >
                <option value="">Select a priority...</option>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>

            <fieldset>
              <legend className="mb-3 font-semibold">
                Color preference <span className="font-normal text-slate-500">(optional)</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      form.selectedColor === color
                        ? "border-blue-500 bg-blue-500/20 text-blue-400"
                        : "border-white/10 bg-white/5 text-slate-400 hover:border-white/25 hover:text-white"
                    }`}
                    key={color}
                    onClick={() =>
                      updateForm("selectedColor", form.selectedColor === color ? "" : color)
                    }
                    type="button"
                  >
                    {color}
                  </button>
                ))}
              </div>
            </fieldset>

            <button
              className="recommend-submit flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 font-bold shadow-lg shadow-blue-700/20 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
              disabled={isLoading}
              type="submit"
            >
              <PiLightning className="text-xl" />
              {isLoading ? "Analyzing catalog..." : "Get AI Recommendations"}
            </button>

            {loginRequired && (
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
                Please {" "}
                <Link className="font-bold underline" to="/login">
                  sign in
                </Link>{" "}
                before using AI recommendations.
              </div>
            )}

            {upgradeRequired && (
              <div className="rounded-xl border border-violet-400/30 bg-violet-400/10 p-4 text-sm text-violet-100">
                Your free AI tokens have been used. {" "}
                <Link className="font-bold underline" to="/upgrade">
                  View premium
                </Link>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
          </form>

          <div className="recommend-results" aria-live="polite">
            <div className="recommend-summary mb-6 flex min-h-24 items-center gap-5 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-6 py-5">
              <PiLightning className="shrink-0 text-3xl text-blue-500" />
              <p className="leading-7 text-slate-200">
                {recommendations.length > 0
                  ? `AI analyzed the RAC catalog and found ${recommendations.length} of the best options for your needs.`
                  : "Set your preferences, then let AI find the best matches from the RAC catalog."}
              </p>
            </div>

            <p className="mb-5 text-sm uppercase tracking-[0.18em] text-slate-500">
              {recommendations.length || 3} best recommendations
            </p>

            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div className="h-36 animate-pulse rounded-2xl bg-white/10" key={item} />
                ))}
              </div>
            )}

            {!isLoading && recommendations.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/15 px-8 py-20 text-center text-slate-500">
                Your recommendation results will appear here.
              </div>
            )}

            <div className="space-y-4">
              {recommendations.map((recommendation, index) => {
                const car = recommendation.car;
                const colors = getCarColors(car);

                return (
                  <article
                    className="relative flex min-h-36 gap-5 rounded-2xl border border-white/10 bg-[#141720] p-5 transition hover:border-blue-500/40"
                    key={recommendation.carId}
                  >
                    <span className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold">
                      {index + 1}
                    </span>

                    {car?.thumbnailUrl ? (
                      <img
                        alt={car.name}
                        className="hidden h-24 w-40 rounded-xl object-cover sm:block"
                        src={car.thumbnailUrl}
                      />
                    ) : (
                      <div className="hidden h-24 w-40 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-xs text-slate-500 sm:flex">
                        RAC AI
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-500">{car?.brand || "RAC Catalog"}</p>
                          <h2 className="truncate text-xl font-bold">
                            {car?.name || "Recommended car"}
                          </h2>
                        </div>
                        {car?.basePrice && (
                          <p className="shrink-0 font-bold text-blue-500">
                            {formatMillion(car.basePrice)}
                          </p>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        {car?.type && (
                          <span className="rounded-full bg-blue-500/15 px-3 py-1 text-blue-400">
                            {car.type}
                          </span>
                        )}
                        <span className="rounded-full bg-white/5 px-3 py-1 text-slate-400">
                          {recommendation.matchScore}% match
                        </span>
                        {recommendation.selectedColor && (
                          <span className="rounded-full bg-white/5 px-3 py-1 text-slate-400">
                            {recommendation.selectedColor}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-4">
                        <div className="flex gap-2">
                          {(colors.length > 0 ? colors : ["#f4f4ef", "#6b7280", "#31558b"]).map(
                            (color, colorIndex) => (
                              <span
                                className="h-5 w-5 rounded-full border border-white/20"
                                key={`${color}-${colorIndex}`}
                                style={{ backgroundColor: color }}
                              />
                            ),
                          )}
                        </div>
                        <div className="flex gap-3 text-sm">
                          <button
                            aria-label={`Add ${car?.name || "car"} to wishlist`}
                            className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300"
                            onClick={() => handleAddWishlist(recommendation)}
                            type="button"
                          >
                            <PiHeart /> Wishlist
                          </button>
                          <Link className="text-blue-400 hover:text-blue-300" to={`/cars/${recommendation.carId}`}>
                            Details
                          </Link>
                          <Link className="text-slate-400 hover:text-white" to="/showrooms">
                            Showrooms ({showrooms.length})
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="recommend-catalog-cta mt-28 overflow-hidden rounded-3xl border border-blue-500/10 bg-gradient-to-r from-blue-950/60 via-[#111827] to-blue-950/30 px-6 py-16 text-center sm:px-12">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-500">
            Complete Catalog
          </p>
          <h2 className="mt-4 text-3xl font-black sm:text-4xl">
            Find Your <span className="text-blue-500">Dream Car</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-400">
            Explore the complete collection with smart filters for brands,
            vehicle types, prices, and features.
          </p>
          <Link
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-500"
            to="/catalog"
          >
            View Full Catalog <PiArrowRight />
          </Link>
        </section>
      </main>
    </div>
  );
}

export default Recommend;
