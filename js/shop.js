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

fetch('http://localhost:8081/api/products')
.then(response => response.json())
.then(products => {
    let searchCategory = new URLSearchParams(window.location.search).get('category');
    let categoryCells = []

    for (var productID in products) {
        const product = products[productID];

        let sizes = Object.keys(product.Sizes).map(size => parseInt(product.Sizes[size].Stock));
        if (sizes.every(size => size === 0)) continue;

        let productCard = createItem(product, productID);
        shop.appendChild(productCard);
    }

    fetch('http://localhost:8081/api/categories')
    .then(response => response.json())
    .then(categories => {
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
    });
});

function createItem(product, productID) {
    let productItem = document.createElement('a');
    productItem.classList.add('card', 'product-card');
    productItem.setAttribute('data-search', 'true');
    productItem['href'] = `product.html?id=${productID}`;

    let productItemHTML = `
    <div class="card-image-container">
        <img class="card-image" src="${product.Images[0]}" alt="${product.Name}">
        
        <div class="card-sizes">
            <h4>${sortSizes(Object.keys(product.Sizes)).join(' | ')}</h4>
        </div>
    </div>
    
    <div class="card-body">
        <div class="card-header flex justify-between align-center">
            <h3 class="card-title">${product.Name}</h3><p class="card-text card-price text-muted">€${(product.Price / 100).toFixed(2)}</p>
        </div>
        
        <div class="card-categories">
        </div>
    </div>
    `;

    productItem.innerHTML = productItemHTML;

    if (product.Categories !== undefined) {
        Object.keys(product.Categories).forEach(category => {
            productItem.setAttribute(`data-${category}`, product.Categories[category])

            let productItemCategoryHTML = `<div class="product-category" style="background-color: #${product.Categories[category]}"><span>${category}</span></div>`;
            productItem.querySelector('.card-categories').innerHTML += productItemCategoryHTML;
        });
    }

    if (product.SalePercent !== undefined) {
        let productCardSalePercent = document.createElement('h3');
        productCardSalePercent.classList.add('card-sale-percent');
        productCardSalePercent.innerHTML = `-${product.SalePercent}%`;

        productItem.querySelector('.card-body').appendChild(productCardSalePercent);
        productItem.querySelector('.card-price').classList.add('card-sale-price');
    }

    return productItem;
}

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
        document.querySelector('.search-category-badge').style.display = 'flex';
    } else {
        document.querySelector('.search-category-badge').style.display = 'none';
    }
}

function sortSizes(sizes) {
    let sizesValues = {
        "XS": "1",
        "S": "2",
        "M": "3",
        "L": "4",
        "XL": "5",
        "XXL": "6"
    }
    let sortedSizes = [];
    let sizesConverted = sizes.map(size => sizesValues[size]);

    sizesConverted.sort((a, b) => a - b);
    sortedSizes = sizesConverted.map(size => Object.keys(sizesValues).find(key => sizesValues[key] === size));

    return sortedSizes;
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