# Chrome responsive interaction audit

Date: 2026-11-16. Local project, native Windows Chrome controlled through the computer-use interface. DevTools responsive emulation was used for viewport checks. Screenshots were inspected in-session; no screenshot files are claimed by this report. The dev-only Next indicator is excluded from production design findings.

## Observed checks and corrections

| Viewport / mode | Observation and verified outcome |
| --- | --- |
| 390x844 phone | Four service choices and contextual booking fit the initial view. Cooling selection opened the matching booking category. Empty submission showed required-field errors and focused Full Name without sending a lead. |
| 320x568 compact phone | Initial main action was too low, the dock label wrapped and dock booking lost the chosen home category. Tightened spacing, kept the label on one line and shared selection state. Rechecked Heating selection through dock booking: the modal retained Heating. Form consent and submit remained reachable by scrolling. |
| 320x568 service directory | "AC repair" initially matched unrelated name substrings. Word-prefix matching now returns one category with the AC Repair link. "roofing" displays the useful empty state; Show all restores the directory. |
| 768x1024 tablet | Header/dock and homepage layout remain usable. Mobile menu expands Cooling, opens AC Repair and closes. Dock booking on that detail route retains AC Repair. |
| 1024x768 tablet landscape | Split workspace exposes service choices and booking. 2D/3D switches render the different views, selected Hot water highlights the equipment, and Rotate/Reset changes the home angle. |
| 1440x900 desktop | Full navigation and split hero fit. Services mega-menu renders four categories. Escape closes it and restores visible trigger focus. The former large floating help launcher overlapped content actions while scrolling; the replacement icon sits in the right gutter. |
| 568x320 phone landscape | Sticky submit/header initially left too little room for fields. Short-height layout now permits form scrolling through consent and Send Request. Chat starter content scrolls independently, exposing Book a service and Talk to someone above the composer. |
| 200% actual browser zoom | Header, service choices and dock reflow without visible horizontal clipping. Booking remains within the viewport; scrolling exposes the consent text and full Send Request button. This was browser page zoom, not DevTools preview scaling. |

## Interaction and accessibility checks

- Booking keyboard sequence: Tab moves from close to service selector; Shift+Tab wraps from close to submit. Visible focus was inspected. Escape dismisses the modal.
- Desktop assistant opens within the viewport. Its Book a service shortcut opens the shared booking modal without leaving both panels open.
- Phone explorer disclosure opens and closes the optional scene. 2D, 3D and Rotate/Reset were operated at 390x844 as well as tablet width.
- DevTools emulation of `prefers-reduced-motion: reduce` was enabled. The active global reduced-motion rule and immediate 2D transition were inspected, then emulation was restored to the default.
- After the final production build, a separate local production server was opened in Chrome. The desktop homepage rendered without the development indicator; selecting Cooling updated the scene and contextual action, and Book cooling opened a modal with Cooling preselected. The browser was returned to the existing development server afterward and the temporary production server was stopped.
- No horizontal clipping was visible in the inspected screens. This is visual sampling, not a claim about every route, browser or arbitrary viewport.

## Scope limits

No physical-device keyboard, iOS Safari, Firefox, screen reader, live call, valid booking submission, delivery notification or live AI reply was tested. No Web Vitals or conversion-rate measurements were collected. The browser audit covers representative shared layouts and safe client interactions, with the public HTTP suite covering route responses separately.
