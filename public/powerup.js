window.TrelloPowerUp.initialize({
  "board-buttons": function () {
    return [
      {
        text: "Auto Clone",
        callback: function (t) {
          return t.popup({
            title: "Auto Clone",
            url: "/",
            height: 700,
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
            height: 700,
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
            height: 700,
          });
        },
      },
    ];
  },

  "card-back-section": function (t, options) {
    return {
      title: "Auto Clone Settings",
      icon: "/logo-white.png",
      content: {
        type: "iframe",
        url: t.signUrl("/"),
        height: 500,
      },
    };
  },
});