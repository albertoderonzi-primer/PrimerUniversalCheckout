import renderCheckout from "./client-headless-manual.js"



window.addEventListener("load", onLoaded);

async function onLoaded() {


    // define UX element
    const submitFormButton = document.getElementById("submit-button");
    const autofillFormButton = document.getElementById("autofill-button");
    const quantity = document.getElementById("quantity");
    const size = document.getElementById("size");

    // define customer details
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

    // Default value to autofill the form
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

    // Once the Submit button is pressed, remove the custome details form and load the Primer checkout
    const clearCheckoutDiv = () => {
        document.querySelector("#shirt-purchase-form").remove();
        document
            .querySelector("#order-container")
            .setAttribute("id", "checkout-container");
    };

    // Retrieve the details from the form
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
                Test: "True",
            },
        };
    };






// Once the Submit button is clicked..
submitFormButton.addEventListener("click", async () => {
    const formValid = validateForm();
    if (formValid === false) {
        return;
    }
    // retrieve order information
    const orderInfo = getOrderInfo();

    // First API call: Client session
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

    // The Client Token returned by the client session will be used to load the SDK
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




// Validate form
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

