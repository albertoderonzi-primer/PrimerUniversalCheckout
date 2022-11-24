# Primer Universal Checkout

You can run:


1a Primer Drop-in Standard Flow
1b Primer Drop-in Manual Flow

2a Primer Headless Checkout Standard Flow
2b Primer Headless Checkout Manual Flow

For Drop-in select 'checkout-original.html' in `server.js` row 18
- For Standard Flow use `client.js`  in checkout-original.html row 29
- For Manual Flow use `client-manual.js` in checkout-original.html row 29

For Hedless select 'checkout-headless.html' in `server.js` row 18
- For Standard Flow use `client-headless.js`  in checkout-headless.html row 61
- For Manual Flow use `client-headless-manual.js` in checkout-headless.html row 61


## Deployment

To run this project locally 

- install dependencies

```bash
  npm install
```

- Change `example.env` -> `.env` and add your Primer API key

```bash
  mv example.env .env
```

- To run in development mode 

```bash
  npm run dev
```

- To run in "production" mode

```bash
  npm start
```