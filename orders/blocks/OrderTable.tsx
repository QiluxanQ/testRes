import React, { useMemo } from 'react';
import {Card, CardContent} from "../../../ui/card";
import {Badge} from "../../../ui/badge";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "../../../ui/dialog";
import {Table, MapPin, Utensils} from "lucide-react";

const OrderTable = ({
                        tables,
                        hallTables,
                        getHallInfo,
                        getOrdersForTable,
                        setSelectedTableId,
                        selectedTableId,
                        statusLabels,
                        formatDate,
                        selectedSalesPoint
                    }) => {



    if (selectedSalesPoint && tables.length === 0) {
        return (
            <div className="text-center py-12"  style={{
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-primaryLine)',
                color: 'var(--custom-text)',
            }} >
                <div className="bg-gray-50 border rounded-lg p-8">
                    <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Нет столов для выбранной точки продаж
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Для точки продаж "{selectedSalesPoint.name}" не найдено столов
                    </p>
                    <div className="text-sm text-gray-400">
                        <div className="flex items-center justify-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>ID точки продаж: {selectedSalesPoint.id}</span>
                        </div>
                        <p className="mt-2">Проверьте, есть ли залы и столы для этой точки продаж</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Заголовок с информацией о точке продаж */}
            {selectedSalesPoint && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-800">
                            Точка продаж: {selectedSalesPoint.name}
                            {selectedSalesPoint.address && ` (${selectedSalesPoint.address})`}
                        </span>
                        <Badge variant="outline" className="ml-2">
                            {tables.length} столов
                        </Badge>
                    </div>
                </div>
            )}

            <h3 className="text-lg font-semibold text-white" style={{color:'var(--custom-text)'}}>Столы</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tables.map(table => {
                    const hall = getHallInfo(table);
                    const tableOrders = getOrdersForTable(table.id);
                    const activeOrder = tableOrders.find(order => order.status === 'open');

                    return (
                        <Card style={{
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-primaryLine)',
                            color: 'var(--custom-text)',
                        }}
                            key={table.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                                table.status === 'occupied' ? 'border-red-200 bg-red-50' :
                                    table.status === 'free' ? 'border-green-200 bg-green-50' :
                                        'border-gray-200'
                            }`}
                            onClick={() => setSelectedTableId(table.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-semibold text-lg">{table.name}</h4>
                                        <p className="text-sm text-gray-500">
                                            {hall ? hall.name : 'Неизвестный зал'}
                                        </p>
                                    </div>
                                    <Badge variant={
                                        table.status === 'occupied' ? 'destructive' :
                                            table.status === 'free' ? 'success' : 'default'
                                    }>
                                        {table.status === 'occupied' ? 'Занят' :
                                            table.status === 'free' ? 'Свободен' : table.status}
                                    </Badge>
                                </div>

                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Мест:</span>
                                        <span>{table.count_seats}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Активных заказов:</span>
                                        <span>{tableOrders.filter(o => o.status === 'open').length}</span>
                                    </div>
                                    {activeOrder && (
                                        <div className="mt-2 pt-2 border-t">
                                            <div className="flex justify-between font-medium">
                                                <span>Заказ #{activeOrder.id}</span>
                                                <span className="text-orange-600">
                                                    ₽{parseFloat(activeOrder.amount).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={!!selectedTableId} onOpenChange={(open) => !open && setSelectedTableId(null)}>
                <DialogContent className="max-w-3xl">
                    {selectedTableId && (() => {
                        const table = tables.find(t => t.id === selectedTableId);
                        if (!table) return null;

                        const hall = getHallInfo(table);
                        const tableOrders = getOrdersForTable(table.id);

                        return (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Table className="h-5 w-5" />
                                        {table.name}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {hall?.name} • {table.count_seats} мест
                                        {selectedSalesPoint && (
                                            <div className="mt-1 text-xs text-gray-500">
                                                Точка продаж: {selectedSalesPoint.name}
                                            </div>
                                        )}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Статус</h4>
                                            <p className="font-medium">{table.status}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Позиция</h4>
                                            <p className="font-medium">X: {table.position_x}, Y: {table.position_y}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Заказы на столе</h4>
                                        {tableOrders.length > 0 ? (
                                            <div className="space-y-2">
                                                {tableOrders.map(order => (
                                                    <Card key={order.id}>
                                                        <CardContent className="p-3">
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <div className="font-medium">Заказ #{order.id}</div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {formatDate(order.date_open)}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-semibold text-orange-600">
                                                                        ₽{parseFloat(order.amount).toLocaleString()}
                                                                    </div>
                                                                    <Badge className={
                                                                        order.status === 'open' ? 'bg-blue-100 text-blue-800' :
                                                                            order.status === 'closed' ? 'bg-green-100 text-green-800' :
                                                                                'bg-red-100 text-red-800'
                                                                    }>
                                                                        {statusLabels[order.status]}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">Нет заказов на этом столе</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OrderTable;