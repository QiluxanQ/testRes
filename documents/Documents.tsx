import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { FileText, Plus, Eye, Edit } from 'lucide-react';

const documents = {
  income: [
    { id: 1, number: 'ПР-001', date: '2025-07-01', supplier: 'ООО "ЭлектроПоставка"', amount: 150000, status: 'получен' },
    { id: 2, number: 'ПР-002', date: '2025-07-03', supplier: 'ИП Петров', amount: 85000, status: 'ожидание' },
  ],
  expense: [
    { id: 1, number: 'РС-001', date: '2025-07-04', client: 'ООО "ТехСтрой"', amount: 450000, status: 'отгружен' },
    { id: 2, number: 'РС-002', date: '2025-07-05', client: 'ИП Сидоров', amount: 180000, status: 'формирование' },
  ],
  invoices: [
    { id: 1, number: 'СЧ-001', date: '2025-07-01', client: 'ООО "ТехСтрой"', amount: 450000, status: 'выставлен', dueDate: '2025-07-15' },
    { id: 2, number: 'СЧ-002', date: '2025-07-03', client: 'ИП Сидоров', amount: 180000, status: 'оплачен', dueDate: '2025-07-17' },
  ],
  payments: [
    { id: 1, date: '2025-07-03', amount: 180000, client: 'ИП Сидоров', type: 'входящий', method: 'безнал' },
    { id: 2, date: '2025-07-04', amount: -85000, supplier: 'ИП Петров', type: 'исходящий', method: 'безнал' },
  ],
};

export const Documents = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Документооборот</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Создать документ
        </Button>
      </div>

      <Tabs defaultValue="income">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="income">Приход</TabsTrigger>
          <TabsTrigger value="expense">Расход</TabsTrigger>
          <TabsTrigger value="contracts">Договоры</TabsTrigger>
          <TabsTrigger value="acts">Акты</TabsTrigger>
          <TabsTrigger value="invoices">Счета</TabsTrigger>
          <TabsTrigger value="payments">Платежи</TabsTrigger>
        </TabsList>

        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>Поступление товаров</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Номер</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Поставщик</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.income.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.number}</TableCell>
                      <TableCell>{doc.date}</TableCell>
                      <TableCell>{doc.supplier}</TableCell>
                      <TableCell>{doc.amount.toLocaleString('ru-RU')} ₽</TableCell>
                      <TableCell>
                        <Badge variant={doc.status === 'получен' ? 'default' : 'secondary'}>
                          {doc.status}
                        </Badge>
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense">
          <Card>
            <CardHeader>
              <CardTitle>Реализация товаров</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Номер</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.expense.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.number}</TableCell>
                      <TableCell>{doc.date}</TableCell>
                      <TableCell>{doc.client}</TableCell>
                      <TableCell>{doc.amount.toLocaleString('ru-RU')} ₽</TableCell>
                      <TableCell>
                        <Badge variant={doc.status === 'отгружен' ? 'default' : 'secondary'}>
                          {doc.status}
                        </Badge>
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Счета на оплату</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Номер</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Срок оплаты</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.invoices.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.number}</TableCell>
                      <TableCell>{doc.date}</TableCell>
                      <TableCell>{doc.client}</TableCell>
                      <TableCell>{doc.amount.toLocaleString('ru-RU')} ₽</TableCell>
                      <TableCell>
                        <Badge variant={doc.status === 'оплачен' ? 'default' : 'secondary'}>
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{doc.dueDate}</TableCell>
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Платежи</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Контрагент</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Способ</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell className={payment.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                        {payment.amount.toLocaleString('ru-RU')} ₽
                      </TableCell>
                      <TableCell>{payment.client || payment.supplier}</TableCell>
                      <TableCell>
                        <Badge variant={payment.type === 'входящий' ? 'default' : 'secondary'}>
                          {payment.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.method}</TableCell>
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