declare global {
  interface Window {
    TrelloPowerUp: any;
  }
}

window.TrelloPowerUp.initialize({
  "board-buttons": function () {
    return [
      {
        icon: {
          dark: window.location.origin + "/logo-white.png",
          light: window.location.origin + "/logo-black.png",
        },
        text: "Auto Clone",
        callback: function (t: any) {
          return t.modal({
            title: "Auto Clone",
            url: window.location.origin,
            height: 500,
            accentColor: "#111827",
          });
        },
      },
    ];
  },
  "card-buttons": function () {
    return [
      {
        icon: window.location.origin + "/logo-white.png",
        text: "Auto Clone",
        callback: function (t: any) {
          return t.modal({
            title: "Auto Clone",
            url: window.location.origin,
            height: 500,
            accentColor: "#111827",
          });
        },
      },
    ];
  },

  "list-actions": function () {
    return [
      {
        icon: window.location.origin + "/logo-white.png",
        text: "Auto Clone",
        callback: function (t: any) {
          return t.modal({
            title: "Auto Clone",
            url: window.location.origin,
            height: 500,
            accentColor: "#111827",
          });
        },
      },
    ];
  },

  "card-back-section": function (t: any, _options: any) {
    return {
      title: "Auto Clone Settings",
      icon: window.location.origin + "/logo-white.png",
      content: {
        type: "iframe",
        url: t.signUrl(window.location.origin),
        height: 500,
      },
    };
  },
});

export {};