declare global {
  interface Window {
    TrelloPowerUp: any;
  }
}

window.TrelloPowerUp.initialize({
  "board-buttons": function () {
    return [
      {
        text: "Auto Clone",
        callback: function (t: any) {
          return t.popup({
            title: "Auto Clone",
            url: window.location.origin,
            height: 500,
          });
        },
      },
    ];
  },
});

export {};