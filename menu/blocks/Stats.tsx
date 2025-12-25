import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "../../../ui/card";

const Stats = ({totalDishes,popularDishes,unavailableDishes,avgPrice}) => {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Всего блюд</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl">{totalDishes}</div>
                        <p className="text-xs text-muted-foreground">В меню</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Популярные</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl text-orange-600">{popularDishes}</div>
                        <p className="text-xs text-muted-foreground">Хиты продаж</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Недоступно</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl text-red-600">{unavailableDishes}</div>
                        <p className="text-xs text-muted-foreground">Нет в наличии</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Средняя цена</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl">₽{avgPrice.toFixed(0)}</div>
                        <p className="text-xs text-muted-foreground">За блюдо</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Stats;