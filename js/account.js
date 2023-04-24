const navAccount = document.querySelectorAll('.account-user');
const navLogin = document.querySelectorAll('.account-login');
const logoutBtn = document.querySelectorAll('.account-logout');
const ordersBtn = document.querySelectorAll('.account-orders');
const loginBtn = document.querySelector('.login-btn');
const registerBtn = document.querySelector('.register-btn');
const storedAccount = localStorage.getItem('account') ? JSON.parse(localStorage.getItem('account')) : null;


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
        console.log(cartItem, productPrice, productID, productSize)
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
                if (xhr.status === 200) {
                    const product = JSON.parse(xhr.response);

                    Object.keys(productCart.Sizes).forEach((size) => {
                        if (product['Sizes'][size]['Stock'] < productCart.Sizes[size]['Quantity']) {
                            delete productCart.Sizes[size];

                            if (Object.keys(productCart.Sizes).length === 0) {
                                cart.splice(cart.findIndex((product) => product.ID === productCart.ID), 1);
                            } else {
                                account['Cart'][cart.findIndex((product) => product.ID === productCart.ID)]['Sizes'] = productCart.Sizes;
                            }
                            
                            localStorage.setItem('account', JSON.stringify(account));

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
                        cartImage.src = `/img/${product.Image}`;
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

                    document.querySelector('.cart-count').innerHTML = cartCount;

                    let total = 0;
                    document.querySelectorAll('.cart-price').forEach((element) => {
                        total += parseFloat(element.innerHTML.replace('€', ''));
                    });

                    document.querySelector('.cart-total-price').innerHTML = '€' + total;

                    document.querySelector('.cart-footer').style.display = 'block';

                    document.querySelectorAll('.cart-quantity-input').forEach((element) => {
                        element.addEventListener('change', (event) => {
                            let account = JSON.parse(localStorage.getItem('account'));
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
                                if (xhr.status === 200) {
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
                                if (xhr.status === 200) {
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
                if (xhr.status === 200) {
                    const product = JSON.parse(xhr.response);

                    let favoritesItem = document.createElement('div');
                    favoritesItem.classList.add('favorites-item');
                    favoritesItem.setAttribute('data-product-id', productFavorites.ID);
                    favoritesItem.setAttribute('data-product-price', product.Price);

                    let favoritesImage = document.createElement('img');
                    favoritesImage.classList.add('favorites-image', 'col-4');
                    favoritesImage.src = `/img/${product.Image}`;
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
                                if (xhr.status === 200) {
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

function login(account, rememberMe = false) {
    let xhr = new XMLHttpRequest();

    xhr.open('POST', 'http://localhost:8081/api/accounts/login');
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.send(JSON.stringify(account));
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.response);
            response.Remember = rememberMe;

            localStorage.setItem('account', JSON.stringify(response));
            localStorage.setItem('loggedIn', true)

            navAccount.forEach((element) => {
                element.style.display = 'block';
            });
            navLogin.forEach((element) => {
                element.style.display = 'none';
            });

            document.querySelector('.account-user .nav-link').innerHTML += response.Forname;

            initializeCart(response);
            initializeFavorites(response);
        } else {
            alert('Invalid login credentials');
        }
    };
}

function register(account) {
    let xhr = new XMLHttpRequest();

    xhr.open('POST', 'http://localhost:8081/api/accounts/register');
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.send(JSON.stringify(account));
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            navAccount.style.display = 'block';
            navLogin.style.display = 'none';

            document.querySelector('.account-user .nav-link').innerHTML += account.Forname;
        }
    };
}

if (storedAccount) {
    const account = JSON.parse(localStorage.getItem('account'));

    if (account.Remember) {
        login({
            "Email": account.Email,
            "Password": account.Password
        }, true);

        navAccount.forEach((element) => {
            element.style.display = 'block';
        });
        navLogin.forEach((element) => {
            element.style.display = 'none';
        });
    }
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

        const email = document.querySelector('[name=Email]').value;
        const password = document.querySelector('[name=Password]').value;
        const rememberMe = document.querySelector('[name=Remember]').checked;

        login({
            "Email": email,
            "Password": password
        }, rememberMe);
    });
}

if (registerBtn) {
    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const forname = document.getElementById('FirstName').value;
        const surname = document.getElementById('LastName').value;
        const email = document.getElementById('Email').value;
        const password = document.getElementById('Password').value;
        const phone = document.getElementById('Phonenumber').value;
        const address = document.getElementById('Address').value;

        register({
            "Forname": forname,
            "Surname": surname,
            "Email": email,
            "Password": password,
            "Phone": phone,
            "Address": address,
            "Name": forname + ' ' + surname
        });
    });
}

logoutBtn.forEach((element) => {
    element.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('account');
        localStorage.removeItem('loggedIn');
        navAccount.forEach((element) => {
            element.style.display = 'none';
        });
        navLogin.forEach((element) => {
            element.style.display = 'block';
        });
    });
});