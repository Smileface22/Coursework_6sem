// Открыть модальное окно для добавления товара
function openAddProductForm() {
    const modal = document.getElementById("product-modal");
    modal.style.display = "flex";

    // Очистить форму
    document.getElementById("product-form").reset();
    document.getElementById("modal-title").textContent = "Добавить товар";

    // Обработчик отправки формы
    document.getElementById("product-form").addEventListener("submit", async function(event) {
        event.preventDefault(); // Останавливаем обычную отправку формы

        const form = document.getElementById("product-form");
        const formData = new FormData(form);

        // Преобразование данных формы в объект JSON
        const productData = {
            name: formData.get("product-name"),
            description: formData.get("product-description"),
            purchasePrice: parseFloat(formData.get("purchase-price")),
            sellingPrice: parseFloat(formData.get("sale-price")),
            category: formData.get("category") ? { id: formData.get("category") } : null
        };

        // Отправка данных на сервер
        fetch('/inventory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        })
        .then(response => {
            if (response.ok) {
                alert('Продукт успешно добавлен!');
                closeModal();
                window.location.reload(); // Закрыть модальное окно после успешной отправки
            } else {
                alert('Ошибка при добавлении продукта. Пожалуйста, попробуйте еще раз.');
            }
        })
        .catch(error => {
            console.error('Ошибка при отправке формы:', error);
            alert('Произошла ошибка при отправке данных. Пожалуйста, попробуйте еще раз.');
        });
    });
}

// редактировать продукт
function editProduct(productId) {
    // Получение данных продукта с сервера
    fetch(`/inventory/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных продукта');
            }
            return response.json();
        })
        .then(product => {
                // Заполняем форму данными из ответа
                document.getElementById("product-name").value = product.name;
                document.getElementById("product-description").value = product.description;
                document.getElementById("category").value = product.category ? product.category.id : '';
                document.getElementById("purchase-price").value = product.purchasePrice;
                document.getElementById("sale-price").value = product.sellingPrice;

                // Открываем форму для редактирования
                const modal = document.getElementById("product-modal");
                modal.style.display = "flex";
                document.getElementById("modal-title").textContent = "Редактировать товар";
            })
            .catch(error => {
                console.error('Ошибка при редактировании продукта:', error);
                alert('Ошибка при загрузке данных продукта. Попробуйте позже.');
            });

        // Обработчик отправки формы
        document.getElementById("product-form").onsubmit = function(event) {
            event.preventDefault(); // Останавливаем обычную отправку формы

            const form = document.getElementById("product-form");
            // Сбор данных из формы
            const formData = new FormData(form);
            const updatedProduct = {
                name: formData.get("product-name"),
                description: formData.get("product-description"),
                purchasePrice: parseFloat(formData.get("purchase-price")) || 0,
                sellingPrice: parseFloat(formData.get("sale-price")) || 0,
                category: formData.get("category") ? { id: parseInt(formData.get("category")) } : null
            };
            console.log('Отправляемые данные:', JSON.stringify(updatedProduct));
            // Отправка обновленных данных на сервер
            fetch(`/inventory/${productId}/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedProduct)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка при сохранении данных продукта');
                }
                alert('Продукт успешно обновлен!');
                closeModal()  // Закрываем модальное окно
                window.location.reload();
            })
            .catch(error => {
                console.error('Ошибка при обновлении продукта:', error);
                alert('Ошибка при отправке данных. Попробуйте еще раз.');
            });
        };
}

// Закрыть модальное окно
function closeModal() {
    const modal = document.getElementById("product-modal");
    modal.style.display = "none";
}