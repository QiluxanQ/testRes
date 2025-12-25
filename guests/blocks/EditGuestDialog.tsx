import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Textarea } from "../../../ui/textarea";
import { Edit } from 'lucide-react';
import { Guest } from '../../../../types/guest';

interface PointRetail {
    id: number;
    name: string;
    address: string;
    type: string;
}

interface EditGuestDialogProps {
    guest: Guest | null;
    isOpen: boolean;
    onClose: () => void;
    onGuestUpdated: (updatedGuest: Guest) => void;
}

export const EditGuestDialog: React.FC<EditGuestDialogProps> = ({
                                                                    guest,
                                                                    isOpen,
                                                                    onClose,
                                                                    onGuestUpdated
                                                                }) => {
    const [loading, setLoading] = useState(false);
    const [pointsRetail, setPointsRetail] = useState<PointRetail[]>([]);
    const [loadingPoints, setLoadingPoints] = useState(false);
    const [formData, setFormData] = useState({
        point_retail_id: 0,
        full_name: '',
        phone: '',
        email: '',
        address: '',
        status: 'Обычный',
        discount: 0,
        amount_orders: "0",
        food_preferences: '',
        allergies: '',
        preferred_drinks: '',
        preferred_table: '',
        dietary_restrictions: ''
    });


    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchPointsRetail = async () => {
            setLoadingPoints(true);
            try {
                const response = await fetch('/points-retail/?skip=0&limit=100',{
                    headers:{
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

        if (isOpen) {
            fetchPointsRetail();
        }
    }, [isOpen]);

    // Заполняем форму данными гостя при открытии
    useEffect(() => {
        if (guest) {
            const metadata = guest.metadate || {};
            setFormData({
                point_retail_id: guest.point_retail_id || 0,
                full_name: guest.full_name || '',
                phone: guest.phone || '',
                email: guest.email || '',
                address: guest.address || '',
                status: guest.status || 'Обычный',
                discount: guest.discount || 0,
                amount_orders: guest.amount_orders || "0",
                food_preferences: metadata.food_preferences || '',
                allergies: metadata.allergies || '',
                preferred_drinks: metadata.preferred_drinks || '',
                preferred_table: metadata.preferred_table || '',
                dietary_restrictions: metadata.dietary_restrictions || ''
            });
        }
    }, [guest]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUpdateGuest = async () => {
        const token = localStorage.getItem('token');
        if (!guest || !formData.full_name.trim() || !formData.phone.trim()) {
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
                amount_orders: formData.amount_orders || "0",
                metadate: {
                    ...(guest.metadate || {}),
                    food_preferences: formData.food_preferences.trim(),
                    allergies: formData.allergies.trim(),
                    preferred_drinks: formData.preferred_drinks.trim(),
                    preferred_table: formData.preferred_table.trim(),
                    dietary_restrictions: formData.dietary_restrictions.trim()
                }
            };

            console.log('Обновляемые данные гостя:', guestData);

            const response = await fetch(`/guests/${guest.id}`, {
                method: 'PUT',
                headers:{
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(guestData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка при обновлении гостя: ${errorText}`);
            }

            const result = await response.json();
            console.log('Гость обновлен:', result);

            onGuestUpdated(result);
            onClose();

            alert('Данные гостя успешно обновлены!');

        } catch (error) {
            console.error('Ошибка:', error);
            alert(`Не удалось обновить данные гостя: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleUpdateGuest();
    };

    if (!guest) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Редактировать гостя</DialogTitle>
                    <DialogDescription>
                        Измените информацию о госте. Поля с * обязательны для заполнения.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Основная информация */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">ФИО *</label>
                                <Input
                                    placeholder="Иванов Иван Иванович"
                                    value={formData.full_name}
                                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Телефон *</label>
                                <Input
                                    placeholder="+7 (999) 123-45-67"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    placeholder="email@example.com"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                            </div>

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
                                        <SelectItem value="Обычный">Обычный</SelectItem>
                                        <SelectItem value="VIP">VIP</SelectItem>
                                        <SelectItem value="Постоянный">Постоянный</SelectItem>
                                        <SelectItem value="Новый">Новый</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Точка продаж</label>
                                <Select
                                    value={formData.point_retail_id.toString()}
                                    onValueChange={(value) => handleInputChange('point_retail_id', value)}
                                    disabled={loadingPoints}
                                >
                                    <SelectTrigger>
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

                            <div>
                                <label className="text-sm font-medium">Скидка (%)</label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="0"
                                    min="0"
                                    max="100"
                                    value={formData.discount}
                                    onChange={(e) => handleInputChange('discount', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Адрес</label>
                            <Input
                                placeholder="Адрес проживания"
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                            />
                        </div>

                        {/* Предпочтения в еде и напитках */}
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium">Предпочтения в еде</label>
                                <Textarea
                                    placeholder="Любимые блюда, предпочтения по кухне, кулинарные предпочтения..."
                                    value={formData.food_preferences}
                                    onChange={(e) => handleInputChange('food_preferences', e.target.value)}
                                    rows={2}
                                    className="resize-none"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Любимые блюда, тип кухни, предпочтения по приготовлению
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Предпочтительные напитки</label>
                                <Textarea
                                    placeholder="Любимые напитки, алкогольные/безалкогольные предпочтения, кофе/чай..."
                                    value={formData.preferred_drinks}
                                    onChange={(e) => handleInputChange('preferred_drinks', e.target.value)}
                                    rows={2}
                                    className="resize-none"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Алкогольные и безалкогольные напитки, способы приготовления кофе/чая
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Предпочтительный стол</label>
                                    <Input
                                        placeholder="У окна, в углу, в центре зала..."
                                        value={formData.preferred_table}
                                        onChange={(e) => handleInputChange('preferred_table', e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Предпочтения по расположению стола
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Диетические ограничения</label>
                                    <Input
                                        placeholder="Вегетарианство, веганство, безглютеновая..."
                                        value={formData.dietary_restrictions}
                                        onChange={(e) => handleInputChange('dietary_restrictions', e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Тип диеты или пищевые ограничения
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Аллергии и медицинские ограничения</label>
                                <Textarea
                                    placeholder="Пищевые аллергии, медицинские противопоказания, непереносимости..."
                                    value={formData.allergies}
                                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                                    rows={2}
                                    className="resize-none"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Важная информация о здоровье гостя для обеспечения безопасности
                                </p>
                            </div>
                        </div>

                        {/* Информация о заказах (только для чтения) */}
                        <div className="border-t pt-4">
                            <h4 className="text-sm font-medium mb-2">Статистика заказов</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Количество заказов:</span>
                                    <p className="font-medium">{formData.amount_orders}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">ID гостя:</span>
                                    <p className="font-medium">{guest.id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Кнопки */}
                        <div className="flex justify-end space-x-2 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                className="bg-orange-600 hover:bg-orange-700"
                                disabled={loading}
                            >
                                {loading ? 'Сохранение...' : 'Сохранить изменения'}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};