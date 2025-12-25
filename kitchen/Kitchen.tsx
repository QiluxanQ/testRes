import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Clock, ChefHat, AlertCircle, CheckCircle, Timer, Play, Pause, RotateCcw } from 'lucide-react';

const kitchenOrders = [
  {
    id: '#001',
    table: 'Стол 5',
    waiter: 'Анна С.',
    orderTime: '14:30',
    status: 'готовится',
    priority: 'normal',
    estimatedTime: 25,
    elapsedTime: 15,
    items: [
      { name: 'Борщ украинский', status: 'готово', cookTime: 15, station: 'Холодный цех' },
      { name: 'Стейк рибай', status: 'готовится', cookTime: 25, station: 'Горячий цех' },
      { name: 'Салат Цезарь', status: 'ожидает', cookTime: 10, station: 'Холодный цех' }
    ],
    chef: 'Иван К.',
    notes: 'Стейк medium, без лука в салате'
  },
  {
    id: '#002',
    table: 'Стол 12',
    waiter: 'Петр К.',
    orderTime: '14:45',
    status: 'готов',
    priority: 'normal',
    estimatedTime: 20,
    elapsedTime: 18,
    items: [
      { name: 'Паста карбонара', status: 'готово', cookTime: 15, station: 'Горячий цех' },
      { name: 'Тирамису', status: 'готово', cookTime: 5, station: 'Кондитерский цех' },
      { name: 'Эспрессо', status: 'готово', cookTime: 2, station: 'Бар' }
    ],
    chef: 'Мария П.',
    notes: ''
  },
  {
    id: '#003',
    table: 'Стол 3',
    waiter: 'Мария Л.',
    orderTime: '15:00',
    status: 'новый',
    priority: 'высокий',
    estimatedTime: 35,
    elapsedTime: 0,
    items: [
      { name: 'Лобстер гриль', status: 'ожидает', cookTime: 30, station: 'Горячий цех' },
      { name: 'Устрицы', status: 'ожидает', cookTime: 5, station: 'Холодный цех' }
    ],
    chef: 'Андрей С.',
    notes: 'VIP гость, особое внимание к подаче'
  },
  {
    id: '#004',
    table: 'Доставка',
    waiter: 'Система',
    orderTime: '15:15',
    status: 'просрочен',
    priority: 'высокий',
    estimatedTime: 20,
    elapsedTime: 32,
    items: [
      { name: 'Пицца Маргарита', status: 'готовится', cookTime: 12, station: 'Пицца цех' },
      { name: 'Чизкейк', status: 'готово', cookTime: 5, station: 'Кондитерский цех' }
    ],
    chef: 'Николай В.',
    notes: 'Срочная доставка'
  }
];

const stations = ['Все станции', 'Горячий цех', 'Холодный цех', 'Кондитерский цех', 'Пицца цех', 'Бар'];

const statusColors = {
  'новый': 'bg-blue-100 text-blue-800',
  'готовится': 'bg-yellow-100 text-yellow-800',
  'готов': 'bg-green-100 text-green-800',
  'просрочен': 'bg-red-100 text-red-800'
};

const priorityColors = {
  'низкий': 'bg-gray-100 text-gray-800',
  'normal': 'bg-blue-100 text-blue-800',
  'высокий': 'bg-red-100 text-red-800'
};

const itemStatusColors = {
  'ожидает': 'bg-gray-100 text-gray-800',
  'готовится': 'bg-yellow-100 text-yellow-800',
  'готово': 'bg-green-100 text-green-800'
};

