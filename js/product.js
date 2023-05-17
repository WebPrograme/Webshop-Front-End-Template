import { Cart, Favorites } from "./account.js";

const productID = window.location.search.split('?id=')[1];

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

fetch(`http://localhost:8081/api/products/${productID}`)
.then(response => response.json())
.then(product => {
    let productTitle = document.querySelector('.product-title');
    productTitle.innerHTML = product.Name;

    let productPrice = document.querySelector('.product-price');
    productPrice.innerHTML = `€${parseFloat(product.Price / 100).toFixed(2)}`;
    if (product.SalePercent != undefined) {
        productPrice.classList.add('product-price-sale');
        
        document.querySelector('.product-price-sale-old').innerHTML = `<span>€${parseFloat(product.SaleOldPrice / 100).toFixed(2)}</span> <span class="product-price-sale-old-percent">-${product.SalePercent}%</span>`;
    }

    let productDescription = document.querySelector('.product-description p');
    productDescription.innerHTML += product.Description;
    
    let productImage = document.querySelector('.product-image-main');
    productImage.src = product.Images[0];
    productImage.alt = product.Name;

    let productImageCarousel = document.querySelector('.product-image-carousel');

    let productImageCarouselItem = document.createElement('div');
    productImageCarouselItem.classList.add('product-image-carousel-item');

    for (let image of product.Images) {
        let productImageCarouselItem = document.createElement('div');
        productImageCarouselItem.classList.add('product-image-carousel-item');

        let productImageCarouselItemImage = document.createElement('img');
        productImageCarouselItemImage.classList.add('product-image-carousel-item-image');
        productImageCarouselItemImage.src = image;
        productImageCarouselItemImage.alt = product.Name;
        productImageCarouselItemImage.setAttribute('data-product-id', productID);
    
        productImageCarouselItem.appendChild(productImageCarouselItemImage);
        productImageCarousel.appendChild(productImageCarouselItem);
    }

    document.querySelector('.product-image-carousel-item-image').classList.add('product-image-carousel-item-image-active');

    let productSizesSelect = document.querySelector('.product-sizes-select');
    let sortedSizes = sortSizes(Object.keys(product.Sizes));
    
    for (let size of sortedSizes) {
        if (product.Sizes[size]["Stock"] > 0) {
            let option = document.createElement('option');
            option.value = size;
            option.innerHTML = size;
            productSizesSelect.appendChild(option);
        }
    }

    for (let category of Object.keys(product.Categories)) {
        let productCategory = document.createElement('a');
        productCategory.classList.add('product-category');
        productCategory.style.backgroundColor = '#' + product.Categories[category];
        productCategory.setAttribute('data-color-id', product.Categories[category]);
        productCategory.setAttribute('href', '/pages/shop.html?category=' + category);

        let productCategoryLabel = document.createElement('span');
        productCategoryLabel.innerHTML = category;

        productCategory.appendChild(productCategoryLabel);

        document.querySelector('.product-categories-list').appendChild(productCategory);
    }

    let productAddToCart = document.querySelector('.product-add-to-cart');
    let productAddToFavorites = document.querySelector('.product-add-to-favorites');
    let productImageCarouselItemImages = document.querySelectorAll('.product-image-carousel-item-image');
    let accountID = localStorage.getItem('accountID');

    if (accountID) {
        productAddToCart.innerHTML = 'Add to Cart';
    } else {
        productAddToCart.innerHTML = 'Login to Add to Cart';
    }

    productAddToCart.setAttribute('data-product-id', productID);
    productAddToFavorites.setAttribute('data-product-id', productID);

    productAddToCart.addEventListener('click', function() {
        if (accountID && productSizesSelect.value !== "Select a Size") {
            new Cart().addProduct(productID, productSizesSelect.value, product, accountID);
        }
    });

    productAddToFavorites.addEventListener('click', function() {
        if (accountID) {
            new Favorites().addProduct(productID, product, accountID);
        }
    });

    productSizesSelect.addEventListener('change', function() {
        if (productSizesSelect.value !== "Select a Size") {
            productAddToCart.removeAttribute('disabled');
        } else {
            productAddToCart.setAttribute('disabled', 'disabled');
        }
    });

    productImageCarouselItemImages.forEach(image => {
        image.addEventListener('click', function() {
            productImage.src = image.src;
            productImage.alt = image.alt;

            let activeImage = document.querySelector('.product-image-carousel-item-image-active');
            activeImage.classList.remove('product-image-carousel-item-image-active');

            image.classList.add('product-image-carousel-item-image-active');
        });
    });
});

function setProductWidth() {
    let product = document.querySelector('.product');

    if (mediaQueryBody.matches) {
        product.parentElement.classList.replace('col-10', 'col-12');
    } else {
        product.parentElement.classList.replace('col-12', 'col-10');
    }

    if (mediaQueryProduct.matches) {
        product.classList.replace('col-10', 'col-12');
    } else {
        product.classList.replace('col-12', 'col-10');
    }
}

const mediaQueryBody = window.matchMedia('(max-width: 1200px)');
const mediaQueryProduct = window.matchMedia('(max-width: 1500px)');

setProductWidth();

mediaQueryBody.addEventListener('change', function() {
    setProductWidth();
});

mediaQueryProduct.addEventListener('change', function() {
    setProductWidth();
});