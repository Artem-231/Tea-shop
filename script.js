const cart = [];
const cartList = document.querySelector('#cart-items');
const emptyMessage = document.querySelector('#cart-empty');
const totalOutput = document.querySelector('#cart-total');
const countOutput = document.querySelector('#cart-count');
const checkoutButton = document.querySelector('#checkout-button');
const checkoutSection = document.querySelector('#checkout');
const orderForm = document.querySelector('#order-form');
const orderStatus = document.querySelector('#order-status');
const storageMessage = document.querySelector('#storage-message');
const storageKey = 'tea-shop-cart';
const loadMessage = document.querySelector('#load-message');
const maxPacks = 99;
const orderFields = orderForm.querySelectorAll('input, textarea');


function formatPrice(value) {
  return value.toLocaleString('ru-RU') + ' ₽';
}

document.querySelectorAll('.product-card').forEach(function (card) {
  const button = card.querySelector('[data-action="add"]');
  button.disabled = false;
  button.addEventListener('click', function () {
    const id = card.dataset.productId;
    const existing = cart.find(function (item) {
      return item.id === id;
    });
    if (existing) {
      if (existing.quantity >= maxPacks) return;
      existing.quantity += 1;
    } else {
      cart.push({
        id: id,
        name: card.dataset.name,
        price: Number(card.dataset.price),
        quantity: 1
      });
    }
    renderCart();
  });
});

function removeItem(id) {
  const index = cart.findIndex(function (item) {
    return item.id === id;
  });
  if (index !== -1) {
    cart.splice(index, 1);
  }
  renderCart();
}

function renderCart(saveChanges = true) {
  const focusedId = document.activeElement.id;
  cartList.replaceChildren();
  let total = 0;
  let count = 0;
  let grams = 0;

  cart.forEach(function (item) {
    total += item.price * item.quantity;
    count += item.quantity;
    const product = document.querySelector('[data-product-id="' + item.id + '"]');
    grams += Number(product.dataset.grams) * item.quantity;

    const row = document.createElement('li');
    row.className = 'cart-row';
    const name = document.createElement('p');
    name.textContent = item.name + ' — ' + formatPrice(item.price) + ' за шт.';
    const controls = document.createElement('div');
    controls.className = 'cart-controls';
    const minus = document.createElement('button');
    minus.type = 'button';
    minus.id = 'minus-' + item.id;
    minus.textContent = '−';
    minus.disabled = item.quantity === 1;
    minus.setAttribute('aria-label', 'Уменьшить количество: ' + item.name);
    const quantity = document.createElement('span');
    quantity.textContent = item.quantity + ' шт.';
    const plus = document.createElement('button');
    plus.type = 'button';
    plus.id = 'plus-' + item.id;
    plus.textContent = '+';
    plus.disabled = item.quantity >= maxPacks;
    plus.setAttribute('aria-label', 'Увеличить количество: ' + item.name);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.id = 'remove-' + item.id;
    remove.textContent = 'Удалить';
    remove.setAttribute('aria-label', 'Удалить: ' + item.name);
    const subtotal = document.createElement('p');
    subtotal.textContent = 'Сумма: ' + formatPrice(item.price * item.quantity);

    minus.addEventListener('click', function () {
      item.quantity -= 1;
      renderCart();
    });
    plus.addEventListener('click', function () {
      if (item.quantity >= maxPacks) return;
      item.quantity += 1;
      renderCart();
    });
    remove.addEventListener('click', function () {
      removeItem(item.id);
    });
    controls.append(minus, quantity, plus, remove);
    row.append(name, controls, subtotal);
    cartList.append(row);
  });

  emptyMessage.hidden = cart.length > 0;
  cartList.hidden = cart.length === 0;
  totalOutput.textContent = formatPrice(total);
  countOutput.textContent = count;
  document.querySelector('#cart-weight').textContent = grams + ' г';
  checkoutButton.disabled = cart.length === 0;
  if (cart.length === 0) checkoutSection.hidden = true;
  orderStatus.textContent = '';
  if (saveChanges) saveCart();
  const focusedButton = document.getElementById(focusedId);
  if (focusedButton && !focusedButton.disabled) {
    focusedButton.focus();
  } else if (focusedId.startsWith('minus-')) {
    document.getElementById(focusedId.replace('minus-', 'plus-')).focus();
  } else if (focusedId.startsWith('plus-')) {
    document.getElementById(focusedId.replace('plus-', 'minus-')).focus();
  } else if (focusedId.startsWith('remove-')) {
    document.querySelector('.catalog__item:not([hidden]) [data-action="add"]').focus();
  }
}

function saveCart() {
  try {
    const saved = cart.map(function (item) {
      return { id: item.id, quantity: item.quantity };
    });
    localStorage.setItem(storageKey, JSON.stringify(saved));
    storageMessage.textContent = '';
  } catch (error) {
    console.warn('Не удалось записать чайную корзину:', error);
    storageMessage.textContent = 'Корзина работает, но после обновления изменения могут потеряться.';
  }
}

function loadCart() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch (error) {
    console.warn('Не удалось прочитать чайную корзину:', error);
    loadMessage.textContent = 'Сохранённую корзину прочитать не удалось. Выберите чай заново.';
    return;
  }
  if (!Array.isArray(saved)) {
    loadMessage.textContent = 'Неверный формат сохранённой корзины. Начните новый заказ.';
    return;
  }
  let skipped = 0;
  saved.forEach(function (entry) {
    const card = Array.from(document.querySelectorAll('.product-card')).find(function (product) {
      return entry && entry.id === product.dataset.productId;
    });
    const duplicate = entry && cart.some(function (item) { return item.id === entry.id; });
    if (!card || duplicate || !Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > maxPacks) {
      skipped += 1;
      return;
    }
    cart.push({ id: entry.id, name: card.dataset.name, price: Number(card.dataset.price), quantity: entry.quantity });
  });
  if (skipped > 0) loadMessage.textContent = 'Некоторые позиции не восстановлены: неизвестный товар или неверное количество.';
}

checkoutButton.addEventListener('click', function () {
  if (cart.length === 0) return;
  checkoutSection.hidden = false;
  orderStatus.textContent = '';
  document.querySelector('#first-name').focus();
});

orderFields.forEach(function (field) {
  field.addEventListener('input', function () {
    field.setCustomValidity('');
  });
});
function validateOrder() {
  orderFields.forEach(function (field) {
    field.value = field.value.trim();
    field.setCustomValidity(field.value ? '' : 'Заполните поле.');
  });
  return orderForm.reportValidity();
}

orderForm.addEventListener('submit', function (event) {
  event.preventDefault();
  if (cart.length === 0) return;
  if (!validateOrder()) return;
  cart.length = 0;
  renderCart();
  orderForm.reset();
  orderStatus.textContent = 'Заказ создан!';
  orderStatus.focus();
});

loadCart();
renderCart(false);

document.querySelector('#tea-kind').addEventListener('change', function (event) {
  let visible = 0;
  document.querySelectorAll('.product-card').forEach(function (card) {
    const matches = event.target.value === 'all' || card.dataset.kind === event.target.value;
    card.closest('li').hidden = !matches;
    if (matches) visible += 1;
  });
  document.querySelector('#catalog-result').textContent = 'Показано: ' + visible;
});
