import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../.././ui/card';
import { Button } from '../.././ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Plus, Edit2, Trash2, BookOpen, Tag, Utensils, Users, CreditCard, Clock, Briefcase, ShoppingBag, AlertTriangle, Leaf, Percent, TrendingUp, Package, MapPin, AlertCircle } from 'lucide-react';

// Типы справочников
type DictionaryItem = {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
};

type Dictionary = {
  id: string;
  name: string;
  icon: any;
  items: DictionaryItem[];
};

// Типы для данных из API
type Modifier = {
  id: number;
  name: string;
  price: string;
  metadate?: any;
};

type Discount = {
  id: number;
  point_retail_id: number;
  name: string;
  count: string;
  metadate?: any;
};

type ExtraCharge = {
  id: number;
  point_retail_id: number;
  name: string;
  count: string;
  metadate?: any;
};

type Allergen = {
  id: number;
  name: string;
  description?: string;
  metadate?: any;
};

const initialDictionaries: Dictionary[] = [
  {
    id: 'units',
    name: 'Единицы измерения',
    icon: Tag,
    items: [
      { id: 1, name: 'кг', description: 'Килограмм', isActive: true },
      { id: 2, name: 'г', description: 'Грамм', isActive: true },
      { id: 3, name: 'л', description: 'Литр', isActive: true },
      { id: 4, name: 'мл', description: 'Миллилитр', isActive: true },
      { id: 5, name: 'шт', description: 'Штука', isActive: true },
      { id: 6, name: 'порция', description: 'Порция', isActive: true },
    ]
  },
  {
    id: 'guest_categories',
    name: 'Категории гостей',
    icon: Users,
    items: [
      { id: 1, name: 'VIP', description: 'Особо важные гости', color: '#fbbf24', isActive: true },
      { id: 2, name: 'Постоянные', description: 'Частые посетители', color: '#3b82f6', isActive: true },
      { id: 3, name: 'Новые', description: 'Первый визит', color: '#10b981', isActive: true },
      { id: 4, name: 'Корпоративные', description: 'Корпоративные клиенты', color: '#8b5cf6', isActive: true },
    ]
  },
  {
    id: 'payment_types',
    name: 'Типы оплаты',
    icon: CreditCard,
    items: [
      { id: 1, name: 'Наличные', description: 'Оплата наличными', isActive: true },
      { id: 2, name: 'Банковская карта', description: 'Оплата картой', isActive: true },
      { id: 3, name: 'Безналичный расчет', description: 'Банковский перевод', isActive: true },
      { id: 4, name: 'Электронный кошелек', description: 'СБП, Qiwi и др.', isActive: true },
      { id: 5, name: 'Сертификат', description: 'Подарочный сертификат', isActive: true },
    ]
  },
  {
    id: 'order_statuses',
    name: 'Статусы заказов',
    icon: Clock,
    items: [
      { id: 1, name: 'Новый', description: 'Заказ только создан', color: '#3b82f6', isActive: true },
      { id: 2, name: 'Принят', description: 'Заказ принят на кухню', color: '#8b5cf6', isActive: true },
      { id: 3, name: 'Готовится', description: 'В процессе приготовления', color: '#f59e0b', isActive: true },
      { id: 4, name: 'Готов', description: 'Готов к подаче', color: '#10b981', isActive: true },
      { id: 5, name: 'Подан', description: 'Подан гостю', color: '#06b6d4', isActive: true },
      { id: 6, name: 'Отменен', description: 'Заказ отменен', color: '#ef4444', isActive: true },
    ]
  },
  {
    id: 'positions',
    name: 'Должности персонала',
    icon: Briefcase,
    items: [
      { id: 1, name: 'Официант', description: 'Обслуживание гостей', isActive: true },
      { id: 2, name: 'Бармен', description: 'Приготовление напитков', isActive: true },
      { id: 3, name: 'Повар', description: 'Приготовление блюд', isActive: true },
      { id: 4, name: 'Су-шеф', description: 'Помощник шеф-повара', isActive: true },
      { id: 5, name: 'Шеф-повар', description: 'Главный повар', isActive: true },
      { id: 6, name: 'Менеджер зала', description: 'Управление залом', isActive: true },
      { id: 7, name: 'Администратор', description: 'Администрирование', isActive: true },
      { id: 8, name: 'Хостес', description: 'Встреча гостей', isActive: true },
    ]
  },
  {
    id: 'expense_categories',
    name: 'Категории расходов',
    icon: ShoppingBag,
    items: [
      { id: 1, name: 'Продукты', description: 'Закупка продуктов', color: '#10b981', isActive: true },
      { id: 2, name: 'Зарплата', description: 'Выплата зарплаты', color: '#3b82f6', isActive: true },
      { id: 3, name: 'Аренда', description: 'Аренда помещения', color: '#f59e0b', isActive: true },
      { id: 4, name: 'Коммунальные услуги', description: 'Свет, вода, газ', color: '#06b6d4', isActive: true },
      { id: 5, name: 'Оборудование', description: 'Покупка и ремонт', color: '#8b5cf6', isActive: true },
      { id: 6, name: 'Маркетинг', description: 'Реклама и продвижение', color: '#ec4899', isActive: true },
      { id: 7, name: 'Прочие расходы', description: 'Другие расходы', color: '#6b7280', isActive: true },
    ]
  },

  {
    id: 'dietary_restrictions',
    name: 'Диетические ограничения',
    icon: Leaf,
    items: [
      { id: 1, name: 'Вегетарианство', description: 'Без мяса и рыбы', color: '#10b981', isActive: true },
      { id: 2, name: 'Веганство', description: 'Без продуктов животного происхождения', color: '#22c55e', isActive: true },
      { id: 3, name: 'Безглютеновая', description: 'Без глютена', color: '#f59e0b', isActive: true },
      { id: 4, name: 'Безлактозная', description: 'Без молочных продуктов', color: '#3b82f6', isActive: true },
      { id: 5, name: 'Халяль', description: 'Согласно исламским правилам', color: '#8b5cf6', isActive: true },
      { id: 6, name: 'Кошер', description: 'Согласно иудейским правилам', color: '#06b6d4', isActive: true },
    ]
  },
];

