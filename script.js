// const fetch = require('node-fetch');

const API_URL = 'https://api.mercadolibre.com/sites/MLB/search?q=computador';

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';
  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

const createItem = (obj) => {
  obj.forEach((element) => {
    const sectionItem = document.querySelector('.items');
    sectionItem.appendChild(createProductItemElement(element));
  });
};

const fetchJoke = () => {
  const myObject = {
    method: 'GET',
    headers: { Accept: 'application/json' },
  };

  fetch(API_URL, myObject)
    .then((response) => response.json())
    // .then((data) => console.log(data.results));
    .then((data) => data.results.map(({ id, title, thumbnail }) => ({
      sku: id,
      name: title,
      image: thumbnail,
     })))
     .then((data) => createItem(data));
};

/* function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
} 

function cartItemClickListener(event) {
  // coloque seu código aqui
}

/* function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
} */ 

window.onload = () => fetchJoke();
