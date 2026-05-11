window.TrelloPowerUp.initialize({
  "board-buttons": function () {
    return [
      {
        text: "Auto Clone",
        callback: function (t) {
          return t.popup({
            title: "Auto Clone",
            url: "/",
            height: 540,
            accentColor: "#2b2c2f",
          });
        },
      },
    ];
  },

  "card-buttons": function () {
    return [
      {
        text: "Auto Clone",
        callback: function (t) {
          return t.popup({
            title: "Auto Clone",
            url: "/",
            height: 540,
            accentColor: "#2b2c2f",
          });
        },
      },
    ];
  },

  "list-actions": function () {
    return [
      {
        text: "Auto Clone",
        callback: function (t) {
          return t.popup({
            title: "Auto Clone",
            url: "/",
            height: 540,
            accentColor: "#2b2c2f",
          });
        },
      },
    ];
  },
});