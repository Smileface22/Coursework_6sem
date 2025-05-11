window.onload = function() {
    updateMetrics(); // При загрузке страницы обновляем статистику
};

function updateMetrics() {
    // Получаем текущие запасы
    fetch('/api/metrics/current-stock')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById('current-stock').innerText = data.totalStock + ' товаров';
            document.getElementById('low-stock').innerText = data.lowStockCount + ' товаров с низким уровнем';
        });
    // Получаем статус заказов
    fetch('/api/metrics/order-status')
        .then(response => response.json())
        .then(data => {
            document.getElementById('completed-orders').innerText = 'Выполнено: ' + data.completed;
            document.getElementById('processing-orders').innerText = 'В процессе: ' + data.processing;
        });

    fetch('/metrics/order-count')
            .then(response => response.json())
            .then(data => {
                // Обновляем текстовые значения на странице
                document.getElementById('orders-today').innerText = `Заказы за сегодня: ${data.ordersToday}`;
                document.getElementById('orders-this-month').innerText = `Заказы за месяц: ${data.ordersThisMonth}`;
            });

}
