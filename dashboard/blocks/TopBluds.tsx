    import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
    import { ChefHat } from "lucide-react";
    import { Badge } from "../../../ui/badge";

    const popularDishes = [
        {
            id: 1,
            name: "Стейк Рибай",
            orders: 15,
            badge: { text: "Хит дня", className: "bg-gold-100 text-gold-800" }
        },
        {
            id: 2,
            name: "Борщ украинский",
            orders: 12,
            badge: { text: "2 место", variant: "secondary" }
        },
        {
            id: 3,
            name: "Салат Цезарь",
            orders: 10,
            badge: { text: "3 место", variant: "outline" }
        },
        {
            id: 4,
            name: "Тирамису",
            orders: 8,
            badge: { text: "Десерт дня", variant: "outline" }
        },
        {
            id: 5,
            name: "Паста Карбонара",
            orders: 7,
            badge: { text: "Новинка", variant: "secondary" }
        },
        {
            id: 6,
            name: "Суп Том-Ям",
            orders: 6,
            badge: { text: "Острое", variant: "outline" }
        },
        {
            id: 7,
            name: "Суп Том-Ям",
            orders: 6,
            badge: { text: "Острое", variant: "outline" }
        },
    ];

    const TopBluds = () => {
        return (
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader className="text-white" style={{color:'var(--custom-text)'}}>
                    <CardTitle className="flex items-center ">
                        <ChefHat className="h-5 w-5 mr-2 " />
                        Популярные блюда сегодня
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                    <div
                        className="px-6 pb-6"
                        style={{
                            height: '200px',
                            overflowY: 'auto',
                        }}
                    >
                        <div className="space-y-4">
                            {popularDishes.map((dish) => (
                                <div key={dish.id} className="flex justify-between items-center py-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate text-white" style={{color:'var(--custom-text)'}}>{dish.name}</div>
                                        <div className="text-sm text-muted-foreground" style={{color:'var(--custom-text)'}}>{dish.orders} заказов</div>
                                    </div>
                                    <Badge
                                        variant={dish.badge.variant || "default"}
                                        className={dish.badge.className || "flex-shrink-0 ml-2 bg-white"}
                                    >
                                        {dish.badge.text}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    export default TopBluds;