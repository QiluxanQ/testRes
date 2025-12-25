import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Building2, User, Phone, Mail, Globe, Plus, Eye, Edit, Search, Filter, CreditCard, FileText } from 'lucide-react';

const clients = [
  {
    id: 1,
    name: 'ООО "ТехСтрой"',
    inn: '7701234567',
    kpp: '770101001',
    legalAddress: 'г. Москва, ул. Ленина, д. 1',
    actualAddress: 'г. Москва, ул. Ленина, д. 1',
    phone: '+7 (499) 123-45-67',
    email: 'info@tehstroy.ru',
    website: 'www.tehstroy.ru',
    manager: 'Смирнов А.В.',
    debt: -25000,
    creditLimit: 100000,
    lastOrder: '2025-07-01',
    totalOrders: 15,
    avgOrderValue: 45000,
  },
  {
    id: 2,
    name: 'ИП Сидоров Иван Петрович',
    inn: '123456789012',
    kpp: '',
    legalAddress: 'г. Москва, ул. Пушкина, д. 10, кв. 5',
    actualAddress: 'г. Москва, ул. Пушкина, д. 10, кв. 5',
    phone: '+7 (495) 234-56-78',
    email: 'sidorov@mail.ru',
    website: '',
    manager: 'Петрова М.И.',
    debt: 0,
    creditLimit: 50000,
    lastOrder: '2025-06-28',
    totalOrders: 8,
    avgOrderValue: 22500,
  },
  {
    id: 3,
    name: 'ООО "СтройКомплект"',
    inn: '7703456789',
    kpp: '770301001',
    legalAddress: 'г. Москва, ул. Строителей, д. 25',
    actualAddress: 'г. Москва, ул. Строителей, д. 25',
    phone: '+7 (495) 456-78-90',
    email: 'info@stroykomplekt.ru',
    website: 'www.stroykomplekt.ru',
    manager: 'Козлов В.П.',
    debt: 12000,
    creditLimit: 150000,
    lastOrder: '2025-07-03',
    totalOrders: 23,
    avgOrderValue: 67000,
  },
];

const clientContacts = [
  {
    id: 1,
    clientId: 1,
    name: 'Иванов Петр Сергеевич',
    position: 'Директор',
    phone: '+7 (499) 123-45-67',
    email: 'ivanov@tehstroy.ru',
    isMain: true,
  },
  {
    id: 2,
    clientId: 1,
    name: 'Сидорова Анна Ивановна',
    position: 'Главный бухгалтер',
    phone: '+7 (499) 123-45-68',
    email: 'buh@tehstroy.ru',
    isMain: false,
  },
  {
    id: 3,
    clientId: 2,
    name: 'Сидоров Иван Петрович',
    position: 'Директор',
    phone: '+7 (495) 234-56-78',
    email: 'sidorov@mail.ru',
    isMain: true,
  },
];

const clientContracts = [
  {
    id: 1,
    number: 'Д-001/2025',
    date: '2025-01-15',
    client: 'ООО "ТехСтрой"',
    type: 'Поставки',
    validUntil: '2025-12-31',
    status: 'действует',
    amount: 5000000,
  },
  {
    id: 2,
    number: 'Д-003/2025',
    date: '2025-03-01',
    client: 'ООО "СтройКомплект"',
    type: 'Поставки',
    validUntil: '2025-12-31',
    status: 'действует',
    amount: 8000000,
  },
];

