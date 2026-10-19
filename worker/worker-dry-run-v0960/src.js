var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src.js
var QUICK = ["\u{1FACF} Hov hov!", "\u{1F44F} Godt spil!", "\u{1F602} Haha!", "\u{1F389} Flot klaret!", "\u{1F955} Din tur!", "\u2764\uFE0F Tak for spillet!"];
var MAX_VOICE_BASE64 = 14e5;
var MAX_TEXT = 1e4;
var CHAT_KEEP_MS = 24 * 60 * 60 * 1e3;
var JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
function response(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...headers } });
}
__name(response, "response");
function random(length) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return [...bytes].map((n) => alphabet[n % alphabet.length]).join("");
}
__name(random, "random");
function token() {
  return [...crypto.getRandomValues(new Uint8Array(24))].map((v) => v.toString(16).padStart(2, "0")).join("");
}
__name(token, "token");
function cors(origin, env) {
  return origin === env.APP_ORIGIN ? { "access-control-allow-origin": origin, "vary": "Origin", "access-control-allow-methods": "GET,POST,OPTIONS", "access-control-allow-headers": "content-type, x-player-secret" } : {};
}
__name(cors, "cors");
function validOrigin(request, env) {
  return request.headers.get("origin") === env.APP_ORIGIN;
}
__name(validOrigin, "validOrigin");
function bounds(range) {
  const [a, b] = range.split("-").map(Number);
  return [a, b];
}
__name(bounds, "bounds");
function centerTarget(state, n) {
  const [first] = bounds(state.range);
  for (let i = 0; i < state.centers.length; i++) {
    const row = state.centers[i];
    if (row.length && row[row.length - 1] + 1 === n) return { kind: "center", index: i, caption: `R\xE6kke ${i + 1}` };
  }
  if (n === first && state.centers.length < (state.deckSets ?? 5)) return { kind: "new-center", index: state.centers.length, caption: "Ny r\xE6kke" };
  return null;
}
__name(centerTarget, "centerTarget");
function preferredTarget(state, n, fromPlayer = state.turn) {
  const center = centerTarget(state, n);
  if (center) return center;
  for (let step = 1; step < state.players.length; step++) {
    const i = (fromPlayer + step) % state.players.length;
    const pile = state.players[i].open;
    if (pile.length && Math.abs(pile[pile.length - 1] - n) === 1) return { kind: "player", index: i, caption: `${state.players[i].name}s \xE5bne` };
  }
  return null;
}
__name(preferredTarget, "preferredTarget");
function sameTarget(a, b) {
  return !!a && !!b && a.kind === b.kind && a.index === b.index;
}
__name(sameTarget, "sameTarget");
function snapshot(state) {
  const s = JSON.parse(JSON.stringify(state));
  s.lastMove = null;
  return s;
}
__name(snapshot, "snapshot");
function countCards(p) {
  return (p.closed?.length || 0) + (p.open?.length || 0);
}
__name(countCards, "countCards");
function allCards(g) {
  return [...g.players.flatMap((p) => [...p.closed, ...p.open]), ...g.centers.flat(), ...g.pending != null ? [g.pending] : []];
}
__name(allCards, "allCards");
function fingerprint(g) {
  return allCards(g).sort((a, b) => a - b).join(",");
}
__name(fingerprint, "fingerprint");
function remaining(state, index) {
  const p = state.players[index];
  return countCards(p) + (state.turn === index && state.pending !== null ? 1 : 0);
}
__name(remaining, "remaining");
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url), origin = request.headers.get("origin");
    if (request.method === "GET" && url.pathname === "/health") return response({ status: "ready", service: "\xC6selKlog Online v0.9.58" });
    if (!validOrigin(request, env)) return response({ error: "Hjemmesiden er ikke tilladt" }, 403);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin, env) });
    if (url.pathname === "/api/create" && request.method === "POST") {
      let input;
      try {
        input = await request.json();
      } catch {
        return response({ error: "Ugyldigt JSON" }, 400, cors(origin, env));
      }
      const name = String(input.name || "").trim().slice(0, 25);
      if (!name) return response({ error: "Skriv et spillernavn" }, 400, cors(origin, env));
      const range = ["1-20", "21-40", "41-60", "61-80", "81-100"].includes(input.range) ? input.range : "1-20";
      const deckSets = input.deckSets === void 0 ? 5 : input.deckSets;
      if (!Number.isInteger(deckSets) || deckSets < 1 || deckSets > 5) return response({ error: "V\xE6lg 1\u20135 korts\xE6t" }, 400, cors(origin, env));
      const playerCount = input.playerCount === void 0 ? 2 : input.playerCount;
      if (!Number.isInteger(playerCount) || playerCount < 2 || playerCount > 6) return response({ error: "V\xE6lg 2\u20136 spillere" }, 400, cors(origin, env));
      const variant = input.variant === "passing" ? "passing" : "collect";
      const extraPenalty = input.extraPenalty === true;
      const donkeyCount = variant === "passing" ? 1 : [1, 4, 6, 8].includes(Number(input.donkeyCount)) ? Number(input.donkeyCount) : 8;
      const code2 = random(8), secret = token();
      const id2 = env.GAME_ROOM.idFromName(code2);
      const stub2 = env.GAME_ROOM.get(id2);
      const roomResponse2 = await stub2.fetch("https://room/init", { method: "POST", body: JSON.stringify({ name, range, secret, code: code2, variant, extraPenalty, donkeyCount, deckSets, playerCount }) });
      if (roomResponse2.status === 101) return roomResponse2;
      const headers2 = new Headers(roomResponse2.headers);
      for (const [key, value] of Object.entries(cors(origin, env))) headers2.set(key, value);
      return new Response(roomResponse2.body, { status: roomResponse2.status, headers: headers2 });
    }
    const match = url.pathname.match(/^\/api\/room\/([A-Z0-9]{8})(\/.*)?$/);
    if (!match) return response({ error: "Ukendt sti" }, 404, cors(origin, env));
    const code = match[1], id = env.GAME_ROOM.idFromName(code);
    const stub = env.GAME_ROOM.get(id);
    const roomUrl = new URL(request.url);
    roomUrl.pathname = match[2] || "/";
    const roomRequest = new Request(roomUrl, request);
    const roomResponse = await stub.fetch(roomRequest);
    if (roomResponse.status === 101) return roomResponse;
    const headers = new Headers(roomResponse.headers);
    for (const [key, value] of Object.entries(cors(origin, env))) headers.set(key, value);
    return new Response(roomResponse.body, { status: roomResponse.status, headers });
  }
};
var GameRoom = class {
  static {
    __name(this, "GameRoom");
  }
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.clients = /* @__PURE__ */ new Map();
    this.queue = Promise.resolve();
  }
  fetch(request) {
    const result = this.queue.then(() => this.handleFetch(request));
    this.queue = result.catch(() => {
    });
    return result;
  }
  async handleFetch(request) {
    const url = new URL(request.url), route = url.pathname;
    let g = await this.state.storage.get("game") || null;
    if (route === "/init" && request.method === "POST") {
      if (g) return response({ error: "Rummet findes allerede" }, 409);
      const b = await request.json();
      const deckSets = b.deckSets === void 0 ? 5 : b.deckSets;
      if (!Number.isInteger(deckSets) || deckSets < 1 || deckSets > 5) return response({ error: "V\xE6lg 1\u20135 korts\xE6t" }, 400);
      const playerCount = b.playerCount === void 0 ? 2 : b.playerCount;
      if (!Number.isInteger(playerCount) || playerCount < 2 || playerCount > 6) return response({ error: "V\xE6lg 2\u20136 spillere" }, 400);
      g = { code: b.code, range: b.range, deckSets, playerCount, variant: b.variant === "passing" ? "passing" : "collect", extraPenalty: b.extraPenalty === true, donkeyCount: b.variant === "passing" ? 1 : Number(b.donkeyCount) || 8, phase: "waiting", turn: 0, pending: null, centers: [], players: [{ name: b.name, secret: b.secret, closed: [], open: [], donkeys: 0 }], chat: [], chatPrefs: Array(playerCount).fill(false), created: Date.now(), move: 0, lastMove: null, message: `Venter p\xE5 spillere: 1 af ${playerCount} er tilmeldt.` };
      await this.state.storage.put("game", g);
      return response({ code: b.code, secret: b.secret });
    }
    if (!g) return response({ error: "Rummet findes ikke" }, 404);
    await this.settleReview(g);
    if (g.phase === "closed" && route !== "/state" && route !== "/action") return response({ error: "Spillet er afsluttet. Opret et nyt rum." }, 410);
    if (route === "/ws") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      const seat = this.seat(url.searchParams.get("secret") || "", g);
      if (seat < 0) return response({ error: "Ugyldig adgang" }, 401);
      this.clients.set(server, seat);
      server.accept();
      server.send(JSON.stringify({ type: "state", state: this.publicState(g, seat) }));
      server.addEventListener("close", () => this.clients.delete(server));
      server.addEventListener("error", () => this.clients.delete(server));
      return new Response(null, { status: 101, webSocket: client });
    }
    if (route === "/state" && request.method === "GET") {
      const seat = this.seat(url.searchParams.get("secret") || "", g);
      if (seat < 0) return response({ error: "Ugyldig adgang" }, 401);
      return response(this.publicState(g, seat));
    }
    if (route === "/attention" && request.method === "POST") {
      let b;
      try {
        b = await request.json();
      } catch {
        return response({ error: "Ugyldigt JSON" }, 400);
      }
      const seat = this.seat(b.secret || "", g);
      if (seat < 0) return response({ error: "Ugyldig adgang" }, 401);
      if (!Number.isInteger(b.target) || b.target < 0 || b.target >= g.players.length || b.target === seat) return response({ error: "V\xE6lg en anden spiller" }, 400);
      const now = Date.now();
      if (now - (g.nudgeTimes?.[seat] || 0) < 3e3) return response({ error: "Vent et \xF8jeblik f\xF8r n\xE6ste prik" }, 429);
      g.nudgeTimes = { ...g.nudgeTimes, [seat]: now };
      g.attention = { ...g.attention, [b.target]: { id: token(), at: now, from: seat } };
      await this.state.storage.put("game", g);
      this.broadcast(g);
      return response({ ok: true });
    }
    if (route === "/action" && request.method === "POST") {
      let b;
      try {
        b = await request.json();
      } catch {
        return response({ error: "Ugyldigt JSON" }, 400);
      }
      const seat = this.seat(b.secret || "", g);
      if (seat < 0) return response({ error: "Ugyldig adgang" }, 401);
      if (g.phase === "closed" && b.type !== "end-game") return response({ error: "Spillet er afsluttet. Opret et nyt rum." }, 409);
      const cardsBefore = fingerprint(g);
      try {
        if (b.type === "end-game") {
          if (seat !== 0) throw Error("Kun rumopretteren kan afslutte spillet for alle.");
          if (g.phase === "closed") return response(this.publicState(g, seat));
          for (const m of g.chat || []) await this.state.storage.delete?.("clip:" + m.id);
          g.phase = "closed";
          g.closedAt = Date.now();
          g.review = null;
          g.lastMove = null;
          g.chat = [];
          g.chatPrefs = Array(g.players.length).fill(false);
          g.message = `${g.players[0].name} afsluttede spillet.`;
        } else if (b.type === "start-early") {
          if (seat !== 0) throw Error("Kun rumopretteren kan starte spillet.");
          if (g.phase !== "waiting") throw Error("Spillet er allerede startet.");
          if (g.players.length < 2) throw Error("Der skal v\xE6re mindst to spillere.");
          if (this.earlyStartWait(g) > 0) throw Error("Vent 60 sekunder fra rummet blev oprettet.");
          this.startGame(g);
        } else if (b.type === "challenge") {
          g.donkeySoundId = (g.donkeySoundId || 0) + 1;
          if (b.moveId !== void 0 && b.moveId !== g.lastPlayed?.id) g.message = "Der er lagt et nyt kort. Se det seneste udspil f\xF8r du udfordrer.";
          else if (g.lastMove && g.lastMove.actor !== seat) this.doChallenge(g, seat);
          else g.message = "\u{1FACF} Hov hov!";
        } else {
          if (g.phase !== "playing" || g.turn !== seat) throw Error("Det er ikke din tur");
          if (b.type === "flip-open") this.doFlipOpen(g, seat);
          else if (b.type === "end-turn") this.doEndTurn(g, seat);
          else if (b.type === "keep-single") this.doKeepSingle(g, seat);
          else if (b.type === "recycle") this.doRecycle(g, seat);
          else if (b.type === "flip") {
            if (b.manualRecycle === true && !g.players[seat].closed.length) throw Error("Vend f\xF8rst din \xE5bne bunke.");
            this.doFlip(g, seat);
          } else if (b.type === "place") this.doPlace(g, seat, b);
          else if (b.type === "discard") this.doDiscard(g, seat);
          else throw Error("Ukendt handling");
        }
      } catch (e) {
        return response({ error: e.message }, 400);
      }
      if (b.type !== "start-early" && fingerprint(g) !== cardsBefore) return response({ error: "Tr\xE6kket kunne ikke gemmes, fordi kortantallet \xE6ndrede sig. Pr\xF8v at opdatere spillet." }, 409);
      g.move++;
      await this.state.storage.put("game", g);
      if (g.review) await this.state.storage.setAlarm?.(g.review.until);
      else await this.state.storage.deleteAlarm?.();
      this.broadcast(g);
      if (g.phase === "closed") {
        for (const [ws] of this.clients) {
          try {
            ws.close(1e3, "Spillet er afsluttet");
          } catch {
          }
        }
        this.clients.clear();
      }
      return response(this.publicState(g, seat));
    }
    if (route === "/join" && request.method === "POST") {
      if (g.players.length >= (g.playerCount ?? 2) || g.phase !== "waiting") return response({ error: "Rummet er allerede fuldt" }, 409);
      const b = await request.json(), name = String(b.name || "").trim().slice(0, 25);
      if (!name || g.players.some((p) => p.name.toLocaleLowerCase("da-DK") === name.toLocaleLowerCase("da-DK"))) return response({ error: "V\xE6lg et andet navn" }, 400);
      const secret = token();
      g.players.push({ name, secret, closed: [], open: [], donkeys: 0 });
      if (g.players.length === (g.playerCount ?? 2)) this.startGame(g);
      else g.message = `Venter p\xE5 spillere: ${g.players.length} af ${g.playerCount} er tilmeldt.`;
      g.move++;
      await this.state.storage.put("game", g);
      this.broadcast(g);
      return response({ secret });
    }
    const notifyChat = /* @__PURE__ */ __name(() => {
      for (const [ws] of this.clients) {
        try {
          ws.send(JSON.stringify({ type: "chat-update" }));
        } catch {
        }
      }
    }, "notifyChat");
    const expired = (g.chat || []).filter((m) => Date.now() - m.at >= CHAT_KEEP_MS);
    if (expired.length) {
      for (const m of expired) await this.state.storage.delete?.("clip:" + m.id);
      g.chat = g.chat.filter((m) => !expired.includes(m));
      await this.state.storage.put("game", g);
    }
    if (route === "/chat" && request.method === "GET") {
      const seat = this.seat(request.headers.get("x-player-secret") || "", g);
      if (seat < 0) return response({ error: "Ingen adgang" }, 401);
      return response({ messages: (g.chat || []).map(({ audio, ...rest }) => rest), prefs: this.chatPrefs(g), players: g.players.map((p) => p.name) });
    }
    if (route === "/clip" && request.method === "GET") {
      const seat = this.seat(request.headers.get("x-player-secret") || "", g);
      if (seat < 0) return response({ error: "Ingen adgang" }, 401);
      const item = (g.chat || []).find((m) => m.id === url.searchParams.get("id") && m.kind === "voice");
      if (!item) return response({ error: "Lyd er udl\xF8bet" }, 404);
      const clip = item.audio ? item : await this.state.storage.get("clip:" + item.id);
      if (!clip) return response({ error: "Lyd er udl\xF8bet" }, 404);
      const binary = Uint8Array.from(atob(clip.audio), (c) => c.charCodeAt(0));
      return new Response(binary, { headers: { "content-type": item.mime, "cache-control": "no-store", "x-content-type-options": "nosniff" } });
    }
    if (route === "/chat-settings" && request.method === "POST") {
      const b = await request.json(), seat = this.seat(b.secret || "", g);
      if (seat < 0) return response({ error: "Ingen adgang" }, 401);
      g.chatPrefs = this.chatPrefs(g);
      g.chatPrefs[seat] = b.enabled === true;
      await this.state.storage.put("game", g);
      this.broadcast(g);
      notifyChat();
      return response({ prefs: g.chatPrefs });
    }
    if (route === "/chat" && request.method === "POST") {
      if (Number(request.headers.get("content-length") || 0) > 15e5) return response({ error: "Beskeden er for stor" }, 413);
      let b;
      try {
        b = await request.json();
      } catch {
        return response({ error: "Ugyldig besked" }, 400);
      }
      const seat = this.seat(b.secret || "", g);
      if (seat < 0) return response({ error: "Ingen adgang" }, 401);
      const now = Date.now(), full = g.chat || [];
      let item = { id: token().slice(0, 16), seat, at: now };
      if (b.kind === "quick") {
        if (!QUICK.includes(b.text)) return response({ error: "Ukendt hurtigbesked" }, 400);
        item = { ...item, kind: "quick", text: b.text };
      } else if (b.kind === "text") {
        const value = String(b.text || "").trim();
        if (!value || value.length > MAX_TEXT || /[\x00-\x08]/.test(value)) return response({ error: "Teksten skal v\xE6re 1\u201310.000 tegn" }, 400);
        item = { ...item, kind: "text", text: value };
      } else if (b.kind === "voice") {
        if (!["audio/webm", "audio/mp4", "audio/ogg", "audio/mpeg", "audio/wav", "audio/x-wav", "audio/aac", "audio/flac", "audio/x-m4a"].includes(b.mime) || typeof b.audio !== "string" || !b.audio.length || b.audio.length % 4 !== 0 || b.audio.length > MAX_VOICE_BASE64 || !/^[A-Za-z0-9+/]*={0,2}$/.test(b.audio) || !Number.isFinite(Number(b.duration)) || Number(b.duration) < 0) return response({ error: "Lydfilen skal v\xE6re en underst\xF8ttet lydtype og h\xF8jst 1 MB" }, 400);
        let binary;
        try {
          binary = atob(b.audio);
        } catch {
          return response({ error: "Ugyldig lydfil" }, 400);
        }
        if (binary.length > 1048576) return response({ error: "Lydfilen m\xE5 h\xF8jst v\xE6re 1 MB" }, 413);
        await this.state.storage.put("clip:" + item.id, { audio: b.audio, mime: b.mime });
        item = { ...item, kind: "voice", mime: b.mime, duration: Math.round(Number(b.duration) * 10) / 10 };
      } else return response({ error: "Ukendt beskedtype" }, 400);
      g.chat = [...full.filter((m) => now - m.at < CHAT_KEEP_MS), item].slice(-30);
      for (const m of full) if (!g.chat.some((kept) => kept.id === m.id)) await this.state.storage.delete?.("clip:" + m.id);
      await this.state.storage.put("game", g);
      notifyChat();
      return response({ ok: true, id: item.id });
    }
    return response({ error: "Ukendt sti" }, 404);
  }
  earlyStartWait(g) {
    return Math.max(0, 6e4 - (Date.now() - (g.created ?? Date.now())));
  }
  startGame(g) {
    if (g.phase !== "waiting" || g.players.length < 2) throw Error("Spillet kan ikke startes.");
    g.playerCount = g.players.length;
    g.chatPrefs = this.chatPrefs(g);
    const [lo, hi] = bounds(g.range), deck = [];
    for (let n = lo; n <= hi; n++) for (let i = 0; i < (g.deckSets ?? 5); i++) deck.push(n);
    for (let i = deck.length - 1; i > 0; i--) {
      const v = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
      [deck[i], deck[v]] = [deck[v], deck[i]];
    }
    deck.forEach((n, i) => g.players[i % g.players.length].closed.push(n));
    g.phase = "playing";
    g.message = `Spillet er startet med ${g.players.length} spillere. Spiller 1 begynder.`;
  }
  alarm() {
    const result = this.queue.then(async () => {
      const g = await this.state.storage.get("game");
      if (!g) return;
      if (!await this.settleReview(g) && g.review) await this.state.storage.setAlarm?.(g.review.until);
    });
    this.queue = result.catch(() => {
    });
    return result;
  }
  async settleReview(g) {
    if (!g.review) return false;
    g.review = null;
    g.move++;
    await this.state.storage.put("game", g);
    await this.state.storage.deleteAlarm?.();
    this.broadcast(g);
    return true;
  }
  chatPrefs(g) {
    return Array.from({ length: g.playerCount ?? 2 }, (_, i) => g.chatPrefs?.[i] === true);
  }
  seat(secret, g) {
    return g.players.findIndex((p) => p.secret === secret);
  }
  doFlipOpen(g, seat) {
    if (g.pending !== null) throw Error("L\xE6g f\xF8rst det allerede vendte kort.");
    const p = g.players[seat], skipped = p.open.length && preferredTarget(g, p.open.at(-1), seat);
    const before = skipped ? snapshot(g) : null, number = p.open.at(-1);
    if (!p.closed.length) {
      if (!p.open.length) throw Error("Ingen talkort tilbage.");
      p.closed = p.open.slice().reverse();
      p.open = [];
    }
    const n = p.closed.pop();
    p.open.push(n);
    g.lastMove = skipped ? { actor: seat, valid: false, number, type: "flip", before } : null;
    g.message = `${p.name} vendte ${n} til sin \xE5bne bunke. Flyt kortet, eller afslut turen.`;
  }
  doEndTurn(g, seat) {
    if (g.pending !== null) return this.doDiscard(g, seat);
    const n = g.players[seat].open.at(-1), before = snapshot(g);
    const valid = n == null || !preferredTarget(g, n, seat);
    this.finishOrNext(g);
    g.lastMove = { actor: seat, valid, number: n ?? 0, type: "end-turn", before };
    if (g.phase !== "finished") g.message = `${g.players[seat].name} afsluttede turen. ${g.players[g.turn].name}s tur.`;
  }
  doKeepSingle(g, seat) {
    const p = g.players[seat];
    if (remaining(g, seat) !== 1 || !p.open.length || g.pending !== null) throw Error("Du skal have \xE9t \xE5bent kort tilbage.");
    this.finishOrNext(g);
    if (g.phase !== "finished") g.message = `${p.name} beholder sit sidste \xE5bne kort. ${g.players[g.turn].name}s tur.`;
  }
  doRecycle(g, seat) {
    if (g.pending !== null) throw Error("L\xE6g f\xF8rst det vendte kort.");
    const p = g.players[seat];
    if (!p.closed.length && p.open.length === 1) return this.doKeepSingle(g, seat);
    if (p.closed.length) throw Error("Din lukkede bunke er ikke tom.");
    if (!p.open.length) throw Error("Ingen \xE5ben bunke at vende.");
    const number = p.open.at(-1), skipped = preferredTarget(g, number, seat), before = skipped ? snapshot(g) : null;
    p.closed = p.open.slice().reverse();
    p.open = [];
    g.message = `${p.name} vendte sin \xE5bne bunke. Tryk p\xE5 den lukkede bunke for at vende et kort.`;
  }
  doFlip(g, seat) {
    if (g.pending !== null) throw Error("L\xE6g f\xF8rst det vendte kort.");
    const p = g.players[seat];
    if (!p.closed.length && p.open.length === 1) return this.doKeepSingle(g, seat);
    const skipped = p.open.length && preferredTarget(g, p.open.at(-1), seat);
    const before = skipped ? snapshot(g) : null, number = p.open.at(-1);
    if (!p.closed.length) {
      if (!p.open.length) throw Error("Ingen talkort tilbage.");
      p.closed = p.open.slice().reverse();
      p.open = [];
    }
    g.pending = p.closed.pop();
    g.message = `${p.name} vendte ${g.pending}. V\xE6lg en bunke.`;
  }
  doPlace(g, seat, b) {
    if (!["open", "pending"].includes(b.source)) throw Error("V\xE6lg et kort.");
    const source = b.source;
    if (source === "open" && g.pending !== null) throw Error("L\xE6g f\xF8rst det vendte kort.");
    const p = g.players[seat];
    const n = source === "pending" ? g.pending : p.open.at(-1);
    if (n == null) throw Error("Intet kort at l\xE6gge");
    const dest = { kind: b.kind, index: Number(b.index) };
    if (dest.kind === "new-center") {
      if (g.centers.length >= (g.deckSets ?? 5)) throw Error(`Der m\xE5 h\xF8jst v\xE6re ${g.deckSets ?? 5} midterr\xE6kker.`);
      dest.index = g.centers.length;
    } else if (dest.kind === "center") {
      if (!Number.isInteger(dest.index) || !g.centers[dest.index]) throw Error("Ukendt r\xE6kke.");
    } else if (dest.kind === "player") {
      if (!Number.isInteger(dest.index) || !g.players[dest.index] || dest.index === seat) throw Error("V\xE6lg modstanderens bunke.");
    } else if (dest.kind === "self-open") {
      if (source !== "pending") throw Error("V\xE6lg et vendt kort.");
      dest.index = seat;
    } else throw Error("Ukendt m\xE5l.");
    const expected = preferredTarget(g, n, seat);
    const [first, last] = bounds(g.range);
    const row = dest.kind === "center" ? g.centers[dest.index] : null;
    const valid = dest.kind === "new-center" ? n === first : row ? row.length > 0 && row.every((v, i) => v === first + i) && row.at(-1) < last && n === row.at(-1) + 1 : dest.kind === "self-open" ? !expected : sameTarget(dest, expected);
    const before = snapshot(g);
    if (source === "pending") g.pending = null;
    else p.open.pop();
    if (dest.kind === "self-open") p.open.push(n);
    else if (dest.kind === "new-center") g.centers.push([n]);
    else if (dest.kind === "center") g.centers[dest.index].push(n);
    else if (dest.kind === "player") g.players[dest.index].open.push(n);
    else throw Error("Ukendt m\xE5l");
    if (Array.isArray(g.finishOrder)) g.finishOrder = g.finishOrder.filter((i) => remaining(g, i) === 0);
    g.lastMove = { actor: seat, valid, number: n, type: dest.kind === "self-open" ? "discard" : "place", before };
    g.lastPlayed = { id: (g.move || 0) + 1, actor: seat, number: n, kind: dest.kind, index: dest.index };
    if (dest.kind === "self-open") {
      this.finishOrNext(g);
      g.message = `${p.name} lagde ${n} i sin \xE5bne bunke.`;
    } else if (remaining(g, seat) === 0) {
      this.finishWinner(g, seat);
      if (g.phase !== "finished") this.advanceTurn(g);
    } else g.message = `${p.name} lagde ${n}.`;
  }
  doDiscard(g, seat) {
    return this.doPlace(g, seat, { source: "pending", kind: "self-open" });
  }
  doChallenge(g, seat) {
    if (!g.lastMove) throw Error("Der er ikke et tr\xE6k at udfordre.");
    if (g.lastMove.actor === seat) throw Error("Du kan ikke udfordre dit eget tr\xE6k.");
    if (g.lastMove.valid) {
      g.message = "Tr\xE6kket var korrekt. Ingen \xE6selstraf.";
      g.lastMove = null;
      return;
    }
    const actor = g.lastMove.actor, number = g.lastMove.number, played = g.lastPlayed;
    const restored = JSON.parse(JSON.stringify(g.lastMove.before));
    Object.assign(restored, { attention: g.attention, nudgeTimes: g.nudgeTimes, chat: g.chat, chatPrefs: g.chatPrefs, move: g.move, penaltySoundId: g.penaltySoundId || 0, donkeySoundId: g.donkeySoundId || 0 });
    Object.keys(g).forEach((k) => delete g[k]);
    Object.assign(g, restored);
    const penalty = this.givePenalty(g, actor);
    if (penalty.assigned) g.penaltySoundId = g.move + 1;
    this.finishWinner(g, actor);
    if (g.phase !== "finished" && remaining(g, g.turn) === 0) this.advanceTurn(g);
    g.lastMove = null;
    if (played) g.lastPlayed = { ...played, challenged: true };
    g.message = `\u{1FACF} ${g.players[actor].name} blev opdaget! Tr\xE6kket med ${number} blev fortrudt. ${g.penaltyMessage}`;
    delete g.penaltyMessage;
  }
  givePenalty(g, actor) {
    const p = g.players[actor];
    let assigned = false;
    if ((g.variant || "collect") === "passing") {
      for (const other of g.players) other.donkeys = 0;
      p.donkeys = 1;
      assigned = true;
    } else if (g.players.reduce((v, item) => v + (item.donkeys || 0), 0) < (g.donkeyCount || 8)) {
      p.donkeys = (p.donkeys || 0) + 1;
      assigned = true;
    }
    let extras = 0;
    if (g.extraPenalty === true) {
      for (let i = 0; i < g.players.length; i++) {
        if (i !== actor && g.players[i].closed.length) {
          p.closed.push(g.players[i].closed.pop());
          extras++;
        }
      }
    }
    if (extras && Array.isArray(g.finishOrder)) g.finishOrder = g.finishOrder.filter((i) => i !== actor);
    if (extras && g.phase === "finished") {
      g.phase = "playing";
      g.winner = null;
      g.placements = null;
    }
    g.penaltyMessage = `${assigned ? "\xC6selkort givet" : "Ingen ledige \xE6selkort"}${extras ? ` og ${extras} ekstra talkort` : ""}.`;
    return { assigned, extras };
  }
  finishWinner(g, finisher) {
    const done = (g.finishOrder || []).filter((i) => remaining(g, i) === 0);
    for (let i = 0; i < g.players.length; i++) if (remaining(g, i) === 0 && !done.includes(i)) done.push(i);
    g.finishOrder = done;
    if (!done.length) return;
    if (g.players.length > 2 && done.length < g.players.length - 1) return;
    g.placements = g.players.map((_, i) => i).sort((a, b) => (g.players[a].donkeys || 0) - (g.players[b].donkeys || 0) || remaining(g, a) - remaining(g, b) || (done.indexOf(a) < 0 ? Infinity : done.indexOf(a)) - (done.indexOf(b) < 0 ? Infinity : done.indexOf(b)) || a - b);
    g.phase = "finished";
    g.winner = g.placements[0];
    g.message = `\u{1F3C6} ${g.players[g.winner].name} vandt! ` + g.placements.slice(0, 3).map((i, k) => `${["\u{1F947}", "\u{1F948}", "\u{1F949}"][k]} ${g.players[i].name}`).join(" \xB7 ");
  }
  advanceTurn(g) {
    for (let step = 0; step < g.players.length; step++) {
      g.turn = (g.turn + 1) % g.players.length;
      if (remaining(g, g.turn) > 0) break;
    }
  }
  finishOrNext(g) {
    this.finishWinner(g, g.turn);
    if (g.phase === "finished") return;
    this.advanceTurn(g);
    g.message = `${g.players[g.turn].name}s tur.`;
  }
  publicState(g, seat) {
    const playerCards = g.players.reduce((sum, p) => sum + countCards(p), 0) + (g.pending != null ? 1 : 0), centerCards = g.centers.reduce((sum, c) => sum + c.length, 0);
    return {
      reviewUntil: 0,
      reviewRemainingMs: 0,
      lastPlayed: g.lastPlayed || null,
      donkeySoundId: g.donkeySoundId || 0,
      cardCount: { players: playerCards, centers: centerCards, total: playerCards + centerCards, expected: (g.deckSets ?? 5) * 20 },
      attention: g.phase !== "closed" ? g.attention?.[seat] || null : null,
      phase: g.phase,
      penaltySoundId: g.penaltySoundId || 0,
      startWaitMs: g.phase === "waiting" ? this.earlyStartWait(g) : 0,
      turn: g.turn,
      pending: g.turn === seat ? g.pending : null,
      centers: g.centers.map((c) => ({ top: c.at(-1), length: c.length, cards: [...c] })),
      players: g.players.map((p, i) => ({ name: p.name, closed: p.closed.length, turned: i === g.turn && g.pending != null ? 1 : 0, total: remaining(g, i), open: i === seat || true ? p.open.at(-1) : null, openCount: p.open.length, donkeys: p.donkeys })),
      you: seat,
      playerCount: g.playerCount ?? 2,
      deckSets: g.deckSets ?? 5,
      variant: g.variant || "collect",
      extraPenalty: g.extraPenalty === true,
      donkeyCount: g.donkeyCount || 8,
      message: g.message,
      move: g.move,
      canChallenge: !!g.lastMove && g.lastMove.actor !== seat,
      winner: g.winner,
      placements: g.placements || null
    };
  }
  broadcast(g) {
    for (const [ws, seat] of this.clients) {
      try {
        ws.send(JSON.stringify({ type: "state", state: this.publicState(g, seat) }));
      } catch {
      }
    }
  }
};
export {
  GameRoom,
  src_default as default
};
//# sourceMappingURL=src.js.map
