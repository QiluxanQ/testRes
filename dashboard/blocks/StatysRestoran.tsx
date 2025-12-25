import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "../../../ui/card";
import {Star} from "lucide-react";

const StatysRestoran = () => {
    return (
        <div>
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader>
                    <CardTitle style={{color:'var(--custom-text)'}}>Текущее состояние</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-white" style={{color:'var(--custom-text)'}} >Загруженность зала</span>
                                <span className="text-sm text-muted-foreground">75%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-white" style={{color:'var(--custom-text)'}}>Выполнение плана выручки</span>
                                <span className="text-sm text-muted-foreground">96%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-white" style={{color:'var(--custom-text)'}}>Средняя оценка обслуживания</span>
                                <span className="text-sm text-muted-foreground flex items-center">
                    <Star className="h-3 w-3 text-yellow-500 mr-1" />
                    4.8/5
                  </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default StatysRestoran;