import { useEffect, useMemo, useState } from "react";
import SelectField from "./components/SelectField";
import {
  expiryOptions,
  positionOptions,
  repeatOptions,
  weekdayOptions,
  dayOfMonthOptions,
} from "./data/options";

type TrelloCard = {
  id: string;
  name: string;
  desc?: string;
  idList: string;
  idLabels?: string[];
  idMembers?: string[];
};

type TrelloList = {
  id: string;
  name: string;
};

type CloneRule = {
  id: string;
  srcId: string;
  srcName: string;
  listId: string;
  listName: string;
  repeat: string;
  weekday: string;
  dayOfMonth: number;
  time: string;
  pos: string;
  expiry: string;
  active: boolean;
  lastRun: string | null;
  created: string;
};

declare global {
  interface Window {
    TrelloPowerUp: any;
  }
}

const RULES_KEY = "autoCloneRules";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ── Scheduling helpers ───────────────────────────────── */

function isDue(rule: CloneRule): boolean {
  if (!rule.active) return false;
  const now = new Date();

  // Expiry check
  if (rule.expiry !== "never") {
    const exp = new Date(rule.expiry);
    if (now > exp) return false;
  }

  // Already ran today / this period?
  if (rule.lastRun) {
    const lr = new Date(rule.lastRun);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lrDay = new Date(lr.getFullYear(), lr.getMonth(), lr.getDate());

    if (rule.repeat === "Daily" && lrDay >= today) return false;
    if (rule.repeat === "Weekly") {
      const diff = (today.getTime() - lrDay.getTime()) / 864e5;
      if (diff < 6) return false;
    }
    if (rule.repeat === "Monthly") {
      if (lr.getMonth() === now.getMonth() && lr.getFullYear() === now.getFullYear()) return false;
    }
  }

  // Time gate
  const [h, m] = (rule.time || "00:00").split(":").map(Number);
  if (now.getHours() < h || (now.getHours() === h && now.getMinutes() < m)) return false;

  // Day gate
  if (rule.repeat === "Weekly") {
    const idx = weekdayOptions.indexOf(rule.weekday);
    if (idx >= 0 && idx !== now.getDay()) return false;
  }
  if (rule.repeat === "Monthly") {
    if (rule.dayOfMonth !== now.getDate()) return false;
  }

  return true;
}

function computeExpiry(option: string): string {
  if (option === "Never") return "never";
  const now = new Date();
  const map: Record<string, number> = {
    "1 Week": 7, "2 Weeks": 14, "1 Month": 30, "3 Months": 90, "6 Months": 180,
  };
  now.setDate(now.getDate() + (map[option] ?? 30));
  return now.toISOString();
}

/* ── Component ────────────────────────────────────────── */

