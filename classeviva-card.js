/**
 * ClasseViva Card — plance per l'integrazione ClasseViva Spaggiari.
 *
 * Installazione:
 *   1. copia questo file dove preferisci dentro <config>/www/, ad esempio
 *        <config>/www/community/classeviva/classeviva-card.js
 *   2. Impostazioni > Dashboard > (menu ⋮) > Risorse > Aggiungi:
 *        URL   /local/community/classeviva/classeviva-card.js
 *        tipo  Modulo JavaScript
 *      (/local/ corrisponde alla cartella www/)
 *
 * Opzioni comuni:
 *   vista       medie | voti | bacheca | agenda | combo     (default: combo)
 *   account     parte dell'entity_id, se hai piu' studenti o piu' anni
 *   titolo      testo dell'intestazione ("" per nasconderla)
 *   animazioni  true | false                                (default: true)
 *
 * Solo per vista: medie
 *   layout      auto | verticale | orizzontale                (default: auto)
 *               auto = cerchio a sinistra e linee a destra se c'e' spazio,
 *               impilati se la card e' stretta
 *   dimensione  diametro del cerchio in px                  (default: 170)
 *   periodi     true | false, le linee dei quadrimestri     (default: true)
 *   massimo     voto massimo della scala                    (default: 10)
 */

// Alza questo numero a ogni modifica: compare nella console del browser e
// serve a capire al volo se la pagina sta usando il file nuovo o quello in cache.
const VERSIONE = "2.3.1";

const VISTE = [
  { id: "medie", nome: "Medie", icona: "◎" },
  { id: "voti", nome: "Voti", icona: "▤" },
  { id: "bacheca", nome: "Bacheca", icona: "✉" },
  { id: "agenda", nome: "Agenda", icona: "▦" },
  { id: "note", nome: "Annotazioni", icona: "✎" },
  { id: "scrutini", nome: "Scrutini", icona: "★" },
];

// Sottomenù della vista Annotazioni.
const SOTTO_NOTE = [
  { id: "annotazione", nome: "Annotazioni" },
  { id: "disciplinare", nome: "Note disciplinari" },
];

// Scala di colore continua: rosso sotto il 5, ambra verso il 6, verde sopra.
const SCALA = [
  { v: 0, c: "#c62828" },
  { v: 4.5, c: "#e53935" },
  { v: 5.5, c: "#fb8c00" },
  { v: 6, c: "#fdd835" },
  { v: 7, c: "#7cb342" },
  { v: 8.5, c: "#43a047" },
  { v: 10, c: "#2e7d32" },
];

const GIALLO = "#D7D765";
const AZZURRO = "#A5D7FD";

