const xhr = new XMLHttpRequest();
xhr.open('GET', `http://localhost:8081/`);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send();

xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 300) {
        console.log('Server is running');
        if (window.location.pathname === '/pages/error.html') {
            window.location.href = '/pages/index.html';
        }
    } else {
        window.location.href = '/pages/error.html';
    }
}

xhr.onerror = function() {
    window.location.href = '/pages/error.html';
}