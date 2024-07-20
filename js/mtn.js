document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('main-content');

    // Function to check the time and redirect if necessary
    function checkTimeAndRedirect() {
        const now = new Date();
        const hours = now.getHours();

        if (hours >= 0 && hours <= 23) {
            window.location.href = 'load-screen.html';
        } else {
            mainContent.style.opacity = 1;
            mainContent.style.transform = 'translateY(0)';
        }
    }

    // Check time when the page loads
    checkTimeAndRedirect();

    // Optionally, check time every minute
    setInterval(checkTimeAndRedirect, 60000);
});
