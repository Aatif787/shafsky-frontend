import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { TransportExperience } from "../TransportExperience";

describe("TransportExperience Preselection Tests", () => {
  it("A. Preselects Mercedes-Benz Maybach S-Class", () => {
    const html = renderToString(
      <TransportExperience
        initialSubService="Luxury Vehicles"
        initialVehicleId="merc-maybach-s-class"
        initialVehicleName="Mercedes-Benz Maybach S-Class"
      />
    );
    expect(html).toContain("Mercedes-Benz Maybach S-Class");
    expect(html).toContain("merc-maybach-s-class");
    expect(html).toContain("Luxury Vehicles");
    expect(html).toContain("Selected Vehicle");
  });

  it("B. Preselects Mercedes-Benz S-Class (W223 / S450)", () => {
    const html = renderToString(
      <TransportExperience
        initialSubService="Luxury Vehicles"
        initialVehicleId="merc-s-class-w223"
        initialVehicleName="Mercedes-Benz S-Class (W223 / S450)"
      />
    );
    expect(html).toContain("Mercedes-Benz S-Class (W223 / S450)");
    expect(html).toContain("merc-s-class-w223");
    expect(html).toContain("Luxury Vehicles");
  });

  it("C. Preselects BMW 7 Series (Executive Lounge)", () => {
    const html = renderToString(
      <TransportExperience
        initialSubService="Luxury Vehicles"
        initialVehicleId="bmw-7-series"
        initialVehicleName="BMW 7 Series (Executive Lounge)"
      />
    );
    expect(html).toContain("BMW 7 Series (Executive Lounge)");
    expect(html).toContain("bmw-7-series");
    expect(html).toContain("Luxury Vehicles");
  });

  it("D. Preselects Audi A8 L Quattro", () => {
    const html = renderToString(
      <TransportExperience
        initialSubService="Luxury Vehicles"
        initialVehicleId="audi-a8-l"
        initialVehicleName="Audi A8 L Quattro"
      />
    );
    expect(html).toContain("Audi A8 L Quattro");
    expect(html).toContain("audi-a8-l");
    expect(html).toContain("Luxury Vehicles");
  });

  it("E1. Preselects MUV vehicle - Toyota Vellfire / Alphard", () => {
    const html = renderToString(
      <TransportExperience
        initialSubService="MUV / Large Vehicles"
        initialVehicleId="toyota-vellfire-alphard"
        initialVehicleName="Toyota Vellfire / Alphard (Ottoman Recliners)"
      />
    );
    expect(html).toContain("Toyota Vellfire / Alphard (Ottoman Recliners)");
    expect(html).toContain("toyota-vellfire-alphard");
    expect(html).toContain("MUV / Large Vehicles");
  });

  it("E2. Preselects Economy vehicle - Maruti Suzuki Dzire", () => {
    const html = renderToString(
      <TransportExperience
        initialSubService="Economy / Standard"
        initialVehicleId="maruti-suzuki-dzire"
        initialVehicleName="Maruti Suzuki Dzire"
      />
    );
    expect(html).toContain("Maruti Suzuki Dzire");
    expect(html).toContain("maruti-suzuki-dzire");
    expect(html).toContain("Economy / Standard");
  });

  it("E3. Preselects Economy vehicle - Executive Sedan", () => {
    const html = renderToString(
      <TransportExperience
        initialSubService="Economy / Standard"
        initialVehicleId="executive-sedan-city-ciaz"
        initialVehicleName="Executive Sedan (Honda City / Maruti Ciaz)"
      />
    );
    expect(html).toContain("Executive Sedan (Honda City / Maruti Ciaz)");
    expect(html).toContain("executive-sedan-city-ciaz");
    expect(html).toContain("Economy / Standard");
  });

  it("F. Graceful fallback when invalid or no vehicle ID is passed", () => {
    const html = renderToString(
      <TransportExperience initialSubService="Luxury Vehicles" />
    );
    expect(html).toContain("Luxury Vehicles");
    expect(html).not.toContain("Selected Vehicle");
  });
});
