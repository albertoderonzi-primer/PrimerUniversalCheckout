window.addEventListener("load", onLoaded);
async function onLoaded() {
  console.log('Universal Checkout is loaded!')

  const clientSession = await fetch('/client-session', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
  }).then(data => data.json())
  console.log("Client Session data:", clientSession );

  const { clientToken } = clientSession
  console.log( "Client token:",clientToken );


  const universalCheckout = await Primer.showUniversalCheckout(clientToken, {
    // Specify the selector of the container element
    container: '#checkout-container',

    /**
     * When the checkout flow has been completed, you'll receive
     * the successful payment via `onCheckoutComplete`.
     * Implement this callback to redirect the user to an order confirmation page and fulfill the order.
     */
    onCheckoutComplete({ payment }) {
      console.log('Checkout Complete!', payment)
    },

    /**
     * Learn more about the other options at:
     * https://primer.io/docs
     * https://www.npmjs.com/package/@primer-io/checkout-web
     */
  }


)



}
