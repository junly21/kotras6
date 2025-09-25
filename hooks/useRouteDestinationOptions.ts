import { useState, useCallback } from "react";
import { StationOption } from "@/types/routeSearch";

export const useRouteDestinationOptions = () => {
  const [destinationOptions, setDestinationOptions] = useState<StationOption[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchDestinationOptions = useCallback(
    async (pathGrpId: string, rideStationId: string) => {
      if (!rideStationId || !pathGrpId) {
        setDestinationOptions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/route-search/stations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            PATH_GRP_ID: pathGrpId,
            RIDE_STN_ID: rideStationId,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setDestinationOptions(data.options || []);
      } catch (error) {
        console.error("도착역 옵션 로드 실패:", error);
        setDestinationOptions([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearDestinationOptions = useCallback(() => {
    setDestinationOptions([]);
  }, []);

  return {
    destinationOptions,
    isLoading,
    fetchDestinationOptions,
    clearDestinationOptions,
  };
};
