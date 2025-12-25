import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Textarea } from '../../ui/textarea';
import {
  Plus,
  Search,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Star,
  Heart,
  Calendar as CalendarIcon,
  Filter,
  ArrowLeft,
  User,
  ShoppingCart,
  CheckCircle,
  XCircle,
  MessageSquare,
  Cake,
  AlertCircle,
  TrendingUp,
  Loader2,
  Save,
  X,
  Users,
  Clock
} from 'lucide-react';
import StatsUser from "./blocks/StatsUser";
import {useGuest} from "../../../hooks/useGuest";
import {AddGuestDialog} from "./blocks/AddNewGuests";
import Fillter from "./blocks/Fillter";
import {EditGuestDialog} from "./blocks/EditGuestDialog";
import {DeleteGuestDialog} from "./blocks/DeleteGuestDialog";
import {useOrders} from "../../../hooks/useOrder";

import { Calendar as DatePickerCalendar } from '../../ui/calendar';
import {useReservation} from "../../../hooks/useReservation";
import {useGuets} from "../../../hooks/useGuets";



// Добавляем недостающие функции для бейджей
const getStatusBadge = (status: string) => {
  const colors: Record<string, string> = {
    'Активный': 'bg-green-100 text-green-800',
    'VIP': 'bg-purple-100 text-purple-800',
    'Новый': 'bg-blue-100 text-blue-800',
    'Неактивный': 'bg-gray-100 text-gray-800'
  };

  return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
  );
};

const getLoyaltyBadge = (level: string) => {
  const colors: Record<string, string> = {
    'gold': 'bg-yellow-100 text-yellow-800',
    'silver': 'bg-gray-100 text-gray-800',
    'bronze': 'bg-orange-100 text-orange-800',
    'platinum': 'bg-blue-100 text-blue-800'
  };

  const labels: Record<string, string> = {
    'gold': 'Золото',
    'silver': 'Серебро',
    'bronze': 'Бронза',
    'platinum': 'Платина'
  };

  return (
      <Badge className={colors[level] || 'bg-gray-100 text-gray-800'}>
        {labels[level] || level}
      </Badge>
  );
};

const getSegmentBadge = (segment: string) => {
  const colors: Record<string, string> = {
    'champions': 'bg-green-100 text-green-800',
    'loyal_customers': 'bg-blue-100 text-blue-800',
    'potential_loyalists': 'bg-purple-100 text-purple-800',
    'new_customers': 'bg-yellow-100 text-yellow-800',
    'at_risk': 'bg-orange-100 text-orange-800',
    'cant_lose': 'bg-red-100 text-red-800'
  };

  const labels: Record<string, string> = {
    'champions': 'Чемпионы',
    'loyal_customers': 'Лояльные',
    'potential_loyalists': 'Потенциальные',
    'new_customers': 'Новые',
    'at_risk': 'В зоне риска',
    'cant_lose': 'Нельзя потерять'
  };

  return (
      <Badge className={colors[segment] || 'bg-gray-100 text-gray-800'}>
        {labels[segment] || segment}
      </Badge>
  );
};


