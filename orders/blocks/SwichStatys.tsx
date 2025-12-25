import React from 'react';
import {Button} from "../../../ui/button";
import {CheckCircle, Clock, XCircle} from "lucide-react";
import {Badge} from "../../../ui/badge";

const SwichStatys = ({orderStatusTab,setOrderStatusTab,activeOrdersCount,completedOrdersCount,cancelledOrdersCount}) => {
    return (
        <div className='text-white'>
            <Button
                variant={orderStatusTab === 'active' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setOrderStatusTab('active')}
                className="rounded-r-none"
                style={{
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-secondaryLineCard)',
                    color: 'var(--custom-text)',
                }}
            >
                <Clock className="h-4 w-4 mr-2" />
                Активные
                <Badge variant="secondary" className="ml-2">{activeOrdersCount}</Badge>
            </Button>
            <Button
                variant={orderStatusTab === 'completed' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setOrderStatusTab('completed')}
                className="rounded-none"
                style={{
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-secondaryLineCard)',
                    color: 'var(--custom-text)',
                }}
            >
                <CheckCircle className="h-4 w-4 mr-2" />
                Завершенные
                <Badge variant="secondary" className="ml-2">{completedOrdersCount}</Badge>
            </Button>
            <Button
                variant={orderStatusTab === 'cancelled' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setOrderStatusTab('cancelled')}
                className="rounded-l-none"
                style={{
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-secondaryLineCard)',
                    color: 'var(--custom-text)',
                }}
            >
                <XCircle className="h-4 w-4 mr-2" />
                Отмененные
                <Badge variant="secondary" className="ml-2">{cancelledOrdersCount}</Badge>
            </Button>
        </div>
    );
};

export default SwichStatys;