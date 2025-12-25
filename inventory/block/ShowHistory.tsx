import React, {useMemo} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "../../../ui/card";
import {Calendar, Clock, FileText, History, Package, Plus} from "lucide-react";
import {Badge} from "../../../ui/badge";
import {Button} from "../../../ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../../../ui/table";

const ShowHistory = ({ inventoryRecords, warehouses, users, onStartInventory }) => {

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Не указано';
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getUserName = (userId: number) => {
        const user = users.find(u => u.id === userId);
        return user ? user.username || user.name || `Пользователь #${userId}` : `Пользователь #${userId}`;
    };

    const getWarehouseName = (warehouseId: number) => {
        const warehouse = warehouses.find(w => w.id === warehouseId);
        return warehouse ? warehouse.name : `Склад #${warehouseId}`;
    };
    const sortedInventories = useMemo(() => {
        return [...inventoryRecords].sort((a, b) =>
            new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
        );
    }, [inventoryRecords]);
    return (
        <div>
            <div className="space-y-6">

                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-secondaryLineCard)',
                    color: 'var(--custom-text)',
                }}>
                    <CardContent  className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History className="h-5 w-5 text-orange-600" />
                                <h1 style={{color:'var(--custom-text)'}} className="text-2xl font-bold text-white">История инвентаризаций</h1>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant="secondary" className="text-lg px-3 py-1">
                                    Всего: {sortedInventories.length}
                                </Badge>
                                <Button
                                    onClick={onStartInventory}
                                    className="bg-orange-600 hover:bg-orange-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Провести инвентаризацию
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Статистика */}
                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-secondaryLineCard)',
                    color: 'var(--custom-text)',
                }}>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground">Всего инвентаризаций</div>
                                <div style={{color:'var(--custom-text)'}} className="text-3xl font-bold text-white">{sortedInventories.length}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground">Последняя</div>
                                <div style={{color:'var(--custom-text)'}} className="text-xl font-semibold text-white">
                                    {sortedInventories[0] ? formatDate(sortedInventories[0].date_start) : 'Нет данных'}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground">Первая</div>
                                <div style={{color:'var(--custom-text)'}} className="text-xl font-semibold text-white">
                                    {sortedInventories[sortedInventories.length - 1] ?
                                        formatDate(sortedInventories[sortedInventories.length - 1].date_start) :
                                        'Нет данных'}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground">В процессе</div>
                                <div style={{color:'var(--custom-text)'}} className="text-3xl font-bold text-orange-600">
                                    {sortedInventories.filter(inv => !inv.date_end).length}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Список инвентаризаций */}
                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-secondaryLineCard)',
                    color: 'var(--custom-text)',
                }}>
                    <CardHeader>
                        <CardTitle style={{color:'var(--custom-text)'}} className="flex items-center gap-2 text-white">
                            <Calendar style={{color:'var(--custom-text)'}} className="h-5 w-5" />
                            Список проведенных инвентаризаций
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sortedInventories.length === 0 ? (
                            <div style={{color:'var(--custom-text)'}} className="text-center py-12 text-muted-foreground">
                                <History className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                <p>Нет данных об инвентаризациях</p>
                                <p  className="text-sm mt-1">Проведенные инвентаризации появятся здесь</p>
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead style={{color:'rgb(101,125,156)'}}>Дата начала</TableHead>
                                            <TableHead style={{color:'rgb(101,125,156)'}}>Дата завершения</TableHead>
                                            <TableHead style={{color:'rgb(101,125,156)'}}>Название</TableHead>
                                            <TableHead style={{color:'rgb(101,125,156)'}}>Склад</TableHead>
                                            <TableHead style={{color:'rgb(101,125,156)'}}>Пользователь</TableHead>
                                            <TableHead style={{color:'rgb(101,125,156)'}}>Товаров</TableHead>
                                            <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className='text-white'>
                                        {sortedInventories.map((inventory) => {
                                            const isCompleted = !!inventory.date_end;
                                            const duration = isCompleted ?
                                                Math.round(
                                                    (new Date(inventory.date_end).getTime() -
                                                        new Date(inventory.date_start).getTime()) /
                                                    (1000 * 60 * 60)
                                                ) : null;

                                            return (
                                                <TableRow key={inventory.id} className="hover:bg-muted/50">
                                                    <TableCell style={{color:'var(--custom-text)'}}>
                                                        <div className="font-medium">
                                                            {formatDate(inventory.date_start)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {isCompleted ? (
                                                            <div className="text-green-600 font-medium">
                                                                {formatDate(inventory.date_end)}
                                                            </div>
                                                        ) : (
                                                            <div className="text-yellow-600 italic">
                                                                В процессе
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell style={{color:'var(--custom-text)'}} className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-blue-600" />
                                                            {inventory.name || `Инвентаризация #${inventory.id}`}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="gap-1 text-white" style={{color:'var(--custom-text)'}} >
                                                            <Package className="h-3 w-3" />
                                                            {getWarehouseName(inventory.warehouse_id)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell style={{color:'var(--custom-text)'}}>
                                                        <div className="text-sm flex items-center gap-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-muted-foreground">
                                                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                                                <circle cx="12" cy="7" r="4" />
                                                            </svg>
                                                            {getUserName(inventory.user_id)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell style={{color:'var(--custom-text)'}}>
                                                        <div className="font-medium text-center">
                                                            {parseFloat(inventory.count_product) || 0}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {isCompleted ? (
                                                            <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                                    <polyline points="22 4 12 14.01 9 11.01" />
                                                                </svg>
                                                                Завершена
                                                                {duration && (
                                                                    <span className="text-xs ml-1">({duration} ч)</span>
                                                                )}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                В процессе
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ShowHistory;