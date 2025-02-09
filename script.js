
//---------------------------------------notifications---------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    const notification = document.getElementById("notification");
    let position = -notification.offsetWidth; // Start off-screen
    const speed = 1.7; // Pixels per frame

    function moveText() {
        position += speed;
        notification.style.left = position + "px";

        // Reset when text moves out of screen
        if (position > window.innerWidth) {
            position = -notification.offsetWidth;
        }

        requestAnimationFrame(moveText);
    }

    moveText(); // Start animation
});

//---------------------------------------cart---------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const cartItemsList = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout");

    // Get the cart from localStorage or initialize as an empty array
    function getCart() {
        return JSON.parse(localStorage.getItem("cart")) || [];
    }

    // Save the cart into localStorage
    function saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // Update the cart UI
    function updateCartUI() {
        const cart = getCart();
        if (cartItemsList) cartItemsList.innerHTML = "";
        let total = 0;

        cart.forEach((item, index) => {
            let li = document.createElement("li");
            li.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <span class="product-name">${item.name}</span>
                <span class="product-price">$${item.price}</span>
                <button class="remove-item" data-index="${index}">❌</button>
            `;
            if (cartItemsList) cartItemsList.appendChild(li);
            total += parseFloat(item.price);
        });

        if (cartTotal) cartTotal.textContent = total.toFixed(2);
    }

    // Add item to the cart
    function addToCart(name, price, image) {
        let cart = getCart();
        cart.push({ name, price, image });
        saveCart(cart);
        updateCartUI();
    }

    // Remove item from the cart
    function removeFromCart(index) {
        let cart = getCart();
        cart.splice(index, 1);
        saveCart(cart);
        updateCartUI();
    }

    // Handle adding products to the cart
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", () => {
            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price);
            const image = button.dataset.image;

            addToCart(name, price, image);
            alert("Item added to cart!");
        });
    });

    // Handle removing products from the cart
    if (cartItemsList) {
        cartItemsList.addEventListener("click", (event) => {
            if (event.target.classList.contains("remove-item")) {
                const index = event.target.dataset.index;
                removeFromCart(index);
            }
        });
    }

    // Handle checkout
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            alert("Proceeding to checkout...");
            localStorage.removeItem("cart");
            updateCartUI();
        });
    }

    // Initial call to populate the cart UI on page load
    updateCartUI();
});
