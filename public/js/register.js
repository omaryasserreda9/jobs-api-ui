(function () {
  const matchHint = document.getElementById("match-hint");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");

  function updateMatchHint() {
    const p = passwordInput.value;
    const c = confirmInput.value;
    if (!c) {
      matchHint.textContent = "";
      matchHint.className = "match-hint";
      return;
    }
    if (p === c) {
      matchHint.textContent = "Passwords match.";
      matchHint.className = "match-hint match-hint--ok";
    } else {
      matchHint.textContent = "Passwords do not match yet.";
      matchHint.className = "match-hint match-hint--bad";
    }
  }

  passwordInput.addEventListener("input", updateMatchHint);
  confirmInput.addEventListener("input", updateMatchHint);

  document.querySelectorAll(".toggle-pw").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-target");
      var input = document.getElementById(id);
      if (!input) return;
      if (input.type === "password") {
        input.type = "text";
        btn.textContent = "Hide";
      } else {
        input.type = "password";
        btn.textContent = "Show";
      }
    });
  });
})();
