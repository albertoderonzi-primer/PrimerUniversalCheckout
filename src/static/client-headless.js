window.addEventListener("load", onLoaded);

async function onLoaded() {

  const submitFormButton = document.getElementById("submit-button");
  const autofillFormButton = document.getElementById("autofill-button");
  const quantity = document.getElementById("quantity");
  const size = document.getElementById("size");
  const amount = document.getElementById("amount");
  const currency = document.getElementById("currency");



  const customerDetails = {
    firstName: document.getElementById("first-name"),
    lastName: document.getElementById("last-name"),
    emailAddress: document.getElementById("email-address"),
    mobileNumber: document.getElementById("mobile-number"),

  };
  const billingAddress = {
    addressLine1: document.getElementById("address-line1"),
    addressLine2: document.getElementById("address-line2"),
    city: document.getElementById("city"),
    state: document.getElementById("state"),
    postalCode: document.getElementById("postal-code"),
    country: document.getElementById("country"),
  };

  const autofillForm = () => {
    quantity.value = 1;
    size.value = "l";
    amount.value = "10000";
    currency.value = "GBP";
    customerDetails.firstName.value = "Alberto";
    customerDetails.lastName.value = "DeRonzi";
    customerDetails.emailAddress.value = "alber@forter.com";
    customerDetails.mobileNumber.value = "7538690994";
    billingAddress.addressLine1.value = "1 King Street";
    billingAddress.addressLine2.value = "2 Floor";
    billingAddress.city.value = "London";
    billingAddress.state.value = "GB";
    billingAddress.postalCode.value = "SE10 8CC";
    billingAddress.country.value = "GB";
  };

  autofillFormButton.addEventListener("click", autofillForm);

  const clearCheckoutDiv = () => {
    document.querySelector("#shirt-purchase-form").remove();
    document
      .querySelector("#order-container")
      .setAttribute("id", "checkout-container");
  };


  const getOrderInfo = () => {
    return {
      customerId: "alberto-test",
      //  orderId: `${Math.random().toString(36).substring(7)}`,
      orderId: "HYalberto",
      amount: parseInt(amount.value),
      currencyCode: currency.value,

      order: {
        shipping:
        {
          //  amount: 100,
          methodName: "methodName_test",
          //    methodId: "methodId_test"
        },
        lineItems: [
          {
            itemId: `item-${size.value}`,
            quantity: quantity.value,
            name: `${quantity.value} Lego${quantity.value > 1 ? "s" : ""
              } - ${size.value.toUpperCase()}`,
            description: `${quantity.value} ${size.value.toUpperCase()} Lego`,
            // amount: amount.value * quantity.value / 2,
            amount: 5000,

            productType: "PHYSICAL",
          },
          {
            itemId: `item-${size.value}`,
            name: `${quantity.value} Lego${quantity.value > 1 ? "P" : ""
              } - ${size.value.toUpperCase()}`,
            quantity: quantity.value,
            description: `${quantity.value} ${size.value.toUpperCase()} LegoP`,
            //   amount: amount.value * quantity.value / 2,
            amount: 5000,
            //    productType: "PHYSICAL",
          },
        ],
        countryCode: billingAddress.country.value,
      },
      customer: {
        firstName: customerDetails.firstName.value,
        lastName: customerDetails.lastName.value,
        emailAddress: customerDetails.emailAddress.value,
        mobileNumber: customerDetails.mobileNumber.value,
        billingAddress: {
          //    firstName: customerDetails.firstName.value,
          //   lastName: customerDetails.lastName.value,
          postalCode: billingAddress.postalCode.value,
          addressLine1: billingAddress.addressLine1.value,
          //      addressLine2: billingAddress.addressLine2.value,
          countryCode: billingAddress.country.value,
          city: billingAddress.city.value,
          //   state: billingAddress.state.value,
          //   phone: customerDetails.mobileNumber.value,
        },
        nationalDocumentId: "12345678",
      },
      metadata: {
       klarna_flow:"old_flow",
        //  force_3ds: true,
        // regionCountryCode: "GB",
        description: "Test Description",
        // sensor:"Stripe",
        // workflow: "unlimit",
       // workflow: "worldline",
          workflow: "cybersource",
        //workflow: "dlocal",
        //workflow:"stripe",
        //  workflow:"checkout",
        //workflow: "forter-testing",
        // workflow: "3ds_braintree",
        // workflow:"sift",
        // primer_credit_card:"checkout",

        // emd:{
        //     "content_type": "application/vnd.klarna.internal.emd-v2+json",
        //     "body": "{string value containing a serialized JSON object}"
        //     },
        actionList: "DECISION_SKIP",
        // v1: true,
        fraud_check: true,
        fraud_context: {
          // deliveryMethod:"deliveryMethod_fraudcontext_test",
          device_details: {
            user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/112.0",
            //   device_id: "string",
            browser_ip: "1.2.3.4",
            cookie_token: "test_cookie",
            source: "WEB"
          },
          merchant_details: {
            merchant_provider_id: "id-123",
            merchant_name: "merchant-name",
            merchant_category_code: "4414"
          }
        }
        // webapp: true
        //paypal_client_metadata_id: "6056a4e0dccf603087c289e9301cc1",
        // custom_id: "repay-6056a4e0dccf603087c289e9301cab",
        //primer_credit_card: "checkout"
      },
      paymentMethod: {
        // paymentType: "ECOMMERCE",
        // paymentType: "FIRST_PAYMENT",
        //  vaultOnSuccess: true,
        //  vaultOn3DS: false,
        descriptor: "test"

      },
    };
  };


  submitFormButton.addEventListener("click", async () => {
    const formValid = validateForm();
    if (formValid === false) {
      return;
    }
    //const clientSession = await getClientSession();

    const orderInfo = getOrderInfo();
    const clientSession = await fetch('/client-session', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Legacy-workflows': 'false'

      },
      body: JSON.stringify({
        orderInfo,
      }),
    }).then(data => data.json())
    console.log("C - Client Session data:", clientSession);

    const { clientToken } = clientSession
    console.log("C - Client token:", clientToken);

    //force token:

    //clientToken  = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6ImNsaWVudC10b2tlbi1zaWduaW5nLWtleSJ9.eyJleHAiOjE2ODE0MDIwMTIsImFjY2Vzc1Rva2VuIjoiYTVjNTMyNjAtMGRiYS00ODRiLTkwYWEtZWVjNmQ1MGE0YzA0IiwiYW5hbHl0aWNzVXJsIjoiaHR0cHM6Ly9hbmFseXRpY3MuYXBpLnNhbmRib3guY29yZS5wcmltZXIuaW8vbWl4cGFuZWwiLCJhbmFseXRpY3NVcmxWMiI6Imh0dHBzOi8vYW5hbHl0aWNzLnNhbmRib3guZGF0YS5wcmltZXIuaW8vY2hlY2tvdXQvdHJhY2siLCJpbnRlbnQiOiJDSEVDS09VVCIsImNvbmZpZ3VyYXRpb25VcmwiOiJodHRwczovL2FwaS5zYW5kYm94LnByaW1lci5pby9jbGllbnQtc2RrL2NvbmZpZ3VyYXRpb24iLCJjb3JlVXJsIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5wcmltZXIuaW8iLCJwY2lVcmwiOiJodHRwczovL3Nkay5hcGkuc2FuZGJveC5wcmltZXIuaW8iLCJlbnYiOiJTQU5EQk9YIiwicGF5bWVudEZsb3ciOiJERUZBVUxUIn0.cecBh0QonwfT0a0nG3g92_S84RZrtTeLnLj30UyVUmc"

    console.log("C - NEW Client token:", clientToken);


    if (!clientSession) {
      console.log("C - Error, no client session");
      return;
    } else {
      console.log("C - client session: ", clientSession);
    }

    clearCheckoutDiv();

    await renderCheckout(clientToken);
  });





  const validateForm = () => {
    if (quantity.value < 1) {
      alert("Please enter a quantity of at least 1");
      return false;
    }
    for (const value in customerDetails) {
      if (customerDetails[value].value === "") {
        alert("Please fill out all customer details");
        return false;
      }
    }
    for (const value in billingAddress) {
      if (billingAddress[value].value === "") {
        alert("Please fill out all billing address fields");
        return true;
      }
    }
  };


  const renderCheckout = async (clientToken) => {
    const options = {
      container: '#checkout-container',
      locale: 'en',
      // uxFlow: "SINGLE_PAYMENT_METHOD_CHECKOUT",
      //  paymentMethod: "credit",
      //   allowedCardNetworks: ['visa', 'american-express', 'mastercard'],
      //  allowedPaymentMethods: ['PAYMENT_CARD','KLARNA'],

      submitButton: {
        // useBuiltInButton: true, // Hide the built-in submit button
        amountVisible: true,
      },

      // klarna: {

      //   allowedPaymentCategories: "klarna",

      // },

      paypal: {
        paymentMethod: "debit",
        //    paymentFlow: "PREFER_VAULT"
      },
      onCheckoutComplete({ payment }) {
        console.log('Checkout Complete!', payment)
      },
      googlePay: {
        buttonColor: 'black',
        //    buttonType: 'book',
        captureBillingAddress: true,
      },

      onCheckoutFail(error, { payment }, handler) {
        console.log('Checkout Fail!', error, payment),
          handler.showErrorMessage("Nice Customised Frontend error")
      },

      onPaymentCreationStart() {
        console.log('OnPaymentCreationStart')

      },

      onBeforePaymentCreate(data, handler) {
        console.log('onBeforePaymentCreate', data)
        return handler.continuePaymentCreation()
      },

      onPaymentMethodAction(paymentMethodAction, data) {
        console.log('OnPaymentAction', paymentMethodAction, data)

      },

      handleonPaymentMethodAction(paymentMethodAction, data) {
        console.log('Handle_OnPaymentAction', data)

      },

      onClientSessionUpdate(clientSession) {
        console.log('Client session Update!', clientSession)
      }





    }




    const headless = await Primer.createHeadless(clientToken)


    const handleMySubmitButtonClick = e => {
      checkout.submit()
    }

    await headless.configure({
      onAvailablePaymentMethodsLoad(paymentMethods) {
        // Called when the available payment methods are retrieved
        console.log(paymentMethods);

        for (const paymentMethod of paymentMethods) {
          // `type` is a unique ID representing the payment method
          const { type, managerType } = paymentMethod

          switch (managerType) {
            case "CARD": {
              // Unhide the card-container div
              container.style.display = "flex";
              container.style.flexDirection = "column";
              container.style.gap = "16px";
              // Configure your card form (see Step 4.a)
              console.log("Configuring Card Forms");
              configureCardForm(headless, paymentMethod);
              break;
            }
            case "NATIVE": {
              // Render the native payment method button (see Step 4.b)
              // Relevant for PayPal, Apple Pay, and Google Pay
              console.log(
                "Configuring " +
                paymentMethod.type /*Native Payment Methods..."*/
              );
              configureNativeButton(headless, paymentMethod);
              break;
            }
            case "REDIRECT": {
              // Handle redirect payment methods (see Step 4.c)
              console.log(
                "Configuring " +
                paymentMethod.typeRedirect /*Payment Methods..."*/
              );
              configureRedirectPaymentMethod(headless, paymentMethod);
              break;
            }
            case "KLARNA": {
              // Handle redirect payment methods (see Step 4.c)
              console.log(
                "Configuring " +
                paymentMethod.type /*Payment Methods..."*/
              );
              configureKlarnaPaymentMethodManager(headless, paymentMethod);
              break;
            }
            // More payment methods to follow
          }
        }
      },

      onCheckoutComplete({ payment }) {
        // Notifies you that a payment was created
        // Move on to next step in your checkout flow:
        // e.g. Show a success message, giving access to the service, fulfilling the order, ...
        console.log('onCheckoutComplete', payment)
      },

      onCheckoutFail(error, { payment }, handler) {
        // Notifies you that the checkout flow has failed and a payment could not be created
        // This callback can also be used to display an error state within your own UI.

        // ⚠️ `handler` is undefined if the SDK does not expect anything from you
        if (!handler) {
          return
        }

        // ⚠️ If `handler` exists, you MUST call one of the functions of the handler

        // Show a default error message
        return handler.showErrorMessage()
      },
    })

    await headless.start();
    // getAssetsManager() is only available once Headless Checkout has been fully initialized
    const assetsManager = headless.getAssetsManager();
    console.log("Headless Universal Checkout is loaded!");
  }



}

