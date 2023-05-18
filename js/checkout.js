import { Account } from './account.js';

function createItem(product, productCart, size) {
    let item = document.createElement('div');
    let itemHTML = `
    <div class="order-item">
        <img class="order-item-img col-3" src="${product.Images[0]}" alt="${product.Name}">

        <div class="order-item-info col-8">
            <div class="order-item-header">
                <h2 class="order-item-info-name">${product.Name}</h2>
                <h3 class="order-item-info-price">€${(product.Price / 100).toFixed(2)}</h3>
            </div>
            
            <div class="order-item-info-size-quantity">
                <h3 class="order-item-info-size"><span class="text-muted">Size: </span> ${size}</h3>
                <h3 class="order-item-info-quantity"><span class="text-muted">Quantity: </span> ${productCart.Sizes[size]['Quantity']}</h3>
            </div>
            
            <p class="order-item-info-description">${product.Description}</p>
        </div>
    </div>`;

    item.innerHTML = itemHTML;
    return item;
}

class CheckoutSteps {
    constructor(step, account) {
        this.steps = [this.order, this.shipment, this.payment];
        this.steps[step - 1](account);
    }

    async order(account) {
        const cart = account.Cart;
        const order = document.querySelector('.order');
        const orderList = document.querySelector('.order-list');
        const orderTotalPrice = document.querySelector('.order-footer-total-price');
    
        let totalPrice = 0;
    
        for (let productCart of cart) {
            fetch(`http://localhost:8081/api/products/${productCart.ID}`)
            .then(response => response.json())
            .then(product => {
                Object.keys(productCart.Sizes).forEach(function(size, index) {
                        let productItem = createItem(product, productCart, size);
    
                        let productItemSeperator = document.createElement('hr');
                        productItemSeperator.classList.add('order-item-seperator');
    
                        orderList.appendChild(productItem);
    
                        if (index < Object.keys(productCart.Sizes).length - 1) {
                            orderList.appendChild(productItemSeperator);
                        }
    
                        totalPrice += product.Price * productCart.Sizes[size]['Quantity'];
                });
    
                orderTotalPrice.innerHTML = '€' + (totalPrice / 100).toFixed(2);

                order.style.display = 'block';
            });
        }

        document.querySelector('.order-btn').addEventListener('click', function(e) {
            CheckoutSteps.prototype.shipment(account);
        }.bind(this));
    }

    async shipment(account) {
        const cart = account.Cart;

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
                        fetch(`http://localhost:8081/api/products/${productCart.ID}`)
                        .then(response => response.json())
                        .then(product => {
                            Object.keys(productCart.Sizes).forEach(function(size) {
                                totalPrice += product.Price * productCart.Sizes[size]['Quantity'];
                            });
    
                            resolve();
                        });
                    }));
                }
    
                Promise.all(promises).then(function() {
                    document.querySelector('.checkout-step[step="3"]').classList.add('checkout-step-active');
    
                    document.querySelector('[step-content="2"]').style.display = 'none';
                    document.querySelector('[step-content="3"]').style.display = 'flex';
    
                    document.querySelectorAll('.payment-methods a').forEach(function(paymentMethod) {
                        paymentMethod.addEventListener('click', function(e) {
                            e.preventDefault();
                            let method = e.target.closest('a').getAttribute('method');

                            CheckoutSteps.prototype.payment(account, shipmentDetails, totalPrice, method);
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
    }
    
    async payment(account, shipmentDetails, totalPrice, paymentMethod) {
        // The payment itself is not implemented, so the user is redirected to the order confirmation page

        fetch('http://localhost:8081/api/orders/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + account.UID
            },
            body: JSON.stringify({
                "Account": account,
                "Order": {
                    "Products": account.Cart
                },
                "Shipment": shipmentDetails,
                "Price": totalPrice,
                "Payment": {
                    "Method": paymentMethod
                },
            })
        }).then(response => {
            window.location.href = './pages/order.html'
        });
    }
}

let relogin = document.querySelector('.relogin-form');
let checkout = document.querySelector('.checkout-steps');
let checkoutStepIndex = window.location.search.split('step=')[1];
let checkoutStepActive = document.querySelector('.checkout-step-active');

checkoutStepActive.classList.remove('checkout-step-active');
document.querySelector('[step="' + checkoutStepIndex + '"]').classList.add('checkout-step-active');

new Account().getAccount().then(function(account) {
    relogin.style.display = 'none';
    checkout.style.display = 'flex';

    new CheckoutSteps(checkoutStepIndex, account);
}).catch(function(error) {
    document.querySelector('.relogin-btn').addEventListener('click', function(e) {
        e.preventDefault();

        let email = document.querySelector('[name="Email"]').value;
        let password = document.querySelector('[name="Password"]').value;

        new Account().login(email, password).then(function(account) {
            relogin.style.display = 'none';
            checkout.style.display = 'flex';

            new CheckoutSteps(checkoutStepIndex, account);
        }).catch(function(error) {
            new Toast('Wrong Email/Password', 'error').show();
        });
    });
});