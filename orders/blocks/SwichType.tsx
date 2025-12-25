import React from 'react';
import {Button} from "../../../ui/button";
import {Table, Truck, Utensils, Zap} from "lucide-react";

const SwichType = ({orderTypeFilter,setOrderTypeFilter}) => {
    return (
        <div>
            <div className="flex border rounded-md w-fit text-white">
                <Button
                    variant={orderTypeFilter === 'all' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setOrderTypeFilter('all')}
                    className="rounded-r-none"
                    style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}
                >
                    Все заказы
                </Button>
                <Button
                    variant={orderTypeFilter === 'dine-in' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setOrderTypeFilter('dine-in')}
                    className="rounded-none"
                    style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}
                >
                    <Utensils className="h-4 w-4 mr-2" />
                    За столом
                </Button>
                <Button
                    variant={orderTypeFilter === 'delivery' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setOrderTypeFilter('delivery')}
                    className="rounded-none"
                    style={{

                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}
                >
                    <Truck className="h-4 w-4 mr-2" />
                    Доставка
                </Button>
                <Button
                    variant={orderTypeFilter === 'quick' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setOrderTypeFilter('quick')}
                    className="rounded-l-none"
                    style={{

                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}
                >
                    <Zap className="h-4 w-4 mr-2" />
                    Быстрые заказы
                </Button>
                <Button
                    variant={orderTypeFilter === 'table' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setOrderTypeFilter('table')}
                    className="rounded-l-none"
                    style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}
                >
                    <Table className="h-4 w-4 mr-2" />
                   По сталам
                </Button>
            </div>
        </div>
    );
};

export default SwichType;