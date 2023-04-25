const loggedIn = localStorage.getItem('loggedIn') === 'true';

function showOrder(account) {
    const cart = storedAccount.Cart;
    const order = document.querySelector('.order');
    const orderList = document.querySelector('.order-list');
    const orderTotalPrice = document.querySelector('.order-footer-total-price');

    let totalPrice = 0;

    for (let productCart of cart) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://localhost:8081/api/products/' + productCart.ID);
        xhr.send();

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                let product = JSON.parse(xhr.response);

                Object.keys(productCart.Sizes).forEach(function(size, index) {
                    let productItem = document.createElement('div');
                    productItem.classList.add('order-item');

                    let productItemImg = document.createElement('img');
                    productItemImg.classList.add('order-item-img', 'col-3');
                    productItemImg.src = `/img/${product.Image}`;
                    productItemImg.alt = product.Name;
                    
                    let productItemInfo = document.createElement('div');
                    productItemInfo.classList.add('order-item-info', 'col-8');

                    let productItemHeader = document.createElement('div');
                    productItemHeader.classList.add('order-item-header');

                    let productItemHeaderName = document.createElement('h2');
                    productItemHeaderName.classList.add('order-item-info-name');
                    productItemHeaderName.innerHTML = product.Name;

                    let productItemHeaderPrice = document.createElement('h3');
                    productItemHeaderPrice.classList.add('order-item-info-price');
                    productItemHeaderPrice.innerHTML = '€' + (product.Price / 100).toFixed(2);

                    let productItemInfoSizeQuantity = document.createElement('div');
                    productItemInfoSizeQuantity.classList.add('order-item-info-size-quantity');

                    let productItemInfoSize = document.createElement('h3');
                    productItemInfoSize.classList.add('order-item-info-size');
                    productItemInfoSize.innerHTML = '<span class="text-muted">Size: </span> ' + size;

                    let productItemInfoQuantity = document.createElement('h3');
                    productItemInfoQuantity.classList.add('order-item-info-quantity');
                    productItemInfoQuantity.innerHTML = '<span class="text-muted">Quantity: </span> ' + productCart.Sizes[size]['Quantity'];

                    let productItemInfoDescription = document.createElement('p');
                    productItemInfoDescription.classList.add('order-item-info-description');
                    productItemInfoDescription.innerHTML = product.Description;

                    let productItemSeperator = document.createElement('hr');
                    productItemSeperator.classList.add('order-item-seperator');

                    productItemHeader.appendChild(productItemHeaderName);
                    productItemHeader.appendChild(productItemHeaderPrice);

                    productItemInfoSizeQuantity.appendChild(productItemInfoSize);
                    productItemInfoSizeQuantity.appendChild(productItemInfoQuantity);

                    productItemInfo.appendChild(productItemHeader);
                    productItemInfo.appendChild(productItemInfoSizeQuantity);
                    productItemInfo.appendChild(productItemInfoDescription);

                    productItem.appendChild(productItemImg);
                    productItem.appendChild(productItemInfo);

                    orderList.appendChild(productItem);

                    if (index < Object.keys(productCart.Sizes).length - 1) {
                        orderList.appendChild(productItemSeperator);
                    }

                    totalPrice += product.Price * productCart.Sizes[size]['Quantity'];
                });

                orderTotalPrice.innerHTML = '€' + (totalPrice / 100).toFixed(2);

                order.style.display = 'block';

                let orderBtn = document.querySelector('.order-btn');

                orderBtn.addEventListener('click', function(e) {
                    e.preventDefault();

                    document.querySelector('.shipment input[name="FirstName"]').value = account.Forname;
                    document.querySelector('.shipment input[name="LastName"]').value = account.Surname;
                    document.querySelector('.shipment input[name="Email"]').value = account.Email;
                    document.querySelector('.shipment input[name="Phone"]').value = account.Phone;
                    
                    document.querySelector('.checkout-step[step="2"]').classList.add('checkout-step-active');

                    document.querySelector('[step-content="1"]').style.display = 'none';
                    document.querySelector('[step-content="2"]').style.display = 'flex';

                    document.querySelector('.shipment-btn').addEventListener('click', function(e) {
                        let shipmentInputs = document.querySelectorAll('.shipment input');
                        let shipmentValid = true;
                        let shipmentValidInputs = [];

                        for (let shipmentInput of shipmentInputs) {
                            if (shipmentInput.value === '') {
                                shipmentValid = false;
                                shipmentValidInputs.push(shipmentInput);
                            }
                        }

                        if (shipmentValid) {
                            let shipmentDetails = {}
                            shipmentInputs.forEach(function(shipmentInput) {
                                shipmentDetails[shipmentInput.name] = shipmentInput.value;
                            });

                            let totalPrice = 0;
                            let promises = [];

                            for (let productCart of cart) {
                                promises.push(new Promise(function(resolve, reject) {
                                    const xhr = new XMLHttpRequest();
                                    xhr.open('GET', 'http://localhost:8081/api/products/' + productCart.ID);
                                    xhr.send();

                                    xhr.onload = function() {
                                        if (xhr.status >= 200 && xhr.status < 300) {
                                            let product = JSON.parse(xhr.response);

                                            Object.keys(productCart.Sizes).forEach(function(size, index) {
                                                totalPrice += product.Price * productCart.Sizes[size]['Quantity'];
                                            });

                                            resolve();
                                        }
                                    }
                                }));
                            }

                            Promise.all(promises).then(function() {
                                console.log(totalPrice);

                                document.querySelector('.checkout-step[step="3"]').classList.add('checkout-step-active');

                                document.querySelector('[step-content="2"]').style.display = 'none';
                                document.querySelector('[step-content="3"]').style.display = 'flex';

                                document.querySelectorAll('.payment-methods a').forEach(function(paymentMethod) {
                                    paymentMethod.addEventListener('click', function(e) {
                                        e.preventDefault();
                                        
                                        // The payment itself is not implemented, so the user is redirected to the order confirmation page

                                        const xhr = new XMLHttpRequest();
                                        xhr.open('POST', 'http://localhost:8081/api/orders/add');
                                        xhr.setRequestHeader('Content-Type', 'application/json');
                                        xhr.send(JSON.stringify({
                                            "Account": account,
                                            "Order": {
                                                "Products": account.Cart
                                            },
                                            "Shipment": shipmentDetails,
                                            "Price": totalPrice,
                                            "Payment": {
                                                "Method": paymentMethod.getAttribute('method')
                                            },
                                        }));

                                        xhr.onload = function() {
                                            if (xhr.status >= 200 && xhr.status < 300) {
                                                delete account.Cart;

                                                localStorage.setItem('account', JSON.stringify(account));
                                                window.location.href = '/pages/orders.html';
                                            }
                                        }
                                    });
                                });
                            });
                        } else {
                            for (let shipmentValidInput of shipmentValidInputs) {
                                shipmentValidInput.classList.add('is-invalid');
                            }

                            document.querySelector('.shipment-btn').innerHTML = 'Please fill in all fields';
                        }
                    });
                });
            }
        }
    }
}

if (storedAccount && loggedIn) {
    let relogin = document.querySelector('.relogin-form');
    let checkout = document.querySelector('.checkout-steps');
    let checkoutStepIndex = window.location.search.split('step=')[1];
    let checkoutSteps = document.querySelectorAll('.checkout-step');
    let checkoutStepActive = document.querySelector('.checkout-step-active');
    
    checkoutStepActive.classList.remove('checkout-step-active');
    document.querySelector('[step="' + checkoutStepIndex + '"]').classList.add('checkout-step-active');

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
            if (xhr.status >= 200 && xhr.status < 300) {
                let account = JSON.parse(xhr.responseText);
                localStorage.setItem('account', JSON.stringify(account));
                localStorage.setItem('loggedIn', 'true');

                relogin.style.display = 'none';
                checkout.style.display = 'flex';

                showOrder(storedAccount);
            } else {
                alert('Invalid email or password');
            }
        }
    });
}