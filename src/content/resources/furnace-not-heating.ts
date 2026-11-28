import "server-only";
import type { Resource, ResourceBlock, ResourceInline } from "@/types/resource";
import { resourceSources } from "./sources";

// Research, source mapping and outstanding approvals: docs/editorial/ARTICLE_1_CONTENT_BRIEF.md.
const text = (value: string): readonly ResourceInline[] => [{ type: "text", text: value }];
const paragraph = (value: string): ResourceBlock => ({ type: "paragraph", children: text(value) });
const heading = (level: 2 | 3, id: string, value: string): ResourceBlock => ({ type: "heading", level, id, text: value });
const sourceLink = (key: keyof typeof resourceSources, label: string = resourceSources[key].title): ResourceInline => ({ type: "link", href: resourceSources[key].href, text: label });
const photo = (filename: string, alt: string, caption: string): ResourceBlock => ({ type: "image", image: { src: `/resources/furnace-not-heating-common-problems/${filename}.webp`, width: 1600, height: 900 }, alt, caption });

export const furnaceArticleDraft: Pick<Resource, "content" | "faqs" | "readingTime" | "editorialNote" | "featuredImage" | "featuredImageAlt" | "featuredImageCaption"> = {
  readingTime: 9,
  featuredImage: { src: "/resources/furnace-not-heating-common-problems/residential-gas-furnace-hero.webp", width: 1600, height: 900 },
  featuredImageAlt: "AI-generated illustration of a residential gas furnace with closed panels and connected ductwork in a clean basement.",
  featuredImageCaption: "AI-generated illustration; equipment layouts vary. Not an actual Apex installation.",
  editorialNote: "Editorially enhanced draft with original AI illustrations and verified CPSC/DOE source links. Apex Home Services is the approved organization author. Qualified HVAC/safety approval and final image approval remain pending. Publication date must be assigned only at authorized publication. See docs/editorial/ARTICLE_1_ENHANCEMENT_REPORT.md. Keep status draft.",
  content: [
    paragraph("A furnace not heating raises a question: is there a setting to check, or does the system need service? The answer depends on its behavior and warning signs. A running fan does not necessarily mean the furnace is producing heat."),
    paragraph("For homeowners in New York, New Jersey, Connecticut, Massachusetts, and Rhode Island, this guide covers forced-air furnace troubleshooting. Boilers, heat pumps, and other heating systems need different checks."),
    { type: "callout", tone: "warning", title: "Check for danger before troubleshooting", children: text("If a carbon monoxide alarm sounds, or you suspect carbon monoxide exposure, get everyone outside immediately and call 911. If you smell gas or suspect a gas leak, leave immediately; call 911 or your gas utility from a safe location outside. Do not operate switches, thermostats, plugs, or phones inside, and avoid flames. Do not reenter until emergency responders say it is safe. Skip every troubleshooting step below in these situations.") },

    heading(2, "how-a-furnace-works", "How does a furnace heat your home?"),
    paragraph("The thermostat requests heat, the furnace generates it, and a blower moves warmed air through ducts. Return ducts bring room air back to the system. In a gas furnace, combustion heats a heat exchanger, which transfers warmth to the circulating air while keeping combustion gases separate and venting them outdoors. Gas equipment still needs electricity for controls and airflow."),
    paragraph("Oil furnaces use a different burner and fuel-delivery arrangement. Electric furnaces use resistance elements rather than a gas burner or pilot. Older gas models may have a standing pilot; many newer models use electronic ignition. Identify your equipment from its accessible label and owner's manual before assuming a particular component is present."),

    heading(2, "seven-common-problems", "Seven common reasons your furnace is not heating"),
    heading(3, "thermostat", "1. Thermostat settings or a thermostat fault"),
    paragraph("Confirm Heat mode and a set temperature above room temperature. Check schedules, vacation settings, and user-replaceable batteries. Follow the manual and allow for its normal startup delay."),
    paragraph("A fan set to On can circulate room-temperature air between heating cycles. Auto normally runs it with the system's heating cycle. If the display stays blank or the furnace does not respond, a thermostat, wiring, or control problem may need diagnosis. Do not remove wiring or jumper terminals."),

    heading(3, "dirty-filter", "2. A dirty or incorrectly fitted air filter"),
    { type: "paragraph", children: [...text("A clogged filter restricts airflow, as explained in the "), sourceLink("filters", "U.S. Department of Energy's filter guidance"), ...text(". Some furnaces then overheat and shut off heat through a safety control. A clean filter does not rule out other airflow problems.")] },
    paragraph("Inspect or replace a filter only if the owner's manual identifies it as homeowner-accessible. Follow the manual's shutdown instructions, use the specified size and type, and match the airflow arrow. Do not run without a filter or open burner or electrical compartments. If heat does not return, arrange service instead of repeatedly restarting the system."),
    photo("dirty-and-clean-furnace-air-filters", "AI-generated comparison of a dust-clogged pleated furnace filter beside a clean replacement filter.", "AI-generated comparison. Use the filter size and type specified for your system."),

    heading(3, "power", "3. A power interruption or tripped circuit breaker"),
    paragraph("Gas and oil furnaces also need electricity. Check household power and utility outage notices. You may observe a clearly labeled furnace service switch or breaker from a safe position without removing covers."),
    paragraph("Do not reset a tripped breaker as part of this guide: it may indicate an electrical fault. Leave an unexpectedly off switch alone if you do not know why it was turned off. A qualified professional should investigate. Never touch electrical equipment that is wet, damaged, sparking, or unusually hot."),

    heading(3, "ignition", "4. Ignition, pilot, or flame-detection problems"),
    paragraph("A gas furnace may start but fail to establish or maintain a flame. Depending on the model, an electronic igniter, standing pilot, or flame-sensing component could be involved. Electric furnaces do not have these combustion parts."),
    paragraph("Repeated clicking or short starts are observations to report, not a reliable diagnosis. Do not relight a pilot, clean a flame sensor, adjust a burner, or repeatedly reset a lockout using this guide. Record any fault code visible through an existing viewing window and let a professional follow the model-specific procedure."),

    heading(3, "fuel-supply", "5. An interrupted fuel supply"),
    paragraph("Natural-gas service interruptions differ from an empty propane or heating-oil tank. For delivered fuel, check your delivery account or a safely accessible gauge; contact the supplier if supply is uncertain."),
    paragraph("Do not turn fuel valves, disconnect lines, bleed an oil line, or restart equipment after running out of fuel yourself. Leave restoration and safe restart to the appropriate provider. Suspected gas leakage takes priority over checking an account or gauge: leave the property and call for help from outside."),

    heading(3, "blower-airflow", "6. Blower motor or airflow problems"),
    paragraph("Weak airflow, unusual humming or grinding, or uneven room temperatures can accompany a blower problem. Filters, ducts, and blocked grilles can produce overlapping symptoms; sound alone cannot identify a failed motor."),
    paragraph("Move furniture or rugs away from accessible supply registers and return grilles. Leave blower wheels, belts, motors, capacitors, and wiring to a professional. For new mechanical noises or little airflow, stop troubleshooting and request an assessment instead of forcing more cycles."),

    heading(3, "safety-controls", "7. A limit switch or another system component"),
    paragraph("A high-temperature limit control can stop heating when a furnace overheats; the blower may continue moving cooler air. That does not prove the switch itself is defective. Restricted airflow or another underlying fault may have triggered it."),
    paragraph("Other model-dependent causes include flame-sensing faults, venting-related safety controls, or a blocked condensate drain on some condensing furnaces. Never bypass a safety switch, clear internal tubing, or replace controls yourself. A professional must identify the underlying cause."),

    heading(2, "safe-homeowner-checks", "A safe homeowner troubleshooting checklist"),
    paragraph("Continue only without alarms, suspected leaks, smoke, or electrical hazards. Follow the manual; stop for tools, unfamiliar access, or uncertainty."),
    { type: "list", ordered: true, items: [
      text("Confirm Heat mode, temperature, schedule, and user-replaceable batteries."),
      text("Inspect a homeowner-accessible filter using the manual's shutdown and replacement instructions."),
      text("Remove ordinary obstructions from room registers and return grilles; do not dismantle ducts or the furnace."),
      text("Check utility outage notices or delivered-fuel records without operating fuel equipment."),
      text("Record room temperature, startup behavior, noises, and externally visible fault codes."),
    ] },
    heading(3, "winter-vent-safety", "Winter check: snow and ice around outdoor vents"),
    { type: "paragraph", children: [...text("Some fuel-burning furnaces use outdoor intake and exhaust pipes. Snow or ice can obstruct combustion air or exhaust, interrupt operation, and create a carbon monoxide hazard. "), sourceLink("winterVents", "CPSC's winter safety guidance"), ...text(" advises keeping snow away from exterior fuel-burning appliance vents.")] },
    paragraph("From safe, stable ground, look for buried openings, snowdrifts against vent mouths, or ice covering them. If safely accessible, move only loose snow away from the surrounding area without touching the vent. Never climb onto roofs or ladders, chip ice, insert tools, or dismantle vent components. Contact a qualified HVAC professional for blocked, iced-over, damaged, or inaccessible vents, or continued heating failure. Follow the emergency instructions above if an alarm sounds or CO exposure is suspected."),
    photo("snow-blocked-furnace-intake-vent", "AI-generated winter scene showing snow partially blocking a downward-facing furnace intake beside a home's exterior wall.", "AI-generated hazard illustration, not an installation guide. Vent layouts and required clearances vary."),

    heading(2, "call-a-professional", "When should you stop and call a professional?"),
    paragraph("Request service if basic checks do not restore heat, the furnace repeatedly stops, airflow remains weak, or a breaker has tripped. Share the model, fuel type, symptoms, and checks completed; you do not need to diagnose the failed part."),
    photo("professional-furnace-inspection", "AI-generated illustration of an HVAC professional using a flashlight and handheld instrument beside a closed furnace.", "AI-generated service illustration; not an Apex employee or documented service visit."),
    { type: "paragraph", children: [...text("Move somewhere warm if your home becomes unsafe. Never use an oven for heat. Following "), sourceLink("winterHeating", "CPSC's space-heater safety guidance"), ...text(", plug electric heaters directly into a wall outlet, never an extension cord or power strip; keep combustibles at least three feet away and turn heaters off before sleeping. Also turn them off whenever you leave the room.")] },

    heading(2, "urgent-warning-signs", "Warning signs that require immediate attention"),
    { type: "paragraph", children: [...text("Carbon monoxide has no smell or color. Headache, dizziness, nausea, or confusion may signal exposure. If suspected, get outside and call 911 without waiting for an alarm. The "), sourceLink("carbonMonoxide", "CPSC Carbon Monoxide Fact Sheet"), ...text(" also recommends CO alarms with battery backup or battery power on every level and outside sleeping areas, plus annual professional heating-system inspection. Follow alarm testing and replacement instructions; flame color cannot establish that the air is safe.")] },
    paragraph("A gas odor or suspected gas-line hissing calls for immediate evacuation without operating equipment. Smoke, fire, or active sparking also calls for leaving the area and contacting emergency services. Do not restart unsafe equipment. An unexplained burning smell, soot, or damaged venting needs professional attention; do not dismiss it as normal startup behavior."),

    heading(2, "repair-or-replace", "Repair or replacement: what should you consider?"),
    paragraph("One no-heat event does not automatically mean replacement. Ask for a written diagnosis explaining the failure, cause, and whether safe operation can be restored. Compare a specific repair quote with a complete replacement proposal."),
    paragraph("Consider condition, repair history, parts availability, warranty terms, and comfort. Frequent repairs or rising bills warrant assessment, but weather, energy rates, insulation, and ducts also affect bills. Replacement planning should address sizing and fuel, electrical, duct, and venting requirements. Compare quote inclusions; avoid decisions based only on age or promised savings."),

    heading(2, "sources-further-reading", "Sources and further reading"),
    { type: "list", ordered: false, items: [sourceLink("carbonMonoxide"), sourceLink("winterVents"), sourceLink("winterHeating"), sourceLink("filters")].map((link) => [link]) },

    heading(2, "request-furnace-help", "Get help with a furnace that is not working"),
    { type: "paragraph", children: [
      ...text("For non-emergency help, review "),
      { type: "link", href: "/services/heating/furnace-repair", text: "furnace repair options" },
      ...text(" or learn about "),
      { type: "link", href: "/services/heating/heating-maintenance", text: "heating maintenance" },
      ...text(". Apex Home Services is a platform connecting homeowners with independent local professionals. Submit your ZIP code and describe the problem through the booking flow; service coverage and appointment availability need confirmation. For a suspected gas leak, carbon monoxide exposure, or another emergency, contact emergency services instead of submitting a booking request."),
    ] },
  ],
  faqs: [
    { question: "Why is my furnace blowing cold air?", answer: text("The fan may be running between heating cycles, or an ignition, fuel, airflow, or safety-control problem may prevent heating. Check thermostat settings if there are no hazards. Persistent cold airflow needs diagnosis; it does not identify one failed component.") },
    { question: "Should I reset a furnace that is not working?", answer: text("Do not repeatedly press reset or cycle power to clear a fault. Reset procedures and limits vary, particularly for oil burners and gas ignition lockouts. Record an accessible fault code and seek professional guidance. Never restart equipment after a suspected leak or other unsafe condition until it is cleared for use.") },
    { question: "Does every furnace have a pilot light?", answer: text("No. Some older gas furnaces use a standing pilot, while many newer models use electronic ignition. Electric furnaces have no gas pilot. Check the model's documentation and leave ignition troubleshooting to a qualified professional.") },
    { question: "How do I choose furnace repair near me?", answer: text("Confirm that the provider serves your ZIP code and works on your furnace's fuel type and model. Ask about applicable licensing, diagnostic charges, written estimates, and scheduling. Verify these details with the independent provider; a platform listing alone does not establish qualifications or availability.") },
    { question: "Can maintenance prevent heating system problems?", answer: text("Maintenance can identify developing issues and keep specified checks on schedule, but it cannot guarantee uninterrupted heating. Follow the manufacturer's maintenance guidance and arrange professional inspection of fuel-burning equipment. Filter care and keeping room grilles clear are useful ongoing homeowner tasks when performed safely.") },
  ],
};
