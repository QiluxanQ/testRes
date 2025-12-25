// components/AddGuestDialog.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Textarea } from "../../../ui/textarea";
import { ArrowLeft, Plus, User, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Badge } from "../../../ui/badge";

interface PointRetail {
    id: number;
    name: string;
    address: string;
    type: string;
}

interface Discount {
    id: number;
    point_retail_id: number;
    name: string;
    count: string;
    metadate: {
        additionalProp1: Record<string, any>;
    };
}

interface AddGuestDialogProps {
    onGuestAdded: (newGuest: any) => void;
    selectedSalesPoint?: any;
    onClose: () => void; // Функция для закрытия (возврата к списку)
}

export const AddGuestDialog: React.FC<AddGuestDialogProps> = ({
                                                                  onGuestAdded,
                                                                  selectedSalesPoint,
                                                                  onClose
                                                              }) => {
    const [loading, setLoading] = useState(false);
    const [pointsRetail, setPointsRetail] = useState<PointRetail[]>([]);
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loadingPoints, setLoadingPoints] = useState(false);
    const [loadingDiscounts, setLoadingDiscounts] = useState(false);
    const [formData, setFormData] = useState({
        point_retail_id: selectedSalesPoint?.id || 0,
        full_name: '',
        phone: '',
        email: '',
        address: '',
        status: 'Обычный',
        discount: 0,
        discount_id: 0,
        amount_orders: "0",
        food_preferences: '',
        allergies: '',
        preferred_drinks: '',
        preferred_table: '',
        dietary_restrictions: ''
    });

    // Загружаем точки продаж и скидки при монтировании
    useEffect(() => {
        const token = localStorage.getItem('token');

        const fetchPointsRetail = async () => {
            setLoadingPoints(true);
            try {
                const response = await fetch('/points-retail/?skip=0&limit=100', {
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setPointsRetail(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error('Ошибка при загрузке точек продаж:', error);
            } finally {
                setLoadingPoints(false);
            }
        };

        const fetchDiscounts = async () => {
            setLoadingDiscounts(true);
            try {
                const response = await fetch('/discounts/?skip=0&limit=100', {
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setDiscounts(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error('Ошибка при загрузке скидок:', error);
            } finally {
                setLoadingDiscounts(false);
            }
        };

        fetchPointsRetail();
        fetchDiscounts();
    }, []);

    // Если выбрана точка продаж, устанавливаем ее по умолчанию
    useEffect(() => {
        if (selectedSalesPoint) {
            setFormData(prev => ({
                ...prev,
                point_retail_id: selectedSalesPoint.id
            }));
        }
    }, [selectedSalesPoint]);

    const handleInputChange = (field: string, value: string) => {
        const newFormData = {
            ...formData,
            [field]: value
        };

        // Если выбрана скидка из списка, устанавливаем соответствующее значение скидки
        if (field === 'discount_id' && value) {
            const selectedDiscountId = parseInt(value);
            const selectedDiscount = discounts.find(d => d.id === selectedDiscountId);
            if (selectedDiscount) {
                newFormData.discount_id = selectedDiscountId;
                newFormData.discount = parseFloat(selectedDiscount.count) || 0;
            }
        }

        setFormData(newFormData);
    };

    const handleAddGuest = async () => {
        if (!formData.full_name.trim() || !formData.phone.trim()) {
            alert('Пожалуйста, заполните обязательные поля: ФИО и телефон');
            return;
        }

        setLoading(true);

        try {
            const guestData = {
                point_retail_id: parseInt(formData.point_retail_id.toString()) || 0,
                full_name: formData.full_name.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim() || '',
                address: formData.address.trim() || '',
                status: formData.status,
                discount: parseFloat(formData.discount.toString()) || 0,
                discount_id: formData.discount_id || 0,
                amount_orders: formData.amount_orders || "0",
                metadate: {
                    food_preferences: formData.food_preferences.trim(),
                    allergies: formData.allergies.trim(),
                    preferred_drinks: formData.preferred_drinks.trim(),
                    preferred_table: formData.preferred_table.trim(),
                    dietary_restrictions: formData.dietary_restrictions.trim()
                },
                date_at: new Date().toISOString()
            };

            console.log('Отправляемые данные гостя:', guestData);
            const token = localStorage.getItem('token');
            const response = await fetch('/guests/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(guestData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка при добавлении гостя: ${errorText}`);
            }

            const result = await response.json();
            onGuestAdded(result);

            resetForm();
            onClose();

            alert('Гость успешно добавлен!');

        } catch (error) {
            console.error('Ошибка:', error);
            alert(`Не удалось добавить гостя: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            point_retail_id: selectedSalesPoint?.id || 0,
            full_name: '',
            phone: '',
            email: '',
            address: '',
            status: 'Обычный',
            discount: 0,
            discount_id: 0,
            amount_orders: "0",
            food_preferences: '',
            allergies: '',
            preferred_drinks: '',
            preferred_table: '',
            dietary_restrictions: ''
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAddGuest();
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    return (
        <div className="space-y-6">
            {/* Кнопка возврата */}
            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={handleCancel}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Назад к списку
                </Button>
                <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">Новый гость</Badge>
                    {selectedSalesPoint && (
                        <Badge variant="outline">
                            {selectedSalesPoint.name}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Заголовок */}
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-3">
                                <User className="h-6 w-6 text-orange-600" />
                                Добавление нового гостя
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Заполните всю необходимую информацию о новом госте. Поля с * обязательны для заполнения.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Отмена
                            </Button>
                            <Button
                                className="bg-orange-600 hover:bg-orange-700"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {loading ? 'Сохранение...' : 'Сохранить гостя'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Форма добавления гостя */}
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
                        {/* Основная информация */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Основная информация</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">ФИО *</label>
                                    <Input
                                        placeholder="Иванов Иван Иванович"
                                        value={formData.full_name}
                                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                                        required
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Телефон *</label>
                                    <Input
                                        placeholder="+7 (999) 123-45-67"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        required
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        placeholder="email@example.com"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Статус</label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => handleInputChange('status', value)}
                                    >
                                        <SelectTrigger    style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}>
                                            <SelectValue placeholder="Выберите статус" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Обычный">Обычный</SelectItem>
                                            <SelectItem value="VIP">VIP</SelectItem>
                                            <SelectItem value="Постоянный">Постоянный</SelectItem>
                                            <SelectItem value="Новый">Новый</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Точка продаж</label>
                                    <Select
                                        value={formData.point_retail_id.toString()}
                                        onValueChange={(value) => handleInputChange('point_retail_id', value)}
                                        disabled={loadingPoints}
                                    >
                                        <SelectTrigger    style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}>
                                            <SelectValue placeholder={loadingPoints ? "Загрузка..." : "Выберите точку продаж"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pointsRetail.map(point => (
                                                <SelectItem key={point.id} value={point.id.toString()}>
                                                    {point.name} ({point.address})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Скидка</label>
                                    <Select
                                        value={formData.discount_id.toString()}
                                        onValueChange={(value) => handleInputChange('discount_id', value)}
                                        disabled={loadingDiscounts}
                                    >
                                        <SelectTrigger    style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}>
                                            <SelectValue placeholder={loadingDiscounts ? "Загрузка скидок..." : "Выберите скидку"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Без скидки (0%)</SelectItem>
                                            {discounts.map(discount => (
                                                <SelectItem key={discount.id} value={discount.id.toString()}>
                                                    {discount.name} ({parseFloat(discount.count) || 0}%)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Значение скидки (%)</label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                        value={formData.discount}
                                        onChange={(e) => handleInputChange('discount', e.target.value)}
                                        className="bg-gray-50"
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Значение автоматически заполняется при выборе скидки
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Адрес</label>
                                    <Input
                                        placeholder="Адрес проживания"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Предпочтения в еде и напитках */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Предпочтения гостя</h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Предпочтения в еде</label>
                                    <Textarea
                                        placeholder="Любимые блюда, предпочтения по кухне, кулинарные предпочтения..."
                                        value={formData.food_preferences}
                                        onChange={(e) => handleInputChange('food_preferences', e.target.value)}
                                        rows={2}
                                        className="resize-none"
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Любимые блюда, тип кухни, предпочтения по приготовлению
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Предпочтительные напитки</label>
                                    <Textarea
                                        placeholder="Любимые напитки, алкогольные/безалкогольные предпочтения, кофе/чай..."
                                        value={formData.preferred_drinks}
                                        onChange={(e) => handleInputChange('preferred_drinks', e.target.value)}
                                        rows={2}
                                        className="resize-none"
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Алкогольные и безалкогольные напитки, способы приготовления кофе/чая
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Предпочтительный стол</label>
                                        <Input
                                            placeholder="У окна, в углу, в центре зала..."
                                            value={formData.preferred_table}
                                            onChange={(e) => handleInputChange('preferred_table', e.target.value)}
                                            style={{
                                                border: 'var(--custom-border-primary)',
                                                background: 'var(--custom-bg-inpyt)',
                                                color: 'var(--custom-text)',
                                            }}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Предпочтения по расположению стола
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Диетические ограничения</label>
                                        <Input
                                            placeholder="Вегетарианство, веганство, безглютеновая..."
                                            value={formData.dietary_restrictions}
                                            onChange={(e) => handleInputChange('dietary_restrictions', e.target.value)}
                                            style={{
                                                border: 'var(--custom-border-primary)',
                                                background: 'var(--custom-bg-inpyt)',
                                                color: 'var(--custom-text)',
                                            }}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Тип диеты или пищевые ограничения
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Аллергии и медицинские ограничения</label>
                                    <Textarea
                                        placeholder="Пищевые аллергии, медицинские противопоказания, непереносимости..."
                                        value={formData.allergies}
                                        onChange={(e) => handleInputChange('allergies', e.target.value)}
                                        rows={2}
                                        className="resize-none"
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Важная информация о здоровье гостя для обеспечения безопасности
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="hidden">
                            <Input
                                value={formData.amount_orders}
                                onChange={(e) => handleInputChange('amount_orders', e.target.value)}

                            />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};