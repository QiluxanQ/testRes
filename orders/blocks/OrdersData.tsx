import React, {useState, useEffect, useMemo} from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../../../ui/table';
import {Badge} from '../../../ui/badge';
import {
    CheckCircle,
    Clock,
    Edit,
    Eye,
    Truck,
    Utensils,
    XCircle,
    Zap,
    Save,
    X,
    Receipt,
    User,
    Phone,
    Mail,
    Calendar,
    DollarSign,
    Package,
    Star,
    ArrowLeft,
    AlertCircle,
    ChefHat,
    Timer,
    MapPin
} from "lucide-react";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from "../../../ui/dialog";
import {Button} from '../../../ui/button';
import {Input} from "../../../ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../../ui/select";
import {Card, CardContent, CardHeader, CardTitle} from "../../../ui/card";
import { Separator } from '@radix-ui/react-separator';
import OrderTable from "./OrderTable";

const statusColors = {
    'open': 'bg-blue-100 text-blue-800',
    'closed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
};

const statusLabels = {
    'open': 'Открыт',
    'closed': 'Закрыт',
    'cancelled': 'Отменен'
};

const OrdersData = ({
                        orders,
                        searchTerm,
                        statusFilter,
                        orderStatusTab,
                        orderTypeFilter,
                        selectedOrder,
                        setSelectedOrder,
                        onOrderUpdated,
                        selectedSalesPoint
                    }) => {
    const [guests, setGuests] = useState([]);
    const [guestsLoading, setGuestsLoading] = useState(true);
    const [editingOrder, setEditingOrder] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [dishOrders, setDishOrders] = useState([]);
    const [dishes, setDishes] = useState([]);
    const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
    const [cashShifts, setCashShifts] = useState([]);

    const [tables, setTables] = useState([]);
    const [hallTables, setHallTables] = useState([]);
    const [selectedTableId, setSelectedTableId] = useState(null);
    const [tableOrders, setTableOrders] = useState([]);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchGuests = async () => {
            try {
                const response = await fetch('/guests/?skip=0&limit=1000',{
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                const guestsData = await response.json();
                if (response && Array.isArray(guestsData)) {
                    setGuests(guestsData);
                }else{
                    setGuests([]);
                }
            } catch (error) {
                console.error('Ошибка загрузки гостей:', error);
                setGuests([]);
            } finally {
                setGuestsLoading(false);
            }
        };

        fetchGuests();
    }, []);

    useEffect(() => {
        const fetchCashShifts = async () => {
            try {
                const response = await fetch('/cash-shifts/?skip=0&limit=1000', {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const cashShiftsData = await response.json();
                if (response && Array.isArray(cashShiftsData)) {
                    setCashShifts(cashShiftsData);
                }else{
                    setCashShifts([])
                }
            } catch (error) {
                setCashShifts([])
                console.error('Ошибка загрузки кассовых смен:', error);
            }
        };
        fetchCashShifts();
    }, []);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!selectedOrder) return;

            setOrderDetailsLoading(true);
            try {
                const dishOrdersResponse = await fetch('/dish-orders/?skip=0&limit=1000',{
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const dishOrdersData = await dishOrdersResponse.json();
                const filteredDishOrders = dishOrdersData.filter(dishOrder =>
                    dishOrder.order_id === selectedOrder.id
                );
                if (dishOrdersResponse && Array.isArray(filteredDishOrders)) {
                    setDishOrders(filteredDishOrders);
                }else{
                    setDishOrders([]);
                }

                const dishesResponse = await fetch('/dishes/?skip=0&limit=1000',{
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const dishesData = await dishesResponse.json();
                if (dishesResponse && Array.isArray(dishesData)) {
                    setDishes(dishesData);
                }else{
                    setDishes([]);
                }
            } catch (error) {
                setDishes([]);
                console.error('Ошибка загрузки деталей заказа:', error);
            } finally {
                setOrderDetailsLoading(false);
            }
        };
        fetchOrderDetails();
    }, [selectedOrder]);

    useEffect(() => {
        const fetchTablesData = async () => {
            if (orderTypeFilter !== 'table') return;

            try {
                // Загружаем все данные параллельно
                const [hallsResponse, tablesResponse, orderTablesResponse] = await Promise.all([
                    fetch('/hall-tables/?skip=0&limit=100', {
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }),
                    fetch('/tables/?skip=0&limit=100', {
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }),
                    fetch('/order-tables/?skip=0&limit=1000', {
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    })
                ]);

                let hallsData = await hallsResponse.json();
                let tablesData = await tablesResponse.json();
                const orderTablesData = await orderTablesResponse.json();

                if (!Array.isArray(hallsData)) hallsData = [];
                if (!Array.isArray(tablesData)) tablesData = [];

                console.log('Все залы:', hallsData);
                console.log('Все столы:', tablesData);
                console.log('Выбранная точка продаж:', selectedSalesPoint);

                setHallTables(hallsData);
                setTables(tablesData);
                setTableOrders(orderTablesData);
            } catch (error) {
                console.error('Ошибка загрузки данных по столам:', error);
            }
        };

        fetchTablesData();
    }, [orderTypeFilter, token, selectedSalesPoint]);

    const filteredHalls = useMemo(() => {
        if (!selectedSalesPoint || !selectedSalesPoint.id) {
            return hallTables;
        }

        console.log('Фильтрация залов по point_retail_id:', selectedSalesPoint.id);
        const filtered = hallTables.filter(hall =>
            hall.point_retail_id === selectedSalesPoint.id
        );
        console.log('Отфильтрованные залы:', filtered);
        return filtered;
    }, [hallTables, selectedSalesPoint]);

    const filteredTables = useMemo(() => {
        if (!selectedSalesPoint || !selectedSalesPoint.id) {
            return tables;
        }

        console.log('Фильтрация столов по point_retail_id:', selectedSalesPoint.id);

        const filtered = tables.filter(table => {

            if (table.point_retail_id !== undefined) {
                return table.point_retail_id === selectedSalesPoint.id;
            }

            const hall = hallTables.find(h => h.id === table.hall_id);
            return hall && hall.point_retail_id === selectedSalesPoint.id;
        });

        console.log('Отфильтрованные столы:', filtered);
        return filtered;
    }, [tables, hallTables, selectedSalesPoint]);

    const getOrdersForTable = (tableId) => {
        const tableOrderIds = tableOrders
            .filter(ot => ot.table_id === tableId)
            .map(ot => ot.order_id);

        return orders.filter(order => tableOrderIds.includes(order.id));
    };

    const getHallInfo = (table) => {
        return hallTables.find(hall => hall.id === table.hall_id);
    };

    const getFilteredHallInfo = (table) => {
        return filteredHalls.find(hall => hall.id === table.hall_id);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'open':
                return <Clock className="h-4 w-4"/>;
            case 'closed':
                return <CheckCircle className="h-4 w-4"/>;
            case 'cancelled':
                return <XCircle className="h-4 w-4"/>;
            default:
                return <Clock className="h-4 w-4"/>;
        }
    };

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

    const getOrderType = (order) => {
        return order.order_type || 'dine-in';
    };

    const getCashShiftInfo = (order) => {
        if (!order.cash_shift_id) return null;

        const cashShift = cashShifts.find(shift => shift.id === order.cash_shift_id);
        return cashShift;
    };

    const getCashShiftByDate = (orderDate) => {
        if (!orderDate) return null;

        const orderDateTime = new Date(orderDate);

        const shift = cashShifts.find(shift => {
            if (shift.status !== 'closed') return false;

            const openDate = new Date(shift.date_open);
            const closeDate = new Date(shift.date_close);

            return orderDateTime >= openDate && orderDateTime <= closeDate;
        });

        return shift;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Не указано';
        const date = new Date(dateString);
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Не указано';
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
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

    const getOrderTypeFromCheckboxes = (formData) => {
        if (formData.order_table) return 'dine-in';
        if (formData.order_delivery) return 'delivery';
        if (formData.order_fast) return 'quick';
        return 'dine-in';
    };

    const setCheckboxValuesFromOrderType = (orderType) => {
        return {
            order_table: orderType === 'dine-in',
            order_delivery: orderType === 'delivery',
            order_fast: orderType === 'quick'
        };
    };

    const handleEditStart = (order) => {
        const checkboxValues = setCheckboxValuesFromOrderType(order.order_type || 'dine-in');

        setEditingOrder(order);
        setEditFormData({
            transaction_id: order.transaction_id,
            guest_id: order.guest_id || null,
            count_positions: order.count_positions,
            amount: order.amount,
            status: order.status,
            number_fiscal_document: order.number_fiscal_document || '',
            service_fee: order.service_fee,
            discount: order.discount,
            NDS: order.NDS,
            date_open: order.date_open ? order.date_open.slice(0, 16) : '',
            date_close: order.date_close ? order.date_close.slice(0, 16) : '',
            order_type: order.order_type || 'dine-in',
            display_website: order.display_website,
            ...checkboxValues
        });
    };

    const handleEditCancel = () => {
        setEditingOrder(null);
        setEditFormData({});
    };

    const handleEditSave = async () => {
        if (!editingOrder) return;

        setEditLoading(true);
        try {
            const orderType = getOrderTypeFromCheckboxes(editFormData);

            const updateData = {
                transaction_id: editFormData.transaction_id,
                guest_id: editFormData.guest_id || null,
                count_positions: parseInt(editFormData.count_positions) || 0,
                amount: editFormData.amount,
                status: editFormData.status,
                number_fiscal_document: editFormData.number_fiscal_document || null,
                service_fee: editFormData.service_fee ? parseFloat(editFormData.service_fee) : null,
                discount: editFormData.discount ? parseFloat(editFormData.discount) : null,
                NDS: editFormData.NDS ? parseFloat(editFormData.NDS) : null,
                date_open: editFormData.date_open ? editFormData.date_open + ':00' : null,
                date_close: editFormData.date_close ? editFormData.date_close + ':00' : null,
                order_type: orderType,
                display_website: editFormData.display_website || false
            };

            Object.keys(updateData).forEach(key => {
                if (updateData[key] === null || updateData[key] === undefined || updateData[key] === '') {
                    delete updateData[key];
                }
            });

            console.log('Отправляемые данные для обновления:', updateData);

            const response = await fetch(`/orders/${editingOrder.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка при обновлении заказа: ${errorText}`);
            }

            const updatedOrder = await response.json();
            console.log('Заказ обновлен:', updatedOrder);

            if (onOrderUpdated) {
                onOrderUpdated(updatedOrder);
            }

            setEditingOrder(null);
            setEditFormData({});

        } catch (error) {
            console.error('Ошибка при обновлении заказа:');
            alert(`Ошибка при обновлении заказа:`);
        } finally {
            setEditLoading(false);
        }
    };

    const handleEditInputChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleEditCheckboxChange = (field) => {
        setEditFormData(prev => {
            const updatedData = {
                ...prev,
                order_table: false,
                order_delivery: false,
                order_fast: false
            };
            updatedData[field] = true;

            return updatedData;
        });
    };

    // ФИЛЬТРАЦИЯ ЗАКАЗОВ
    const filteredOrders = orders.filter(order => {
        const guestInfo = getGuestInfo(order);
        const matchesSearch = order.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.transaction_id && order.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            guestInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (guestInfo.phone && guestInfo.phone.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        let matchesOrderStatus = true;
        if (orderStatusTab === 'active') {
            matchesOrderStatus = order.status === 'open';
        } else if (orderStatusTab === 'completed') {
            matchesOrderStatus = order.status === 'closed';
        } else if (orderStatusTab === 'cancelled') {
            matchesOrderStatus = order.status === 'cancelled';
        }

        const orderType = getOrderType(order);
        const matchesOrderType = orderTypeFilter === 'all' || orderType === orderTypeFilter;

        return matchesSearch && matchesStatus && matchesOrderStatus && matchesOrderType;
    });

    if (orderTypeFilter === 'table') {
        const hasTablesForSalesPoint = filteredTables.length > 0;

        if (selectedSalesPoint && !hasTablesForSalesPoint) {
            return (
                <div className="text-center py-12">
                    <div className="bg-gray-50 border rounded-lg p-8">
                        <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Нет столов для выбранной точки продаж
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Для точки продаж "{selectedSalesPoint.name}" не найдено столов
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                            <MapPin className="h-4 w-4" />
                            <span>ID точки продаж: {selectedSalesPoint.id}</span>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <OrderTable
                tables={filteredTables}
                hallTables={filteredHalls}
                getHallInfo={getFilteredHallInfo}
                getOrdersForTable={getOrdersForTable}
                setSelectedTableId={setSelectedTableId}
                selectedTableId={selectedTableId}
                statusLabels={statusLabels}
                formatDate={formatDate}
                selectedSalesPoint={selectedSalesPoint}
            />
        );
    }


    return (
        <div>
            {filteredOrders.length > 0 ? (
                <div
                    className="px-2 pb-2"
                    style={{
                        height: '420px',
                        overflowY: 'auto',
                    }}
                >
                    <Table>
                        <TableHeader >
                            <TableRow className='text-white'>
                                <TableHead style={{color:'rgb(148, 163, 184)'}}>ID</TableHead>
                                <TableHead style={{color:'rgb(148, 163, 184)'}}>Позиций</TableHead>
                                <TableHead style={{color:'rgb(148, 163, 184)'}}>Тип</TableHead>
                                <TableHead style={{color:'rgb(148, 163, 184)'}}>Информация</TableHead>
                                <TableHead style={{color:'rgb(148, 163, 184)'}}>Гость</TableHead>
                                <TableHead style={{color:'rgb(148, 163, 184)'}}>Пользователь</TableHead>
                                <TableHead style={{color:'rgb(148, 163, 184)'}}>Время открытия</TableHead>
                                <TableHead style={{color:'rgb(148, 163, 184)'}}>Статус</TableHead>
                                <TableHead style={{color:'rgb(148, 163, 184)'}}>Сумма</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map((order) => {
                                const guestInfo = getGuestInfo(order);
                                const cashShift = getCashShiftByDate(order.date_open);

                                return (
                                    <TableRow key={order.id} onClick={() => setSelectedOrder(order)}>
                                        <TableCell style={{color:'var(--custom-text)'}} className="font-medium text-white">{order.id}</TableCell>
                                        <TableCell style={{color:'var(--custom-text)'}} className='text-white'>{order.count_positions}</TableCell>
                                        <TableCell>
                                            {order.order_type === 'dine-in' && (
                                                <Badge variant="outline" className="bg-blue-50" >
                                                    <Utensils className="h-3 w-3 mr-1"/>
                                                    Зал
                                                </Badge>
                                            )}
                                            {order.order_type === 'delivery' && (
                                                <Badge variant="outline" className="bg-purple-50">
                                                    <Truck className="h-3 w-3 mr-1"/>
                                                    Доставка
                                                </Badge>
                                            )}
                                            {order.order_type === 'quick' && (
                                                <Badge variant="outline" className="bg-green-50">
                                                    <Zap className="h-3 w-3 mr-1"/>
                                                    Быстрый
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {cashShift && (
                                                <div className="text-xs text-blue-600">
                                                    Смена #{cashShift.id}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className='text-xs text-blue-600' >
                                            <div>
                                                <div className="font-medium">{guestInfo.name}</div>
                                                {guestInfo.phone && (
                                                    <div className="text-sm text-muted-foreground">
                                                       Номер: {guestInfo.phone}
                                                        {guestInfo.email && ` • ${guestInfo.email}`}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell style={{color:'var(--custom-text)'}} className='text-white'>{getWaiterInfo(order)}</TableCell>
                                        <TableCell style={{color:'var(--custom-text)'}} className='text-white'>{formatDate(order.date_open)}</TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[order.status]}>
                                                <div className="flex items-center space-x-1">
                                                    {getStatusIcon(order.status)}
                                                    <span>{statusLabels[order.status]}</span>
                                                </div>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className='text-green-600'>₽{parseFloat(order.amount).toLocaleString()}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    {orderStatusTab === 'active' && 'Нет активных заказов'}
                    {orderStatusTab === 'completed' && 'Нет завершенных заказов'}
                    {orderStatusTab === 'cancelled' && 'Нет отмененных заказов'}
                </div>
            )}
        </div>
    );
};

export default OrdersData;