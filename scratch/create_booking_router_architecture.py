import os

# 1. BookingRouter.tsx
router_code = '''import React from "react";
import BookingView from "@/components/views/BookingView";

interface BookingRouterProps {
  searchParams?: any;
}

export function BookingRouter({ searchParams }: BookingRouterProps) {
  return <BookingView searchParams={searchParams} />;
}

export default BookingRouter;
'''

with open(r"c:\Users\aariz\OneDrive\Desktop\shafksy\shafsky-frontend-main\src\components\booking\BookingRouter.tsx", "w", encoding="utf-8") as f:
    f.write(router_code)

print("Created BookingRouter.tsx.")
