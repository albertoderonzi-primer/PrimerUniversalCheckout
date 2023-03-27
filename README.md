# Primer Universal Checkout

You can run:


1a Primer Drop-in Standard Flow  
1b Primer Drop-in Manual Flow  

2a Primer Headless Checkout Standard Flow  
2b Primer Headless Checkout Manual Flow  

in checkout-headless.html row 67

<script src="/static/client.js"></script>

- For Standard Flow use `client.js`
- For Manual Flow use `client-manual.js`
- For Headless Standard Flow use `client-headless.js`
- For Headless Manual Flow use `client-headless-manual.js`

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