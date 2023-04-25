import { getDownloadURL, ref as storageRef, uploadBytes, getStorage } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

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
const storage = getStorage(app);

const shop = document.querySelector('.shop-container');

let xhr = new XMLHttpRequest();

xhr.open('GET', 'http://localhost:8081/api/products');
xhr.send();

xhr.onload = function() {
    const products = JSON.parse(xhr.response);

    let searchCategory = new URLSearchParams(window.location.search).get('category');
    let categoryCells = []

    for (var productID in products) {
        const product = products[productID];

        let productCard = document.createElement('a');
        productCard.classList.add('card', 'product-card');
        productCard.setAttribute('data-search', 'true');
        productCard['href'] = `product.html?id=${productID}`;

        let productCardCategories = document.createElement('div');
        productCardCategories.classList.add('card-categories');

        if (product.Categories !== undefined) {
            Object.keys(product.Categories).forEach(category => {
                productCard.setAttribute(`data-${category}`, product.Categories[category])

                let productCategory = document.createElement('div');
                productCategory.classList.add('product-category');
                productCategory.style.backgroundColor = '#' + product.Categories[category];
        
                let productCategoryLabel = document.createElement('span');
                productCategoryLabel.innerHTML = category;
    
                productCategory.appendChild(productCategoryLabel);
    
                categoryCells.push(searchCategory);
                productCardCategories.appendChild(productCategory);
            });
        }

        let productImageContainer = document.createElement('div');
        productImageContainer.classList.add('card-image-container');

        let productImage = document.createElement('img');
        productImage.classList.add('card-image');
        productImage.src = product.Images[0];
        productImage.alt = product.Name;

        let productCardSizes = document.createElement('div');
        productCardSizes.classList.add('card-sizes');
        productCardSizes.innerHTML = '<h4>' + Object.keys(product.Sizes).join(' | ') + '</h4>';

        let productCardBody = document.createElement('div');
        productCardBody.classList.add('card-body');

        let productCardHeader = document.createElement('div');
        productCardHeader.classList.add('card-header', 'flex', 'justify-between', 'align-center');

        let productCardTitle = document.createElement('h3');
        productCardTitle.classList.add('card-title');
        productCardTitle.innerHTML = product.Name;

        let productCardPrice = document.createElement('p');
        productCardPrice.classList.add('card-text', 'card-price', 'text-muted');
        productCardPrice.innerHTML = `€${product.Price / 100}`;

        let productCardButton = document.createElement('button');
        productCardButton.classList.add('btn', 'btn-primary');
        productCardButton.innerHTML = 'Add to cart';

        productCardHeader.appendChild(productCardTitle);
        productCardHeader.appendChild(productCardPrice)
        productCardBody.appendChild(productCardHeader);
        productCardBody.appendChild(productCardCategories);

        productImageContainer.appendChild(productImage);
        productImageContainer.appendChild(productCardSizes);

        productCard.appendChild(productImageContainer);
        productCard.appendChild(productCardBody);
        
        shop.appendChild(productCard);
    }

    const xhr2 = new XMLHttpRequest();
    xhr2.open('GET', 'http://localhost:8081/api/categories');
    xhr2.send();

    xhr2.onload = function() {
        if (xhr2.status === 200) {
            let categories = JSON.parse(xhr2.response);
            let searchedProducts = [];

            for (let category in categories) {
                let dropdownItem = document.createElement('div');
                dropdownItem.classList.add('dropdown-item', 'category-item', 'input-line');

                let dropdownItemInput = document.createElement('input');
                dropdownItemInput.classList.add('input', 'input-checkbox', 'search-category-input');
                dropdownItemInput.setAttribute('type', 'checkbox');
                dropdownItemInput.setAttribute('id', category);

                let dropdownItemLabel = document.createElement('label');
                dropdownItemLabel.setAttribute('for', category);
                dropdownItemLabel.innerHTML = category;

                dropdownItem.appendChild(dropdownItemInput);
                dropdownItem.appendChild(dropdownItemLabel);

                document.querySelector('#search-categories-dropdown').appendChild(dropdownItem);
            }
        
            if (categoryCells.includes(searchCategory) && searchCategory !== null) {
                document.querySelector('.search-category-input#' + searchCategory).checked = true;
                document.querySelector('#search-category-all').checked = false;
                document.querySelector('#search-category-all').disabled = false;

                filterByCategory(document.querySelectorAll('.product-card'), document.querySelector('.search-category-input#' + searchCategory));
            }

            document.querySelectorAll('.product-card').forEach(card => {
                if (card.getAttribute('data-search')) {
                    searchedProducts.push(card);
                }
            });
            
            document.querySelectorAll('.search-category-input').forEach(categoryInput => {
                categoryInput.addEventListener('change', function() {
                    filterByCategory(searchedProducts, categoryInput);
                });
            });
        }
    }
};

