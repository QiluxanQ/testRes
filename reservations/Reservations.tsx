import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Calendar } from '../../ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Textarea } from '../../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import {
  Plus, Search, Calendar as CalendarIcon, Clock, Users, Phone, CheckCircle,
  XCircle, Edit, Trash2, Loader2, UserPlus, ArrowLeft, Save, X,
  MapPin, User, Mail, Cake, Heart, AlertCircle, MessageSquare, Star,
  ShoppingCart, TrendingUp, ArrowUpRight, ArrowDownRight, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

// Типы данных
export interface Reservation {
  id: number;
  point_retail_id: number;
  guest_id: number;
  table_id: number;
  reservation_time: string;
  end_time: string;
  status: string;
  count_guest: number;
  comment: string;
  metadate: Record<string, any> | null;
}

export interface Guest {
  id: number;
  point_retail_id: number;
  full_name: string;
  phone: string;
  email: string;
  status: string;
  discount_id: number | null;
  date_at: string;
  address?: string;
  birthday?: string;
  amount_orders?: string;
  balls?: string;
  metadate?: {
    food_preferences?: string;
    preferred_drinks?: string;
    dietary_restrictions?: string;
    allergies?: string;
    special_requests?: string;
    preferred_table?: string;
  };
}

export interface TableData {
  id: number;
  point_retail_id: number;
  hall_id: number;
  name: string;
  count_seats: number;
  status: string;
}

export interface Hall {
  id: number;
  point_retail_id: number;
  name: string;
}

export interface PointRetail {
  id: number;
  name: string;
  address: string;
}

export interface NewReservationForm {
  point_retail_id: number;
  guest_id: number | null;
  guest_name: string;
  guest_phone: string;
  table_id: number;
  reservation_time: string;
  end_time: string;
  status: string;
  count_guest: number;
  comment: string;
}

export interface ReservationEditForm {
  id: number;
  guest_id: number;
  table_id: number;
  reservation_time: string;
  end_time: string;
  status: string;
  count_guest: number;
  comment: string;
}

// Кэш для данных
const dataCache = {
  reservations: null as Reservation[] | null,
  guests: null as Guest[] | null,
  tables: null as TableData[] | null,
  halls: null as Hall[] | null,
  points: null as PointRetail[] | null,
  lastUpdate: null as number | null,

  isCacheValid(minutes: number = 5): boolean {
    if (!this.lastUpdate) return false;
    return (Date.now() - this.lastUpdate) < (minutes * 60 * 1000);
  },

  setReservations(data: Reservation[]) {
    this.reservations = data;
    this.lastUpdate = Date.now();
  },

  getReservations(): Reservation[] | null {
    return this.reservations;
  },

  setGuests(data: Guest[]) {
    this.guests = data;
  },

  getGuests(): Guest[] | null {
    return this.guests;
  },

  setTables(data: TableData[]) {
    this.tables = data;
  },

  getTables(): TableData[] | null {
    return this.tables;
  },

  setHalls(data: Hall[]) {
    this.halls = data;
  },

  getHalls(): Hall[] | null {
    return this.halls;
  },

  setPoints(data: PointRetail[]) {
    this.points = data;
  },

  getPoints(): PointRetail[] | null {
    return this.points;
  },

  clear() {
    this.reservations = null;
    this.guests = null;
    this.tables = null;
    this.halls = null;
    this.points = null;
    this.lastUpdate = null;
  }
};

// Вспомогательные функции для работы с датами
const formatDateTimeForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
};

const getLocalDateFromString = (dateString: string): Date => {
  try {
    const date = new Date(dateString);
    return new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds()
    );
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return new Date();
  }
};