//const container: '#checkout-container',


/////////////////////////////////////
////                             ////
////        Card Payments        ////
////                             ////
/////////////////////////////////////

const container = document.getElementById("checkout-container");
// Create containers for your hosted inputs
const cardNumberInputId = "checkout-card-number-input";
const cardNumberInputEl = document.createElement("div");
cardNumberInputEl.setAttribute("id", cardNumberInputId);
cardNumberInputEl.style.height = "24px";

const cardExpiryInputId = "checkout-card-expiry-input";
const cardExpiryInputEl = document.createElement("div");
cardExpiryInputEl.setAttribute("id", cardExpiryInputId);
cardExpiryInputEl.style.height = "24px";

const cardCvvInputId = "checkout-card-cvv-input";
const cardCvvInputEl = document.createElement("div");
cardCvvInputEl.setAttribute("id", cardCvvInputId);
cardCvvInputEl.style.height = "24px";

const cardHolderInputId = "checkout-card-holder-input";
const cardHolderInputEl = document.createElement("input");
cardCvvInputEl.style.height = "24px";
cardHolderInputEl.setAttribute("id", cardHolderInputId);
cardHolderInputEl.setAttribute("placeholder", "Cardholder Name");

const submitButton = document.createElement("input");
const buttonId = "submit-button";
submitButton.setAttribute("type", "button");
submitButton.setAttribute("id", buttonId);
submitButton.value = "Pay with Card";

