# Catalog Domain Specification — Shafsky Aviation

## Service & Package Identity Hierarchy

```
Airport Identity (IATA Code, Terminals)
       ↓
Master Airport Package (BRONZE, SILVER, GOLD, PLATINUM)
       ↓
Included Service Descriptors (MEET_GREET, LOUNGE, FAST_TRACK, TRANSFER)
```

## Legacy ID Normalization
The `LEGACY_ID_NORMALIZATION_MAP` maps legacy alias strings (`"silver_escort"`, `"vip_lounge"`, `"fast_track"`) to canonical `ServiceId` and `AirportPackageId` enums.
