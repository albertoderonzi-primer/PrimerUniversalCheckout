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
            amount: 10000 * quantity.value,
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
        'Content-Type': 'application/json',
        'Legacy-workflows' : 'false'
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




  // const clientSession = await fetch('/client-session', {
  //   method: 'post',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  // }).then(data => data.json())
  // console.log("Client Session data:", clientSession);

  //  const { clientToken } = clientSession
  //  console.log("Client token:", clientToken);


  const renderCheckout = async (clientToken) => {

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

      const response = await fetch('/create-payment', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Legacy-workflows' : 'false'

        },
        //body: JSON.stringify({ 'customerId': "cust-1229", 'paymentMethodToken': paymentMethodTokenData.token, "paymentMethod": { "vaultOnSuccess": true }, "metadata": { "type": "add-card", "processor": "primer" } })
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
      //  const response = await resumePayment(resumeTokenData.resumeToken)
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
        console.log("in required Action", response.requiredAction.clientToken);

        return handler.continueWithNewClientToken(response.requiredAction.clientToken)
      }

      // Display the success screen
      return handler.handleSuccess()
    }

    async function onAvailablePaymentMethodsLoad(paymentMethodTypes) {
      // Called when the available payment methods are retrieved
      console.log("Available Payment Methods:", paymentMethodTypes);

      for (const paymentMethodType of paymentMethodTypes.type) {
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

              // const { cardNumberInput, expiryInput, cvvInput } =
              //   cardManager.createHostedInputs();

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

    // function onCheckoutComplete({
    //   payment
    // }) {
    //   // Notifies you that a payment was created
    //   // Move on to next step in your checkout flow:
    //   // e.g. Show a success message, giving access to the service, fulfilling the order, ...
    //   console.log('onCheckoutComplete', payment)
    //   alert(`Payment complete! \n\n ${JSON.stringify(payment)}`);

    // }

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

    console.log('Headless Universal Checkout (Manual Flow) is loaded!')
  }
}