// Add them to your container
container.append(
  cardNumberInputEl,
  cardExpiryInputEl,
  cardCvvInputEl,
  cardHolderInputEl,
  submitButton)

async function configureCardForm(headless, paymentMethod) {
  const style = {
    height: 'auto',
    border: '1px solid rgb(0 0 0 / 10%)',
    borderRadius: '2px',
    padding: '12px',
    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
  }

  // Create the payment method manager
  const cardManager = await headless.createPaymentMethodManager('PAYMENT_CARD')
  console.log("cardManager:", cardManager)

  // Create the hosted inputs
  const {
    cardNumberInput,
    expiryInput,
    cvvInput
   } = cardManager.createHostedInputs()

  await Promise.all([
    cardNumberInput.render(cardNumberInputId, {
      placeholder: '1234 1234 1234 1234',
      ariaLabel: 'Card number',
      style
    }),
    expiryInput.render(cardExpiryInputId, {
      placeholder: 'MM/YY',
      ariaLabel: 'Expiry date',
      style
    })
    ,
    cvvInput.render(cardCvvInputId, {
      placeholder: '123',
      ariaLabel: 'CVV',
      style
    }),
  ])

  // Set the cardholder name if it changes
  document.getElementById(cardHolderInputId).addEventListener('change', e => {
    cardManager.setCardholderName(e.target.value)
  })

  // Configure event listeners for supported events
  cardNumberInput.addEventListener('change', (...args) => {
    console.log('cardNumberInput changed', ...args)
  })

      // Configure event listeners for supported events
      cvvInput.addEventListener("change", (...args) => {
        console.log("cvv changed", ...args);
      });

  cardNumberInput.focus()

  submitButton.addEventListener('click', async () => {
    // Validate your card input data
    const { valid } = await cardManager.validate()
    if (valid) {
      // Submit the card input data to Primer for tokenization
      await cardManager.submit()
    }
  })
}

