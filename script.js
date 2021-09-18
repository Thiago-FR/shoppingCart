// const fetch = require('node-fetch');

const API_URL_CATEGORIA = 'https://api.mercadolibre.com/sites/MLB/search?q=';
const API_URL_ITEM = 'https://api.mercadolibre.com/items/';

const totalPriceClass = '.total-price';
const classCartItem = '.cart__items';

const loadingItem = (active) => {
  const cart = document.querySelector('.cart');
  if (!active) cart.lastChild.remove();
  if (active) {
    const loading = document.createElement('p');
    loading.className = 'loading';
    loading.innerHTML = 'loading';
    cart.appendChild(loading);
  }
};

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
  loadingItem(false);
};

const loadPrice = () => {
  const priceAtual = document.querySelector(totalPriceClass);
  if (localStorage.length > 0) {
   priceAtual.innerHTML = localStorage.getItem(localStorage.length);
  }
};

const removeSaveAll = () => {
  const priceAtual = document.querySelector(totalPriceClass);
  if (localStorage.length === 1) priceAtual.innerHTML = '0';
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

const sumPrice = (price, operador) => {
  const priceAtual = document.querySelector(totalPriceClass);
  let sum = 0;
  if (operador === '+') {
    sum = parseFloat(priceAtual.innerHTML) + price;
  } else {
    sum = parseFloat(priceAtual.innerHTML) - price;
  }
  priceAtual.innerHTML = sum;
  // priceAtual.innerHTML = sum.toFixed(2);
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
  loadingItem(false);
  const sectionItemCart = document.querySelector(classCartItem);
  sectionItemCart.appendChild(createCartItemElement(obj));
  const { salePrice } = obj;
  sumPrice(salePrice, '+');
  saveShop();
};

const fetItem = async (url) => {
 fetch(url)
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

      const timeout = () => new Promise((resolve) => 
      setTimeout(() => resolve(fetItem(url)), 0));
      const startCart = async () => {
      await timeout();     
      };
      loadingItem(true);
      startCart();
    });
  });
};

const btnEmpty = () => {
  const btn = document.querySelector('.empty-cart');
  const priceAtual = document.querySelector(totalPriceClass);
  btn.addEventListener('click', () => {
    const sectionItemCart = document.querySelector(classCartItem);
    while (sectionItemCart.firstChild) {
      sectionItemCart.firstChild.remove();
    }
    priceAtual.innerHTML = '0';
    removeSaveAll();
  });
};

const fetCategoria = async (url, categoria) => {
  const search = `${url}${categoria}`;
  fetch(search)
  .then((response) => response.json())
  .then((data) => data.results.map(({ id, title, thumbnail }) => ({
    sku: id,
    name: title,
    image: thumbnail,
   })))
   .then((data) => createItem(data))
   .then(() => btnCart());
};

const timeout = (item) => new Promise((resolve) => 
    setTimeout(() => resolve(fetCategoria(API_URL_CATEGORIA, item)), 1000));

const removeItemAll = async () => {
  const section = document.querySelector('.items');
  while (section.firstChild) {
    section.firstChild.remove();
  }
};

const searchItem = () => {
  const input = document.getElementById('input');
  const btnInput = document.getElementById('btn-input');
  btnInput.addEventListener('click', () => {
    const start = async () => {
      loadingItem(true);
      await removeItemAll();      
      await timeout(input.value);
    };
    start();
  });
};

// Utilizado conteúdo do stackoverflow para consulta sobre async e await
// link https://stackoverflow.com/questions/33289726/combination-of-async-function-await-settimeout
window.onload = () => {  
    const start = async () => {
      loadingItem(true);
      await timeout('computador');    
      loadShop();  
      btnEmpty();
      searchItem();
    };  
  start();  
};
