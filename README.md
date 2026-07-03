# KNEURAPRICE

In-browser pricing engine for AI governance advisory engagements, served as a
static site at [price.kneuralabs.com](https://price.kneuralabs.com). All data
lives in the browser — nothing is sent to a server.

## Workflow

The app is a 4-page quoting workflow:

1. **Instructions** — overview and entry points.
2. **Rate Card** — hourly rate, FTE multiplier, and on/off toggle per role.
3. **Effort Matrix** — hours per module × role; costs derive from the rate card.
4. **Quote Builder** — toggle modules in/out of scope, set margin, discount,
   contingency, commission, VAT, and pass-through costs; export the quote to
   the clipboard.

Every edit recalculates all pages live.

## Architecture

No framework, no build step — plain ES modules loaded directly by the browser.

```
index.html      markup + inline boot scripts (SSO gate, pre-paint theme)
styles.css      single stylesheet, light/dark via CSS custom properties
js/
  data.js       static catalog: roles and modules (rates, default hours)
  state.js      the single mutable store + selection helpers
  calc.js       pure pricing math — reads state, never touches the DOM
  util.js       DOM lookup, escaping, formatters
  controls.js   declarative slider/text-twin control panel (page 04)
  ratecard.js   page 02 UI
  matrix.js     page 03 UI
  quote.js      page 04 UI + clipboard export
  nav.js        page switching
  theme.js      dark/light toggle
  main.js       composition root: builds pages, wires recalc callbacks
```

Data flows one way: UI modules write user input into `state`, `calc.js`
computes derived numbers from it, and the UI re-renders from those results.
`main.js` is the only module that knows how the pieces connect.

### Pricing pipeline

`quoteCalc()` in `js/calc.js` applies, in order: internal cost → margin
(as a share of the fee: `fee = cost / (1 − margin)`) → contingency →
pass-throughs (SaaS, travel) → discount → sales commission → VAT/GST.

## Development

Serve the directory with any static file server:

```sh
npx serve .        # or: python3 -m http.server
```

The SSO gate in `index.html` redirects to the sign-on host when no session
token is present; append `?kn-auth=dev` to the local URL to satisfy it.

## Tests

The calculation layer is covered by unit tests using Node's built-in runner
(no dependencies):

```sh
npm test
```

Tests run in CI on every push and pull request (`.github/workflows/test.yml`).
