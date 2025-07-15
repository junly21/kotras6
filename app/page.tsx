"use client";

import { useEffect } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import { XYZ } from "ol/source";
import { Tile } from "ol/layer";
import { defaults } from "ol/control";
import { fromLonLat } from "ol/proj";

export default function Home() {
  useEffect(() => {
    console.log("Home: Starting map initialization...");

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
      target: "map",
      view: new View({
        center: fromLonLat([127.189972804, 37.723058796]),
        zoom: 15,
      }),
    });

    console.log("Home: Map initialized successfully");

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (map) {
        map.setTarget(undefined);
      }
    };
  }, []);

  return (
    <div>
      <h1>VWorld Map Test</h1>
      <div
        id="map"
        style={{
          width: "100%",
          height: "600px",
          border: "1px solid #ccc",
        }}></div>
    </div>
  );
}
