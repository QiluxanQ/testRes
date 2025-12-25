import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "../../../ui/card";

const Stats = ({activeOrdersCount}) => {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-primaryLine)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader className="pb-2">
                    <CardTitle style={{color:'var(--custom-text)'}} className="text-sm text-white">Активные заказы</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{activeOrdersCount}</div>
                    <p className="text-xs text-muted-foreground">+3 за час</p>
                </CardContent>
            </Card>

            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-primaryLine)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader className="pb-2">
                    <CardTitle style={{color:'var(--custom-text)'}}  className="text-sm text-white">Готовые заказы</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <p className="text-xs text-muted-foreground">Ждут подачи</p>
                </CardContent>
            </Card>

            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-primaryLine)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader className="pb-2">
                    <CardTitle style={{color:'var(--custom-text)'}} className="text-sm text-white">Среднее время</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-500">25 мин</div>
                    <p className="text-xs text-muted-foreground">Приготовления</p>
                </CardContent>
            </Card>

            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-primaryLine)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader className="pb-2">
                    <CardTitle style={{color:'var(--custom-text)'}} className="text-sm text-white">Выручка за день</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">₽127,500</div>
                    <p className="text-xs text-muted-foreground">+12% к вчера</p>
                </CardContent>
            </Card>
        </div>
        </div>
    );
};

export default Stats;