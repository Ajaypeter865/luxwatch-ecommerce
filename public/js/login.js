
// Frontend validation for the login form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
        const usernameInput = document.getElementById('name');
        const passwordInput = document.getElementById('password');
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Clear previous validation styles
        usernameInput.style.borderColor = '#e5e6e9';
        passwordInput.style.borderColor = '#e5e6e9';

        let errors = [];

        if (username === '') {
            errors.push('Username is required.');
            usernameInput.style.borderColor = 'red';
        }

        if (password === '') {
            errors.push('Password is required.');
            passwordInput.style.borderColor = 'red';
        }

        if (errors.length > 0) {
            // Prevent the form from submitting
            event.preventDefault();
            // You can optionally show an alert or update a message area
            // alert(errors.join('\n')); 
        }
    });
}