const getDateWithoutTime = (dateString: string): string => {
  try {
    const date = getLocalDateFromString(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  } catch (error) {
    console.error('Error getting date without time:', dateString, error);
    const match = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return dateString;
  }
};

const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const parseDateTimeString = (dateString: string): Date => {
  if (dateString.includes('Z') || dateString.includes('+')) {
    return new Date(dateString);
  }
  return new Date(dateString + 'Z');
};

// Компонент для просмотра и редактирования гостя (как в примере)
const GuestProfileView = ({
                            guest,
                            onBack,
                            onUpdateGuest,
                            selectedPoint
                          }: {
  guest: Guest;
  onBack: () => void;
  onUpdateGuest: (guest: Guest) => Promise<void>;
  selectedPoint: PointRetail | null;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentGuest, setCurrentGuest] = useState<Guest>(guest);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mockGuestData = useMemo(() => {
    const birthday = currentGuest.birthday ? new Date(currentGuest.birthday) : null;
    const birthdaySoon = birthday ?
        (new Date(birthday.getFullYear(), birthday.getMonth(), birthday.getDate()).getTime() - new Date().getTime()) <= 7 * 24 * 60 * 60 * 1000 :
        false;

    return {
      stats: {
        totalVisits: parseInt(currentGuest.amount_orders || '0'),
        totalSpent: parseInt(currentGuest.balls || '0') * 1000,
        avgCheck: parseInt(currentGuest.balls || '0') * 100,
        frequency: 2.5,
        rfmScore: 555
      },
      segment: 'Лояльные клиенты',
      loyaltyPoints: parseInt(currentGuest.balls || '0'),
      loyaltyLevel: 'gold',
      tags: ['Постоянный клиент', 'Любит вино'],
      notes: [
        {
          user: 'Администратор',
          date: new Date().toISOString(),
          text: 'Предпочитает столик у окна'
        }
      ],
      orderHistory: [
        {
          id: '#12345',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          items: 3,
          amount: 4500,
          status: 'closed',
          order_type: 'dine_in',
          rating: 5,
          comment: 'Отличное обслуживание!'
        }
      ],
      communications: [
        {
          type: 'email',
          status: 'opened',
          subject: 'Спасибо за посещение!',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
  }, [currentGuest]);

  const getSegmentBadge = (segment: string) => {
    switch (segment) {
      case 'Лояльные клиенты':
        return <Badge className="bg-purple-100 text-purple-800">Лояльные клиенты</Badge>;
      case 'Новые клиенты':
        return <Badge className="bg-blue-100 text-blue-800">Новые клиенты</Badge>;
      case 'Уходящие клиенты':
        return <Badge className="bg-red-100 text-red-800">Уходящие клиенты</Badge>;
      default:
        return <Badge variant="outline">{segment}</Badge>;
    }
  };

  const getLoyaltyBadge = (level: string) => {
    switch (level) {
      case 'gold':
        return 'Gold уровень';
      case 'silver':
        return 'Silver уровень';
      default:
        return 'Базовый уровень';
    }
  };

  const birthdaySoon = useMemo(() => {
    if (!currentGuest.birthday) return false;
    const birthday = new Date(currentGuest.birthday);
    const now = new Date();
    const nextBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
    if (nextBirthday < now) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    const diffTime = nextBirthday.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }, [currentGuest.birthday]);

  const handleFieldChange = (field: keyof Guest, value: any) => {
    setCurrentGuest(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setCurrentGuest(guest);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await onUpdateGuest(currentGuest);
      setIsEditing(false);
      toast.success('Данные гостя успешно обновлены');
    } catch (error) {
      console.error('Error saving guest:', error);
      toast.error('Ошибка при сохранении данных');
    } finally {
      setIsSaving(false);
    }
  };

  const loadOrderHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Здесь будет загрузка истории заказов с API
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      setError('Не удалось загрузить историю заказов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (guest) {
      setCurrentGuest(guest);
    }
  }, [guest]);

  return (
      <div className="space-y-6">
        {/* Кнопка возврата */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к списку
          </Button>
          <div className="flex items-center gap-2">
            {selectedPoint && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Точка продаж: {selectedPoint.name}
                </div>
            )}
          </div>
        </div>

        {/* Заголовок профиля */}
        <Card>
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
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Визиты</div>
              <div className="text-2xl font-medium">{mockGuestData.stats.totalVisits}</div>
              <div className="text-xs text-muted-foreground mt-1">{mockGuestData.stats.frequency.toFixed(1)}/мес</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Потрачено</div>
              <div className="text-2xl font-medium text-green-600">₽{mockGuestData.stats.totalSpent.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">Всего</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Средний чек</div>
              <div className="text-2xl font-medium text-orange-600">₽{mockGuestData.stats.avgCheck.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">За визит</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Баллы</div>
              <div className="text-2xl font-medium text-purple-600">{mockGuestData.loyaltyPoints}</div>
              <div className="text-xs text-muted-foreground mt-1">{getLoyaltyBadge(mockGuestData.loyaltyLevel)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Заметки с предупреждениями */}
        {mockGuestData.notes.length > 0 && (
            <Card className="border-blue-500">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  Важные заметки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockGuestData.notes.map((note, idx) => (
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
              <Card>
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

              <Card>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Теги</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {mockGuestData.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
            )}
          </TabsContent>

          {/* История заказов */}
          <TabsContent value="orders" className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Всего заказов</div>
                  <div className="text-3xl font-medium">
                    {loading ? '...' : mockGuestData.orderHistory.length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Общая сумма</div>
                  <div className="text-3xl font-medium text-green-600">
                    {loading ? '...' : `₽${mockGuestData.stats.totalSpent.toLocaleString()}`}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Средний рейтинг</div>
                  <div className="flex items-center gap-1">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-3xl font-medium">
                    {loading ? '...' : (
                        (mockGuestData.orderHistory
                                .filter(o => o.rating)
                                .reduce((sum, o) => sum + (o.rating || 0), 0) /
                            mockGuestData.orderHistory.filter(o => o.rating).length || 0
                        ).toFixed(1)
                    )}
                  </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {loading && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div>Загрузка заказов...</div>
                  </CardContent>
                </Card>
            )}

            {error && (
                <Card className="border-red-200">
                  <CardContent className="p-6">
                    <div className="text-red-600">Ошибка загрузки заказов: {error}</div>
                  </CardContent>
                </Card>
            )}

            {!loading && !error && (
                <>
                  <Card>
                    <CardContent className="p-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Заказ</TableHead>
                            <TableHead>Дата</TableHead>
                            <TableHead>Позиций</TableHead>
                            <TableHead>Сумма</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Тип заказа</TableHead>
                            <TableHead>Рейтинг</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockGuestData.orderHistory.map((order) => (
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
                                  <Badge variant="outline">
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

                  {mockGuestData.orderHistory.some(o => o.comment) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Отзывы</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {mockGuestData.orderHistory
                                .filter(o => o.comment)
                                .map((order) => (
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
              <Card>
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
                        {currentGuest.metadate.food_preferences.split(',').map((preference, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-orange-50 rounded">
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

              <Card>
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
                        {currentGuest.metadate.preferred_drinks.split(',').map((drink, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
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

            <Card>
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
                        {currentGuest.metadate.dietary_restrictions.split(',').map((restriction, idx) => (
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
                        {currentGuest.metadate.allergies.split(',').map((allergy, idx) => (
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
              <h4 className="font-medium">История коммуникаций ({mockGuestData.communications.length})</h4>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                <Mail className="h-4 w-4 mr-2" />
                Отправить сообщение
              </Button>
            </div>
            <div className="space-y-3">
              {mockGuestData.communications.map((comm, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">
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
            <Card>
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

            <Card>
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

// Компонент для создания нового бронирования
const NewReservationView = ({
                              selectedPoint,
                              onBack,
                              onReservationCreated
                            }: {
  selectedPoint: PointRetail | null;
  onBack: () => void;
  onReservationCreated: () => void;
}) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<TableData[]>([]);
  const [isCreatingGuest, setIsCreatingGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const initialDate = new Date();
  initialDate.setHours(12, 0, 0, 0);

  const [newReservation, setNewReservation] = useState<NewReservationForm>({
    point_retail_id: selectedPoint?.id || 0,
    guest_id: null,
    guest_name: '',
    guest_phone: '',
    table_id: 0,
    reservation_time: formatDateTimeForAPI(initialDate),
    end_time: formatDateTimeForAPI(new Date(initialDate.getTime() + 2 * 60 * 60 * 1000)),
    status: 'ожидает подтверждения',
    count_guest: 1,
    comment: ''
  });

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');

        const guestsResponse = await fetch('/guests/?skip=0&limit=100', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (guestsResponse.ok) {
          const guestsData = await guestsResponse.json();
          const filteredGuests = selectedPoint
              ? guestsData.filter((guest: Guest) => guest.point_retail_id === selectedPoint.id)
              : guestsData;
          setGuests(filteredGuests);
        }

        const tablesResponse = await fetch('/tables/?skip=0&limit=100', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (tablesResponse.ok) {
          const tablesData = await tablesResponse.json();
          const filteredTables = selectedPoint
              ? tablesData.filter((table: TableData) => table.point_retail_id === selectedPoint.id)
              : tablesData;
          setTables(filteredTables);
        }
      } catch (error) {
        console.error('Error loading data for form:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedPoint]);

  const handleInputChange = (field: keyof NewReservationForm, value: any) => {
    setNewReservation(prev => ({ ...prev, [field]: value }));
  };

  const createGuest = async (guestData: Partial<Guest>): Promise<Guest | null> => {
    const token = localStorage.getItem('token');

    const fullGuestData: Partial<Guest> = {
      ...guestData,
      email: guestData.email || '',
      address: guestData.address || '',
      discount_id: guestData.discount_id || null,
      amount_orders: guestData.amount_orders || "0",
      balls: guestData.balls || "0",
      metadate: guestData.metadate || null
    };

    try {
      const response = await fetch('/guests/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fullGuestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Ошибка создания гостя');
      }

      const newGuest = await response.json();
      toast.success('Гость успешно создан');

      const updatedGuests = [newGuest, ...guests];
      setGuests(updatedGuests);

      return newGuest;
    } catch (error) {
      console.error('Error creating guest:', error);
      toast.error('Не удалось создать гостя');
      return null;
    }
  };

  const createReservation = async (reservationData: Partial<Reservation>): Promise<Reservation | null> => {
    const token = localStorage.getItem('token');

    const formattedData = {
      ...reservationData,
      reservation_time: reservationData.reservation_time?.replace('Z', '') || formatDateTimeForAPI(new Date()),
      end_time: reservationData.end_time?.replace('Z', '') || formatDateTimeForAPI(new Date(Date.now() + 2 * 60 * 60 * 1000)),
      status: reservationData.status === "null" || !reservationData.status ? "ожидает подтверждения" : reservationData.status,
      count_guest: reservationData.count_guest || 1,
      comment: reservationData.comment || "",
      metadate: reservationData.metadate || null
    };

    try {
      const response = await fetch('/reservations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ошибка создания бронирования: ${errorData.detail || 'Unknown error'}`);
      }

      const newReservation = await response.json();
      return newReservation;
    } catch (error) {
      console.error('Error creating reservation:', error);
      return null;
    }
  };

  const handleCreateReservation = async () => {
    if (!selectedPoint) {
      toast.error('Выберите точку продаж');
      return;
    }

    if (!newReservation.table_id) {
      toast.error('Выберите стол');
      return;
    }

    if (!newReservation.reservation_time) {
      toast.error('Выберите дату и время');
      return;
    }

    const startDate = parseDateTimeString(newReservation.reservation_time);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    let reservationData: Partial<Reservation> = {
      point_retail_id: selectedPoint.id,
      table_id: newReservation.table_id,
      reservation_time: formatDateTimeForAPI(startDate),
      end_time: formatDateTimeForAPI(endDate),
      status: newReservation.status,
      count_guest: newReservation.count_guest,
      comment: newReservation.comment || '',
      metadate: null
    };

    if (newReservation.guest_id) {
      reservationData.guest_id = newReservation.guest_id;

      const result = await createReservation(reservationData);
      if (result) {
        toast.success('Бронирование успешно создано');
        onReservationCreated();
        onBack();
      } else {
        toast.error('Не удалось создать бронирование');
      }
    } else if (newReservation.guest_name && newReservation.guest_phone) {
      setIsCreatingGuest(true);
      try {
        const guestData: Partial<Guest> = {
          point_retail_id: selectedPoint.id,
          full_name: newReservation.guest_name,
          phone: newReservation.guest_phone,
          email: '',
          address: '',
          status: 'active',
          discount_id: null,
          amount_orders: "0",
          balls: "0"
        };

        const newGuest = await createGuest(guestData);

        if (newGuest) {
          reservationData.guest_id = newGuest.id;

          const result = await createReservation(reservationData);
          if (result) {
            toast.success('Бронирование успешно создано');
            onReservationCreated();
            onBack();
          } else {
            toast.error('Не удалось создать бронирование');
          }
        }
      } catch (error) {
        console.error('Error creating guest and reservation:', error);
        toast.error('Ошибка при создании гостя и бронирования');
      } finally {
        setIsCreatingGuest(false);
      }
    } else {
      toast.error('Заполните данные гостя');
    }
  };

  const resetForm = () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    setNewReservation({
      point_retail_id: selectedPoint?.id || 0,
      guest_id: null,
      guest_name: '',
      guest_phone: '',
      table_id: 0,
      reservation_time: formatDateTimeForAPI(today),
      end_time: formatDateTimeForAPI(new Date(today.getTime() + 2 * 60 * 60 * 1000)),
      status: 'ожидает подтверждения',
      count_guest: 1,
      comment: ''
    });
  };

  const handleCancel = () => {
    resetForm();
    onBack();
  };

  if (isLoading) {
    return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к списку
            </Button>
          </div>
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
              <div>Загрузка данных...</div>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к списку
          </Button>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">Новое бронирование</Badge>
            {selectedPoint && (
                <Badge variant="outline">
                  {selectedPoint.name}
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
                <p className="text-sm text-muted-foreground mt-1">
                  Заполните все необходимые данные для создания бронирования
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isCreatingGuest}
                >
                  <X className="h-4 w-4 mr-2" />
                  Отмена
                </Button>
                <Button
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={handleCreateReservation}
                    disabled={isCreatingGuest || !selectedPoint}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isCreatingGuest ? 'Создание...' : 'Создать бронирование'}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Информация о госте
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Гость</label>
                <Select
                    value={newReservation.guest_id?.toString() || 'new'}
                    onValueChange={(value) => {
                      if (value === 'new') {
                        setNewReservation(prev => ({ ...prev, guest_id: null }));
                      } else {
                        const guest = guests.find(g => g.id.toString() === value);
                        if (guest) {
                          setNewReservation(prev => ({
                            ...prev,
                            guest_id: guest.id,
                            guest_name: guest.full_name,
                            guest_phone: guest.phone
                          }));
                        }
                      }
                    }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите гостя" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">
                      <div className="flex items-center">
                        <UserPlus className="h-4 w-4 mr-2" />
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

              {!newReservation.guest_id && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">ФИО гостя *</label>
                      <Input
                          placeholder="Фамилия Имя Отчество"
                          value={newReservation.guest_name}
                          onChange={(e) => handleInputChange('guest_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Телефон *</label>
                      <Input
                          placeholder="+7 (999) 123-45-67"
                          value={newReservation.guest_phone}
                          onChange={(e) => handleInputChange('guest_phone', e.target.value)}
                      />
                    </div>
                  </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Детали бронирования
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Дата *</label>
                  <Input
                      type="date"
                      value={newReservation.reservation_time.split('T')[0]}
                      onChange={(e) => {
                        const date = e.target.value;
                        const timeStr = newReservation.reservation_time.split('T')[1] || '12:00:00.000';
                        const newDateTime = `${date}T${timeStr}`;
                        const newDate = parseDateTimeString(newDateTime);
                        const endDate = new Date(newDate.getTime() + 2 * 60 * 60 * 1000);

                        setNewReservation(prev => ({
                          ...prev,
                          reservation_time: formatDateTimeForAPI(newDate),
                          end_time: formatDateTimeForAPI(endDate)
                        }));
                      }}
                      min={getLocalDateString(new Date())}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Время *</label>
                  <Select
                      value={(() => {
                        try {
                          const date = parseDateTimeString(newReservation.reservation_time);
                          const hours = String(date.getHours()).padStart(2, '0');
                          const minutes = String(date.getMinutes()).padStart(2, '0');
                          return `${hours}:${minutes}`;
                        } catch {
                          return '12:00';
                        }
                      })()}
                      onValueChange={(time) => {
                        const timeParts = time.split(':');
                        const date = parseDateTimeString(newReservation.reservation_time);
                        date.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);
                        const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000);

                        setNewReservation(prev => ({
                          ...prev,
                          reservation_time: formatDateTimeForAPI(date),
                          end_time: formatDateTimeForAPI(endDate)
                        }));
                      }}
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
                      value={newReservation.count_guest}
                      onChange={(e) => handleInputChange('count_guest', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Статус *</label>
                  <Select
                      value={newReservation.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ожидает подтверждения">Ожидает подтверждения</SelectItem>
                      <SelectItem value="подтверждена">Подтверждена</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Стол *</label>
                <Select
                    value={newReservation.table_id.toString()}
                    onValueChange={(value) => handleInputChange('table_id', parseInt(value))}
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
                    value={newReservation.comment}
                    onChange={(e) => handleInputChange('comment', e.target.value)}
                    rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedPoint && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Информация о точке продаж
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Точка продаж</p>
                    <p className="font-medium">{selectedPoint.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Адрес</p>
                    <p className="font-medium">{selectedPoint.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
        )}
      </div>
  );
};

// Компонент для редактирования бронирования
const EditReservationView = ({
                               reservation,
                               guests,
                               tables,
                               selectedPoint,
                               onBack,
                               onUpdateReservation
                             }: {
  reservation: Reservation;
  guests: Guest[];
  tables: TableData[];
  selectedPoint: PointRetail | null;
  onBack: () => void;
  onUpdateReservation: (id: number, data: Partial<Reservation>) => Promise<Reservation | null>;
}) => {
  const [editForm, setEditForm] = useState<ReservationEditForm>({
    id: reservation.id,
    guest_id: reservation.guest_id,
    table_id: reservation.table_id,
    reservation_time: reservation.reservation_time,
    end_time: reservation.end_time,
    status: reservation.status,
    count_guest: reservation.count_guest,
    comment: reservation.comment || ''
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: keyof ReservationEditForm, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateReservation(reservation.id, editForm);
      toast.success('Бронирование успешно обновлено');
      onBack();
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast.error('Ошибка при обновлении бронирования');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDisplayDateTime = (dateString: string) => {
    const date = parseDateTimeString(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к списку
          </Button>
          <div className="flex items-center gap-2">
            {selectedPoint && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Точка продаж: {selectedPoint.name}
                </div>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Edit className="h-6 w-6 text-orange-600" />
                  Редактирование бронирования #{reservation.id}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDisplayDateTime(reservation.reservation_time)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Отмена
                </Button>
                <Button
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                  {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                      <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
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
                <label className="text-sm font-medium mb-2 block">Гость</label>
                <Select
                    value={editForm.guest_id.toString()}
                    onValueChange={(value) => handleInputChange('guest_id', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите гостя" />
                  </SelectTrigger>
                  <SelectContent>
                    {guests.map(guest => (
                        <SelectItem key={guest.id} value={guest.id.toString()}>
                          {guest.full_name} - {guest.phone}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Детали бронирования</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Дата и время</label>
                <Input
                    type="datetime-local"
                    value={editForm.reservation_time.replace('Z', '').slice(0, 16)}
                    onChange={(e) => {
                      const newDateTime = e.target.value + ':00.000';
                      const newDate = parseDateTimeString(newDateTime);
                      const endDate = new Date(newDate.getTime() + 2 * 60 * 60 * 1000);

                      setEditForm(prev => ({
                        ...prev,
                        reservation_time: formatDateTimeForAPI(newDate),
                        end_time: formatDateTimeForAPI(endDate)
                      }));
                    }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Количество гостей</label>
                  <Input
                      type="number"
                      min="1"
                      value={editForm.count_guest}
                      onChange={(e) => handleInputChange('count_guest', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Статус</label>
                  <Select
                      value={editForm.status}
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
                <label className="text-sm font-medium">Стол</label>
                <Select
                    value={editForm.table_id.toString()}
                    onValueChange={(value) => handleInputChange('table_id', parseInt(value))}
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
                    placeholder="Дополнительные пожелания"
                    value={editForm.comment}
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

export function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<TableData[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [points, setPoints] = useState<PointRetail[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<PointRetail | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Все');

  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingNewReservation, setIsCreatingNewReservation] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [viewingGuest, setViewingGuest] = useState<Guest | null>(null);

  const fetchReservations = useCallback(async (forceRefresh = false) => {
    const token = localStorage.getItem('token');
    if (!forceRefresh && dataCache.isCacheValid() && dataCache.getReservations()) {
      const cached = dataCache.getReservations() || [];
      setReservations(cached);
      return cached;
    }

    try {
      const response = await fetch('/reservations/?skip=0&limit=100', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Ошибка загрузки бронирований');

      const data = await response.json();
      const reservationsData = Array.isArray(data) ? data : [];

      const filteredReservations = selectedPoint
          ? reservationsData.filter((res: Reservation) => res.point_retail_id === selectedPoint.id)
          : reservationsData;

      dataCache.setReservations(filteredReservations);
      setReservations(filteredReservations);
      return filteredReservations;
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Не удалось загрузить бронирования');
      const fallback = dataCache.getReservations() || [];
      setReservations(fallback);
      return fallback;
    }
  }, [selectedPoint]);

  const fetchGuests = useCallback(async (forceRefresh = false) => {
    const token = localStorage.getItem('token');
    if (!forceRefresh && dataCache.isCacheValid() && dataCache.getGuests()) {
      const cached = dataCache.getGuests() || [];
      setGuests(cached);
      return cached;
    }

    try {
      const response = await fetch('/guests/?skip=0&limit=100', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      const guestsData = Array.isArray(data) ? data : [];

      const filteredGuests = selectedPoint
          ? guestsData.filter((guest: Guest) => guest.point_retail_id === selectedPoint.id)
          : guestsData;

      dataCache.setGuests(filteredGuests);
      setGuests(filteredGuests);
      return filteredGuests;
    } catch (error) {
      console.error('Error fetching guests:', error);
      const fallback = dataCache.getGuests() || [];
      setGuests(fallback);
      return fallback;
    }
  }, [selectedPoint]);

  const fetchTables = useCallback(async (forceRefresh = false) => {
    const token = localStorage.getItem('token');
    if (!forceRefresh && dataCache.isCacheValid() && dataCache.getTables()) {
      const cached = dataCache.getTables() || [];
      setTables(cached);
      return cached;
    }

    try {
      const response = await fetch('/tables/?skip=0&limit=100', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      const tablesData = Array.isArray(data) ? data : [];

      const filteredTables = selectedPoint
          ? tablesData.filter((table: TableData) => table.point_retail_id === selectedPoint.id)
          : tablesData;

      dataCache.setTables(filteredTables);
      setTables(filteredTables);
      return filteredTables;
    } catch (error) {
      console.error('Error fetching tables:', error);
      const fallback = dataCache.getTables() || [];
      setTables(fallback);
      return fallback;
    }
  }, [selectedPoint]);

  const fetchHalls = useCallback(async (forceRefresh = false) => {
    const token = localStorage.getItem('token');
    if (!forceRefresh && dataCache.isCacheValid() && dataCache.getHalls()) {
      const cached = dataCache.getHalls() || [];
      setHalls(cached);
      return cached;
    }

    try {
      const response = await fetch('/hall-tables/?skip=0&limit=100', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      const hallsData = Array.isArray(data) ? data : [];

      const filteredHalls = selectedPoint
          ? hallsData.filter((hall: Hall) => hall.point_retail_id === selectedPoint.id)
          : hallsData;

      dataCache.setHalls(filteredHalls);
      setHalls(filteredHalls);
      return filteredHalls;
    } catch (error) {
      console.error('Error fetching halls:', error);
      const fallback = dataCache.getHalls() || [];
      setHalls(fallback);
      return fallback;
    }
  }, [selectedPoint]);

  const fetchPoints = useCallback(async (forceRefresh = false) => {
    const token = localStorage.getItem('token');
    if (!forceRefresh && dataCache.isCacheValid() && dataCache.getPoints()) {
      const cached = dataCache.getPoints() || [];
      setPoints(cached);
      return cached;
    }

    try {
      const response = await fetch('/points-retail/?skip=0&limit=100', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      const pointsData = Array.isArray(data) ? data : [];

      dataCache.setPoints(pointsData);
      setPoints(pointsData);

      return pointsData;
    } catch (error) {
      console.error('Error fetching points:', error);
      const fallback = dataCache.getPoints() || [];
      setPoints(fallback);
      return fallback;
    }
  }, []);

  const updateReservation = useCallback(async (id: number, reservationData: Partial<Reservation>): Promise<Reservation | null> => {
    const token = localStorage.getItem('token');

    const formattedData = { ...reservationData };

    if (formattedData.reservation_time) {
      formattedData.reservation_time = formattedData.reservation_time.replace('Z', '');
    }

    if (formattedData.end_time) {
      formattedData.end_time = formattedData.end_time.replace('Z', '');
    }

    try {
      const response = await fetch(`/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error('Ошибка обновления бронирования');
      }

      const updatedReservation = await response.json();
      await fetchReservations(true);
      return updatedReservation;
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  }, [fetchReservations]);

  const deleteReservation = useCallback(async (id: number): Promise<boolean> => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/reservations/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Ошибка удаления бронирования');

      await fetchReservations(true);
      return true;
    } catch (error) {
      console.error('Error deleting reservation:', error);
      throw error;
    }
  }, [fetchReservations]);

  const updateGuest = useCallback(async (guest: Guest): Promise<void> => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/guests/${guest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(guest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Ошибка обновления гостя');
      }

      await fetchGuests(true);
    } catch (error) {
      console.error('Error updating guest:', error);
      throw error;
    }
  }, [fetchGuests]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchPoints(),
          fetchReservations(),
          fetchGuests(),
          fetchTables(),
          fetchHalls()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchPoints, fetchReservations, fetchGuests, fetchTables, fetchHalls]);

  // Автоматическое обновление при изменении точки продаж
  useEffect(() => {
    if (selectedPoint) {
      const loadFilteredData = async () => {
        setIsLoading(true);
        try {
          await Promise.all([
            fetchReservations(true),
            fetchGuests(true),
            fetchTables(true),
            fetchHalls(true)
          ]);
        } catch (error) {
          console.error('Error loading filtered data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadFilteredData();
    }
  }, [selectedPoint, fetchReservations, fetchGuests, fetchTables, fetchHalls]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await updateReservation(id, { status: newStatus });
      toast.success('Статус успешно обновлен');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Ошибка при обновлении статуса');
    }
  };

  const handleDeleteReservation = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить это бронирование?')) {
      try {
        await deleteReservation(id);
        toast.success('Бронирование успешно удалено');
      } catch (error) {
        console.error('Error deleting reservation:', error);
        toast.error('Ошибка при удалении бронирования');
      }
    }
  };

  const handleReservationCreated = async () => {
    await fetchReservations(true);
  };

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
  };


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
        const reservationDateStr = getDateWithoutTime(reservation.reservation_time);
        const selectedDateStr = getLocalDateString(selectedDate);
        const matchesDate = reservationDateStr === selectedDateStr;

        if (!matchesDate) return false;
      }

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      const dateA = parseDateTimeString(a.reservation_time);
      const dateB = parseDateTimeString(b.reservation_time);
      return dateA.getTime() - dateB.getTime();
    });
  }, [reservations, guests, searchTerm, statusFilter, selectedDate]);

  const stats = useMemo(() => {
    const todayStr = getLocalDateString(new Date());
    const todayReservations = reservations.filter(r => {
      const reservationDateStr = getDateWithoutTime(r.reservation_time);
      return reservationDateStr === todayStr;
    });

    const pending = todayReservations.filter(r => r.status === 'ожидает подтверждения').length;
    const confirmed = todayReservations.filter(r => r.status === 'подтверждена').length;
    const totalGuests = todayReservations
        .filter(r => r.status === 'подтверждена')
        .reduce((sum, r) => sum + r.count_guest, 0);

    return {
      todayReservations: todayReservations.length,
      pending,
      confirmed,
      totalGuests
    };
  }, [reservations]);

  const formatDisplayDate = (dateString: string): string => {
    try {
      const date = parseDateTimeString(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      const match = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        return `${match[3]}.${match[2]}.${match[1]}`;
      }
      return dateString;
    }
  };

  const formatDisplayTime = (dateString: string): string => {
    try {
      const date = parseDateTimeString(dateString);
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      const timeMatch = dateString.match(/(\d{2}):(\d{2})/);
      if (timeMatch) {
        return `${timeMatch[1]}:${timeMatch[2]}`;
      }
      return dateString;
    }
  };

  const getGuestInfo = (guestId: number) => {
    const guest = guests.find(g => g.id === guestId);
    return guest || null;
  };

  const getTableInfo = (tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    return table || null;
  };

  const getHallInfo = (hallId: number) => {
    const hall = halls.find(h => h.id === hallId);
    return hall || null;
  };

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




  if (editingReservation) {
    return (
        <EditReservationView
            reservation={editingReservation}
            guests={guests}
            tables={tables}
            selectedPoint={selectedPoint}
            onBack={() => setEditingReservation(null)}
            onUpdateReservation={updateReservation}
        />
    );
  }

  // Если открыто создание нового бронирования
  if (isCreatingNewReservation) {
    return (
        <NewReservationView
            selectedPoint={selectedPoint}
            onBack={() => setIsCreatingNewReservation(false)}
            onReservationCreated={handleReservationCreated}
        />
    );
  }

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <span className="ml-2">Загрузка бронирований...</span>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Заголовок и выбор точки */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Управление бронированиями</h1>

          <div className="flex items-center space-x-4">
            <Select
                value={selectedPoint?.id.toString() || ""}
                onValueChange={(value) => {
                  const point = points.find(p => p.id.toString() === value);
                  setSelectedPoint(point || null);
                }}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Выберите точку продаж" />
              </SelectTrigger>
              <SelectContent>
                {points.map(point => (
                    <SelectItem key={point.id} value={point.id.toString()}>
                      {point.name} - {point.address}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
                onClick={() => {
                  dataCache.clear();
                  fetchReservations(true);
                  fetchGuests(true);
                  fetchTables(true);
                  fetchHalls(true);
                }}
                variant="outline"
            >
              Обновить данные
            </Button>
          </div>
        </div>

        {/* Статистика бронирований */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Сегодня бронирований</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.todayReservations}</div>
              <p className="text-xs text-muted-foreground">{stats.totalGuests} гостей</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Ожидают подтверждения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Требуют внимания</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Подтверждены</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
              <p className="text-xs text-muted-foreground">Активные брони</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Точка продаж</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedPoint?.name || 'Не выбрана'}</div>
              <p className="text-xs text-muted-foreground">{selectedPoint?.address || ''}</p>
            </CardContent>
          </Card>
        </div>

        {/* Управление бронированиями */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Календарь */}
          <Card>
            <CardHeader>
              <CardTitle>Календарь бронирований</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                  }}
                  className="rounded-md border"
              />
              <div className="mt-4 space-y-2">
                <div className="text-sm font-medium">
                  Выбранная дата: {selectedDate ? selectedDate.toLocaleDateString('ru-RU') : 'Не выбрана'}
                </div>
                {selectedDate && (
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {reservations
                          .filter(r => {
                            const reservationDateStr = getDateWithoutTime(r.reservation_time);
                            const selectedDateStr = getLocalDateString(selectedDate);
                            return reservationDateStr === selectedDateStr;
                          })
                          .map(reservation => {
                            const guest = getGuestInfo(reservation.guest_id);
                            return (
                                <div key={reservation.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
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
          <Card className="lg:col-span-2">
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
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Все">Все статусы</SelectItem>
                    <SelectItem value="подтверждена">Подтвержденные</SelectItem>
                    <SelectItem value="ожидает подтверждения">Ожидающие</SelectItem>
                    <SelectItem value="отменена">Отмененные</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Таблица бронирований */}
              <div className="h-[320px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Гость</TableHead>
                      <TableHead>Дата и время</TableHead>
                      <TableHead>Гости</TableHead>
                      <TableHead>Стол/Зона</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
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
                                        onClick={() => handleEditReservation(reservation)}
                                        title="Редактировать бронирование"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
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
            </CardContent>
          </Card>
        </div>
      </div>
  );
}