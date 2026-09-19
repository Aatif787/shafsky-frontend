# Shafsky Transportation Fleet Vehicle Assets

This directory is designated for canonical transportation vehicle imagery.

## File Naming Convention

Each canonical vehicle image must be mapped using its canonical `id` in lowercase kebab-case in modern WebP format:
```
public/images/transport/vehicles/<vehicle-id>.webp
```

## Canonical Vehicle Asset Mapping Table

### Luxury Vehicles (12 canonical IDs)
- `merc-maybach-s-class.webp` -> Mercedes-Benz Maybach S-Class
- `merc-s-class.webp` -> Mercedes-Benz S-Class (W223)
- `bmw-7-series.webp` -> BMW 7 Series (Executive Lounge)
- `audi-a8-l.webp` -> Audi A8 L Quattro
- `merc-e-class.webp` -> Mercedes-Benz E-Class
- `bmw-5-series.webp` -> BMW 5 Series
- `audi-a6.webp` -> Audi A6
- `toyota-camry-hybrid.webp` -> Toyota Camry Hybrid
- `toyota-land-cruiser.webp` -> Toyota Land Cruiser (LC300)
- `volvo-s90.webp` -> Volvo S90
- `merc-gls-maybach.webp` -> Mercedes-Maybach GLS 600
- `merc-gls.webp` -> Mercedes-Benz GLS SUV

### MUV / Large Vehicles (15 canonical IDs)
- `toyota-vellfire.webp` -> Toyota Vellfire / Alphard
- `merc-v-class.webp` -> Mercedes-Benz V-Class / EQV
- `toyota-innova-hycross.webp` -> Toyota Innova HyCross
- `toyota-innova-crysta.webp` -> Toyota Innova Crysta
- `maruti-invicto.webp` -> Maruti Suzuki Invicto
- `kia-carnival.webp` -> Kia Carnival Limousine
- `toyota-fortuner.webp` -> Toyota Fortuner 4x4
- `force-urbania-9.webp` -> Force Urbania (9-10 Seater)
- `force-urbania-12.webp` -> Force Urbania (12 Seater)
- `force-urbania-16.webp` -> Force Urbania (16 Seater)
- `force-traveller-9-12.webp` -> Force Traveller Luxury (9-12 Seater)
- `force-traveller-16.webp` -> Force Traveller (16 Seater)
- `mini-coach-18-22.webp` -> Luxury Mini Coach (18-22 Seater)
- `luxury-coach-27.webp` -> Volvo / BharatBenz Luxury Coach (27 Seater)
- `large-coach-35-45.webp` -> Executive Large Coach (35-45 Seater)

### Economy / Standard (11 canonical IDs)
- `maruti-ciaz.webp` -> Maruti Suzuki Ciaz
- `honda-city.webp` -> Honda City
- `hyundai-verna.webp` -> Hyundai Verna
- `maruti-dzire.webp` -> Maruti Suzuki Dzire
- `honda-amaze.webp` -> Honda Amaze
- `toyota-etios.webp` -> Toyota Etios
- `hyundai-aura.webp` -> Hyundai Aura
- `maruti-ertiga.webp` -> Maruti Suzuki Ertiga
- `kia-carens.webp` -> Kia Carens
- `maruti-wagonr.webp` -> Maruti Suzuki Wagon R
- `tata-altroz-ev.webp` -> Tata Altroz / Tigor EV

## Rules
- Do not commit placeholder or fake images.
- Unset vehicle images remain `undefined` in the frontend data model until verified real assets are added.
