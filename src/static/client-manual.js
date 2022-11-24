window.addEventListener("load", onLoaded);

async function onLoaded() {
  console.log('Universal Checkout (Manual Flow) is loaded!')

  const clientSession = await fetch('/client-session', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
  }).then(data => data.json())
  console.log("Client Session data:", clientSession );

  const { clientToken } = clientSession
  console.log( "Client token:",clientToken );

  const universalCheckout = await Primer.showUniversalCheckout(clientToken, {
    // Specify the selector of the container element
    container: '#checkout-container',
    paymentHandling: 'MANUAL',


    async onTokenizeSuccess(paymentMethodTokenData, handler) {
      // Send the Payment Method Token to your server
      // to create a payment using Payments API
      //const response = await createPayment(paymentMethodTokenData.token)
      const response = await fetch('/create-payment', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'},
             body: JSON.stringify({ 'customerId': "cust-1229", 'paymentMethodToken' : paymentMethodTokenData.token, "paymentMethod":{ "vaultOnSuccess": true}, "metadata":{"type":"add-card","processor":"primer"}})

      }).then(response=>response.json())
      //console.log(paymentMethodTokenData.token);
      console.log("On Tokenise Success Response:",response);
      // Call `handler.handleFailure` to cancel the flow and display an error message
      if (!response) {
        return handler.handleFailure('The payment failed. Please try with another payment method.')
      }

      // If a new clientToken is available, call `handler.continueWithNewClientToken` to refresh the client session.
      // The checkout will automatically perform the action required by the Workflow.
      if (response.requiredAction) {
        return handler.continueWithNewClientToken(response.requiredAction.clientToken)
      }

      // Display the success screen
      return handler.handleSuccess()
    },

    async onResumeSuccess(resumeTokenData,handler) {
      // Send the resume token to your server to resume the payment
    //  const response = await resumePayment(resumeTokenData.resumeToken)
      const response = await fetch('/resume', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'},
         body: JSON.stringify({ 'resumeToken' : resumeTokenData.resumeToken})

      }).then(response=>response.json())
      console.log("On Resume Response:",response);



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
      console.log("Success!");
      return handler.handleSuccess()
    },




    /**
     * Learn more about the other options at:
     * https://primer.io/docs
     * https://www.npmjs.com/package/@primer-io/checkout-web
     */
  })


  // const response2 = await fetch('/patch-session', {
  //   method: 'PATCH',
  //   headers: {
  //     'Content-Type': 'application/json'},
  //    body: JSON.stringify({ clientToken: clientToken, amount: 14321})
  //
  // })
  // console.log(response2);
  //   console.log(clientToken);
 const isUpdated = await universalCheckout.setClientToken(clientToken);

 console.log("Is updated?",isUpdated) // true



  //   const handleFormValid = isValid => {
  //     checkout.setPaymentCreationEnabled(isValid)
  // }
}
