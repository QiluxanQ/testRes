import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "../../../ui/card";

const StatsUser = ({filteredGuests}) => {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Всего гостей</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{filteredGuests.length}</div>
                </CardContent>
            </Card>

            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">VIP гости</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                        {filteredGuests.filter(guest => guest.status === 'VIP').length}
                    </div>
                </CardContent>
            </Card>

            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Новые гости</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                        {filteredGuests.filter(guest => guest.status === 'Новый').length}
                    </div>
                </CardContent>
            </Card>

            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Средний чек</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₽4,750</div>
                </CardContent>
            </Card>
            </div>
        </div>
    );
};

export default StatsUser;