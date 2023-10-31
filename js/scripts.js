$(document).ready(function () {
    $(".navbar-toggler").on("click", function () {
        $(".hamburger-button").toggleClass("navbar-toggler-icon-active");
    });
});

// Function to hide the loading overlay after 1 second
window.onload = function() {
    setTimeout(function() {
        document.querySelector('.loading-overlay').style.display = 'none';
    }, 1000); // Hide after 1 second (1000 milliseconds)
};
