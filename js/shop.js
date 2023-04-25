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

    const searchCategory = new URLSearchParams(window.location.search).get('category');
    let categoryCells = []

    for (var productID in products) {
        const product = products[productID];

        if (searchCategory && (product['Categories'] === undefined || product['Categories'][searchCategory] === undefined)) {
            continue;
        }
        
        if (!categoryCells.includes(searchCategory)) {
            let productCategory = document.createElement('div');
            productCategory.classList.add('product-category');
            productCategory.style.backgroundColor = '#' + product.Categories[searchCategory];
            productCategory.setAttribute('data-color-id', product.Categories[searchCategory]);
    
            let productCategoryLabel = document.createElement('span');
            productCategoryLabel.innerHTML = searchCategory;

            let productCategoryDelete = document.createElement('span');
            productCategoryDelete.classList.add('product-category-delete');
            productCategoryDelete.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    
            productCategory.appendChild(productCategoryLabel);
            productCategory.appendChild(productCategoryDelete);

    
            document.querySelector('.search-categories').appendChild(productCategory);

            categoryCells.push(searchCategory);
        }

        let productCard = document.createElement('a');
        productCard.classList.add('card', 'product-card', 'col-3');
        productCard.setAttribute('data-search', 'true');
        productCard['href'] = `product.html?id=${productID}`;

        if (product.Categories !== undefined) {
            Object.keys(product.Categories).forEach(category => {
                productCard.setAttribute(`data-${category}`, product.Categories[category])
            });
        }

        let productImage = document.createElement('img');
        productImage.classList.add('card-image');
        productImage.src = product.Images[0];
        productImage.alt = product.Name;

        let productCardBody = document.createElement('div');
        productCardBody.classList.add('card-body');

        let productCardHeader = document.createElement('div');
        productCardHeader.classList.add('card-header', 'flex', 'justify-between', 'align-center');

        let productCardTitle = document.createElement('h3');
        productCardTitle.classList.add('card-title');
        productCardTitle.innerHTML = product.Name;

        let productCardText = document.createElement('p');
        productCardText.classList.add('card-text');
        productCardText.innerHTML = product.Description;

        let productCardPrice = document.createElement('p');
        productCardPrice.classList.add('card-text', 'card-price', 'text-muted');
        productCardPrice.innerHTML = `€${product.Price / 100}`;

        let productCardButton = document.createElement('button');
        productCardButton.classList.add('btn', 'btn-primary');
        productCardButton.innerHTML = 'Add to cart';

        productCardHeader.appendChild(productCardTitle);
        productCardHeader.appendChild(productCardPrice)
        productCardBody.appendChild(productCardHeader);
        productCardBody.appendChild(productCardText);

        productCard.appendChild(productImage);
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