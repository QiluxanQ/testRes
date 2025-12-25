import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';

const salesPlanData = [
  { month: 'Янв', plan: 1500000, fact: 1200000 },
  { month: 'Фев', plan: 1400000, fact: 1350000 },
  { month: 'Мар', plan: 1300000, fact: 1180000 },
  { month: 'Апр', plan: 1500000, fact: 1420000 },
  { month: 'Май', plan: 1600000, fact: 1650000 },
  { month: 'Июн', plan: 1550000, fact: 1580000 },
];

export const Planning = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        <h2>Планирование</h2>
      </div>

      <Tabs defaultValue="sales-plan">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales-plan">План продаж</TabsTrigger>
          <TabsTrigger value="purchase-plan">План закупок</TabsTrigger>
          <TabsTrigger value="financial-plan">Финансовый план</TabsTrigger>
        </TabsList>

        <TabsContent value="sales-plan">
          <Card>
            <CardHeader>
              <CardTitle>План продаж на 2025 год</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesPlanData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [new Intl.NumberFormat('ru-RU').format(Number(value)) + ' ₽']} />
                  <Bar dataKey="plan" fill="#e5e7eb" name="План" />
                  <Bar dataKey="fact" fill="#3b82f6" name="Факт" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase-plan">
          <Card>
            <CardHeader>
              <CardTitle>План закупок</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Раздел планирования закупок в разработке</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial-plan">
          <Card>
            <CardHeader>
              <CardTitle>Финансовый план</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Раздел финансового планирования в разработке</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};