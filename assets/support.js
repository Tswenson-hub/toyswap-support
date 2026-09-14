/* Support form → a pre-composed email. No network calls, no storage, no dependencies.
 *
 * Why a mailto: and not a POST to a serverless function: a form that posts somewhere
 * needs a mail-sending account, an API key held in an environment variable, and a
 * delivery path that can quietly rot without anybody noticing. This page has nothing
 * that can fail — the address is in the HTML as plain text, so it survives this file
 * failing to load, JavaScript being off, and the mail handler being unregistered.
 *
 * Everything below is progressive enhancement over that. */

(function () {
  "use strict";

  var SUPPORT_EMAIL = "tyswenson34@gmail.com";

  var form = document.getElementById("support-form");
  var status = document.getElementById("status");

  function say(message, ok) {
    if (!status) return;
    status.textContent = message;
    status.className = ok ? "status ok" : "status";
  }

  function value(id) {
    var el = document.getElementById(id);
    return el && el.value ? el.value.trim() : "";
  }

  /* The body is laid out so a reply is possible without a round trip asking for the
     basics. Unfilled optional fields are left out rather than sent as empty labels. */
  function compose() {
    var topic = value("topic") || "Something else";
    var summary = value("summary");
    var account = value("account");
    var device = value("device");
    var details = value("details");

    var subject = "ToySwap: " + topic + (summary ? " — " + summary : "");

    var lines = [];
    lines.push("Topic: " + topic);
    if (account) lines.push("Account email: " + account);
    if (device) lines.push("Device: " + device);
    lines.push("");
    lines.push(details || "(Please describe what happened.)");
    lines.push("");
    lines.push("---");
    lines.push("Sent from the ToySwap support page.");
    lines.push("Page: " + window.location.href);

    return { subject: subject, body: lines.join("\n") };
  }

  function mailtoURL(message) {
    return (
      "mailto:" + SUPPORT_EMAIL +
      "?subject=" + encodeURIComponent(message.subject) +
      "&body=" + encodeURIComponent(message.body)
    );
  }

  /* Clipboard API needs a secure context and can be refused outright; the textarea
     fallback works everywhere this page will realistically be opened. */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var scratch = document.createElement("textarea");
      scratch.value = text;
      scratch.setAttribute("readonly", "");
      scratch.style.position = "fixed";
      scratch.style.opacity = "0";
      document.body.appendChild(scratch);
      scratch.select();
      var copied = false;
      try { copied = document.execCommand("copy"); } catch (err) { copied = false; }
      document.body.removeChild(scratch);
      copied ? resolve() : reject(new Error("copy refused"));
    });
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var message = compose();
      var url = mailtoURL(message);

      /* A mailto: with a long body can exceed what some clients accept. Past a
         conservative ceiling, hand over the text instead of opening something
         truncated — a silently cut-off bug report is worse than none. */
      if (url.length > 1800) {
        copyText(SUPPORT_EMAIL + "\n\n" + message.subject + "\n\n" + message.body).then(
          function () {
            say("That message is long, so we copied it to your clipboard instead. Paste it into an email to " + SUPPORT_EMAIL + ".", true);
          },
          function () {
            say("That message is too long to open automatically. Please copy it and email it to " + SUPPORT_EMAIL + ".");
          }
        );
        return;
      }

      window.location.href = url;
      /* No way to know whether a mail client actually opened, so say what to do if
         nothing happens rather than claiming success. */
      say("Opening your email app. If nothing happens, use “Copy the message instead” and send it to " + SUPPORT_EMAIL + ".", true);
    });
  }

  var copyMessage = document.getElementById("copy-message");
  if (copyMessage) {
    copyMessage.addEventListener("click", function () {
      var message = compose();
      copyText("To: " + SUPPORT_EMAIL + "\nSubject: " + message.subject + "\n\n" + message.body).then(
        function () { say("Copied. Paste it into a new email to " + SUPPORT_EMAIL + ".", true); },
        function () { say("Your browser would not let us copy. Select the text by hand, or email " + SUPPORT_EMAIL + " directly."); }
      );
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-copy]"), function (button) {
    button.addEventListener("click", function () {
      var original = button.textContent;
      copyText(button.getAttribute("data-copy")).then(
        function () {
          button.textContent = "Copied";
          setTimeout(function () { button.textContent = original; }, 2000);
        },
        function () { say("Your browser would not let us copy. The address is " + SUPPORT_EMAIL + "."); }
      );
    });
  });
})();
