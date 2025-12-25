import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Plus, RefreshCw, Calendar } from 'lucide-react';

const initialInvoices = [
  {
    id: 1,
    status: 'Проведен',
    invoiceNumber: 'ТТН-0001',
    date: '2024-03-20',
    egaisNumber: 'ЕГАИС-12345678',
    amount: 125000,
    supplier: 'ООО "Алкогольный Дистрибьютор"',
    recipient: 'ООО Ресторан'
  },
  {
    id: 2,
    status: 'В обработке',
    invoiceNumber: 'ТТН-0002',
    date: '2024-03-19',
    egaisNumber: 'ЕГАИС-87654321',
    amount: 85000,
    supplier: 'ООО "ВинТорг"',
    recipient: 'ООО Ресторан'
  },
  {
    id: 3,
    status: 'Проведен',
    invoiceNumber: 'ТТН-0003',
    date: '2024-03-18',
    egaisNumber: 'ЕГАИС-11223344',
    amount: 65000,
    supplier: 'ООО "Пивной Мир"',
    recipient: 'ООО Ресторан'
  }
];

const initialBalances = [
  {
    id: 1,
    egaisName: 'Водка "Русский Стандарт" 0.5л',
    warehouseName: 'Водка Русский Стандарт',
    reference: 'Алкогольная продукция',
    cnFsrarId: 'CN123456789',
    code: 'ALK001',
    volume: 0.5,
    unit: 'л',
    quantity: 48,
    alcoholContent: 40.0
  },
  {
    id: 2,
    egaisName: 'Вино "Массандра" красное полусладкое 0.75л',
    warehouseName: 'Вино Массандра красное',
    reference: 'Алкогольная продукция',
    cnFsrarId: 'CN987654321',
    code: 'ALK002',
    volume: 0.75,
    unit: 'л',
    quantity: 36,
    alcoholContent: 12.0
  },
  {
    id: 3,
    egaisName: 'Пиво "Балтика №3" светлое 0.5л',
    warehouseName: 'Пиво Балтика 3',
    reference: 'Алкогольная продукция',
    cnFsrarId: 'CN456789123',
    code: 'ALK003',
    volume: 0.5,
    unit: 'л',
    quantity: 120,
    alcoholContent: 4.8
  },
  {
    id: 4,
    egaisName: 'Коньяк "Арарат" 5 звезд 0.5л',
    warehouseName: 'Коньяк Арарат 5*',
    reference: 'Алкогольная продукция',
    cnFsrarId: 'CN789123456',
    code: 'ALK004',
    volume: 0.5,
    unit: 'л',
    quantity: 24,
    alcoholContent: 40.0
  }
];

const initialWriteOffs = [
  {
    id: 1,
    status: 'Проведен',
    actNumber: 'СПС-ЕГАИС-001',
    date: '2024-03-20',
    reason: 'Порча продукции'
  },
  {
    id: 2,
    status: 'Черновик',
    actNumber: 'СПС-ЕГАИС-002',
    date: '2024-03-19',
    reason: 'Бой бутылок'
  },
  {
    id: 3,
    status: 'Проведен',
    actNumber: 'СПС-ЕГАИС-003',
    date: '2024-03-18',
    reason: 'Истек срок годности'
  }
];

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'Проведен':
      return 'bg-green-100 text-green-800';
    case 'В обработке':
      return 'bg-yellow-100 text-yellow-800';
    case 'Черновик':
      return 'bg-gray-100 text-gray-800';
    case 'Отменен':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function EGAIS() {
  const [invoices] = useState(initialInvoices);
  const [balances] = useState(initialBalances);
  const [writeOffs] = useState(initialWriteOffs);
  const [dateFilter, setDateFilter] = useState('');

  const filteredWriteOffs = dateFilter
    ? writeOffs.filter(wo => wo.date === dateFilter)
    : writeOffs;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between" style={{
        borderRadius: '20px',
        border: 'var(--custom-border-primary)',
        background: 'var(--custom-bg-secondaryLineCard)',
        color: 'var(--custom-text)',
      }}>
        <div>
          <h2 className="text-2xl">ЕГАИС</h2>
          <p className="text-muted-foreground">Управление алкогольной продукцией</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="h-4 w-4 mr-2" />
          Проверить ЕГАИС
        </Button>
      </div>

      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList className="grid w-full  grid-cols-3">
          <TabsTrigger value="invoices">Накладные</TabsTrigger>
          <TabsTrigger value="balances">Остатки</TabsTrigger>
          <TabsTrigger value="writeoffs">Списание</TabsTrigger>
        </TabsList>

        {/* Накладные */}
        <TabsContent value="invoices" className="space-y-4">
          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardHeader>
              <CardTitle>Накладные ЕГАИС</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <div
                    className="px-0 pb-6"
                    style={{
                      height: '500px',
                      overflowY: 'auto',
                    }}
                >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Номер накладной</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Дата</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Внутренний номер ЕГАИС</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Сумма</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Поставщик</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Получатель</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.egaisNumber}</TableCell>
                        <TableCell>₽{invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>{invoice.supplier}</TableCell>
                        <TableCell>{invoice.recipient}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Остатки */}
        <TabsContent value="balances" className="space-y-4">
          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardHeader>
              <CardTitle>Остатки алкогольной продукции</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <div
                    className="px-0 pb-6"
                    style={{
                      height: '500px',
                      overflowY: 'auto',
                    }}
                >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{color:'rgb(101,125,156)'}} className="min-w-[250px]">Наименование по ЕГАИС</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}} className="min-w-[200px]">Наименование на Складе</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Справка</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>CN (FsrarID)</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Код</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}> Объём</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Единица измерения</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Количество</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Содержание алкоголя %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balances.map((balance) => (
                      <TableRow key={balance.id}>
                        <TableCell>{balance.egaisName}</TableCell>
                        <TableCell>{balance.warehouseName}</TableCell>
                        <TableCell>{balance.reference}</TableCell>
                        <TableCell className="font-mono text-sm">{balance.cnFsrarId}</TableCell>
                        <TableCell className="font-mono text-sm">{balance.code}</TableCell>
                        <TableCell>{balance.volume}</TableCell>
                        <TableCell>{balance.unit}</TableCell>
                        <TableCell>{balance.quantity}</TableCell>
                        <TableCell>{balance.alcoholContent}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Списание */}
        <TabsContent value="writeoffs" className="space-y-4">
          <div className="flex items-center justify-between">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Создать акт списания
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-[200px]"
                placeholder="Фильтр по дате"
              />
              {dateFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateFilter('')}
                >
                  Сбросить
                </Button>
              )}
            </div>
          </div>

          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardHeader>
              <CardTitle>Акты списания ЕГАИС</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <div
                    className="px-0 pb-6"
                    style={{
                      height: '500px',
                      overflowY: 'auto',
                    }}
                >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Номер акта</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Дата</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Причина списания</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWriteOffs.length > 0 ? (
                      filteredWriteOffs.map((writeOff) => (
                        <TableRow key={writeOff.id}>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(writeOff.status)}>
                              {writeOff.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{writeOff.actNumber}</TableCell>
                          <TableCell>{writeOff.date}</TableCell>
                          <TableCell>{writeOff.reason}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          Нет актов списания за выбранную дату
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
