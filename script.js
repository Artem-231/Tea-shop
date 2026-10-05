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

function renderCart() {
  const focusedId = document.activeElement.id;
  cartList.replaceChildren();
  let total = 0;
  let count = 0;

  cart.forEach(function (item) {
    total += item.price * item.quantity;
    count += item.quantity;

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
  checkoutButton.disabled = cart.length === 0;
  if (cart.length === 0) checkoutSection.hidden = true;
  orderStatus.textContent = '';
  saveCart();
  const focusedButton = document.getElementById(focusedId);
  if (focusedButton && !focusedButton.disabled) {
    focusedButton.focus();
  } else if (focusedId.startsWith('minus-')) {
    document.getElementById(focusedId.replace('minus-', 'plus-')).focus();
  } else if (focusedId.startsWith('remove-')) {
    document.querySelector('[data-action="add"]').focus();
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
    storageMessage.textContent = 'Не удалось сохранить корзину в этом браузере.';
  }
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(saved)) return;
    // Названия и цены берём из каталога, а не из сохранённых данных.
    document.querySelectorAll('.product-card').forEach(function (card) {
      const item = saved.find(function (entry) {
        return entry && entry.id === card.dataset.productId;
      });
      const price = Number(card.dataset.price);
      if (item && Number.isSafeInteger(item.quantity) && item.quantity > 0 &&
          Number.isSafeInteger(item.quantity * price)) {
        cart.push({
          id: card.dataset.productId,
          name: card.dataset.name,
          price: price,
          quantity: item.quantity
        });
      }
    });
  } catch (error) {
    cart.length = 0;
  }
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
renderCart();
