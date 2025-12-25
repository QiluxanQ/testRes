import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Activity } from "lucide-react";

const recentActivities = [
    { id: 1, action: 'Новый заказ', description: 'Заказ #127 - Стол 5, сумма 4,500₽', time: '2 мин назад', type: 'order' },
    { id: 2, action: 'Заканчивается продукт', description: 'Лобстер - осталось 3 шт', time: '5 мин назад', type: 'warning' },
    { id: 3, action: 'Новое бронирование', description: 'Стол 8 на 19:00, 4 гостя', time: '10 мин назад', type: 'reservation' },
    { id: 4, action: 'VIP гость', description: 'Иванов И.И. прибыл в ресторан', time: '15 мин назад', type: 'vip' },
    { id: 5, action: 'Заказ готов', description: 'Заказ #124 готов к подаче', time: '18 мин назад', type: 'kitchen' },
    { id: 6, action: 'Заказ готов', description: 'Заказ #125 готов к подаче', time: '20 мин назад', type: 'kitchen' },
    { id: 7, action: 'Заказ готов', description: 'Заказ #126 готов к подаче', time: '25 мин назад', type: 'kitchen' },
    { id: 8, action: 'Новый заказ', description: 'Заказ #128 - Стол 3, сумма 3,200₽', time: '30 мин назад', type: 'order' },
];

const Activ = () => {

    return (
        <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
        }} className="h-[400] flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center " style={{color: 'var(--custom-text)'}}>
                    <Activity className="h-5 w-5 mr-2" />
                    Активность ресторана
                </CardTitle>
            </CardHeader>

            {/* Контент с фиксированной высотой для скролла */}
            <CardContent  className="p-0">
                <div
                    className="px-6 pb-6"
                    style={{
                        height: '350px',
                        overflowY: 'auto',
                    }}
                >
                    <div className="space-y-4">
                        {recentActivities.map((activity) => (
                            <div
                                key={activity.id} style={{
                                borderRadius: '20px',
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-primaryLine)',
                                color: 'var(--custom-text)',
                            }}
                                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div
                                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0  ${
                                        activity.type === 'order'
                                            ? 'bg-orange-500'
                                            : activity.type === 'warning'
                                                ? 'bg-yellow-500'
                                                : activity.type === 'reservation'
                                                    ? 'bg-blue-500'
                                                    : activity.type === 'vip'
                                                        ? 'bg-purple-500'
                                                        : 'bg-green-500'
                                    }`}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium" style={{color: 'var(--custom-text)',}}>{activity.action}</div>
                                    <div className="font-medium text-sm " style={{color: 'var(--custom-text)',}}>{activity.description}</div>
                                    <div className="text-sm text-muted-foreground" style={{color: 'var(--custom-text-)',}}>{activity.time}</div>


                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default Activ;