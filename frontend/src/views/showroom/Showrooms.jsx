import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { PiArrowSquareOut, PiMapPin, PiNavigationArrow } from "react-icons/pi";
import useShowrooms from "../../context/useShowrooms";
import "./Showrooms.css";

function formatDistance(distance) {
  const value = Number(distance);
  return Number.isFinite(value) ? `${value.toFixed(1)} km` : "N/A";
}

function Showrooms() {
  const { showrooms, source, location, error, isLoading, retryShowrooms } =
    useShowrooms();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read brand filter from URL query param
  const brandFilter = searchParams.get("brand") || "";

  // Filter showrooms by brand name
  const filteredShowrooms = useMemo(() => {
    if (!brandFilter) return showrooms;
    const keyword = brandFilter.toLowerCase();
    return showrooms.filter((s) =>
      s.name.toLowerCase().includes(keyword)
    );
  }, [showrooms, brandFilter]);

  // Clear the brand filter
  function clearBrandFilter() {
    searchParams.delete("brand");
    setSearchParams(searchParams);
  }

  return (
    <div className="showrooms-page">
      <main className="showrooms-container">
        <header className="showrooms-header">
          <div>
            <p className="showrooms-eyebrow">Dealer locator</p>
            {/* Dynamic title — includes brand when filtered */}
            <h1>{brandFilter ? `Nearby ${brandFilter} Showrooms` : "Nearby Showrooms"}</h1>
            <p className="showrooms-description">
              {brandFilter
                ? `Showing ${brandFilter} dealers closest to your location.`
                : "Find the closest authorized car dealers using location data saved for this browser session."
              }
              {/* Subtle link to clear filter */}
              {brandFilter && (
                <button
                  type="button"
                  onClick={clearBrandFilter}
                  className="showrooms-show-all"
                >
                  Show all showrooms
                </button>
              )}
            </p>
          </div>

          {source && (
            <span className="showrooms-source">
              {source === "google_places" ? "Google Places" : "Demo locations"}
            </span>
          )}
        </header>

        {location?.isFallback && (
          <div className="showrooms-notice">
            <PiNavigationArrow />
            Location access was unavailable, so results are based on Central Jakarta.
          </div>
        )}

        {isLoading && (
          <section className="showrooms-grid" aria-label="Loading showrooms">
            {[1, 2, 3].map((item) => (
              <div className="showroom-card showroom-card-loading" key={item} />
            ))}
          </section>
        )}

        {!isLoading && error && (
          <section className="showrooms-empty" role="alert">
            <PiMapPin />
            <h2>Unable to load nearby showrooms</h2>
            <p>{error}</p>
            <button
              className="showrooms-retry"
              onClick={retryShowrooms}
              type="button"
            >
              Try Again
            </button>
          </section>
        )}

        {!isLoading && !error && filteredShowrooms.length === 0 && (
          <section className="showrooms-empty">
            <PiMapPin />
            {brandFilter ? (
              <>
                <h2>No {brandFilter} showrooms nearby</h2>
                <p>Try viewing all showrooms instead.</p>
                <button
                  className="showrooms-retry"
                  onClick={clearBrandFilter}
                  type="button"
                >
                  Show All Showrooms
                </button>
              </>
            ) : (
              <>
                <h2>No showrooms found</h2>
                <p>No showroom data is available for this session.</p>
              </>
            )}
          </section>
        )}

        {!isLoading && !error && filteredShowrooms.length > 0 && (
          <section className="showrooms-grid">
            {filteredShowrooms.map((showroom) => (
              <article
                className="showroom-card"
                key={`${showroom.name}-${showroom.lat}-${showroom.lng}`}
              >
                {/* Embedded map inside each card */}
                <div className="showroom-card-map">
                  <iframe
                    className="showroom-card-iframe"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${showroom.lat},${showroom.lng}&z=15&output=embed`}
                    title={`Map — ${showroom.name}`}
                  />
                </div>

                <div className="showroom-card-body">
                  {/* Distance badge */}
                  <span className="showroom-distance-badge">
                    {formatDistance(showroom.distanceKm)}
                  </span>

                  <h2>{showroom.name}</h2>
                  <p>{showroom.address}</p>

                  <a
                    className="showroom-map-link"
                    href={
                      showroom.mapsUrl ||
                      `https://www.google.com/maps/search/?api=1&query=${showroom.lat},${showroom.lng}`
                    }
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open in Google Maps <PiArrowSquareOut />
                  </a>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default Showrooms;