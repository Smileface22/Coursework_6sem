function viewOrderDetails(orderId) {
    // Запрос на сервер для получения деталей заказа
    fetch(`/orders/${orderId}/`)
        .then(response => response.json())  // Парсим ответ как JSON
        .then(data => {
            if (data && data.products) {
                const detailsTable = document.getElementById("order-details-body");
                detailsTable.innerHTML = ""; // Очистить старые данные

                // Заполняем таблицу деталями заказа
                data.products.forEach(item => {
                    const row = `
                        <tr>
                            <td>${item.productName}</td>
                            <td>${item.quantity}</td>
                            <td>${item.price}</td>
                        </tr>`;
                    detailsTable.insertAdjacentHTML('beforeend', row);
                });

                document.getElementById("order-details").style.display = "block";  // Показываем модальное окно с деталями
            } else {
                alert("Заказ не найден.");
            }
        })
        .catch(error => {
            console.error('Error fetching order details:', error);
            alert("Ошибка при загрузке данных.");
        });
}


function closeOrderDetails() {
    document.getElementById("order-details").style.display = "none";
}

// обновить статус заказа
function updateOrderStatus(id, newStatus) {
    // Отправляем запрос на сервер
    fetch(`/orders/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newStatus) // Передаем словарь в JSON-формате
    })
    .then(response => {
        if (response.ok) {
            alert('Статус заказа успешно добавлен!');
            window.location.reload(); 
            return response.text();
        } else {
            alert('Ошибка при обновлении статуса заказа. Пожалуйста, попробуйте еще раз.');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка');
    });
}



// Открыть модальное окно для добавления заказа
function openAddOrderForm() {
    document.getElementById("modal-title").textContent = "Добавить заказ";
    document.getElementById("order-form").reset(); // Очищаем форму
    document.getElementById("order-modal").style.display = "flex";

    // Установить обработчик для формы добавления
    document.getElementById("order-form").onsubmit = function(event) {
        event.preventDefault(); // предотвращаем стандартное поведение формы (перезагрузку страницы)

        // Получаем данные из формы
        const form = document.getElementById("order-form");
        const productSelects = form.querySelectorAll('.product-select');
        const quantityInputs = form.querySelectorAll('.product-quantity');

        let productIds = [];
        let quantities = [];

        productSelects.forEach((select, index) => {
            productIds.push(select.value);  // id выбранного товара
            quantities.push(quantityInputs[index].value);  // количество товара
        });

        // Получаем общую сумму из формы
        const totalAmount = document.getElementById('total-sum').innerText
            .replace('Общая сумма: ', '')
            .replace(' р.', '')
            .replace(/\s+/g, '');  // Убираем все пробелы

        // Создаём объект FormData для отправки через POST
        const formData = new FormData();
        productIds.forEach((productId, index) => {
            formData.append('productIds', productId);
            formData.append('quantities', quantities[index]);
        });
        formData.append('totalAmount', totalAmount);

        // Отправляем данные на сервер
        fetch('/orders/create', {
            method: 'POST',
            body: formData    // Используем FormData для отправки данных
        })
        .then(response => {
            if (response.ok) {
                alert('Заказ успешно добавлен!');
                closeModal();
                window.location.reload(); 
                return response.text();
            } else {
                alert('Ошибка при добавлении заказа. Пожалуйста, попробуйте еще раз.');
            }
        })
        .catch(error => {
            alert('Ошибка: ' + error.message);  // Выводим ошибку, если что-то пошло не так
        });
    };
}



// Закрыть модальное окно
function closeModal() {
    document.getElementById("order-modal").style.display = "none";
}

// Создать новый заказ
function createNewOrder(event) {
    event.preventDefault();

    // Получить данные из формы
    const date = document.getElementById("order-date").value;
    const products = document.getElementById("order-products").value;
    const total = document.getElementById("order-total").value;

    // Пример добавления нового заказа (на месте)
    console.log(`Создание заказа: дата=${date}, товары=${products}, сумма=${total}`);

    // Закрыть модальное окно
    closeNewOrderModal();

    // Можно сделать запрос на сервер для сохранения заказа
}

// Функция для добавления нового блока товара
function addProduct() {
    const productList = document.getElementById('product-list');

    // Получаем список товаров из существующего селекта
    const existingSelect = document.querySelector('.product-select');
    const optionsHtml = existingSelect ? existingSelect.innerHTML : '';

    // Создаём новый блок товара
    const newProductItem = document.createElement('div');
    newProductItem.classList.add('product-item');
    newProductItem.innerHTML = `
        <select name="product[]" class="product-select" onchange="updatePriceAndTotal(this)" required>
            ${optionsHtml}
        </select>
        <input type="number" name="quantity[]" class="product-quantity" placeholder="Количество" min="1" onchange="updatePriceAndTotal(this)" required>
        <span class="product-price">Цена: — руб.</span>
        <button type="button" class="remove-product" onclick="removeProduct(this)">Удалить</button>
    `;

    // Добавляем новый блок в список
    productList.appendChild(newProductItem);
}


// Функция для обновления цены товара
function updatePriceAndTotal(element) {
    const productItem = element.closest('.product-item'); // Найти родительский элемент
    const select = productItem.querySelector('.product-select'); // Выпадающий список товаров
    const quantityInput = productItem.querySelector('.product-quantity'); // Поле количества
    const priceSpan = productItem.querySelector('.product-price'); // Элемент для отображения цены

    // Получаем данные
    const price = parseFloat(select.options[select.selectedIndex].dataset.price) || 0; // Закупочная цена
    const quantity = parseInt(quantityInput.value) || 0;

    // Вычисляем стоимость
    const totalPrice = price * quantity;

    // Обновляем отображение цены
    priceSpan.textContent = `Цена: ${totalPrice.toLocaleString()} р.`;

    // Обновляем общую сумму
    updateTotalSum();
}

// Функция для пересчёта общей суммы заказа
function updateTotalSum() {
    let totalSum = 0;
    const productItems = document.querySelectorAll('.product-item');

    productItems.forEach(item => {
        const select = item.querySelector('.product-select');
        const quantityInput = item.querySelector('.product-quantity');
        const price = parseFloat(select.options[select.selectedIndex]?.dataset.price) || 0;
        const quantity = parseInt(quantityInput.value) || 0;

        totalSum += price * quantity;
    });

    // Отображение общей суммы
    const totalSumElement = document.getElementById('total-sum');
    totalSumElement.textContent = `Общая сумма: ${totalSum.toLocaleString()} р.`;
}

// Функция для удаления блока товара
function removeProduct(button) {
    const productItem = button.closest('.product-item');
    productItem.remove();
    updateTotalSum();
}


