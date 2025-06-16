import { loadPrimer } from '@primer-io/primer-js';

// Initialize Primer when the window loads
window.addEventListener('load', () => {
  loadPrimer();
});

window.addEventListener("load", async () => {
  // Initialize Primer
  await loadPrimer();

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
    amount.value = "10100";
    currency.value = "GBP";
    customerDetails.firstName.value = "Alberto";
    customerDetails.lastName.value = "De Ronzi";
    customerDetails.emailAddress.value = "alberto@primer.io";
    customerDetails.mobileNumber.value = "+4407538690994";
    billingAddress.addressLine1.value = "6 Blissett Street";
    billingAddress.addressLine2.value = " ";
    billingAddress.city.value = "London";
    billingAddress.state.value = "  ";
    billingAddress.postalCode.value = "SE10 8UP";
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
      customerId: "alberto_paypal",
      orderId: `${Math.random().toString(36).substring(7)}`,
      amount: parseInt(amount.value),
      currencyCode: currency.value,
      order: {
        shipping:
        {
        // amount: 0,
          methodName: "methodName_test",
          //    methodId: "methodId_test"
        },
        lineItems: [
          {
            //   itemId: `item-${size.value}`,
            itemId: "123",
            quantity: quantity.value,
            name: `Name is ${quantity.value} Lego${quantity.value > 1 ? "s" : ""} - ${size.value.toUpperCase()}`,
            description: `description is ${quantity.value} ${size.value.toUpperCase()} Lego`,
            amount: 5100,
            productType: "DIGITAL",
          },
          {
            itemId: `item-${size.value}`,
            name: `${quantity.value} Lego${quantity.value > 1 ? "P" : ""} - ${size.value.toUpperCase()}`,
            quantity: quantity.value,
            description: `${quantity.value} ${size.value.toUpperCase()} LegoP`,
            amount: 5000,
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
          firstName: customerDetails.firstName.value,
          lastName: customerDetails.lastName.value,
          postalCode: billingAddress.postalCode.value,
          addressLine1: billingAddress.addressLine1.value,
          countryCode: billingAddress.country.value,
          city: billingAddress.city.value,
          //   state: billingAddress.state.value,
          //   phone: customerDetails.mobileNumber.value,
        },
        shippingAddress: {
          firstName: customerDetails.firstName.value,
          lastName: customerDetails.lastName.value,
          postalCode: "se108up",
          //  postalCode: billingAddress.postalCode.value,
          addressLine1: billingAddress.addressLine1.value,
          //      addressLine2: billingAddress.addressLine2.value,
          countryCode: billingAddress.country.value,
          city: billingAddress.city.value,
          //   state: billingAddress.state.value,
          //   phone: customerDetails.mobileNumber.value,
        },
        nationalDocumentId: "53033315550",
      },
      metadata: {
     //   testmetadata:"testalberto",
        //adyen autocapture
        // additionalData: {
        //  manualCapture:true
       // adyenManualCapture: "true",
        // },
      //   additionalData:{
      //  //   RequestedTestAcquirerResponseCode:32
      //   },
        storePaymentMethod: true,
        allowupgrade: false,
        reachDeviceFingerprint: "cf0de41c-ff12-48b7-a29b-5a8027ee4f46",
        reachShipping: {
          ConsumerPrice: 0,
          ConsumerTaxes: 0,
          ConsumerDuty: 0,
          ConsigneeName: "John Doe",
          ConsigneeAddress: "5 random street",
          ConsigneeCity: "Pawnee",
          ConsigneeCountry: "US"
      },
      //klarna_flow:"old_flow",
      deviceInfo : {
        ipAddress : "1.2.3.4",
        userAgent : "UserAgent"
      },
        ipAddress: "123.123.123.123",
        //  force_3ds: true,
        // regionCountryCode: "GB",
       // ab_test: Math.floor(Math.random() * 10),
        ab_test:10,
        description: "Test Description",
        // sensor:"Stripe",
        // workflow: "unlimit",
        // workflow: "primer",
       //   workflow: "processor_3ds_stripe",
        fulfillment_date: "1698867000",
        //  workflow: "3ds3ds",
        // workflow:"continue",
//workflow:"adyen",
//workflow:"trust",


      //  workflow: "worldline_direct",
      //  workflow: "mercadopago",

         //   workflow: "cybersource",
        // workflow: "forcedecline",
       // workflow: "sift",
     //   workflow:"stripe",
    //  workflow:"reach",

        workflow:"checkout",
        //workflow: "forter-testing",
         // workflow: "3ds_braintree",
       // workflow:"adyen",
        //  workflow:"riskified",
       //  workflow:"dlocal",
        // workflow:"rapyd_processor3ds",
        // workflow: "test_fallback",
        //billing_descriptor_city:"testcity",
        // primer_credit_card:"checkout",


        // merchant_urls: {
        //   confirmation: "https://www.primer.com/confirmation.",
        //   authorization: "https://www.primer.com/auth."
        // },
        emd: {
          "content_type": "application/vnd.klarna.internal.emd-v2+json",
          "body": "{\"subscription\":[{\"subscription_name\":\"Contact_lenses\",\"start_time\":\"2020-11-24T15:00\",\"end_time\":\"2021-11-24T15:00\",\"auto_renewal_of_subscription\":false}],\"customer_account_info\":[{\"unique_account_identifier\":\"Adam_Adamsson\",\"account_registration_date\":\"2020-11-24T15:00\",\"account_last_modified\":\"2020-11-24T15:00\"}]}"
        },
        actionList: "DECISION_SKIP",
        fraud_check: false,
        fraud_context: {
          // deliveryMethod:"deliveryMethod_fraudcontext_test",
          device_details: {
            user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/112.0",
            //   device_id: "string",
            browser_ip: "3.251.44.50",
            cookie_token: "test_cookie",
            source: "WEB",
            customer_id: "demo"
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
       //  paymentType: "ECOMMERCE",
       // paymentType: "SUBSCRIPTION",
        paymentType: "FIRST_PAYMENT",
        vaultOnSuccess: true,
        //  vaultOn3DS: false,
        descriptor: "test",
        orderedAllowedCardNetworks: ["VISA", "MASTERCARD"],
        options: {
          KLARNA: {
            extraMerchantData: {
              "body": "{\"subscription\":[{\"subscription_name\":\"Contact_lenses\",\"start_time\":\"2020-11-24T15:00\",\"end_time\":\"2021-11-24T15:00\",\"auto_renewal_of_subscription\":false}],\"customer_account_info\":[{\"unique_account_identifier\":\"Adam_Adamsson\",\"account_registration_date\":\"2020-11-24T15:00\",\"account_last_modified\":\"2020-11-24T15:00\"}]}"
            }
          },
          PAYMENT_CARD: {
            captureVaultedCardCvv: true
          }
        }
      },
    };
  };

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
    return true;
  };

  async function renderCheckout(clientToken) {
    clearCheckoutDiv();
    const checkoutContainer = document.getElementById('checkout-container');
    
    // Create the checkout component
    const checkout = document.createElement('primer-checkout');
    checkout.setAttribute('client-token', clientToken);
    
    // Create the main component
    const main = document.createElement('primer-main');
    
    // Create the payment methods component
    const paymentMethods = document.createElement('primer-payment-methods');
    
    // Add components to the DOM
    main.appendChild(paymentMethods);
    checkout.appendChild(main);
    checkoutContainer.appendChild(checkout);
    
    // Add event listeners
    checkout.addEventListener('primer-checkout-initialized', (event) => {
      console.log('Checkout initialized:', event.detail);
    });
    
    checkout.addEventListener('primer-state-changed', (event) => {
      console.log('Checkout state changed:', event.detail);
    });
    
    checkout.addEventListener('primer-payment-methods-updated', (event) => {
      console.log('Payment methods updated:', event.detail);
    });
  }

  submitFormButton.addEventListener("click", async () => {
    const formValid = validateForm();
    if (formValid === false) {
      return;
    }

    const orderInfo = getOrderInfo();
    try {
      const response = await fetch('/client-session', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Legacy-workflows': 'false'
        },
        body: JSON.stringify(orderInfo)
      });

      const { clientToken } = await response.json();
      await renderCheckout(clientToken);
    } catch (error) {
      console.error('Error initializing checkout:', error);
    }
  });
});