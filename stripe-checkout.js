import STRIPE_KEYS from "./stripe-keys.js";

// console.log(STRIPE_KEYS);
const d = document,
    $apartado = d.getElementById("apartado"),
    $template = d.getElementById("apartado-template").content,
    $fragment = d.createDocumentFragment(),
    fetchOptions = {
        headers: {
            Authorization: `Bearer ${STRIPE_KEYS.secret}`,
        },
    };

let services, prices;

// FORMATEO
const moneyFormat = num => `$${num.slice(0, -2)}.${num.slice(-2)}`;


Promise.all([
    fetch("https://api.stripe.com/v1/products", fetchOptions),
    fetch("https://api.stripe.com/v1/prices", fetchOptions)
])
    .then((responses) => Promise.all(responses.map((res) => res.json())))
    .then(json => {
        // console.log(json)
        services = json[0].data
        prices = json[1].data
        // console.log(services, prices)

        // CADA ELEMENTO producto-precio
        prices.forEach(el => {
            let servicesData = services.filter((product) => product.id === el.product)
            // console.log(servicesData)

            $template.querySelector(".apartado").setAttribute("data-price", el.id);
            $template.querySelector("img").src = servicesData[0].images[0];
            $template.querySelector("img").alt = servicesData[0].name;
            $template.querySelector("figcaption").innerHTML = `
            ${servicesData[0].name}
            <br>
            ${moneyFormat(el.unit_amount_decimal)} ${el.currency}
            </br>
            `;

            let $clone = d.importNode($template, true);
            $fragment.appendChild($clone);
        });
        $apartado.appendChild($fragment);
    })
    .catch((err) => {
        console.log(err)
        let message = err.statusText || "Ocurrió un error al conectarse con la API de stripe"
        $apartado.innerHTML = `<p> Error ${err.status}: ${message} </p>`
    })


// PROGRAMACIÓN PAGO
d.addEventListener("click", (e) => {
    if (e.target.matches(".apartado *")) {
        let price = e.target.parentElement.getAttribute("data-price");
        // console.log(price)
        Stripe(STRIPE_KEYS.public).redirectToCheckout({
            lineItems: [{ price, quantity: 1 }],
            mode: "payment",
            successUrl: "https://fitlibenclinicafisioterapia.netlify.app/calendly.html",
            cancelUrl: "https://fitlibenclinicafisioterapia.netlify.app/",
        })
            .then((res) => {
            console.log(res)
            if (res.error) {
                $apartado.insertAdjacentHTML("afterend", res.error.message);
            }
        })
    }
})
// PROGRAMACIÓN PAGO



/*
fetch("https://api.stripe.com/v1/products", {
headers: {
    Authorization: `Bearer ${STRIPE_KEYS.secret}`,
},
}).then((res) => {
console.log(res);
return res.json()
})
.then(json => {
    console.log(json)
});


fetch("https://api.stripe.com/v1/prices", {
headers: {
    Authorization: `Bearer ${STRIPE_KEYS.secret}`,
},
}).then((res) => {
console.log(res);
return res.json()
})
.then(json => {
    console.log(json)
});
*/




