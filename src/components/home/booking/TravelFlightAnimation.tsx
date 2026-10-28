import React from "react";

/**
 * Exact analytical Catmull-Rom cubic Bezier path tracing every dot in the
 * booking panel travel animation from Map Pin 1 (left) to Map Pin 2 (right).
 */
export const TRAVEL_FLIGHT_PATH =
  "M 949.0 417.0 C 951.7 425.0, 959.4 456.4, 965.0 465.0 C 970.6 473.6, 977.9 470.3, 982.9 468.3 C 987.9 466.3, 991.3 458.5, 995.3 453.2 C 999.3 447.9, 1003.2 442.2, 1006.8 436.7 C 1010.4 431.2, 1013.5 425.9, 1016.7 420.2 C 1019.9 414.5, 1022.9 408.4, 1025.8 402.4 C 1028.6 396.3, 1031.4 389.9, 1033.8 383.9 C 1036.2 377.8, 1038.0 372.4, 1039.9 366.1 C 1041.8 359.9, 1043.7 352.9, 1045.2 346.4 C 1046.8 339.9, 1048.2 333.5, 1049.2 327.1 C 1050.2 320.7, 1050.9 314.6, 1051.5 308.0 C 1052.1 301.4, 1052.5 294.5, 1052.7 287.8 C 1052.9 281.1, 1052.8 274.4, 1052.5 268.0 C 1052.2 261.6, 1052.0 255.7, 1051.2 249.3 C 1050.5 242.9, 1049.3 236.1, 1048.0 229.7 C 1046.7 223.3, 1045.3 217.2, 1043.4 210.9 C 1041.5 204.6, 1039.2 198.1, 1036.8 191.9 C 1034.4 185.7, 1031.8 179.8, 1028.8 173.9 C 1025.8 168.0, 1022.3 162.1, 1018.8 156.5 C 1015.3 150.9, 1011.7 145.6, 1007.7 140.4 C 1003.7 135.2, 999.1 130.0, 994.7 125.2 C 990.3 120.4, 985.9 116.0, 981.1 111.6 C 976.4 107.2, 971.4 102.8, 966.2 98.7 C 961.0 94.6, 955.5 90.9, 949.9 87.2 C 944.3 83.5, 938.3 79.9, 932.6 76.7 C 926.9 73.5, 921.5 70.8, 915.5 68.0 C 909.5 65.2, 903.1 62.5, 896.9 60.2 C 890.6 57.9, 884.3 55.8, 878.0 54.0 C 871.7 52.2, 865.6 50.6, 859.1 49.2 C 852.6 47.8, 845.5 46.5, 838.9 45.6 C 832.3 44.7, 825.8 44.0, 819.3 43.6 C 812.8 43.2, 806.4 43.3, 800.0 43.5 C 793.6 43.7, 787.3 43.9, 780.8 44.7 C 774.2 45.5, 767.3 46.8, 760.7 48.2 C 754.1 49.6, 747.6 51.3, 741.4 53.3 C 735.2 55.3, 729.3 57.4, 723.3 60.1 C 717.3 62.8, 712.5 66.6, 705.5 69.4 C 698.5 72.2, 686.9 73.2, 681.5 77.1 C 676.1 81.0, 677.1 87.7, 673.4 92.7 C 669.7 97.7, 663.6 102.2, 659.5 107.3 C 655.4 112.4, 652.0 117.7, 648.7 123.2 C 645.4 128.7, 642.2 134.2, 639.8 140.3 C 637.4 146.4, 635.4 153.5, 634.1 159.9 C 632.8 166.3, 632.0 172.5, 632.1 179.0 C 632.2 185.5, 632.8 192.4, 634.5 198.7 C 636.2 204.9, 638.6 211.2, 642.2 216.5 C 645.8 221.8, 650.8 226.9, 656.1 230.5 C 661.4 234.1, 667.8 236.6, 674.1 238.1 C 680.4 239.6, 687.3 239.9, 693.9 239.4 C 700.5 238.9, 707.6 237.4, 713.7 235.0 C 719.8 232.6, 725.6 229.2, 730.3 225.0 C 735.0 220.8, 739.0 215.2, 742.0 209.5 C 745.0 203.8, 747.0 196.9, 748.0 190.5 C 749.0 184.1, 748.5 177.4, 747.7 171.0 C 746.9 164.6, 745.4 158.4, 743.3 152.2 C 741.2 146.0, 738.3 139.8, 735.1 134.0 C 731.9 128.2, 728.2 122.5, 724.3 117.3 C 720.4 112.0, 716.0 107.2, 711.5 102.5 C 707.0 97.8, 701.1 93.1, 697.3 89.4 C 693.5 85.7, 694.0 83.9, 688.7 80.1 C 683.4 76.2, 672.1 70.2, 665.4 66.3 C 658.7 62.4, 654.3 59.8, 648.4 56.8 C 642.5 53.8, 636.3 51.1, 630.1 48.6 C 623.9 46.1, 617.6 43.8, 611.3 41.9 C 605.0 40.0, 598.7 38.4, 592.2 37.1 C 585.8 35.8, 579.1 35.0, 572.6 34.3 C 566.1 33.6, 559.5 33.1, 553.0 33.0 C 546.5 32.9, 539.9 33.4, 533.4 33.9 C 526.9 34.4, 520.5 35.2, 514.0 36.2 C 507.6 37.2, 501.1 38.6, 494.7 40.2 C 488.3 41.8, 481.7 43.8, 475.4 45.9 C 469.1 48.0, 463.0 50.5, 457.0 53.0 C 451.0 55.5, 445.4 57.9, 439.6 60.8 C 433.8 63.7, 427.6 67.2, 422.0 70.5 C 416.4 73.8, 411.1 77.1, 405.7 80.8 C 400.3 84.5, 394.7 88.5, 389.4 92.6 C 384.1 96.7, 378.9 101.0, 373.9 105.4 C 368.9 109.8, 363.9 114.2, 359.2 118.9 C 354.5 123.6, 350.0 128.6, 345.7 133.6 C 341.4 138.6, 337.1 143.6, 333.2 148.9 C 329.2 154.2, 325.5 159.6, 322.0 165.2 C 318.5 170.8, 315.3 176.6, 312.3 182.5 C 309.3 188.4, 306.2 195.6, 304.2 200.8 C 302.2 206.0, 302.0 213.9, 300.3 213.6 C 298.6 213.3, 297.6 209.3, 294.0 199.0 C 290.4 188.7, 281.5 159.8, 279.0 152.0";

