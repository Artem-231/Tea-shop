// Корзина
const cart = [];
const cartList = document.querySelector('#cart-items');
const emptyMessage = document.querySelector('#cart-empty');
const totalOutput = document.querySelector('#cart-total');
const countOutput = document.querySelector('#cart-count');

function formatPrice(value) {
  return value.toLocaleString('ru-RU') + ' ₽';
}

// Данные товара берём из атрибутов его карточки
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
    minus.textContent = '−';
    minus.disabled = item.quantity === 1;
    minus.setAttribute('aria-label', 'Уменьшить количество: ' + item.name);
    const quantity = document.createElement('span');
    quantity.textContent = item.quantity + ' шт.';
    const plus = document.createElement('button');
    plus.type = 'button';
    plus.textContent = '+';
    plus.setAttribute('aria-label', 'Увеличить количество: ' + item.name);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Удалить';
    remove.setAttribute('aria-label', 'Удалить: ' + item.name);
    const subtotal = document.createElement('p');
    subtotal.textContent = 'Сумма: ' + formatPrice(item.price * item.quantity);

    // При изменении количества обновляем строку и общую сумму
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
}

renderCart();
