/** Navigation descriptions, not diagnoses or promises of availability. */
export const serviceExperience: Record<string, { label: string; detail: string; prompt: string }> = {
  "appliance-repair": { label: "Appliances", detail: "Kitchen & laundry", prompt: "Fridge, oven or laundry appliance acting up? Start here." },
  cooling: { label: "Cooling", detail: "AC & comfort", prompt: "Not cooling, unusual sounds or time for maintenance?" },
  heating: { label: "Heating", detail: "Furnace & heat pump", prompt: "No heat, uneven temperatures or a seasonal check?" },
  "water-heater-repair": { label: "Hot water", detail: "Water heater repair", prompt: "No hot water or a change in performance? Tell us more." },
};