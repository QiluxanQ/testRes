import React, {useEffect, useState} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Dialog} from '../../ui/dialog';
import Stats from "./blocks/Stats";
import SwichType from "./blocks/SwichType";
import CreateNewOrder from "./blocks/CreateNewOrder";
import SeacrhAndAllStatys from "./blocks/SeacrhAndAllStatys";
import OrdersData from "./blocks/OrdersData";
import SwichStatys from "./blocks/SwichStatys";
import { Button } from '../../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../ui/table';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Package,
  Star,
  User,
  Utensils
} from 'lucide-react';
import { Badge } from '../../ui/badge';

export function Orders() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderStatusTab, setOrderStatusTab] = useState('active');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');

  const [dateSort, setDateSort] = useState('newest');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const [selectedSalesPoint, setSelectedSalesPoint] = useState(null);

  const [orders, setOrders] = useState([]);
  const [guests, setGuests] = useState([]);
  const [guestsLoading, setGuestsLoading] = useState(true);
  const [dishOrders, setDishOrders] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);

  useEffect(() => {
    const savedSalesPoint = localStorage.getItem('selectedSalesPoint');
    console.log('Точка продаж из localStorage:', savedSalesPoint);

    if (savedSalesPoint) {
      try {
        const parsedSalesPoint = JSON.parse(savedSalesPoint);
        console.log('Парсинг успешен:', parsedSalesPoint);
        setSelectedSalesPoint(parsedSalesPoint);
      } catch (error) {
        console.error('Ошибка парсинга точки продаж:', error);
      }
    } else {
      console.log('Точка продаж не найдена в localStorage');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchOrders = async () => {
      try {
        const respons = await fetch('/orders/?skip=0&limit=200', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        const ordersTotal = await respons.json();
        if (respons && Array.isArray(ordersTotal)){
          setOrders(ordersTotal);
        }
        else {
          setOrders([]);
        }
      }catch (err){
        setOrders([]);
        console.log('error', err);
      }
    };
    fetchOrders();

  }, []);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/guests/?skip=0&limit=1000',{
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const guestsData = await response.json();
          setGuests(guestsData);
        }
      } catch (error) {
        console.error('Ошибка загрузки гостей:', error);
      } finally {
        setGuestsLoading(false);
      }
    };

    fetchGuests();
  }, []);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!selectedOrder) return;

      setOrderDetailsLoading(true);
      try {
        const token = localStorage.getItem('token');
        // Загружаем dish-orders для выбранного заказа
        const dishOrdersResponse = await fetch('/dish-orders/?skip=0&limit=1000',{
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (dishOrdersResponse.ok) {
          const dishOrdersData = await dishOrdersResponse.json();
          const filteredDishOrders = dishOrdersData.filter(dishOrder =>
              dishOrder.order_id === selectedOrder.id
          );
          setDishOrders(filteredDishOrders);
        }

        const dishesResponse = await fetch('/dishes/?skip=0&limit=1000',{
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (dishesResponse.ok) {
          const dishesData = await dishesResponse.json();
          setDishes(dishesData);
        }
      } catch (error) {
        console.error('Ошибка загрузки деталей заказа:', error);
      } finally {
        setOrderDetailsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [selectedOrder]);

  const filterOrdersByDateRange = (ordersList) => {
    if (!dateRange.from && !dateRange.to) {
      return ordersList;
    }

    return ordersList.filter(order => {
      const orderDate = new Date(order.date_open || order.created_at);

      if (dateRange.from && dateRange.to) {
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999); // Устанавливаем конец дня

        return orderDate >= fromDate && orderDate <= toDate;
      }

      if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        return orderDate >= fromDate;
      }

      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        return orderDate <= toDate;
      }

      return true;
    });
  };

  // Функция для сортировки заказов по дате
  const sortOrdersByDate = (ordersList) => {
    if (dateSort === 'none') {
      return ordersList;
    }

    return [...ordersList].sort((a, b) => {
      const dateA = new Date(a.date_open || a.created_at);
      const dateB = new Date(b.date_open || b.created_at);

      if (dateSort === 'newest') {
        return dateB - dateA; // Новые сначала
      } else {
        return dateA - dateB; // Старые сначала
      }
    });
  };

  // Получаем отфильтрованные и отсортированные заказы
  const getFilteredAndSortedOrders = () => {
    let filteredOrders = orders;

    // Фильтрация по диапазону дат
    filteredOrders = filterOrdersByDateRange(filteredOrders);

    // Сортировка по дате
    filteredOrders = sortOrdersByDate(filteredOrders);

    return filteredOrders;
  };

  const activeOrdersCount = orders.filter(o => o.status === 'open').length;
  const completedOrdersCount = orders.filter(o => o.status === 'closed').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'cancelled').length;

  // Функции для детального просмотра заказа
  const getGuestInfo = (order) => {
    if (!order.guest_id) return {name: 'Без гостя', phone: '', email: ''};

    const guest = guests.find(g => g.id === order.guest_id);
    if (!guest) return {name: `Гость #${order.guest_id}`, phone: '', email: ''};

    return {
      name: guest.full_name || `Гость #${order.guest_id}`,
      phone: guest.phone || '',
      email: guest.email || ''
    };
  };

  const getWaiterInfo = (order) => {
    return order.user_id_open ? `Пользователь #${order.user_id_open}` : 'Не указан';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDishInfo = (dishId) => {
    return dishes.find(d => d.id === dishId);
  };

  const getOrderPositions = () => {
    return dishOrders.map(dishOrder => {
      const dish = getDishInfo(dishOrder.dish_id);
      return {
        ...dishOrder,
        dishName: dish ? dish.name : `Блюдо #${dishOrder.dish_id}`,
        dishPrice: dish ? parseFloat(dish.price) : 0,
        dishWeight: dish ? dish.weight : ''
      };
    });
  };


  const renderOrderDetails = () => {
    if (!selectedOrder) return null;
    return (
        <div className={`space-y-6 `} >
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к списку
            </Button>
          </div>

          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}  >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle style={{color:'var(--custom-text)'}} className="text-2xl flex items-center gap-3 text-white">
                    <Utensils className="h-6 w-6 text-orange-600" />
                    Заказ {selectedOrder.id}

                    {selectedOrder.guest?.vip && <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />}
                    {selectedOrder.guest?.birthday && <span className="text-2xl"></span>}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    {selectedOrder.table && (
                        <div className="flex items-center gap-1">
                          <Utensils className="h-4 w-4" />
                          {selectedOrder.table.name} ({selectedOrder.table.section})
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {selectedOrder.waiter?.name || getWaiterInfo(selectedOrder)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDate(selectedOrder.date_open)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {selectedOrder.notes && (
              <Card className="border-yellow-500 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-800 mb-1">Важная заметка</div>
                      <div className="text-sm text-yellow-700">{selectedOrder.notes}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}

          <div className="grid grid-cols-4 gap-4">
            <Card  style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-primaryLine)',
              color: 'var(--custom-text)',
            }}>
              <CardContent className="pt-6" >
                <div className="text-sm text-muted-foreground mb-1">Гость</div>
                <div style={{color:'var(--custom-text)'}} className="font-medium text-white">{getGuestInfo(selectedOrder).name}</div>
                <div className="text-xs text-muted-foreground mt-1">{getGuestInfo(selectedOrder).phone}</div>
              </CardContent>
            </Card>
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-primaryLine)',
              color: 'var(--custom-text)',
            }}>
              <CardContent className="pt-6">
                <div style={{color:'var(--custom-text)'}} className="text-sm text-muted-foreground mb-1">Позиций</div>
                <div style={{color:'var(--custom-text)'}} className="text-2xl font-medium text-white">{selectedOrder.count_positions || 0}</div>
              </CardContent>
            </Card>
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-primaryLine)',
              color: 'var(--custom-text)',
            }}>
              <CardContent className="pt-6">
                <div style={{color:'var(--custom-text)'}} className="text-sm text-muted-foreground mb-1">К оплате</div>
                <div className="text-2xl font-medium text-orange-600">₽{parseFloat(selectedOrder.amount || 0).toLocaleString()}</div>
                {selectedOrder.discount > 0 && (
                    <div className="text-xs text-green-600 mt-1">Скидка: ₽{selectedOrder.discount}</div>
                )}
              </CardContent>
            </Card>
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-primaryLine)',
              color: 'var(--custom-text)',
            }}>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">Оплата</div>
                {selectedOrder.status === 'closed' ? (
                    <div className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-5 w-5" />
                      <span>Оплачено</span>
                    </div>
                ) : (
                    <div className="text-yellow-600">Не оплачено</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card  style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardHeader>
              <CardTitle style={{color:'var(--custom-text)'}} className="text-lg text-white">Позиции заказа ({getOrderPositions().length})</CardTitle>
            </CardHeader>
            <CardContent>
              {orderDetailsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Загрузка блюд...</p>
                  </div>
              ) : getOrderPositions().length > 0 ? (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader className="text-white">
                        <TableRow >
                          <TableHead style={{color:'rgb(148, 163, 184)'}} >Блюдо</TableHead>
                          <TableHead style={{color:'rgb(148, 163, 184)'}}>Вес/Ед.</TableHead>
                          <TableHead style={{color:'rgb(148, 163, 184)'}}>Количество</TableHead>
                          <TableHead style={{color:'rgb(148, 163, 184)'}}>Цена за ед.</TableHead>
                          <TableHead style={{color:'rgb(148, 163, 184)'}}>Сумма</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className='text-white'>
                        {getOrderPositions().map((position) => (
                            <TableRow key={position.id}>
                              <TableCell style={{color:'var(--custom-text)'}} className="font-medium">
                                {position.dishName}
                              </TableCell>
                              <TableCell style={{color:'var(--custom-text)'}}>{position.dishWeight}</TableCell>
                              <TableCell style={{color:'var(--custom-text)'}}>{position.quantity}</TableCell>
                              <TableCell style={{color:'var(--custom-text)'}}>₽{position.dishPrice.toFixed(2)}</TableCell>
                              <TableCell  className="font-medium text-red-500">
                                ₽{parseFloat(position.amount).toFixed(2)}
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Итоговая сумма */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span style={{color:'var(--custom-text)'}} className="text-lg font-semibold text-white">Итого:</span>
                      <span className="text-2xl font-bold text-orange-600">
                                        ₽{parseFloat(selectedOrder.amount).toLocaleString()}
                                    </span>
                    </div>
                  </div>
              ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-400"/>
                    <p>Нет данных о составе заказа</p>
                    <p className="text-sm">Информация о блюдах не найдена</p>
                  </div>
              )}
            </CardContent>
          </Card>

          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-primaryLine)',
            color: 'var(--custom-text)',
          }}>
            <CardHeader style={{color:'var(--custom-text)'}} className="text-white">
              <CardTitle  className="flex items-center gap-2">
                <Calendar  className="h-5 w-5"/>
                Дополнительная информация
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedOrder.service_fee && parseFloat(selectedOrder.service_fee) > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Сервисный сбор:</p>
                      <p className="font-medium">₽{parseFloat(selectedOrder.service_fee).toFixed(2)}</p>
                    </div>
                )}
                {selectedOrder.discount && parseFloat(selectedOrder.discount) > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Скидка:</p>
                      <p className="font-medium text-green-600">-₽{parseFloat(selectedOrder.discount).toFixed(2)}</p>
                    </div>
                )}
                {selectedOrder.NDS && parseFloat(selectedOrder.NDS) > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">НДС:</p>
                      <p className="font-medium">₽{parseFloat(selectedOrder.NDS).toFixed(2)}</p>
                    </div>
                )}
                {selectedOrder.number_fiscal_document && (
                    <div>
                      <p className="text-sm text-muted-foreground">Фискальный номер:</p>
                      <p className="font-medium">{selectedOrder.number_fiscal_document}</p>
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
    );
  };

  return (
      <div className="space-y-6">
        {selectedOrder ? (
            renderOrderDetails()
        ) : (
            <>
              <Stats activeOrdersCount={activeOrdersCount} />

              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
              }}
               >
                <CardHeader>
                  <div className="flex justify-between items-center text-white">
                    <CardTitle style={{color:'var(--custom-text)'}}>Управление заказами</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    <SeacrhAndAllStatys
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        dateSort={dateSort}
                        setDateSort={setDateSort}
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                    />
                    <div className="flex justify-between items-center gap-4">
                      <SwichType
                          orderTypeFilter={orderTypeFilter}
                          setOrderTypeFilter={setOrderTypeFilter}
                      />

                      <div className="flex border rounded-md w-fit">
                        <SwichStatys
                            orderStatusTab={orderStatusTab}
                            setOrderStatusTab={setOrderStatusTab}
                            activeOrdersCount={activeOrdersCount}
                            completedOrdersCount={completedOrdersCount}
                            cancelledOrdersCount={cancelledOrdersCount}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <OrdersData
                        orders={getFilteredAndSortedOrders()}
                        searchTerm={searchTerm}
                        statusFilter={statusFilter}
                        orderStatusTab={orderStatusTab}
                        orderTypeFilter={orderTypeFilter}
                        selectedOrder={selectedOrder}
                        setSelectedOrder={setSelectedOrder}
                        selectedSalesPoint={selectedSalesPoint}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
        )}
      </div>
  );
}