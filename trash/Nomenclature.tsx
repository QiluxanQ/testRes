import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Package, Plus, Eye, Edit } from 'lucide-react';

const nomenclature = [
  {
    id: 1,
    name: 'Кабель ВВГ 3х2.5',
    article: 'KB001',
    barcode: '4607175354908',
    type: 'товар',
    unit: 'м',
    category: 'Кабельная продукция',
    purchasePrice: 75,
    salePrice: 95,
    stock: 150,
    supplier: 'ООО "ЭлектроПоставка"',
  },
  {
    id: 2,
    name: 'Автоматический выключатель С16 1П',
    article: 'AV001',
    barcode: '3606480089445',
    type: 'товар',
    unit: 'шт',
    category: 'Автоматика',
    purchasePrice: 420,
    salePrice: 560,
    stock: 5,
    supplier: 'ООО "ЭлектроПоставка"',
  },
  {
    id: 3,
    name: 'Монтаж электрооборудования',
    article: 'SV001',
    barcode: '',
    type: 'услуга',
    unit: 'час',
    category: 'Услуги',
    purchasePrice: 0,
    salePrice: 1500,
    stock: 0,
    supplier: '',
  },
];

export const Nomenclature = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Номенклатура</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Добавить позицию
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Товары</p>
                <p className="text-2xl">1,187</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Услуги</p>
                <p className="text-2xl">47</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Комплекты</p>
                <p className="text-2xl">13</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Справочник номенклатуры</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Наименование</TableHead>
                <TableHead>Артикул</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Закупочная цена</TableHead>
                <TableHead>Продажная цена</TableHead>
                <TableHead>Рентабельность</TableHead>
                <TableHead>Остаток</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nomenclature.map((item) => {
                const margin = item.salePrice > 0 ? ((item.salePrice - item.purchasePrice) / item.salePrice * 100) : 0;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          {item.name}
                        </div>
                        {item.barcode && (
                          <div className="text-sm text-gray-500">ШК: {item.barcode}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.article}</TableCell>
                    <TableCell>
                      <Badge variant={item.type === 'товар' ? 'default' : item.type === 'услуга' ? 'secondary' : 'outline'}>
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.purchasePrice > 0 ? `${item.purchasePrice} ₽` : '-'}</TableCell>
                    <TableCell>{item.salePrice} ₽</TableCell>
                    <TableCell>
                      <span className={margin > 30 ? 'text-green-600' : margin > 15 ? 'text-orange-600' : 'text-red-600'}>
                        {margin.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.type === 'товар' ? (
                        <span className={item.stock < 10 ? 'text-red-600' : ''}>
                          {item.stock} {item.unit}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};