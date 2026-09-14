import type { ChatAssistantReply, EmergencyKind } from "./types";

// Deliberately narrow, explainable pattern matching — not a general NLP
// classifier, and not an attempt to catch every possible emergency
// phrasing. Each pattern targets a specific high-confidence description of
// an ACTIVE, ongoing hazard (present-continuous verb forms, explicit
// leak/alarm-state language, or an unambiguous compound phrase like
// "rotten egg smell") rather than mere mention of the underlying topic —
// "gas furnace," "carbon monoxide detector," and "why do outlets spark"
// are ordinary service/informational questions and must not trigger this
// guard. Tuned against the false-positive set documented in
// docs/CHAT_ARCHITECTURE.md. A phrasing this guard doesn't catch still
// reaches Gemini, whose system prompt carries its own (secondary,
// non-deterministic) safety instructions — see system-prompt.ts.

const GAS_PATTERNS = [
  /\bsmell(?:s|ing)?\s+(?:of\s+)?gas\b/i,
  /\bgas\s+smell\b/i,
  /\brotten\s+eggs?\b/i,
  /\bgas\s+leak/i,
  /\bleak(?:ing|s)?\s+gas\b/i,
  /\bgas\b[^.?!]{0,25}\bhiss/i,
  /\bhiss\w*[^.?!]{0,25}\bgas\b/i,
];

const CO_TERM = /\b(carbon\s+monoxide|co)\b/i;
const CO_ALARM_DEVICE = /\b(alarm|detector)\b/i;
const CO_ACTIVE_STATE = /\b(going off|goes off|is off|sounding|beeping|blaring|triggered|activated|alarming)\b/i;
const CO_POISONING = /\b(carbon\s+monoxide|co)\s+poisoning\b/i;
const CO_SUSPECTED = /\bsuspect(?:ed)?\s+(?:carbon\s+monoxide|co)\b/i;

const ELECTRICAL_COMPONENT = /\b(outlets?|switch(?:es)?|panels?|breakers?|wires?|wiring|plugs?|receptacles?)\b/i;
// Present-continuous only ("sparking", not bare "spark") — deliberately
// excludes general/hypothetical phrasing like "can outlets spark?".
const ELECTRICAL_DANGER_VERB = /\b(sparking|arcing|smoking|smoldering|melting)\b/i;
const BURNING_PLASTIC = /\bburn(?:ing|t)?\s+plastic\b/i;
const EXPOSED_LIVE_WIRE = /\b(exposed|bare|live|energized)\s+wir(?:e|ing)\b/i;
const SHOCK = /\belectric(?:al)?\s+shock\b|\b(?:got|received|felt)\s+shocked\b/i;

const WATER_ELECTRICAL_PATTERNS = [
  /\bwater\b[^.?!]{0,40}\b(outlet|panel|breaker|wire|wiring|electrical)\b/i,
  /\b(outlet|panel|breaker|wire|wiring|electrical)\b[^.?!]{0,40}\bwater\b/i,
  /\bflood(?:ing|ed)?\b[^.?!]{0,40}\b(outlet|panel|breaker|electrical)\b/i,
];

const FIRE_PATTERNS = [
  /\b(?:is|are)\s+(?:on fire|smoking|ablaze)\b/i,
  /\bflames?\b/i,
  /\bhouse\s+fire\b/i,
  /\belectrical\s+fire\b/i,
  /\bcatching\s+fire\b/i,
  /\bsmoke\s+(?:is\s+)?coming\s+(?:from|out)\b/i,
];

function matchesAny(patterns: RegExp[], text: string): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

/** Inspects only the newest user message — never the full conversation
 * history, never anything from Gemini — for one of five high-confidence
 * active-hazard patterns. Checked in order of acute life-safety severity;
 * returns the first match. Returns null for ordinary service questions,
 * even ones mentioning the same topic without describing an active event. */
