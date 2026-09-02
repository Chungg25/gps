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
      const startIndex = lastMatchedIndexRef.current;
      const currentRoute = rawRouteRef.current;
      const segment = currentRoute.slice(startIndex);
      
      if (segment.length < 2) return;

      try {
        const response = await axios.post("/api/trace", {
          route: segment,
          profile,
        });

        if (response.data?.trip?.legs) {
          let segmentMatchedRoute: [number, number][] = [];
          
          response.data.trip.legs.forEach((leg: any) => {
            if (leg.shape) {
              const decoded = decodePolyline6(leg.shape);
              segmentMatchedRoute = [...segmentMatchedRoute, ...decoded];
            }
          });

          // Nối đoạn đường vừa nắn thành công vào tổng đoạn đường
          setMatchedRoute((prev) => [...prev, ...segmentMatchedRoute]);
          
          // Cập nhật lại chốt chặn, lùi lại 1 điểm để đoạn nối tiếp theo có sự liền mạch
          lastMatchedIndexRef.current = currentRoute.length > 0 ? currentRoute.length - 1 : 0;
        }
      } catch (error: any) {
        console.error("Map matching failed", error);
        
        // Nếu Valhalla báo lỗi 400 (do GPS mất sóng nhảy quá xa không thể nắn được)
        // Chúng ta bắt buộc phải đẩy chốt chặn qua khỏi đoạn lỗi này để không bị kẹt vĩnh viễn.
        if (error.response && error.response.status === 400) {
          lastMatchedIndexRef.current = currentRoute.length > 0 ? currentRoute.length - 1 : 0;
        }
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
