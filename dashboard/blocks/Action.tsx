import React, {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "../../../ui/card";
import {Button} from "../../../ui/button";
import {
    BarChart3,
    Bell, BookOpen,
    Calendar,
    ChefHat,
    DollarSign,
    Package,
    Plus,
    Settings,
    ShoppingCart,
    Users, X
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../../../ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../../ui/dialog";
import {Input} from "../../../ui/input";
import {Label} from "../../../ui/label";
import {Textarea} from "../../../ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../../ui/select";
import {timeSlots, zones} from '../../../../utils/reservationFilter';
import {Switch} from "../../../ui/switch";

const avaibleActions = [
    {id: 'notifications', label: 'Уведомления', icon: Bell, variant: 'outline'},
    {id: 'schedule', label: 'Добавить поставщика', icon: Package, variant: 'outline'},
    {id: 'inventory', label: 'Инвентарь', icon: Package, variant: 'outline'},
]

const defaultActions = [
    {
        id: 'new-order',
        label: 'Новый заказ',
        icon: ShoppingCart,
        variant: 'default',
        className: 'bg-orange-600 hover:bg-orange-700'
    },
    {id: 'check-kitchen', label: 'Добавить блюдо', icon: ChefHat, variant: 'outline'},
    {id: 'seat-guests', label: 'Посадить гостей', icon: Users, variant: 'outline'},
    {id: 'daily-report', label: 'Новое бронирование', icon: BookOpen, variant: 'outline'},
]

const Action = () => {
    const currentDate = new Date().toLocaleDateString('ru-RU');
    const currentTime = new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});

    const [actions, setActions] = useState(defaultActions);
    const [openModal, setOpenModal] = useState(null);
    const [formData, setFormData] = useState({});

    const addAction = (actionId) => {
        const actionAdd = avaibleActions.find(a => a.id === actionId);
        if (actionAdd && !actions.find(a => a.id === actionId)) {
            setActions(prev => [...prev, actionAdd]);
        }
    }

    const removeAction = (actionId) => {
        if (defaultActions.find(a => a.id === actionId)) {
            return
        }
        setActions(prev => prev.filter(a => a.id !== actionId));
    }

    const handleOpenModal = (actionId) => {
        setOpenModal(actionId);
        setFormData({});
    }

    const handleCloseModal = () => {
        setOpenModal(null);
        setFormData({});
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }

    const handleSubmit = () => {
        console.log(`Данные для ${openModal}:`, formData);

        handleCloseModal();
    }

    // Функции для рендеринга разных модальных окон
    const renderModalContent = () => {
        switch (openModal) {
            case 'new-order':
                return (
                    <>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Создать новый заказ</DialogTitle>
                                <DialogDescription>Заполните детали нового заказа</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Стол</label>
                                        <Select onValueChange={(value) => handleInputChange('table', value)} >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Выберите стол" />
                                            </SelectTrigger>
                                            <SelectContent   >
                                                <SelectItem value="Стол 1">Стол 1</SelectItem>
                                                <SelectItem value="Стол 2">Стол 2</SelectItem>
                                                <SelectItem value="Доставка">Доставка</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Официант</label>
                                        <Select onValueChange={(value) => handleInputChange('waiter', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Выберите официанта" />
                                            </SelectTrigger>
                                            <SelectContent   >
                                                <SelectItem value="Анна">Анна С.</SelectItem>
                                                <SelectItem value="Петр">Петр К.</SelectItem>
                                                <SelectItem value="Мария">Мария Л.</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Имя гостя</label>
                                        <Input placeholder="Введите имя гостя"    onChange={(e) => handleInputChange('guestName', e.target.value)}/>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Телефон</label>
                                        <Input placeholder="+7 999 123 45 67"   onChange={(e) => handleInputChange('phone', e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={handleCloseModal}>Отмена</Button>
                                    <Button onClick={handleSubmit}>Создать заказ</Button>
                                </div>
                            </div>
                        </DialogContent>

                    </>
                );

            case 'seat-guests':
                return (
                    <>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Добавить нового гостя</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">ФИО</label>
                                        <Input onChange={(e) => handleInputChange('fio', e.target.value)} placeholder="Фамилия Имя Отчество" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Телефон</label>
                                        <Input onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="+7 (999) 123-45-67" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Email</label>
                                        <Input onChange={(e) => handleInputChange('mail', e.target.value)} placeholder="email@example.com" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Дата рождения</label>
                                        <Input onChange={(e) => handleInputChange('data', e.target.value)} type="date" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Статус</label>
                                        <Select onValueChange={(e) => handleInputChange('statys', e)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Выберите статус" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="regular">Обычный</SelectItem>
                                                <SelectItem value="premium">Премиум</SelectItem>
                                                <SelectItem value="vip">VIP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Категория</label>
                                        <Select onValueChange={(e) => handleInputChange('kategoria', e)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Выберите категорию" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="new">Новый гость</SelectItem>
                                                <SelectItem value="regular">Постоянный гость</SelectItem>
                                                <SelectItem value="corporate">Корпоративный клиент</SelectItem>
                                                <SelectItem value="tourist">Турист</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Предпочтения</label>
                                    <Input onChange={(e) => handleInputChange('predpoch', e.target.value)} placeholder="Предпочтения в еде, обслуживании (через запятую)" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Аллергии</label>
                                    <Input onChange={(e) => handleInputChange('alergia', e.target.value)} placeholder="Аллергии и ограничения (через запятую)" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Примечания</label>
                                    <Input onChange={(e) => handleInputChange('primechania', e.target.value)} placeholder="Дополнительная информация о госте" />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={handleCloseModal}>Отмена</Button>
                                    <Button onClick={handleSubmit}>Добавить гостя</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </>
                );

            case 'check-kitchen':
                return (
                    <>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Добавить блюдо</DialogTitle>
                                <DialogDescription>Заполните информацию о новом блюде для меню</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Название</label>
                                        <Input
                                            placeholder="Название блюда"


                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Цена (₽)</label>
                                        <Input
                                            type="number"
                                            placeholder="Цена"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Время приготовления (мин)</label>
                                        <Input
                                            type="number"
                                            placeholder="Минуты"

                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Калории</label>
                                        <Input
                                            type="number"
                                            placeholder="Калории"

                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Описание</label>
                                    <Textarea
                                        placeholder="Описание блюда"

                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Ингредиенты (через запятую)</label>
                                    <Input
                                        placeholder="Ингредиент 1, Ингредиент 2, ..."

                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Аллергены (через запятую)</label>
                                    <Input
                                        placeholder="Глютен, Молоко, ..."

                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <Switch

                                        />
                                        <span className="text-sm">Доступно</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch

                                        />
                                        <span className="text-sm">Популярное</span>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline">Отмена</Button>
                                    <Button >Добавить</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </>
                );

            case 'daily-report':
                return (
                    <>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Создать бронирование</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">ФИО гостя</label>
                                        <Input
                                            placeholder="Фамилия Имя Отчество"
                                            onChange={(e) => handleInputChange('guestName', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Телефон</label>
                                        <Input
                                            placeholder="+7 (999) 123-45-67"

                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Дата</label>
                                        <Input
                                            type="date"

                                            onChange={(e) => handleInputChange('date', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Время</label>
                                        <Select  onValueChange={(value) => handleInputChange('time', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Выберите время" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map(time => (
                                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Количество гостей</label>
                                        <Input
                                            type="number"
                                            placeholder="2"

                                            onChange={(e) => handleInputChange('guests', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Предпочитаемая зона</label>
                                    <Select  onValueChange={(value) => handleInputChange('zone', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Выберите зону" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {zones.map(zone => (
                                                <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Особые пожелания</label>
                                    <Textarea
                                        placeholder="Дополнительные пожелания к бронированию"

                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline">Отмена</Button>
                                    <Button className="bg-orange-600 hover:bg-orange-700">Создать бронирование</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </>
                );

            default:
                return null;
        }
    }

    return (
        <div>
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader>
                    <CardTitle className="text-white" style={{color:'var(--custom-text)'}}>Быстрые действия</CardTitle>
                    <div className="text-sm text-muted-foreground">
                        {currentDate}, {currentTime}
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    {actions.map((action) => {
                        const IconComponent = action.icon
                        return (
                            <div key={action.id} className='relative group'>
                                <Button
                                    className={`w-full ${action.className || ''} pr-10 text-white cursor-pointer`}
                                    variant={action.variant}
                                    onClick={() => handleOpenModal(action.id)}
                                    style={{
                                        borderRadius: '20px',
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-primaryLine)',
                                        color: 'var(--custom-text)',
                                    }}
                                >
                                    <IconComponent className='h-4 w-4 mr-2'/>
                                    {action.label}
                                </Button>
                                {!defaultActions.find(defaultAction => defaultAction.id === action.id) && (
                                    <Button
                                        variant='outline'
                                        size='icon'
                                        onClick={() => removeAction(action.id)}
                                        className='absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-200 transition-opacity text-white cursor-pointer'
                                    >
                                        <X className='h-3 w-3'/>
                                    </Button>
                                )}
                            </div>
                        )
                    })}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="w-full text-white cursor-pointer" variant="outline"
                                    style={{
                                        borderRadius: '20px',
                                        border: '1px solid #334155',
                                        background: '#08ff08a1'
                                    }}
                            >
                                <Plus className="h-4 w-4 mr-2"/>
                                Добавить действие
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Выберите действие</DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            {avaibleActions
                                .filter(action => !actions.find(a => a.id === action.id))
                                .map((action) => {
                                    const IconComponent = action.icon;
                                    return (
                                        <DropdownMenuItem
                                            key={action.id}
                                            onClick={() => addAction(action.id)}

                                        >
                                            <IconComponent className="h-4 w-4 mr-2" />
                                            <span>{action.label}</span>
                                        </DropdownMenuItem>
                                    );
                                })}
                            {avaibleActions.filter(action => !actions.find(a => a.id === action.id)).length === 0 && (
                                <DropdownMenuItem disabled>
                                    Все действия добавлены
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardContent>
            </Card>
        </div>
    );
};

export default Action;