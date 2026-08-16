# Booking Domain Specification — Shafsky Aviation

## Booking Lifecycle Flow

```
[User Form Entry]
       ↓
[bookingApi.calculatePrice()] ---> Returns Authoritative Quote & Breakdown
       ↓
[bookingApi.create()] ----------> Backend Validation & DB Persistence
       ↓ (Success)
[Confirmed Booking Ref] ---------> Render Booking Success Pass
```

## Error Recovery Guarantees
- Submissions failing backend validation or network transport raise explicit UI errors.
- Fallback offline references are NEVER rendered as confirmed bookings on API errors.
