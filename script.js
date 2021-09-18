// const fetch = require('node-fetch');

const API_URL_CATEGORIA = 'https://api.mercadolibre.com/sites/MLB/search?q=computador';
const API_URL_ITEM = 'https://api.mercadolibre.com/items/';

const totalPriceClass = '.total-price';
const classCartItem = '.cart__items';

const myObject = {
  method: 'GET',
  headers: { Accept: 'application/json' },
};

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

const loadPrice = () => {
  const priceAtual = document.querySelector(totalPriceClass);
  if (localStorage.length > 0) {
   priceAtual.innerHTML = localStorage.getItem(localStorage.length);
  }
};

const removeSaveAll = () => {
  localStorage.clear();
};

const saveShop = () => {
  const local = document.querySelectorAll('.cart__item');
  const priceAtual = document.querySelector(totalPriceClass);
  removeSaveAll();
  for (let index = 0; index < local.length; index += 1) {
    const data = {
      class: local[index].className,
      text: local[index].innerText,      
    };
    localStorage.setItem(index, JSON.stringify(data));
  }
  localStorage.setItem(localStorage.length + 1, priceAtual.innerHTML);
  if (localStorage.length === 1) removeSaveAll();
};

/* function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
} */

const sumPrice = (price, operador) => {
  const priceAtual = document.querySelector(totalPriceClass);
  let sum = 0;
  if (operador === '+') {
    sum = parseFloat(priceAtual.innerHTML, 10) + price;
  } else {
    sum = parseFloat(priceAtual.innerHTML, 10) - price;
  }
  priceAtual.innerHTML = sum;
  console.log(sum);
};

function cartItemClickListener(event) {
  const delet = event.target;
  const removePrice = parseFloat(delet.innerText.split('$')[1]);
  sumPrice(removePrice, '-');
  delet.remove();
  saveShop();
}

const loadShop = () => {  
  const sectionItemCart = document.querySelector(classCartItem);  
  for (let index = 0; index < localStorage.length - 1; index += 1) {
    const data = JSON.parse(localStorage.getItem(index));
    const li = document.createElement('li');
    li.className = data.class;
    li.innerText = data.text;
    li.addEventListener('click', cartItemClickListener);
    sectionItemCart.appendChild(li);
  }
  loadPrice();
};

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

const createItemCart = (obj) => {  
  const sectionItemCart = document.querySelector(classCartItem);
  sectionItemCart.appendChild(createCartItemElement(obj));
  const { salePrice } = obj;
  sumPrice(salePrice, '+');
  saveShop();
};

const fetItem = (url) => {
 fetch(url, myObject)
  .then((response) => response.json())
  .then(({ id, title, price }) => ({
    sku: id,
    name: title,
    salePrice: price,
   }))
   .then((data) => createItemCart(data));
};

const btnCart = () => {
  const btnAddCart = document.querySelectorAll('.item__add');
  btnAddCart.forEach((btn) => {
    btn.addEventListener('click', async (event) => {
      const idItem = event.target.parentNode.firstChild.innerText;
      const url = `${API_URL_ITEM}${idItem}`;
      fetItem(url);
    });
  });
};

const btnEmpty = () => {
  const btn = document.querySelector('.empty-cart');
  const priceAtual = document.querySelector(totalPriceClass);
  btn.addEventListener('click', () => {
    const sectionItemCart = document.querySelector('.cart__items');
    while (sectionItemCart.firstChild) {
      sectionItemCart.firstChild.remove();
    }
    priceAtual.innerHTML = '0';
    removeSaveAll();
  });
};

const fetCategoria = (url) => {
  fetch(url, myObject)
  .then((response) => response.json())
  .then((data) => data.results.map(({ id, title, thumbnail }) => ({
    sku: id,
    name: title,
    image: thumbnail,
   })))
   .then((data) => createItem(data))
   .then(() => btnCart());
};

window.onload = () => {  
  fetCategoria(API_URL_CATEGORIA);
  loadShop();
  btnEmpty();
};
