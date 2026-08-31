import { useState, useEffect, useRef } from "react";
import { GpsPoint } from "@/types";

export function useGeolocation() {
  const [rawRoute, setRawRoute] = useState<GpsPoint[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isTracking) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ Geolocation");
      setIsTracking(false);
      return;
    }

    startTimeRef.current = Date.now();
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const timeOffset = Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000);

        const newPoint: GpsPoint = {
          lat: latitude,
          lon: longitude,
          time: timeOffset,
          radius: accuracy,
        };

        setRawRoute((prev) => [...prev, newPoint]);
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isTracking]);

  const clearRoute = () => {
    setRawRoute([]);
    startTimeRef.current = Date.now();
  };

  return { rawRoute, isTracking, setIsTracking, error, clearRoute };
}
