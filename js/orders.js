const loggedIn = localStorage.getItem('loggedIn') === 'true';

function showOrders(account) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `http://localhost:8081/api/orders/get`);
    xhr.setRequestHeader('Content-Type', 'application/json');

    let requestData = {
        "Account": account
    }

    xhr.send(JSON.stringify(requestData));

    xhr.onload = function() {
        if (xhr.status === 200) {
            const orders = JSON.parse(xhr.responseText);
            let ordersList = document.querySelector('.order-list');

            Object.values(orders).forEach(order => {
                let orderItem = document.createElement('div');
                orderItem.classList.add('order-item');

                let orderItemTitle = document.createElement('h3');
                orderItemTitle.classList.add('order-item-title');
                orderItemTitle.textContent = order.Name;

                let orderItemPrice = document.createElement('p');
                orderItemPrice.classList.add('order-item-price');
                orderItemPrice.textContent = order.Price;

                let orderItemDate = document.createElement('p');
                orderItemDate.classList.add('order-item-date');
                orderItemDate.textContent = order.Date;

                orderItem.appendChild(orderItemTitle);
                orderItem.appendChild(orderItemPrice);
                orderItem.appendChild(orderItemDate);

                ordersList.appendChild(orderItem);
            });
        }
    }
}

if (storedAccount && loggedIn) {
    let relogin = document.querySelector('.relogin-form');
    let orders = document.querySelector('.order-items');

    showOrders(storedAccount);

    document.querySelector('.relogin-btn').addEventListener('click', function(e) {
        e.preventDefault();

        let email = document.querySelector('[name="Email"]').value;
        let password = document.querySelector('[name="Password"]').value;

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:8081/api/accounts/login');
        xhr.setRequestHeader('Content-Type', 'application/json');

        let requestData = {
            "Email": email,
            "Password": password
        }

        xhr.send(JSON.stringify(requestData));

        xhr.onload = function() {
            if (xhr.status === 200) {
                let account = JSON.parse(xhr.responseText);
                localStorage.setItem('account', JSON.stringify(account));
                localStorage.setItem('loggedIn', 'true');

                relogin.style.display = 'none';
                orders.style.display = 'block';

                showOrders(account);
            } else {
                alert('Invalid email or password');
            }
        }
    });
}