# ClasseViva Card

[![hacs][hacs-badge]][hacs-url]
[![release][release-badge]][release-url]
[![licenza][license-badge]](LICENSE)

Card Lovelace per l'integrazione [ClasseViva Spaggiari][integrazione-url]: medie, voti,
bacheca, agenda, annotazioni e scrutini in un'unica plancia.

> Richiede l'integrazione [classeviva-ha][integrazione-url] già configurata.

## Cosa mostra

| Scheda | Contenuto |
|---|---|
| **Medie** | media generale in un anello, linee dei quadrimestri |
| **Voti** | media e barra per materia, ultimi voti; clic sulla materia per il dettaglio |
| **Bacheca** | comunicazioni con testo e allegati, filtro "solo da leggere" |
| **Agenda** | compiti e annotazioni raggruppati per giorno |
| **Annotazioni** | sottomenù fra annotazioni dei docenti e note disciplinari |
| **Scrutini** | pagelle e pagellini pubblicati, scaricabili |

Colore continuo dal rosso al verde in base al voto, animazioni di ingresso, layout che
si adatta alla larghezza della card e alle schede visibili.

## Installazione

### HACS

HACS → Frontend → menu ⋮ → *Repository personalizzati* → incolla l'URL di questo
repository, categoria **Lovelace** → installa.

### Manuale

1. copia `classeviva-card.js` in `<config>/www/`, ad esempio
   `<config>/www/community/classeviva/classeviva-card.js`
2. *Impostazioni → Dashboard → ⋮ → Risorse → Aggiungi*, tipo **Modulo JavaScript**,
   URL corrispondente al percorso dentro `www/` (che si affaccia su `/local/`):
   `/local/community/classeviva/classeviva-card.js`

## Uso

```yaml
type: custom:classeviva-card
```

Trova da sola le entità dell'integrazione: non serve indicare nessun `entity_id`.

### Opzioni

| Opzione | Valori | Default |
|---|---|---|
| `vista` | `medie`, `voti`, `bacheca`, `agenda`, `note`, `scrutini`, `combo` | `combo` |
| `account` | parte dell'entity_id, se hai più studenti o più anni | — |
| `titolo` | testo dell'intestazione (`""` per nasconderla) | nome studente |
| `animazioni` | `true` / `false` | `true` |
| `versione` | `true` mostra la versione della card in fondo | `false` |

Solo per `vista: medie`:

| Opzione | Valori | Default |
|---|---|---|
| `layout` | `auto`, `verticale`, `orizzontale` | `auto` |
| `dimensione` | diametro del cerchio in px (tutto scala con questo) | `170` |
| `periodi` | `true` / `false`, linee dei quadrimestri | `true` |
| `massimo` | voto massimo della scala | `10` |

Con `auto` il cerchio si mette a sinistra e le linee a destra quando la card supera i
500px; sotto quella soglia si impilano.

```yaml
type: custom:classeviva-card
vista: medie
layout: verticale
dimensione: 190
```

### Larghezza

Sotto i 460px le schede mostrano le sole icone, così restano tutte raggiungibili anche
in una colonna stretta. Per allargare la card serve una vista a **sezioni** — nel
layout Masonry le colonne hanno larghezza fissa:

```yaml
type: custom:classeviva-card
grid_options:
  columns: 12
```

## Aggiornamenti e cache

Home Assistant serve i file di `www/` con `Cache-Control` di 31 giorni: dopo aver
sostituito il file fai **Ctrl+F5**. Se il tuo Home Assistant è dietro un proxy o una
CDN che memorizza le risorse, aggiungi un numero di versione all'URL della risorsa
(`?v=2`, `?v=3`, …) oppure escludi `/local/` dalla cache.

La versione in uso si legge nella console del browser: `CLASSEVIVA-CARD v…`.

## Crediti

Sviluppato da [@Davitekk](https://github.com/Davitekk) con l'assistenza di
**Claude** (Anthropic), che ha collaborato al reverse engineering del registro
e alla scrittura del codice.

## Licenza

[MIT](LICENSE)

[hacs-badge]: https://img.shields.io/badge/HACS-Custom-41BDF5.svg
[hacs-url]: https://github.com/hacs/integration
[release-badge]: https://img.shields.io/github/v/release/Davitekk/classeviva-card
[release-url]: https://github.com/Davitekk/classeviva-card/releases
[license-badge]: https://img.shields.io/github/license/Davitekk/classeviva-card
[integrazione-url]: https://github.com/Davitekk/classeviva-ha
