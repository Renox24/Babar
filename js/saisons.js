document.addEventListener('DOMContentLoaded', function() {
    const link = document.getElementById('new-tab-link');
    
    link.addEventListener('click', function(event) {
        event.preventDefault();
        window.open(this.href, '_blank');
    });
});