export const Clients = () => {
  const [activeTab, setActiveTab] = useState('clients');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex gap-2">
            <Input placeholder="Поиск клиентов..." className="w-64" />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Фильтр
          </Button>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить клиента
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Новый клиент</DialogTitle>
              <DialogDescription>Заполните информацию о новом клиенте</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              <div>
                <Label htmlFor="name">Название*</Label>
                <Input id="name" placeholder="ООО 'Название'" />
              </div>
              <div>
                <Label htmlFor="inn">ИНН*</Label>
                <Input id="inn" placeholder="1234567890" />
              </div>
              <div>
                <Label htmlFor="kpp">КПП</Label>
                <Input id="kpp" placeholder="123456789" />
              </div>
              <div>
                <Label htmlFor="phone">Телефон</Label>
                <Input id="phone" placeholder="+7 (499) 123-45-67" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="legal-address">Юридический адрес</Label>
                <Input id="legal-address" placeholder="Полный адрес" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="actual-address">Фактический адрес</Label>
                <Input id="actual-address" placeholder="Полный адрес" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="info@company.ru" />
              </div>
              <div>
                <Label htmlFor="website">Сайт</Label>
                <Input id="website" placeholder="www.company.ru" />
              </div>
              <div>
                <Label htmlFor="credit-limit">Кредитный лимит</Label>
                <Input id="credit-limit" type="number" placeholder="100000" />
              </div>
              <div>
                <Label htmlFor="manager">Ответственный менеджер</Label>
                <Input id="manager" placeholder="Менеджер" />
              </div>
            </div>
            <Button className="w-full mt-4">Создать клиента</Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Статистика по клиентам */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего клиентов</p>
                <p className="text-2xl">127</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активных в месяце</p>
                <p className="text-2xl">45</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Дебиторская задолженность</p>
                <p className="text-2xl text-red-600">-187K ₽</p>
              </div>
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Средний чек</p>
                <p className="text-2xl">45K ₽</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clients">Клиенты</TabsTrigger>
          <TabsTrigger value="contacts">Контактные лица</TabsTrigger>
          <TabsTrigger value="contracts">Договоры</TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>База клиентов</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>ИНН/КПП</TableHead>
                    <TableHead>Контакты</TableHead>
                    <TableHead>Ответственный</TableHead>
                    <TableHead>Задолженность</TableHead>
                    <TableHead>Кредитный лимит</TableHead>
                    <TableHead>Последний заказ</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <div>
                            <div>{client.name}</div>
                            {client.website && (
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {client.website}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>ИНН: {client.inn}</div>
                          {client.kpp && <div>КПП: {client.kpp}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{client.manager}</TableCell>
                      <TableCell>
                        <div>
                          <span className={client.debt > 0 ? 'text-red-600' : client.debt < 0 ? 'text-green-600' : ''}>
                            {client.debt.toLocaleString('ru-RU')} ₽
                          </span>
                          {client.debt !== 0 && (
                            <div className="text-xs text-gray-500">
                              {client.debt > 0 ? 'Долг клиента' : 'Предоплата'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{client.creditLimit.toLocaleString('ru-RU')} ₽</TableCell>
                      <TableCell>
                        <div>
                          <div>{client.lastOrder}</div>
                          <div className="text-sm text-gray-500">
                            Заказов: {client.totalOrders}
                          </div>
                        </div>
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

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Контактные лица клиентов</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ФИО</TableHead>
                    <TableHead>Компания</TableHead>
                    <TableHead>Должность</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Основной</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientContacts.map((contact) => {
                    const client = clients.find(c => c.id === contact.clientId);
                    return (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            {contact.name}
                          </div>
                        </TableCell>
                        <TableCell>{client?.name}</TableCell>
                        <TableCell>{contact.position}</TableCell>
                        <TableCell>{contact.phone}</TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>
                          {contact.isMain && <Badge variant="outline">Основной</Badge>}
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
        </TabsContent>

        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>Договоры с клиентами</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Номер</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Действует до</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>{contract.number}</TableCell>
                      <TableCell>{contract.date}</TableCell>
                      <TableCell>{contract.client}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{contract.type}</Badge>
                      </TableCell>
                      <TableCell>{contract.validUntil}</TableCell>
                      <TableCell>
                        <Badge variant="default">{contract.status}</Badge>
                      </TableCell>
                      <TableCell>{contract.amount.toLocaleString('ru-RU')} ₽</TableCell>
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