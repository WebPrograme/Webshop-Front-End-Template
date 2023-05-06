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
const storedAccount = localStorage.getItem('accountID');

function initializeCart(account) {
    const cart = account.Cart;
    
    function updateCart(cart, productID = false, productSize = false, productPrice = false) {
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

    if (cart) {
        let cartCount = 0;
        
        cart.forEach((productCart) => {
            if (!productCart.Sizes) {
                return;
            }

            document.querySelector('.cart-items').innerHTML = '';

            const xhr = new XMLHttpRequest();
            xhr.open('GET', `http://localhost:8081/api/products/${productCart.ID}`);
            xhr.send();

            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const product = JSON.parse(xhr.response);

                    Object.keys(productCart.Sizes).forEach((size) => {
                        if (product['Sizes'][size]['Stock'] < productCart.Sizes[size]['Quantity']) {
                            delete productCart.Sizes[size];

                            if (Object.keys(productCart.Sizes).length === 0) {
                                cart.splice(cart.findIndex((product) => product.ID === productCart.ID), 1);
                            } else {
                                account['Cart'][cart.findIndex((product) => product.ID === productCart.ID)]['Sizes'] = productCart.Sizes;
                            }

                            const xhr = new XMLHttpRequest();
                            xhr.open('PUT', `http://localhost:8081/api/cart/update`);
                            xhr.setRequestHeader('Content-Type', 'application/json');

                            let requestData = {
                                "Account": account,
                                "Cart": cart
                            }

                            xhr.send(JSON.stringify(requestData));
                            return;
                        }

                        let cartItem = document.createElement('div');
                        cartItem.classList.add('cart-item');
                        cartItem.setAttribute('data-product-id', productCart.ID);
                        cartItem.setAttribute('data-product-size', size);
    
                        let cartImage = document.createElement('img');
                        cartImage.classList.add('cart-image', 'col-4');
                        cartImage.src = product.Images[0];
                        cartImage.alt = product.Name;
    
                        let cartContent = document.createElement('div');
                        cartContent.classList.add('cart-content');
    
                        let cartHeader = document.createElement('div');
                        cartHeader.classList.add('cart-header');
    
                        let cartTitle = document.createElement('h3');
                        cartTitle.classList.add('cart-title');
                        cartTitle.innerHTML = '<a href="/product.html?id=' + productCart.ID + '">' + product.Name + '</a>'
    
                        let cartRemove = document.createElement('button');
                        cartRemove.classList.add('cart-remove', 'cart-remove-item');
                        cartRemove.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                        cartRemove.setAttribute('data-product-id', productCart.ID);
                        cartRemove.setAttribute('data-product-size', size);
    
                        cartHeader.appendChild(cartTitle);
                        cartHeader.appendChild(cartRemove);
    
                        let cartSizes = document.createElement('div');
                        cartSizes.classList.add('cart-sizes');
                        let cartSize = document.createElement('div');
                        cartSize.classList.add('cart-size');

                        let cartSizeTitle = document.createElement('h4');
                        cartSizeTitle.classList.add('cart-size-title');
                        cartSizeTitle.innerHTML = "Size <span class='cart-size-value'>" + size + "</span>";

                        let cartQuantity = document.createElement('div');
                        cartQuantity.classList.add('cart-quantity');

                        let cartQuantityInput = document.createElement('input');
                        cartQuantityInput.classList.add('cart-quantity-input', 'input', 'w-min');
                        cartQuantityInput.setAttribute('data-product-id', productCart.ID);
                        cartQuantityInput.setAttribute('data-product-price', product.Price);
                        cartQuantityInput.setAttribute('data-product-size', size);
                        cartQuantityInput.setAttribute('min', 1);
                        cartQuantityInput.setAttribute('max', product.Sizes[size].Stock);
                        cartQuantityInput.type = 'number';
                        cartQuantityInput.min = 1;
                        cartQuantityInput.value = productCart.Sizes[size].Quantity;

                        let cartPrice = document.createElement('h3');
                        cartPrice.classList.add('cart-price');
                        cartPrice.innerHTML = "€" + (product.Price / 100) * productCart.Sizes[size].Quantity;

                        cartQuantity.appendChild(cartQuantityInput);
                        cartQuantity.appendChild(cartPrice);

                        cartSize.appendChild(cartSizeTitle);
                        cartSizes.appendChild(cartSize);

                        cartContent.appendChild(cartHeader);
                        cartContent.appendChild(cartSizes);
                        cartContent.appendChild(cartQuantity);
    
                        cartItem.appendChild(cartImage);
                        cartItem.appendChild(cartContent);
    
                        document.querySelector('.cart-items').appendChild(cartItem);
                    });

                    cartCount += Object.values(productCart.Sizes).reduce((accumulator, currentValue) => {
                        return accumulator + currentValue.Quantity;
                    }, 0);

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

                    document.querySelector('.cart-total-price').innerHTML = '€' + total;

                    document.querySelector('.cart-footer').style.display = 'block';

                    document.querySelectorAll('.cart-quantity-input').forEach((element) => {
                        element.addEventListener('change', (event) => {
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
        
                            let xhr = new XMLHttpRequest();
                            xhr.open('PUT', `http://localhost:8081/api/cart/update`);
                            xhr.setRequestHeader('Content-Type', 'application/json');
                            xhr.send(JSON.stringify({
                                "Account": account,
                                "Cart": cart
                            }));
        
                            xhr.onload = function() {
                                if (xhr.status >= 200 && xhr.status < 300) {
                                    updateCart(cart, productID, productSize, productPrice);
                                }
                            };
                        });
                    });

                    document.querySelectorAll('.cart-remove-item').forEach((element) => {
                        element.addEventListener('click', (event) => {
                            event.preventDefault();
                            let btn = event.target.closest('.cart-remove-item');

                            let account = JSON.parse(localStorage.getItem('account'));
                            let cart = account.Cart;
                            let productID = btn.getAttribute('data-product-id');
                            let productSize = btn.getAttribute('data-product-size');
        
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
        
                            let xhr = new XMLHttpRequest();
                            xhr.open('PUT', `http://localhost:8081/api/cart/update`);
                            xhr.setRequestHeader('Content-Type', 'application/json');
                            xhr.send(JSON.stringify({
                                "Account": account,
                                "Cart": cart
                            }));
        
                            xhr.onload = function() {
                                if (xhr.status >= 200 && xhr.status < 300) {
                                    localStorage.setItem('account', JSON.stringify(account));
                                    updateCart(cart, productID, productSize);
                                }
                            };
                        });
                    });
                }
            };
        });

        document.querySelector('.cart-checkout').addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = '/pages/checkout.html?step=1';
        });
    }
}

