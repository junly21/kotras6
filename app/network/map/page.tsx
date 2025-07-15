"use client";

import { useEffect } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import { XYZ } from "ol/source";
import { Tile } from "ol/layer";
import { defaults } from "ol/control";
import { fromLonLat } from "ol/proj";

export default function NetworkMapPage() {
  useEffect(() => {
    console.log("NetworkMapPage: Starting map initialization...");

    // create Map instance
    const map = new Map({
      controls: defaults({ zoom: true, rotate: false }).extend([]),
      layers: [
        // VWorld Map
        new Tile({
          visible: true,
          source: new XYZ({
            url: `http://api.vworld.kr/req/wmts/1.0.0/1A2BB1EC-4324-34AA-B2D2-A9C06A2B5928/Base/{z}/{y}/{x}.png`,
          }),
        }),
      ],
      target: "network-map",
      view: new View({
        center: fromLonLat([127.189972804, 37.723058796]),
        zoom: 15,
      }),
    });

    console.log("NetworkMapPage: Map initialized successfully");

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (map) {
        map.setTarget(undefined);
      }
    };
  }, []);

  return (
    <div className="p-6 space-y-6 h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">지도 조회</h1>
        <p className="text-gray-600">네트워크 지도를 조회할 수 있습니다.</p>
      </div>

      <div className="flex-1 h-[calc(100vh-120px)]">
        <div
          id="network-map"
          className="h-full w-full rounded-lg border border-gray-200"
        />
      </div>
    </div>
  );
}
