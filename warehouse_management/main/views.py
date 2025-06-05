from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login
from .forms import RegisterForm
from django.contrib import messages
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Category
from .forms import CategoryForm
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Category
from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import Product, Category
from .forms import ProductForm
from .forms import OrderForm
from django.views.decorators.http import require_http_methods
from django.views.decorators.http import require_POST
from .models import Order, Product, OrderItem
from datetime import datetime
from django.db.models import Count
from django.utils.timezone import now

# Create your views here.
def index(request):
    return render(request, 'main/index.html')

@login_required(login_url='login')
def dashboard(request):
    return render(request, 'main/dashboard.html')

def register_view(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("login")
        else:
            return render(request, "main/register.html", {"form": form})
    return render(request, "main/register.html", {"form": RegisterForm()})

def login_view(request):
    if request.method == "POST":
        email = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=email, password=password)
        if user is not None:
            login(request, user)
            return redirect("dashboard")
        else:
            return render(request, "main/login.html", {"error": "Неверный email или пароль"})
    return render(request, "main/login.html")

def logout_view(request):
    logout(request)
    return redirect("/")

@login_required
def category_list(request):
    categories = Category.objects.filter(user=request.user)
    return render(request, 'main/category.html', {'categories': categories})

@csrf_exempt
@login_required
def create_category(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            category = Category.objects.create(
                name=data['name'],
                description=data['description'],
                user=request.user
            )
            return HttpResponse("Категория успешно создана")
        except Exception as e:
            return HttpResponseBadRequest(str(e))
    return HttpResponseBadRequest("Неверный метод")

def get_category(request, id):
    try:
        category = Category.objects.get(pk=id)
        return JsonResponse({
            'name': category.name,
            'description': category.description
        })
    except Category.DoesNotExist:
        return HttpResponseBadRequest("Категория не найдена")

@csrf_exempt
def update_category(request, id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            category = Category.objects.get(pk=id)
            category.name = data['name']
            category.description = data['description']
            category.save()
            return HttpResponse("Категория обновлена")
        except Exception as e:
            return HttpResponseBadRequest(str(e))
    return HttpResponseBadRequest("Неверный метод")

@csrf_exempt
def delete_category(request, id):
    if request.method == 'DELETE':
        try:
            category = Category.objects.get(pk=id)
            category.delete()
            return HttpResponse("Категория удалена")
        except Category.DoesNotExist:
            return HttpResponseBadRequest("Категория не найдена")
    return HttpResponseBadRequest("Неверный метод")

def inventory(request):
    products = Product.objects.filter(user=request.user).order_by('id')
    categories = Category.objects.all()
    return render(request, 'main/inventory.html', {
        'products': products,
        'categories': categories
    })

@csrf_exempt
@login_required
def add_product(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        description = data.get('description', '')
        purchase_price = data.get('purchasePrice')
        selling_price = data.get('sellingPrice')
        category_data = data.get('category')

        category = None
        if category_data and 'id' in category_data:
            try:
                category = Category.objects.get(id=category_data['id'])
            except Category.DoesNotExist:
                return JsonResponse({'error': 'Категория не найдена'}, status=400)

        Product.objects.create(
            name=name,
            description=description,
            purchase_price=purchase_price,
            selling_price=selling_price,
            category=category,
            user=request.user
        )

        return JsonResponse({'message': 'Продукт успешно добавлен!'})

@require_http_methods(["GET"])
@login_required
def get_product(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
        return JsonResponse({
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'purchasePrice': product.purchase_price,
            'sellingPrice': product.selling_price,
            'category': {
                'id': product.category.id,
                'name': product.category.name
            } if product.category else None
        })
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Продукт не найден'}, status=404)

@csrf_exempt
@login_required
def edit_product(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Продукт не найден'}, status=404)

    if request.method == 'POST':
        data = json.loads(request.body)
        product.name = data.get('name')
        product.description = data.get('description', '')
        product.purchase_price = data.get('purchasePrice') or 0
        product.selling_price = data.get('sellingPrice') or 0

        category_data = data.get('category')
        if category_data and 'id' in category_data:
            try:
                category = Category.objects.get(id=category_data['id'])
                product.category = category
            except Category.DoesNotExist:
                return JsonResponse({'error': 'Категория не найдена'}, status=400)
        else:
            product.category = None

        product.save()
        return JsonResponse({'message': 'Продукт успешно обновлен!'})
    

@login_required
def order_list(request):
    orders = Order.objects.filter(user=request.user).order_by('id')
    products = Product.objects.all()  
    return render(request, 'main/orders.html', {'orders': orders, 'products': products})

@login_required
@csrf_exempt  
@require_http_methods(["PUT"])
def update_order_status(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return JsonResponse({'error': 'Заказ не найден'}, status=404)

    new_status = request.body.decode('utf-8').strip('"')
    previous_status = order.status

    if new_status == 'Выполнен' and previous_status != 'Выполнен':
        order_items = OrderItem.objects.filter(order=order)
        for item in order_items:
            product = item.product
            product.stock_quantity += item.quantity
            product.save()

    order.status = new_status
    order.save()
    return JsonResponse({'message': 'Статус обновлен'}, status=200)

@login_required
@csrf_exempt
def create_order(request):
    if request.method == 'POST':
        product_ids = request.POST.getlist('productIds')
        quantities = request.POST.getlist('quantities')
        total_amount = request.POST['totalAmount']
        order = Order.objects.create(
            user=request.user,
            total_amount=total_amount,
            status='Новый',
            order_date=datetime.today().date(),  
        )
        
        for product_id, quantity in zip(product_ids, quantities):
            product = Product.objects.get(id=product_id)
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.selling_price
            )
        
        return JsonResponse({'message': 'Заказ успешно создан'}, status=201)

    return JsonResponse({'message': 'Неверный метод запроса'}, status=400)

def order_details(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        order_items = OrderItem.objects.filter(order=order)

        data = {
            "products": [
                {
                    "productName": item.product.name,
                    "quantity": item.quantity,
                    "price": f"{item.price:.2f} р."
                }
                for item in order_items
            ]
        }
        return JsonResponse(data)

    except Order.DoesNotExist:
        return JsonResponse({"error": "Заказ не найден"}, status=404)
    
from django.db.models import Sum
# Получаем информацию о текущих запасах для текущего пользователя
def get_current_stock(request):
    # Подсчитываем товары для текущего пользователя
    total_stock = Product.objects.filter(user=request.user).aggregate(total_stock=Sum('stock_quantity'))['total_stock'] or 0
    low_stock_count = Product.objects.filter(user=request.user, stock_quantity__lt=10).count()

    return JsonResponse({
        'totalStock': total_stock,
        'lowStockCount': low_stock_count,
    })

# Получаем информацию о статусах заказов для текущего пользователя
def get_order_status(request):
    completed_count = Order.objects.filter(user=request.user, status='Выполнен').count()
    processing_count = Order.objects.filter(user=request.user, status='В процессе').count()

    return JsonResponse({
        'completed': completed_count,
        'processing': processing_count,
    })

# Получаем статистику по заказам за сегодня и за месяц для текущего пользователя
def get_order_count_metrics(request):
    today = now().date()
    start_of_month = today.replace(day=1)

    # Заказы за сегодня для текущего пользователя
    orders_today = Order.objects.filter(user=request.user, order_date=today).count()

    # Заказы за месяц для текущего пользователя
    orders_this_month = Order.objects.filter(user=request.user, order_date__gte=start_of_month).count()

    return JsonResponse({
        'ordersToday': orders_today,
        'ordersThisMonth': orders_this_month,
    })