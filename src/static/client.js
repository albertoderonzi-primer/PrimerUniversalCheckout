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
      customerId: "alberto_test_1235",
      orderId: `${Math.random().toString(36).substring(7)}`,
      currencyCode: currency || "GBP",
      order: {
        lineItems: [
          {
            itemId: `item-${size.value}`,
            name: `${quantity.value} Lego${quantity.value > 1 ? "s" : ""
              } - ${size.value.toUpperCase()}`,
            description: `${quantity.value} ${size.value.toUpperCase()} Lego`,
            amount: 5100 * quantity.value,
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
        nationalDocumentId: "12345678",
      },
      metadata: {
       workflow: "klarna2",
     //  v1: true,
     //paypal_client_metadata_id: "6056a4e0dccf603087c289e9301cc1",
    // custom_id: "repay-6056a4e0dccf603087c289e9301cab",
    //primer_credit_card: "checkout"
          },
      paymentMethod: {
      //  paymentType: "ECOMMERCE",
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
    console.log("C - Client Session data:", clientSession);

    const { clientToken } = clientSession
    console.log("C - Client token:", clientToken);


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
    const options ={
      container: '#checkout-container',
       paypal: {
         paymentFlow: "PREFER_VAULT"
       },
      onCheckoutComplete({ payment }) {
        console.log('Checkout Complete!', payment)
      },
      googlePay: {
        captureBillingAddress: true,
      },

      onCheckoutFail(error, { payment }, handler) {
        console.log('Checkout Fail!', error, payment)
    },

    onClientSessionUpdate(clientSession)
    {
      console.log('Client session Update!', clientSession)
  }
    }

     const universalCheckout = await Primer.showUniversalCheckout(clientToken,options, {
     // const universalCheckout = await Primer.showVaultManager(clientToken, {


      // Specify the selector of the container element

      /**
       * When the checkout flow has been completed, you'll receive
       * the successful payment via `onCheckoutComplete`.
       * Implement this callback to redirect the user to an order confirmation page and fulfill the order.
       */
      // onCheckoutComplete({ payment }) {
      //   console.log('Checkout Complete!', payment)
      // },

    //   onCheckoutFail(error, { payment }, handler) {
    //     console.log('Checkout Fail!', error, payment)
    // },
      /**
       * Learn more about the other options at:
       * https://primer.io/docs
       * https://www.npmjs.com/package/@primer-io/checkout-web
       */
    }


    )



  }
}