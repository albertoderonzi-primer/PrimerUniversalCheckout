window.addEventListener("load", onLoaded);

async function onLoaded() {


  const clientSession = await fetch('/client-session', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
  }).then(data => data.json())
  console.log("Client Session data:", clientSession);

  const {
    clientToken
  } = clientSession
  console.log("Client token:", clientToken);

  const {
    Primer
  } = window

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
          const container = document.getElementById('checkout-container')

          // Create containers for your hosted inputs
          const cardNumberInputId = 'checkout-card-number-input'
          const cardNumberInputEl = document.createElement('div')
          cardNumberInputEl.setAttribute('id', cardNumberInputId)
//        cardNumberInputEl.setAttribute('placeholder', 'Card Number')


          const cardExpiryInputId = 'checkout-card-expiry-input'
          const cardExpiryInputEl = document.createElement('div')
          cardExpiryInputEl.setAttribute('id', cardExpiryInputId)
//        cardExpiryInputEl.setAttribute('placeholder', 'Expiry')

          const cardCvvInputId = 'checkout-card-cvv-input'
          const cardCvvInputEl = document.createElement('div')
          cardCvvInputEl.setAttribute('id', cardCvvInputId)
//          cardCvvInputEl.setAttribute('placeholder', 'CVV')

          const cardHolderInputId = 'primer-checkout-card-cardholder-name-input'
          const cardHolderInputEl = document.createElement('input')
          cardHolderInputEl.setAttribute('id', cardHolderInputId)
          cardHolderInputEl.setAttribute('placeholder', 'Cardholder Name')

          const submitButton = document.createElement('input')
          const buttonId = 'submit-button'
          submitButton.setAttribute('type', 'button')
          submitButton.setAttribute('id', buttonId)
          submitButton.value = 'Submit'

          // Add them to your container
          container.append(cardNumberInputEl, cardExpiryInputEl, cardCvvInputEl, cardHolderInputEl, submitButton)

          async function configureCardForm() {

            const baseStyles = {
              height: 'auto',
              border: '1px solid rgb(0 0 0 / 10%)',
              borderRadius: '2px',
              padding: '12px',
              boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
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
                styles: baseStyles,
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


        }
        // More payment methods to follow
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