export function detectEmergency(message: string): EmergencyKind | null {
  if (matchesAny(GAS_PATTERNS, message)) return "gas";

  if (
    (CO_TERM.test(message) && CO_ALARM_DEVICE.test(message) && CO_ACTIVE_STATE.test(message)) ||
    CO_POISONING.test(message) ||
    CO_SUSPECTED.test(message)
  ) {
    return "carbon_monoxide";
  }

  if (
    (ELECTRICAL_COMPONENT.test(message) && ELECTRICAL_DANGER_VERB.test(message)) ||
    BURNING_PLASTIC.test(message) ||
    EXPOSED_LIVE_WIRE.test(message) ||
    SHOCK.test(message)
  ) {
    return "electrical";
  }

  if (matchesAny(WATER_ELECTRICAL_PATTERNS, message)) return "water_electrical";

  if (matchesAny(FIRE_PATTERNS, message)) return "fire_smoke";

  return null;
}

const EMERGENCY_MESSAGES: Record<EmergencyKind, string> = {
  gas: [
    "This may be a gas emergency. For your safety:",
    "1. Leave the building or area immediately.",
    "2. Do not operate switches, phones, appliances, thermostats, plugs, or anything that could create a spark while you're inside.",
    "3. Once you're safely outside, call 911 or your gas utility's emergency line from a safe location.",
    "4. Stay out of the area until authorities or the gas utility say it's safe to return.",
    "",
    "This chat isn't the right channel for a gas emergency — please use the steps above right away.",
  ].join("\n"),
  carbon_monoxide: [
    "This may be a carbon monoxide emergency. For your safety:",
    "1. Move outside to fresh air immediately.",
    "2. Call 911 or your local emergency number.",
    "3. Make sure everyone in the building is accounted for and outside.",
    "4. Don't go back inside until emergency responders say it's safe.",
    "5. Don't use the suspected appliance again until it's been professionally inspected.",
    "",
    "This chat isn't the right channel for a carbon monoxide emergency — please use the steps above right away.",
  ].join("\n"),
  fire_smoke: [
    "This may be a fire emergency. For your safety:",
    "1. Get everyone to safety and leave the building immediately.",
    "2. Call 911 / your local fire department right away.",
    "3. Don't stay behind to investigate or diagnose the source.",
    "",
    "This chat isn't the right channel for an active fire — please use the steps above right away.",
  ].join("\n"),
  electrical: [
    "This looks like an active electrical hazard. For your safety:",
    "1. Keep away from the affected outlet, panel, or wiring.",
    "2. Only stop using the affected equipment if you can do so without approaching the hazard — otherwise leave it alone.",
    "3. If there's smoke, fire, or the sparking continues, call 911 right away.",
    "4. This needs a qualified electrician or emergency service, not a DIY repair.",
    "",
    "This chat isn't the right channel for an active electrical hazard — please use the steps above right away.",
  ].join("\n"),
  water_electrical: [
    "This looks like a serious electrical hazard involving water. For your safety:",
    "1. Stay away from the water and any nearby outlets, panels, or wiring — don't walk through standing water to reach a breaker.",
    "2. If there's any immediate danger, call 911 right away.",
    "3. Contact a qualified electrician or emergency service before touching anything in the area.",
    "",
    "This chat isn't the right channel for this kind of emergency — please use the steps above right away.",
  ].join("\n"),
};

/** Constructs the full, server-authored emergency reply directly —
 * deliberately never routed through Gemini, so critical safety
 * instructions never vary by model output. `categoryId` is always null: an
 * active emergency is never a normal booking-preselection moment.
 * `intent: "call"` since every emergency message's core instruction is to
 * call for help. */
export function buildEmergencyReply(kind: EmergencyKind): ChatAssistantReply {
  return {
    message: EMERGENCY_MESSAGES[kind],
    intent: "call",
    categoryId: null,
    safety: "emergency",
    emergencyKind: kind,
  };
}
