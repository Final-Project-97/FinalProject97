import { PiArrowSquareOut, PiMapPin, PiNavigationArrow } from "react-icons/pi";
import useShowrooms from "../context/useShowrooms";
import "./Showrooms.css";

function formatDistance(distance) {
  const value = Number(distance);
  return Number.isFinite(value) ? `${value.toFixed(1)} km` : "Distance unavailable";
}

function Showrooms() {
  const { showrooms, source, location, error, isLoading } = useShowrooms();

  return (
    <div className="showrooms-page">
      <main className="showrooms-container">
        <header className="showrooms-header">
          <div>
            <p className="showrooms-eyebrow">Dealer locator</p>
            <h1>Nearby Showrooms</h1>
            <p className="showrooms-description">
              Find the closest authorized car dealers using location data saved
              for this browser session.
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
          </section>
        )}

        {!isLoading && !error && showrooms.length === 0 && (
          <section className="showrooms-empty">
            <PiMapPin />
            <h2>No showrooms found</h2>
            <p>No showroom data is available for this session.</p>
          </section>
        )}

        {!isLoading && !error && showrooms.length > 0 && (
          <section className="showrooms-grid">
            {showrooms.map((showroom, index) => (
              <article
                className="showroom-card"
                key={`${showroom.name}-${showroom.lat}-${showroom.lng}`}
              >
                <div className="showroom-card-top">
                  <span className="showroom-number">{index + 1}</span>
                  <span className="showroom-distance">
                    {formatDistance(showroom.distanceKm)}
                  </span>
                </div>

                <div className="showroom-icon">
                  <PiMapPin />
                </div>

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
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default Showrooms;
