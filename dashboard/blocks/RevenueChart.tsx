import React, {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "../../../ui/card";
import {Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {Button} from "../../../ui/button";
import {Target} from "lucide-react";

const dailyData = [
    { period: 'Пн', revenue: 125000, target: 130000 },
    { period: 'Вт', revenue: 142000, target: 140000 },
    { period: 'Ср', revenue: 138000, target: 145000 },
    { period: 'Чт', revenue: 155000, target: 150000 },
    { period: 'Пт', revenue: 178000, target: 170000 },
    { period: 'Сб', revenue: 210000, target: 200000 },
    { period: 'Вс', revenue: 198000, target: 195000 },
];

// Данные по неделям (5 недель)
const weeklyData = [
    { period: 'Нед 1', revenue: 780000, target: 800000 },
    { period: 'Нед 2', revenue: 850000, target: 850000 },
    { period: 'Нед 3', revenue: 920000, target: 900000 },
    { period: 'Нед 4', revenue: 980000, target: 950000 },
    { period: 'Нед 5', revenue: 1050000, target: 1000000 },
];

// Данные по месяцам (6 месяцев)
const monthlyData = [
    { period: 'Янв', revenue: 850000, target: 900000 },
    { period: 'Фев', revenue: 920000, target: 950000 },
    { period: 'Мар', revenue: 980000, target: 1000000 },
    { period: 'Апр', revenue: 1050000, target: 1100000 },
    { period: 'Май', revenue: 1180000, target: 1200000 },
    { period: 'Июн', revenue: 1250000, target: 1300000 },
];

const categoryData = [
    { name: 'Основные блюда', value: 5, color: '#FF6B6B' },
    { name: 'Напитки', value: 25, color: '#4ECDC4' },
    { name: 'Закуски', value: 15, color: '#45B7D1' },
    { name: 'Десерты', value: 10, color: '#96CEB4' },
    { name: 'Алкоголь', value: 5, color: '#FECA57' },
];

const RevenueChart = () => {
    const [chartPeriod, setChartPeriod] = useState('daily');
    const getChartData = () => {
        switch (chartPeriod) {
            case 'daily':
                return dailyData;
            case 'weekly':
                return weeklyData;
            case 'monthly':
                return monthlyData;
            default:
                return dailyData;
        }
    };

    return (
        <div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* График выручки */}
                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-secondaryLineCard)',
                    color: 'var(--custom-text)',
                }}>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center text-white" style={{color:'var(--custom-text)'}}>
                                <BarChart className="h-5 w-5 mr-2" />
                                Динамика выручки
                            </CardTitle>
                            <div className="flex border rounded-md" >
                                <Button
                                    variant={chartPeriod === 'daily' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setChartPeriod('daily')}
                                    className="rounded-r-none text-xs px-3"
                                >
                                    <span style={{ color: '#94a3b8', fontSize: 13 }}>
                                    7 дней
                                    </span>
                                </Button>
                                <Button
                                    variant={chartPeriod === 'weekly' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setChartPeriod('weekly')}
                                    className="rounded-none text-xs px-3"
                                >
                                    <span style={{ color: '#94a3b8', fontSize: 13 }}>
                                    5 недель
                                    </span>
                                </Button>
                                <Button
                                    variant={chartPeriod === 'monthly' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setChartPeriod('monthly')}
                                    className="rounded-l-none text-xs px-3"
                                >
                                    <span style={{ color: '#94a3b8', fontSize: 13 }}>
                                    6 месяцев
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={getChartData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) => `₽${value.toLocaleString('ru-RU')}`}
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        padding: '8px 12px'
                                    }}
                                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                />
                                <Bar  dataKey="revenue" fill="#0891B2FF" name="Выручка" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="target" fill="#e5e7eb" name="План" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Распределение продаж по категориям */}
                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-secondaryLineCard)',
                    color: 'var(--custom-text)',
                }}>
                    <CardHeader>
                        <CardTitle className="flex items-center" style={{color: 'var(--custom-text)'}}>
                            <Target className="h-5 w-5 mr-2" />
                            Продажи по категориям
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
};

export default RevenueChart;