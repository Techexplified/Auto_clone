var safe = function (promise, fallback) {
  return promise.catch(function () { return fallback; });
};

/**
 * context: "board" | "list" | "card"
 * Pass context via URL query param for reliable detection in the React app.
 */
function openPopup(t, context) {
  return t.popup({
    url: "./index.html?ctx=" + context + "&v=" + Date.now(),
    height: 400,
    accentColor: "#2b2c2f",
    args: {
      context: context,
    },
  });
}

window.TrelloPowerUp.initialize({
  "board-buttons": function () {
    return [{
      text: "Auto Clone",
      callback: function (t) { return openPopup(t, "board"); },
    }];
  },

  "card-buttons": function () {
    return [{
      text: "Auto Clone",
      callback: function (t) { return openPopup(t, "card"); },
    }];
  },

  "list-actions": function () {
    return [{
      text: "Auto Clone",
      callback: function (t) { return openPopup(t, "list"); },
    }];
  },
});