function initializeFavorites(account) {
    const favorites = account.Favorites;
        
    function updateFavorites(favorites, productID = false, productPrice = false) {
        const favoritesItem = document.querySelectorAll('.favorites-item[data-product-id="' + productID + '"]')[0];

        document.querySelector('.favorites-items').removeChild(favoritesItem);
    }

    if (favorites) {
        let favoritesCount = favorites.length;
        
        favorites.forEach((productFavorites) => {
            document.querySelector('.favorites-items').innerHTML = '';

            const xhr = new XMLHttpRequest();
            xhr.open('GET', `http://localhost:8081/api/products/${productFavorites.ID}`);
            xhr.send();

            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const product = JSON.parse(xhr.response);

                    let favoritesItem = document.createElement('div');
                    favoritesItem.classList.add('favorites-item');
                    favoritesItem.setAttribute('data-product-id', productFavorites.ID);
                    favoritesItem.setAttribute('data-product-price', product.Price);

                    let favoritesImage = document.createElement('img');
                    favoritesImage.classList.add('favorites-image', 'col-4');
                    favoritesImage.src = product.Images[0];
                    favoritesImage.alt = product.Name;

                    let favoritesContent = document.createElement('div');
                    favoritesContent.classList.add('favorites-content');

                    let favoritesHeader = document.createElement('div');
                    favoritesHeader.classList.add('favorites-header');

                    let favoritesTitle = document.createElement('h3');
                    favoritesTitle.classList.add('favorites-title');
                    favoritesTitle.innerHTML = '<a href="/product.html?id=' + productFavorites.ID + '">' + product.Name + '</a>'

                    let favoritesRemove = document.createElement('button');
                    favoritesRemove.classList.add('favorites-remove', 'favorites-remove-item');
                    favoritesRemove.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                    favoritesRemove.setAttribute('data-product-id', productFavorites.ID);

                    favoritesHeader.appendChild(favoritesTitle);
                    favoritesHeader.appendChild(favoritesRemove);

                    let favoritesPrice = document.createElement('h3');
                    favoritesPrice.classList.add('favorites-price');
                    favoritesPrice.innerHTML = "€" + (product.Price / 100);

                    favoritesContent.appendChild(favoritesHeader);
                    favoritesContent.appendChild(favoritesPrice);

                    favoritesItem.appendChild(favoritesImage);
                    favoritesItem.appendChild(favoritesContent);

                    document.querySelector('.favorites-items').appendChild(favoritesItem);

                    let total = 0;
                    document.querySelectorAll('.favorites-price').forEach((element) => {
                        total += parseFloat(element.innerHTML.replace('€', ''));
                    });

                    document.querySelectorAll('.favorites-remove-item').forEach((element) => {
                        element.addEventListener('click', (event) => {
                            event.preventDefault();
                            let btn = event.target.closest('.favorites-remove-item');

                            let account = JSON.parse(localStorage.getItem('account'));
                            let favorites = account.Favorites;
                            let productID = btn.getAttribute('data-product-id');
                            let productPrice = btn.closest('.favorites-item').getAttribute('data-product-price');
        
                            favorites.forEach((productFavorites) => {
                                if (productFavorites.ID === productID) {
                                    delete favorites[favorites.indexOf(productFavorites)];

                                    if (favorites.length === 0) {
                                        favorites = [];
                                    }
                                }
                            });

                            account.Favorites = favorites;
        
                            let xhr = new XMLHttpRequest();
                            xhr.open('PUT', `http://localhost:8081/api/favorites/update`);
                            xhr.setRequestHeader('Content-Type', 'application/json');
                            xhr.send(JSON.stringify({
                                "Account": account,
                                "Favorites": favorites
                            }));
        
                            xhr.onload = function() {
                                if (xhr.status >= 200 && xhr.status < 300) {
                                    localStorage.setItem('account', JSON.stringify(account));
                                    updateFavorites(favorites, productID, productPrice);
                                }
                            };
                        });
                    });

                    let btnAddToFavorites = document.querySelector('.product-add-to-favorites[data-product-id="' + productFavorites.ID + '"]');

                    if (btnAddToFavorites) {
                        btnAddToFavorites.classList.add('product-added-to-favorites');
                    }
                }
            };
        });

        if (favoritesCount > 0) {
            document.querySelector('.favorites-empty').style.display = 'none';
        } else {
            document.querySelector('.favorites-empty').style.display = 'block';
        }
    }
}

