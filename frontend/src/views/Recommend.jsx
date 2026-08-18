import { useState } from "react";
import { Link } from "react-router";
import { getRecommendations } from "../api/ai";
import { getCarById } from "../api/cars";
import useAuth from "../context/useAuth";
import useShowrooms from "../context/useShowrooms";

const initialForm = {
  budgetMin: "",
  budgetMax: "",
  needType: "Daily commute",
  passengers: "4",
  priority: "Comfort",
  selectedColor: "",
};

function Recommend() {
  const { isAuthenticated } = useAuth();
  const { showrooms } = useShowrooms();
  const [form, setForm] = useState(initialForm);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginRequired, setLoginRequired] = useState(false);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
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

    if (Number(form.budgetMin) > Number(form.budgetMax)) {
      setError("Minimum budget cannot be greater than maximum budget.");
      return;
    }

    setIsLoading(true);
    setRecommendations([]);

    try {
      const result = await getRecommendations({
        ...form,
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
        passengers: Number(form.passengers),
      });

      const recommendationList = result.data?.recommendations || [];
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
    <main className="min-h-screen bg-[#0C0E16] px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 max-w-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-400">
            RAC AI Recommendation
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">
            Find a car that fits your needs
          </h1>
          <p className="mt-3 text-slate-400">
            Complete the form and RAC AI will compare your preferences with
            the available catalog.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <form
            className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="form-control">
                <span className="mb-2 text-sm text-slate-300">
                  Minimum budget
                </span>
                <input
                  className="input w-full bg-[#171A24]"
                  min="0"
                  name="budgetMin"
                  onChange={handleChange}
                  placeholder="150000000"
                  required
                  type="number"
                  value={form.budgetMin}
                />
              </label>

              <label className="form-control">
                <span className="mb-2 text-sm text-slate-300">
                  Maximum budget
                </span>
                <input
                  className="input w-full bg-[#171A24]"
                  min="0"
                  name="budgetMax"
                  onChange={handleChange}
                  placeholder="300000000"
                  required
                  type="number"
                  value={form.budgetMax}
                />
              </label>
            </div>

            <label className="form-control">
              <span className="mb-2 text-sm text-slate-300">Main need</span>
              <select
                className="select w-full bg-[#171A24]"
                name="needType"
                onChange={handleChange}
                value={form.needType}
              >
                <option>Daily commute</option>
                <option>Family</option>
                <option>Business</option>
                <option>Long-distance travel</option>
                <option>Off-road</option>
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="form-control">
                <span className="mb-2 text-sm text-slate-300">Passengers</span>
                <input
                  className="input w-full bg-[#171A24]"
                  max="12"
                  min="1"
                  name="passengers"
                  onChange={handleChange}
                  required
                  type="number"
                  value={form.passengers}
                />
              </label>

              <label className="form-control">
                <span className="mb-2 text-sm text-slate-300">Priority</span>
                <select
                  className="select w-full bg-[#171A24]"
                  name="priority"
                  onChange={handleChange}
                  value={form.priority}
                >
                  <option>Comfort</option>
                  <option>Fuel efficiency</option>
                  <option>Performance</option>
                  <option>Safety</option>
                  <option>Maintenance cost</option>
                </select>
              </label>
            </div>

            <label className="form-control">
              <span className="mb-2 text-sm text-slate-300">
                Preferred color (optional)
              </span>
              <input
                className="input w-full bg-[#171A24]"
                name="selectedColor"
                onChange={handleChange}
                placeholder="Black"
                type="text"
                value={form.selectedColor}
              />
            </label>

            <button
              className="btn w-full border-none bg-emerald-400 text-[#0C0E16] hover:bg-emerald-300"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "Finding cars..." : "Get recommendations"}
            </button>

            {loginRequired && (
              <div className="alert border border-amber-400/30 bg-amber-400/10 text-amber-100">
                <span>Please sign in before using AI recommendations.</span>
                <Link className="btn btn-sm" to="/login">
                  Sign in
                </Link>
              </div>
            )}

            {upgradeRequired && (
              <div className="alert border border-violet-400/30 bg-violet-400/10 text-violet-100">
                <span>Your free AI tokens have been used.</span>
                <Link className="btn btn-sm" to="/upgrade">
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

          <section aria-live="polite">
            <h2 className="mb-4 text-xl font-semibold">Recommendation results</h2>

            {isLoading && (
              <div className="space-y-4">
                {[1, 2].map((item) => (
                  <div
                    className="h-48 animate-pulse rounded-2xl bg-white/10"
                    key={item}
                  />
                ))}
              </div>
            )}

            {!isLoading && recommendations.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-slate-400">
                Your recommendation results will appear here.
              </div>
            )}

            <div className="space-y-4">
              {recommendations.map((recommendation) => (
                <article
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  key={recommendation.carId}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-emerald-400">
                        {recommendation.matchScore}% match
                      </p>
                      <h3 className="mt-1 text-xl font-semibold">
                        {recommendation.car?.name || "Recommended car"}
                      </h3>
                      {recommendation.car && (
                        <p className="text-sm text-slate-400">
                          {recommendation.car.brand} · {recommendation.car.type}
                        </p>
                      )}
                    </div>
                    {recommendation.selectedColor && (
                      <span className="badge badge-outline">
                        {recommendation.selectedColor}
                      </span>
                    )}
                  </div>

                  <p className="my-4 text-sm leading-6 text-slate-300">
                    {recommendation.aiReason}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      className="btn btn-sm bg-white text-[#0C0E16]"
                      to={`/car/${recommendation.carId}`}
                    >
                      View details
                    </Link>
                    <Link className="btn btn-outline btn-sm" to="/showrooms">
                      Nearby showrooms ({showrooms.length})
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Recommend;
