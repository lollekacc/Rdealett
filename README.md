# Rdealett

Static frontend for Dealett.

## Checks

Run all local checks:

```bash
npm run check
```

This checks JavaScript syntax, JSON syntax, trailing whitespace, and the browser smoke flows.

Run the browser smoke test:

```bash
npm run smoke
```

The smoke test starts a temporary static server and drives Chrome/Chromium through the core cart flows. Set `CHROME_BIN` if Chrome is not in a standard location.
