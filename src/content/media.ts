import type { MediaAsset } from "@/types/content";

export const media = {
  heroTechnician: {
    id: "hero-technician",
    src: "/images/apex-hero-technician.png",
    alt: "Technician in a navy uniform carefully inspecting residential comfort equipment",
    width: 1122,
    height: 1402,
    focalPoint: "62% 58%",
    temporary: true,
  },
  serviceDetail: {
    id: "service-detail",
    src: "/images/apex-service-detail.png",
    alt: "Gloved hands using a diagnostic instrument on residential HVAC equipment",
    width: 1536,
    height: 1024,
    focalPoint: "55% 50%",
    temporary: true,
  },
  homeInterior: {
    id: "home-interior",
    src: "/images/apex-home-interior.png",
    alt: "Comfortable modern living room with soft daylight and natural airflow",
    width: 1122,
    height: 1402,
    focalPoint: "58% 48%",
    temporary: true,
  },
  homeExterior: {
    id: "home-exterior",
    src: "/images/apex-home-exterior.png",
    alt: "Contemporary home with low-water landscaping at blue hour",
    width: 1586,
    height: 992,
    focalPoint: "68% 52%",
    temporary: true,
  },
  applianceService: {
    id: "appliance-service",
    src: "/images/apex-appliance-service.png",
    alt: "Technician diagnosing a built-in refrigerator in a Northeast home kitchen",
    width: 1536,
    height: 1024,
    focalPoint: "64% 50%",
    temporary: true,
  },
  northeastHvac: {
    id: "northeast-hvac",
    src: "/images/apex-northeast-hvac.png",
    alt: "Technician inspecting outdoor HVAC equipment beside a Northeast home",
    width: 1586,
    height: 992,
    focalPoint: "36% 50%",
    temporary: true,
  },
  // Real client-supplied photography (from /real images), copied to
  // /public/images/real with normalized lowercase, space-free filenames for
  // Vercel/Linux path safety. Not "temporary" — these are approved, permanent assets.
  realAcCleaning: {
    id: "real-ac-cleaning",
    src: "/images/real/ac-cleaning-card.jpg",
    alt: "Technician on a ladder using a multimeter to service an outdoor AC condenser unit",
    width: 1200,
    height: 1800,
    focalPoint: "50% 72%",
    temporary: false,
  },
  realHeatingUnit: {
    id: "real-heating-unit",
    src: "/images/real/heating-2-card.jpg",
    alt: "Apex technician connecting refrigerant gauges to an outdoor heat pump unit",
    width: 1086,
    height: 1448,
    focalPoint: "62% 42%",
    temporary: false,
  },
  realApplianceOven: {
    id: "real-appliance-oven",
    src: "/images/real/appliance-oven-card.jpg",
    alt: "Technician using a diagnostic tool to inspect an open range oven",
    width: 1200,
    height: 1600,
    focalPoint: "55% 55%",
    temporary: false,
  },
  realApplianceGeneric: {
    id: "real-appliance-generic",
    src: "/images/real/appliance-card.jpg",
    alt: "Technician inspecting the interior of an open refrigerator in a home kitchen",
    width: 1200,
    height: 1600,
    focalPoint: "45% 55%",
    temporary: false,
  },
  realResultDryerBefore: {
    id: "real-result-dryer-before",
    src: "/images/real/before-appliances.jpg",
    alt: "A dryer lint trap housing heavily clogged with compacted lint before cleaning",
    width: 960,
    height: 1280,
    focalPoint: "50% 45%",
    temporary: false,
  },
  realResultDryerAfter: {
    id: "real-result-dryer-after",
    src: "/images/real/after-appliances.jpg",
    alt: "The same dryer lint trap housing fully cleaned after service",
    width: 960,
    height: 1280,
    focalPoint: "50% 45%",
    temporary: false,
  },
  realResultHvacBefore: {
    id: "real-result-hvac-before",
    src: "/images/real/before-hvac-maintenance.jpg",
    alt: "A dusty, dirt-caked outdoor AC condenser coil before cleaning",
    width: 960,
    height: 1280,
    focalPoint: "50% 50%",
    temporary: false,
  },
  realResultHvacAfter: {
    id: "real-result-hvac-after",
    src: "/images/real/after-hvac-maintenance.jpg",
    alt: "The outdoor AC condenser coil visibly cleaner after maintenance",
    width: 1920,
    height: 2560,
    focalPoint: "50% 50%",
    temporary: false,
  },
  // No dedicated indoor-air-quality photo was supplied. This reuses the Apex Results
  // "after" HVAC-coil asset with a distinct id, alt text, and focal point (tight on the
  // intake grille/fin texture rather than the full coil reveal used in Results) so the
  // Services card reads as credible HVAC/air-system context without duplicating the
  // Results card's framing or claiming a specific indoor-air-quality job was photographed.
  realAirSystemGrille: {
    id: "real-air-system-grille",
    src: "/images/real/after-hvac-maintenance.jpg",
    alt: "Close-up of an HVAC unit's intake grille and coil fins",
    width: 1920,
    height: 2560,
    focalPoint: "40% 38%",
    temporary: false,
  },
  // Dedicated homepage-services-card crops (~2.2:1) for the 3 real photos whose source
  // aspect ratio is too tall/portrait to survive the card's short image band (h-44) via
  // object-position alone — a single ~28%-tall slice of the source couldn't fit both the
  // equipment and the technician action. Pre-cropped once at full resolution (no upscale,
  // no stretch) instead of fighting object-fit: cover. The category-hero pages keep using
  // the original full-frame assets above via `mediaId`; these are card-only overrides.
  realApplianceOvenCard: {
    id: "real-appliance-oven-card",
    src: "/images/real/appliance-oven-card-wide.jpg",
    alt: "Technician using a diagnostic tool to inspect an open range oven",
    width: 1200,
    height: 545,
    focalPoint: "50% 50%",
    temporary: false,
  },
  realHeatingUnitCard: {
    id: "real-heating-unit-card",
    src: "/images/real/heating-2-card-wide.jpg",
    alt: "Apex technician connecting refrigerant gauges to an outdoor heat pump unit, head and shoulders fully visible",
    width: 1086,
    height: 494,
    focalPoint: "50% 50%",
    temporary: false,
  },
  // Indoor Air Quality service card/category removed from public UI — this asset is no
  // longer referenced by services.ts, kept only so the Apex Results "after" HVAC-coil
  // media entry above isn't orphaned by a dangling reference elsewhere.
  realAirSystemGrilleCard: {
    id: "real-air-system-grille-card",
    src: "/images/real/air-system-grille-wide.jpg",
    alt: "The rounded intake grille and coil fins on top of an outdoor HVAC unit",
    width: 1920,
    height: 873,
    focalPoint: "50% 50%",
    temporary: false,
  },
  realWaterHeater: {
    id: "real-water-heater",
    src: "/images/real/water-heating.jpg",
    alt: "Technician inspecting a residential gas water heater",
    width: 1086,
    height: 1448,
    focalPoint: "50% 35%",
    temporary: false,
  },
  realWaterHeaterCard: {
    id: "real-water-heater-card",
    src: "/images/real/water-heating-wide.jpg",
    alt: "Technician inspecting the label on a residential gas water heater",
    width: 1086,
    height: 494,
    focalPoint: "50% 50%",
    temporary: false,
  },
  // Same technician/logo as realApplianceOven's source session, re-supplied by the client
  // with the current public brand name on the uniform — used for hero variety only (the
  // Appliance Repair card/category hero keep using realApplianceOven/realApplianceOvenCard).
  realApplianceFridgeApex: {
    id: "real-appliance-fridge-apex",
    src: "/images/real/appliance-refrigerator-card.jpg",
    alt: "Apex technician working inside an open refrigerator freezer compartment",
    width: 1121,
    height: 1403,
    focalPoint: "50% 35%",
    temporary: false,
  },
  realResultIceMakerBefore: {
    id: "real-result-ice-maker-before",
    src: "/images/real/ice-maker-replacement-before.jpg",
    alt: "An ice maker assembly removed from a refrigerator freezer door, held in hand",
    width: 960,
    height: 1280,
    focalPoint: "50% 50%",
    temporary: false,
  },
  realResultIceMakerAfter: {
    id: "real-result-ice-maker-after",
    src: "/images/real/ice-maker-replacement-after.jpg",
    alt: "The new ice maker assembly installed in the refrigerator freezer door",
    width: 960,
    height: 1280,
    focalPoint: "50% 50%",
    temporary: false,
  },
  realResultControlBoardBefore: {
    id: "real-result-control-board-before",
    src: "/images/real/refrigerator-control-board-before.jpg",
    alt: "A replacement refrigerator control board held in hand before installation",
    width: 960,
    height: 1280,
    focalPoint: "50% 45%",
    temporary: false,
  },
  realResultControlBoardAfter: {
    id: "real-result-control-board-after",
    src: "/images/real/refrigerator-control-board-after.jpg",
    alt: "The new refrigerator control board wired and installed in place",
    width: 960,
    height: 1280,
    focalPoint: "50% 45%",
    temporary: false,
  },
} satisfies Record<string, MediaAsset>;

export type MediaId = keyof typeof media;
