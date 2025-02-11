document.addEventListener("DOMContentLoaded", function () {
    const notification = document.getElementById("notification");
    let position = -notification.offsetWidth; // Start off-screen
    const speed = 2; // Pixels per frame

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

///////////////////////////////////////////////////////////////////////
//sales//
document.addEventListener("DOMContentLoaded", function () {
    const cartCount = document.getElementById("cart-count");
    const buttons = document.querySelectorAll(".add-to-cart");

    // Load cart count from localStorage
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0); // Display total quantity
    }

    // Event listener for Add to Cart buttons
    buttons.forEach(button => {
        button.addEventListener("click", function () {
            const name = this.getAttribute("data-name");
            const price = parseFloat(this.getAttribute("data-price"));

            let cart = JSON.parse(localStorage.getItem("cart")) || [];

            // Check if the item already exists in the cart
            let existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                // Increase quantity if item already exists
                existingItem.quantity += 1;
            } else {
                // Add new item to cart if not already present
                cart.push({ name, price, quantity: 1 });
            }

            // Save the updated cart to localStorage
            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartCount(); // Update cart count after adding item
        });
    });

    updateCartCount(); // Update count on page load
});
//cart/////////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
    const cartItemsDiv = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const clearCartBtn = document.getElementById("clear-cart");
    const checkoutBtn = document.getElementById("checkout-btn");

    // Load cart from localStorage and display it
    function loadCart() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        cartItemsDiv.innerHTML = ""; // Clear existing cart items
        let total = 0;

        cart.forEach((item, index) => {
            // Create cart item display
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("cart-item");
            itemDiv.innerHTML = `
                <input type="checkbox" class="select-item" data-index="${index}" checked />
                <span>${item.name} - $${item.price} x ${item.quantity}</span>
                <button class="remove-item" data-index="${index}">Remove</button>
            `;
            cartItemsDiv.appendChild(itemDiv);
            total += item.price * item.quantity; // Add item total to overall total
        });

        cartTotal.textContent = total.toFixed(2); // Display total price
    }

    // Event listener to remove items from the cart
    cartItemsDiv.addEventListener("click", function (e) {
        if (e.target.classList.contains("remove-item")) {
            const index = e.target.getAttribute("data-index");
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            cart.splice(index, 1); // Remove item at specified index
            localStorage.setItem("cart", JSON.stringify(cart));
            loadCart(); // Reload cart after removal
        }
    });

    // Event listener to clear the cart
    clearCartBtn.addEventListener("click", function () {
        localStorage.removeItem("cart"); // Remove cart from localStorage
        loadCart(); // Reload cart after clearing
    });

    // Event listener for checkbox selection
    cartItemsDiv.addEventListener("change", function (e) {
        if (e.target.classList.contains("select-item")) {
            const index = e.target.getAttribute("data-index");
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            cart[index].selected = e.target.checked; // Update selected state
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    });

    loadCart(); // Load and display cart items when the page loads
});




///
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/profileDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// User Schema
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
    joinCommunity: Boolean,
    orders: Array,
    listings: Array
});

const User = mongoose.model('User', userSchema);

// Register Endpoint
app.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, joinCommunity } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        const user = new User({ firstName, lastName, email, password: hashedPassword, joinCommunity, orders: [], listings: [] });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Email already exists' });
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
    res.json({ token, message: 'Login successful' });
});

// Profile Endpoint
app.get('/profile', async (req, res) => {
    const token = req.headers.authorization;
    try {
        const decoded = jwt.verify(token, 'secret_key');
        const user = await User.findById(decoded.userId);
        res.json({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            orders: user.orders,
            listings: user.listings
        });
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));

// SELL //////////////////////////////////////////////////////////////////////////////////////////
// Function to show preview of selected images
function showPreview() {
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');

    previewContainer.innerHTML = ""; // Clear previous previews

    for (let file of fileInput.files) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const previewItem = document.createElement("div");
            previewItem.classList.add("preview-item");

            const img = document.createElement("img");
            img.src = e.target.result;
            img.alt = "Preview";

            const fileName = document.createElement("span");
            fileName.textContent = file.name;

            previewItem.appendChild(img);
            previewItem.appendChild(fileName);
            previewContainer.appendChild(previewItem);
        };

        reader.readAsDataURL(file);
    }
}

// Function to show loading bar and popup
function uploadImages() {
    const caption = document.getElementById('caption').value;
    const price = document.getElementById('price').value;
    const loadingBar = document.getElementById('loadingBar');
    const loadingContainer = document.querySelector('.loading-bar-container');
    const popup = document.getElementById('popup');

    if (!caption || !price) {
        alert("Please enter a description and price!");
        return;
    }

    // Reset and show loading bar
    loadingBar.style.width = "0%";
    loadingContainer.style.display = "block";
    let progress = 0;

    const interval = setInterval(() => {
        if (progress >= 100) {
            clearInterval(interval);
            loadingBar.style.width = "100%";

            // Simulate a slight delay
            setTimeout(() => {
                loadingContainer.style.display = "none";
                
                // Show the popup message
                popup.style.display = "block"; 
            }, 500);
        } else {
            progress += 10;
            loadingBar.style.width = progress + "%";
        }
    }, 200);
}

// Function to close the popup
function closePopup() {
    document.getElementById('popup').style.display = "none";
}

// PROFILE /////////////////////////////////////////////////////////////////
// Simulating a database using localStorage
let users = JSON.parse(localStorage.getItem("users")) || [];

// Function to register a new user
function registerUser() {
    let email = document.getElementById("register-email").value.trim();
    let password = document.getElementById("register-password").value.trim();

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    // Check if user already exists
    let existingUser = users.find(user => user.email === email);
    if (existingUser) {
        alert("Account already exists! Please login.");
        return;
    }

    // Save new user
    users.push({ email, password });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Registration successful! You can now log in.");
    showLogin();
}

// Function to log in a user
function loginUser() {
    let email = document.getElementById("login-email").value.trim();
    let password = document.getElementById("login-password").value.trim();

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    // Check if user exists and password is correct
    let foundUser = users.find(user => user.email === email && user.password === password);
    if (!foundUser) {
        alert("Invalid email or password. Please try again.");
        return;
    }

    // Store logged-in user session
    localStorage.setItem("loggedInUser", email);

    // Display user dashboard
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("user-dashboard").style.display = "block";
    document.getElementById("user-email").innerText = email;
}

// Function to show the registration form
function showRegister() {
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("register-container").style.display = "block";
}

// Function to go back to login form
function showLogin() {
    document.getElementById("register-container").style.display = "none";
    document.getElementById("auth-container").style.display = "block";
}

// Function to log out
function logout() {
    localStorage.removeItem("loggedInUser");
    document.getElementById("auth-container").style.display = "block";
    document.getElementById("user-dashboard").style.display = "none";
}

// Check if a user is already logged in
window.onload = function () {
    let loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("user-dashboard").style.display = "block";
        document.getElementById("user-email").innerText = loggedInUser;
    }
};
