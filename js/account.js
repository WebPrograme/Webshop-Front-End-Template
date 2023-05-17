import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyB5Z8TLxmkqZDVcDh5lyGlsqKHRGVYefIg",
    authDomain: "web-shop-38204.firebaseapp.com",
    projectId: "web-shop-38204",
    storageBucket: "web-shop-38204.appspot.com",
    messagingSenderId: "258327241295",
    appId: "1:258327241295:web:a2578cd574ad30f1c0c03a",
    measurementId: "G-W73DFZVRY4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const navAccount = document.querySelectorAll('.account-user');
const navLogin = document.querySelectorAll('.account-login');
const logoutBtn = document.querySelectorAll('.account-logout');
const ordersBtn = document.querySelectorAll('.account-orders');
const loginBtn = document.querySelector('.login-btn');
const registerBtn = document.querySelector('.register-btn');

// Cart
class Cart {
    async addProduct(productID, productSize, product, account) { // Add Product to Cart
        fetch('http://localhost:8081/api/accounts/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + account
            },
            body: JSON.stringify({})
        }).then(response => response.json())
        .then(account => {
            let cart = account.Cart ? account.Cart : [];
            let productInCart = cart.filter(product => product.ID === productID)[0];

            if (productInCart) {
                if (productInCart["Sizes"][productSize]) {
                    cart[cart.indexOf(productInCart)]["Sizes"][productSize]["Quantity"] += 1;
                } else {
                    cart[cart.indexOf(productInCart)]["Sizes"][productSize] = {
                        "Quantity": 1
                    };
                }
            } else {
                cart.push({
                    "ID": productID,
                    "Name": product.Name,
                    "Sizes": {
                        [productSize]: {
                            "Quantity": 1
                        }
                    }
                });
            }

            account.Cart = cart;
            console.log(account);
            
            fetch(`http://localhost:8081/api/accounts/cart/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + account.UID
                },
                body: JSON.stringify({
                    "Cart": cart
                })
            }).then(response => {
                if (response.status === 200) {
                    document.querySelector('.cart-count').innerHTML = cart.length;
    
                    const toast = new Toast('added-to-cart-success');
                    toast.show();

                    this.initialize(account);
                }
            });
        });
    }

    async initialize(account) { // Initialize Cart
        const uid = account ? account.UID : localStorage.getItem('accountID');
        const cart = account.Cart ? account.Cart : [];
        let cartCount = 0;
        
        cart.forEach((productCart) => {
            if (!productCart.Sizes) return;
    
            document.querySelector('.cart-items').innerHTML = '';

            // Get Product
            fetch(`http://localhost:8081/api/products/${productCart.ID}`)
            .then(response => response.json())
            .then(product => {
                Object.keys(productCart.Sizes).forEach((size) => {
                    /// Check if Product is still in Stock
                    if (product['Sizes'][size]['Stock'] < productCart.Sizes[size]['Quantity']) {
                        delete productCart.Sizes[size];

                        if (Object.keys(productCart.Sizes).length === 0) {
                            cart.splice(cart.findIndex((product) => product.ID === productCart.ID), 1);
                        } else {
                            account['Cart'][cart.findIndex((product) => product.ID === productCart.ID)]['Sizes'] = productCart.Sizes;
                        }

                        fetch(`http://localhost:8081/api/accounts/cart/update`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + uid
                            },
                            body: JSON.stringify({
                                "Cart": cart
                            })
                        });

                        return;
                    }

                    // Create Cart Item
                    this.createItem(product, productCart, size);
                });

                // Update Cart Count
                cartCount += Object.values(productCart.Sizes).reduce((accumulator, currentValue) => {
                    return accumulator + currentValue.Quantity;
                }, 0);
    
                // Give Adittional Styling to Cart
                if (cartCount > 0) {
                    document.querySelector('.cart-empty').style.display = 'none';
                    document.querySelector('.cart-footer').style.display = 'block';
        
                    document.querySelector('.cart-count').innerHTML = parseInt(cartCount);
                } else {
                    document.querySelector('.cart-empty').style.display = 'block';
                    document.querySelector('.cart-footer').style.display = 'none';
                }
    
                let total = 0;
                document.querySelectorAll('.cart-price').forEach((element) => {
                    total += parseFloat(element.innerHTML.replace('€', ''));
                });
    
                document.querySelector('.cart-total-price').innerHTML = '€' + total
                document.querySelector('.cart-footer').style.display = 'block';
    
                // CART ITEM EVENTS
                // Update Quantity
                document.querySelectorAll('.cart-quantity-input').forEach((element) => {
                    element.addEventListener('change', (event) => {
                        this.updateQuantity(event, account);
                    });
                });
    
                // Remove Item
                document.querySelectorAll('.cart-remove-item').forEach((element) => {
                    element.addEventListener('click', (event) => {
                        event.preventDefault();
    
                        this.removeItem(event, account);
                    });
                });
            });
        });
        
        // CART EVENTS
        document.querySelector('.cart-checkout').addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = '/pages/checkout.html?step=1';
        });
    }

    update(cart, productID = false, productSize = false, productPrice = false) { // Update Cart
        let cartCount = 0;
        
        cart.forEach((productCart) => {
            cartCount += Object.values(productCart.Sizes).reduce((accumulator, currentValue) => {
                return accumulator + currentValue.Quantity;
            }, 0);
        });
    
        document.querySelector('.cart-count').innerHTML = parseInt(cartCount);
    
        const cartItem = document.querySelectorAll('.cart-item[data-product-id="' + productID + '"][data-product-size="' + productSize + '"]')[0];
        
        if (cartItem && productPrice) {
            const cartQuantityValue = cartItem.querySelector('.cart-quantity-input').value;
            cartItem.querySelector('.cart-price').innerHTML = "€" + ((productPrice / 100) * cartQuantityValue);
        } else {
            document.querySelector('.cart-items').removeChild(cartItem);
        }
    
        let total = 0;
        document.querySelectorAll('.cart-price').forEach((element) => {
            total += parseFloat(element.innerHTML.replace('€', ''));
        });
    
        document.querySelector('.cart-total-price').innerHTML = '€' + total;
    }

    createItem(product, productCart, size) { // Create Cart Item
        let cartItemHTML = `
        <div class="cart-item" data-product-id="${productCart.ID}" data-product-size="S">
            <img class="cart-image col-4" src="${product.Images[0]}" alt="${product.Name}">
            
            <div class="cart-content">
                <div class="cart-header">
                    <h3 class="cart-title"><a href="/product.html?id=${productCart.ID}">${product.Name}</a></h3>
                    <button class="cart-remove cart-remove-item" data-product-id="${productCart.ID}" data-product-size="${size}"><i class="fa-solid fa-xmark"></i></button>
                </div>
                
                <div class="cart-sizes">
                    <div class="cart-size">
                        <h4 class="cart-size-title">Size <span class="cart-size-value">${size}</span></h4>
                    </div>
                </div>
                
                <div class="cart-quantity">
                    <input class="cart-quantity-input input w-min" data-product-id="${productCart.ID}" data-product-price="${product.Price}" data-product-size="${size}" value="1" min="1" max="${product.Sizes[size].Stock}" type="number">
                    <h3 class="cart-price">€${(product.Price / 100) * productCart.Sizes[size].Quantity}</h3>
                </div>
            </div>
        </div>`;

        document.querySelector('.cart-items').innerHTML += cartItemHTML;
    }

    updateQuantity(event, account) { // Update Quantity
        let cart = account.Cart;
        let productID = event.target.getAttribute('data-product-id');
        let productSize = event.target.getAttribute('data-product-size');
        let productPrice = event.target.getAttribute('data-product-price');
        let quantity = event.target.value;

        cart.forEach((productCart) => {
            if (productCart.ID === productID) {
                productCart.Sizes[productSize].Quantity = quantity;
            }
        });

        // Update Cart
        fetch('http://localhost:8081/api/accounts/cart/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + account.UID
            },
            body: JSON.stringify({
                "Cart": cart
            })
        }).then((response) => {
            if (response.status >= 200 && response.status < 300) {
                this.update(cart, productID, productSize, productPrice);
            }
        });
    }

    removeItem(event, account) { // Remove Item
        const btn = event.target.closest('.cart-remove-item');

        let cart = account.Cart;
        let productID = btn.getAttribute('data-product-id');
        let productSize = btn.getAttribute('data-product-size');
        let productPrice = btn.getAttribute('data-product-price');
    
        cart.forEach((productCart) => {
            if (productCart.ID === productID) {
                delete productCart.Sizes[productSize];

                if (Object.keys(productCart.Sizes).length === 0) {
                    let index = cart.indexOf(productCart);
                    cart.splice(index, 1);
                }
            }
        });

        account.Cart = cart;
    
        // Update Cart
        fetch('http://localhost:8081/api/accounts/cart/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + account.UID
            },
            body: JSON.stringify({
                "Cart": cart
            })
        }).then((response) => {
            if (response.status >= 200 && response.status < 300) {
                this.update(cart, productID, productSize, productPrice);
            }
        });
    }
}

