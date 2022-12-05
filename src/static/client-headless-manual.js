// import {greet,message} from "./headless.js";
// const greet_scaler = greet("Scaler");

// console.log(greet_scaler);
// console.log(message);


  // Render the Headless Checkout
export function renderCheckout async (clientToken) => {

    const { Primer } = window

    // Create an instance of the headless checkout
    const headless = await Primer.createHeadless(clientToken)

    // Configure headless
    await headless.configure({
      onAvailablePaymentMethodsLoad,
      onTokenizeSuccess,
      onResumeSuccess,
      // onCheckoutComplete,
      onCheckoutFail,
      paymentHandling: 'MANUAL'
    });

    async function onTokenizeSuccess(paymentMethodTokenData, handler) {
      // Send the Payment Method Token to your server
      // to create a payment using Payments API
      const metadata = getOrderInfo().metadata
      const customerId = getOrderInfo().customerId
      const orderId = getOrderInfo().orderId
      const currencyCode = getOrderInfo().currencyCode
      const amount = getOrderInfo().order.lineItems[0].amount

      // Because it's manual flow, we need to make a manual Create Payment Call
      const response = await fetch('/create-payment', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currencyCode,
          amount,
          metadata,
          customerId,
          orderId,
          'paymentMethodToken': paymentMethodTokenData.token,
        }),



      }).then(response => response.json())
      //console.log(paymentMethodTokenData.token);
      console.log("On Tokenise Success Response:", response);
      // Call `handler.handleFailure` to cancel the flow and display an error message
      if (!response) {
        return handler.handleFailure('The payment failed. Please try with another payment method.')
      }

      // If a new clientToken is available, call `handler.continueWithNewClientToken` to refresh the client session.
      // The checkout will automatically perform the action required by the Workflow.
      // This function is used for 3DS or other APM actions
      // console.log("RequiredAction:", requiredAction);
      if (response.requiredAction) {
        if (response.requiredAction.clientToken) {
          return handler.continueWithNewClientToken(response.requiredAction.clientToken)
        }
      }
      // Display the success screen
      return handler.handleSuccess()
    }

    async function onResumeSuccess(resumeTokenData, handler) {
      // Send the resume token to your server to resume the payment
      const response = await fetch('/resume', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'resumeToken': resumeTokenData.resumeToken })

      }).then(response => response.json())
      console.log("On Resume Response:", response);



      // Call `handler.handleFailure` to cancel the flow and display an error message
      if (!response) {
        return handler.handleFailure('The payment failed. Please try with another payment method.')
      }

      // If a new clientToken is available, call `handler.continueWithNewClientToken` to refresh the client session.
      // The checkout will automatically perform the action required by the Workflow
      if (response.requiredAction) {
        return handler.continueWithNewClientToken(response.requiredAction.clientToken)
      }

      // Display the success screen
      return handler.handleSuccess()
    }

    // Headless specific functions: This will list all the available payment method
    async function onAvailablePaymentMethodsLoad(paymentMethodTypes) {
      // Called when the available payment methods are retrieved
      console.log("Available Payment Methods:", paymentMethodTypes);

      // Iterate across payment methods
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
            cardExpiryInputEl.setAttribute("class", "card-input");

            const cardCvvInputId = 'checkout-card-cvv-input'
            const cardCvvInputEl = document.createElement('div')
            cardCvvInputEl.setAttribute('id', cardCvvInputId)
            cardCvvInputEl.setAttribute("class", "card-input");

            const cardHolderInputId = 'primer-checkout-card-cardholder-name-input'
            const cardHolderInputEl = document.createElement('input')
            cardHolderInputEl.setAttribute('id', cardHolderInputId)
            cardHolderInputEl.setAttribute('placeholder', 'Cardholder Name')
            cardHolderInputEl.setAttribute("type", "test");

            const submitButton = document.createElement('input')
            const buttonId = 'submit-button'
            submitButton.setAttribute('type', 'button')
            submitButton.setAttribute('id', buttonId)
            submitButton.setAttribute("class", "inputs");
            submitButton.value = 'Submit'

            // Add them to your container
            container.append(cardNumberInputEl, cardExpiryInputEl, cardCvvInputEl, cardHolderInputEl, submitButton)

            async function configureCardForm() {

              // Define style for inputs
              const style = {
                input: {
                  base: {
                    height: "21px",
                    boxShadow:
                      "inset -1px -1px #fff, inset 1px 1px grey, inset -2px -2px #dfdfdf, inset 2px 2px #0a0a0a;",
                    boxSizing: "border-box",
                    fontSize: "11px",
                    backgroundColor: "#fff",
                    padding: "3px 4px",
                    fontFamily: "Pixelated MS Sans Serif, Arial",
                  },
                },
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
                  style,
                }),
                expiryInput.render(cardExpiryInputId, {
                  placeholder: 'MM/YY',
                  ariaLabel: 'Expiry date',
                  style,
                }),
                cvvInput.render(cardCvvInputId, {
                  placeholder: '123',
                  ariaLabel: 'CVV',
                  style,
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
  }
    // This function is not available in Manual Flow.
    // function onCheckoutComplete({
    //   payment
    // }) {
    //   // Notifies you that a payment was created
    //   // Move on to next step in your checkout flow:
    //   // e.g. Show a success message, giving access to the service, fulfilling the order, ...
    //   console.log('onCheckoutComplete', payment)
    //   alert(`Payment complete! \n\n ${JSON.stringify(payment)}`);

    // }