interface DictionariesProps {
  selectedSalesPoint: any;
}

export function Dictionaries({ selectedSalesPoint }: DictionariesProps) {
  const [dictionaries, setDictionaries] = useState<Dictionary[]>(initialDictionaries);
  const [activeTab, setActiveTab] = useState(dictionaries[0].id);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DictionaryItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<DictionaryItem>>({
    name: '',
    description: '',
    color: '#3b82f6',
    isActive: true,
  });

  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [extraCharges, setExtraCharges] = useState<ExtraCharge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPointWarning, setShowPointWarning] = useState(false);

  const [newModifier, setNewModifier] = useState({
    name: '',
    price: '0.00'
  });
  const [newDiscount, setNewDiscount] = useState({
    name: '',
    count: '0.00'
  });
  const [newExtraCharge, setNewExtraCharge] = useState({
    name: '',
    count: '0.00'
  });
  const [newAllergen, setNewAllergen] = useState({
    name: '',
    description: ''
  });

  const activeDictionary = dictionaries.find(d => d.id === activeTab);

  const loadApiData = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    const shouldFilterByPoint = ['discounts', 'extra_charges'].includes(activeTab);
    const pointId = selectedSalesPoint?.id;

    if (shouldFilterByPoint && !pointId) {
      setShowPointWarning(true);
    } else {
      setShowPointWarning(false);
    }

    try {
      const modifiersPromise = fetch('/modifiers/?skip=0&limit=100', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const discountsUrl = pointId
          ? `/discounts/?skip=0&limit=100&point_retail_id=${pointId}`
          : '/discounts/?skip=0&limit=100';
      const discountsPromise = fetch(discountsUrl, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const extraChargesUrl = pointId
          ? `/extra-charges/?skip=0&limit=500&point_retail_id=${pointId}`
          : '/extra-charges/?skip=0&limit=500';
      const extraChargesPromise = fetch(extraChargesUrl, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const allergensUrl = '/allergens/?skip=0&limit=500';
      const allergensPromise = fetch(allergensUrl, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const [modifiersResponse, discountsResponse, extraChargesResponse, allergensResponse] = await Promise.all([
        modifiersPromise,
        discountsPromise,
        extraChargesPromise,
        allergensPromise
      ]);

      if (modifiersResponse.ok) {
        const modifiersData = await modifiersResponse.json();
        setModifiers(Array.isArray(modifiersData) ? modifiersData : []);
      }

      if (discountsResponse.ok) {
        const discountsData = await discountsResponse.json();
        setDiscounts(Array.isArray(discountsData) ? discountsData : []);
      }

      if (extraChargesResponse.ok) {
        const extraChargesData = await extraChargesResponse.json();
        setExtraCharges(Array.isArray(extraChargesData) ? extraChargesData : []);
      }

      if (allergensResponse.ok) {
        const allergensData = await allergensResponse.json();
        setAllergens(Array.isArray(allergensData) ? allergensData : []);
      }
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError('Не удалось загрузить данные');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApiData();
  }, [activeTab, selectedSalesPoint?.id]);

  const handleAddModifier = async () => {
    const token = localStorage.getItem('token');
    if (!newModifier.name) return;

    try {
      const response = await fetch('/modifiers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newModifier.name,
          price: newModifier.price,
          metadate: {}
        })
      });

      if (response.ok) {
        await loadApiData();
        setNewModifier({ name: '', price: '0.00' });
        alert('Модификатор успешно добавлен!');
      } else {
        const errorText = await response.text();
        throw new Error(`Ошибка: ${errorText}`);
      }
    } catch (err) {
      console.error('Ошибка добавления модификатора:', err);
      alert('Не удалось добавить модификатор');
    }
  };

  const handleAddDiscount = async () => {
    const token = localStorage.getItem('token');
    if (!newDiscount.name) return;

    const pointId = selectedSalesPoint?.id;

    if (!pointId) {
      alert('Пожалуйста, выберите точку продаж для добавления скидки');
      return;
    }

    try {
      const response = await fetch('/discounts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          point_retail_id: pointId,
          name: newDiscount.name,
          count: newDiscount.count,
          metadate: {}
        })
      });

      if (response.ok) {
        await loadApiData();
        setNewDiscount({ name: '', count: '0.00' });
        alert(`Скидка успешно добавлена для точки "${selectedSalesPoint.name}"!`);
      } else {
        const errorText = await response.text();
        throw new Error(`Ошибка: ${errorText}`);
      }
    } catch (err) {
      console.error('Ошибка добавления скидки:', err);
      alert('Не удалось добавить скидку');
    }
  };

  const handleAddExtraCharge = async () => {
    const token = localStorage.getItem('token');
    if (!newExtraCharge.name) return;

    const pointId = selectedSalesPoint?.id;

    if (!pointId) {
      alert('Пожалуйста, выберите точку продаж для добавления наценки');
      return;
    }

    try {
      const response = await fetch('/extra-charges/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          point_retail_id: pointId,
          name: newExtraCharge.name,
          count: newExtraCharge.count,
          metadate: {}
        })
      });

      if (response.ok) {
        await loadApiData();
        setNewExtraCharge({ name: '', count: '0.00' });
        alert(`Наценка успешно добавлена для точки "${selectedSalesPoint.name}"!`);
      } else {
        const errorText = await response.text();
        throw new Error(`Ошибка: ${errorText}`);
      }
    } catch (err) {
      console.error('Ошибка добавления наценки:', err);
      alert('Не удалось добавить наценку');
    }
  };

  const handleAddAllergen = async () => {
    const token = localStorage.getItem('token');
    if (!newAllergen.name) return;

    try {
      const response = await fetch('/allergens/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newAllergen.name,
          description: newAllergen.description,
          metadate: {}
        })
      });

      if (response.ok) {
        await loadApiData();
        setNewAllergen({ name: '', description: '' });
        alert('Аллерген успешно добавлен!');
      } else {
        const errorText = await response.text();
        throw new Error(`Ошибка: ${errorText}`);
      }
    } catch (err) {
      console.error('Ошибка добавления аллергена:', err);
      alert('Не удалось добавить аллерген');
    }
  };

  // Функции для удаления
  const handleDeleteModifier = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот модификатор?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/modifiers/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadApiData();
        alert('Модификатор успешно удален!');
      }
    } catch (err) {
      console.error('Ошибка удаления модификатора:', err);
      alert('Не удалось удалить модификатор');
    }
  };

  const handleDeleteDiscount = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту скидку?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/discounts/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadApiData();
        alert('Скидка успешно удалена!');
      }
    } catch (err) {
      console.error('Ошибка удаления скидки:', err);
      alert('Не удалось удалить скидку');
    }
  };

  const handleDeleteExtraCharge = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту наценку?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/extra-charges/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadApiData();
        alert('Наценка успешно удалена!');
      }
    } catch (err) {
      console.error('Ошибка удаления наценки:', err);
      alert('Не удалось удалить наценку');
    }
  };

  const handleDeleteAllergen = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот аллерген?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/allergens/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadApiData();
        alert('Аллерген успешно удален!');
      }
    } catch (err) {
      console.error('Ошибка удаления аллергена:', err);
      alert('Не удалось удалить аллерген');
    }
  };

  const handleAddItem = () => {
    if (!activeDictionary || !newItem.name) return;

    const maxId = Math.max(...activeDictionary.items.map(i => i.id), 0);
    const itemToAdd: DictionaryItem = {
      id: maxId + 1,
      name: newItem.name,
      description: newItem.description || '',
      color: newItem.color,
      isActive: true,
    };

    setDictionaries(dictionaries.map(d =>
        d.id === activeTab
            ? { ...d, items: [...d.items, itemToAdd] }
            : d
    ));

    setNewItem({ name: '', description: '', color: '#3b82f6', isActive: true });
    setIsAddDialogOpen(false);
  };

  const handleEditItem = () => {
    if (!activeDictionary || !editingItem) return;

    setDictionaries(dictionaries.map(d =>
        d.id === activeTab
            ? {
              ...d,
              items: d.items.map(item =>
                  item.id === editingItem.id ? editingItem : item
              )
            }
            : d
    ));

    setEditingItem(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteItem = (itemId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;

    setDictionaries(dictionaries.map(d =>
        d.id === activeTab
            ? { ...d, items: d.items.filter(item => item.id !== itemId) }
            : d
    ));
  };

  const handleToggleActive = (itemId: number) => {
    setDictionaries(dictionaries.map(d =>
        d.id === activeTab
            ? {
              ...d,
              items: d.items.map(item =>
                  item.id === itemId ? { ...item, isActive: !item.isActive } : item
              )
            }
            : d
    ));
  };

  const extendedDictionaries: Dictionary[] = [
    ...dictionaries,
    {
      id: 'modifiers',
      name: 'Модификаторы',
      icon: Package,
      items: modifiers.map(modifier => ({
        id: modifier.id,
        name: modifier.name,
        description: `Цена: ${modifier.price} ₽`,
        isActive: true
      }))
    },
    {
      id: 'discounts',
      name: 'Скидки',
      icon: Percent,
      items: discounts.map(discount => ({
        id: discount.id,
        name: discount.name,
        description: `Размер: ${discount.count}%${selectedSalesPoint ? ` • Точка: ${selectedSalesPoint.name}` : ''}`,
        color: '#10b981',
        isActive: true
      }))
    },
    {
      id: 'extra_charges',
      name: 'Наценки',
      icon: TrendingUp,
      items: extraCharges.map(charge => ({
        id: charge.id,
        name: charge.name,
        description: `Размер: ${charge.count}%${selectedSalesPoint ? ` • Точка: ${selectedSalesPoint.name}` : ''}`,
        color: '#f59e0b',
        isActive: true
      }))
    },
    {
      id: 'allergens',
      name: 'Аллергены ',
      icon: AlertTriangle,
      items: allergens.map(allergen => ({
        id: allergen.id,
        name: allergen.name,
        description: allergen.description || '—',
        color: '#ef4444',
        isActive: true
      }))
    }
  ];

  return (
      <div className="space-y-6">
        <Card style={{
          borderRadius: '20px',
          border: 'var(--custom-border-primary)',
          background: 'var(--custom-bg-secondaryLineCard)',
          color: 'var(--custom-text)',
        }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-orange-600" />
                  Справочники системы
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Управление справочными данными ресторана
                  {selectedSalesPoint && (
                      <span className="ml-2 flex items-center gap-1 text-orange-600 font-medium">
                    <MapPin className="h-3 w-3" />
                    Точка: {selectedSalesPoint.name}
                  </span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={loadApiData}
                    disabled={isLoading}
                >
                  {isLoading ? 'Загрузка...' : 'Обновить данные'}
                </Button>
                <Button
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() => setIsAddDialogOpen(true)}
                    disabled={['discounts', 'extra_charges'].includes(activeTab) && !selectedSalesPoint}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить запись
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="text-red-600">{error}</div>
              </CardContent>
            </Card>
        )}

        {showPointWarning && (activeTab === 'discounts' || activeTab === 'extra_charges') && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Точка продаж не выбрана</p>
                    <p className="text-sm">
                      Пожалуйста, выберите точку продаж для отображения скидок и наценок
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex w-full flex-nowrap overflow-x-auto gap-3 h-auto p-2">
            {extendedDictionaries.map((dict) => {
              const Icon = dict.icon;
              return (
                  <TabsTrigger
                      key={dict.id}
                      value={dict.id}
                      className="flex-shrink-0 w-full flex items-center justify-center gap-2 py-2 px-3 sm:px-4 text-xs sm:text-sm"
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{dict.name}</span>
                  </TabsTrigger>
              );
            })}
          </TabsList>

          {extendedDictionaries.map((dict) => (
              <TabsContent key={dict.id} value={dict.id} className="space-y-4">
                <Card style={{
                  borderRadius: '20px',
                  border: 'var(--custom-border-primary)',
                  background: 'var(--custom-bg-secondaryLineCard)',
                  color: 'var(--custom-text)',
                }}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {React.createElement(dict.icon, { className: "h-5 w-5 text-orange-600" })}
                          {dict.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Всего записей: {dict.items.length}
                          {dict.id === 'discounts' && selectedSalesPoint && (
                              <span className="ml-2">• Для точки: {selectedSalesPoint.name}</span>
                          )}
                          {dict.id === 'extra_charges' && selectedSalesPoint && (
                              <span className="ml-2">• Для точки: {selectedSalesPoint.name}</span>
                          )}
                        </p>
                      </div>

                      {dict.id === 'modifiers' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Добавить модификатор
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white text-black">
                              <DialogHeader>
                                <DialogTitle>Добавить модификатор</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <label className="text-sm font-medium mb-2 block">Название *</label>
                                  <Input
                                      className="bg-white text-black border-gray-300"
                                      value={newModifier.name}
                                      onChange={(e) => setNewModifier({ ...newModifier, name: e.target.value })}
                                      placeholder="Название модификатора"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-2 block">Цена</label>
                                  <Input
                                      className="bg-white text-black border-gray-300"
                                      type="number"
                                      step="0.01"
                                      value={newModifier.price}
                                      onChange={(e) => setNewModifier({ ...newModifier, price: e.target.value })}
                                      placeholder="0.00"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                    onClick={handleAddModifier}
                                    disabled={!newModifier.name}
                                >
                                  Добавить
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                      )}
                      {dict.id === 'discounts' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                  size="sm"
                                  className="bg-orange-600 hover:bg-orange-700 text-white"
                                  disabled={!selectedSalesPoint}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Добавить скидку
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white text-black">
                              <DialogHeader>
                                <DialogTitle>
                                  Добавить скидку {selectedSalesPoint && `для "${selectedSalesPoint.name}"`}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                {selectedSalesPoint ? (
                                    <>
                                      <div>
                                        <label className="text-sm font-medium mb-2 block">Точка продаж</label>
                                        <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-3">
                                          <MapPin className="h-4 w-4 text-gray-500" />
                                          <div>
                                            <div className="font-medium">{selectedSalesPoint.name}</div>
                                            <div className="text-sm text-gray-500">{selectedSalesPoint.address}</div>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium mb-2 block">Название *</label>
                                        <Input
                                            className="bg-white text-black border-gray-300"
                                            value={newDiscount.name}
                                            onChange={(e) => setNewDiscount({ ...newDiscount, name: e.target.value })}
                                            placeholder="Название скидки"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium mb-2 block">Размер (%)</label>
                                        <Input
                                            className="bg-white text-black border-gray-300"
                                            type="number"
                                            step="0.01"
                                            value={newDiscount.count}
                                            onChange={(e) => setNewDiscount({ ...newDiscount, count: e.target.value })}
                                            placeholder="0.00"
                                        />
                                      </div>
                                    </>
                                ) : (
                                    <div className="text-center py-6">
                                      <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                                      <p className="text-gray-600">Пожалуйста, выберите точку продаж для добавления скидки</p>
                                    </div>
                                )}
                              </div>
                              <DialogFooter>
                                <Button
                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                    onClick={handleAddDiscount}
                                    disabled={!newDiscount.name || !selectedSalesPoint}
                                >
                                  Добавить
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                      )}
                      {dict.id === 'extra_charges' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                  size="sm"
                                  className="bg-orange-600 hover:bg-orange-700 text-white"
                                  disabled={!selectedSalesPoint}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Добавить наценку
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white text-black">
                              <DialogHeader>
                                <DialogTitle>
                                  Добавить наценку {selectedSalesPoint && `для "${selectedSalesPoint.name}"`}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                {selectedSalesPoint ? (
                                    <>
                                      <div>
                                        <label className="text-sm font-medium mb-2 block">Точка продаж</label>
                                        <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-3">
                                          <MapPin className="h-4 w-4 text-gray-500" />
                                          <div>
                                            <div className="font-medium">{selectedSalesPoint.name}</div>
                                            <div className="text-sm text-gray-500">{selectedSalesPoint.address}</div>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium mb-2 block">Название *</label>
                                        <Input
                                            className="bg-white text-black border-gray-300"
                                            value={newExtraCharge.name}
                                            onChange={(e) => setNewExtraCharge({ ...newExtraCharge, name: e.target.value })}
                                            placeholder="Название наценки"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium mb-2 block">Размер (%)</label>
                                        <Input
                                            className="bg-white text-black border-gray-300"
                                            type="number"
                                            step="0.01"
                                            value={newExtraCharge.count}
                                            onChange={(e) => setNewExtraCharge({ ...newExtraCharge, count: e.target.value })}
                                            placeholder="0.00"
                                        />
                                      </div>
                                    </>
                                ) : (
                                    <div className="text-center py-6">
                                      <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                                      <p className="text-gray-600">Пожалуйста, выберите точку продаж для добавления наценки</p>
                                    </div>
                                )}
                              </div>
                              <DialogFooter>
                                <Button
                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                    onClick={handleAddExtraCharge}
                                    disabled={!newExtraCharge.name || !selectedSalesPoint}
                                >
                                  Добавить
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                      )}
                      {dict.id === 'allergens' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Добавить аллерген
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white text-black">
                              <DialogHeader>
                                <DialogTitle>Добавить аллерген</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <label className="text-sm font-medium mb-2 block">Название *</label>
                                  <Input
                                      className="bg-white text-black border-gray-300"
                                      value={newAllergen.name}
                                      onChange={(e) => setNewAllergen({ ...newAllergen, name: e.target.value })}
                                      placeholder="Название аллергена"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-2 block">Описание</label>
                                  <Input
                                      className="bg-white text-black border-gray-300"
                                      value={newAllergen.description}
                                      onChange={(e) => setNewAllergen({ ...newAllergen, description: e.target.value })}
                                      placeholder="Описание аллергена"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                    onClick={handleAddAllergen}
                                    disabled={!newAllergen.name}
                                >
                                  Добавить
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {dict.id === 'discounts' && !selectedSalesPoint && (
                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <AlertCircle className="h-5 w-5" />
                            <p>Выберите точку продаж для отображения скидок</p>
                          </div>
                        </div>
                    )}
                    {dict.id === 'extra_charges' && !selectedSalesPoint && (
                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <AlertCircle className="h-5 w-5" />
                            <p>Выберите точку продаж для отображения наценок</p>
                          </div>
                        </div>
                    )}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead style={{ color: 'rgb(101,125,156)' }} className="w-12">ID</TableHead>
                          <TableHead style={{ color: 'rgb(101,125,156)' }}>Название</TableHead>
                          <TableHead style={{ color: 'rgb(101,125,156)' }}>Описание</TableHead>
                          {dict.items.some(i => i.color) && <TableHead style={{ color: 'rgb(101,125,156)' }}>Цвет</TableHead>}
                          <TableHead style={{ color: 'rgb(101,125,156)' }}>Статус</TableHead>
                          <TableHead style={{ color: 'rgb(101,125,156)' }} className="text-right">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dict.items.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                {dict.id === 'discounts' && !selectedSalesPoint
                                    ? 'Выберите точку продаж для отображения скидок'
                                    : dict.id === 'extra_charges' && !selectedSalesPoint
                                        ? 'Выберите точку продаж для отображения наценок'
                                        : 'Нет данных'
                                }
                              </TableCell>
                            </TableRow>
                        ) : (
                            dict.items.map((item, index) => (
                                <TableRow key={item.id}>
                                  <TableCell style={{color:'var(--custom-text)'}}  className="text-white">{index + 1}</TableCell>
                                  <TableCell style={{color:'var(--custom-text)'}} className="font-medium text-white">{item.name}</TableCell>
                                  <TableCell style={{color:'var(--custom-text)'}} className="text-sm text-gray-300">
                                    {item.description || '—'}
                                  </TableCell>
                                  {dict.items.some(i => i.color) && (
                                      <TableCell style={{color:'var(--custom-text)'}}>
                                        {item.color ? (
                                            <div className="flex items-center gap-2">
                                              <div
                                                  className="w-6 h-6 rounded border"
                                                  style={{ backgroundColor: item.color }}
                                              />
                                              <span className="text-xs text-gray-300">{item.color}</span>
                                            </div>
                                        ) : (
                                            '—'
                                        )}
                                      </TableCell>
                                  )}
                                  <TableCell style={{color:'var(--custom-text)'}}>
                                    <button
                                        onClick={() => dict.id === 'modifiers' || dict.id === 'discounts' || dict.id === 'extra_charges' || dict.id === 'allergens' ? null : handleToggleActive(item.id)}
                                        className="cursor-pointer"
                                        disabled={dict.id === 'modifiers' || dict.id === 'discounts' || dict.id === 'extra_charges' || dict.id === 'allergens'}
                                    >
                                      {item.isActive ? (
                                          <Badge className="bg-green-100 text-green-800">Активен</Badge>
                                      ) : (
                                          <Badge className="bg-gray-100 text-gray-800">Неактивен</Badge>
                                      )}
                                    </button>
                                  </TableCell>
                                  <TableCell style={{color:'var(--custom-text)'}} className="text-right">
                                    <div className="flex justify-end gap-2">
                                      {dict.id === 'modifiers' ? (
                                          <Button
                                              size="sm"
                                              variant="outline"
                                              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                              onClick={() => handleDeleteModifier(item.id)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                      ) : dict.id === 'discounts' ? (
                                          <Button
                                              size="sm"
                                              variant="outline"
                                              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                              onClick={() => handleDeleteDiscount(item.id)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                      ) : dict.id === 'extra_charges' ? (
                                          <Button
                                              size="sm"
                                              variant="outline"
                                              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                              onClick={() => handleDeleteExtraCharge(item.id)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                      ) : dict.id === 'allergens' ? (
                                          <Button
                                              size="sm"
                                              variant="outline"
                                              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                              onClick={() => handleDeleteAllergen(item.id)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                      ) : (
                                          <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-gray-300 hover:border-gray-400 text-white"
                                                onClick={() => {
                                                  setEditingItem(item);
                                                  setIsEditDialogOpen(true);
                                                }}
                                            >
                                              <Edit2 style={{color:'var(--custom-text)'}}к className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                                onClick={() => handleDeleteItem(item.id)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
          ))}
        </Tabs>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="bg-white text-black">
            <DialogHeader>
              <DialogTitle>Добавить запись в "{activeDictionary?.name}"</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Название *</label>
                <Input
                    className="bg-white text-black border-gray-300"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Введите название"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Описание</label>
                <Input
                    className="bg-white text-black border-gray-300"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Введите описание"
                />
              </div>
              {activeDictionary?.items.some(i => i.color) && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Цвет</label>
                    <div className="flex gap-2 items-center">
                      <Input
                          type="color"
                          className="bg-white text-black border-gray-300 w-20 h-10"
                          value={newItem.color}
                          onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                      />
                      <span className="text-sm text-gray-600">{newItem.color}</span>
                    </div>
                  </div>
              )}
            </div>
            <DialogFooter>
              <Button
                  variant="outline"
                  className="border-gray-300 hover:border-gray-400"
                  onClick={() => setIsAddDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={handleAddItem}
                  disabled={!newItem.name}
              >
                Добавить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-white text-black">
            <DialogHeader>
              <DialogTitle>Редактировать запись</DialogTitle>
            </DialogHeader>
            {editingItem && (
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Название *</label>
                    <Input
                        className="bg-white text-black border-gray-300"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        placeholder="Введите название"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Описание</label>
                    <Input
                        className="bg-white text-black border-gray-300"
                        value={editingItem.description || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        placeholder="Введите описание"
                    />
                  </div>
                  {activeDictionary?.items.some(i => i.color) && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Цвет</label>
                        <div className="flex gap-2 items-center">
                          <Input
                              type="color"
                              className="bg-white text-black border-gray-300 w-20 h-10"
                              value={editingItem.color || '#3b82f6'}
                              onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
                          />
                          <span className="text-sm text-gray-600">{editingItem.color}</span>
                        </div>
                      </div>
                  )}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Статус</label>
                    <select
                        value={editingItem.isActive ? 'active' : 'inactive'}
                        onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.value === 'active' })}
                        className="w-full border border-gray-300 rounded-md p-2 bg-white text-black"
                    >
                      <option value="active">Активен</option>
                      <option value="inactive">Неактивен</option>
                    </select>
                  </div>
                </div>
            )}
            <DialogFooter>
              <Button
                  variant="outline"
                  className="border-gray-300 hover:border-gray-400"
                  onClick={() => setIsEditDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleEditItem}
                  disabled={!editingItem?.name}
              >
                Сохранить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}