/////////////////////////////////////
////                             ////
/// PayPal, Apple Pay, Google Pay ///
////                             ////
/////////////////////////////////////

// Create the button container
const nativeButton = document.createElement("div");
const nativeButtonId = "native-button";
nativeButton.setAttribute("type", "button");
nativeButton.setAttribute("id", nativeButtonId);
document.getElementById("native-container").appendChild(nativeButton);

async function configureNativeButton(headless, paymentMethod) {
  // Create the payment method manager
  let method = paymentMethod.type;
  const paymentMethodManager = await headless.createPaymentMethodManager(
    method
  ); // or APPLE_PAY / GOOGLE_PAY;

  // Create and render the button
  const button = paymentMethodManager.createButton();
  button.render(nativeButtonId);
}

/////////////////////////////////////
////                             ////
////  Redirect Payment Methods   ////
////                             ////
/////////////////////////////////////

async function configureRedirectPaymentMethod(headless, paymentMethod) {
  // Create the payment method manager for redirect
  const redirectManager = await headless.createPaymentMethodManager(
    paymentMethod.type
  );

  // Create a new button. You don't need to create it within this function, you can create a redirect button however you want and apply any custom styling.
  const myButton = document.createElement("button");
  myButton.type = "button";
  myButton.id = "myRedirectButton"; // Set a unique id for the button
  myButton.innerText = paymentMethod.type; // Set the button label

  // Add an event listener to the button
  myButton.addEventListener("click", () => {
    redirectManager.start();
  });

  // Append the button to a container or directly to the body
  // For this example, I'm appending it directly to the body.
  // You can append it to a specific container if you have one.
  document.body.appendChild(myButton);
}

/////////////////////////////////////
////                             ////
////  Klarna Payment Method      ////
////                             ////
/////////////////////////////////////

async function configureKlarnaPaymentMethodManager(headless, paymentMethod){
  const paymentMethodManager = await headless.createPaymentMethodManager(
      type = "KLARNA",
      {
      onPaymentMethodCategoriesChange:(categories= KlarnaPaymentMethodCategory[pay_later]) =>{
          renderCustomComponent(categories)
      },
      },
  );
}