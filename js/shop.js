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

    for (var productID in products) {
        const product = products[productID];

        const productCard = document.createElement('a');
        productCard.classList.add('card', 'product-card', 'col-3');
        productCard['href'] = `product.html?id=${productID}`;

        const productImage = document.createElement('img');
        productImage.classList.add('card-image');
        productImage.src = "/img/" + product.Image;
        productImage.alt = product.Name;

        const productCardBody = document.createElement('div');
        productCardBody.classList.add('card-body');

        const productCardHeader = document.createElement('div');
        productCardHeader.classList.add('card-header', 'flex', 'justify-between', 'align-center');

        const productCardTitle = document.createElement('h3');
        productCardTitle.classList.add('card-title');
        productCardTitle.innerHTML = product.Name;

        const productCardText = document.createElement('p');
        productCardText.classList.add('card-text');
        productCardText.innerHTML = product.Description;

        const productCardPrice = document.createElement('p');
        productCardPrice.classList.add('card-text', 'card-price', 'text-muted');
        productCardPrice.innerHTML = `€${product.Price / 100}`;

        const productCardButton = document.createElement('button');
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
};

document.querySelectorAll('.product-card').forEach(productCard => {
    productCard.addEventListener('click', function() {
        const productID = productCard.getAttribute('data-id');
        console.log(productID);
        window.location.href = `/product.html?id=${productID}`;
    });
});