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
    quantity.value = 1;
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
     // customerId: "albertoTest1",
      orderId: `${Math.random().toString(36).substring(7)}`,
      currencyCode: currency || "GBP",
      order: {
        lineItems: [
          {
            itemId: `item-${size.value}`,
            name: `${quantity.value} Lego${quantity.value > 1 ? "s" : ""
              } - ${size.value.toUpperCase()}`,
            description: `${quantity.value} ${size.value.toUpperCase()} Lego`,
            amount: 1234 * quantity.value,
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
        workflow: "3ds_braintree",
        v1: true
     // paypal_client_metadata_id: "6056a4e0dccf603087c289e9301cc1",
      //custom_id: "repay-6056a4e0dccf603087c289e9301cab",
       },
       paymentMethod: {
        // paymentType: "UNSCHEDULED",
         vaultOnSuccess: true,
         descriptor:"test"
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


  const renderCheckout = async (clientToken) => {

    const options ={
      container: '#checkout-container',
      paymentHandling: 'MANUAL',
      paypal: {
        paymentFlow: "PREFER_VAULT"
      },
      redirect: {
        returnUrl: 'http://localhost:8880/',
    },
    style: {
        /* Style options */
    },

    async onTokenizeSuccess(paymentMethodTokenData, handler) {
      // Send the Payment Method Token to your server
      // to create a payment using Payments API
      //const response = await createPayment(paymentMethodTokenData.token)

      const metadata = getOrderInfo().metadata
      const customerId = getOrderInfo().customerId
      const orderId = getOrderInfo().orderId
      const currencyCode = getOrderInfo().currencyCode
      const amount = getOrderInfo().order.lineItems[0].amount
      console.log("before create payment");

      const response = await fetch('/create-payment', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Legacy-workflows' : 'false'

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
      console.log(paymentMethodTokenData.token);
      console.log("On Tokenise Success Response:", response);
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
    async onResumePending(paymentMethodData) {
      console.log("On Resume Pending start",paymentMethodData);

      switch (paymentMethodData.paymentMethodType) {
        case PaymentMethodType.ADYEN_MULTIBANCO:
          // Use paymentMethodData within own UI
          // Share payment information with your customer
          console.log("On Resume Pending Multibanco");

          break;
        default:
        // show success screen
        console.log("On Resume Pending Default");

      }
    },

    async onResumeSuccess(resumeTokenData, handler) {
      // Send the resume token to your server to resume the payment
      //  const response = await resumePayment(resumeTokenData.resumeToken)
      const response = await fetch('/resume', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Legacy-workflows' : 'false'

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

        else {
          console.log("in ELSE", response);

        }

      // Display the success screen
      console.log("Success!");
      return handler.handleSuccess()
    }



  }
    const universalCheckout = await Primer.showUniversalCheckout(clientToken,options, {
 
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

    console.log("Is updated?", isUpdated) // true



    //   const handleFormValid = isValid => {
    //     checkout.setPaymentCreationEnabled(isValid)
    // }
  }
}