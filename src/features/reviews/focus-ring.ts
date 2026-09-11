// One shared focus system for every control on /review: a visible ring (not
// the browser's default 2px+offset outline, which layered with a
// border-color change used to read as a "double outline" — especially
// prominent on the textarea) plus a border-color change. `scroll-mt-28`
// keeps the sticky header from covering whatever the browser scrolls into
// view on focus. Same treatment on text inputs, the custom select trigger,
// the textarea, the checkbox, the star buttons, and the photo upload
// control, so focus never looks stronger on one control than another.
export const focusRing = "scroll-mt-28 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";
