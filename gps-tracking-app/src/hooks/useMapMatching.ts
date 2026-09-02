import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { GpsPoint, ProfileType } from "@/types";
import { decodePolyline6 } from "@/utils/mapHelpers";

export function useMapMatching(rawRoute: GpsPoint[], profile: ProfileType, isTracking: boolean) {
  const [matchedRoute, setMatchedRoute] = useState<[number, number][]>([]);
  const lastMatchedIndexRef = useRef(0);

  const rawRouteRef = useRef(rawRoute);

  // Luôn cập nhật ref bằng giá trị mới nhất của rawRoute để interval không bị reset
  useEffect(() => {
    rawRouteRef.current = rawRoute;
  }, [rawRoute]);

  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(async () => {
      const currentRoute = rawRouteRef.current;
      if (currentRoute.length < 2) return;

      try {
        const response = await axios.post("/api/trace", {
          route: currentRoute,
          profile,
        });

        if (response.data?.trip?.legs) {
          let fullMatchedRoute: [number, number][] = [];
          
          response.data.trip.legs.forEach((leg: any) => {
            if (leg.shape) {
              const decoded = decodePolyline6(leg.shape);
              fullMatchedRoute = [...fullMatchedRoute, ...decoded];
            }
          });

          setMatchedRoute(fullMatchedRoute);
        }
      } catch (error) {
        console.error("Map matching failed", error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [profile, isTracking]); // Đã bỏ rawRoute ra khỏi mảng dependency để interval không bị reset liên tục


  const clearMatchedRoute = () => {
    setMatchedRoute([]);
    lastMatchedIndexRef.current = 0;
  };

  return { matchedRoute, clearMatchedRoute };
}
