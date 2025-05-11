from django.urls import path
from . import views
urlpatterns = [
    path('', views.index),
    path('dashboard', views.dashboard, name='dashboard'),
    path("register/", views.register_view, name="register"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path('category/', views.category_list, name='category_list'),
    path('category', views.create_category, name='create_category'),
    path('category/<int:id>/', views.get_category, name='get_category'),
    path('category/<int:id>/edit', views.update_category, name='update_category'),
    path('category/<int:id>/delete', views.delete_category, name='delete_category'),
    path('inventory/', views.inventory, name='inventory'),
    path('inventory', views.add_product, name='add_product'),
    path('inventory/<int:product_id>/', views.get_product, name='get_product'),
    path('inventory/<int:product_id>/edit', views.edit_product, name='edit_product'),
    path('orders/', views.order_list, name='orders'),
    path('orders/create', views.create_order, name='create_order'),
    path('orders/<int:order_id>/status', views.update_order_status, name='update_order_status'),
    path('orders/<int:order_id>/', views.order_details, name='order_details'),
    path('api/metrics/current-stock', views.get_current_stock, name='get_current_stock'),
    path('api/metrics/order-status', views.get_order_status, name='get_order_status'),
    path('metrics/order-count', views.get_order_count_metrics, name='get_order_count_metrics')
]
