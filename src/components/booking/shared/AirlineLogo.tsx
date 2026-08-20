import React, { useState } from "react";
import { Plane } from "lucide-react";

export function AirlineLogo({ iata }: { iata: string }) {
  const code = (iata || "").toUpperCase();
  const sources = [
    `https://images.kiwi.com/airlines/64/${code}.png`,
    `https://www.gstatic.com/flights/airline_logos/70px/${code}.png`,
  ];
  const [sourceIndex, setSourceIndex] = useState(0);
  if (!code || sourceIndex >= sources.length) {
    return <Plane className="h-3.5 w-3.5 text-slate-600" />;
  }
  return (
    <img
      src={sources[sourceIndex]}
      alt=""
      className="h-5 w-5 object-contain"
      onError={() => setSourceIndex((n) => n + 1)}
    />
  );
}
