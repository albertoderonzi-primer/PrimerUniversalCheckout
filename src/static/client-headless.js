window.addEventListener("load", onLoaded);

async function onLoaded() {


  const submitFormButton = document.getElementById("submit-button");
  const autofillFormButton = document.getElementById("autofill-button");
  const quantity = document.getElementById("quantity");
  const size = document.getElementById("size");

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
    quantity.value = 2;
    size.value = "l";
    customerDetails.firstName.value = "Alberto";
    customerDetails.lastName.value = "DeRonzi";
    customerDetails.emailAddress.value = "test@primer.io";
    customerDetails.mobileNumber.value = "+447532172666";
    billingAddress.addressLine1.value = "1 King Street";
    billingAddress.addressLine2.value = "2 Floor";
    billingAddress.city.value = "London";
    billingAddress.state.value = "GB";
    billingAddress.postalCode.value = "SE10";
    billingAddress.country.value = "GB";
  };

  autofillFormButton.addEventListener("click", autofillForm);

  const clearCheckoutDiv = () => {
    document.querySelector("#shirt-purchase-form").remove();
    document
      .querySelector("#order-container")
      .setAttribute("id", "checkout-container");
  };


  const getOrderInfo = (currency) => {
    return {
      customerId: "cust-1229",
      orderId: `${Math.random().toString(36).substring(7)}`,
      currencyCode: currency || "GBP",
      order: {
        lineItems: [
          {
            itemId: `item-${size.value}`,
            name: `${quantity.value} Lego${quantity.value > 1 ? "s" : ""
              } - ${size.value.toUpperCase()}`,
            description: `${quantity.value} ${size.value.toUpperCase()} Lego`,
            amount: 1000 * quantity.value,
            productType: "PHYSICAL",
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
          addressLine1: billingAddress.addressLine1.value,
          addressLine2: billingAddress.addressLine2.value,
          city: billingAddress.city.value,
          state: billingAddress.state.value,
          postalCode: billingAddress.postalCode.value,
          countryCode: billingAddress.country.value,
        },
      },
      metadata: {
        env: "headless",
        Test: "False",
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
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderInfo,
      }),
    }).then(data => data.json())
    console.log("Client Session data:", clientSession);

    const { clientToken } = clientSession
    console.log("Client token:", clientToken);


    if (!clientSession) {
      console.log("Error, no client session");
      return;
    } else {
      console.log("client session: ", clientSession);
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
        return false;
      }
    }
  };


  const renderCheckout = async (clientToken) => {

    const { Primer } = window

    // Create an instance of the headless checkout
    const headless = await Primer.createHeadless(clientToken)

  // Configure headless
  await headless.configure({
    onAvailablePaymentMethodsLoad,
    onCheckoutComplete,
    onCheckoutFail
  });

  async function onAvailablePaymentMethodsLoad(paymentMethodTypes) {
    // Called when the available payment methods are retrieved
    console.log("Available Payment Methods:", paymentMethodTypes);

    for (const paymentMethodType of paymentMethodTypes) {
      switch (paymentMethodType) {
        case 'PAYMENT_CARD': {
          //headless web UI config
          const container = document.getElementById("checkout-container")

          // Create containers for your hosted inputs
          const cardNumberInputId = 'checkout-card-number-input'
          const cardNumberInputEl = document.createElement('div')
          cardNumberInputEl.setAttribute('id', cardNumberInputId)
          cardNumberInputEl.setAttribute('class', 'card-input')


          const cardExpiryInputId = 'checkout-card-expiry-input'
          const cardExpiryInputEl = document.createElement('div')
          cardExpiryInputEl.setAttribute('id', cardExpiryInputId)
          cardExpiryInputEl.setAttribute("class", "card");

          const cardCvvInputId = 'checkout-card-cvv-input'
          const cardCvvInputEl = document.createElement('div')
          cardCvvInputEl.setAttribute('id', cardCvvInputId)
          cardCvvInputEl.setAttribute("class", "card");

          const cardHolderInputId = 'primer-checkout-card-cardholder-name-input'
          const cardHolderInputEl = document.createElement('input')
          cardHolderInputEl.setAttribute('id', cardHolderInputId)
          cardHolderInputEl.setAttribute('placeholder', 'Cardholder Name')
          cardHolderInputEl.setAttribute("type", "text");

          const submitButton = document.createElement('input')
          const buttonId = 'submit-button'
          submitButton.setAttribute('type', 'button')
          submitButton.setAttribute('id', buttonId)
          submitButton.setAttribute("class", "inputs");
          submitButton.value = 'Submit'

          // Add them to your container
          container.append(cardNumberInputEl, cardExpiryInputEl, cardCvvInputEl, cardHolderInputEl, submitButton)

          async function configureCardForm() {

            const baseStyles = {
              height: '30px',
              margin: '2px',
              // border: '1px solid rgb(0 0 0 / 10%)',
              //borderRadius: '2px',
              //padding: '12px',
              //boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
            }

            // Create the payment method manager
            const cardManager = await headless.createPaymentMethodManager('PAYMENT_CARD', {
              onCardMetadataChange({
                type
              }) {
                console.log('Card type: ', type)
              },
            })

            // Create the hosted inputs
            const cardNumberInput = cardManager.createHostedInput('cardNumber')
            const cvvInput = cardManager.createHostedInput('cvv')
            const expiryInput = cardManager.createHostedInput('expiryDate')


            await Promise.all([
              cardNumberInput.render(cardNumberInputId, {
                placeholder: '1234 1234 1234 1234',
                ariaLabel: 'Card number',
                //        styles: baseStyles,
              }),
              expiryInput.render(cardExpiryInputId, {
                placeholder: 'MM/YY',
                ariaLabel: 'Expiry date',
                styles: baseStyles,
              }),
              cvvInput.render(cardCvvInputId, {
                placeholder: '123',
                ariaLabel: 'CVV',
                styles: baseStyles,
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

            cardNumberInput.focus()

            submitButton.addEventListener('click', async () => {
              // Validate your card input data
              const result = await cardManager.validate()
              const { valid } = result;
              console.log('Is it Valid?', valid, result)

              if (valid) {
                console.log('All is valid')

                // Submit the card input data to Primer for tokenization
                await cardManager.submit()
              }
            })
          }

          await configureCardForm();

          break;
        }
        case "PAYPAL": {
          const container = document.getElementById("checkout-container");

          const paymentMethodManager =
            await headless.createPaymentMethodManager("PAYPAL"); // or APPLE_PAY / GOOGLE_PAY
          // Create your button container
          const payPalButton = document.createElement("div");
          const payPalButtonId = "paypal-button";
          payPalButton.setAttribute("type", "button");
          payPalButton.setAttribute("id", payPalButtonId);
          payPalButton.setAttribute("class", "apm-button");

          container.append(payPalButton);

          function configurePayPalButton() {
            // Create the payment method manager
            const button = paymentMethodManager.createButton();

            // Render the button

            button.render(payPalButtonId, {
              style: {
                buttonColor: "silver",
              },
            });
          }

          configurePayPalButton();
          break;
        }
        case "APPLE_PAY": {
          const container = document.getElementById("checkout-container");

          const paymentMethodManager =
            await headless.createPaymentMethodManager("APPLE_PAY"); // or APPLE_PAY / GOOGLE_PAY
          // Create your button container
          const applePayButton = document.createElement("div");
          const applePayButtonId = "apple-pay-button";
          applePayButton.setAttribute("type", "button");
          applePayButton.setAttribute("id", applePayButtonId);
          applePayButton.setAttribute("class", "apm-button");

          container.append(applePayButton);

          function configureApplePayButton() {
            // Create the payment method manager
            const button = paymentMethodManager.createButton();

            // Render the button

            button.render(applePayButton, {
              style: {
                buttonColor: "white",
              },
            });
          }

          configureApplePayButton();

          break;
        }
        case "GOOGLE_PAY": {
          const container = document.getElementById("checkout-container");

          const paymentMethodManager =
            await headless.createPaymentMethodManager("GOOGLE_PAY"); // or APPLE_PAY / GOOGLE_PAY
          // Create your button container
          const googlePayButton = document.createElement("div");
          const googlePayId = "google-pay-button";
          googlePayButton.setAttribute("type", "button");
          googlePayButton.setAttribute("id", googlePayId);
          googlePayButton.setAttribute("class", "apm-button");

          container.append(googlePayButton);

          function configureGooglePayButton() {
            // Create the payment method manager
            const button = paymentMethodManager.createButton();

            // Render the button

            button.render(googlePayId, {
              style: {
                buttonColor: "white",
              },
            });
          }

          configureGooglePayButton();

          break;
        }



      }
    }
  }

  function onCheckoutComplete({
    payment
  }) {
    // Notifies you that a payment was created
    // Move on to next step in your checkout flow:
    // e.g. Show a success message, giving access to the service, fulfilling the order, ...
    console.log('onCheckoutComplete', payment)

  }

  function onCheckoutFail(error, {
    payment
  }, handler) {
    // Notifies you that the checkout flow has failed and a payment could not be created
    // This callback can also be used to display an error state within your own UI.

    // ⚠️ `handler` is undefined if the SDK does not expect anything from you
    if (!handler) {
      return
    }

    // ⚠️ If `handler` exists, you MUST call one of the functions of the handler

    // Show a default error message
    return handler.showErrorMessage()
  }



  // Start the headless checkout
  await headless.start()

  console.log('Headless Universal Checkout is loaded!')

  }















//   const { Primer } = window

//   // Create an instance of the headless checkout
//   const headless = await Primer.createHeadless(clientToken)

//   // Configure headless
//   await headless.configure({
//     onAvailablePaymentMethodsLoad,
//     onCheckoutComplete,
//     onCheckoutFail
//   });



//   async function onAvailablePaymentMethodsLoad(paymentMethodTypes) {
//     // Called when the available payment methods are retrieved
//     console.log("Available Payment Methods:", paymentMethodTypes);

//     for (const paymentMethodType of paymentMethodTypes) {
//       switch (paymentMethodType) {
//         case 'PAYMENT_CARD': {
//           //headless web UI config
//           const container = document.getElementById('checkout-container')

//           // Create containers for your hosted inputs
//           const cardNumberInputId = 'checkout-card-number-input'
//           const cardNumberInputEl = document.createElement('div')
//           cardNumberInputEl.setAttribute('id', cardNumberInputId)
// //        cardNumberInputEl.setAttribute('placeholder', 'Card Number')


//           const cardExpiryInputId = 'checkout-card-expiry-input'
//           const cardExpiryInputEl = document.createElement('div')
//           cardExpiryInputEl.setAttribute('id', cardExpiryInputId)
// //        cardExpiryInputEl.setAttribute('placeholder', 'Expiry')

//           const cardCvvInputId = 'checkout-card-cvv-input'
//           const cardCvvInputEl = document.createElement('div')
//           cardCvvInputEl.setAttribute('id', cardCvvInputId)
// //          cardCvvInputEl.setAttribute('placeholder', 'CVV')

//           const cardHolderInputId = 'primer-checkout-card-cardholder-name-input'
//           const cardHolderInputEl = document.createElement('input')
//           cardHolderInputEl.setAttribute('id', cardHolderInputId)
//           cardHolderInputEl.setAttribute('placeholder', 'Cardholder Name')

//           const submitButton = document.createElement('input')
//           const buttonId = 'submit-button'
//           submitButton.setAttribute('type', 'button')
//           submitButton.setAttribute('id', buttonId)
//           submitButton.value = 'Submit'

//           // Add them to your container
//           container.append(cardNumberInputEl, cardExpiryInputEl, cardCvvInputEl, cardHolderInputEl, submitButton)

//           async function configureCardForm() {

//             const baseStyles = {
//               height: 'auto',
//               border: '1px solid rgb(0 0 0 / 10%)',
//               borderRadius: '2px',
//               padding: '12px',
//               boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
//             }

//             // Create the payment method manager
//             const cardManager = await headless.createPaymentMethodManager('PAYMENT_CARD', {
//               onCardMetadataChange({
//                 type
//               }) {
//                 console.log('Card type: ', type)
//               },
//             })

//             // Create the hosted inputs
//             const cardNumberInput = cardManager.createHostedInput('cardNumber')
//             const cvvInput = cardManager.createHostedInput('cvv')
//             const expiryInput = cardManager.createHostedInput('expiryDate')


//             await Promise.all([
//               cardNumberInput.render(cardNumberInputId, {
//                 placeholder: '1234 1234 1234 1234',
//                 ariaLabel: 'Card number',
//                 styles: baseStyles,
//               }),
//               expiryInput.render(cardExpiryInputId, {
//                 placeholder: 'MM/YY',
//                 ariaLabel: 'Expiry date',
//                 styles: baseStyles,
//               }),
//               cvvInput.render(cardCvvInputId, {
//                 placeholder: '123',
//                 ariaLabel: 'CVV',
//                 styles: baseStyles,
//               }),
//             ])

//             // Set the cardholder name if it changes
//             document.getElementById(cardHolderInputId).addEventListener('change', e => {
//               cardManager.setCardholderName(e.target.value)
//             })

//             // Configure event listeners for supported events
//             cardNumberInput.addEventListener('change', (...args) => {
//               console.log('cardNumberInput changed', ...args)
//             })

//             cardNumberInput.focus()

//             submitButton.addEventListener('click', async () => {
//               // Validate your card input data
//               const result = await cardManager.validate()
//               const { valid } = result;
//               console.log('Is it Valid?', valid, result)

//               if (valid) {
//                 console.log('All is valid')

//                 // Submit the card input data to Primer for tokenization
//                 await cardManager.submit()
//               }
//             })
//           }

//           await configureCardForm();


//         }
//         // More payment methods to follow
//       }
//     }
//   }

//   function onCheckoutComplete({
//     payment
//   }) {
//     // Notifies you that a payment was created
//     // Move on to next step in your checkout flow:
//     // e.g. Show a success message, giving access to the service, fulfilling the order, ...
//     console.log('onCheckoutComplete', payment)

//   }

//   function onCheckoutFail(error, {
//     payment
//   }, handler) {
//     // Notifies you that the checkout flow has failed and a payment could not be created
//     // This callback can also be used to display an error state within your own UI.

//     // ⚠️ `handler` is undefined if the SDK does not expect anything from you
//     if (!handler) {
//       return
//     }

//     // ⚠️ If `handler` exists, you MUST call one of the functions of the handler

//     // Show a default error message
//     return handler.showErrorMessage()
//   }



//   // Start the headless checkout
//   await headless.start()

//   console.log('Headless Universal Checkout is loaded!')


}
