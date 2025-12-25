import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Download, FileText, Calendar, Filter, Search, Eye, TrendingUp, Package, Loader2, MapPin } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ReportsProps {
  selectedSalesPoint: any;
}

export function Reports({ selectedSalesPoint }: ReportsProps) {
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(false);

  // Состояния для вложенных вкладок
  const [salesSubTab, setSalesSubTab] = useState('by-days');
  const [warehouseSubTab, setWarehouseSubTab] = useState('stock');
  const [detailedSubTab, setDetailedSubTab] = useState('receipts');

  const [allData, setAllData] = useState({
    salesByDays: [],
    salesByMonths: [],
    salesByReceipts: [],
    salesByShifts: [],
    salesByCategories: [],
    salesByEmployees: [],
    salesByPointRetail: [],
    employeesReport: [],
    warehouseStock: [],
    warehouseConsumption: [],
    financialIncome: null,
    financialExpense: null,
    financialReport: null
  });

  const filterByDate = (data, dateField = 'date') => {
    if (!Array.isArray(data) || data.length === 0) return data;

    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999); // Включаем весь последний день

    return data.filter(item => {
      if (!item[dateField]) return false;

      try {
        const itemDate = new Date(item[dateField]);
        return itemDate >= fromDate && itemDate <= toDate;
      } catch (error) {
        console.error('Error parsing date:', item[dateField], error);
        return false;
      }
    });
  };

  // Получаем отфильтрованные данные
  const filteredSalesByDays = filterByDate(allData.salesByDays, 'date');
  const filteredSalesByReceipts = filterByDate(allData.salesByReceipts, 'date_close');
  const filteredSalesByShifts = filterByDate(allData.salesByShifts, 'date_open');
  const filteredSalesByEmployees = filterByDate(allData.employeesReport, 'date');

  // Функция для получения заголовков авторизации
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Токен не найден в localStorage');
      return {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
    }
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Функция для фильтрации данных по точке продаж
  const filterDataBySalesPoint = useCallback((data: any[], salesPoint: any) => {
    if (!salesPoint || !Array.isArray(data)) return data;

    return data.filter(item => {
      const pointId = item.point_retail_id || item.point_id || item.sales_point_id;
      return pointId === salesPoint.id;
    });
  }, []);


  useEffect(() => {
    loadData();
  }, [activeTab, selectedSalesPoint]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'sales':
          await loadSalesData();
          break;
        case 'financial':
          await loadFinancialData();
          break;
        case 'warehouse':
          await loadWarehouseData();
          break;
        case 'staff':
          await loadStaffData();
          break;
        case 'detailed':
          await loadDetailedData();
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSalesData = async () => {
    await Promise.all([
      fetchSalesByDays(),
      fetchSalesByCategories(),
      fetchSalesByEmployees(),
      fetchSalesByPointRetail()
    ]);
  };

  const loadFinancialData = async () => {
    await Promise.all([
      fetchFinancialReport(),
      fetchFinancialIncome(),
      fetchFinancialExpense()
    ]);
  };

  const loadWarehouseData = async () => {
    await Promise.all([
      fetchWarehouseStock(),
      fetchWarehouseConsumption()
    ]);
  };

  const loadStaffData = async () => {
    await fetchEmployeesReport();
  };

  const loadDetailedData = async () => {
    await Promise.all([
      fetchSalesByReceipts(),
      fetchSalesByShifts(),
      fetchSalesByMonths()
    ]);
  };

  const fetchSalesByDays = async () => {
    const headers = getAuthHeaders();
    try {
      const response = await fetch(`/reports/sales/by-days?skip=0&limit=1000`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        const filteredData = filterDataBySalesPoint(data, selectedSalesPoint);
        setAllData(prev => ({ ...prev, salesByDays: Array.isArray(filteredData) ? filteredData : [] }));
      } else {
        console.error('Error fetching sales by days:', response.status);
        setAllData(prev => ({ ...prev, salesByDays: [] }));
      }
    } catch (error) {
      console.error('Error fetching sales by days:', error);
      setAllData(prev => ({ ...prev, salesByDays: [] }));
    }
  };

  const fetchSalesByMonths = async () => {
    const headers = getAuthHeaders();
    try {
      const response = await fetch(`/reports/sales/by-months?skip=0&limit=100`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        const filteredData = filterDataBySalesPoint(data, selectedSalesPoint);
        setAllData(prev => ({ ...prev, salesByMonths: Array.isArray(filteredData) ? filteredData : [] }));
      } else {
        console.error('Error fetching sales by months:', response.status);
        setAllData(prev => ({ ...prev, salesByMonths: [] }));
      }
    } catch (error) {
      console.error('Error by months:', error);
      setAllData(prev => ({ ...prev, salesByMonths: [] }));
    }
  };

  const fetchSalesByReceipts = async () => {
    const headers = getAuthHeaders();
    try {
      const response = await fetch(`/reports/sales/by-receipts?skip=0&limit=1000`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        const filteredData = filterDataBySalesPoint(data, selectedSalesPoint);
        setAllData(prev => ({ ...prev, salesByReceipts: Array.isArray(filteredData) ? filteredData : [] }));
      } else {
        console.error('Error', response.status);
        setAllData(prev => ({ ...prev, salesByReceipts: [] }));
      }
    } catch (error) {
      console.error('Error by receipts:', error);
      setAllData(prev => ({ ...prev, salesByReceipts: [] }));
    }
  };

  const fetchSalesByShifts = async () => {
    const headers = getAuthHeaders();
    try {
      const response = await fetch(`/reports/sales/by-shifts?skip=0&limit=1000`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        const filteredData = filterDataBySalesPoint(data, selectedSalesPoint);
        setAllData(prev => ({ ...prev, salesByShifts: Array.isArray(filteredData) ? filteredData : [] }));
      } else {
        console.error('Error by shifts:', response.status);
        setAllData(prev => ({ ...prev, salesByShifts: [] }));
      }
    } catch (error) {
      console.error('Error by shifts:', error);
      setAllData(prev => ({ ...prev, salesByShifts: [] }));
    }
  };

  const fetchSalesByCategories = async () => {
    const headers = getAuthHeaders();
    try {
      const response = await fetch(`/reports/sales/by-categories?skip=0&limit=1000`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        const filteredData = filterDataBySalesPoint(data, selectedSalesPoint);
        setAllData(prev => ({ ...prev, salesByCategories: Array.isArray(filteredData) ? filteredData : [] }));
      } else {
        console.error('Error categories:', response.status);
        setAllData(prev => ({ ...prev, salesByCategories: [] }));
      }
    } catch (error) {
      console.error('Error categories:', error);
      setAllData(prev => ({ ...prev, salesByCategories: [] }));
    }
  };

  const fetchSalesByEmployees = async () => {
    const headers = getAuthHeaders();
    try {
      const response = await fetch(`/reports/sales/by-employees?skip=0&limit=1000`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        const filteredData = filterDataBySalesPoint(data, selectedSalesPoint);
        setAllData(prev => ({ ...prev, salesByEmployees: Array.isArray(filteredData) ? filteredData : [] }));
      } else {
        console.error('Error', response.status);
        setAllData(prev => ({ ...prev, salesByEmployees: [] }));
      }
    } catch (error) {
      console.error('Error fetching sales by employees:', error);
      setAllData(prev => ({ ...prev, salesByEmployees: [] }));
    }
  };

  const fetchSalesByPointRetail = async () => {
    const headers = getAuthHeaders();
    try {
      const response = await fetch(`/reports/sales/by-point-retail?skip=0&limit=1000`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        const filteredData = filterDataBySalesPoint(data, selectedSalesPoint);
        setAllData(prev => ({ ...prev, salesByPointRetail: Array.isArray(filteredData) ? filteredData : [] }));
      } else {
        console.error('Error retail:', response.status);
        setAllData(prev => ({ ...prev, salesByPointRetail: [] }));
      }
    } catch (error) {
      console.error('Erro retail:', error);
      setAllData(prev => ({ ...prev, salesByPointRetail: [] }));
    }
  };

  const fetchEmployeesReport = async () => {
    const headers = getAuthHeaders();
    try {
      const response = await fetch(`/reports/employees?skip=0&limit=1000`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        const filteredData = filterDataBySalesPoint(data, selectedSalesPoint);
        setAllData(prev => ({ ...prev, employeesReport: Array.isArray(filteredData) ? filteredData : [] }));
      } else {
        console.error('Error report:', response.status);
        setAllData(prev => ({ ...prev, employeesReport: [] }));
      }
    } catch (error) {
      console.error('Error report:', error);
      setAllData(prev => ({ ...prev, employeesReport: [] }));
    }
  };

  const fetchWarehouseStock = async () => {
    const headers = getAuthHeaders();
    try {
      const response = await fetch(`/reports/warehouse/stock?skip=0&limit=1000`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        const filteredData = filterDataBySalesPoint(data, selectedSalesPoint);
        setAllData(prev => ({ ...prev, warehouseStock: Array.isArray(filteredData) ? filteredData : [] }));
      } else {
        console.error('Error stock:', response.status);
        setAllData(prev => ({ ...prev, warehouseStock: [] }));
      }
    } catch (error) {
      console.error('Error stock:', error);
      setAllData(prev => ({ ...prev, warehouseStock: [] }));
    }
  };

  const fetchWarehouseConsumption = async () => {
    const headers = getAuthHeaders();
    try {
      const response = await fetch(`/reports/warehouse/consumption?skip=0&limit=1000`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        const filteredData = filterDataBySalesPoint(data, selectedSalesPoint);
        setAllData(prev => ({ ...prev, warehouseConsumption: Array.isArray(filteredData) ? filteredData : [] }));
      } else {
        console.error('Error consumption:', response.status);
        setAllData(prev => ({ ...prev, warehouseConsumption: [] }));
      }
    } catch (error) {
      console.error('Error consumption:', error);
      setAllData(prev => ({ ...prev, warehouseConsumption: [] }));
    }
  };

  const fetchFinancialIncome = async () => {
    const headers = getAuthHeaders();
    try {
      const response = await fetch(`/reports/financial/income?date_from=${dateFrom}&date_to=${dateTo}`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        const filteredData = selectedSalesPoint && data.point_retail_id !== selectedSalesPoint.id ? null : data;
        setAllData(prev => ({ ...prev, financialIncome: filteredData }));
      } else {
        console.error('Error income:', response.status);
        setAllData(prev => ({ ...prev, financialIncome: null }));
      }
    } catch (error) {
      console.error('Error income:', error);
      setAllData(prev => ({ ...prev, financialIncome: null }));
    }
  };

  const fetchFinancialExpense = async () => {
    const headers = getAuthHeaders();
    try {
      const response = await fetch(`/reports/financial/expense?date_from=${dateFrom}&date_to=${dateTo}`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        const filteredData = selectedSalesPoint && data.point_retail_id !== selectedSalesPoint.id ? null : data;
        setAllData(prev => ({ ...prev, financialExpense: filteredData }));
      } else {
        console.error('Error expense:', response.status);
        setAllData(prev => ({ ...prev, financialExpense: null }));
      }
    } catch (error) {
      console.error('Error expense:', error);
      setAllData(prev => ({ ...prev, financialExpense: null }));
    }
  };

  const fetchFinancialReport = async () => {
    const headers = getAuthHeaders();
    try {
      const response = await fetch(`/reports/financial?date_from=${dateFrom}&date_to=${dateTo}`, {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        const filteredData = selectedSalesPoint && data.point_retail_id !== selectedSalesPoint.id ? null : data;
        setAllData(prev => ({ ...prev, financialReport: filteredData }));
      } else {
        console.error('Error report:', response.status);
        setAllData(prev => ({ ...prev, financialReport: null }));
      }
    } catch (error) {
      console.error('Error report:', error);
      setAllData(prev => ({ ...prev, financialReport: null }));
    }
  };

  // Функция для обновления данных при изменении дат
  const handleDateChange = () => {
    // Фильтрация происходит автоматически через filteredSalesByDays и другие переменные
    // Просто перерисовываем компонент
    forceUpdate();
  };

  // Хук для принудительного обновления компонента
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  // Вспомогательные функции для форматирования
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    try {
      const num = parseFloat(amount || 0);
      return `₽${num.toLocaleString('ru-RU')}`;
    } catch {
      return `₽0`;
    }
  };

  const formatCurrencyNumber = (amount) => {
    try {
      return parseFloat(amount || 0);
    } catch {
      return 0;
    }
  };

  // Компоненты для каждой группы отчетов
  const SalesReports = () => (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Общая выручка</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">
                {formatCurrency(filteredSalesByDays.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0))}
              </div>
            </CardContent>
          </Card>
          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Всего заказов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">
                {filteredSalesByDays.reduce((sum, item) => sum + (item.total_orders || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Средний чек</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-orange-600">
                {filteredSalesByDays.length > 0 ? formatCurrency(
                    filteredSalesByDays.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0) /
                    filteredSalesByDays.reduce((sum, item) => sum + (item.total_orders || 0), 1)
                ) : '₽0'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={salesSubTab} onValueChange={setSalesSubTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="by-days">По дням</TabsTrigger>
            <TabsTrigger value="by-categories">По категориям</TabsTrigger>
            <TabsTrigger value="by-employees">По сотрудникам</TabsTrigger>
            <TabsTrigger value="by-points">По точкам</TabsTrigger>
          </TabsList>

          <TabsContent value="by-days">
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle>Продажи по дням ({dateFrom} - {dateTo})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredSalesByDays.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Дата</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Выручка</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Количество заказов</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Средний чек</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSalesByDays.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(item.date)}</TableCell>
                              <TableCell className="text-green-600">{formatCurrency(item.total_amount)}</TableCell>
                              <TableCell>{item.total_orders}</TableCell>
                              <TableCell>
                                {formatCurrency(parseFloat(item.total_amount) / (item.total_orders || 1))}
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Нет данных за выбранный период
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-categories">
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle>Продажи по категориям ({dateFrom} - {dateTo})</CardTitle>
              </CardHeader>
              <CardContent>
                {allData.salesByCategories.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Категория</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Выручка</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Количество</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Доля</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allData.salesByCategories.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.category_name}</TableCell>
                              <TableCell className="text-green-600">{formatCurrency(item.total_amount)}</TableCell>
                              <TableCell>{item.total_quantity}</TableCell>
                              <TableCell>
                                {((parseFloat(item.total_amount) / allData.salesByCategories.reduce((sum, cat) => sum + parseFloat(cat.total_amount || 0), 0)) * 100).toFixed(1)}%
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">Нет данных</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-employees">
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle>Продажи по сотрудникам ({dateFrom} - {dateTo})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredSalesByEmployees.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Сотрудник</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Выручка</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Количество заказов</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Средний чек</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSalesByEmployees.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.employee_name}</TableCell>
                              <TableCell className="text-green-600">{formatCurrency(item.total_amount)}</TableCell>
                              <TableCell>{item.total_orders}</TableCell>
                              <TableCell>
                                {formatCurrency(parseFloat(item.total_amount) / (item.total_orders || 1))}
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Нет данных за выбранный период
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="by-points">
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle>Продажи по точкам ({dateFrom} - {dateTo})</CardTitle>
              </CardHeader>
              <CardContent>
                {allData.salesByPointRetail.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Точка продаж</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Выручка</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Количество заказов</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Средний чек</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allData.salesByPointRetail.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.point_retail_name}</TableCell>
                              <TableCell className="text-green-600">{formatCurrency(item.total_amount)}</TableCell>
                              <TableCell>{item.total_orders}</TableCell>
                              <TableCell>
                                {formatCurrency(parseFloat(item.total_amount) / (item.total_orders || 1))}
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">Нет данных</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );

  const FinancialReports = () => (
      <div className="space-y-6">
        {allData.financialReport ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card style={{
                  borderRadius: '20px',
                  border: 'var(--custom-border-primary)',
                  background: 'var(--custom-bg-secondaryLineCard)',
                  color: 'var(--custom-text)',
                }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Общий доход</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl text-green-600">{formatCurrency(allData.financialReport.total_income)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Общий расход</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl text-red-600">{formatCurrency(allData.financialReport.total_expense)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Прибыль</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl ${
                        parseFloat(allData.financialReport.profit) >= 0 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(allData.financialReport.profit)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Детальный финансовый отчет ({dateFrom} - {dateTo})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Показатель</TableHead>
                        <TableHead>Значение</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Период</TableCell>
                        <TableCell>{`${dateFrom} - ${dateTo}`}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Общий доход</TableCell>
                        <TableCell className="text-green-600">{formatCurrency(allData.financialReport.total_income)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Общий расход</TableCell>
                        <TableCell className="text-red-600">{formatCurrency(allData.financialReport.total_expense)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Прибыль</TableCell>
                        <TableCell className={parseFloat(allData.financialReport.profit) >= 0 ? 'text-orange-600' : 'text-red-600'}>
                          {formatCurrency(allData.financialReport.profit)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Количество приходов</TableCell>
                        <TableCell>{allData.financialReport.receipt_invoices_count}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Количество расходов</TableCell>
                        <TableCell>{allData.financialReport.expenditure_invoices_count}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
        ) : (
            <div className="text-center py-8 text-muted-foreground">
              Нет финансовых данных за период {dateFrom} - {dateTo}
            </div>
        )}
      </div>
  );

  const WarehouseReports = () => (
      <div className="space-y-6">
        <Tabs value={warehouseSubTab} onValueChange={setWarehouseSubTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stock">Остатки на складе</TabsTrigger>
            <TabsTrigger value="consumption">Расход товаров</TabsTrigger>
          </TabsList>

          <TabsContent value="stock">
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle>Остатки на складе</CardTitle>
              </CardHeader>
              <CardContent>
                {allData.warehouseStock.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Товар</TableHead>
                          <TableHead>Склад</TableHead>
                          <TableHead>Количество</TableHead>
                          <TableHead>Единица измерения</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allData.warehouseStock.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.product_name}</TableCell>
                              <TableCell>{item.warehouse_name}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{item.unit_name}</TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">Нет данных</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consumption">
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle>Расход товаров ({dateFrom} - {dateTo})</CardTitle>
              </CardHeader>
              <CardContent>
                {allData.warehouseConsumption.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Товар</TableHead>
                          <TableHead>Период</TableHead>
                          <TableHead>Расход</TableHead>
                          <TableHead>Единица измерения</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allData.warehouseConsumption.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.product_name}</TableCell>
                              <TableCell>{item.period}</TableCell>
                              <TableCell className="text-red-600">{item.total_quantity}</TableCell>
                              <TableCell>{item.unit_name}</TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">Нет данных</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );

  const StaffReports = () => (
      <div className="space-y-6">
        <Card style={{
          borderRadius: '20px',
          border: 'var(--custom-border-primary)',
          background: 'var(--custom-bg-secondaryLineCard)',
          color: 'var(--custom-text)',
        }}>
          <CardHeader>
            <CardTitle>Отчет по сотрудникам ({dateFrom} - {dateTo})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSalesByEmployees.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Сотрудник</TableHead>
                      <TableHead>Количество заказов</TableHead>
                      <TableHead>Выручка</TableHead>
                      <TableHead>Количество смен</TableHead>
                      <TableHead>Средняя выручка за смену</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSalesByEmployees.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.employee_name}</TableCell>
                          <TableCell>{item.total_orders}</TableCell>
                          <TableCell className="text-green-600">{formatCurrency(item.total_amount)}</TableCell>
                          <TableCell>{item.total_shifts}</TableCell>
                          <TableCell>
                            {formatCurrency(parseFloat(item.total_amount) / (item.total_shifts || 1))}
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Нет данных за выбранный период
                </div>
            )}
          </CardContent>
        </Card>
      </div>
  );

  const DetailedReports = () => (
      <div className="space-y-6">
        <Tabs value={detailedSubTab} onValueChange={setDetailedSubTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="receipts">По чекам</TabsTrigger>
            <TabsTrigger value="shifts">По сменам</TabsTrigger>
            <TabsTrigger value="months">По месяцам</TabsTrigger>
            <TabsTrigger value="points">По точкам продаж</TabsTrigger>
          </TabsList>

          <TabsContent value="receipts">
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle>Продажи по чекам ({dateFrom} - {dateTo})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredSalesByReceipts.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead style={{color:'rgb(101,125,156)'}}>ID заказа</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Сумма</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Дата закрытия</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Пользователь</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSalesByReceipts.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.order_id}</TableCell>
                              <TableCell className="text-green-600">{formatCurrency(item.amount)}</TableCell>
                              <TableCell>{formatDate(item.date_close)}</TableCell>
                              <TableCell>{item.user_id_open}</TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Нет данных за выбранный период
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shifts">
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle>Продажи по сменам ({dateFrom} - {dateTo})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredSalesByShifts.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead style={{color:'rgb(101,125,156)'}}>ID смены</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Дата открытия</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Дата закрытия</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Сумма чеков</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Прибыль</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSalesByShifts.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.change_id}</TableCell>
                              <TableCell>{formatDate(item.date_open)}</TableCell>
                              <TableCell>{formatDate(item.date_close)}</TableCell>
                              <TableCell className="text-green-600">{formatCurrency(item.sum_chek)}</TableCell>
                              <TableCell className="text-blue-600">{formatCurrency(item.sum_profits)}</TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Нет данных за выбранный период
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="months">
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle>Продажи по месяцам</CardTitle>
              </CardHeader>
              <CardContent>
                {allData.salesByMonths.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Год</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Месяц</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Выручка</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Количество заказов</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allData.salesByMonths.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.year}</TableCell>
                              <TableCell>{item.month}</TableCell>
                              <TableCell className="text-green-600">{formatCurrency(item.total_amount)}</TableCell>
                              <TableCell>{item.total_orders}</TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">Нет данных</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="points">
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle>Продажи по точкам продаж ({dateFrom} - {dateTo})</CardTitle>
              </CardHeader>
              <CardContent>
                {allData.salesByPointRetail.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead style={{color:'rgb(101,125,156)'}}> Точка продаж</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Выручка</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Количество заказов</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Средний чек</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allData.salesByPointRetail.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.point_retail_name}</TableCell>
                              <TableCell className="text-green-600">{formatCurrency(item.total_amount)}</TableCell>
                              <TableCell>{item.total_orders}</TableCell>
                              <TableCell>
                                {formatCurrency(parseFloat(item.total_amount) / (item.total_orders || 1))}
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">Нет данных</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );

  return (
      <div className="space-y-6">
        {/* Заголовок с информацией о точке продаж */}
        <Card style={{
          borderRadius: '20px',
          border: 'var(--custom-border-primary)',
          background: 'var(--custom-bg-secondaryLineCard)',
          color: 'var(--custom-text)',
        }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Отчеты и аналитика</CardTitle>
                {selectedSalesPoint && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" />
                      Точка продаж: {selectedSalesPoint.name}
                      {selectedSalesPoint.address && ` (${selectedSalesPoint.address})`}
                    </div>
                )}
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">С:</span>
                  <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        handleDateChange();
                      }}
                      className="w-40"
                      style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                      }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">По:</span>
                  <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        handleDateChange();
                      }}
                      className="w-40"
                      style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                      }}
                  />
                </div>
                <Button
                    onClick={loadData}
                    disabled={loading}
                    variant="outline"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {loading ? 'Загрузка...' : 'Загрузить данные'}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Основные вкладки */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="sales">Продажи</TabsTrigger>
            <TabsTrigger value="financial">Финансы</TabsTrigger>
            <TabsTrigger value="warehouse">Склад</TabsTrigger>
            <TabsTrigger value="staff">Персонал</TabsTrigger>
            <TabsTrigger value="detailed">Детальные отчеты</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <SalesReports />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialReports />
          </TabsContent>

          <TabsContent value="warehouse">
            <WarehouseReports />
          </TabsContent>

          <TabsContent value="staff">
            <StaffReports />
          </TabsContent>

          <TabsContent value="detailed">
            <DetailedReports />
          </TabsContent>
        </Tabs>
      </div>
  );
}