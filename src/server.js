// This example is built using express
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

///////////////////////////////////////////
// ⚙️ Setup Server
///////////////////////////////////////////

const app = express();
var payment_id = 0;

const staticDir = path.join(__dirname, 'static');
// for Headless select checkout-headless.html
// for dropin select checkout-original.html
const checkoutPage = path.join(__dirname, 'static', 'checkout-headless.html');


// setting up cors
const cors = require("cors");
app.use(cors());

app.use(bodyParser.json());
app.use('/static', express.static(staticDir));

app.get('/', (req, res) => {
  return res.sendFile(checkoutPage);
});

///////////////////////////////////////////
// ✨ All the magic is here !
//    Create a client session
///////////////////////////////////////////

const PRIMER_API_URLS = {
  SANDBOX: 'https://api.sandbox.primer.io',
  PRODUCTION: 'https://api.primer.io',
}

const API_KEY = process.env.API_KEY;
const API_VERSION = process.env.API_VERSION;

const PRIMER_API_URL = PRIMER_API_URLS[process.env.PRIMER_API_ENVIRONMENT];


app.post('/client-session', async (req, res) => {
  const url = `${PRIMER_API_URL}/client-session`;
  console.log("Client Session API: start");

  const response = await fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Version': API_VERSION,
      'X-Api-Key': API_KEY,
    },
    body: JSON.stringify({



      // ORIGINAL BODY
      // Create an orderId for this client session
      // Make sure to keep track of it: you will later receive updates through Webhooks.
      orderId: 'order-' + Math.random(),

      customerId: "cust-1229",
      customer: {
        emailAddress: "test@primer.io",
        mobileNumber: "+44841234517",
        firstName: "Albesto",
        lastName: "Deronzi",
        shippingAddress: {
          firstName: "Yogesh",
          lastName: "Josh",
          addressLine1: "47A",
          postalCode: "CB94B9",
          city: "Cambridge",
          state: "Cambridgeshire",
          countryCode: "GB"
        },
        billingAddress: {
          firstName: "Alberto",
          lastName: "derozi",
          postalCode: "se108up",
          addressLine1: "test",
          addressLine2: "Noida",
          countryCode: "GB",
          city: "asdasd "
        }
      },

      // order: {
      //   lineItems: [{
      //     itemId: "item-1",
      //     description: "My item",
      //     amount: 1000,
      //     quantity: 1
      //   }],
      //   countryCode: "GB"
      // },
      // 3-character Currency Code used for all the amount of this session
      amount: 100,
      currencyCode: "GBP",
      paymentMethod: {
        paymentType: "FIRST_PAYMENT",
        descriptor: "Alberto Transfer",
        vaultOnSuccess: true
      },
      metadata: {
        Test: "False"
      }

      //       // Check all the other options at https://apiref.primer.io/v2/reference/create_client_side_token_client_session_post
    }),
  }).then(data => data.json());
  console.log("Create Session API: Response");
  console.log(response);
  return res.send(response);
});

app.post('/create-payment', async (req, res) => {
  console.log("Create Payment API: Start");

  const url = `${PRIMER_API_URL}/payments`;

  console.log("Create Payment API: body");
  //  console.log(req);
  console.log(req.body);

  const api_body = req.body;

  const response = await fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Version': API_VERSION,
      'X-Api-Key': API_KEY,
      'X-Idempotency-Key' : '1112' + Math.random(),
    },

    body: JSON.stringify(api_body),
  }).then(data => data.json());
  console.log("Create Payment API: Response");
  console.log(response);
  payment_id = response.id;
  return res.send(response);

});


app.post('/resume', async (req, res) => {
  console.log("Resume API: Start");

  const url = `${PRIMER_API_URL}/payments/` + payment_id + `/resume`;

  console.log("Resume API: Body");
  console.log(req.body);

  const api_body = req.body;

  const response = await fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Version': API_VERSION,
      'X-Api-Key': API_KEY,
    },

    body: JSON.stringify(api_body),
  }).then(data => data.json());
  console.log("Resume API: Response");
  console.log(response);

  return res.send(response);
});


app.patch('/patch-session', async (req, res) => {
  console.log("Patch Session API: Start");

  const url = `${PRIMER_API_URL}/client-session`;
  const api_body = req.body;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',

      'X-Api-Version': API_VERSION,
      'X-Api-Key': API_KEY,
    },


    body: JSON.stringify(api_body),

  }).then(data => data.json());
  console.log("Patch Session API: Response");
  console.log(response);

  return res.send(response);

});



///////////////////////////////////////////
// 🏃‍♂️ Run Server
///////////////////////////////////////////

const PORT = process.env.PORT || 8880;
console.log(`Checkout server listening on port ${PORT}.\nYou can now view the Checkout in a web browser at http://localhost:${PORT}`);
app.listen(PORT,'127.0.0.1');
