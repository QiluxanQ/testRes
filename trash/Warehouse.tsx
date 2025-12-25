import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Package, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

const stockData = [
  { id: 1, name: 'Кабель ВВГ 3x2.5', article: 'KB001', warehouse: 'Основной', quantity: 150, reserved: 25, unit: 'м', cost: 85 },
  { id: 2, name: 'Автомат С16 1П', article: 'AV001', warehouse: 'Основной', quantity: 5, reserved: 2, unit: 'шт', cost: 450 },
  { id: 3, name: 'Розетка Schneider', article: 'RZ001', warehouse: 'Основной', quantity: 45, reserved: 8, unit: 'шт', cost: 320 },
];

const movements = [
  { id: 1, date: '2025-07-05', item: 'Кабель ВВГ 3x2.5', type: 'приход', quantity: 100, warehouse: 'Основной', document: 'ПР-001' },
  { id: 2, date: '2025-07-04', item: 'Автомат С16 1П', type: 'расход', quantity: -15, warehouse: 'Основной', document: 'РС-001' },
  { id: 3, date: '2025-07-03', item: 'Розетка Schneider', type: 'перемещение', quantity: 20, warehouse: 'Филиал', document: 'ПМ-001' },
];

export const Warehouse = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего позиций</p>
                <p className="text-2xl">1,247</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Критические остатки</p>
                <p className="text-2xl text-red-600">12</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">В резерве</p>
                <p className="text-2xl">156</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Стоимость остатков</p>
                <p className="text-2xl">2.4M ₽</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stock">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stock">Остатки</TabsTrigger>
          <TabsTrigger value="movements">Движения</TabsTrigger>
          <TabsTrigger value="reserves">Резервы</TabsTrigger>
          <TabsTrigger value="warehouses">Склады</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <CardTitle>Складские остатки</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Наименование</TableHead>
                    <TableHead>Артикул</TableHead>
                    <TableHead>Склад</TableHead>
                    <TableHead>Остаток</TableHead>
                    <TableHead>Резерв</TableHead>
                    <TableHead>Доступно</TableHead>
                    <TableHead>Ед. изм.</TableHead>
                    <TableHead>Себестоимость</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell>{item.article}</TableCell>
                      <TableCell>{item.warehouse}</TableCell>
                      <TableCell>
                        <span className={item.quantity < 10 ? 'text-red-600' : ''}>
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{item.reserved}</TableCell>
                      <TableCell>
                        <strong>{item.quantity - item.reserved}</strong>
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.cost} ₽</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Движения товаров</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Номенклатура</TableHead>
                    <TableHead>Тип операции</TableHead>
                    <TableHead>Количество</TableHead>
                    <TableHead>Склад</TableHead>
                    <TableHead>Документ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{movement.date}</TableCell>
                      <TableCell>{movement.item}</TableCell>
                      <TableCell>
                        <Badge variant={
                          movement.type === 'приход' ? 'default' : 
                          movement.type === 'расход' ? 'destructive' : 
                          'secondary'
                        }>
                          {movement.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                        <div className="flex items-center gap-1">
                          {movement.quantity > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {Math.abs(movement.quantity)}
                        </div>
                      </TableCell>
                      <TableCell>{movement.warehouse}</TableCell>
                      <TableCell>{movement.document}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};