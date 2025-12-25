import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "../../../ui/card";
import {ChefHat, Clock, DollarSign, TrendingUp, Users, Utensils} from "lucide-react";

const RevenueCard = () => {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-primaryLine)',
                    color: 'var(--custom-text)',
                }}>
                    <CardHeader className="pb-2" >
                        <CardTitle className="text-sm flex items-center " >
                            <DollarSign className="h-4 w-4 mr-2"   />
                            <span style={{ color: 'var(--custom-text-secondary)', fontSize: 13 }}>Выручка за день</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent >
                        <div className="text-2xl font-bold text-orange-600">₽127,500</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                            +12% к вчера
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
                            <Users className="h-4 w-4 mr-2" />

                            <span style={{  color: 'var(--custom-text-secondary)', fontSize: 13 }}>  Гостей сегодня</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">89</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                            +8% к вчера
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
                            <Utensils className="h-4 w-4 mr-2" />
                            <span style={{ color: '#94a3b8', fontSize: 13 }}>
                            Занято столов
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">18/24</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <span>75% загруженность</span>
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
                            <ChefHat className="h-4 w-4 mr-2" />
                            <span style={{ color: '#94a3b8', fontSize: 13 }}>
                            Заказов в кухне
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">12</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                            Среднее время: 25 мин
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RevenueCard;