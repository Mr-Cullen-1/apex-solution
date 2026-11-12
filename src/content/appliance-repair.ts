// Equipment coverage supplied by the client. These are supported appliance
// types, not separate service routes or manufacturer authorizations.
export const applianceRepairGroups = [
  {
    id: "residential",
    label: "Residential appliances",
    items: [
      "Refrigerators, freezers and ice makers",
      "Wine and beverage coolers",
      "Washers and dryers (gas and electric)",
      "Dishwashers",
      "Ovens (gas, electric, wall ovens and double ovens)",
      "Ranges, stoves and cooktops (gas, electric and induction)",
      "Microwaves (built-in and over-the-range)",
      "Warming drawers",
      "Range hoods",
    ],
  },
  {
    id: "commercial",
    label: "Commercial equipment",
    items: [
      "Commercial refrigerators and freezers (reach-in, food trucks)",
      "Ice machines",
      "Commercial ovens and cooking equipment (pizza ovens, griddles)",
      "Frozen beverage dispensers",
    ],
  },
] as const;