// Favorites
class Favorites {
    async initialize(account) { // Initialize Favorites
        const uid = account ? account.UID : localStorage.getItem('accountID');
        const favorites = account.Favorites ? account.Favorites : [];
        
        let favoritesCount = favorites.length;

        favorites.forEach((productFavorites) => {
            if (productFavorites === null) return;

            document.querySelector('.favorites-items').innerHTML = '';

            fetch(`http://localhost:8081/api/products/${productFavorites.ID}`)
            .then(response => response.json())
            .then(product => {
                this.createItem(product, productFavorites);

                // Remove Item
                document.querySelectorAll('.favorites-remove-item').forEach((element) => {
                    element.addEventListener('click', (event) => {
                        event.preventDefault();
                        this.removeItem(event, uid);
                    });
                });

                let btnAddToFavorites = document.querySelector('.product-add-to-favorites[data-product-id="' + productFavorites.ID + '"]');

                if (btnAddToFavorites) {
                    btnAddToFavorites.classList.add('product-added-to-favorites');
                }
            });
        });

        if (favoritesCount > 0) {
            document.querySelector('.favorites-empty').style.display = 'none';
        } else {
            document.querySelector('.favorites-empty').style.display = 'block';
        }
    }

    async addProduct(productID, product, accountID) { // Add Product
        fetch('http://localhost:8081/api/accounts/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accountID
            },
            body: JSON.stringify({})
        }).then(response => response.json())
        .then(account => {
            let favorites = account.Favorites ? account.Favorites : [];
            let productInFavorites = favorites.filter(product => product.ID === productID)[0];

            if (productInFavorites) {
                return;
            } else {
                favorites.push({
                    "ID": productID,
                    "Name": product.Name
                });
            }

            account.Favorites = favorites;
            
            this.update(favorites, accountID);
            this.initialize(account);

            new Toast('added-to-favorites-success').show();
        });
    }

    update(favorites, uid) { // Update Favorites
        fetch('http://localhost:8081/api/accounts/favorites/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + uid
            },
            body: JSON.stringify({
                "Favorites": favorites
            })
        });
    }

    async createItem(product, productFavorites) { // Create Favorites Item
        let favoritesItemHTML = `
        <div class="favorites-item" data-product-id="${productFavorites.ID}" data-product-price="${product.Price}">
            <img class="favorites-image col-4" src="${product.Images[0]}" alt="${product.Name}">
            
            <div class="favorites-content">
                <div class="favorites-header">
                    <h3 class="favorites-title"><a href="/product.html?id=${productFavorites.ID}">${product.Name}</a></h3>
                    <button class="favorites-remove favorites-remove-item" data-product-id="${productFavorites.ID}"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <h3 class="favorites-price">€${(product.Price / 100)}</h3>
            </div>
        </div>
        `;

        document.querySelector('.favorites-items').innerHTML += favoritesItemHTML;
    }

    async removeItem(event, uid) { // Remove Item
        let btn = event.target.closest('.favorites-remove-item');

        fetch(`http://localhost:8081/api/accounts/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + uid
            }
        }).then(response => response.json())
        .then(account => {
            let favorites = account.Favorites;
            let favoritesNew = [];
            let productID = btn.getAttribute('data-product-id');
        
            favorites.forEach((productFavorites) => {
                if (productFavorites.ID !== productID) {
                    favoritesNew.push(productFavorites);
                }
            });
            
            account.Favorites = favoritesNew;

            // Update Favorites
            const favoritesItem = document.querySelectorAll('.favorites-item[data-product-id="' + productID + '"]')[0];
            document.querySelector('.favorites-items').removeChild(favoritesItem);
            
            this.update(favoritesNew, uid)
        });
    }
}

// Account
class Account {
    async initialize() { // Initialize Account
        this.skeleton();

        const rememberMe = localStorage.getItem('rememberMe') ? localStorage.getItem('rememberMe') : false;

        if (rememberMe) {
            this.getAccount().then((account) => {
                navAccount.forEach((element) => {
                    element.style.display = 'block';
                });
                navLogin.forEach((element) => {
                    element.style.display = 'none';
                });
                
                document.querySelector('.account-user .nav-link').innerHTML += account['Forname'];
        
                new Cart().initialize(account);
                new Favorites().initialize(account);
            }).catch((error) => {
                navAccount.forEach((element) => {
                    element.style.display = 'none';
                });
                navLogin.forEach((element) => {
                    element.style.display = 'block';
                });
            });
        }
    }

    async getAccount() { // Get Account
        const accountID = document.cookie.replace(/(?:(?:^|.*;\s*)accountID\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        
        return new Promise((resolve, reject) => {
            fetch(`http://localhost:8081/api/accounts/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + accountID
                },
                body: JSON.stringify({})
            }).then(async (response) => {
                resolve(await response.json());
            });
        });
    }

    async login(email, password, rememberMe = false) { // Login
        return new Promise((resolve, reject) => {
            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const accountID = userCredential['user']['uid'];
                
                fetch(`http://localhost:8081/api/accounts/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + accountID
                    },
                    body: JSON.stringify({})
                }).then(async (response) => {
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', true);
                    }

                    document.cookie = `accountID=${accountID}; path=/`;
                    resolve(await response.json());
                });
            });
        });
    }

    async register(account) { // Register
        return new Promise((resolve, reject) => {
            createUserWithEmailAndPassword(auth, account['Email'], account['Password'])
            .then((userCredential) => {
                const accountID = userCredential['user']['uid'];
        
                fetch('http://localhost:8081/api/accounts/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'UID': accountID,
                        'Account': account
                    })
                }).then(async (response) => {
                    if (response.status >= 200 && response.status < 300) {
                        window.location.href = '/index.html';
                    }
                });
            })
            .catch((error) => {
                if (error.code === 'auth/email-already-in-use') {
                    new Toast('email-exists').show();
                }
            });
        });
    }

    async skeleton() { // Skeleton
        const navLink = document.querySelector('.account-login .nav-link');

        navLink.innerHTML = `<div class="login-skeleton"></div>`;
    }
}

const account = new Account().initialize();

if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();

        let email = document.querySelector('[name=Email]').value;
        let password = document.querySelector('[name=Password]').value;
        let rememberMe = document.querySelector('[name=Remember]').checked;
        
        if (email == '') {
            document.querySelector('[name=Email]').classList.add('input-error');
        } else {
            document.querySelector('[name=Email]').classList.remove('input-error');
        }

        if (password=== '') {
            document.querySelector('[name=Password]').classList.add('input-error');
        } else {
            document.querySelector('[name=Password]').classList.remove('input-error');
        }

        if (email != '' && password != '') {
            account.login(email, password, rememberMe)
        }
    });
}

if (registerBtn) {
    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();

        let forname = document.getElementById('FirstName').value;
        let surname = document.getElementById('LastName').value;
        let email = document.getElementById('Email').value;
        let password = document.getElementById('Password').value;
        let phone = document.getElementById('Phonenumber').value;
        let address = document.getElementById('Address').value;

        if (forname == '') {
            document.getElementById('FirstName').classList.add('input-error');
        } else {
            document.getElementById('FirstName').classList.remove('input-error');
        }

        if (surname == '') {
            document.getElementById('LastName').classList.add('input-error');
        } else {
            document.getElementById('LastName').classList.remove('input-error');
        }

        if (email == '') {
            document.getElementById('Email').classList.add('input-error');
        } else {
            document.getElementById('Email').classList.remove('input-error');
        }

        if (password == '') {
            document.getElementById('Password').classList.add('input-error');
        } else {
            document.getElementById('Password').classList.remove('input-error');
        }

        if (phone == '') {
            document.getElementById('Phonenumber').classList.add('input-error');
        } else {
            document.getElementById('Phonenumber').classList.remove('input-error');
        }

        if (address == '') {
            document.getElementById('Address').classList.add('input-error');
        } else {
            document.getElementById('Address').classList.remove('input-error');
        }

        if (forname != '' && surname != '' && email != '' && password != '' && phone != '' && address != '') {
            account.register({
                "Forname": forname,
                "Surname": surname,
                "Email": email,
                "Password": password,
                "Phone": phone,
                "Address": address,
                "Name": forname + ' ' + surname
            });
        }
    });
}

logoutBtn.forEach((element) => {
    element.addEventListener('click', (e) => {
        e.preventDefault();

        signOut(auth).then(() => {
            localStorage.removeItem('rememberMe');
            document.cookie = `accountID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

            navAccount.forEach((element) => {
                element.style.display = 'none';
            });
            navLogin.forEach((element) => {
                element.style.display = 'block';
            });
        })
    });
});

export { Cart, Favorites, Account };