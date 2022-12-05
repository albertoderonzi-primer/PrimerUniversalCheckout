# Primer Universal Checkout

You can run:


1a Primer Drop-in Standard Flow  
1b Primer Drop-in Manual Flow  

2a Primer Headless Checkout Standard Flow  
2b Primer Headless Checkout Manual Flow  


- For Standard Flow use `client.js`  in checkout-headless.html row 66
- For Manual Flow use `client-manual.js` in checkout-headless.html row 66
- For Standard Flow use `client-headless.js`  in checkout-headless.html row 66
- For Manual Flow use `client-headless-manual.js` in checkout-headless.html row 66


## Deployment

To run this project locally 

- install dependencies

```bash
  npm install
```

- Change `env.example` -> `.env` and add your Primer API key

```bash
  mv env.example .env
```

- To run in "production" mode

```bash
  npm start
```