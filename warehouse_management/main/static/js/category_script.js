// Открыть модальное окно для добавления категории
function openAddCategoryForm() {
    document.getElementById("modal-title").textContent = "Добавить категорию";
    document.getElementById("category-name").value = "";
    document.getElementById("category-description").value = "";
    document.getElementById("category-modal").style.display = "flex";

    // Установить обработчик для формы добавления
    document.getElementById("category-form").onsubmit = function(event) {
        event.preventDefault();
        const categoryName = document.getElementById("category-name").value;
        const categoryDescription = document.getElementById("category-description").value;

        const data = {
            name: categoryName,
            description: categoryDescription
        };

        fetch('/category', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                return response.text().then(text => { throw new Error(text); });
            }
        })
        .then(result => {
            alert(result);
            closeModal();
            window.location.reload();
        })
        .catch(error => {
            alert('Ошибка: ' + error.message);
        });
    };
}

// Открыть модальное окно для редактирования категории
function editCategory(id) {
    fetch('/category/' + id)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Не удалось загрузить данные категории');
            }
        })
        .then(data => {
            document.getElementById("modal-title").textContent = "Редактировать категорию";
            document.getElementById("category-name").value = data.name;
            document.getElementById("category-description").value = data.description;
            document.getElementById("category-modal").style.display = "flex";

            // Установить обработчик для формы редактирования
            document.getElementById("category-form").onsubmit = function(event) {
                event.preventDefault();
                const updatedCategoryData = {
                    name: document.getElementById("category-name").value,
                    description: document.getElementById("category-description").value
                };

                fetch('/category/' + id + '/edit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedCategoryData)
                })
                .then(response => {
                    if (response.ok) {
                        alert("Категория успешно обновлена!");
                        window.location.reload();
                    } else {
                        response.text().then(text => {
                            alert("Ошибка: " + text);
                        });
                    }
                })
                .catch(error => {
                    console.error('Ошибка при отправке данных:', error);
                    alert("Произошла ошибка при обновлении категории.");
                });
            };
        })
        .catch(error => {
            console.error('Ошибка при получении данных категории:', error);
            alert("Произошла ошибка при загрузке данных категории.");
        });
}


// Закрыть модальное окно
function closeModal() {
    document.getElementById("category-modal").style.display = "none";
}


function deleteCategory(id) {
    const confirmation = confirm("Вы уверены, что хотите удалить эту категорию?");
    if (!confirmation) {
        // Если пользователь нажал "Отмена", выходим из функции
        return;
    }
    fetch('/category/' + id + '/delete', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            alert('Категория успешно удалена!');
            window.location.reload(); // Перезагрузка страницы, чтобы обновить данные
        } else {
            alert('Ошибка при удалении категории. Пожалуйста, попробуйте еще раз.');
        }
    })
    .catch(error => {
        console.error('Ошибка при удалении категории:', error);
        alert('Произошла ошибка при удалении категории.');
    });
}