const GuestDetailView = ({ guest, onBack, selectedSalesPoint, onGuestUpdated }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentGuest, setCurrentGuest] = useState({
    ...guest,
    full_name: guest.full_name || '',
    phone: guest.phone || '',
    email: guest.email || '',
    address: guest.address || '',
    status: guest.status || 'Активный',
    birthday: guest.birthday || '',
    metadate: guest.metadate || {
      food_preferences: '',
      allergies: '',
      preferred_drinks: '',
      preferred_table: '',
      dietary_restrictions: ''
    }
  });
  const [isSaving, setIsSaving] = useState(false);

  const { orders, loading: ordersLoading, error: ordersError } = useOrders(guest.id);

  const {transformOrderData,calculateStats,handleFieldChange} = useGuets(setCurrentGuest)

  const transformedOrders = transformOrderData(orders);
  const stats = calculateStats(transformedOrders);

  const mockGuestData = {
    ...currentGuest,
    name: currentGuest.full_name,
    loyaltyLevel: 'gold',
    loyaltyPoints: 1250,
    source: 'Рекомендация',
    tags: ['Любит морепродукты', 'Вегетарианец', 'Бизнес-ланч'],
    notes: [
      {
        user: 'Администратор',
        date: '2024-01-15',
        text: 'Предпочитает столик у окна'
      }
    ],
    stats: stats,
    orderHistory: transformedOrders,
    communications: [
      {
        type: 'email',
        status: 'opened',
        subject: 'Специальное предложение',
        date: '2024-01-16'
      }
    ],
    segment: 'champions'
  };

  const birthdaySoon = false;

  const handleStartEdit = () => setIsEditing(true);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentGuest({
      ...guest,
      full_name: guest.full_name || '',
      phone: guest.phone || '',
      email: guest.email || '',
      address: guest.address || '',
      status: guest.status || 'Активный',
      birthday: guest.birthday || '',
      metadate: guest.metadate || {
        food_preferences: '',
        allergies: '',
        preferred_drinks: '',
        preferred_table: '',
        dietary_restrictions: ''
      }
    });
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');

      const updateData = {
        full_name: currentGuest.full_name,
        phone: currentGuest.phone,
        email: currentGuest.email || '',
        address: currentGuest.address || '',
        status: currentGuest.status,
        birthday: currentGuest.birthday || null,
        metadate: currentGuest.metadate || {}
      };

      const response = await fetch(`/guests/${guest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Ошибка обновления гостя');
      }

      const updatedGuest = await response.json();

      if (onGuestUpdated) {
        onGuestUpdated(updatedGuest);
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving guest:', error);
      alert('Не удалось сохранить изменения');
    } finally {
      setIsSaving(false);
    }
  };



  const handleMetadataChange = (field: string, value: any) => {
    setCurrentGuest(prev => ({
      ...prev,
      metadate: {
        ...prev.metadate,
        [field]: value
      }
    }));
  };

  return (
      <div className="space-y-6">
        {/* Кнопка возврата */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к списку
          </Button>
          <div className="flex items-center gap-2">
            {selectedSalesPoint && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Точка продаж: {selectedSalesPoint.name}
                </div>
            )}
          </div>
        </div>

        {/* Заголовок профиля */}
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
                  {isEditing ? (
                      <Input
                          value={currentGuest.full_name}
                          onChange={(e) => handleFieldChange('full_name', e.target.value)}
                          className="text-2xl font-bold border-0 p-0"
                      />
                  ) : (
                      currentGuest.full_name
                  )}
                  {birthdaySoon && <Cake className="h-6 w-6 text-pink-600" />}
                </CardTitle>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {isEditing ? (
                        <Input
                            value={currentGuest.phone}
                            onChange={(e) => handleFieldChange('phone', e.target.value)}
                            className="text-sm border-0 p-0 w-40"
                        />
                    ) : (
                        currentGuest.phone
                    )}
                  </div>
                  {currentGuest.email && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {isEditing ? (
                            <Input
                                value={currentGuest.email}
                                onChange={(e) => handleFieldChange('email', e.target.value)}
                                className="text-sm border-0 p-0 w-40"
                                type="email"
                            />
                        ) : (
                            currentGuest.email
                        )}
                      </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Отмена
                      </Button>
                      <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={handleSaveEdit}
                          disabled={isSaving}
                      >
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                      </Button>
                    </>
                ) : (
                    <>
                      <Button variant="outline" onClick={handleStartEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Редактировать
                      </Button>
                    </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Быстрая статистика */}
        <div className="grid grid-cols-4 gap-4">
          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Визиты</div>
              <div className="text-2xl font-medium">{mockGuestData.stats.totalVisits}</div>
              <div className="text-xs text-muted-foreground mt-1">{mockGuestData.stats.frequency.toFixed(1)}/мес</div>
            </CardContent>
          </Card>
          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Потрачено</div>
              <div className="text-2xl font-medium text-green-600">₽{mockGuestData.stats.totalSpent.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">Всего</div>
            </CardContent>
          </Card>
          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Средний чек</div>
              <div className="text-2xl font-medium text-orange-600">₽{mockGuestData.stats.avgCheck.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">За визит</div>
            </CardContent>
          </Card>
          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Баллы</div>
              <div className="text-2xl font-medium text-purple-600">{mockGuestData.loyaltyPoints}</div>
              <div className="text-xs text-muted-foreground mt-1">{getLoyaltyBadge(mockGuestData.loyaltyLevel)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Заметки с предупреждениями */}
        {mockGuestData.notes.length > 0 && (
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }} className="border-blue-500">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  Важные заметки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockGuestData.notes.map((note: any, idx: number) => (
                      <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs">{note.user}</Badge>
                          <span className="text-xs text-muted-foreground">
                        {new Date(note.date).toLocaleString('ru-RU')}
                      </span>
                        </div>
                        <div className="text-sm text-blue-900">{note.text}</div>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        )}

        {/* Вкладки с детальной информацией */}
        <Tabs defaultValue="profile" className="mt-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Профиль</TabsTrigger>
            <TabsTrigger value="orders">История ({mockGuestData.orderHistory.length})</TabsTrigger>
            <TabsTrigger value="preferences">Предпочтения</TabsTrigger>
            <TabsTrigger value="communications">Коммуникации</TabsTrigger>
            <TabsTrigger value="analytics">RFM</TabsTrigger>
          </TabsList>

          {/* Профиль */}
          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
              }}>
                <CardHeader>
                  <CardTitle className="text-base">Контактная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Имя</div>
                    {isEditing ? (
                        <Input
                            value={currentGuest.full_name}
                            onChange={(e) => handleFieldChange('full_name', e.target.value)}
                            placeholder="ФИО"
                        />
                    ) : (
                        <div className="font-medium">{currentGuest.full_name}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Телефон</div>
                    {isEditing ? (
                        <Input
                            value={currentGuest.phone}
                            onChange={(e) => handleFieldChange('phone', e.target.value)}
                            placeholder="Телефон"
                        />
                    ) : (
                        <div className="font-medium flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {currentGuest.phone}
                        </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Email</div>
                    {isEditing ? (
                        <Input
                            value={currentGuest.email || ''}
                            onChange={(e) => handleFieldChange('email', e.target.value)}
                            placeholder="Email"
                            type="email"
                        />
                    ) : (
                        currentGuest.email && (
                            <div className="font-medium flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {currentGuest.email}
                            </div>
                        )
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Адрес</div>
                    {isEditing ? (
                        <Input
                            value={currentGuest.address || ''}
                            onChange={(e) => handleFieldChange('address', e.target.value)}
                            placeholder="Адрес"
                        />
                    ) : (
                        currentGuest.address && (
                            <div className="font-medium flex items-start gap-2">
                              <MapPin className="h-4 w-4 mt-1" />
                              <span className="text-sm">{currentGuest.address}</span>
                            </div>
                        )
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">День рождения</div>
                    {isEditing ? (
                        <Input
                            type="date"
                            value={currentGuest.birthday || ''}
                            onChange={(e) => handleFieldChange('birthday', e.target.value)}
                        />
                    ) : (
                        currentGuest.birthday && (
                            <div className="font-medium flex items-center gap-2">
                              <Cake className="h-4 w-4" />
                              {new Date(currentGuest.birthday).toLocaleDateString('ru-RU')}
                              {birthdaySoon && (
                                  <Badge className="bg-pink-100 text-pink-800">Скоро!</Badge>
                              )}
                            </div>
                        )
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Статус</div>
                    {isEditing ? (
                        <Select
                            value={currentGuest.status}
                            onValueChange={(value) => handleFieldChange('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите статус" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Активный">Активный</SelectItem>
                            <SelectItem value="VIP">VIP</SelectItem>
                            <SelectItem value="Новый">Новый</SelectItem>
                            <SelectItem value="Неактивный">Неактивный</SelectItem>
                          </SelectContent>
                        </Select>
                    ) : (
                        <Badge variant="outline">{currentGuest.status}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
              }}>
                <CardHeader>
                  <CardTitle className="text-base">RFM Сегмент</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-5xl font-medium mb-2">{mockGuestData.stats.rfmScore}</div>
                    {getSegmentBadge(mockGuestData.segment)}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-2xl font-medium text-blue-600">{Math.floor(mockGuestData.stats.rfmScore / 100)}</div>
                      <div className="text-xs text-muted-foreground">Recency</div>
                    </div>
                    <div>
                      <div className="text-2xl font-medium text-green-600">{Math.floor((mockGuestData.stats.rfmScore % 100) / 10)}</div>
                      <div className="text-xs text-muted-foreground">Frequency</div>
                    </div>
                    <div>
                      <div className="text-2xl font-medium text-orange-600">{mockGuestData.stats.rfmScore % 10}</div>
                      <div className="text-xs text-muted-foreground">Monetary</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {mockGuestData.tags.length > 0 && (
                <Card style={{
                  borderRadius: '20px',
                  border: 'var(--custom-border-primary)',
                  background: 'var(--custom-bg-secondaryLineCard)',
                  color: 'var(--custom-text)',
                }}>
                  <CardHeader>
                    <CardTitle className="text-base">Теги</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div  className="flex flex-wrap gap-2 ">
                      {mockGuestData.tags.map((tag: string, idx: number) => (
                          <Badge className='text-white' key={idx} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
            )}
          </TabsContent>

          {/* История заказов */}
          <TabsContent value="orders" className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
              }}>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Всего заказов</div>
                  <div className="text-3xl font-medium">
                    {ordersLoading ? '...' : mockGuestData.orderHistory.length}
                  </div>
                </CardContent>
              </Card>
              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
              }}>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Общая сумма</div>
                  <div className="text-3xl font-medium text-green-600">
                    {ordersLoading ? '...' : `₽${mockGuestData.stats.totalSpent.toLocaleString()}`}
                  </div>
                </CardContent>
              </Card>
              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
              }}>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Средний рейтинг</div>
                  <div className="flex items-center gap-1">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-3xl font-medium">
              {ordersLoading ? '...' : (
                  (mockGuestData.orderHistory
                          .filter((o: any) => o.rating)
                          .reduce((sum: number, o: any) => sum + (o.rating || 0), 0) /
                      mockGuestData.orderHistory.filter((o: any) => o.rating).length || 0
                  ).toFixed(1)
              )}
            </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {ordersLoading && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div>Загрузка заказов...</div>
                  </CardContent>
                </Card>
            )}

            {ordersError && (
                <Card className="border-red-200">
                  <CardContent className="p-6">
                    <div className="text-red-600">Ошибка загрузки заказов: {ordersError}</div>
                  </CardContent>
                </Card>
            )}

            {!ordersLoading && !ordersError && (
                <>
                  <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-secondaryLineCard)',
                    color: 'var(--custom-text)',
                  }}>
                    <CardContent className="p-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Заказ</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Дата</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Позиций</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Сумма</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Тип заказа</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Рейтинг</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockGuestData.orderHistory.map((order: any) => (
                              <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>
                                  {order.date ? (
                                      new Date(order.date).toLocaleString('ru-RU', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                  ) : 'Не указана'}
                                </TableCell>
                                <TableCell>{order.items}</TableCell>
                                <TableCell className="text-orange-600 font-medium">
                                  ₽{order.amount.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <Badge className={
                                    order.status === 'closed' ? 'bg-green-100 text-green-800' :
                                        order.status === 'open' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                  }>
                                    {order.status === 'closed' ? 'Завершен' :
                                        order.status === 'open' ? 'Открыт' : order.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className='text-white' variant="outline">
                                    {order.order_type === 'quick' ? 'Быстрый' :
                                        order.order_type === 'dine_in' ? 'В зале' :
                                            order.order_type === 'delivery' ? 'Доставка' : order.order_type}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {order.rating ? (
                                      <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span>{order.rating}</span>
                                      </div>
                                  ) : (
                                      <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {mockGuestData.orderHistory.some((o: any) => o.comment) && (
                      <Card >
                        <CardHeader>
                          <CardTitle className="text-base">Отзывы</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {mockGuestData.orderHistory
                                .filter((o: any) => o.comment)
                                .map((order: any) => (
                                    <div key={order.id} className="p-3 bg-muted/50 rounded-lg">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">{order.id}</span>
                                        <div className="flex items-center gap-1">
                                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                          <span className="text-sm">{order.rating}</span>
                                        </div>
                                      </div>
                                      <p className="text-sm">{order.comment}</p>
                                      <div className="text-xs text-muted-foreground mt-2">
                                        {order.date ? new Date(order.date).toLocaleDateString('ru-RU') : 'Не указана'}
                                      </div>
                                    </div>
                                ))}
                          </div>
                        </CardContent>
                      </Card>
                  )}

                  {mockGuestData.orderHistory.length === 0 && (
                      <Card>
                        <CardContent className="p-12 text-center text-muted-foreground">
                          <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Нет истории заказов</p>
                        </CardContent>
                      </Card>
                  )}
                </>
            )}
          </TabsContent>

          {/* Предпочтения */}
          <TabsContent value="preferences" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
              }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="h-4 w-4 text-orange-600" />
                    Предпочтения в еде
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                      <Textarea
                          value={currentGuest.metadate?.food_preferences || ''}
                          onChange={(e) => handleMetadataChange('food_preferences', e.target.value)}
                          placeholder="Любимые блюда, кухни и т.д."
                          rows={3}
                      />
                  ) : currentGuest?.metadate?.food_preferences ? (
                      <div className="space-y-2">
                        {currentGuest.metadate.food_preferences.split(',').map((preference: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 p-2  rounded">
                              <Heart className="h-4 w-4 text-orange-600 fill-orange-600" />
                              <span>{preference.trim()}</span>
                            </div>
                        ))}
                      </div>
                  ) : (
                      <div className="text-sm text-muted-foreground text-center py-8">Еще не определены</div>
                  )}
                </CardContent>
              </Card>

              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
              }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="h-4 w-4 text-blue-600" />
                    Любимые напитки
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                      <Textarea
                          value={currentGuest.metadate?.preferred_drinks || ''}
                          onChange={(e) => handleMetadataChange('preferred_drinks', e.target.value)}
                          placeholder="Любимые напитки"
                          rows={3}
                      />
                  ) : currentGuest?.metadate?.preferred_drinks ? (
                      <div className="space-y-2">
                        {currentGuest.metadate.preferred_drinks.split(',').map((drink: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 p-2 rounded">
                              <Heart className="h-4 w-4 text-blue-600 fill-blue-600" />
                              <span>{drink.trim()}</span>
                            </div>
                        ))}
                      </div>
                  ) : (
                      <div className="text-sm text-muted-foreground text-center py-8">Еще не определены</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Ограничения и аллергии
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Диетические ограничения</div>
                  {isEditing ? (
                      <Input
                          value={currentGuest.metadate?.dietary_restrictions || ''}
                          onChange={(e) => handleMetadataChange('dietary_restrictions', e.target.value)}
                          placeholder="Вегетарианство, безглютеновая диета и т.д."
                      />
                  ) : currentGuest?.metadate?.dietary_restrictions ? (
                      <div className="flex flex-wrap gap-2">
                        {currentGuest.metadate.dietary_restrictions.split(',').map((restriction: string, idx: number) => (
                            <Badge key={idx} className="bg-yellow-100 text-yellow-800">
                              {restriction.trim()}
                            </Badge>
                        ))}
                      </div>
                  ) : (
                      <div className="text-sm text-muted-foreground">Не указаны</div>
                  )}
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Аллергии</div>
                  {isEditing ? (
                      <Input
                          value={currentGuest.metadate?.allergies || ''}
                          onChange={(e) => handleMetadataChange('allergies', e.target.value)}
                          placeholder="Аллергии на продукты"
                      />
                  ) : currentGuest?.metadate?.allergies ? (
                      <div className="flex flex-wrap gap-2">
                        {currentGuest.metadate.allergies.split(',').map((allergy: string, idx: number) => (
                            <Badge key={idx} className="bg-red-100 text-red-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {allergy.trim()}
                            </Badge>
                        ))}
                      </div>
                  ) : (
                      <div className="text-sm text-muted-foreground">Не указаны</div>
                  )}
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Особые пожелания</div>
                  {isEditing ? (
                      <Textarea
                          value={currentGuest.metadate?.special_requests || ''}
                          onChange={(e) => handleMetadataChange('special_requests', e.target.value)}
                          placeholder="Особые пожелания"
                          rows={2}
                      />
                  ) : currentGuest?.metadate?.special_requests ? (
                      <div className="text-sm p-3 bg-blue-50 rounded-lg">
                        {currentGuest.metadate.special_requests}
                      </div>
                  ) : (
                      <div className="text-sm text-muted-foreground">Не указаны</div>
                  )}
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Предпочитаемый стол</div>
                  {isEditing ? (
                      <Input
                          value={currentGuest.metadate?.preferred_table || ''}
                          onChange={(e) => handleMetadataChange('preferred_table', e.target.value)}
                          placeholder="У окна, в углу и т.д."
                      />
                  ) : currentGuest?.metadate?.preferred_table ? (
                      <Badge className="bg-purple-100 text-purple-800">{currentGuest.metadate.preferred_table}</Badge>
                  ) : (
                      <div className="text-sm text-muted-foreground">Не указан</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Коммуникации */}
          <TabsContent value="communications" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-white">История коммуникаций ({mockGuestData.communications.length})</h4>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                <Mail className="h-4 w-4 mr-2" />
                Отправить сообщение
              </Button>
            </div>
            <div className="space-y-3">
              {mockGuestData.communications.map((comm: any, idx: number) => (
                  <Card key={idx} style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-secondaryLineCard)',
                    color: 'var(--custom-text)',
                  }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className='text-white'>
                              {comm.type === 'email' ? <Mail className="h-3 w-3 mr-1" /> : <Phone className="h-3 w-3 mr-1" />}
                              {comm.type === 'email' ? 'Email' : 'SMS'}
                            </Badge>
                            <Badge className={comm.status === 'opened' || comm.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                              {comm.status === 'sent' && 'Отправлено'}
                              {comm.status === 'delivered' && 'Доставлено'}
                              {comm.status === 'opened' && 'Прочитано'}
                            </Badge>
                          </div>
                          <div className="font-medium mb-1">{comm.subject}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(comm.date).toLocaleString('ru-RU')}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              ))}
              {mockGuestData.communications.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Нет истории коммуникаций</p>
                    </CardContent>
                  </Card>
              )}
            </div>
          </TabsContent>

          {/* RFM Аналитика */}
          <TabsContent value="analytics" className="space-y-4">
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle className="text-base">RFM Анализ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Recency (Давность)</div>
                    <div className="text-5xl font-medium text-blue-600 mb-2">
                      {Math.floor(mockGuestData.stats.rfmScore / 100)}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Последний визит 5 дн. назад
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '80%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Frequency (Частота)</div>
                    <div className="text-5xl font-medium text-green-600 mb-2">
                      {Math.floor((mockGuestData.stats.rfmScore % 100) / 10)}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {mockGuestData.stats.frequency.toFixed(1)} визитов/месяц
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '90%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Monetary (Денежная ценность)</div>
                    <div className="text-5xl font-medium text-orange-600 mb-2">
                      {mockGuestData.stats.rfmScore % 10}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      ₽{mockGuestData.stats.totalSpent.toLocaleString()} всего
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                  </div>
                </div>
                <div className="border-t my-6"></div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Итоговый RFM Score</div>
                  <div className="text-6xl font-medium mb-3">{mockGuestData.stats.rfmScore}</div>
                  <div className="flex justify-center">
                    {getSegmentBadge(mockGuestData.segment)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Lifetime Value (LTV)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Текущий LTV</div>
                    <div className="text-4xl font-medium text-green-600 mb-1">
                      ₽{mockGuestData.stats.totalSpent.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      За {mockGuestData.stats.totalVisits} визитов
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Прогнозный LTV (1 год)</div>
                    <div className="text-4xl font-medium text-orange-600 mb-1">
                      ₽{Math.round(mockGuestData.stats.avgCheck * mockGuestData.stats.frequency * 12).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      При текущей частоте
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
};


const NewReservationForm = ({
                              selectedSalesPoint,
                              onBack,
                              onReservationCreated
                            }: {
  selectedSalesPoint: any;
  onBack: () => void;
  onReservationCreated: () => void;
}) => {
  const [guests, setGuests] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingGuest, setIsCreatingGuest] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    guest_id: '',
    guest_name: '',
    guest_phone: '',
    table_id: '',
    reservation_date: '',
    reservation_time: '12:00',
    count_guest: 2,
    status: 'ожидает подтверждения',
    comment: '',
  });

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];


  useEffect(() => {
    const loadData = async () => {
      if (!selectedSalesPoint?.id) return;

      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');

        // Загружаем гостей для этой точки продаж
        const guestsResponse = await fetch(`/guests/?point_retail_id=${selectedSalesPoint.id}&skip=0&limit=100`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (guestsResponse.ok) {
          const guestsData = await guestsResponse.json();
          setGuests(Array.isArray(guestsData) ? guestsData : []);
        }

        // Загружаем столы для этой точки продаж
        const tablesResponse = await fetch(`/tables/?point_retail_id=${selectedSalesPoint.id}&skip=0&limit=100`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (tablesResponse.ok) {
          const tablesData = await tablesResponse.json();
          setTables(Array.isArray(tablesData) ? tablesData : []);
        }

        // Устанавливаем дату по умолчанию - сегодня
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, reservation_date: todayStr }));

      } catch (error) {
        console.error('Error loading data for reservation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedSalesPoint]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateGuest = async () => {
    if (!formData.guest_name || !formData.guest_phone || !selectedSalesPoint?.id) {
      alert('Заполните имя и телефон гостя');
      return;
    }

    setIsCreatingGuest(true);
    try {
      const token = localStorage.getItem('token');
      const guestData = {
        point_retail_id: selectedSalesPoint.id,
        full_name: formData.guest_name,
        phone: formData.guest_phone,
        email: '',
        address: '',
        status: 'Активный',
      };

      const response = await fetch('/guests/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(guestData)
      });

      if (response.ok) {
        const newGuest = await response.json();
        // Обновляем список гостей
        const updatedGuests = [...guests, newGuest];
        setGuests(updatedGuests);

        // Устанавливаем созданного гостя как выбранного
        setFormData(prev => ({
          ...prev,
          guest_id: newGuest.id.toString(),
          guest_name: '',
          guest_phone: ''
        }));

        alert('Гость успешно создан');
      } else {
        throw new Error('Ошибка создания гостя');
      }
    } catch (error) {
      console.error('Error creating guest:', error);
      alert('Ошибка при создании гостя');
    } finally {
      setIsCreatingGuest(false);
    }
  };

  const handleCreateReservation = async () => {
    if (!formData.guest_id || !formData.table_id || !formData.reservation_date) {
      alert('Заполните все обязательные поля');
      return;
    }

    // Если guest_id = "new", нужно сначала создать гостя
    if (formData.guest_id === 'new') {
      if (!formData.guest_name || !formData.guest_phone) {
        alert('Для нового гостя заполните имя и телефон');
        return;
      }
      // Можно вызвать handleCreateGuest и дождаться его завершения
      alert('Сначала создайте гостя, используя кнопку "Создать гостя"');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');

      // Создаем объект бронирования
      const reservationData = {
        point_retail_id: selectedSalesPoint.id,
        guest_id: parseInt(formData.guest_id),
        table_id: parseInt(formData.table_id),
        reservation_time: `${formData.reservation_date}T${formData.reservation_time}:00`, // формат даты+времени
        count_guest: formData.count_guest,
        status: formData.status,
        comment: formData.comment || '',
      };

      const response = await fetch('/reservations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reservationData)
      });

      if (response.ok) {
        const newReservation = await response.json();
        alert('Бронирование успешно создано');
        onReservationCreated(); // Вызываем callback
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка создания бронирования');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert(`Ошибка при создании бронирования: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к списку
            </Button>
          </div>
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <div>Загрузка данных...</div>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к списку
          </Button>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">Новое бронирование</Badge>
            {selectedSalesPoint && (
                <Badge variant="outline">
                  {selectedSalesPoint.name}
                </Badge>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <CalendarIcon className="h-6 w-6 text-orange-600" />
                  Создание нового бронирования
                </CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={isSubmitting || isCreatingGuest}
                >
                  <X className="h-4 w-4 mr-2" />
                  Отмена
                </Button>
                <Button
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={handleCreateReservation}
                    disabled={isSubmitting || isCreatingGuest || !formData.guest_id || !formData.table_id}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Создание...' : 'Создать бронирование'}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Информация о госте</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Выбрать гостя</label>
                <Select
                    value={formData.guest_id}
                    onValueChange={(value) => handleInputChange('guest_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите гостя из базы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Новый гость
                      </div>
                    </SelectItem>
                    {guests.map(guest => (
                        <SelectItem key={guest.id} value={guest.id.toString()}>
                          {guest.full_name} - {guest.phone}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(!formData.guest_id || formData.guest_id === 'new') && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">ФИО гостя *</label>
                      <Input
                          placeholder="Фамилия Имя Отчество"
                          value={formData.guest_name}
                          onChange={(e) => handleInputChange('guest_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Телефон *</label>
                      <Input
                          placeholder="+7 (999) 123-45-67"
                          value={formData.guest_phone}
                          onChange={(e) => handleInputChange('guest_phone', e.target.value)}
                      />
                    </div>
                    <Button
                        type="button"
                        onClick={handleCreateGuest}
                        disabled={isCreatingGuest || !formData.guest_name || !formData.guest_phone}
                        className="w-full"
                    >
                      {isCreatingGuest ? 'Создание...' : 'Создать гостя'}
                    </Button>
                  </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Детали бронирования</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Дата *</label>
                  <Input
                      type="date"
                      value={formData.reservation_date}
                      onChange={(e) => handleInputChange('reservation_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Время *</label>
                  <Select
                      value={formData.reservation_time}
                      onValueChange={(value) => handleInputChange('reservation_time', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите время" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Количество гостей *</label>
                  <Input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.count_guest}
                      onChange={(e) => handleInputChange('count_guest', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Статус *</label>
                  <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ожидает подтверждения">Ожидает подтверждения</SelectItem>
                      <SelectItem value="подтверждена">Подтверждена</SelectItem>
                      <SelectItem value="отменена">Отменена</SelectItem>
                      <SelectItem value="завершена">Завершена</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Стол *</label>
                <Select
                    value={formData.table_id}
                    onValueChange={(value) => handleInputChange('table_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите стол" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map(table => (
                        <SelectItem key={table.id} value={table.id.toString()}>
                          {table.name} ({table.count_seats} мест)
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Комментарий</label>
                <Textarea
                    placeholder="Дополнительные пожелания к бронированию"
                    value={formData.comment}
                    onChange={(e) => handleInputChange('comment', e.target.value)}
                    rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};


const ReservationsSection = ({ selectedSalesPoint }: { selectedSalesPoint: any }) => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [halls, setHalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Все');
  const [isCreatingNewReservation, setIsCreatingNewReservation] = useState(false);

  const statusColors: Record<string, string> = {
    'подтверждена': 'bg-green-100 text-green-800',
    'ожидает подтверждения': 'bg-yellow-100 text-yellow-800',
    'отменена': 'bg-red-100 text-red-800',
    'завершена': 'bg-gray-100 text-gray-800'
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'подтверждена':
        return <CheckCircle className="h-4 w-4" />;
      case 'отменена':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const loadReservations = useCallback(async () => {
    if (!selectedSalesPoint?.id) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Загружаем резервации для выбранной точки продаж
      const response = await fetch(`/reservations/?point_retail_id=${selectedSalesPoint.id}&skip=0&limit=100`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(Array.isArray(data) ? data : []);
      }

      // Загружаем гостей для выбранной точки продаж
      const guestsRes = await fetch(`/guests/?point_retail_id=${selectedSalesPoint.id}&skip=0&limit=100`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (guestsRes.ok) {
        const guestsData = await guestsRes.json();
        setGuests(Array.isArray(guestsData) ? guestsData : []);
      }

      // Загружаем столы для выбранной точки продаж
      const tablesRes = await fetch(`/tables/?point_retail_id=${selectedSalesPoint.id}&skip=0&limit=100`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (tablesRes.ok) {
        const tablesData = await tablesRes.json();
        setTables(Array.isArray(tablesData) ? tablesData : []);
      }

      // Загружаем залы для выбранной точки продаж
      const hallsRes = await fetch(`/hall-tables/?point_retail_id=${selectedSalesPoint.id}&skip=0&limit=100`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (hallsRes.ok) {
        const hallsData = await hallsRes.json();
        setHalls(Array.isArray(hallsData) ? hallsData : []);
      }

    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSalesPoint]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const filteredReservations = useMemo(() => {
    return reservations.filter(reservation => {
      const guest = guests.find(g => g.id === reservation.guest_id);
      const matchesSearch = !searchTerm ||
          (guest && (
              guest.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              guest.phone.includes(searchTerm)
          ));

      const matchesStatus = statusFilter === 'Все' || reservation.status === statusFilter;

      if (selectedDate) {
        const reservationDate = new Date(reservation.reservation_time);
        const isSameDay = reservationDate.getDate() === selectedDate.getDate() &&
            reservationDate.getMonth() === selectedDate.getMonth() &&
            reservationDate.getFullYear() === selectedDate.getFullYear();

        if (!isSameDay) return false;
      }

      return matchesSearch && matchesStatus;
    });
  }, [reservations, guests, searchTerm, statusFilter, selectedDate]);

  const formatDisplayDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDisplayTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getGuestInfo = (guestId: number) => {
    return guests.find(g => g.id === guestId) || null;
  };

  const getTableInfo = (tableId: number) => {
    return tables.find(t => t.id === tableId) || null;
  };

  const getHallInfo = (hallId: number) => {
    return halls.find(h => h.id === hallId) || null;
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        loadReservations();
        alert('Статус обновлен успешно');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Ошибка при обновлении статуса');
    }
  };

  const handleDeleteReservation = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить это бронирование?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/reservations/${id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          loadReservations();
          alert('Бронирование удалено успешно');
        }
      } catch (error) {
        console.error('Error deleting reservation:', error);
        alert('Ошибка при удалении бронирования');
      }
    }
  };

  const handleReservationCreated = () => {
    loadReservations();
    setIsCreatingNewReservation(false);
  };

  if (isCreatingNewReservation) {
    return (
        <NewReservationForm
            selectedSalesPoint={selectedSalesPoint}
            onBack={() => setIsCreatingNewReservation(false)}
            onReservationCreated={handleReservationCreated}
        />
    );
  }

  return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Календарь */}
        <Card style={{
          borderRadius: '20px',
          border: 'var(--custom-border-primary)',
          background: 'var(--custom-bg-secondaryLineCard)',
          color: 'var(--custom-text)',
        }}>
          <CardHeader>
            <CardTitle>Календарь бронирований</CardTitle>
          </CardHeader>
          <CardContent>
            <DatePickerCalendar
                mode="single"
                selected={selectedDate || undefined}
                onSelect={setSelectedDate}
                className="rounded-md border"
            />
            <div className="mt-4 space-y-2">
              <div className="text-sm font-medium" style={{
                borderRadius: '5px',
                border: '1px solid #334155',
                background: '#0f172a',
                color:'white'
              }}>
                Выбранная дата: {selectedDate ? selectedDate.toLocaleDateString('ru-RU') : 'Не выбрана'}
              </div>
              {selectedDate && (
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {reservations
                        .filter(r => {
                          const reservationDate = new Date(r.reservation_time);
                          return reservationDate.getDate() === selectedDate.getDate() &&
                              reservationDate.getMonth() === selectedDate.getMonth() &&
                              reservationDate.getFullYear() === selectedDate.getFullYear();
                        })
                        .map(reservation => {
                          const guest = getGuestInfo(reservation.guest_id);
                          return (
                              <div key={reservation.id} className="flex justify-between items-center p-2 rounded"style={{
                                borderRadius: '20px',
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-secondaryLineCard)',
                                color: 'var(--custom-text)',
                              }} >
                                <div>
                                  <div className="text-sm font-medium">
                                    {formatDisplayTime(reservation.reservation_time)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {guest?.full_name || 'Неизвестный гость'}
                                  </div>
                                </div>
                                <Badge className={statusColors[reservation.status]} size="sm">
                                  {reservation.status}
                                </Badge>
                              </div>
                          );
                        })}
                  </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Список бронирований */}
        <Card style={{
          borderRadius: '20px',
          border: 'var(--custom-border-primary)',
          background: 'var(--custom-bg-secondaryLineCard)',
          color: 'var(--custom-text)',
        }} className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Бронирования</CardTitle>
              <Button
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => setIsCreatingNewReservation(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Новое бронирование
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Фильтры */}
            <div className="flex space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    placeholder="Поиск по имени или телефону гостя..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48"    style={{
                  border: 'var(--custom-border-primary)',
                  background: 'var(--custom-bg-inpyt)',
                  color: 'var(--custom-text)',
                }}>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Все">Все статусы</SelectItem>
                  <SelectItem value="ожидает подтверждения">Ожидающие</SelectItem>
                  <SelectItem value="подтверждена">Подтвержденные</SelectItem>
                  <SelectItem value="отменена">Отмененные</SelectItem>
                  <SelectItem value="завершена">Завершенные</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Таблица бронирований */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="h-[320px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead style={{color:'rgb(101,125,156)'}}>Гость</TableHead>
                        <TableHead style={{color:'rgb(101,125,156)'}}>Дата и время</TableHead>
                        <TableHead style={{color:'rgb(101,125,156)'}}>Гости</TableHead>
                        <TableHead style={{color:'rgb(101,125,156)'}}>Стол/Зона</TableHead>
                        <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                        <TableHead style={{color:'rgb(101,125,156)'}}>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReservations.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              Бронирования не найдены
                            </TableCell>
                          </TableRow>
                      ) : (
                          filteredReservations.map((reservation) => {
                            const guest = getGuestInfo(reservation.guest_id);
                            const table = getTableInfo(reservation.table_id);
                            const hall = table ? getHallInfo(table.hall_id) : null;

                            return (
                                <TableRow key={reservation.id}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{guest?.full_name || 'Неизвестный гость'}</div>
                                      <div className="text-sm text-muted-foreground flex items-center">
                                        <Phone className="h-3 w-3 mr-1" />
                                        {guest?.phone || 'Нет телефона'}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-1">
                                      <CalendarIcon className="h-4 w-4" />
                                      <div>
                                        <div>
                                          {formatDisplayDate(reservation.reservation_time)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {formatDisplayTime(reservation.reservation_time)}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-1">
                                      <Users className="h-4 w-4" />
                                      <span>{reservation.count_guest}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{table?.name || 'Не указан'}</div>
                                      <div className="text-sm text-muted-foreground">{hall?.name || ''}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={statusColors[reservation.status]}>
                                      <div className="flex items-center space-x-1">
                                        {getStatusIcon(reservation.status)}
                                        <span>{reservation.status}</span>
                                      </div>
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      {reservation.status === 'ожидает подтверждения' && (
                                          <>
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => handleUpdateStatus(reservation.id, 'подтверждена')}
                                            >
                                              <CheckCircle className="h-3 w-3 mr-1" />
                                              Подтвердить
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleUpdateStatus(reservation.id, 'отменена')}
                                            >
                                              <XCircle className="h-3 w-3 mr-1" />
                                              Отклонить
                                            </Button>
                                          </>
                                      )}
                                      {reservation.status === 'подтверждена' && (
                                          <Button
                                              size="sm"
                                              variant="destructive"
                                              onClick={() => handleUpdateStatus(reservation.id, 'отменена')}
                                          >
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Отменить
                                          </Button>
                                      )}

                                      <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-red-600 hover:text-red-700"
                                          onClick={() => handleDeleteReservation(reservation.id)}
                                          title="Удалить бронирование"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                            );
                          })
                      )}
                    </TableBody>
                  </Table>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
};

interface GuestsProps {
  selectedSalesPoint: any;
}

export function Guests({ selectedSalesPoint }: GuestsProps) {
  const {
    filteredGuests,
    searchTerm,
    setSearchTerm,
    addGuest,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    getStatusColor,
    openEditDialog,
    closeEditDialog,
    updateGuest,
    editingGuest,
    deletingGuest,
    isDeleteDialogOpen,
    openDeleteDialog,
    closeDeleteDialog,
    deleteGuest,
    deleteLoading,
    isEditDialogOpen,
    loading,
    error
  } = useGuest(selectedSalesPoint);

  const {handleCreateReservation} = useReservation();

  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [isAddingNewGuest, setIsAddingNewGuest] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    } catch (error) {
      console.error('Ошибка форматирования даты:', error);
      return dateString;
    }
  };

  const handleGuestUpdated = (updatedGuest: any) => {
    if (updateGuest) {
      updateGuest(updatedGuest);
    }
    setSelectedGuest(updatedGuest);
  };

  // Если выбран гость, показываем детальный просмотр
  if (selectedGuest) {
    return (
        <GuestDetailView
            guest={selectedGuest}
            onBack={() => setSelectedGuest(null)}
            selectedSalesPoint={selectedSalesPoint}
            onGuestUpdated={handleGuestUpdated}
        />
    );
  }

  const handleGuestAdded = (newGuest: any) => {
    addGuest(newGuest);
    setIsAddingNewGuest(false);
  };

  if (isAddingNewGuest) {
    return (
        <AddGuestDialog
            onGuestAdded={handleGuestAdded}
            selectedSalesPoint={selectedSalesPoint}
            onClose={() => setIsAddingNewGuest(false)}
        />
    );
  }
  if (loading) {
    return (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <div>Загрузка гостей...</div>
            </CardContent>
          </Card>
        </div>
    );
  }
  if (error) {
    return (
        <div className="space-y-6">
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="text-red-600">Ошибка загрузки гостей: {error}</div>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {selectedSalesPoint && (
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Точка продаж: {selectedSalesPoint.name}
                  {selectedSalesPoint.address && ` (${selectedSalesPoint.address})`}
                </div>
              </CardContent>
            </Card>
        )}

        <StatsUser filteredGuests={filteredGuests} selectedSalesPoint={selectedSalesPoint} />

        {/* Управление гостями */}
        <Card style={{
          borderRadius: '20px',
          border: 'var(--custom-border-primary)',
          background: 'var(--custom-bg-secondaryLineCard)',
          color: 'var(--custom-text)',
        }}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>База гостей {selectedSalesPoint && `- ${selectedSalesPoint.name}`}</CardTitle>
              <Dialog>
                <Button
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() => setIsAddingNewGuest(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить гостя
                </Button>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Fillter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
            />

            <Tabs defaultValue="table" className="space-y-4">
              <TabsList>
                <TabsTrigger value="table">Таблица</TabsTrigger>
                <TabsTrigger value="cards">Карточки</TabsTrigger>
                <TabsTrigger value="rezervation">Резервации</TabsTrigger>
              </TabsList>

              <TabsContent value="table">
                <div
                    className="px-6 pb-6"
                    style={{
                      height: '300px',
                      overflowY: 'auto',
                    }}
                >
                  {filteredGuests.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchTerm || statusFilter !== 'Все' || categoryFilter !== 'Все'
                            ? 'Гости не найдены по заданным фильтрам'
                            : 'Нет гостей для отображения'}
                      </div>
                  ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Гость</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Контакты</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Последний визит</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Действия</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredGuests.map((guest) => (
                              <TableRow
                                  key={guest.id}
                                  onClick={(e) => {
                                    if (
                                        e.target instanceof Element &&
                                        (e.target.closest('button') || e.target.closest('[data-action]'))
                                    ) {
                                      return;
                                    }
                                    setSelectedGuest(guest);
                                  }}
                              >
                                <TableCell >
                                  <div className="flex items-center space-x-2">
                                    <div>
                                      <div
                                          className="font-medium flex items-center space-x-2 cursor-pointer hover:text-orange-600"
                                          onClick={() => setSelectedGuest(guest)}
                                      >
                                        <span>{guest.full_name}</span>
                                        {guest.status === 'VIP' && <Star className="h-4 w-4 text-purple-600" />}
                                        {guest.category === 'Постоянный гость' && <Heart className="h-4 w-4 text-red-500" />}
                                      </div>
                                      <div className="text-sm text-muted-foreground">{guest.category}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-1 text-sm">
                                      <Phone className="h-3 w-3" />
                                      <span>{guest.phone}</span>
                                    </div>
                                    {guest.email && (
                                        <div className="flex items-center space-x-1 text-sm">
                                          <Mail className="h-3 w-3" />
                                          <span>{guest.email}</span>
                                        </div>
                                    )}
                                    {guest.address && (
                                        <div className="flex items-center space-x-1 text-sm">
                                          <MapPin className="h-3 w-3" />
                                          <span>{guest.address}</span>
                                        </div>
                                    )}
                                    {guest.birthday && (
                                        <div className="flex items-center space-x-1 text-sm">
                                          <CalendarIcon className="h-3 w-3" />
                                          <span>{guest.birthday}</span>
                                        </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getStatusColor(guest.status)}>
                                    {guest.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{formatDate(guest.date_at)}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700"
                                        onClick={() => openDeleteDialog(guest)}
                                        title="Удалить гостя"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                  )}

                  <EditGuestDialog
                      guest={editingGuest}
                      isOpen={isEditDialogOpen}
                      onClose={closeEditDialog}
                      onGuestUpdated={updateGuest}
                      selectedSalesPoint={selectedSalesPoint}
                  />

                  <DeleteGuestDialog
                      guest={deletingGuest}
                      isOpen={isDeleteDialogOpen}
                      onClose={closeDeleteDialog}
                      onGuestDeleted={deleteGuest}
                      loading={deleteLoading}
                  />
                </div>
              </TabsContent>

              <TabsContent value="cards">
                {filteredGuests.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      {searchTerm || statusFilter !== 'Все' || categoryFilter !== 'Все'
                          ? 'Гости не найдены по заданным фильтрам'
                          : 'Нет гостей для отображения'}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {filteredGuests.map((guest) => (
                          <Card key={guest.id} className="hover:shadow-lg transition-shadow"   onClick={() => setSelectedGuest(guest)} style={{
                            borderRadius: '20px',
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-primaryLine)',
                            color: 'var(--custom-text)',
                          }}>
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle
                                      className="text-lg flex items-center space-x-2 cursor-pointer hover:text-orange-600"
                                      onClick={() => setSelectedGuest(guest)}
                                  >
                                    <span>{guest.full_name}</span>
                                    {guest.status === 'VIP' && <Star className="h-4 w-4 text-purple-600" />}
                                  </CardTitle>
                                  <p className="text-sm text-muted-foreground">{guest.category}</p>
                                </div>
                                <Badge className={getStatusColor(guest.status)}>
                                  {guest.status}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2 text-sm">
                                  <Phone className="h-3 w-3" />
                                  <span>{guest.phone}</span>
                                </div>
                                {guest.email && (
                                    <div className="flex items-center space-x-2 text-sm">
                                      <Mail className="h-3 w-3" />
                                      <span>{guest.email}</span>
                                    </div>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Посещений:</p>
                                  <p className="font-medium"> {guest.totalVisits || 0}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Сумма:</p>
                                  <p className="font-medium text-green-600">₽{guest.totalSpent || 0}</p>
                                </div>
                              </div>
                              <div className="text-sm">
                                <p className="text-muted-foreground">Последний визит:</p>
                                <p>{formatDate(guest.date_at)}</p>
                              </div>
                              <div className="flex justify-end space-x-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => openDeleteDialog(guest)}
                                    title="Удалить гостя"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                      ))}
                    </div>
                )}
              </TabsContent>

              <TabsContent value="rezervation">
                <ReservationsSection selectedSalesPoint={selectedSalesPoint} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
  );
}