function openAutoClonePopup(t) {
  const safe = (promise, fallback) => promise.catch(() => fallback);
  return Promise.all([
    safe(t.member("all"), null),
    safe(t.lists("id", "name"), []),
    safe(t.cards("id", "name", "desc", "idList", "idMembers", "idLabels"), []),
  ]).then(function ([member, lists, cards]) {
    return t.popup({
      title: "Auto Clone",
      url: "/",
      height: 540,
      accentColor: "#2b2c2f",
      args: {
        prefetch: {
          member: member,
          lists: lists,
          cards: cards,
        },
      },
    });
  });
}

window.TrelloPowerUp.initialize({
  "board-buttons": function () {
    return [
      {
        text: "Auto Clone",
        callback: function (t) {
          return openAutoClonePopup(t);
        },
      },
    ];
  },

  "card-buttons": function () {
    return [
      {
        text: "Auto Clone",
        callback: function (t) {
          return openAutoClonePopup(t);
        },
      },
    ];
  },

  "list-actions": function () {
    return [
      {
        text: "Auto Clone",
        callback: function (t) {
          return openAutoClonePopup(t);
        },
      },
    ];
  },
});