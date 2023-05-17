import { getAccount, getAccountByID } from './account.js';

function createOrderProducts(orderItem, products, order) {
    let orderItemProducts = orderItem.querySelector('.order-item-products');
    
    products.forEach((product, index) => {
        Object.keys(product['Sizes']).forEach(size => {
            let orderItemProduct = document.createElement('a');
            orderItemProduct.classList.add('order-item-product');
            orderItemProduct.href = `/pages/product.html?id=${order.Products[index].ID}`;
            
            let orderItemProductHTML = `
            <img class="order-item-product-image" src="${product.Images[0]}">
            <h3 class="order-item-product-title">${size}</h3>`;
            
            if (order.Products[index]['Sizes'][size]['Quantity'] > 1) {
                orderItemProductHTML += `<h3 class="order-item-product-quantity">x${order.Products[index]['Sizes'][size]['Quantity']}</h3>`;
            }

            orderItemProduct.innerHTML = orderItemProductHTML;
            orderItemProducts.appendChild(orderItemProduct);
        });
    });

    return orderItem;
}

function createOrder(account, order, products) {
    let orderItem = document.createElement('div');
    orderItem.classList.add('order-item');

    let orderItemHTML = `
        <img class="order-item-image col-3" src="${products[0].Images[0]}">
        
        <div class="order-item-content col-9">
            <div class="order-item-header">
                <h3 class="order-item-title">Order <span class="order-item-id">${order.ID}</span></h3>
                <h3 class="order-item-status">${order.Status}</h3>
            </div>

        <div class="flex justify-between">
            <h3 class="order-item-date">${order.Date}</h3>
            <h3 class="order-item-price">€${(order.Price / 100).toFixed(2)}</h3>
        </div>
        
        <div class="order-item-shipment">
            <div class="flex justify-between">
                <p class="order-item-adress">${order.Shipment.Street + ' ' + order.Shipment.Number}</p>
                <p class="order-item-city">${order.Shipment.City + ' ' + order.Shipment.PostalCode}</p>
            </div>

            <p class="order-item-name">${order.Shipment.FirstName + ' ' + order.Shipment.LastName}</p>
        </div>

        <a class="order-item-see-more" order-id="${order.ID}"><i class="fa-solid fa-chevron-down"></i></a>
        
        <div class="order-item-products"></div>`;

    orderItem.innerHTML = orderItemHTML;

    return createOrderProducts(orderItem, products, order);
}

function showOrders(account, orderID = null) {
    fetch('http://localhost:8081/api/orders/get', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + account,
        },
        body: JSON.stringify({}),
    }).then(async response => {
        if (response.status === 200) {
            let orderPromises = [];
            let orders = await response.json();
            let ordersList = document.querySelector('.order-list');

            if (orderID) {
                orders = {orderID: orders[Object.keys(orders)[Object.keys(orders).indexOf(orderID)]]};
                if (orders === {} || orders['OrderID'] === undefined) {
                    window.location.href = '/pages/orders.html';
                }
            }

            Object.values(orders).forEach(async (order, index) => {
                orderPromises.push(new Promise(async (resolve, reject) => {
                    let productPromises = [];

                    Object.values(order.Products).forEach(async (product, index) => {
                        productPromises.push(new Promise(async (resolve, reject) => {
                            fetch(`http://localhost:8081/api/products/${product.ID}`)
                            .then(response => response.json())
                            .then(product => resolve(product));
                        }));
                    });

                    Promise.all(productPromises).then(products => {
                        let orderItem = createOrder(account, order, products);
                        ordersList.appendChild(orderItem);
                        resolve();
                    });
                }));
            });

            Promise.all(orderPromises).then(() => {
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
        } else {
            let ordersList = document.querySelector('.order-list');

            let noOrders = document.createElement('h2');
            noOrders.classList.add('no-orders', 'text-center');
            noOrders.innerHTML = 'No orders found';

            ordersList.appendChild(noOrders);
        }
    }).catch((error) => {
        console.log(error);
    });
}

let relogin = document.querySelector('.relogin-form');
let orders = document.querySelector('.order-items');
let orderID = window.location.search.split('orderID=')[1];
const accountID = localStorage.getItem('accountID');

if (orderID) {
    relogin.style.display = 'none';
    orders.style.display = 'block';
    showOrders(orderID);
} else {
    relogin.style.display = 'block';
    orders.style.display = 'none';
}

if (!accountID) {
    document.querySelector('.relogin-btn').addEventListener('click', function(e) {
        e.preventDefault();
        
        let email = document.querySelector('[name="Email"]').value;
        let password = document.querySelector('[name="Password"]').value;

        getAccount(email, password).then((account) => {
            relogin.style.display = 'none';
            orders.style.display = 'block';
            showOrders(account);
        }).catch((error) => {
            console.log(error);
        });
    });
} else {
    getAccountByID(accountID).then(function(account) {
        relogin.style.display = 'none';
        orders.style.display = 'flex';
        showOrders(accountID);
    }).catch(function(error) {
        console.log(error);
    });
}