export function Kitchen() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stationFilter, setStationFilter] = useState('Все станции');
  const [statusFilter, setStatusFilter] = useState('Все статусы');

  const filteredOrders = kitchenOrders.filter(order => {
    const matchesStation = stationFilter === 'Все станции' || 
                          order.items.some(item => item.station === stationFilter);
    const matchesStatus = statusFilter === 'Все статусы' || order.status === statusFilter;
    return matchesStation && matchesStatus;
  });

  const getOrderProgress = (order) => {
    const completedItems = order.items.filter(item => item.status === 'готово').length;
    return (completedItems / order.items.length) * 100;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'новый': return <Clock className="h-4 w-4" />;
      case 'готовится': return <Timer className="h-4 w-4" />;
      case 'готов': return <CheckCircle className="h-4 w-4" />;
      case 'просрочен': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getKitchenStats = () => {
    const activeOrders = kitchenOrders.filter(o => o.status === 'готовится' || o.status === 'новый').length;
    const completedOrders = kitchenOrders.filter(o => o.status === 'готов').length;
    const overdueOrders = kitchenOrders.filter(o => o.status === 'просрочен').length;
    const avgCookTime = Math.round(kitchenOrders.reduce((acc, order) => acc + order.elapsedTime, 0) / kitchenOrders.length);
    
    return { activeOrders, completedOrders, overdueOrders, avgCookTime };
  };

  const stats = getKitchenStats();

  return (
    <div className="space-y-6">
      {/* Статистика кухни */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Активные заказы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">В работе</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Готовые заказы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground">Ждут подачи</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Просроченные</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueOrders}</div>
            <p className="text-xs text-muted-foreground">Требуют внимания</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Среднее время</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCookTime} мин</div>
            <p className="text-xs text-muted-foreground">Приготовления</p>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Заказы кухни</CardTitle>
            <div className="flex space-x-2">
              <Select value={stationFilter} onValueChange={setStationFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Фильтр по станции" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map(station => (
                    <SelectItem key={station} value={station}>{station}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Фильтр по статусу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Все статусы">Все статусы</SelectItem>
                  <SelectItem value="новый">Новые</SelectItem>
                  <SelectItem value="готовится">Готовятся</SelectItem>
                  <SelectItem value="готов">Готовые</SelectItem>
                  <SelectItem value="просрочен">Просроченные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="board" className="space-y-4">
            <TabsList>
              <TabsTrigger value="board">Доска заказов</TabsTrigger>
              <TabsTrigger value="timeline">Временная шкала</TabsTrigger>
              <TabsTrigger value="stations">По станциям</TabsTrigger>
            </TabsList>
            <div
                className="px-6 pb-6"
                style={{
                  height: '550px',
                  overflowY: 'auto',
                }}
            >

            <TabsContent value="board">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                  <Card 
                    key={order.id} 
                    className={`border-l-4 ${
                      order.status === 'просрочен' ? 'border-l-red-500' :
                      order.priority === 'высокий' ? 'border-l-orange-500' :
                      'border-l-blue-500'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{order.id}</CardTitle>
                          <p className="text-sm text-muted-foreground">{order.table} • {order.waiter}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge className={statusColors[order.status]}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(order.status)}
                              <span>{order.status}</span>
                            </div>
                          </Badge>
                          {order.priority !== 'normal' && (
                            <Badge className={priorityColors[order.priority]} size="sm">
                              {order.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span>Время заказа: {order.orderTime}</span>
                        <span className={order.elapsedTime > order.estimatedTime ? 'text-red-600' : ''}>
                          {order.elapsedTime}/{order.estimatedTime} мин
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Прогресс</span>
                          <span>{Math.round(getOrderProgress(order))}%</span>
                        </div>
                        <Progress value={getOrderProgress(order)} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Блюда:</div>
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <div className="font-medium text-sm">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.station}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs">{item.cookTime}м</span>
                              <Badge className={itemStatusColors[item.status]} size="sm">
                                {item.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {order.notes && (
                        <div className="p-2 bg-yellow-50 rounded">
                          <div className="text-xs font-medium text-yellow-800">Примечания:</div>
                          <div className="text-xs text-yellow-700">{order.notes}</div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm text-muted-foreground">Повар: {order.chef}</span>
                        <div className="flex space-x-1">
                          {order.status === 'новый' && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <Play className="h-3 w-3 mr-1" />
                              Начать
                            </Button>
                          )}
                          {order.status === 'готовится' && (
                            <>
                              <Button size="sm" variant="outline">
                                <Pause className="h-3 w-3" />
                              </Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Готов
                              </Button>
                            </>
                          )}
                          {order.status === 'готов' && (
                            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                              Подан
                            </Button>
                          )}
                          {order.status === 'просрочен' && (
                            <Button size="sm" variant="destructive">
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Перезапуск
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline">
              <div className="space-y-4">
                {filteredOrders
                  .sort((a, b) => a.orderTime.localeCompare(b.orderTime))
                  .map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-sm font-medium">{order.orderTime}</div>
                            <div className="flex items-center space-x-2">
                              <Badge className={statusColors[order.status]}>
                                {order.status}
                              </Badge>
                              <span className="font-medium">{order.id}</span>
                              <span className="text-muted-foreground">{order.table}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-sm">
                              {order.elapsedTime}/{order.estimatedTime} мин
                            </div>
                            <Progress value={getOrderProgress(order)} className="w-24 h-2" />
                            <div className="text-sm text-muted-foreground">
                              {Math.round(getOrderProgress(order))}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="stations">
              <div className="space-y-6">
                {stations.slice(1).map(station => {
                  const stationOrders = filteredOrders.filter(order => 
                    order.items.some(item => item.station === station)
                  );
                  if (stationOrders.length === 0) return null;
                  
                  return (
                    <Card key={station}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="flex items-center space-x-2">
                            <ChefHat className="h-5 w-5" />
                            <span>{station}</span>
                          </CardTitle>
                          <Badge variant="secondary">
                            {stationOrders.length} заказов
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {stationOrders.map((order) => (
                            <div key={order.id} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">{order.id}</span>
                                <Badge className={statusColors[order.status]} size="sm">
                                  {order.status}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                {order.items
                                  .filter(item => item.station === station)
                                  .map((item, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                      <span>{item.name}</span>
                                      <Badge className={itemStatusColors[item.status]} size="sm">
                                        {item.status}
                                      </Badge>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}