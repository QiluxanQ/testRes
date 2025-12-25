import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../../ui/dialog';
import {
    Plus,
    Search,
    ArrowDownCircle,
    ArrowUpCircle,
    RefreshCw,
    Trash2,
    MoveRight,
    FileText,
    Calendar,
    Edit,
    X,
    Save,
    ArrowLeft,
    Eye,
    Wallet,
    CreditCard,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Truck,
    Filter
} from 'lucide-react';

const ViewDiteil = ({stats,activeTab,setActiveTab,searchTerm,setPointFilter,setSearchTerm,pointFilter,selectedSalesPoint,incomesLoading,
                        getFilteredIncomes,getCounterpartyName,getWarehouseName,formatPaymentType,getIncomeStatusColor,formatStatus,renderViewButton,handleDeleteIncome,expensesLoading
,getFilteredExpenses,getExpenseStatusColor,formatExpenseStatus,writeOffsLoading,getWriteOffStatus,getPointRetailName,getWriteOffStatusColor,getFilteredWriteOffs,formatWriteOffStatus,handleViewDocument,
                        documentTypeFilter, setDocumentTypeFilter,documentStatusFilter,setDocumentStatusFilter,documentsLoading, getTypeColor, getFilteredDocuments,getStatusColor,formatDocumentStatus,
                        cashRegisters,  cashOperations,getStatusBadge,supplierPayments, opexExpenses,staffPayments,  }) => {
    return (
            <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6" >
                    <Card style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-primaryLine)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <ArrowDownCircle className="h-4 w-4 text-green-600" />
                                Приходы
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl text-green-600">₽{stats.totalIncome.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Всего приходов</p>
                        </CardContent>
                    </Card>

                    <Card style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-primaryLine)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <ArrowUpCircle className="h-4 w-4 text-red-600" />
                                Расходы
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl text-red-600">₽{stats.totalExpense.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Всего расходов</p>
                        </CardContent>
                    </Card>

                    <Card style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-primaryLine)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <RefreshCw className="h-4 w-4 text-yellow-600" />
                                Возвраты
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl text-yellow-600">₽{stats.totalReturns.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Всего возвратов</p>
                        </CardContent>
                    </Card>

                    <Card style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-primaryLine)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Trash2 className="h-4 w-4 text-orange-600" />
                                Списания
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl text-orange-600">₽{stats.totalWriteOffs.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Всего списаний</p>
                        </CardContent>
                    </Card>

                    <Card style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-primaryLine)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Баланс</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ₽{stats.balance.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">Чистый баланс</p>
                        </CardContent>
                    </Card>

                </div>



                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-secondaryLineCard)',
                    color: 'var(--custom-text)',
                }}>
                    <CardContent className="pt-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4" >
                            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-10" style={{height:'70px'}}>
                                <TabsTrigger value="incomes" className="flex items-center gap-1 text-xs">
                                    <ArrowDownCircle className="h-3 w-3" />
                                    Приходы
                                </TabsTrigger>
                                <TabsTrigger value="expenses" className="flex items-center gap-1 text-xs">
                                    <ArrowUpCircle className="h-3 w-3" />
                                    Расходы
                                </TabsTrigger>
                                <TabsTrigger value="writeoffs" className="flex items-center gap-1 text-xs">
                                    <Trash2 className="h-3 w-3" />
                                    Списание
                                </TabsTrigger>
                                <TabsTrigger value="documents" className="flex items-center gap-1 text-xs">
                                    <FileText className="h-3 w-3" />
                                    Документы
                                </TabsTrigger>
                                <TabsTrigger value="cash" className="flex items-center gap-1 text-xs">
                                    <Wallet className="h-3 w-3" />
                                    Касса
                                </TabsTrigger>
                                <TabsTrigger value="suppliers" className="flex items-center gap-1 text-xs">
                                    <Truck className="h-3 w-3" />
                                    Поставщики
                                </TabsTrigger>
                                <TabsTrigger value="opex" className="flex items-center gap-1 text-xs">
                                    <DollarSign className="h-3 w-3" />
                                    OPEX
                                </TabsTrigger>
                                <TabsTrigger value="staff" className="flex items-center gap-1 text-xs">
                                    <Users className="h-3 w-3" />
                                    Сотрудники
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="incomes">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="relative max-w-md">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <Input
                                                placeholder="Поиск по приходам..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Select value={pointFilter} onValueChange={setPointFilter}>
                                                <SelectTrigger className="w-48"     style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <SelectValue placeholder="Все точки" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Все точки</SelectItem>
                                                    <SelectItem value="current">Текущая точка</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {pointFilter === 'current' && selectedSalesPoint && (
                                                <Badge className="bg-blue-100 text-blue-800">
                                                    <Filter className="h-3 w-3 mr-1" />
                                                    {selectedSalesPoint.name}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        className="px-0 pb-6"
                                        style={{
                                            height: '500px',
                                            overflowY: 'auto',
                                        }}
                                    >
                                        {incomesLoading ? (
                                            <div className="flex justify-center items-center h-32">
                                                <div>Загрузка приходов...</div>
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Дата создания</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>№ Документа</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Внешний номер</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Контрагент</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Склад</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Тип оплаты</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Сумма</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Действия</TableHead>
                                                    </TableRow>
                                                </TableHeader>

                                                <TableBody>
                                                    {getFilteredIncomes()
                                                        .filter(income =>
                                                            income.number_doc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            income.ext_number_doc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            income.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            getCounterpartyName(income.counterparty_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            getWarehouseName(income.warehouse_id).toLowerCase().includes(searchTerm.toLowerCase())
                                                        )
                                                        .map((income) => (
                                                            <TableRow key={income.id}>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-1">
                                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                        {new Date(income.date_create).toLocaleDateString('ru-RU')}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {new Date(income.date_create).toLocaleTimeString('ru-RU')}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="font-medium">
                                                                    {income.number_doc || 'Без номера'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {income.ext_number_doc || '-'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {getCounterpartyName(income.counterparty_id)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {getWarehouseName(income.warehouse_id)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {formatPaymentType(income.type_payment)}
                                                                </TableCell>
                                                                <TableCell className="text-green-600 font-medium">
                                                                    ₽{parseFloat(income.amount || 0).toLocaleString('ru-RU')}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge className={getIncomeStatusColor(income.status)}>
                                                                        {formatStatus(income.status)}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex gap-2">
                                                                        {renderViewButton({
                                                                            ...income,
                                                                            type: 'Приход',
                                                                            documentType: 'receipt'
                                                                        })}

                                                                        <Button variant="outline" size="sm" className="text-red-600" onClick={ () =>  handleDeleteIncome(income.id)}>
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        )}

                                        {!incomesLoading && getFilteredIncomes().length === 0 && (
                                            <div className="flex justify-center items-center h-32 text-muted-foreground">
                                                Нет данных о приходах {pointFilter === 'current' ? 'для текущей точки' : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="expenses">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="relative max-w-md">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <Input
                                                placeholder="Поиск по расходам..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Select value={pointFilter} onValueChange={setPointFilter}>
                                                <SelectTrigger className="w-48"    style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <SelectValue placeholder="Все точки" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Все точки</SelectItem>
                                                    <SelectItem value="current">Текущая точка</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {pointFilter === 'current' && selectedSalesPoint && (
                                                <Badge className="bg-blue-100 text-blue-800">
                                                    <Filter className="h-3 w-3 mr-1" />
                                                    {selectedSalesPoint.name}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        className="px-0 pb-6"
                                        style={{
                                            height: '500px',
                                            overflowY: 'auto',
                                        }}
                                    >
                                        {expensesLoading ? (
                                            <div className="flex justify-center items-center h-32">
                                                <div>Загрузка расходов...</div>
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Дата создания</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>№ Документа</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Внешний номер</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Контрагент</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Склад</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Тип оплаты</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Сумма</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Действия</TableHead>
                                                    </TableRow>
                                                </TableHeader>

                                                <TableBody>
                                                    {getFilteredExpenses()
                                                        .filter(expense =>
                                                            expense.number_doc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            expense.ext_number_doc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            expense.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            getCounterpartyName(expense.counterparty_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            getWarehouseName(expense.warehouse_id).toLowerCase().includes(searchTerm.toLowerCase())
                                                        )
                                                        .map((expense) => (
                                                            <TableRow key={expense.id}>
                                                                <TableCell >
                                                                    <div className="flex items-center gap-1">
                                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                        {new Date(expense.date_create).toLocaleDateString('ru-RU')}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {new Date(expense.date_create).toLocaleTimeString('ru-RU')}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="font-medium">
                                                                    {expense.number_doc || 'Без номера'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {expense.ext_number_doc || '-'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {getCounterpartyName(expense.counterparty_id)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {getWarehouseName(expense.warehouse_id)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {formatPaymentType(expense.type_payment)}
                                                                </TableCell>
                                                                <TableCell className="text-red-600 font-medium">
                                                                    ₽{parseFloat(expense.amount || 0).toLocaleString('ru-RU')}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge className={getExpenseStatusColor(expense.status)}>
                                                                        {formatExpenseStatus(expense.status)}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex gap-2">
                                                                        {renderViewButton({
                                                                            ...expense,
                                                                            type: 'Расход',
                                                                            documentType: 'expenditure'
                                                                        })}
                                                                        <Button variant="outline" size="sm">
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button variant="outline" size="sm" className="text-red-600">
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        )}

                                        {!expensesLoading && getFilteredExpenses().length === 0 && (
                                            <div className="flex justify-center items-center h-32 text-muted-foreground">
                                                Нет данных о расходах {pointFilter === 'current' ? 'для текущей точки' : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="writeoffs">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="relative max-w-md">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <Input
                                                placeholder="Поиск по списаниям..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Select value={pointFilter} onValueChange={setPointFilter}>
                                                <SelectTrigger className="w-48"    style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <SelectValue placeholder="Все точки" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Все точки</SelectItem>
                                                    <SelectItem value="current">Текущая точка</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {pointFilter === 'current' && selectedSalesPoint && (
                                                <Badge className="bg-blue-100 text-blue-800">
                                                    <Filter className="h-3 w-3 mr-1" />
                                                    {selectedSalesPoint.name}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        className="px-0 pb-6"
                                        style={{
                                            height: '500px',
                                            overflowY: 'auto',
                                        }}
                                    >
                                        {writeOffsLoading ? (
                                            <div className="flex justify-center items-center h-32">
                                                <div>Загрузка списаний...</div>
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Дата создания</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Причина списания</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Склад</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Точка продаж</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Действия</TableHead>
                                                    </TableRow>
                                                </TableHeader>

                                                <TableBody>
                                                    {getFilteredWriteOffs()
                                                        .filter(writeOff =>
                                                            writeOff.reason_write_off?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            getWarehouseName(writeOff.warehouse_id).toLowerCase().includes(searchTerm.toLowerCase())
                                                        )
                                                        .map((writeOff) => {
                                                            const status = getWriteOffStatus(writeOff);

                                                            return (
                                                                <TableRow key={writeOff.id}>
                                                                    <TableCell>
                                                                        <div className="flex items-center gap-1">
                                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                            {new Date(writeOff.date_create).toLocaleDateString('ru-RU')}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {new Date(writeOff.date_create).toLocaleTimeString('ru-RU')}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="font-medium">
                                                                        {writeOff.reason_write_off || 'Без причины'}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {getWarehouseName(writeOff.warehouse_id)}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {getPointRetailName(writeOff.point_retail_id)}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge className={getWriteOffStatusColor(status)}>
                                                                            {formatWriteOffStatus(status)}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="flex gap-2">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    console.log('👁️ Opening writeoff:', writeOff.id);
                                                                                    handleViewDocument({
                                                                                        id: writeOff.id,
                                                                                        type: 'Списание',
                                                                                        documentType: 'writeoff',
                                                                                        reason_write_off: writeOff.reason_write_off,
                                                                                        warehouse_id: writeOff.warehouse_id,
                                                                                        point_retail_id: writeOff.point_retail_id,
                                                                                        date_create: writeOff.date_create,
                                                                                        date_approval: writeOff.date_approval
                                                                                    });
                                                                                }}
                                                                            >
                                                                                <Eye className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button variant="outline" size="sm">
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button variant="outline" size="sm" className="text-red-600">
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                </TableBody>
                                            </Table>
                                        )}

                                        {!writeOffsLoading && getFilteredWriteOffs().length === 0 && (
                                            <div className="flex justify-center items-center h-32 text-muted-foreground">
                                                Нет данных о списаниях {pointFilter === 'current' ? 'для текущей точки' : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="documents">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="relative flex-1 max-w-md">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <Input
                                                placeholder="Поиск по всем документам..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Select value={pointFilter} onValueChange={setPointFilter}>
                                                <SelectTrigger className="w-48"    style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <SelectValue placeholder="Все точки" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Все точки</SelectItem>
                                                    <SelectItem value="current">Текущая точка</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                                                <SelectTrigger className="w-48"    style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <SelectValue placeholder="Тип документа" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Все документы</SelectItem>
                                                    <SelectItem value="Приход">Приходы</SelectItem>
                                                    <SelectItem value="Расход">Расходы</SelectItem>
                                                    <SelectItem value="Списание">Списания</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select value={documentStatusFilter} onValueChange={setDocumentStatusFilter}>
                                                <SelectTrigger className="w-48 "    style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <SelectValue placeholder="Статус" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all-status">Все статусы</SelectItem>
                                                    <SelectItem value="проведен">Проведен</SelectItem>
                                                    <SelectItem value="черновик">Черновик</SelectItem>
                                                    <SelectItem value="отменен">Отменен</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div
                                        className="px-0 pb-6"
                                        style={{
                                            height: '500px',
                                            overflowY: 'auto',
                                        }}
                                    >
                                        {documentsLoading ? (
                                            <div className="flex justify-center items-center h-32">
                                                <div>Загрузка документов...</div>
                                            </div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Дата</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Тип</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>№ Документа</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Контрагент/Описание</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Сумма</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Ответственный</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Действия</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {getFilteredDocuments().map((doc, index) => (
                                                        <TableRow key={`${doc.documentType}-${doc.id}-${index}`}>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                    {new Date(doc.displayDate).toLocaleDateString('ru-RU')}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {new Date(doc.displayDate).toLocaleTimeString('ru-RU')}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={getTypeColor(doc.type)}>{doc.type}</Badge>
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                {doc.displayNumber || 'Без номера'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {doc.displayCounterparty || 'Не указано'}
                                                            </TableCell>
                                                            <TableCell>
                  <span className={
                      doc.type === 'Приход' ? 'text-green-600 font-medium' :
                          doc.type === 'Расход' ? 'text-red-600 font-medium' :
                              doc.type === 'Списание' ? 'text-orange-600 font-medium' :
                                  'text-blue-600 font-medium'
                  }>
                    {doc.displayAmount > 0 ? `₽${doc.displayAmount.toLocaleString('ru-RU')}` : '-'}
                  </span>
                                                            </TableCell>
                                                            <TableCell>{doc.displayResponsible}</TableCell>
                                                            <TableCell>
                                                                <Badge className={getStatusColor(doc.displayStatus)}>
                                                                    {formatDocumentStatus(doc.displayStatus)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex gap-2">
                                                                    {renderViewButton(doc)}
                                                                    <Button variant="outline" size="sm">
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button variant="outline" size="sm" className="text-red-600">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}

                                        {!documentsLoading && getFilteredDocuments().length === 0 && (
                                            <div className="flex justify-center items-center h-32 text-muted-foreground">
                                                Нет документов по выбранным фильтрам
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="cash" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Card style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-primaryLine)',
                                        color: 'var(--custom-text)',
                                    }}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex items-center">
                                                <Wallet className="h-4 w-4 mr-2" />
                                                Общий баланс касс
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl text-orange-600">
                                                ₽{cashRegisters.reduce((sum, reg) => sum + reg.balance, 0).toLocaleString()}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-primaryLine)',
                                        color: 'var(--custom-text)',
                                    }}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex items-center">
                                                <CreditCard className="h-4 w-4 mr-2" />
                                                Активных касс
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl">
                                                {cashRegisters.filter(r => r.status === 'active').length}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-primaryLine)',
                                        color: 'var(--custom-text)',
                                    }}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex items-center">
                                                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                                                Внесений за день
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl text-green-600">
                                                ₽{cashOperations.filter(op => op.amount > 0).reduce((sum, op) => sum + op.amount, 0).toLocaleString()}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-primaryLine)',
                                        color: 'var(--custom-text)',
                                    }}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex items-center">
                                                <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
                                                Изъятий за день
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl text-red-600">
                                                ₽{Math.abs(cashOperations.filter(op => op.amount < 0).reduce((sum, op) => sum + op.amount, 0)).toLocaleString()}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card style={{
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-primaryLine)',
                                    color: 'var(--custom-text)',
                                }}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Кассы</CardTitle>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button className="bg-orange-600 hover:bg-orange-700">
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Добавить кассу
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Новая касса</DialogTitle>
                                                        <DialogDescription>
                                                            Создайте новую кассу для учета операций
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm">Название кассы</label>
                                                            <Input placeholder="Касса зала №1" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm">Начальный баланс</label>
                                                            <Input type="number" placeholder="0" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm">Ответственный</label>
                                                            <Select>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Выберите сотрудника" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="ivanov">Иванов И.И.</SelectItem>
                                                                    <SelectItem value="petrova">Петрова А.С.</SelectItem>
                                                                    <SelectItem value="sidorov">Сидоров П.К.</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <Button className="w-full">Создать кассу</Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Название</TableHead>
                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Баланс</TableHead>
                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Последний Z-отчет</TableHead>
                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Ответственный</TableHead>
                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Действия</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {cashRegisters.map((register) => (
                                                    <TableRow key={register.id}>
                                                        <TableCell>{register.name}</TableCell>
                                                        <TableCell className="text-orange-600">₽{register.balance.toLocaleString()}</TableCell>
                                                        <TableCell>{getStatusBadge(register.status)}</TableCell>
                                                        <TableCell>{register.lastZReport}</TableCell>
                                                        <TableCell>{register.responsible}</TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button size="sm" variant="outline">Z-отчет</Button>
                                                                <Button size="sm" variant="outline">Операции</Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>

                                <Card style={{
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-primaryLine)',
                                    color: 'var(--custom-text)',
                                }}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Операции по кассам</CardTitle>
                                            <Button variant="outline">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Добавить операцию
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Дата/Время</TableHead>
                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Тип операции</TableHead>
                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Касса</TableHead>
                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Сумма</TableHead>
                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Ответственный</TableHead>
                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Комментарий</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {cashOperations.map((operation) => (
                                                    <TableRow key={operation.id}>
                                                        <TableCell>{operation.date}</TableCell>
                                                        <TableCell>
                                                            <Badge className={operation.amount > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                                {operation.type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{operation.register}</TableCell>
                                                        <TableCell className={operation.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                                                            {operation.amount > 0 ? '+' : ''}₽{operation.amount.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>{operation.responsible}</TableCell>
                                                        <TableCell>{operation.comment}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="suppliers" className="space-y-6">
                                <Card style={{
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-primaryLine)',
                                    color: 'var(--custom-text)',
                                }}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Взаиморасчеты с поставщиками</CardTitle>
                                            <Button className="bg-orange-600 hover:bg-orange-700">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Новая оплата
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-3 gap-4 mb-6">
                                                <Card style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-primaryLine)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm">Общая задолженность</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-2xl text-red-600">
                                                            ₽{supplierPayments.reduce((sum, p) => sum + p.debt, 0).toLocaleString()}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-primaryLine)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm">Просроченных счетов</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-2xl text-orange-600">
                                                            {supplierPayments.filter(p => p.status === 'overdue').length}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-primaryLine)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm">Оплачено в месяц</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-2xl text-green-600">
                                                            ₽{supplierPayments.reduce((sum, p) => sum + p.paid, 0).toLocaleString()}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Поставщик</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Счет</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Сумма счета</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Оплачено</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Задолженность</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Срок оплаты</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Действия</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {supplierPayments.map((payment) => (
                                                        <TableRow key={payment.id}>
                                                            <TableCell>{payment.supplier}</TableCell>
                                                            <TableCell>{payment.invoice}</TableCell>
                                                            <TableCell>₽{payment.amount.toLocaleString()}</TableCell>
                                                            <TableCell className="text-green-600">₽{payment.paid.toLocaleString()}</TableCell>
                                                            <TableCell className={payment.debt > 0 ? 'text-red-600' : 'text-green-600'}>
                                                                ₽{payment.debt.toLocaleString()}
                                                            </TableCell>
                                                            <TableCell>{payment.dueDate}</TableCell>
                                                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                                            <TableCell>
                                                                <div className="flex gap-2">
                                                                    <Button size="sm" variant="outline">Оплатить</Button>
                                                                    <Button size="sm" variant="outline">История</Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="opex" className="space-y-6">
                                <Card style={{
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-primaryLine)',
                                    color: 'var(--custom-text)',
                                }}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Операционные расходы (OPEX)</CardTitle>
                                            <Button className="bg-orange-600 hover:bg-orange-700">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Добавить расход
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-4 gap-4 mb-6">
                                                <Card style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-primaryLine)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm">Всего расходов</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-2xl text-red-600">
                                                            ₽{opexExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-primaryLine)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm">Оплачено</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-2xl text-green-600">
                                                            ₽{opexExpenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-primaryLine)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm">Ожидается</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-2xl text-orange-600">
                                                            ₽{opexExpenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-primaryLine)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm">Категорий</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-2xl">
                                                            {new Set(opexExpenses.map(e => e.category)).size}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Дата</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Категория</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Получатель</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Сумма</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Счет</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Комментарий</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Действия</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {opexExpenses.map((expense) => (
                                                        <TableRow key={expense.id}>
                                                            <TableCell>{expense.date}</TableCell>
                                                            <TableCell>
                                                                <Badge className='text-white' variant="outline">{expense.category}</Badge>
                                                            </TableCell>
                                                            <TableCell>{expense.payee}</TableCell>
                                                            <TableCell className="text-red-600">₽{expense.amount.toLocaleString()}</TableCell>
                                                            <TableCell>{expense.account}</TableCell>
                                                            <TableCell>{getStatusBadge(expense.status)}</TableCell>
                                                            <TableCell className="text-sm text-muted-foreground">{expense.comment}</TableCell>
                                                            <TableCell>
                                                                <div className="flex gap-2">
                                                                    <Button size="sm" variant="outline">
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button size="sm" variant="outline">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="staff" className="space-y-6">
                                <Card style={{
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-primaryLine)',
                                    color: 'var(--custom-text)',
                                }}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Взаиморасчеты с сотрудниками</CardTitle>
                                            <Button className="bg-orange-600 hover:bg-orange-700">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Новая выплата
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-4 gap-4 mb-6">
                                                <Card style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-primaryLine)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm">Всего выплат</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-2xl text-orange-600">
                                                            ₽{staffPayments.filter(p => p.amount > 0).reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-primaryLine)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm">Выплачено</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-2xl text-green-600">
                                                            {staffPayments.filter(p => p.status === 'paid').length}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-primaryLine)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm">Ожидается</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-2xl text-blue-600">
                                                            {staffPayments.filter(p => p.status === 'pending').length}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-primaryLine)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm">Штрафов</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-2xl text-red-600">
                                                            ₽{Math.abs(staffPayments.filter(p => p.amount < 0).reduce((sum, p) => sum + p.amount, 0)).toLocaleString()}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Сотрудник</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Тип</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Дата</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Сумма</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Комментарий</TableHead>
                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Действия</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {staffPayments.map((payment) => (
                                                        <TableRow key={payment.id}>
                                                            <TableCell>{payment.employee}</TableCell>
                                                            <TableCell>
                                                                <Badge className='text-white' variant="outline">{payment.type}</Badge>
                                                            </TableCell>
                                                            <TableCell>{payment.date}</TableCell>
                                                            <TableCell className={payment.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                                                                {payment.amount > 0 ? '+' : ''}₽{payment.amount.toLocaleString()}
                                                            </TableCell>
                                                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                                            <TableCell className="text-sm text-muted-foreground">{payment.comment}</TableCell>
                                                            <TableCell>
                                                                <div className="flex gap-2">
                                                                    <Button size="sm" variant="outline">
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button size="sm" variant="outline">История</Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                        </Tabs>
                    </CardContent>
                </Card>
            </div>
    );
};

export default ViewDiteil;