import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { User, Mail, Phone, Shield } from 'lucide-react';

const employees = [
  {
    id: 1,
    name: 'Смирнов Александр Владимирович',
    position: 'Менеджер по продажам',
    department: 'Отдел продаж',
    email: 'smirnov@company.ru',
    phone: '+7 (495) 123-45-67',
    role: 'Менеджер',
    status: 'Активный',
    sales: 2450000,
    plan: 2000000,
  },
  {
    id: 2,
    name: 'Петрова Мария Ивановна',
    position: 'Менеджер по продажам',
    department: 'Отдел продаж',
    email: 'petrova@company.ru',
    phone: '+7 (495) 234-56-78',
    role: 'Менеджер',
    status: 'Активный',
    sales: 1850000,
    plan: 1800000,
  },
  {
    id: 3,
    name: 'Козлов Владимир Петрович',
    position: 'Старший менеджер',
    department: 'Отдел продаж',
    email: 'kozlov@company.ru',
    phone: '+7 (495) 345-67-89',
    role: 'Старший менеджер',
    status: 'Активный',
    sales: 3200000,
    plan: 2500000,
  },
  {
    id: 4,
    name: 'Иванова Елена Сергеевна',
    position: 'Кладовщик',
    department: 'Складской отдел',
    email: 'ivanova@company.ru',
    phone: '+7 (495) 456-78-90',
    role: 'Кладовщик',
    status: 'Активный',
    sales: 0,
    plan: 0,
  },
];

export const Employees = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего сотрудников</p>
                <p className="text-2xl">24</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Менеджеры</p>
                <p className="text-2xl">8</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активных</p>
                <p className="text-2xl">22</p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Выполнение плана</p>
                <p className="text-2xl">112%</p>
              </div>
              <User className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список сотрудников</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Сотрудник</TableHead>
                <TableHead>Должность</TableHead>
                <TableHead>Отдел</TableHead>
                <TableHead>Контакты</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Продажи/План</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{employee.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {employee.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {employee.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <Badge variant="outline">{employee.role}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {employee.sales > 0 ? (
                      <div>
                        <div>{employee.sales.toLocaleString('ru-RU')} ₽</div>
                        <div className="text-sm text-gray-500">
                          План: {employee.plan.toLocaleString('ru-RU')} ₽
                        </div>
                        <div className="text-sm">
                          <span className={employee.sales >= employee.plan ? 'text-green-600' : 'text-red-600'}>
                            {((employee.sales / employee.plan) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{employee.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};