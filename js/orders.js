const loggedIn = localStorage.getItem('loggedIn') === 'true';

function showOrders(account, orderID = null) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `http://localhost:8081/api/orders/get`);
    xhr.setRequestHeader('Content-Type', 'application/json');

    let requestData = {
        "Account": account
    }

    xhr.send(JSON.stringify(requestData));

    xhr.onload = function() {
        if (xhr.status === 200) {
            let orders = JSON.parse(xhr.responseText);
            let ordersList = document.querySelector('.order-list');

            if (orderID) {
                orders = {orderID: orders[Object.keys(orders)[Object.keys(orders).indexOf(orderID)]]};
                if (orders === {} || orders['OrderID'] === undefined) {
                    window.location.href = '/pages/orders.html';
                }
            }

            Object.values(orders).forEach(order => {
                let orderItem = document.createElement('div');
                orderItem.classList.add('order-item');

                let orderItemImage = document.createElement('img');
                orderItemImage.classList.add('order-item-image', 'col-3');

                let orderProductID = order.Products[0]['ID'];

                const xhr = new XMLHttpRequest();
                xhr.open('GET', `http://localhost:8081/api/products/${orderProductID}`);
                xhr.send();

                xhr.onload = function() {
                    if (xhr.status === 200) {
                        const product = JSON.parse(xhr.responseText);
                        orderItemImage.src = '/img/' + product.Image;

                        let orderItemContent = document.createElement('div');
                        orderItemContent.classList.add('order-item-content', 'col-9');

                        let orderItemHeader = document.createElement('div');
                        orderItemHeader.classList.add('order-item-header');

                        let orderItemTitle = document.createElement('h3');
                        orderItemTitle.classList.add('order-item-title');
                        orderItemTitle.innerHTML = 'Order <span class="order-item-id">' + order.ID + '</span>';

                        let orderItemStatus = document.createElement('h3');
                        orderItemStatus.classList.add('order-item-status');
                        orderItemStatus.innerHTML = order.Status;

                        let orderItemSubContent = document.createElement('div');
                        orderItemSubContent.classList.add('flex', 'justify-between');

                        let orderItemDate = document.createElement('h3');
                        orderItemDate.classList.add('order-item-date');
                        orderItemDate.innerHTML = order.Date;

                        let orderItemPrice = document.createElement('h3');
                        orderItemPrice.classList.add('order-item-price');
                        orderItemPrice.innerHTML = '€' + (order.Price / 100).toFixed(2);
                        
                        let orderItemShimpent = document.createElement('div');
                        orderItemShimpent.classList.add('order-item-shipment');

                        let orderItemShimpentTarget = document.createElement('div');
                        orderItemShimpentTarget.classList.add('flex', 'justify-between');

                        let orderItemAdress = document.createElement('p');
                        orderItemAdress.classList.add('order-item-adress');
                        orderItemAdress.innerHTML = order.Shipment.Street + ' ' + order.Shipment.Number;

                        let orderItemCity = document.createElement('p');
                        orderItemCity.classList.add('order-item-city');
                        orderItemCity.innerHTML = order.Shipment.City + ' ' + order.Shipment.PostalCode;

                        let orderItemName = document.createElement('p');
                        orderItemName.classList.add('order-item-name');
                        orderItemName.innerHTML = order.Shipment.FirstName + ' ' + order.Shipment.LastName;

                        let orderItemSeeMore = document.createElement('a');
                        orderItemSeeMore.classList.add('order-item-see-more');
                        orderItemSeeMore.setAttribute('order-id', order.ID);
                        orderItemSeeMore.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';

                        let orderItemProducts = document.createElement('div');
                        orderItemProducts.classList.add('order-item-products');

                        let orderProducts = order.Products;
                        let promises = [];

                        for (let orderProduct of orderProducts) {
                            promises.push(new Promise((resolve, reject) => {
                                const xhr = new XMLHttpRequest();
                                xhr.open('GET', `http://localhost:8081/api/products/${orderProduct.ID}`);
                                xhr.send();
            
                                xhr.onload = function() {
                                    if (xhr.status === 200) {
                                        for (let size in orderProduct.Sizes) {
                                            const product = JSON.parse(xhr.responseText);

                                            let orderItemProduct = document.createElement('a');
                                            orderItemProduct.classList.add('order-item-product');
                                            orderItemProduct.setAttribute('href', '/pages/product.html?id=' + orderProduct.ID);
                
                                            let orderItemProductImage = document.createElement('img');
                                            orderItemProductImage.classList.add('order-item-product-image');
                                            orderItemProductImage.src = product.Images[0];

                                            let orderItemProductQuantity = document.createElement('h3');
                                            orderItemProductQuantity.classList.add('order-item-product-quantity');
                                            orderItemProductQuantity.innerHTML = 'x' + orderProduct.Sizes[size]['Quantity'];

                                            let orderItemProductTitle = document.createElement('h3');
                                            orderItemProductTitle.classList.add('order-item-product-title');
                                            orderItemProductTitle.innerHTML = size;

                                            orderItemProduct.append(orderItemProductImage)
                                            orderItemProduct.append(orderItemProductTitle)

                                            if (orderProduct.Sizes[size]['Quantity'] > 1) {
                                                orderItemProduct.append(orderItemProductQuantity)
                                            }

                                            orderItemProducts.appendChild(orderItemProduct);
                                        }

                                        resolve();
                                    } else {
                                        reject();
                                    }
                                }
                            }));
                        }

                        Promise.all(promises).then(() => {
                            orderItemHeader.appendChild(orderItemTitle);
                            orderItemHeader.appendChild(orderItemStatus);

                            orderItemSubContent.appendChild(orderItemDate);
                            orderItemSubContent.appendChild(orderItemPrice);

                            orderItemShimpentTarget.appendChild(orderItemAdress);
                            orderItemShimpentTarget.appendChild(orderItemCity);

                            orderItemShimpent.appendChild(orderItemShimpentTarget);
                            orderItemShimpent.appendChild(orderItemName);
            
                            orderItemContent.appendChild(orderItemHeader);
                            orderItemContent.appendChild(orderItemSubContent);
                            orderItemContent.appendChild(orderItemShimpent);
                            orderItemContent.appendChild(orderItemSeeMore);
                            orderItemContent.appendChild(orderItemProducts);

                            orderItem.appendChild(orderItemImage);
                            orderItem.appendChild(orderItemContent);
            
                            ordersList.appendChild(orderItem);

                            document.querySelectorAll('.order-item-see-more').forEach((orderItemSeeMore) => {
                                orderItemSeeMore.addEventListener('click', function(e) {
                                    let orderItemProducts = this.parentElement.querySelector('.order-item-products');
                                    let orderItemSeeMoreIcon = this.querySelector('i');

                                    orderItemProducts.classList.add('open');
                                    orderItemSeeMoreIcon.classList.add('open');

                                    document.querySelectorAll('.order-item-products').forEach((orderItemProduct) => {
                                        if (orderItemProduct !== orderItemProducts) {
                                            orderItemProduct.classList.remove('open');
                                            orderItemProduct.parentElement.querySelector('.order-item-see-more i').classList.remove('open');
                                        }
                                    });
                                });
                            });
                        });
                    }
                }
            });
        }
    }
}

if (storedAccount && loggedIn) {
    let relogin = document.querySelector('.relogin-form');
    let orders = document.querySelector('.order-items');

    let orderID = window.location.search.split('orderID=')[1];

    if (orderID) {
        relogin.style.display = 'none';
        orders.style.display = 'block';

        showOrders(storedAccount, orderID);
    } else {
        relogin.style.display = 'block';
        orders.style.display = 'none';
    }

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