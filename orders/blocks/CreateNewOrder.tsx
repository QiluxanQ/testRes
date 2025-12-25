import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../ui/dialog";
import { Plus, Truck, Utensils, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";

const CreateNewOrder = ({ onOrderCreated }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [guests, setGuests] = useState([]);
    const [guestsLoading, setGuestsLoading] = useState(false);
    const [changes, setChanges] = useState([]);
    const [hasActiveChange, setHasActiveChange] = useState(false);

    const [formData, setFormData] = useState({
        transaction_id: '',
        change_id: null,
        guest_id: null,
        user_id_open: null,
        user_id_close: null,
        count_positions: 0,
        amount: '',
        status: 'open',
        number_fiscal_document: '',
        service_fee: 0,
        discount: 0,
        NDS: 0,
        date_open: new Date().toISOString().split('T')[0] + 'T00:00:00',
        date_close: '',
        order_table: false,
        order_delivery: false,
        order_fast: false,
        display_website: false
    });


    useEffect(() => {
        const fetchData = async () => {
            if (!isOpen) return;

            setGuestsLoading(true);
            try {
                const [guestsResponse, changesResponse] = await Promise.all([
                    fetch('/guests/?skip=0&limit=100'),
                    fetch('/changes/?skip=0&limit=100')
                ]);

                if (guestsResponse.ok) {
                    const guestsData = await guestsResponse.json();
                    setGuests(guestsData);
                }

                if (changesResponse.ok) {
                    const changesData = await changesResponse.json();
                    setChanges(changesData);

                    // Ищем активную смену или первую доступную
                    const activeChange = changesData.find(change => change.is_active) || changesData[0];
                    if (activeChange) {
                        setFormData(prev => ({ ...prev, change_id: activeChange.id }));
                        setHasActiveChange(true);
                    } else {
                        setHasActiveChange(false);
                    }
                }

            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
            } finally {
                setGuestsLoading(false);
            }
        };

        fetchData();
    }, [isOpen]);

    // Функция для создания change если нет существующих - ЗАМЕНИТЬ ЭТУ ФУНКЦИЮ
    const createDefaultChange = async () => {
        try {
            const currentDate = formatDateWithoutTimezone(new Date().toISOString());

            const changeData = {
                name: `Смена ${new Date().toLocaleDateString('ru-RU')}`,
                is_active: true,
                description: 'Автоматически созданная смена',
                status: 'active',
                point_retail_id: 1,
                user_id_open: 1,
                user_id_close: 1,
                date_open: currentDate, // Используем отформатированную дату
                date_close: currentDate, // Используем отформатированную дату
                sum_chek: "0",
                sum_profits: "0"
            };

            const response = await fetch('/changes/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(changeData)
            });

            if (response.ok) {
                const newChange = await response.json();
                setChanges(prev => [...prev, newChange]);
                setHasActiveChange(true);
                return newChange.id;
            } else {
                const errorText = await response.text();
                throw new Error(`Не удалось создать смену: ${errorText}`);
            }
        } catch (error) {
            console.error('Ошибка создания смены:', error);
            throw error;
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCheckboxChange = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    // Функция для преобразования даты в формат без временной зоны
    const formatDateWithoutTimezone = (dateString) => {
        if (!dateString) return null;
        return dateString.replace('Z', '').split('.')[0];
    };

    // Проверка существования change_id
    const checkChangeExists = async (changeId) => {
        try {
            const response = await fetch(`/changes/${changeId}`);
            if (response.ok) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Ошибка проверки смены:', error);
            return false;
        }
    };

    // POST запрос для создания заказа
    // POST запрос для создания заказа
    const handleCreateOrder = async () => {
        if (!formData.transaction_id || !formData.amount) {
            alert('Заполните обязательные поля: ID транзакции и Сумма');
            return;
        }

        setLoading(true);

        try {
            // Получаем change_id - либо существующий, либо создаем новый
            let changeId = formData.change_id;

            // Если change_id не установлен или равен 0, пытаемся найти подходящую смену
            if (!changeId || changeId === 0) {
                const activeChange = changes.find(change => change.is_active) || changes[0];
                if (activeChange) {
                    changeId = activeChange.id;
                } else {
                    // Если нет доступных смен, создаем новую
                    changeId = await createDefaultChange();
                }
            }

            // Проверяем существование выбранной смены
            if (changeId && changeId !== 0) {
                const changeExists = await checkChangeExists(changeId);
                if (!changeExists) {
                    console.warn('Выбранная смена не существует, создаем новую');
                    changeId = await createDefaultChange();
                }
            }

            const orderData = {
                transaction_id: formData.transaction_id,
                change_id: changeId,
                guest_id: formData.guest_id && formData.guest_id !== 0 ? parseInt(formData.guest_id) : null,
                user_id_open: formData.user_id_open && formData.user_id_open !== 0 ? parseInt(formData.user_id_open) : null,
                user_id_close: formData.user_id_close && formData.user_id_close !== 0 ? parseInt(formData.user_id_close) : null,
                count_positions: parseInt(formData.count_positions) || 0,
                amount: formData.amount,
                status: formData.status,
                number_fiscal_document: formData.number_fiscal_document,
                service_fee: parseFloat(formData.service_fee) || 0,
                discount: parseFloat(formData.discount) || 0,
                NDS: parseFloat(formData.NDS) || 0,
                date_open: formatDateWithoutTimezone(formData.date_open) || formatDateWithoutTimezone(new Date().toISOString()),
                date_close: formData.date_close ? formatDateWithoutTimezone(formData.date_close) : null,
                order_table: formData.order_table,
                order_delivery: formData.order_delivery,
                order_fast: formData.order_fast,
                display_website: formData.display_website
            };

            // Убираем все поля с null, undefined или 0 значениями
            Object.keys(orderData).forEach(key => {
                if (orderData[key] === null || orderData[key] === undefined || orderData[key] === 0) {
                    delete orderData[key];
                }
            });

            console.log('Отправляемые данные:', orderData);

            const response = await fetch('/orders/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка при создании заказа: ${errorText}`);
            }

            const result = await response.json();
            console.log('Заказ создан:', result);

            if (onOrderCreated) {
                onOrderCreated(result);
            }

            setIsOpen(false);
            resetForm();

            alert('Заказ успешно создан!');

        } catch (error) {
            console.error('Ошибка:', error);
            alert(`Произошла ошибка при создании заказа: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        const activeChange = changes.find(change => change.is_active) || changes[0];
        setFormData({
            transaction_id: '',
            change_id: activeChange ? activeChange.id : null,
            guest_id: null, // Меняем на null
            user_id_open: null, // Меняем на null
            user_id_close: null, // Меняем на null
            count_positions: 0,
            amount: '',
            status: 'open',
            number_fiscal_document: '',
            service_fee: 0,
            discount: 0,
            NDS: 0,
            date_open: new Date().toISOString().split('T')[0] + 'T00:00:00',
            date_close: '',
            order_table: false,
            order_delivery: false,
            order_fast: false,
            display_website: false
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleCreateOrder();
    };

    const handleCancel = () => {
        setIsOpen(false);
        resetForm();
    };

    // Функция для преобразования даты в формат для input datetime-local
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return dateString.slice(0, 16);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Новый заказ
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Создать новый заказ</DialogTitle>
                    <DialogDescription>Заполните детали нового заказа</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Основная информация */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">ID транзакции *</label>
                                <Input
                                    placeholder="Уникальный ID транзакции"
                                    value={formData.transaction_id}
                                    onChange={(e) => handleInputChange('transaction_id', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Сумма *</label>
                                <Input
                                    placeholder="0.00"
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => handleInputChange('amount', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Смена</label>
                                <Select
                                    value={formData.change_id ? formData.change_id.toString() : "0"}
                                    onValueChange={(value) => handleInputChange('change_id', value === "0" ? null : parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите смену" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Без смены</SelectItem>
                                        {changes.map((change) => (
                                            <SelectItem key={change.id} value={change.id.toString()}>
                                                {change.name} {change.is_active && '(активная)'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {!hasActiveChange && changes.length === 0 && (
                                    <p className="text-xs text-orange-600 mt-1">
                                        Нет доступных смен. Будет создана смена по умолчанию при сохранении.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium">Гость</label>
                                <Select
                                    value={formData.guest_id ? formData.guest_id.toString() : "0"}
                                    onValueChange={(value) => handleInputChange('guest_id', value === "0" ? null : parseInt(value))}
                                    disabled={guestsLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={guestsLoading ? "Загрузка гостей..." : "Выберите гостя"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Без гостя</SelectItem>
                                        {guests.map((guest) => (
                                            <SelectItem key={guest.id} value={guest.id.toString()}>
                                                <div className="flex items-center space-x-2">
                                                    <User className="h-4 w-4" />
                                                    <div>
                                                        <div className="font-medium">{guest.full_name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {guest.phone} • {guest.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {guestsLoading && (
                                    <p className="text-xs text-muted-foreground mt-1">Загрузка списка гостей...</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Статус</label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => handleInputChange('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите статус" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Открыт</SelectItem>
                                        <SelectItem value="closed">Закрыт</SelectItem>
                                        <SelectItem value="cancelled">Отменен</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {/* Даты */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Дата открытия</label>
                                <Input
                                    type="datetime-local"
                                    value={formatDateForInput(formData.date_open)}
                                    onChange={(e) => handleInputChange('date_open', e.target.value + ':00')}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Дата закрытия</label>
                                <Input
                                    type="datetime-local"
                                    value={formatDateForInput(formData.date_close)}
                                    onChange={(e) => handleInputChange('date_close', e.target.value + ':00')}
                                />
                            </div>
                        </div>

                        {/* Дополнительная информация */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium">Кол-во позиций</label>
                                <Input
                                    type="number"
                                    value={formData.count_positions}
                                    onChange={(e) => handleInputChange('count_positions', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Сервисный сбор</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.service_fee}
                                    onChange={(e) => handleInputChange('service_fee', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Скидка</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.discount}
                                    onChange={(e) => handleInputChange('discount', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">НДС</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.NDS}
                                    onChange={(e) => handleInputChange('NDS', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Фискальный номер</label>
                                <Input
                                    placeholder="Номер фискального документа"
                                    value={formData.number_fiscal_document}
                                    onChange={(e) => handleInputChange('number_fiscal_document', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Флаги */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Тип заказа</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="order_table"
                                        checked={formData.order_table}
                                        onChange={() => handleCheckboxChange('order_table')}
                                        className="h-4 w-4"
                                    />
                                    <label htmlFor="order_table" className="text-sm">
                                        <Badge variant="outline" className="bg-blue-50">
                                            <Utensils className="h-3 w-3 mr-1" />
                                            Заказ в зале
                                        </Badge>
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="order_delivery"
                                        checked={formData.order_delivery}
                                        onChange={() => handleCheckboxChange('order_delivery')}
                                        className="h-4 w-4"
                                    />
                                    <label htmlFor="order_delivery" className="text-sm">
                                        <Badge variant="outline" className="bg-purple-50">
                                            <Truck className="h-3 w-3 mr-1" />
                                            Доставка
                                        </Badge>
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="order_fast"
                                        checked={formData.order_fast}
                                        onChange={() => handleCheckboxChange('order_fast')}
                                        className="h-4 w-4"
                                    />
                                    <label htmlFor="order_fast" className="text-sm">Быстрый заказ</label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="display_website"
                                        checked={formData.display_website}
                                        onChange={() => handleCheckboxChange('display_website')}
                                        className="h-4 w-4"
                                    />
                                    <label htmlFor="display_website" className="text-sm">Показывать на сайте</label>
                                </div>
                            </div>
                        </div>

                        {/* Кнопки */}
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                className="bg-orange-600 hover:bg-orange-700"
                                disabled={loading}
                            >
                                {loading ? 'Создание...' : 'Создать заказ'}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateNewOrder;