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
            accentColor: "#1D2125",
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
            accentColor: "#1D2125",
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
            accentColor: "#1D2125",
          });
        },
      },
    ];
  },
});