# whitelabel-version

Static dashboard that shows which version of each Reservamos ecommerce frontend is currently deployed.

For every site listed in [index.html](index.html), the page requests its `/version` endpoint, groups the responses by app, and renders a comparison table. Release notes for each version are pulled from the corresponding GitHub repo and shown below the table.

## Run locally

It's plain HTML/JS — no build step. Serve the directory with any static server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Add a site

Edit the `apps` array in [index.html](index.html) and add the site's `/version` URL to the appropriate group (`urls` array). If you're adding a new app group, include `name`, `appName`, `repoUrl`, and `urls` so the changelog loader can find GitHub releases.

## Project layout

- [index.html](index.html) — site list and page shell
- [utils.js](utils.js) — version fetching, table rendering, changelog loader
- [assets/](assets/) — styles and images
