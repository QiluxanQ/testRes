import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Plus, Eye, Edit, Search, Filter } from 'lucide-react';

const leads = [
  {
    id: 1,
    company: 'ООО "ТехСтрой"',
    contact: 'Иванов Петр',
    source: 'Сайт',
    status: 'новый',
    potential: 'высокий',
    responsible: 'Смирнов А.В.',
    created: '2025-07-05',
    phone: '+7 (999) 123-45-67',
  },
  {
    id: 2,
    company: 'ИП Сидоров',
    contact: 'Сидоров Иван',
    source: 'Реклама',
    status: 'в работе',
    potential: 'средний',
    responsible: 'Петрова М.И.',
    created: '2025-07-04',
    phone: '+7 (999) 234-56-78',
  },
  {
    id: 3,
    company: 'ООО "Элком"',
    contact: 'Козлов А.С.',
    source: 'Рекомендация',
    status: 'отказ',
    potential: 'низкий',
    responsible: 'Смирнов А.В.',
    created: '2025-07-03',
    phone: '+7 (999) 345-67-89',
  },
];

const deals = [
  {
    id: 1,
    name: 'Поставка кабельной продукции',
    client: 'ООО "ТехСтрой"',
    stage: 'Переговоры',
    probability: 75,
    budget: 450000,
    responsible: 'Смирнов А.В.',
    closeDate: '2025-07-15',
  },
  {
    id: 2,
    name: 'Монтаж электрооборудования',
    client: 'ИП Сидоров',
    stage: 'Коммерч. предложение',
    probability: 50,
    budget: 180000,
    responsible: 'Петрова М.И.',
    closeDate: '2025-07-20',
  },
  {
    id: 3,
    name: 'Автоматика для склада',
    client: 'ООО "Логистик"',
    stage: 'Согласование',
    probability: 90,
    budget: 750000,
    responsible: 'Козлов В.П.',
    closeDate: '2025-07-10',
  },
];

const proposals = [
  {
    id: 1,
    number: 'КП-001',
    date: '2025-07-01',
    client: 'ООО "ТехСтрой"',
    amount: 450000,
    status: 'отправлено',
    validUntil: '2025-07-15',
    manager: 'Смирнов А.В.',
  },
  {
    id: 2,
    number: 'КП-002',
    date: '2025-07-03',
    client: 'ИП Сидоров',
    amount: 180000,
    status: 'согласовано',
    validUntil: '2025-07-17',
    manager: 'Петрова М.И.',
  },
];

const orders = [
  {
    id: 1,
    number: 'ЗК-001',
    date: '2025-07-04',
    client: 'ООО "ТехСтрой"',
    manager: 'Смирнов А.В.',
    status: 'сборка',
    amount: 450000,
    paid: 135000,
  },
  {
    id: 2,
    number: 'ЗК-002',
    date: '2025-07-05',
    client: 'ООО "Логистик"',
    manager: 'Козлов В.П.',
    status: 'новый',
    amount: 750000,
    paid: 0,
  },
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'новый': 'outline',
    'в работе': 'default',
    'отказ': 'destructive',
    'черновик': 'secondary',
    'отправлено': 'default',
    'согласовано': 'default',
    'отклонено': 'destructive',
    'сборка': 'default',
    'отгрузка': 'default',
    'выполнен': 'default',
  };
  
  return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
};

export const Sales = () => {
  const [activeTab, setActiveTab] = useState('leads');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex gap-2">
            <Input placeholder="Поиск..." className="w-64" />
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
              Создать
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать лид</DialogTitle>
              <DialogDescription>Заполните информацию о новом лиде</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="company">Компания</Label>
                <Input id="company" placeholder="Название компании" />
              </div>
              <div>
                <Label htmlFor="contact">Контактное лицо</Label>
                <Input id="contact" placeholder="ФИО" />
              </div>
              <div>
                <Label htmlFor="source">Источник</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите источник" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="site">Сайт</SelectItem>
                    <SelectItem value="ads">Реклама</SelectItem>
                    <SelectItem value="recommendation">Рекомендация</SelectItem>
                    <SelectItem value="cold">Холодный звонок</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Телефон</Label>
                <Input id="phone" placeholder="+7 (999) 123-45-67" />
              </div>
              <div>
                <Label htmlFor="notes">Комментарий</Label>
                <Textarea id="notes" placeholder="Дополнительная информация" />
              </div>
              <Button className="w-full">Создать лид</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leads">Лиды</TabsTrigger>
          <TabsTrigger value="deals">Сделки</TabsTrigger>
          <TabsTrigger value="proposals">Коммерческие предложения</TabsTrigger>
          <TabsTrigger value="orders">Заказы клиентов</TabsTrigger>
        </TabsList>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Лиды</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Компания</TableHead>
                    <TableHead>Контакт</TableHead>
                    <TableHead>Источник</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Потенциал</TableHead>
                    <TableHead>Ответственный</TableHead>
                    <TableHead>Дата создания</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>{lead.company}</TableCell>
                      <TableCell>
                        <div>
                          <div>{lead.contact}</div>
                          <div className="text-sm text-gray-500">{lead.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{lead.source}</TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell>
                        <Badge variant={lead.potential === 'высокий' ? 'default' : lead.potential === 'средний' ? 'secondary' : 'outline'}>
                          {lead.potential}
                        </Badge>
                      </TableCell>
                      <TableCell>{lead.responsible}</TableCell>
                      <TableCell>{lead.created}</TableCell>
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

        <TabsContent value="deals">
          <Card>
            <CardHeader>
              <CardTitle>Сделки</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Этап</TableHead>
                    <TableHead>Вероятность</TableHead>
                    <TableHead>Бюджет</TableHead>
                    <TableHead>Ответственный</TableHead>
                    <TableHead>Дата закрытия</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell>{deal.name}</TableCell>
                      <TableCell>{deal.client}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{deal.stage}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${deal.probability}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{deal.probability}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{deal.budget.toLocaleString('ru-RU')} ₽</TableCell>
                      <TableCell>{deal.responsible}</TableCell>
                      <TableCell>{deal.closeDate}</TableCell>
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

        <TabsContent value="proposals">
          <Card>
            <CardHeader>
              <CardTitle>Коммерческие предложения</CardTitle>
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
                    <TableHead>Действует до</TableHead>
                    <TableHead>Менеджер</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell>{proposal.number}</TableCell>
                      <TableCell>{proposal.date}</TableCell>
                      <TableCell>{proposal.client}</TableCell>
                      <TableCell>{proposal.amount.toLocaleString('ru-RU')} ₽</TableCell>
                      <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                      <TableCell>{proposal.validUntil}</TableCell>
                      <TableCell>{proposal.manager}</TableCell>
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

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Заказы клиентов</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Номер</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Менеджер</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Оплачено</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.number}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.client}</TableCell>
                      <TableCell>{order.manager}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{order.amount.toLocaleString('ru-RU')} ₽</TableCell>
                      <TableCell>
                        <div>
                          <div>{order.paid.toLocaleString('ru-RU')} ₽</div>
                          <div className="text-sm text-gray-500">
                            {((order.paid / order.amount) * 100).toFixed(0)}%
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
      </Tabs>
    </div>
  );
};