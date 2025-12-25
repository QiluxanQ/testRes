import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Store } from 'lucide-react';

export const SalesPoints = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Точки продаж
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3>Магазин №1</h3>
                  <p className="text-sm text-gray-600">ул. Ленина, 15</p>
                  <Badge variant="default">Активный</Badge>
                  <div className="text-sm">
                    <p>Продажи сегодня: 45 000 ₽</p>
                    <p>Кассир: Иванова А.С.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};