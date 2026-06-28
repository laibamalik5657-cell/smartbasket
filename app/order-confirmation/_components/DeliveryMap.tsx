"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { lerp, type Coord, type OrderStatus } from "@/lib/tracking";

type Props = {
  store: Coord;
  destination: Coord;
  progress: number; // 0..1
  status: OrderStatus;
};

function emojiIcon(emoji: string) {
  return L.divIcon({
    html: `<span style="font-size:22px;line-height:22px">${emoji}</span>`,
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export default function DeliveryMap({ store, destination, progress, status }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const riderRef = useRef<L.Marker | null>(null);

  // Initialise the map once for a given store/destination pair.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: false });
    mapRef.current = map;

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    L.polyline([store, destination], { color: "#16a34a", weight: 4, opacity: 0.7 }).addTo(map);
    L.marker(store, { icon: emojiIcon("🏬") }).addTo(map);
    L.marker(destination, { icon: emojiIcon("📍") }).addTo(map);
    riderRef.current = L.marker(store, { icon: emojiIcon("🛵") }).addTo(map);

    map.fitBounds(L.latLngBounds([store, destination]).pad(0.4));

    return () => {
      map.remove();
      mapRef.current = null;
      riderRef.current = null;
    };
  }, [store, destination]);

  // Move the rider marker as progress/status changes.
  useEffect(() => {
    const rider = riderRef.current;
    if (!rider) return;
    const t = status === "delivered" ? 1 : status === "out_for_delivery" ? progress : 0;
    rider.setLatLng(lerp(store, destination, t));
  }, [progress, status, store, destination]);

  return (
    <div
      ref={containerRef}
      className="h-64 w-full overflow-hidden rounded-xl border border-border"
      style={{ zIndex: 0 }}
    />
  );
}