const STILE = `
  :host { display: block; }

  .cvv {
    container-type: inline-size;
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border-radius: var(--ha-card-border-radius, 14px);
    box-shadow: var(--ha-card-box-shadow, none);
    border: var(--ha-card-border-width, 1px) solid var(--divider-color, #e0e0e0);
    color: var(--primary-text-color);
    overflow: hidden;
  }

  /* ---------- intestazione ---------- */
  .testa { display: flex; align-items: baseline; gap: 10px; padding: 18px 20px 0; flex-wrap: wrap; }
  .titolo { font-size: 1.15rem; font-weight: 500; margin: 0; flex: 1; letter-spacing: .2px; }
  .anno { font-size: .75rem; color: var(--secondary-text-color); letter-spacing: .4px;
          text-transform: uppercase; }

  /* ---------- schede ---------- */
  .tabs { position: relative; display: flex; gap: 2px; padding: 14px 12px 0;
          border-bottom: 1px solid var(--divider-color); overflow-x: auto;
          scrollbar-width: none; }
  .tabs::-webkit-scrollbar { display: none; }
  .tab { --pad: 14px;
         position: relative; background: none; border: none; color: var(--secondary-text-color);
         cursor: pointer; padding: 9px var(--pad) 11px; font-size: .88rem; font-family: inherit;
         white-space: nowrap; border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 6px;
         transition: color .22s ease, background .22s ease; }
  .tab:hover { color: var(--primary-text-color); background: var(--secondary-background-color); }
  .tab.attivo { color: var(--primary-color); font-weight: 500; }
  .tab .glifo { font-size: 1rem; line-height: 1; }
  /* La linea di selezione è ancorata al pulsante stesso (::after) invece di
     essere un elemento posizionato a mano: così non può disallinearsi, qualunque
     siano padding, badge, font o larghezza della card. */
  .tab.attivo::after { content: ""; position: absolute; left: var(--pad); right: var(--pad);
                       bottom: 0; height: 2px; background: var(--primary-color);
                       border-radius: 2px 2px 0 0; animation: comparsa .3s ease both; }
  @keyframes comparsa { from { opacity: 0; transform: scaleX(.35); } }

  /* Card stretta (colonna del layout Masonry): restano le sole icone, così le
     schede ci stanno tutte invece di finire fuori dal bordo. */
  @container (max-width: 460px) {
    .tab { --pad: 9px; }
    .tab .etichetta { display: none; }
    .tab.attivo .etichetta { display: inline; }
    .tab .glifo { font-size: 1.15rem; }
  }
  @container (max-width: 300px) {
    .tab.attivo .etichetta { display: none; }
  }

  /* ---------- corpo ---------- */
  .corpo { padding: 20px; }
  .anima .corpo { animation: entra .34s cubic-bezier(.22,1,.36,1) both; }
  .anima .corpo.da-destra { animation-name: entraDestra; }
  .anima .corpo.da-sinistra { animation-name: entraSinistra; }
  @keyframes entra { from { opacity: 0; transform: translateY(6px); } }
  @keyframes entraDestra { from { opacity: 0; transform: translateX(22px); } }
  @keyframes entraSinistra { from { opacity: 0; transform: translateX(-22px); } }

  .vuoto { color: var(--secondary-text-color); font-style: italic; padding: 6px 0; }

  /* ---------- medie: cerchio + linee ---------- */
  .medie { display: flex; flex-direction: column; align-items: center; gap: 22px;
           padding-bottom: 10px; }
  .blocco-cerchio { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
  /* disposizione in riga: cerchio a sinistra, linee dei periodi a destra */
  .medie.riga { flex-direction: row; align-items: center; justify-content: flex-start;
                gap: 30px; }
  .medie.riga .linee { flex: 1; max-width: none; }
  /* "auto": va in riga da sola non appena la CARD (non la finestra) è larga abbastanza */
  @container (min-width: 500px) {
    .medie.auto { flex-direction: row; align-items: center; justify-content: flex-start;
                  gap: 30px; }
    .medie.auto .linee { flex: 1; max-width: none; }
  }
  .cerchio { position: relative; flex-shrink: 0; }
  .cerchio svg { display: block; transform: rotate(-90deg); }
  .cerchio .traccia { stroke: var(--divider-color); opacity: .5; }
  .anima .cerchio .arco { animation: riempi 1.1s cubic-bezier(.22,1,.36,1) both; }
  @keyframes riempi { from { stroke-dashoffset: var(--vuoto); } }
  .cerchio .dentro { position: absolute; inset: 0; display: flex; flex-direction: column;
                     align-items: center; justify-content: center; }
  .cerchio .num { font-weight: 200; line-height: .95; letter-spacing: -1px;
                  font-variant-numeric: tabular-nums; }
  .anima .cerchio .num { animation: sfuma .5s .25s ease both; }
  @keyframes sfuma { from { opacity: 0; transform: scale(.9); } }
  .cerchio .eti { color: var(--secondary-text-color); letter-spacing: 1.6px;
                  text-transform: uppercase; margin-top: 5px; }
  .cerchio .sotto { text-align: center; color: var(--secondary-text-color); margin-top: 14px; }

  .linee { display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 340px; }
  .linea .cap { display: flex; justify-content: space-between; align-items: baseline;
                margin-bottom: 6px; gap: 10px; }
  .linea .nome { font-size: .78rem; color: var(--secondary-text-color); letter-spacing: .5px;
                 text-transform: uppercase; white-space: nowrap; }
  .linea .val { font-size: 1rem; font-weight: 500; font-variant-numeric: tabular-nums; }
  .pista { height: 6px; border-radius: 99px; background: var(--divider-color); overflow: hidden; }
  .pista > span { display: block; height: 100%; border-radius: 99px; width: var(--w); }
  .anima .pista > span { animation: cresci .9s cubic-bezier(.22,1,.36,1) both;
                         animation-delay: var(--ritardo); }
  @keyframes cresci { from { width: 0; } }

  /* ---------- voti ---------- */
  .sommario { display: flex; align-items: baseline; gap: 10px; margin-bottom: 18px; }
  .sommario .n { font-size: 2.4rem; font-weight: 200; line-height: 1; letter-spacing: -1px; }
  .sommario .d { font-size: .8rem; color: var(--secondary-text-color); }
  .materia { margin-bottom: 13px; }
  .materia .riga { display: flex; justify-content: space-between; font-size: .88rem;
                   margin-bottom: 5px; gap: 8px; }
  .materia .nome { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .materia .val { font-weight: 500; flex-shrink: 0; font-variant-numeric: tabular-nums; }

  .voti { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 8px; }
  .voto { display: inline-flex; flex-direction: column; align-items: center; min-width: 44px;
          padding: 6px 8px; border-radius: 10px; color: #fff; font-weight: 600; font-size: .95rem;
          transition: transform .18s ease; }
  .voto:hover { transform: translateY(-2px) scale(1.04); }
  .voto small { font-weight: 400; font-size: .62rem; opacity: .85; margin-top: 1px; }
  .anima .voto { animation: salta .4s cubic-bezier(.22,1,.36,1) both;
                 animation-delay: var(--ritardo); }
  @keyframes salta { from { opacity: 0; transform: translateY(8px) scale(.9); } }

  h4.sez { margin: 22px 0 2px; font-size: .72rem; letter-spacing: 1.4px; font-weight: 500;
           text-transform: uppercase; color: var(--secondary-text-color); }

  /* ---------- bacheca ---------- */
  .com { padding: 14px 0; border-bottom: 1px solid var(--divider-color); }
  .com:last-child { border-bottom: none; }
  .anima .com { animation: entra .4s ease both; animation-delay: var(--ritardo); }
  .com .cap { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .com .tit { font-weight: 500; flex: 1; min-width: 190px; line-height: 1.35; }
  .com.nuova { position: relative; padding-left: 14px; }
  .com.nuova::before { content: ""; position: absolute; left: 0; top: 18px; width: 6px; height: 6px;
                       border-radius: 50%; background: var(--error-color, #e53935); }
  .com.nuova .tit { font-weight: 700; }
  .com .data { font-size: .74rem; color: var(--secondary-text-color); font-variant-numeric: tabular-nums; }
  .com .testo { font-size: .87rem; color: var(--secondary-text-color); margin-top: 7px;
                white-space: pre-wrap; line-height: 1.45; }
  /* niente pre-wrap: è testo scritto dalla card, non contenuto del registro */
  .com .avviso { font-size: .8rem; color: var(--secondary-text-color); margin-top: 7px;
                 line-height: 1.4; opacity: .85; }
  .tag { font-size: .66rem; padding: 2px 8px; border-radius: 99px; background: var(--divider-color);
         color: var(--secondary-text-color); letter-spacing: .4px; text-transform: uppercase; }
  .tag.viva { background: var(--primary-color); color: var(--text-primary-color, #fff); }
  .tag.nuovo { background: var(--error-color, #e53935); color: #fff; }
  /* insufficienze: leggibile a parole, non una crocetta scambiata per una "x" */
  .tag.insuff { background: color-mix(in srgb, var(--error-color, #e53935) 22%, transparent);
                color: var(--error-color, #e53935); text-transform: none; letter-spacing: 0; }
  .materia .tag { text-transform: none; letter-spacing: 0; font-weight: 400; }
  .tag.pulita { background: color-mix(in srgb, #43a047 22%, transparent); color: #6abf6e; }
  /* il nome è un pulsante: apre il dettaglio della materia */
  .materia .nome { background: none; border: none; padding: 0; font: inherit; text-align: left;
                   color: var(--primary-text-color); cursor: pointer; overflow: hidden;
                   text-overflow: ellipsis; white-space: nowrap;
                   border-bottom: 1px dashed transparent; transition: border-color .18s ease; }
  .materia .nome:hover { border-bottom-color: var(--secondary-text-color); }

  /* ---------- dettaglio materia ---------- */
  dialog.dettaglio { border: none; padding: 0; max-width: min(560px, 92vw); width: 100%;
                     border-radius: 14px; background: var(--card-background-color, #fff);
                     color: var(--primary-text-color);
                     box-shadow: 0 12px 40px rgba(0,0,0,.5); }
  dialog.dettaglio::backdrop { background: rgba(0,0,0,.55); backdrop-filter: blur(2px); }
  dialog.dettaglio[open] { animation: apri .26s cubic-bezier(.22,1,.36,1) both; }
  @keyframes apri { from { opacity: 0; transform: translateY(12px) scale(.97); } }
  .dett-testa { display: flex; align-items: baseline; gap: 10px; padding: 18px 56px 12px 20px;
                border-bottom: 1px solid var(--divider-color); }
  .dett-testa h3 { margin: 0; font-size: 1.05rem; font-weight: 500; flex: 1; }
  .dett-media { font-size: 1.5rem; font-weight: 300; font-variant-numeric: tabular-nums; }
  .dett-corpo { padding: 8px 20px 18px; max-height: 60vh; overflow-y: auto; }
  .dett-riga { display: flex; align-items: center; gap: 12px; padding: 9px 0;
               border-bottom: 1px solid var(--divider-color); }
  .dett-riga:last-child { border-bottom: none; }
  .dett-riga .d { font-size: .78rem; color: var(--secondary-text-color); min-width: 78px;
                  font-variant-numeric: tabular-nums; }
  .dett-riga .t { flex: 1; font-size: .85rem; color: var(--secondary-text-color); }
  .dett-riga .v { font-weight: 600; color: #fff; border-radius: 8px; padding: 4px 10px;
                  min-width: 42px; text-align: center; }
  .dett-chiudi { position: absolute; top: 12px; right: 14px; background: none; border: none;
                 color: var(--secondary-text-color); font-size: 1.3rem; cursor: pointer;
                 line-height: 1; padding: 4px 8px; border-radius: 8px; }
  .dett-chiudi:hover { background: var(--secondary-background-color); color: var(--primary-text-color); }
  .file { display: inline-flex; align-items: center; gap: 6px; margin: 8px 8px 0 0; padding: 6px 12px;
          background: var(--secondary-background-color); border-radius: 99px; font-size: .8rem;
          color: var(--primary-color); text-decoration: none; transition: transform .18s ease,
          filter .18s ease; }
  .file:hover { transform: translateY(-1px); filter: brightness(1.12); }
  .apri { background: none; border: 1px solid var(--primary-color); color: var(--primary-color);
          border-radius: 99px; padding: 5px 13px; font-size: .76rem; cursor: pointer;
          font-family: inherit; margin-top: 9px; transition: background .18s ease, color .18s ease; }
  .apri:hover { background: var(--primary-color); color: var(--text-primary-color, #fff); }

  /* ---------- controlli ---------- */
  .barra-azioni, .sottomenu { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
  .chip { background: none; border: 1px solid var(--divider-color); color: var(--secondary-text-color);
          border-radius: 99px; padding: 5px 13px; font-size: .78rem; cursor: pointer;
          font-family: inherit; display: inline-flex; align-items: center; gap: 6px;
          transition: background .18s ease, color .18s ease, border-color .18s ease; }
  .chip:hover { color: var(--primary-text-color); border-color: var(--primary-color); }
  .chip.acceso { background: var(--primary-color); border-color: var(--primary-color);
                 color: var(--text-primary-color, #fff); }
  .chip:disabled { opacity: .6; cursor: default; }
  .pill { background: var(--divider-color); border-radius: 99px; padding: 0 6px; font-size: .7rem; }
  .chip.acceso .pill { background: rgba(255,255,255,.25); }

  /* ---------- agenda ---------- */
  .giorno { margin-bottom: 18px; }
  .anima .giorno { animation: entra .4s ease both; animation-delay: var(--ritardo); }
  .giorno h4 { margin: 0 0 8px; font-size: .74rem; color: var(--primary-color); letter-spacing: 1.2px;
               text-transform: uppercase; font-weight: 500; }
  .ev { display: flex; gap: 12px; padding: 7px 0; font-size: .88rem; }
  .ev .ora { color: var(--secondary-text-color); font-size: .76rem; min-width: 42px; flex-shrink: 0;
             padding-top: 2px; font-variant-numeric: tabular-nums; }
  .ev .cosa { flex: 1; line-height: 1.4; }
  .ev .cosa small { display: block; color: var(--secondary-text-color); margin-top: 2px; }
  .pallino { width: 3px; border-radius: 99px; flex-shrink: 0; }

  .versione { text-align: right; padding: 0 14px 8px; font-size: .65rem;
              color: var(--secondary-text-color); opacity: .6; }

  @media (prefers-reduced-motion: reduce) {
    .anima *, .anima .corpo { animation: none !important; transition: none !important; }
  }
`;

class ClasseVivaCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._vista = null;
    this._impronta = null;
    this._espansi = new Set();
    this._direzione = 0;
    this._soloNonLette = false;
    this._sottoNota = null;
  }

  setConfig(config) {
    this._config = config || {};
    const v = this._config.vista;
    if (v && v !== "combo" && !VISTE.some((x) => x.id === v)) {
      throw new Error(
        `vista "${v}" non valida: usa medie, voti, bacheca, agenda o combo`
      );
    }
    this._vista = v && v !== "combo" ? v : null;
    this._impronta = null;
  }

  getCardSize() {
    return this._config && this._config.vista === "medie" ? 4 : 8;
  }

  set hass(hass) {
    this._hass = hass;
    const ent = this._entita();
    // Ridisegna solo quando i dati cambiano davvero: senza questo controllo ogni
    // aggiornamento di stato di Home Assistant rifarebbe partire le animazioni.
    const impronta = JSON.stringify(
      Object.values(ent).map((e) => (e ? `${e.entity_id}:${e.last_updated}` : "-"))
    );
    if (impronta !== this._impronta) {
      this._impronta = impronta;
      this._disegna(ent);
    }
  }

  /** Trova le entità dell'integrazione, filtrando per `account` se indicato. */
  _entita() {
    const cfg = this._config || {};
    const stati = this._hass ? this._hass.states : {};
    const filtro = String(cfg.account || cfg.studente || "").toLowerCase();

    const cerca = (dominio, parola, esplicita) => {
      if (esplicita) return stati[esplicita];
      for (const id of Object.keys(stati)) {
        if (!id.startsWith(dominio + ".") || !id.includes("classeviva")) continue;
        if (!id.includes(parola)) continue;
        if (filtro && !id.includes(filtro)) continue;
        return stati[id];
      }
      return undefined;
    };

    return {
      media: cerca("sensor", "media", cfg.media),
      voti: cerca("sensor", "voti", cfg.voti),
      bacheca: cerca("sensor", "bacheca", cfg.bacheca),
      agenda: cerca("sensor", "agenda", cfg.agenda),
      note: cerca("sensor", "note", cfg.note),
      scrutini: cerca("sensor", "scrutini", cfg.scrutini),
    };
  }

  get _anima() {
    return this._config.animazioni !== false;
  }

  _disegna(ent) {
    const singola = this._config.vista && this._config.vista !== "combo";
    const viste = singola ? VISTE.filter((v) => v.id === this._config.vista) : VISTE;
    if (!this._vista || !viste.some((v) => v.id === this._vista)) this._vista = viste[0].id;

    const titolo =
      this._config.titolo !== undefined ? this._config.titolo : this._nomeStudente(ent);
    const anno = this._attr(ent.media, "anno") || this._attr(ent.voti, "anno") || "";

    const corpi = {
      medie: () => this._vistaMedie(ent),
      voti: () => this._vistaVoti(ent),
      bacheca: () => this._vistaBacheca(ent),
      agenda: () => this._vistaAgenda(ent),
      note: () => this._vistaNote(ent),
      scrutini: () => this._vistaScrutini(ent),
    };
    const verso =
      this._direzione > 0 ? "da-destra" : this._direzione < 0 ? "da-sinistra" : "";

    this.shadowRoot.innerHTML = `
      <style>${STILE}</style>
      <div class="cvv ${this._anima ? "anima" : ""}">
        ${
          titolo
            ? `<div class="testa">
                 <h2 class="titolo">${this._esc(titolo)}</h2>
                 ${anno ? `<span class="anno">${this._esc(anno)}</span>` : ""}
               </div>`
            : ""
        }
        ${
          viste.length > 1
            ? `<div class="tabs">${viste
                .map(
                  (v) =>
                    `<button class="tab ${v.id === this._vista ? "attivo" : ""}" data-vista="${v.id}">
                       <span class="glifo">${v.icona}</span><span class="etichetta">${v.nome}</span>${this._contatore(v.id, ent)}
                     </button>`
                )
                .join("")}</div>`
            : ""
        }
        <div class="corpo ${verso}">${corpi[this._vista]()}</div>
        ${this._config.versione ? `<div class="versione">card v${VERSIONE}</div>` : ""}
      </div>
      <dialog class="dettaglio"></dialog>`;


    this.shadowRoot.querySelectorAll(".tab").forEach((b) =>
      b.addEventListener("click", () => {
        if (b.dataset.vista === this._vista) return;  // già qui: niente da rifare
        const prima = viste.findIndex((v) => v.id === this._vista);
        const dopo = viste.findIndex((v) => v.id === b.dataset.vista);
        this._direzione = dopo > prima ? 1 : -1;
        this._vista = b.dataset.vista;
        this._disegna(this._entita());
      })
    );
    this.shadowRoot.querySelectorAll("[data-espandi]").forEach((b) =>
      b.addEventListener("click", () => {
        // espansione in place: ridisegnare tutto farebbe ripartire le animazioni
        const k = b.dataset.espandi;
        const aperto = this._espansi.has(k);
        aperto ? this._espansi.delete(k) : this._espansi.add(k);
        const box = b.closest(".com");
        const testo = box && box.querySelector(".testo");
        if (testo) {
          testo.textContent = aperto ? testo.dataset.corto : testo.dataset.lungo;
          b.textContent = aperto ? "Leggi tutto" : "Riduci";
        }
      })
    );
    this.shadowRoot.querySelectorAll("[data-materia]").forEach((b) =>
      b.addEventListener("click", () => this._apriMateria(b.dataset.materia, ent))
    );
    this.shadowRoot.querySelectorAll("[data-filtro]").forEach((b) =>
      b.addEventListener("click", () => {
        this._soloNonLette = !this._soloNonLette;
        this._direzione = 0;
        this._disegna(this._entita());
      })
    );
    this.shadowRoot.querySelectorAll("[data-sotto]").forEach((b) =>
      b.addEventListener("click", () => {
        if (b.dataset.sotto === this._sottoNota) return;
        this._sottoNota = b.dataset.sotto;
        this._direzione = 0;
        this._disegna(this._entita());
      })
    );
    this.shadowRoot.querySelectorAll("[data-azione]").forEach((b) =>
      b.addEventListener("click", async () => {
        const azione = b.dataset.azione;
        const originale = b.textContent;
        b.disabled = true;
        b.textContent = "Attendere…";
        let esito = "Fatto.";
        try {
          await this._hass.callService(
            "classeviva",
            azione === "testi" ? "carica_testi_bacheca" : "aggiorna",
            {}
          );
        } catch (err) {
          esito = "Errore.";
          console.error("classeviva-card:", err);
        }
        // il pulsante va comunque riabilitato: se l'operazione non cambia nulla
        // la card non viene ridisegnata e resterebbe bloccata sui puntini
        b.textContent = esito;
        setTimeout(() => {
          b.disabled = false;
          b.textContent = originale;
        }, 1500);
      })
    );
    this.shadowRoot.querySelectorAll("[data-leggi]").forEach((b) =>
      b.addEventListener("click", async () => {
        b.disabled = true;
        b.textContent = "Apertura…";
        try {
          // returnResponse: il testo torna qui e viene mostrato subito, senza
          // rinfrescare la card (altrimenti la comunicazione, ormai letta,
          // sparirebbe dal filtro "solo da leggere" prima di poterla leggere)
          const esito = await this._hass.callService(
            "classeviva",
            "leggi_comunicazione",
            { pub_id: String(b.dataset.leggi) },
            undefined,
            false,
            true
          );
          const testo = esito && esito.response && esito.response.testo;
          const box = b.closest(".com");
          if (testo && box) {
            const div = document.createElement("div");
            div.className = "testo";
            div.textContent = testo;
            box.insertBefore(div, b);
            b.remove();
          } else {
            b.textContent = "Nessun testo.";
          }
        } catch (err) {
          console.error("classeviva-card:", err);
          b.textContent = "Errore.";
          b.disabled = false;
        }
      })
    );
  }

  /** Finestra con tutti i voti di una materia. */
  _apriMateria(materia, ent) {
    const dialogo = this.shadowRoot.querySelector("dialog.dettaglio");
    if (!dialogo) return;

    const voti = (this._attr(ent.voti, "items", []) || []).filter(
      (v) => v.materia === materia
    );
    const media = (this._attr(ent.media, "per_materia", []) || []).find(
      (m) => m.materia === materia
    );

    const righe = voti.length
      ? voti
          .map(
            (v) => `<div class="dett-riga">
              <span class="d">${this._esc(v.data || "")}</span>
              <span class="v" style="background:${this._colore(
                v.negativo ? 0 : v.valore
              )}">${this._esc(v.voto)}</span>
              <span class="t">${this._esc(v.tipo || "")}${
              v.periodo ? ` · ${this._esc(v.periodo)}` : ""
            }${v.in_media === false ? " · Fuori media" : ""}</span>
            </div>`
          )
          .join("")
      : `<div class="vuoto">Nessun voto per questa materia.</div>`;

    dialogo.innerHTML = `
      <button class="dett-chiudi" aria-label="Chiudi">&times;</button>
      <div class="dett-testa">
        <h3>${this._esc(this._capo(materia))}</h3>
        ${
          media
            ? `<span class="dett-media" style="color:${this._colore(media.media)}">${this._numero(
                media.media
              )}</span>`
            : ""
        }
      </div>
      <div class="dett-corpo">
        ${
          media
            ? `<div class="anno" style="padding:10px 0 4px">${media.voti} voti${
                media.insufficienze ? ` · ${media.insufficienze} insufficienze` : ""
              }</div>`
            : ""
        }
        ${righe}
      </div>`;

    dialogo.querySelector(".dett-chiudi").addEventListener("click", () => dialogo.close());
    // click sullo sfondo (fuori dal riquadro) = chiudi
    dialogo.addEventListener("click", (e) => {
      if (e.target === dialogo) dialogo.close();
    });
    dialogo.showModal();
  }

  _nomeStudente(ent) {
    const e = ent.media || ent.voti || ent.bacheca || ent.agenda;
    if (!e) return "ClasseViva";
    const nome = (e.attributes.friendly_name || "").replace(
      /\s*(media|voti|bacheca|agenda|file docenti|note)\s*/gi,
      " "
    );
    return nome.trim() || "ClasseViva";
  }

  _contatore(vista, ent) {
    const rosso = (v) => (v > 0 ? ` <span class="tag nuovo">${v}</span>` : "");
    if (vista === "bacheca") return rosso(parseInt(ent.bacheca && ent.bacheca.state, 10));
    // solo le note ancora da leggere: il totale non è una novità da segnalare
    if (vista === "note") return rosso(this._attr(ent.note, "da_leggere", 0));
    return "";
  }

  _attr(entita, nome, def) {
    return entita && entita.attributes[nome] !== undefined
      ? entita.attributes[nome]
      : def;
  }

  // ----------------------------------------------------------------- medie

  _vistaMedie(ent) {
    const media = ent.media ? ent.media.state : null;
    const periodi = this._attr(ent.media, "per_periodo", {}) || {};
    const materie = this._attr(ent.media, "per_materia", []) || [];
    const valida = media && media !== "unknown" && media !== "unavailable";
    if (!valida && !materie.length)
      return `<div class="vuoto">Nessuna media disponibile per questo anno.</div>`;

    const d = parseFloat(this._config.dimensione) || 170;
    const max = parseFloat(this._config.massimo) || 10;
    const layout = String(this._config.layout || "auto");
    const disposizione =
      layout === "orizzontale" ? "riga" : layout === "verticale" ? "" : "auto";
    const mostraPeriodi = this._config.periodi !== false;

    const nVoti = (this._attr(ent.voti, "items", []) || []).length;
    const insuff = this._attr(ent.voti, "insufficienze", 0);

    // cerchio pieno: la circonferenza fa da righello, l'arco si ferma alla media
    const n = parseFloat(media);
    const frazione = valida && !isNaN(n) ? Math.max(0, Math.min(1, n / max)) : 0;
    const spessore = Math.max(7, d * 0.075);
    const r = (d - spessore) / 2;
    const giro = 2 * Math.PI * r;
    const colore = this._colore(n);

    const cerchio = `
      <div class="cerchio" style="width:${d}px;height:${d}px">
        <svg width="${d}" height="${d}">
          <circle class="traccia" cx="${d / 2}" cy="${d / 2}" r="${r}"
                  fill="none" stroke-width="${spessore}"/>
          <circle class="arco" cx="${d / 2}" cy="${d / 2}" r="${r}" fill="none"
                  stroke="${colore}" stroke-width="${spessore}" stroke-linecap="round"
                  stroke-dasharray="${giro}"
                  stroke-dashoffset="${giro * (1 - frazione)}"
                  style="--vuoto:${giro}"/>
        </svg>
        <div class="dentro">
          <span class="num" style="font-size:${d * 0.3}px;color:${colore}">${
      valida ? this._numero(n) : "—"
    }</span>
          <span class="eti" style="font-size:${Math.max(9, d * 0.068)}px">media</span>
        </div>
      </div>
      ${
        nVoti
          ? `<div class="cerchio-sotto sotto" style="font-size:${Math.max(
              11,
              d * 0.075
            )}px;text-align:center;color:var(--secondary-text-color)">
               ${nVoti} voti${insuff ? ` · ${insuff} insufficienze` : ""}
             </div>`
          : ""
      }`;

    const voci = Object.entries(periodi);
    const linee =
      mostraPeriodi && voci.length
        ? `<div class="linee">${voci
            .map(([nome, val], i) => {
              const v = parseFloat(val);
              const perc = Math.max(0, Math.min(100, (v / max) * 100));
              return `<div class="linea">
                <div class="cap">
                  <span class="nome">${this._esc(this._sigla(nome))}</span>
                  <span class="val" style="color:${this._colore(v)}">${this._numero(v)}</span>
                </div>
                <div class="pista">
                  <span style="--w:${perc}%;--ritardo:${0.35 + i * 0.12}s;background:${this._colore(
                v
              )}"></span>
                </div>
              </div>`;
            })
            .join("")}</div>`
        : "";

    return `<div class="medie ${disposizione}">
      <div class="blocco-cerchio">${cerchio}</div>
      ${linee}
    </div>`;
  }

  // ------------------------------------------------------------------ voti

  _vistaVoti(ent) {
    const media = ent.media ? ent.media.state : null;
    const materie = this._attr(ent.media, "per_materia", []) || [];
    const voti = this._attr(ent.voti, "items", []) || [];
    if (!materie.length && !voti.length)
      return `<div class="vuoto">Nessun voto disponibile per questo anno.</div>`;

    const max = parseFloat(this._config.massimo) || 10;
    const insuff = this._attr(ent.voti, "insufficienze", 0);
    const valida = media && media !== "unknown" && media !== "unavailable";

    const testa = valida
      ? `<div class="sommario">
           <span class="n" style="color:${this._colore(parseFloat(media))}">${this._esc(
          media
        )}</span>
           <span class="d">Media generale · ${voti.length} voti${
          insuff ? ` · ${insuff} insufficienze` : ""
        }</span>
         </div>`
      : "";

    const elenco = materie
      .map((m, i) => {
        const perc = Math.max(0, Math.min(100, (m.media / max) * 100));
        return `<div class="materia">
          <div class="riga">
            <button class="nome" data-materia="${this._esc(m.materia)}"
                    title="Vedi tutti i voti di ${this._esc(m.materia)}">${this._esc(
          this._capo(m.materia)
        )}</button>
            <span class="val" style="color:${this._colore(m.media)}">${this._numero(
          m.media
        )}${
          m.insufficienze
            ? ` <span class="tag insuff" title="${m.insufficienze} voti insufficienti su ${m.voti}">${m.insufficienze} insuff.</span>`
            : ` <span class="tag pulita" title="${m.voti} voti, nessuna insufficienza">${m.voti} ${
                m.voti === 1 ? "voto" : "voti"
              }</span>`
        }</span>
          </div>
          <div class="pista">
            <span style="--w:${perc}%;--ritardo:${i * 0.045}s;background:${this._colore(
          m.media
        )}"></span>
          </div>
        </div>`;
      })
      .join("");

    const recenti = voti
      .slice(0, 14)
      .map(
        (v, i) =>
          `<span class="voto" style="--ritardo:${i * 0.035}s;background:${this._colore(
            v.negativo ? 0 : v.valore
          )}" title="${this._esc(this._capo(v.materia))} · ${this._esc(v.tipo || "")}">${this._esc(
            v.voto
          )}<small>${this._esc((v.data || "").slice(5))}</small></span>`
      )
      .join("");

    return `${testa}${elenco}
      ${recenti ? `<h4 class="sez">Ultimi voti</h4><div class="voti">${recenti}</div>` : ""}`;
  }

  // --------------------------------------------------------------- bacheca

  _vistaBacheca(ent) {
    const items = this._attr(ent.bacheca, "items", []) || [];
    if (!items.length) return `<div class="vuoto">Nessuna comunicazione.</div>`;
    const totale = this._attr(ent.bacheca, "totale", items.length);
    const daLeggere = items.filter((c) => !c.letto).length;
    // il portale restituisce il testo solo delle comunicazioni ancora in corso:
    // per quelle in archivio l'unica via è "Apri", che le segna come lette
    const senzaTesto = items.filter((c) => !c.testo && c.attiva).length;

    const barra = `<div class="barra-azioni">
      <button class="chip ${this._soloNonLette ? "acceso" : ""}" data-filtro="nonlette">
        Solo da leggere${daLeggere ? ` (${daLeggere})` : ""}
      </button>
      ${
        senzaTesto
          ? `<button class="chip" data-azione="testi" title="Scarica i testi mancanti senza segnarli come letti">
               Carica ${senzaTesto} testi
             </button>`
          : ""
      }
      <button class="chip" data-azione="aggiorna" title="Rileggi subito i dati da ClasseViva">↻ Aggiorna</button>
    </div>`;

    const riga = (c, i) => {
      const chiave = String(c.pub_id || i);
      const aperto = this._espansi.has(chiave);
      const testo = c.testo || "";
      const lungo = testo.length > 180 || c.troncato;
      const corto = lungo ? testo.slice(0, 180) + "…" : testo;
      return `<div class="com ${c.letto ? "" : "nuova"}" style="--ritardo:${Math.min(
        i * 0.04,
        0.4
      )}s">
        <div class="cap">
          <span class="data">${this._esc(c.data || "")}</span>
          <span class="tit">${this._esc(this._capo(c.titolo))}</span>
          ${c.attiva ? `<span class="tag viva">in corso</span>` : ""}
          ${!c.letto ? `<span class="tag nuovo">da leggere</span>` : ""}
        </div>
        ${
          testo
            ? `<div class="testo" data-corto="${this._esc(corto)}" data-lungo="${this._esc(
                testo
              )}">${this._esc(aperto ? testo : corto)}</div>`
            : ""
        }
        ${
          lungo
            ? `<button class="apri" data-espandi="${chiave}">${
                aperto ? "Riduci" : "Leggi tutto"
              }</button>`
            : ""
        }
        ${
          !testo && !c.letto
            ? `<button class="apri" data-leggi="${this._esc(
                c.pub_id
              )}">Apri (la segna come letta)</button>`
            : ""
        }
        ${(c.allegati || [])
          .map(
            (a) =>
              `<a class="file" href="${a.download_url}" target="_blank" rel="noopener">📎 ${this._esc(
                a.nome
              )}</a>`
          )
          .join("")}
      </div>`;
    };

    const visibili = this._soloNonLette ? items.filter((c) => !c.letto) : items;
    if (!visibili.length)
      return `${barra}<div class="vuoto">Nessuna comunicazione da leggere.</div>`;

    const attive = visibili.filter((c) => c.attiva);
    const vecchie = visibili.filter((c) => !c.attiva);
    return `${barra}
      ${attive.length ? attive.map(riga).join("") : ""}
      ${
        vecchie.length
          ? `<h4 class="sez">Archivio · ${visibili.length} di ${totale}</h4>${vecchie
              .map(riga)
              .join("")}`
          : ""
      }`;
  }

  // ------------------------------------------------------------ annotazioni

  _vistaNote(ent) {
    const tutte = this._attr(ent.note, "items", []) || [];
    if (!tutte.length)
      return `<div class="vuoto">Nessuna nota né annotazione.</div>`;

    if (!this._sottoNota) this._sottoNota = SOTTO_NOTE[0].id;
    const conta = (id) => tutte.filter((n) => n.categoria === id).length;

    const sotto = `<div class="sottomenu">${SOTTO_NOTE.map(
      (v) =>
        `<button class="chip ${v.id === this._sottoNota ? "acceso" : ""}" data-sotto="${v.id}">
           ${v.nome} <span class="pill">${conta(v.id)}</span>
         </button>`
    ).join("")}</div>`;

    const elenco = tutte.filter((n) => n.categoria === this._sottoNota);
    if (!elenco.length)
      return `${sotto}<div class="vuoto">Nessuna voce in questa categoria.</div>`;

    const righe = elenco
      .map(
        // niente pallino a sinistra: qui la targhetta colorata basta a distinguere
        (n, i) => `<div class="com" style="--ritardo:${Math.min(i * 0.04, 0.4)}s">
          <div class="cap">
            <span class="data">${this._esc(n.data || "")}</span>
            <span class="tit">${this._esc(this._nomeProprio(n.autore))}</span>
            ${n.letta === false ? `<span class="tag nuovo">da leggere</span>` : ""}
            <span class="tag ${
              n.categoria === "disciplinare" || n.richiamo ? "nuovo" : ""
            }">${this._esc(n.tipo || "")}</span>
          </div>
          ${
            n.testo
              ? `<div class="testo">${this._esc(n.testo)}</div>`
              : `<div class="avviso">Testo non ancora visibile: sul registro va aperta,
                   e aprendola viene registrata la presa visione.</div>`
          }
        </div>`
      )
      .join("");
    return `${sotto}${righe}`;
  }

  // --------------------------------------------------------------- scrutini

  _vistaScrutini(ent) {
    const items = this._attr(ent.scrutini, "items", []) || [];
    if (!items.length)
      return `<div class="vuoto">Nessun documento di scrutinio pubblicato.</div>`;

    return items
      .map(
        (d, i) => `<div class="com" style="--ritardo:${i * 0.06}s">
          <div class="cap">
            <span class="tit">${this._esc(this._capo(d.descrizione))}</span>
            ${d.periodo ? `<span class="tag">${this._esc(d.periodo)}</span>` : ""}
            ${d.anno ? `<span class="data">a.s. ${this._esc(d.anno)}</span>` : ""}
          </div>
          <a class="file" href="${d.download_url}" target="_blank" rel="noopener">
            ${d.tipo === "pagina" ? "📄 Apri" : "📄 Scarica il PDF"}
          </a>
          ${
            d.presa_visione_richiesta
              ? `<div class="avviso">Aprendolo da qui la presa visione non viene registrata: per confermarla serve il portale ClasseViva.</div>`
              : ""
          }
        </div>`
      )
      .join("");
  }

  // ---------------------------------------------------------------- agenda

  _vistaAgenda(ent) {
    const items = this._attr(ent.agenda, "items", []) || [];
    if (!items.length) return `<div class="vuoto">Nessun evento in agenda.</div>`;

    const perGiorno = {};
    items.forEach((e) => {
      const g = (e.inizio || "").slice(0, 10);
      (perGiorno[g] = perGiorno[g] || []).push(e);
    });

    return Object.keys(perGiorno)
      .sort()
      .reverse()
      .map((g, i) => {
        const d = new Date(g + "T00:00:00");
        const etichetta = isNaN(d)
          ? g
          : d.toLocaleDateString("it-IT", {
              weekday: "long",
              day: "numeric",
              month: "long",
            });
        const righe = perGiorno[g]
          .map((e) => {
            const compiti = (e.tipo || "").toLowerCase().startsWith("compiti");
            const ora = (e.inizio || "").slice(11, 16);
            return `<div class="ev">
              <div class="pallino" style="background:${compiti ? GIALLO : AZZURRO}"></div>
              <span class="ora">${ora || "—"}</span>
              <span class="cosa">${this._esc(this._nomeProprio(e.materia || e.autore || "") || this._capo(e.materia || e.autore || ""))}
                <small>${this._esc(e.note || "")}</small></span>
            </div>`;
          })
          .join("");
        return `<div class="giorno" style="--ritardo:${Math.min(
          i * 0.05,
          0.4
        )}s"><h4>${etichetta}</h4>${righe}</div>`;
      })
      .join("");
  }

  // ----------------------------------------------------------------- utili

  /** Colore interpolato sulla scala: niente salto secco fra 5.9 e 6.0. */
  _colore(valore) {
    const v = parseFloat(valore);
    if (isNaN(v)) return "var(--secondary-text-color)";
    if (v <= SCALA[0].v) return SCALA[0].c;
    for (let i = 1; i < SCALA.length; i++) {
      if (v <= SCALA[i].v) {
        const a = SCALA[i - 1];
        const b = SCALA[i];
        const t = (v - a.v) / (b.v - a.v);
        return this._mescola(a.c, b.c, t);
      }
    }
    return SCALA[SCALA.length - 1].c;
  }

  _mescola(c1, c2, t) {
    const n = (c) => [1, 3, 5].map((i) => parseInt(c.substr(i, 2), 16));
    const [r1, g1, b1] = n(c1);
    const [r2, g2, b2] = n(c2);
    const m = (a, b) => Math.round(a + (b - a) * t);
    return `rgb(${m(r1, r2)},${m(g1, g2)},${m(b1, b2)})`;
  }

  /** Prima lettera maiuscola: il registro scrive le materie tutte minuscole. */
  _capo(testo) {
    const t = String(testo || "").trim();
    if (!t) return "";
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  /** Nomi propri: il registro li scrive tutti maiuscoli ("MARIO ROSSI").
   *  Interviene solo se il testo e' effettivamente in maiuscolo, per non
   *  rovinare quello gia' scritto normalmente. Le particelle restano minuscole. */
  _nomeProprio(testo) {
    const t = String(testo || "").trim();
    if (!t || t !== t.toUpperCase()) return t;
    const particelle = new Set([
      "di", "de", "del", "della", "dello", "dei", "degli", "delle",
      "da", "dal", "e", "ed", "la", "lo", "il", "in", "su", "per",
    ]);
    return t
      .toLowerCase()
      .split(/(\s+)/)
      .map((pezzo, i) => {
        if (!pezzo.trim()) return pezzo;
        if (i > 0 && particelle.has(pezzo)) return pezzo;
        // maiuscola anche dopo un apostrofo: "d'amico mario" -> "D'Amico Mario"
        return pezzo.replace(/(^|['’-])(\p{L})/gu, (_, pre, lettera) => pre + lettera.toUpperCase());
      })
      .join("");
  }

  _numero(v) {
    const n = parseFloat(v);
    if (isNaN(n)) return "—";
    return n.toFixed(2).replace(/0$/, "").replace(/\.$/, "");
  }

  _sigla(periodo) {
    // forma corta: l'etichetta sta su una riga anche nelle card strette
    const m = String(periodo).match(/\d/);
    if (!m) return String(periodo).slice(0, 12);
    const testo = String(periodo).toLowerCase();
    let tipo = "periodo";
    if (testo.includes("inter")) tipo = "interq.";
    else if (testo.includes("quadri")) tipo = "quad.";
    else if (testo.includes("trime")) tipo = "trim.";
    else if (testo.includes("penta")) tipo = "pent.";
    return `${m[0]}° ${tipo}`;
  }

  _esc(s) {
    return String(s === undefined || s === null ? "" : s).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }
}

customElements.define("classeviva-card", ClasseVivaCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "classeviva-card",
  name: "ClasseViva",
  description: "Medie, voti, bacheca e agenda del registro ClasseViva",
  preview: false,
});

console.info(
  `%c CLASSEVIVA-CARD %c v${VERSIONE} `,
  "background:#e53935;color:#fff;font-weight:bold",
  "background:#333;color:#fff"
);