function App() {
  const [t, setT] = useState<any>(null);
  const [view, setView] = useState<"form" | "rules" | "account">("form");
  const [member, setMember] = useState<{ fullName?: string; username?: string; avatarUrl?: string } | null>(null);

  const [cards, setCards] = useState<TrelloCard[]>([]);
  const [lists, setLists] = useState<TrelloList[]>([]);
  const [loading, setLoading] = useState(true);

  const [cardQuery, setCardQuery] = useState("");
  const [cardMenuOpen, setCardMenuOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState("");

  const [repeat, setRepeat] = useState("Weekly");
  const [weekday, setWeekday] = useState("Monday");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [atTime, setAtTime] = useState("09:00");
  const [expiry, setExpiry] = useState("1 Month");
  const [position, setPosition] = useState("Top");
  const [targetListName, setTargetListName] = useState("");

  const [rules, setRules] = useState<CloneRule[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  /* ── Init iframe client ── */
  useEffect(() => {
    let attempt = 0;
    const id = window.setInterval(() => {
      attempt += 1;
      try {
        const c = window.TrelloPowerUp?.iframe?.();
        if (c) { setT(c); window.clearInterval(id); }
      } catch { /* wait */ }
      if (attempt >= 30) window.clearInterval(id);
    }, 120);
    return () => window.clearInterval(id);
  }, []);

  /* ── Resize ── */
  useEffect(() => {
    if (!t?.render || !t?.sizeTo) return;
    try { t.render(() => { t.sizeTo("#root").catch(() => {}); }); } catch { /* */ }
  }, [t]);

  useEffect(() => {
    if (!t?.sizeTo) return;
    const id = window.requestAnimationFrame(() => { t.sizeTo("#root").catch(() => {}); });
    return () => window.cancelAnimationFrame(id);
  }, [t, cardMenuOpen, view, cards.length, rules.length]);

  /* ── Fetch board data (3-layer fallback) ── */
  useEffect(() => {
    if (!t) return;
    let cancelled = false;

    async function resolveBoardId() {
      const ctx = await t.getContext().catch(() => ({}));
      if (ctx?.board) return ctx.board as string;
      const board = await t.board("id").catch(() => null);
      return board?.id ?? "";
    }

    async function fetchRest() {
      const api = await t.getRestApi();
      const ok = await api.isAuthorized();
      if (!ok) await api.authorize({ scope: "read,write", expiration: "never" });
      const bid = await resolveBoardId();
      const [me, ls, cs] = await Promise.all([
        api.get("members/me", { fields: "fullName,username,avatarUrl" }).catch(() => null),
        bid ? api.get(`boards/${bid}/lists`, { fields: "id,name", filter: "open" }).catch(() => []) : [],
        bid ? api.get(`boards/${bid}/cards`, { fields: "id,name,desc,idList,idMembers,idLabels", filter: "open" }).catch(() => []) : [],
      ]);
      return { me, ls, cs };
    }

    async function load() {
      setLoading(true);
      try {
        const pf = (await t.arg("prefetch").catch(() => null)) ?? {};
        const sp = (await t.get("board", "shared", "autoClonePrefetch").catch(() => null)) ?? {};

        let mem = pf.member ?? sp.member ?? null;
        let bLists = pf.lists ?? sp.lists ?? [];
        let bCards = pf.cards ?? sp.cards ?? [];
        const curCard = pf.currentCard ?? sp.currentCard ?? null;

        if (!mem || !Array.isArray(bLists) || !Array.isArray(bCards)) {
          const [m, l, c] = await Promise.all([
            t.member("all").catch(() => null),
            t.lists("id", "name").catch(() => []),
            t.cards("id", "name", "desc", "idList", "idMembers", "idLabels").catch(() => []),
          ]);
          mem = mem ?? m;
          bLists = bLists?.length ? bLists : l;
          bCards = bCards?.length ? bCards : c;
        }

        if (!mem?.username || !bLists?.length || !bCards?.length) {
          try {
            const { me, ls, cs } = await fetchRest();
            mem = { ...(mem ?? {}), ...(me ?? {}) };
            if (!bLists?.length && Array.isArray(ls)) bLists = ls;
            if (!bCards?.length && Array.isArray(cs)) bCards = cs;
          } catch { /* keep fallback */ }
        }

        if (cancelled) return;

        setMember({
          fullName: mem?.fullName ?? mem?.name,
          username: mem?.username ?? mem?.membername,
          avatarUrl: mem?.avatarUrl ?? mem?.avatarURL,
        });

        const normLists = (bLists ?? []).map((l: any) => ({ id: l.id, name: l.name }));
        setLists(normLists);
        if (normLists.length) setTargetListName((p) => p || normLists[0].name);

        const normCards = (bCards ?? [])
          .filter((c: any) => c?.id && c?.name)
          .map((c: any) => ({
            id: c.id, name: c.name, desc: c.desc ?? "",
            idList: c.idList, idMembers: c.idMembers ?? [], idLabels: c.idLabels ?? [],
          }));
        if (curCard?.id && curCard?.name && !normCards.some((c: TrelloCard) => c.id === curCard.id)) {
          normCards.unshift({
            id: curCard.id, name: curCard.name, desc: curCard.desc ?? "",
            idList: curCard.idList ?? normLists[0]?.id ?? "",
            idMembers: curCard.idMembers ?? [], idLabels: curCard.idLabels ?? [],
          });
        }
        setCards(normCards);
      } catch {
        if (!cancelled) { setLists([]); setCards([]); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [t]);

  /* ── Load saved rules ── */
  useEffect(() => {
    if (!t) return;
    t.get("board", "shared", RULES_KEY)
      .then((data: CloneRule[] | null) => { if (Array.isArray(data)) setRules(data); })
      .catch(() => {});
  }, [t]);

  /* ── Auto-execute due rules on popup open ── */
  useEffect(() => {
    if (!t || !rules.length || loading) return;
    let ran = false;

    async function runDue() {
      const api = await t.getRestApi();
      const ok = await api.isAuthorized();
      if (!ok) return;

      const updated = [...rules];
      const names: string[] = [];

      for (let i = 0; i < updated.length; i++) {
        const r = updated[i];
        if (!isDue(r)) continue;
        try {
          await api.post("cards", {
            idCardSource: r.srcId,
            idList: r.listId,
            pos: r.pos === "Top" ? "top" : "bottom",
            keepFromSource: "attachments,checklists,comments,labels,members,stickers",
          });
          updated[i] = { ...r, lastRun: new Date().toISOString() };
          names.push(r.srcName);
          ran = true;
        } catch { /* skip failed */ }
      }

      if (ran) {
        setRules(updated);
        await t.set("board", "shared", RULES_KEY, updated).catch(() => {});
        showToast(`Auto-cloned: ${names.join(", ")}`);
      }
    }

    runDue();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, loading]);

  /* ── Derived state ── */
  const selectedCard = useMemo(() => cards.find((c) => c.id === selectedCardId) ?? null, [cards, selectedCardId]);

  const listNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const l of lists) m.set(l.id, l.name);
    return m;
  }, [lists]);

  const filteredCards = useMemo(() => {
    const q = cardQuery.trim().toLowerCase();
    if (!q) return cards.slice(0, 40);
    return cards.filter((c) => c.name.toLowerCase().includes(q) || (listNameById.get(c.idList) ?? "").toLowerCase().includes(q)).slice(0, 40);
  }, [cards, cardQuery, listNameById]);

  const targetList = useMemo(() => lists.find((l) => l.name === targetListName) ?? null, [lists, targetListName]);

  // Auto-select first card
  useEffect(() => {
    if (!cards.length || selectedCardId) return;
    setSelectedCardId(cards[0].id);
    setCardQuery(cards[0].name);
  }, [cards, selectedCardId]);

  // Auto-set target list to source card's list
  useEffect(() => {
    if (!selectedCard) return;
    const name = listNameById.get(selectedCard.idList);
    if (name) setTargetListName(name);
  }, [selectedCard, listNameById]);

  /* ── Actions ── */
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  async function persistRules(next: CloneRule[]) {
    setRules(next);
    if (t) await t.set("board", "shared", RULES_KEY, next).catch(() => {});
  }

  async function onSave() {
    if (!t || saving) return;
    if (!selectedCard) { showToast("⚠ Select a card first"); return; }
    if (!targetList) { showToast("⚠ Select a target list"); return; }

    setSaving(true);
    try {
      const rule: CloneRule = {
        id: uid(),
        srcId: selectedCard.id,
        srcName: selectedCard.name,
        listId: targetList.id,
        listName: targetList.name,
        repeat,
        weekday,
        dayOfMonth: parseInt(dayOfMonth, 10),
        time: atTime || "09:00",
        pos: position,
        expiry: computeExpiry(expiry),
        active: true,
        lastRun: null,
        created: new Date().toISOString(),
      };

      // Also clone immediately for the first time
      const api = await t.getRestApi();
      const ok = await api.isAuthorized();
      if (!ok) await api.authorize({ scope: "read,write", expiration: "never" });

      await api.post("cards", {
        idCardSource: selectedCard.id,
        idList: targetList.id,
        pos: position === "Top" ? "top" : "bottom",
        keepFromSource: "attachments,checklists,comments,labels,members,stickers",
      });

      rule.lastRun = new Date().toISOString();
      await persistRules([...rules, rule]);
      showToast(`✓ Rule created & first clone done!`);
    } catch {
      showToast("✗ Failed to create rule. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRule(id: string) {
    await persistRules(rules.filter((r) => r.id !== id));
    showToast("Rule deleted");
  }

  async function toggleRule(id: string) {
    const next = rules.map((r) => (r.id === id ? { ...r, active: !r.active } : r));
    await persistRules(next);
  }

  /* ── Render helpers ── */
  function scheduleLabel(r: CloneRule) {
    if (r.repeat === "Daily") return `Daily at ${r.time}`;
    if (r.repeat === "Weekly") return `Every ${r.weekday} at ${r.time}`;
    return `Monthly on day ${r.dayOfMonth} at ${r.time}`;
  }

  function expiryLabel(r: CloneRule) {
    if (r.expiry === "never") return "No expiry";
    const d = new Date(r.expiry);
    return `Expires ${d.toLocaleDateString()}`;
  }

  /* ── JSX ── */
  return (
    <div className="p-3 text-[#B6C2CF] w-full">
      {/* Toast */}
      {toast && (
        <div className="fixed top-2 left-2 right-2 z-[999] bg-[#1D2125] border border-[#579DFF] text-[#B6C2CF] text-[12px] px-3 py-2 rounded-[8px] shadow-xl animate-pulse">
          {toast}
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {view !== "form" ? (
          <button type="button" onClick={() => setView("form")}
            className="h-7 w-7 rounded-[6px] border border-[#3B444C] bg-[#22272B] hover:bg-[#2C333A] transition grid place-items-center"
            aria-label="Back">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9FADBC]"><path d="m15 18-6-6 6-6" /></svg>
          </button>
        ) : <div />}

        <div className="flex items-center gap-1.5">
          {/* Rules button */}
          <button type="button" onClick={() => { setView(view === "rules" ? "form" : "rules"); setCardMenuOpen(false); }}
            className="h-7 px-2 rounded-[6px] border border-[#3B444C] bg-[#22272B] hover:bg-[#2C333A] transition flex items-center gap-1 text-[11px] text-[#9FADBC]">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            {rules.filter((r) => r.active).length || 0}
          </button>

          {/* Profile */}
          <button type="button" onClick={() => { setView(view === "account" ? "form" : "account"); setCardMenuOpen(false); }}
            className="h-7 w-7 rounded-full border border-[#3B444C] bg-[#22272B] hover:bg-[#2C333A] transition overflow-hidden grid place-items-center"
            aria-label="Open account">
            {member?.avatarUrl ? (
              <img src={member.avatarUrl} alt={member.fullName ?? "User"} className="h-full w-full object-cover" />
            ) : (
              <span className="text-[12px] text-[#9FADBC]">{(member?.fullName ?? "U").trim().slice(0, 1).toUpperCase()}</span>
            )}
          </button>
        </div>
      </div>

      {/* ── Account view ── */}
      {view === "account" && (
        <div className="mt-3">
          <div className="flex items-center gap-3 bg-[#22272B] border border-[#3B444C] rounded-[10px] p-3">
            <div className="h-10 w-10 rounded-full overflow-hidden border border-[#3B444C] bg-[#1D2125] grid place-items-center">
              {member?.avatarUrl ? (
                <img src={member.avatarUrl} alt={member.fullName ?? "User"} className="h-full w-full object-cover" />
              ) : (
                <span className="text-[14px] text-[#9FADBC] font-semibold">{(member?.fullName ?? "U").trim().slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-medium text-[#B6C2CF] truncate">{member?.fullName ?? "Unknown user"}</div>
              <div className="text-[12px] text-[#9FADBC] truncate">{member?.username ? `@${member.username}` : "@"}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Rules view ── */}
      {view === "rules" && (
        <div className="mt-1">
          <h2 className="text-[13px] font-semibold text-[#9FADBC] mb-2">Active Rules ({rules.length})</h2>
          {rules.length === 0 ? (
            <div className="text-[12px] text-[#758195] bg-[#22272B] border border-[#3B444C] rounded-[8px] p-4 text-center">
              No rules yet. Create one from the form.
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-72 overflow-auto">
              {rules.map((r) => (
                <div key={r.id} className={`bg-[#22272B] border rounded-[8px] p-2.5 transition ${r.active ? "border-[#3B444C]" : "border-[#2C333A] opacity-60"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium text-[#B6C2CF] truncate">{r.srcName}</div>
                      <div className="text-[11px] text-[#9FADBC] truncate">→ {r.listName}</div>
                      <div className="text-[10px] text-[#758195] mt-1">{scheduleLabel(r)} · {expiryLabel(r)}</div>
                      {r.lastRun && <div className="text-[10px] text-[#758195]">Last run: {new Date(r.lastRun).toLocaleString()}</div>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" onClick={() => toggleRule(r.id)}
                        className={`h-6 w-9 rounded-full transition relative ${r.active ? "bg-[#579DFF]" : "bg-[#3B444C]"}`}>
                        <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${r.active ? "left-3.5" : "left-0.5"}`} />
                      </button>
                      <button type="button" onClick={() => deleteRule(r.id)}
                        className="h-6 w-6 rounded-[4px] hover:bg-[#3B444C] transition grid place-items-center text-[#9FADBC] hover:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Form view ── */}
      {view === "form" && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-[12px] text-[#758195]">
              Loading board data…
            </div>
          ) : (
            <>
              {/* Card selector */}
              <div className="mb-4 relative">
                <label className="text-[12px] font-semibold text-[#9FADBC] mb-1 block">Select a card</label>
                <input
                  type="text"
                  value={cardQuery}
                  placeholder="Search card by name or list"
                  onChange={(e) => { setCardQuery(e.target.value); setCardMenuOpen(true); }}
                  onFocus={() => setCardMenuOpen(true)}
                  className="w-full bg-[#22272B] border border-[#3B444C] rounded-[3px] px-3 py-1.5 text-[14px] text-[#B6C2CF] placeholder-[#758195] outline-none hover:border-[#579DFF] focus:border-[#579DFF] transition"
                />
                {selectedCard && <div className="mt-1 text-[11px] text-[#9FADBC]">Selected: {selectedCard.name}</div>}

                {cardMenuOpen && (
                  <div className="absolute z-50 mt-1 w-full max-h-44 overflow-auto bg-[#282E33] border border-[#3B444C] rounded-[8px] shadow-2xl">
                    {filteredCards.length === 0 ? (
                      <div className="px-3 py-2 text-[12px] text-[#9FADBC]">No cards found</div>
                    ) : (
                      filteredCards.map((c) => (
                        <button key={c.id} type="button"
                          onClick={() => { setSelectedCardId(c.id); setCardQuery(c.name); setCardMenuOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-[13px] hover:bg-[#3B444C] transition ${c.id === selectedCardId ? "bg-[#3B444C]/50" : ""}`}>
                          <div className="truncate text-[#B6C2CF]">{c.name}</div>
                          <div className="text-[11px] text-[#9FADBC] truncate">{listNameById.get(c.idList) ?? "Unknown list"}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Repeat */}
              <SelectField label="Repeats" value={repeat} options={repeatOptions} onChange={setRepeat} />

              {/* Weekday (for Weekly) */}
              {repeat === "Weekly" && (
                <SelectField label="On day" value={weekday} options={weekdayOptions} onChange={setWeekday} />
              )}

              {/* Day of month (for Monthly) */}
              {repeat === "Monthly" && (
                <SelectField label="On day of month" value={dayOfMonth} options={dayOfMonthOptions} onChange={setDayOfMonth} />
              )}

              {/* Time */}
              <div className="mb-4">
                <label className="text-[12px] font-semibold text-[#9FADBC] mb-1.5 block">At</label>
                <div className="bg-[#22272B] border border-[#3B444C] rounded-[3px] px-3 py-2 focus-within:border-[#579DFF]">
                  <input type="time" value={atTime} onChange={(e) => setAtTime(e.target.value)}
                    className="w-full bg-transparent text-[14px] text-[#B6C2CF] outline-none" />
                </div>
              </div>

              {/* Expiry + Position row */}
              <div className="grid grid-cols-2 gap-2">
                <SelectField label="Expiry" value={expiry} options={expiryOptions} onChange={setExpiry} />
                <SelectField label="Position" value={position} options={positionOptions} onChange={setPosition} />
              </div>

              {/* Target list */}
              <SelectField label="List" value={targetListName || "Select list"} options={lists.map((l) => l.name)} onChange={setTargetListName} />

              {/* Save */}
              <div className="flex justify-end mt-4">
                <button type="button" onClick={onSave} disabled={saving}
                  className="bg-[#579DFF] hover:bg-[#85B8FF] text-[#1D2125] text-[13px] font-semibold px-5 py-1.5 rounded-[3px] transition disabled:opacity-60">
                  {saving ? "Saving…" : "Save Rule & Clone"}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;