# Flight Domain Specification — Shafsky Aviation

## Flight Verification Lifecycle
1. User enters flight number (e.g., `AI302`) and departure date.
2. `flightApi.verify()` invokes FastAPI backend `/api/flights/verify`.
3. Backend fetches real flight status, origin, destination, schedules, and aircraft info from flight tracking APIs.
4. Response returns normalized `FlightData` payload to populate booking experience.
