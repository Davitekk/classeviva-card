# ClasseViva Card

[![hacs][hacs-badge]][hacs-url]
[![release][release-badge]][release-url]
[![licenza][license-badge]](LICENSE)

<img width="1032" height="336" alt="immagine" src="https://github.com/user-attachments/assets/fb888631-965b-4b5b-a3b4-c4fb1ec85734" />


Card Lovelace per l'integrazione [ClasseViva Spaggiari][integrazione-url]: Medie, Voti,
Bacheca, Agenda, Annotazioni e Scrutini in un'unica plancia.

> Richiede l'integrazione [classeviva-ha][integrazione-url] già configurata.

## Cosa mostra

| Scheda | Contenuto |
|---|---|
| **Medie** | Media generale in un grafico con quadrimestri |
| **Voti** | Media e barra per materia, ultimi voti; clic sulla materia per il dettaglio |
| **Bacheca** | Comunicazioni con testo e allegati, filtro "solo da leggere" |
| **Agenda** | Compiti e annotazioni raggruppati per giorno |
| **Annotazioni** | Sottomenù fra annotazioni dei docenti e note disciplinari |
| **Scrutini** | Pagelle e pagellini pubblicati, scaricabili |

Colore continuo dal rosso al verde in base al voto, animazioni di ingresso e un layout che
si adatta alla larghezza della card.

## Installazione

### HACS

HACS → Frontend → menu ⋮ → *Repository personalizzati* → incolla l'URL di questo
repository, categoria **Lovelace** → installa.

### Manuale

1. Copia `classeviva-card.js` in `<config>/www/`, ad esempio
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
| `titolo` | testo dell'intestazione (`""` per nasconderla) | Nome Studente |
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
