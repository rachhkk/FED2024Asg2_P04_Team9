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

// sell
// Show previews of selected images
function showPreviews() {
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('preview-container');

    // Clear previous previews
    previewContainer.innerHTML = '';

    const files = fileInput.files;

    // Iterate through all selected files and show previews
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = function (e) {
            // Create a new image element for each file preview
            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('preview-img'); // Add a class for styling
            previewContainer.appendChild(img); // Append to preview container
        };

        reader.readAsDataURL(file); // Read file data
    }
}

// Upload the selected images
function uploadImages() {
    const fileInput = document.getElementById('fileInput');
    const status = document.getElementById('status');
    const progressContainer = document.getElementById('upload-progress');
    const progressBar = document.getElementById('progress-bar');

    if (!fileInput.files.length) {
        status.innerText = "Please select at least one image!";
        return;
    }

    const formData = new FormData();
    const files = fileInput.files;

    // Add all selected files to FormData
    for (let i = 0; i < files.length; i++) {
        formData.append("images[]", files[i]);
    }

    // Show the progress bar
    progressContainer.style.display = 'block';

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:5000/upload", true);

    // Track the upload progress
    xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            progressBar.style.width = percentComplete + '%';
        }
    };

    // Handle the upload completion
    xhr.onload = function () {
        if (xhr.status === 200) {
            status.innerText = "Upload successful!";
            // Show the popup message
            showPopup();
        } else {
            status.innerText = "Upload failed: " + xhr.responseText;
        }
        // Hide the progress bar after upload is complete
        progressContainer.style.display = 'none';
    };

    // Handle error during the upload
    xhr.onerror = function () {
        status.innerText = "Error uploading file.";
        progressContainer.style.display = 'none'; // Hide progress bar on error
    };

    // Send the files to the server
    xhr.send(formData);
}

// Function to show the popup after upload
function showPopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'flex'; // Show the popup

    // Close the popup when the user clicks the close button
    const closeButton = document.getElementById('popup-close');
    closeButton.addEventListener('click', () => {
        popup.style.display = 'none'; // Hide the popup when clicked
    });

    // Optionally, hide the popup after a few seconds
    setTimeout(() => {
        popup.style.display = 'none'; // Hide the popup after 3 seconds
    }, 3000);
}