function getAccount(email, password, relogin = false) {
    return new Promise((resolve, reject) => {
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const accountID = userCredential['user']['uid'];
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://localhost:8081/api/accounts/login');
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            xhr.send(JSON.stringify({UID: accountID}));
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    if (relogin) {
                        resolve(JSON.parse(xhr.response));
                    }
                    resolve(accountID);
                } else {
                    reject(xhr.response);
                }
            }
        });
    });
}

function getAccountByID(accountID) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `http://localhost:8081/api/accounts/login/uid`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({UID: accountID}));

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.response));
            } else {
                reject(xhr.response);
            }
        }
    });
}

function login(account, rememberMe = false) {
    getAccount(account['Email'], account['Password']).then((accountID) => {
        if (rememberMe) {
            localStorage.setItem('accountID', accountID);
        } else {
            localStorage.removeItem('accountID');
        }
        
        navAccount.forEach((element) => {
            element.style.display = 'block';
        });
        navLogin.forEach((element) => {
            element.style.display = 'none';
        });

        window.location.href = '/index.html';
    }).catch((error) => {
        new Toast('login-failed').show();
    });
}

function register(account) {
    createUserWithEmailAndPassword(auth, account['Email'], account['Password'])
    .then((userCredential) => {
        const accountID = userCredential['user']['uid'];

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:8081/api/accounts/register');
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.send(JSON.stringify({UID: accountID, Account: account}));

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                window.location.href = '/index.html';
            }
        };
    })
    .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
            new Toast('email-exists').show();
        }
    });
}

if (storedAccount) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:8081/api/accounts/login');
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.send(JSON.stringify({UID: storedAccount}));

    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            const account = JSON.parse(xhr.response);
            
            navAccount.forEach((element) => {
                element.style.display = 'block';
            });
            navLogin.forEach((element) => {
                element.style.display = 'none';
            });
            
            document.querySelector('.account-user .nav-link').innerHTML += account['Forname'];

            initializeCart(account);
            initializeFavorites(account);
        } else {
            new Toast('email-exists').show();
        }
    };
} else {
    navAccount.forEach((element) => {
        element.style.display = 'none';
    });
    navLogin.forEach((element) => {
        element.style.display = 'block';
    });
}

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
            login({
                "Email": email,
                "Password": password
            }, rememberMe);
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
            register({
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
            localStorage.removeItem('accountID');
            navAccount.forEach((element) => {
                element.style.display = 'none';
            });
            navLogin.forEach((element) => {
                element.style.display = 'block';
            });
        })
    });
});

export { initializeCart, initializeFavorites, getAccount, getAccountByID }