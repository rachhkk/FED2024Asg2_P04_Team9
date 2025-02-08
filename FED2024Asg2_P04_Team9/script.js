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