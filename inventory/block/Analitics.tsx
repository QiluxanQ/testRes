import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "../../../ui/card";
import {ArrowUpDown, TrendingDown} from "lucide-react";

const Analitics = ({inventoryData,categoriesList}) => {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-secondaryLineCard)',
                    color: 'var(--custom-text)',
                }}>
                    <CardHeader>
                        <CardTitle style={{color:'var(--custom-text)'}} className="text-base flex items-center text-white gap-2">
                            <TrendingDown className="h-4 w-4 text-red-600" />
                            Наибольший процент порчи
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {inventoryData
                                .sort((a, b) => b.wastePercentage - a.wastePercentage)
                                .slice(0, 5)
                                .map((item, idx) => (
                                    <div key={item.id}
                                         className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <div>
                                            <div className="font-medium">{item.name}</div>
                                            <div
                                                className="text-xs text-muted-foreground">{item.category}</div>
                                        </div>
                                        <div className="text-right">
                                            <div
                                                className="text-red-600 font-medium">{item.wastePercentage}%
                                            </div>
                                            <div className="text-xs text-muted-foreground">порчи</div>
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
                        <CardTitle style={{color:'var(--custom-text)'}} className="text-base flex items-center text-white gap-2">
                            <ArrowUpDown className="h-4 w-4 text-orange-600" />
                            Лучшая оборачиваемость
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {inventoryData
                                .sort((a, b) => b.turnoverRate - a.turnoverRate)
                                .slice(0, 5)
                                .map((item, idx) => (
                                    <div key={item.id}
                                         className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <div>
                                            <div className="font-medium">{item.name}</div>
                                            <div
                                                className="text-xs text-muted-foreground">{item.category}</div>
                                        </div>
                                        <div className="text-right">
                                            <div
                                                className="text-green-600 font-medium">{item.turnoverRate.toFixed(1)}x
                                            </div>
                                            <div className="text-xs text-muted-foreground">в месяц</div>
                                        </div>
                                    </div>
                                ))}
                        </div>
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
                    <CardTitle style={{color:'var(--custom-text)'}} className="text-base text-white">Средняя оборачиваемость по категориям</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {categoriesList.map(category => {
                            const items = inventoryData.filter(i => i.category === category);
                            const avgTurnover = items.reduce((sum, i) => sum + i.turnoverRate, 0) / items.length;
                            const totalValue = items.reduce((sum, i) => sum + (i.totalStock * i.avgPrice), 0);

                            return (
                                <div key={category}
                                     className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                    <div>
                                        <div style={{color:'var(--custom-text)'}} className="font-medium text-white">{category}</div>
                                        <div
                                            className="text-sm ">{items.length} позиций
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-medium">{avgTurnover.toFixed(1)}x
                                        </div>
                                        <div
                                            className="text-sm text-orange-600">₽{totalValue.toLocaleString()}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Analitics;