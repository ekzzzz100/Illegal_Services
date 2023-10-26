window.onload = function () {
  const script = document.createElement("script");
  script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.body.appendChild(script);
};

/* eslint-disable no-unused-vars, no-undef */
function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: "en",
    layout: google.translate.TranslateElement.InlineLayout.VERTICAL,
    autoDisplay: false,
    exclude: [".notranslate"]
  }, "google-translate-element");
}
/* eslint-enable no-unused-vars, no-undef */

