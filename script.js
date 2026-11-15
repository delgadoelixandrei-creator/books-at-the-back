

/* =========================================
   EMAILJS CONFIGURATION
========================================= */

const EMAILJS_SERVICE_ID = "service_dwv7mrp";
const EMAILJS_TEMPLATE_ID = "template_sq11dsc";
const EMAILJS_PUBLIC_KEY = "Es_HpFnwFGP-uruZ2";

if (typeof emailjs !== "undefined") {
    emailjs.init({
        publicKey: EMAILJS_PUBLIC_KEY
    });
}

async function sendEmailNotification(userEmail, userName, eventType) {
    if (typeof emailjs === "undefined") {
        throw new Error("EmailJS library is not loaded.");
    }

    const templateParams = {
        user_email: userEmail,
        user_name: userName,
        event_type: eventType,
        event_time: new Date().toLocaleString()
    };

    return emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
    );
}


/* =========================================
   SHOPPING CART
========================================= */

let cartItems = [];

function loadCart() {
    try {
        const savedCart = JSON.parse(
            localStorage.getItem("cartItems")
        );

        cartItems = Array.isArray(savedCart) ? savedCart : [];

    } catch (error) {
        console.error("Error loading cart:", error);
        cartItems = [];
    }
}

function saveCart() {
    localStorage.setItem(
        "cartItems",
        JSON.stringify(cartItems)
    );

    updateOrderCount();
}

function getCartCount() {
    return cartItems.reduce((total, item) => {
        return total + Number(item.quantity || 0);
    }, 0);
}

function updateOrderCount() {
    loadCart();

    document.querySelectorAll("#orderCount").forEach(element => {
        element.textContent = getCartCount();
    });
}


/* =========================================
   ADD TO CART
========================================= */

function addToCart(button) {
    console.log("Add to Cart clicked:", button);

    if (!(button instanceof HTMLButtonElement)) {
        console.error("Invalid button:", button);
        return;
    }

    if (localStorage.getItem("isLoggedIn") !== "true") {
        alert("Please login first before adding books to your cart!");
        window.location.href = "login.html";
        return;
    }

    loadCart();

    const book = {
        title: button.dataset.title,
        author: button.dataset.author,
        price: Number(button.dataset.price),
        image: button.dataset.image,
        quantity: 1
    };

    if (
        !book.title ||
        !book.author ||
        !book.image ||
        !Number.isFinite(book.price) ||
        book.price <= 0
    ) {
        console.error("Incomplete book information:", button.dataset);
        alert("Book information is incomplete. Please check your HTML.");
        return;
    }

    const existingBook = cartItems.find(item => {
        return item.title === book.title;
    });

    if (existingBook) {
        existingBook.quantity =
            Number(existingBook.quantity || 0) + 1;
    } else {
        cartItems.push(book);
    }

    saveCart();

    alert("Book successfully added to cart!");
}


/* =========================================
   DISPLAY CART
========================================= */

