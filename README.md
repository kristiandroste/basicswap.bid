# BasicSwap Orderbook

Live orderbook viewer for the BasicSwap decentralized exchange.

## Features

- Real-time orderbook data display
- Filtering by trading pairs
- Sortable columns
- Data freshness indicator
- Mobile responsive design
- Dark theme matching BasicSwap DEX

## Data Source

Data is fetched from the BasicSwap API at `api.basicswap.bid`. The page auto-refreshes every 30 seconds.

## Development

This is a static site. Simply open `index.html` in a browser or serve with any static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

## Deployment

This site is deployed to GitHub Pages. To deploy:

1. Push to the `main` branch
2. GitHub Pages will automatically deploy
3. The custom domain `basicswap.bid` is configured via the `CNAME` file

## API Access

Want programmatic access to this data? Check out:

- **API Documentation:** https://docs.basicswap.bid
- **Get API Key:** https://account.basicswap.bid

## License

MIT

## Links

- [BasicSwap DEX](https://basicswapdex.com)
- [BasicSwap GitHub](https://github.com/basicswap/basicswap)