export interface TravelFlightAnimationProps {
  className?: string;
  durationSeconds?: number;
}

export function TravelFlightAnimation({
  className = "",
  durationSeconds = 4.2,
}: TravelFlightAnimationProps) {
  const dur = `${durationSeconds}s`;

  return (
    <svg
      viewBox="0 0 1170 696"
      preserveAspectRatio="xMidYMid meet"
      className={`absolute inset-0 w-full h-full pointer-events-none select-none overflow-visible ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Authoritative analytical path passing exactly through each dot */}
        <path id="travel-flight-path" d={TRAVEL_FLIGHT_PATH} />

        {/* Soft shadow filter for flight icon */}
        <filter id="flight-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="2"
            dy="3.5"
            stdDeviation="3"
            floodColor="#0f172a"
            floodOpacity="0.32"
          />
        </filter>

        {/* Soft glow filter for trail highlights */}
        <filter id="flight-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Subtle illuminated flight route highlight overlay */}
      <path
        d={TRAVEL_FLIGHT_PATH}
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="4 8"
        opacity="0.25"
        fill="none"
      />

      {/* Flight Icon that tracks the trajectory and rotates automatically */}
      <g filter="url(#flight-shadow)">
        {/* Continuous loop following the path with auto orientation */}
        <animateMotion
          dur={dur}
          repeatCount="indefinite"
          rotate="auto"
          keyTimes="0;0.05;0.88;0.94;1"
          keyPoints="0;0.04;0.96;1;1"
          calcMode="linear"
        >
          <mpath href="#travel-flight-path" />
        </animateMotion>

        {/* Smooth fade-in at Map Pin 1 and fade-out touchdown at Map Pin 2 */}
        <animate
          attributeName="opacity"
          dur={dur}
          repeatCount="indefinite"
          keyTimes="0;0.06;0.86;0.94;1"
          values="0;1;1;0;0"
        />

        {/* Takeoff climb and landing touchdown scale dynamic */}
        <animateTransform
          attributeName="transform"
          type="scale"
          additive="sum"
          dur={dur}
          repeatCount="indefinite"
          keyTimes="0;0.08;0.86;0.93;1"
          values="0.65;1;1;0.75;0.65"
        />

        {/* Sleek airliner aircraft: Centered at (0,0), nose oriented along +X forward axis */}
        <g transform="scale(1.85)">
          {/* Subtle engine contrail glow */}
          <circle cx="-14" cy="0" r="3.5" fill="#38bdf8" opacity="0.6" filter="url(#flight-glow)">
            <animate
              attributeName="r"
              values="2;4;2"
              dur="0.6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.3;0.7;0.3"
              dur="0.6s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Plane silhouette (Lucide plane rotated 45 deg so nose points directly along +X axis) */}
          <g transform="rotate(45) translate(-12, -12)">
            <path
              d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"
              fill="#0f172a"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}

