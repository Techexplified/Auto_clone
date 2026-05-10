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