function filterByCategory(cards, newCategoryInput = null) {
    let allCategories = [];
    let foundedResults = [];

    if (newCategoryInput !== null) {
        let category = newCategoryInput.getAttribute('id');
        
        if (category === 'search-category-all') {
            document.querySelectorAll('.search-category-input:not(#search-category-all)').forEach(categoryInput => {
                categoryInput.checked = false;
            });

            document.querySelector('.search-input').value = '';
        } else {
            document.querySelector('#search-category-all').checked = false;
            document.querySelector('#search-category-all').disabled = false;
        }
    }
    
    document.querySelectorAll('.search-category-input').forEach(categoryInput => {
        if (categoryInput.checked) {
            allCategories.push(categoryInput.getAttribute('id'));
        }
    });
    
    cards.forEach(productCard => {
        if (newCategoryInput === 'search-category-all' || allCategories[0] === 'search-category-all') {
            productCard.style.display = 'block';
            foundedResults.push(productCard);
        } else {
            let productCategories = [];
            Object.keys(productCard.dataset).forEach(category => {
                productCategories.push(category);
            });

            let checkedCategories = [];
            for (let checkedCategory of allCategories) {
                if (productCategories.includes(checkedCategory.toLowerCase())) {
                    checkedCategories.push(checkedCategory);
                }
            }
            
            if (checkedCategories.length === allCategories.length || newCategoryInput === 'search-category-all' || allCategories.length === 0) {
                productCard.style.display = 'block';
                foundedResults.push(productCard);
            } else {
                productCard.style.display = 'none';
            }
        }
    });
    
    if (foundedResults.length === 0) {
        document.querySelector('.shop-search-no-results').style.display = 'block';
        document.querySelector('#search-category-all').checked = true;
        document.querySelector('#search-category-all').disabled = true;
    } else {
        document.querySelector('.shop-search-no-results').style.display = 'none';
    }

    if (allCategories.length === 0) {
        document.querySelector('#search-category-all').checked = true;
        document.querySelector('#search-category-all').disabled = true;
    } else {
        document.querySelector('#search-category-all').checked = false;
        document.querySelector('#search-category-all').disabled = false;
    }

    let badgeCount = allCategories.includes('search-category-all') ? allCategories.length - 1 : allCategories.length;

    if (badgeCount !== 0) {
        document.querySelector('.search-category-badge').innerHTML = badgeCount;
        document.querySelector('.search-category-badge').style.display = 'flex';
    } else {
        document.querySelector('.search-category-badge').style.display = 'none';
    }
}

document.querySelectorAll('.product-card').forEach(productCard => {
    productCard.addEventListener('click', function() {
        const productID = productCard.getAttribute('data-id');
        console.log(productID);
        window.location.href = `/product.html?id=${productID}`;
    });
});

document.querySelector('.search-input').addEventListener('keyup', function() {
    const searchInput = document.querySelector('.search-input').value.toLowerCase();
    const products = document.querySelectorAll('.product-card');
    let foundedProducts = [];

    for (let product of products) {
        const productName = product.querySelector('.card-title').innerHTML.toLowerCase();
        let productDescription = product.querySelector('.card-text').innerHTML.toLowerCase();
        let productPrice = product.querySelector('.card-price').innerHTML.toLowerCase();
        let searchResult = productName + productDescription + productPrice;
        let found = [];

        if (productName.includes(searchInput)) {
            found.push(productName);
            product.setAttribute('data-search', 'true');
            foundedProducts.push(product);
        } else {
            product.setAttribute('data-search', 'false');
            product.style.display = 'none';
        }

        if (found.length > 0) {
            document.querySelector('.shop-search-no-results').style.display = 'none';
        } else {
            document.querySelector('.shop-search-no-results').style.display = 'block';
        }
    }

    filterByCategory(foundedProducts);
});