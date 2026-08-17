import { useEffect, useState } from "react";
import { getNearbyShowrooms } from "../api/showrooms";
import ShowroomContext from "./showroom-context";

const SHOWROOM_SESSION_KEY = "rac_showroom_session";
const JAKARTA_LOCATION = {
  latitude: -6.2088,
  longitude: 106.8456,
};

let showroomRequest;

function getSavedSession() {
  const savedSession = sessionStorage.getItem(SHOWROOM_SESSION_KEY);

  if (!savedSession) return null;

  try {
    return JSON.parse(savedSession);
  } catch {
    sessionStorage.removeItem(SHOWROOM_SESSION_KEY);
    return null;
  }
}

function getCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ ...JAKARTA_LOCATION, isFallback: true });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          isFallback: false,
        });
      },
      () => resolve({ ...JAKARTA_LOCATION, isFallback: true }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  });
}

async function loadShowrooms() {
  const location = await getCurrentLocation();
  const result = await getNearbyShowrooms(
    location.latitude,
    location.longitude,
  );

  return {
    source: result.source,
    data: result.data,
    location,
    error: null,
  };
}

function getShowroomsOnce() {
  if (!showroomRequest) {
    showroomRequest = loadShowrooms();
  }

  return showroomRequest;
}

function ShowroomProvider({ children }) {
  const [showrooms, setShowrooms] = useState([]);
  const [source, setSource] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeShowrooms() {
      const savedSession = getSavedSession();

      if (savedSession) {
        setShowrooms(savedSession.data || []);
        setSource(savedSession.source || null);
        setLocation(savedSession.location || null);
        setError(savedSession.error || null);
        setIsLoading(false);
        return;
      }

      try {
        const result = await getShowroomsOnce();
        sessionStorage.setItem(SHOWROOM_SESSION_KEY, JSON.stringify(result));
        setShowrooms(result.data);
        setSource(result.source);
        setLocation(result.location);
      } catch (requestError) {
        const failedSession = {
          source: null,
          data: [],
          location: null,
          error: requestError.message,
        };

        sessionStorage.setItem(
          SHOWROOM_SESSION_KEY,
          JSON.stringify(failedSession),
        );
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }

    initializeShowrooms();
  }, []);

  return (
    <ShowroomContext.Provider
      value={{ showrooms, source, location, error, isLoading }}
    >
      {children}
    </ShowroomContext.Provider>
  );
}

export default ShowroomProvider;
