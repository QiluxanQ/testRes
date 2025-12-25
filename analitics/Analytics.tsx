import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Utensils, Clock, Target, BarChart3, PieChart as PieChartIcon, TrendingUp as TrendUp, Activity } from 'lucide-react';
import {
    Area,
    Bar, BarChart,
    CartesianGrid, Cell,
    ComposedChart,
    Line, Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

// Данные для графиков
const revenueComparisonData = [
    { day: 'Пн', current: 125000, previous: 118000, target: 130000 },
    { day: 'Вт', current: 142000, previous: 135000, target: 140000 },
    { day: 'Ср', current: 138000, previous: 145000, target: 145000 },
    { day: 'Чт', current: 155000, previous: 148000, target: 150000 },
    { day: 'Пт', current: 178000, previous: 165000, target: 170000 },
    { day: 'Сб', current: 210000, previous: 195000, target: 200000 },
    { day: 'Вс', current: 198000, previous: 185000, target: 195000 }
];

const hourlyLoadData = [
    { hour: '10:00', orders: 5, guests: 12, revenue: 18000 },
    { hour: '11:00', orders: 8, guests: 20, revenue: 32000 },
    { hour: '12:00', orders: 15, guests: 38, revenue: 68000 },
    { hour: '13:00', orders: 22, guests: 55, revenue: 105000 },
    { hour: '14:00', orders: 18, guests: 45, revenue: 85000 },
    { hour: '15:00', orders: 12, guests: 28, revenue: 52000 },
    { hour: '16:00', orders: 8, guests: 18, revenue: 35000 },
    { hour: '17:00', orders: 10, guests: 24, revenue: 45000 },
    { hour: '18:00', orders: 16, guests: 42, revenue: 78000 },
    { hour: '19:00', orders: 25, guests: 65, revenue: 125000 },
    { hour: '20:00', orders: 28, guests: 72, revenue: 142000 },
    { hour: '21:00', orders: 20, guests: 52, revenue: 98000 },
    { hour: '22:00', orders: 12, guests: 28, revenue: 55000 }
];

const topDishesData = [
    { name: 'Стейк Рибай', sold: 156, revenue: 624000, cost: 312000, profit: 312000, margin: 50 },
    { name: 'Паста Карбонара', sold: 245, revenue: 367500, cost: 147000, profit: 220500, margin: 60 },
    { name: 'Цезарь с курицей', sold: 198, revenue: 237600, cost: 118800, profit: 118800, margin: 50 },
    { name: 'Том Ям', sold: 167, revenue: 250500, cost: 125250, profit: 125250, margin: 50 },
    { name: 'Бургер премиум', sold: 189, revenue: 283500, cost: 141750, profit: 141750, margin: 50 },
    { name: 'Лосось на гриле', sold: 134, revenue: 335000, cost: 167500, profit: 167500, margin: 50 },
    { name: 'Пицца Маргарита', sold: 201, revenue: 241200, cost: 96480, profit: 144720, margin: 60 },
    { name: 'Ризотто с грибами', sold: 145, revenue: 217500, cost: 108750, profit: 108750, margin: 50 },
    { name: 'Тирамису', sold: 312, revenue: 218400, cost: 87360, profit: 131040, margin: 60 },
    { name: 'Чизкейк Нью-Йорк', sold: 289, revenue: 202300, cost: 80920, profit: 121380, margin: 60 }
];

const unprofitableDishesData = [
    { name: 'Лобстер термидор', sold: 12, revenue: 96000, cost: 84000, profit: 12000, margin: 12.5 },
    { name: 'Фуа-гра', sold: 8, revenue: 64000, cost: 57600, profit: 6400, margin: 10 },
    { name: 'Черная икра канапе', sold: 15, revenue: 120000, cost: 108000, profit: 12000, margin: 10 }
];

const tableTurnoverData = [
    { table: 'Стол 1', turns: 8, revenue: 56000, avgTime: 45 },
    { table: 'Стол 2', turns: 7, revenue: 49000, avgTime: 50 },
    { table: 'Стол 3', turns: 9, revenue: 63000, avgTime: 40 },
    { table: 'Стол 4', turns: 6, revenue: 42000, avgTime: 60 },
    { table: 'Стол 5', turns: 8, revenue: 56000, avgTime: 45 },
    { table: 'Стол 6', turns: 5, revenue: 35000, avgTime: 70 },
    { table: 'Стол 7', turns: 7, revenue: 49000, avgTime: 50 },
    { table: 'Стол 8 (VIP)', turns: 3, revenue: 75000, avgTime: 120 }
];

const categoryRevenueData = [
    { name: 'Основные блюда', value: 1245000, color: '#f97316' },
    { name: 'Напитки', value: 685000, color: '#3b82f6' },
    { name: 'Закуски', value: 412000, color: '#10b981' },
    { name: 'Десерты', value: 275000, color: '#f59e0b' },
    { name: 'Алкоголь', value: 563000, color: '#8b5cf6' }
];

const waiterPerformanceData = [
    { name: 'Иванов И.', orders: 45, revenue: 225000, avgCheck: 5000, guests: 112, rating: 4.8 },
    { name: 'Петрова А.', orders: 52, revenue: 260000, avgCheck: 5000, guests: 128, rating: 4.9 },
    { name: 'Сидоров П.', orders: 38, revenue: 152000, avgCheck: 4000, guests: 95, rating: 4.5 },
    { name: 'Козлова М.', orders: 41, revenue: 205000, avgCheck: 5000, guests: 102, rating: 4.7 }
];

const expenseBreakdownData = [
    { category: 'Продукты', amount: 980000, percent: 35 },
    { category: 'Зарплата', amount: 450000, percent: 16 },
    { category: 'Аренда', amount: 150000, percent: 5 },
    { category: 'Коммунальные', amount: 35000, percent: 1 },
    { category: 'Маркетинг', amount: 25000, percent: 1 },
    { category: 'Прочее', amount: 43000, percent: 2 }
];

export function Analytics() {
    const [period, setPeriod] = useState('today');
    const currentTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    // Вычисляем текущие KPI
    const currentRevenue = 127500;
    const previousRevenue = 115000;
    const revenueGrowth = ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1);

    const currentGuests = 285;
    const previousGuests = 268;
    const guestsGrowth = ((currentGuests - previousGuests) / previousGuests * 100).toFixed(1);

    const avgCheck = Math.round(currentRevenue / currentGuests);
    const previousAvgCheck = Math.round(previousRevenue / previousGuests);
    const avgCheckGrowth = ((avgCheck - previousAvgCheck) / previousAvgCheck * 100).toFixed(1);

    const totalArea = 250; // кв.м
    const revenuePerSqm = Math.round(currentRevenue / totalArea);

    const avgTableTurnover = (tableTurnoverData.reduce((sum, t) => sum + t.turns, 0) / tableTurnoverData.length).toFixed(1);

    const totalCost = expenseBreakdownData.reduce((sum, e) => sum + e.amount, 0);
    const costPercent = ((totalCost / currentRevenue) * 100).toFixed(1);

    const currentOrders = hourlyLoadData.reduce((sum, h) => sum + h.orders, 0);
    const tablesOccupied = 18;
    const totalTables = 24;
    const occupancyRate = Math.round((tablesOccupied / totalTables) * 100);

    return (
        <div className="space-y-6" >
            {/* Контролы */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Обновлено: {currentTime}</span>
                </div>
                <div className="flex gap-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Сегодня</SelectItem>
                            <SelectItem value="shift">Текущая смена</SelectItem>
                            <SelectItem value="week">За неделю</SelectItem>
                            <SelectItem value="month">За месяц</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">
                        <Activity className="h-4 w-4 mr-2" />
                        Обновить
                    </Button>
                </div>
            </div>

            {/* Основные метрики - первый ряд */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-primaryLine)',
                    color: 'var(--custom-text)',
                    }}>
                    <CardHeader className="pb-2" >
                        <CardTitle className="text-sm flex items-center" >
                            <div>
                                <DollarSign className="h-4 w-4 mr-2 text-white"  />
                            </div>
                            <span style={{ color:'var(--custom-text)', fontSize: 13 }} >
                             Выручка {period === 'today' ? 'за день' : period === 'shift' ? 'за смену' : 'за период'}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl text-orange-600">₽{currentRevenue.toLocaleString()}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            {Number(revenueGrowth) >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                            ) : (
                                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                            )}
                            <span className={Number(revenueGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {revenueGrowth}% к прошлому периоду
              </span>
                        </div>
                    </CardContent>
                </Card>

                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-primaryLine)',
                    color: 'var(--custom-text)',
                }}>
                    <CardHeader className="pb-2 text-white">
                        <CardTitle className="text-sm flex items-center">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            <span style={{ color:'var(--custom-text)', fontSize: 13 }}>
                            Средний чек
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl text-green-500">₽{avgCheck.toLocaleString()}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            {Number(avgCheckGrowth) >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                            ) : (
                                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                            )}
                            <span className={Number(avgCheckGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {avgCheckGrowth}% к прошлому периоду
              </span>
                        </div>
                    </CardContent>
                </Card>

                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-primaryLine)',
                    color: 'var(--custom-text)',
                }}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                            <Users className="h-4 w-4 mr-2 text-white" />
                            <span style={{ color:'var(--custom-text)', fontSize: 13 }}>
                            Количество гостей
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl text-blue-600">{currentGuests}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            {Number(guestsGrowth) >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                            ) : (
                                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                            )}
                            <span className={Number(guestsGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {guestsGrowth}% к прошлому периоду
              </span>
                        </div>
                    </CardContent>
                </Card>

                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-primaryLine)',
                    color: 'var(--custom-text)',
                }}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                            <Utensils className="h-4 w-4 mr-2 text-white" />
                            <span style={{ color:'var(--custom-text)', fontSize: 13 }}>
                            Загруженность столов
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl text-orange-600">{occupancyRate}%</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {tablesOccupied} из {totalTables} столов занято
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* KPI - второй ряд */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-primaryLine)',
                    color: 'var(--custom-text)',
                }}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                            <Target className="h-4 w-4 mr-2 text-white" />
                            <span style={{color:'var(--custom-text)', fontSize: 13 }}>
                            Выручка на м²
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl text-purple-600">₽{revenuePerSqm.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            При площади {totalArea} м²
                        </div>
                    </CardContent>
                </Card>

                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-primaryLine)',
                    color: 'var(--custom-text)',
                }}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                            <Activity className="h-4 w-4 mr-2 text-white" />
                            <span style={{ color:'var(--custom-text)', fontSize: 13 }}>
                            Оборачиваемость стола
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl text-green-500">{avgTableTurnover}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            раз за смену (среднее)
                        </div>
                    </CardContent>
                </Card>

                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-primaryLine)',
                    color: 'var(--custom-text)',
                }}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                            <BarChart3 className="h-4 w-4 mr-2 text-white" />
                            <span style={{color:'var(--custom-text)', fontSize: 13 }}>
                            Себестоимость
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl text-red-600">{costPercent}%</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            от выручки (₽{totalCost.toLocaleString()})
                        </div>
                    </CardContent>
                </Card>

                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-primaryLine)',
                    color: 'var(--custom-text)',
                }}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                            <ShoppingCart className="h-4 w-4 mr-2 text-white" />
                            <span style={{ color:'var(--custom-text)', fontSize: 13 }}>
                            Заказов за день
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl text-green-600">{currentOrders}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Среднее время обработки: 25 мин
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* График выручки в сравнении */}
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader style={{color:'var(--custom-text)'}}>
                    <CardTitle>Выручка: текущая неделя vs прошлая неделя vs план</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80" >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={revenueComparisonData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `₽${value.toLocaleString()}`} />
                                <Bar dataKey="previous" fill="#0891B2FF" name="Прошлая неделя" />
                                <Bar dataKey="current" fill="#f97316" name="Текущая неделя" />
                                <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} name="План" strokeDasharray="5 5" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Почасовая загрузка */}
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader className='text-white'>
                    <CardTitle style={{color:'var(--custom-text)'}}>Почасовая загрузка ресторана</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={hourlyLoadData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Area yAxisId="right" type="monotone" dataKey="revenue" fill="#fed7aa" stroke="#f97316" name="Выручка (₽)" />
                                <Bar yAxisId="left" dataKey="guests" fill="#3b82f6" name="Гостей" />
                                <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} name="Заказов" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Топ и антитоп блюд */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-secondaryLineCard)',
                    color: 'var(--custom-text)',
                }}>
                    <CardHeader>
                        <CardTitle className="flex items-center" style={{color:'var(--custom-text)'}}>
                            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                            Топ-10 продаваемых блюд
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topDishesData.map((dish, index) => (
                                <div key={index}
                                     style={{
                                         borderRadius: '20px',
                                         border: 'var(--custom-border-primary)',
                                         background: 'var(--custom-bg-primaryLine)',
                                         color: 'var(--custom-text)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '10px',
                                }}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-green-100 text-green-800">#{index + 1}</Badge>
                                            <span style={{  color: 'var(--custom-text)', fontSize: 13 }}>
                                            <span>{dish.name}</span>
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Продано: {dish.sold} • Маржа: {dish.margin}%
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-orange-600">₽{dish.revenue.toLocaleString()}</div>
                                        <div className="text-xs text-green-600">+₽{dish.profit.toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
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
                        <CardTitle className="flex items-center text-white" style={{color:'var(--custom-text)'}}>
                            <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                            Нерентабельные блюда
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {unprofitableDishesData.map((dish, index) => (
                                <div className='flex items-center p-4' key={index}  style={{
                                    borderRadius: '20px',
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-primaryLine)',
                                    color: 'var(--custom-text)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px',
                                }}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-red-100 text-red-800">Низкая маржа</Badge>
                                            <span style={{  color: 'var(--custom-text)', fontSize: 13 }}>
                                           {dish.name}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Продано: {dish.sold} • Маржа: {dish.margin}%
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-orange-600">₽{dish.revenue.toLocaleString()}</div>
                                        <div className="text-xs text-red-600">+₽{dish.profit.toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200" >
                                <p className="text-sm">💡 <strong>Рекомендация:</strong> Рассмотрите возможность повышения цен или замены поставщика для этих позиций.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Структура выручки по категориям */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-secondaryLineCard)',
                    color: 'var(--custom-text)',
                }}>
                    <CardHeader className='text-white' style={{color:'var(--custom-text)'}}>
                        <CardTitle>Структура выручки по категориям</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryRevenueData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categoryRevenueData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => `₽${value.toLocaleString()}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-secondaryLineCard)',
                    color: 'var(--custom-text)',
                }}>
                    <CardHeader className='text-white ' >
                        <CardTitle style={{color:'var(--custom-text)'}}>Оборачиваемость столов</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={tableTurnoverData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="table" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="turns" fill="#f97316" name="Оборотов" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Производительность официантов */}
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader>
                    <CardTitle style={{color:'var(--custom-text)'}} className='text-white'>KPI персонала (официанты)</CardTitle>
                </CardHeader>
                <CardContent style={{ color:'rgb(148, 163, 184)'}}>
                    <Table  className="w-full">
                        <thead>
                        <tr className="border-b text-white">
                            <th style={{color:'var(--custom-text)'}} className="text-left p-3">Официант</th>
                            <th style={{color:'var(--custom-text)'}} className="text-right p-3">Заказов</th>
                            <th style={{color:'var(--custom-text)'}} className="text-right p-3">Выручка</th>
                            <th style={{color:'var(--custom-text)'}} className="text-right p-3">Средний чек</th>
                            <th style={{color:'var(--custom-text)'}} className="text-right p-3">Обслужено гостей</th>
                            <th style={{color:'var(--custom-text)'}} className="text-right p-3">Рейтинг</th>
                        </tr>
                        </thead>
                        <tbody>
                        {waiterPerformanceData.map((waiter, index) => (
                            <tr key={index} className="border-b hover:bg-muted/30">
                                <td className="p-3">{waiter.name}</td>
                                <td className="text-right p-3">{waiter.orders}</td>
                                <td className="text-right p-3 text-orange-600">₽{waiter.revenue.toLocaleString()}</td>
                                <td className="text-right p-3">₽{waiter.avgCheck.toLocaleString()}</td>
                                <td className="text-right p-3">{waiter.guests}</td>
                                <td className="text-right p-3">
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                        ⭐ {waiter.rating}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </CardContent>
            </Card>

            {/* Структура расходов */}
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader>
                    <CardTitle style={{color:'var(--custom-text)'}} className='text-white'>Текущие расходы (за период)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {expenseBreakdownData.map((expense, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span style={{ color: '#94a3b8', fontSize: 13 }}>
                                    <span>{expense.category}</span>
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-muted-foreground">{expense.percent}%</span>
                                        <span className="text-red-600 w-32 text-right">₽{expense.amount.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="bg-red-500 h-2 rounded-full"
                                        style={{ width: `${expense.percent}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        <div className="pt-4 border-t flex items-center justify-between">
                            <strong style={{color:'var(--custom-text)'}} className='text-white'>Итого расходов:</strong>
                            <strong className="text-red-600 text-xl">₽{totalCost.toLocaleString()}</strong>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

const Table = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <table className={className}>{children}</table>
);