function displayCart() {
    const cartContainer = document.getElementById("cartItems");
    const subtotalElement = document.getElementById("cartSubtotal");

    if (!cartContainer || !subtotalElement) {
        return;
    }

    loadCart();

    cartContainer.innerHTML = "";

    if (cartItems.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-cart-shopping fa-3x"></i>
                <h2>Your cart is empty</h2>
                <p>Browse our books and add your favorites!</p>
            </div>
        `;

        subtotalElement.textContent = "₱0.00";
        updateOrderCount();
        return;
    }

    let subtotal = 0;

    cartItems.forEach((item, index) => {
        const price = Number(item.price) || 0;
        const quantityValue = Number(item.quantity) || 1;
        const total = price * quantityValue;

        subtotal += total;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";

        const image = document.createElement("img");
        image.src = item.image;
        image.alt = item.title;

        const details = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = item.title;

        const author = document.createElement("p");
        author.textContent = item.author;

        details.append(title, author);

        const priceElement = document.createElement("div");
        priceElement.className = "cart-price";
        priceElement.textContent = "₱" + price.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const quantity = document.createElement("div");
        quantity.className = "quantity-control";

        const minus = document.createElement("button");
        minus.type = "button";
        minus.textContent = "−";
        minus.addEventListener("click", function() {
            changeQuantity(index, -1);
        });

        const number = document.createElement("span");
        number.textContent = quantityValue;

        const plus = document.createElement("button");
        plus.type = "button";
        plus.textContent = "+";
        plus.addEventListener("click", function() {
            changeQuantity(index, 1);
        });

        quantity.append(minus, number, plus);

        const actions = document.createElement("div");

        const itemTotal = document.createElement("p");
        itemTotal.className = "item-total";
        itemTotal.textContent = "₱" + total.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "remove-btn";
        remove.innerHTML = '<i class="fas fa-trash"></i>';

        remove.addEventListener("click", function() {
            removeItem(index);
        });

        actions.append(itemTotal, remove);

        cartItem.append(
            image,
            details,
            priceElement,
            quantity,
            actions
        );

        cartContainer.appendChild(cartItem);
    });

    subtotalElement.textContent = "₱" + subtotal.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    updateOrderCount();
}


/* =========================================
   CHANGE QUANTITY
========================================= */

function changeQuantity(index, amount) {
    loadCart();

    if (!cartItems[index]) {
        return;
    }

    cartItems[index].quantity =
        Number(cartItems[index].quantity || 1) + amount;

    if (cartItems[index].quantity <= 0) {
        cartItems.splice(index, 1);
    }

    saveCart();
    displayCart();
}


/* =========================================
   REMOVE BOOK
========================================= */

function removeItem(index) {
    loadCart();

    if (!cartItems[index]) {
        return;
    }

    cartItems.splice(index, 1);

    saveCart();
    displayCart();
}


/* =========================================
   CHECKOUT NAVIGATION
========================================= */

function checkout() {
    loadCart();

    if (cartItems.length === 0) {
        alert("Your shopping cart is empty!");
        return;
    }

    window.location.href = "checkout.html";
}


/* =========================================
   CHECKOUT PRICE FORMAT
========================================= */

function formatCheckoutPrice(price) {
    return Number(price).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP"
    });
}


/* =========================================
   DISPLAY CHECKOUT SUMMARY
========================================= */

function displayCheckout() {
    loadCart();

    const container = document.getElementById("checkoutItems");
    const totalElement = document.getElementById("checkoutTotal");
    const button = document.querySelector(".place-order-btn");

    if (!container || !totalElement || !button) {
        return;
    }

    let total = 0;

    if (cartItems.length === 0) {
        container.innerHTML = "<p>Your cart is empty.</p>";
        totalElement.textContent = formatCheckoutPrice(0);
        button.disabled = true;
        return;
    }

    button.disabled = false;

    container.innerHTML = cartItems.map(item => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        const subtotal = price * quantity;

        total += subtotal;

        return `
            <div class="summary-item">
                <span>${item.title} × ${quantity}</span>
                <strong>${formatCheckoutPrice(subtotal)}</strong>
            </div>
        `;
    }).join("");

    totalElement.textContent = formatCheckoutPrice(total);
}


/* =========================================
   PLACE ORDER
========================================= */

function placeOrder(event) {
    event.preventDefault();

    loadCart();

    if (cartItems.length === 0) {
        alert("Your shopping cart is empty!");
        return;
    }

    const fullname = document.getElementById("fullname");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const address = document.getElementById("address");
    const payment = document.getElementById("payment");

    if (!fullname || !email || !phone || !address || !payment) {
        alert("Please check your checkout form.");
        return;
    }

    if (
        !fullname.value.trim() ||
        !email.value.trim() ||
        !phone.value.trim() ||
        !address.value.trim() ||
        !payment.value
    ) {
        alert("Please complete all checkout information.");
        return;
    }

    const order = {
        orderId: "BATB-" + Date.now(),

        customer: {
            name: fullname.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            address: address.value.trim()
        },

        payment: payment.value,

        items: cartItems,

        total: cartItems.reduce((sum, item) => {
            return sum +
                (Number(item.price) || 0) *
                (Number(item.quantity) || 1);
        }, 0),

        status: "Pending",

        date: new Date().toLocaleString()
    };

    let orders = [];

    try {
        orders = JSON.parse(
            localStorage.getItem("ordersHistory")
        ) || [];

        if (!Array.isArray(orders)) {
            orders = [];
        }
    } catch (error) {
        console.error("Error loading order history:", error);
    }

    orders.push(order);

    localStorage.setItem(
        "ordersHistory",
        JSON.stringify(orders)
    );

    cartItems = [];
    localStorage.removeItem("cartItems");

    updateOrderCount();

    alert(
        "Order placed successfully!\n\n" +
        "Order ID: " + order.orderId
    );

    window.location.href = "index.html";
}


/* =========================================
   BOOK SEARCH
========================================= */

function searchBooks() {
    const searchInput = document.getElementById("searchInput");

    if (!searchInput) {
        return;
    }

    const searchValue = searchInput.value.toLowerCase().trim();
    const books = document.querySelectorAll(".book");

    books.forEach(book => {
        const title = book.querySelector("h3");
        const author = book.querySelector("p");

        const bookInformation =
            (title ? title.textContent : "") + " " +
            (author ? author.textContent : "");

        book.style.display =
            bookInformation.toLowerCase().includes(searchValue)
                ? ""
                : "none";
    });
}


/* =========================================
   LOGIN
========================================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        if (!emailInput || !passwordInput) {
            alert("Login form fields are missing.");
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            alert("Please enter your email and password!");
            return;
        }

        // SAVE LOGIN STATUS FIRST
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", email);

        const successMessage = document.getElementById("loginSuccess");

        if (successMessage) {
            successMessage.style.display = "flex";
        }

        // EMAILJS NOTIFICATION
        try {
            await sendEmailNotification(
                email,
                email.split("@")[0],
                "User Login"
            );
        } catch (error) {
            console.error("Login email error:", error);
        }

        // REDIRECT TO HOMEPAGE
        setTimeout(function() {
            window.location.replace("index.html");
        }, successMessage ? 2000 : 0);
    });
}


/* =========================================
   REGISTER ACCOUNT
========================================= */

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const firstNameInput = document.getElementById("firstName");
        const lastNameInput = document.getElementById("lastName");
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        const confirmPasswordInput = document.getElementById("confirmPassword");

        if (
            !firstNameInput ||
            !lastNameInput ||
            !emailInput ||
            !passwordInput ||
            !confirmPasswordInput
        ) {
            alert("Registration form fields are missing.");
            return;
        }

        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            alert("Please complete all required fields!");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            await sendEmailNotification(
                email,
                firstName + " " + lastName,
                "New Account Registration"
            );

            const successMessage =
                document.getElementById("successMessage");

            if (successMessage) {
                successMessage.style.display = "flex";

                setTimeout(function() {
                    window.location.href = "login.html";
                }, 2000);
            } else {
                alert("Registration successful!");
                window.location.href = "login.html";
            }

        } catch (error) {
            console.error("Registration email error:", error);

            alert(
                "Unable to send registration notification. " +
                "Please check your EmailJS settings."
            );
        }
    });
}


/* =========================================
   CHECK LOGIN STATUS
========================================= */

function updateLoginButton() {
    const loginLink = document.getElementById("loginLink");

    if (!loginLink) {
        return;
    }

    const isLoggedIn =
        localStorage.getItem("isLoggedIn") === "true";

    loginLink.style.display = isLoggedIn ? "none" : "";
}


/* =========================================
   PAGE LOAD AND BUTTON EVENTS
========================================= */

document.addEventListener("DOMContentLoaded", function() {

    // UPDATE LOGIN BUTTON
    updateLoginButton();

    // ADD TO CART BUTTON EVENTS
    document.querySelectorAll(".add-cart-btn").forEach(button => {
        button.addEventListener("click", function() {
            addToCart(button);
        });
    });

    // SEARCH BUTTON EVENT
    const searchButton = document.getElementById("searchButton");

    if (searchButton) {
        searchButton.addEventListener("click", searchBooks);
    }

    // ENTER KEY FOR SEARCH
    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                searchBooks();
            }
        });
    }

    // CHECKOUT PAGE INITIALIZATION
    const checkoutForm = document.getElementById("checkoutForm");

    if (checkoutForm) {
        displayCheckout();
        checkoutForm.addEventListener("submit", placeOrder);
    }

    // UPDATE CART INFORMATION
    updateOrderCount();
    displayCart();
});