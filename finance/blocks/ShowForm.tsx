import React from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Textarea } from '../../../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import {
    Plus,
    Trash2,
    Save,
    ArrowLeft,
} from 'lucide-react';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
const ShowForm = ({showIncomeForm,setNewIncome,selectedSalesPoint,
                      setShowIncomeForm,setNewIncomeItem, handleAddIncome,addIncomeLoading,newIncome ,handleIncomeInputChange,counterparties,
                      searchContainerRef,newIncomeItem,searchProducts,warehouses,pointsRetail,newExpense,setNewExpense,searchQuery,setSearchQuery,
                      setShowSearchResults,searchResults,showSearchResults,handleProductSelect,products,showExpenseForm,setShowExpenseForm,setNewExpenseItem,addExpenseLoading,
                      handleAddExpense,handleExpenseInputChange,newExpenseItem,newTransfer,getUnitName,showReturnForm,setShowReturnForm,setNewReturn,handleAddReturn,newReturn,
                      showWriteOffForm,setShowWriteOffForm,setNewWriteOff,setSearchQueryWriteOff, setShowSearchResultsWriteOff,setNewWriteOffItem,handleAddWriteOff,
                      newWriteOff,handleWriteOffInputChange,searchContainerRefWriteOff,newWriteOffItem, searchQueryWriteOff,searchProductsWriteOff,handleProductSelectWriteOff,
                      showSearchResultsWriteOff,showTransferForm,setNewTransfer,handleAddTransfer,setShowTransferForm}) => {
    return (
        <div>
            <div className="space-y-6">
                {showIncomeForm && (
                    <div>
                        <div className="mb-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowIncomeForm(false);
                                    setNewIncome({
                                        transaction_id: '',
                                        number_doc: '',
                                        ext_number_doc: '',
                                        user_id: '',
                                        counterparty_id: '',
                                        point_retail_id: selectedSalesPoint ? selectedSalesPoint.id.toString() : '',
                                        date_create: new Date().toISOString().slice(0, 16),
                                        date_approval: '',
                                        status: 'draft',
                                        warehouse_id: '',
                                        type_payment: 'cash',
                                        amount: '0',
                                        metadate: {},
                                        items: []
                                    });
                                    setNewIncomeItem({
                                        name: '',
                                        category: '',
                                        barcode: '',
                                        unit: '',
                                        packages: '',
                                        packageBarcode: '',
                                        qtyInPackage: '',
                                        totalQty: '',
                                        purchasePrice: '',
                                        vat: '',
                                        taxAmount: '',
                                        totalWithoutVat: '',
                                        expiryDate: ''
                                    });
                                }}
                                className="mb-4"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Назад
                            </Button>
                            <h2 className="text-xl text-white">Новый приходный документ</h2>
                            <p className="text-sm text-muted-foreground">Регистрация поступления денежных средств</p>
                        </div>
                        <div className="space-y-6">
                            <Card style={{
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-primaryLine)',
                                color: 'var(--custom-text)',
                            }}>
                                <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Информация о документе</CardTitle>
                                    <Button
                                        onClick={handleAddIncome}
                                        className="bg-green-600 hover:bg-green-700"
                                        disabled={addIncomeLoading}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {addIncomeLoading ? 'Сохранение...' : 'Сохранить'}
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Номер документа *</label>
                                            <Input
                                                placeholder="Введите номер"
                                                value={newIncome.number_doc}
                                                onChange={(e) => handleIncomeInputChange('number_doc', e.target.value)}
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Внешний номер документа</label>
                                            <Input
                                                placeholder="Внешний номер"
                                                value={newIncome.ext_number_doc}
                                                onChange={(e) => handleIncomeInputChange('ext_number_doc', e.target.value)}
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Контрагент *</label>
                                            <Select
                                                value={newIncome.counterparty_id}
                                                onValueChange={(value) => handleIncomeInputChange('counterparty_id', value)}
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            >
                                                <SelectTrigger    style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <SelectValue placeholder="Выберите контрагента" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {counterparties.map((counterparty) => (
                                                        <SelectItem key={counterparty.id} value={counterparty.id.toString()}>
                                                            {counterparty.Full_name || `Контрагент #${counterparty.id}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Склад *</label>
                                            <Select

                                                value={newIncome.warehouse_id}
                                                onValueChange={(value) => handleIncomeInputChange('warehouse_id', value)}
                                            >
                                                <SelectTrigger    style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <SelectValue placeholder="Выберите склад" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {warehouses.map((warehouse) => (
                                                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                            {warehouse.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Точка продаж</label>
                                            <Select

                                                value={newIncome.point_retail_id}
                                                onValueChange={(value) => handleIncomeInputChange('point_retail_id', value)}
                                            >
                                                <SelectTrigger    style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <SelectValue placeholder="Выберите точку" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {pointsRetail.map((point) => (
                                                        <SelectItem  key={point.id} value={point.id.toString()}>
                                                            {point.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Тип оплаты</label>
                                            <Select
                                                value={newIncome.type_payment}
                                                onValueChange={(value) => handleIncomeInputChange('type_payment', value)}
                                            >
                                                <SelectTrigger    style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <SelectValue placeholder="Выберите тип оплаты" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cash">Наличные</SelectItem>
                                                    <SelectItem value="card">Карта</SelectItem>
                                                    <SelectItem value="transfer">Перевод</SelectItem>
                                                    <SelectItem value="mixed">Смешанная</SelectItem>
                                                    <SelectItem value="credit">В кредит</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Статус</label>
                                            <Select
                                                value={newIncome.status}
                                                onValueChange={(value) => handleIncomeInputChange('status', value)}
                                            >
                                                <SelectTrigger    style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <SelectValue placeholder="Выберите статус" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Черновик</SelectItem>
                                                    <SelectItem value="approved">Проведен</SelectItem>
                                                    <SelectItem value="cancelled">Отменен</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Сумма</label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={newIncome.amount}
                                                onChange={(e) => handleIncomeInputChange('amount', e.target.value)}
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Дата создания</label>
                                            <Input
                                                type="datetime-local"
                                                value={newIncome.date_create}
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                                onChange={(e) => handleIncomeInputChange('date_create', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Дата подтверждения</label>
                                            <Input
                                                type="datetime-local"
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                                value={newIncome.date_approval}
                                                onChange={(e) => handleIncomeInputChange('date_approval', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card style={{
                                borderRadius: '20px',
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-secondaryLineCard)',
                                color: 'var(--custom-text)',
                            }}>
                                <CardHeader>
                                    <CardTitle>Товары</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className=" relative" style={{ minHeight: '400px', maxHeight: '600px', overflow: 'auto' }}>
                                        <Table >
                                            <TableHeader className=" sticky top-0 z-10" >
                                                <TableRow>
                                                    <TableHead className="w-[250px] min-w-[250px] bg-gray-50">Наименование товара</TableHead>
                                                    <TableHead className="min-w-[120px] bg-gray-50">Штрихкод</TableHead>
                                                    <TableHead className="min-w-[80px] bg-gray-50">Ед. изм.</TableHead>
                                                    <TableHead className="min-w-[100px] bg-gray-50">Упаковок</TableHead>
                                                    <TableHead className="min-w-[120px] bg-gray-50">Штрихкод упак.</TableHead>
                                                    <TableHead className="min-w-[120px] bg-gray-50">Кол-во в упак.</TableHead>
                                                    <TableHead className="min-w-[100px] bg-gray-50">Кол-во всего</TableHead>
                                                    <TableHead className="min-w-[120px] bg-gray-50">Закуп. цена</TableHead>
                                                    <TableHead className="min-w-[80px] bg-gray-50">НДС %</TableHead>
                                                    <TableHead className="min-w-[120px] bg-gray-50">Сумма налога</TableHead>
                                                    <TableHead className="min-w-[120px] bg-gray-50">Итого без НДС</TableHead>
                                                    <TableHead className="min-w-[120px] bg-gray-50">Срок годности</TableHead>
                                                    <TableHead className="w-[80px] bg-gray-50"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {newIncome.items.map((item, index) => (
                                                    <TableRow key={index} >
                                                        <TableCell className="font-medium py-3">{item.name}</TableCell>
                                                        <TableCell className="py-3">{item.barcode}</TableCell>
                                                        <TableCell className="py-3">{item.unit}</TableCell>
                                                        <TableCell className="py-3">{item.packages}</TableCell>
                                                        <TableCell className="py-3">{item.packageBarcode}</TableCell>
                                                        <TableCell className="py-3">{item.qtyInPackage}</TableCell>
                                                        <TableCell className="py-3 font-medium">{item.totalQty}</TableCell>
                                                        <TableCell className="py-3 text-green-600 font-medium">{item.purchasePrice}</TableCell>
                                                        <TableCell className="py-3">{item.vat}</TableCell>
                                                        <TableCell className="py-3">{item.taxAmount}</TableCell>
                                                        <TableCell className="py-3 font-medium">{item.totalWithoutVat}</TableCell>
                                                        <TableCell className="py-3">{item.expiryDate}</TableCell>
                                                        <TableCell className="py-3">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const newItems = newIncome.items.filter((_, i) => i !== index);
                                                                    setNewIncome({ ...newIncome, items: newItems });
                                                                }}
                                                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}

                                                <TableRow className=" sticky bottom-0 ">
                                                    <TableCell className="py-3">
                                                        <div className="relative" ref={searchContainerRef}>
                                                            <Input
                                                                placeholder="Начните вводить название товара..."
                                                                value={searchQuery}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    setSearchQuery(value);
                                                                    setNewIncomeItem({ ...newIncomeItem, name: value });
                                                                    searchProducts(value);
                                                                }}
                                                                onFocus={() => {
                                                                    if (searchQuery.length >= 1) {
                                                                        setShowSearchResults(true);
                                                                    }
                                                                }}
                                                                onBlur={() => {
                                                                    setTimeout(() => setShowSearchResults(false), 200);
                                                                }}
                                                                className="h-10 text-sm text-black"
                                                                style={{
                                                                    border: 'var(--custom-border-primary)',
                                                                    background: 'var(--custom-bg-inpyt)',
                                                                    color: 'var(--custom-text)',
                                                                }}
                                                            />
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            placeholder="Штрихкод"
                                                            value={newIncomeItem.barcode}
                                                            onChange={(e) => setNewIncomeItem({ ...newIncomeItem, barcode: e.target.value })}
                                                            className="h-10 text-sm"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            placeholder="шт"
                                                            value={newIncomeItem.unit}
                                                            onChange={(e) => setNewIncomeItem({ ...newIncomeItem, unit: e.target.value })}
                                                            className="h-10 text-sm"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            value={newIncomeItem.packages}
                                                            onChange={(e) => {
                                                                const packages = e.target.value;
                                                                const qtyInPackage = newIncomeItem.qtyInPackage;
                                                                const totalQty = packages && qtyInPackage ? String(Number(packages) * Number(qtyInPackage)) : '';
                                                                setNewIncomeItem({ ...newIncomeItem, packages, totalQty });
                                                            }}
                                                            className="h-10 text-sm"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            placeholder="Штрихкод"
                                                            value={newIncomeItem.packageBarcode}
                                                            onChange={(e) => setNewIncomeItem({ ...newIncomeItem, packageBarcode: e.target.value })}
                                                            className="h-10 text-sm"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            value={newIncomeItem.qtyInPackage}
                                                            onChange={(e) => {
                                                                const qtyInPackage = e.target.value;
                                                                const packages = newIncomeItem.packages;
                                                                const totalQty = packages && qtyInPackage ? String(Number(packages) * Number(qtyInPackage)) : '';
                                                                setNewIncomeItem({ ...newIncomeItem, qtyInPackage, totalQty });
                                                            }}
                                                            className="h-10 text-sm"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            value={newIncomeItem.totalQty}
                                                            onChange={(e) => setNewIncomeItem({ ...newIncomeItem, totalQty: e.target.value })}
                                                            className="h-10 text-sm"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            type="number"
                                                            placeholder="0.00"
                                                            value={newIncomeItem.purchasePrice}
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                            onChange={(e) => {
                                                                const price = e.target.value;
                                                                const vat = newIncomeItem.vat;
                                                                const totalQty = newIncomeItem.totalQty;
                                                                if (price && vat && totalQty) {
                                                                    const total = Number(price) * Number(totalQty);
                                                                    const taxAmount = String((total * Number(vat) / 100).toFixed(2));
                                                                    const totalWithoutVat = String((total - Number(taxAmount)).toFixed(2));
                                                                    setNewIncomeItem({ ...newIncomeItem, purchasePrice: price, taxAmount, totalWithoutVat });
                                                                } else {
                                                                    setNewIncomeItem({ ...newIncomeItem, purchasePrice: price });
                                                                }
                                                            }}
                                                            className="h-10 text-sm"
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                            type="number"
                                                            placeholder="0"
                                                            value={newIncomeItem.vat}
                                                            onChange={(e) => {
                                                                const vat = e.target.value;
                                                                const price = newIncomeItem.purchasePrice;
                                                                const totalQty = newIncomeItem.totalQty;
                                                                if (price && vat && totalQty) {
                                                                    const total = Number(price) * Number(totalQty);
                                                                    const taxAmount = String((total * Number(vat) / 100).toFixed(2));
                                                                    const totalWithoutVat = String((total - Number(taxAmount)).toFixed(2));
                                                                    setNewIncomeItem({ ...newIncomeItem, vat, taxAmount, totalWithoutVat });
                                                                } else {
                                                                    setNewIncomeItem({ ...newIncomeItem, vat });
                                                                }
                                                            }}
                                                            className="h-10 text-sm"
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                            placeholder="0.00"
                                                            value={newIncomeItem.taxAmount}
                                                            readOnly
                                                            className="h-10 text-sm bg-gray-100"
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                            placeholder="0.00"
                                                            value={newIncomeItem.totalWithoutVat}
                                                            readOnly
                                                            className="h-10 text-sm bg-gray-100"
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                            type="date"
                                                            value={newIncomeItem.expiryDate}
                                                            onChange={(e) => setNewIncomeItem({ ...newIncomeItem, expiryDate: e.target.value })}
                                                            className="h-10 text-sm"
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Button
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => {
                                                                if (newIncomeItem.name && newIncomeItem.totalQty && newIncomeItem.purchasePrice) {
                                                                    setNewIncome({
                                                                        ...newIncome,
                                                                        items: [...newIncome.items, newIncomeItem]
                                                                    });
                                                                    setNewIncomeItem({
                                                                        name: '',
                                                                        category: '',
                                                                        barcode: '',
                                                                        unit: '',
                                                                        packages: '',
                                                                        packageBarcode: '',
                                                                        qtyInPackage: '',
                                                                        totalQty: '',
                                                                        purchasePrice: '',
                                                                        vat: '',
                                                                        taxAmount: '',
                                                                        totalWithoutVat: '',
                                                                        expiryDate: ''
                                                                    });
                                                                    setSearchQuery('');
                                                                    setShowSearchResults(false);
                                                                } else {
                                                                    alert('Пожалуйста, заполните название, количество и цену товара');
                                                                }
                                                            }}
                                                            className="h-10 w-10 bg-green-600 hover:bg-green-700"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {showSearchResults && (
                                        <div
                                            className="fixed bg-white border border-gray-300 rounded-md shadow-lg z-[9999] max-h-60 overflow-y-auto"
                                            style={{
                                                top: searchContainerRef.current ? searchContainerRef.current.getBoundingClientRect().bottom + window.scrollY + 5 : 0,
                                                left: searchContainerRef.current ? searchContainerRef.current.getBoundingClientRect().left + window.scrollX : 0,
                                                width: searchContainerRef.current ? searchContainerRef.current.offsetWidth : 250
                                            }}
                                        >
                                            {searchResults.length > 0 ? (
                                                <>
                                                    <div className="px-3 py-2 bg-gray-50 border-b text-xs text-gray-500 sticky top-0">
                                                        Найдено {searchResults.length} товаров
                                                    </div>
                                                    {searchResults.map((product) => (
                                                        <div
                                                            key={product.id}
                                                            className="px-3 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                                                            onClick={() => {
                                                                handleProductSelect(product);
                                                                setShowSearchResults(false);
                                                            }}
                                                        >
                                                            <div className="font-medium text-sm">
                                                                {product.name}
                                                            </div>
                                                            <div className="text-xs text-gray-600 mt-1">
                                                                Цена: {product.purchase_price} ₽ |
                                                                Штрихкод: {product.barcode || 'нет'} |
                                                                Категория: {product.categories_products_id}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : searchQuery.length >= 1 ? (
                                                <div className="px-3 py-4 text-center text-gray-500">
                                                    <div>Товары не найдены для "{searchQuery}"</div>
                                                    <div className="text-xs mt-1">
                                                        Всего продуктов в базе: {products.length}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}

                                    {newIncome.items.length > 0 && (
                                        <div className="flex justify-end pt-4 border-t">
                                            <div className="space-y-2 min-w-[300px] bg-blue-50 p-4 rounded-lg">
                                                <div className="flex justify-between font-medium">
                                                    <span>Всего товаров:</span>
                                                    <span>{newIncome.items.length} позиций</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Общая сумма с НДС:</span>
                                                    <span className="font-medium">
              ₽{newIncome.items.reduce((sum, item) =>
                                                        sum + (Number(item.purchasePrice || 0) * Number(item.totalQty || 0)), 0
                                                    ).toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
            </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Сумма НДС:</span>
                                                    <span className="text-orange-600 font-medium">
              ₽{newIncome.items.reduce((sum, item) =>
                                                        sum + Number(item.taxAmount || 0), 0
                                                    ).toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
            </span>
                                                </div>
                                                <div className="flex justify-between border-t pt-2">
                                                    <span className="font-semibold">Итого без НДС:</span>
                                                    <span className="text-green-600 font-semibold text-lg">
              ₽{newIncome.items.reduce((sum, item) =>
                                                        sum + Number(item.totalWithoutVat || 0), 0
                                                    ).toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
            </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                        </div>
                    </div>
                )}

                {showExpenseForm && (
                    <div>
                        <div className="mb-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowExpenseForm(false);
                                    setNewExpense({
                                        transaction_id: '',
                                        number_doc: '',
                                        ext_number_doc: '',
                                        user_id: '',
                                        counterparty_id: '',
                                        point_retail_id: selectedSalesPoint ? selectedSalesPoint.id.toString() : '',
                                        date_create: new Date().toISOString().slice(0, 16),
                                        date_approval: '',
                                        status: 'draft',
                                        warehouse_id: '',
                                        type_payment: 'cash',
                                        amount: '0',
                                        metadate: {},
                                        items: []
                                    });
                                    setNewExpenseItem({
                                        name: '',
                                        category: '',
                                        barcode: '',
                                        unit: '',
                                        packages: '',
                                        packageBarcode: '',
                                        qtyInPackage: '',
                                        totalQty: '',
                                        purchasePrice: '',
                                        vat: '',
                                        taxAmount: '',
                                        totalWithoutVat: '',
                                        expiryDate: ''
                                    });
                                }}
                                className="mb-4"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Назад
                            </Button>
                            <h2 className="text-xl text-white">Новый расходный документ</h2>
                            <p className="text-sm text-muted-foreground">Регистрация расхода денежных средств</p>
                        </div>
                        <div className="space-y-6">
                            <Card style={{
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-primaryLine)',
                                color: 'var(--custom-text)',
                            }}>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Информация о документе</CardTitle>
                                    <Button
                                        onClick={handleAddExpense}
                                        className="bg-red-600 hover:bg-red-700"
                                        disabled={addExpenseLoading}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {addExpenseLoading ? 'Сохранение...' : 'Сохранить'}
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Внешний номер документа</label>
                                            <Input
                                                placeholder="Внешний номер"
                                                value={newExpense.ext_number_doc}
                                                onChange={(e) => handleExpenseInputChange('ext_number_doc', e.target.value)}
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Контрагент *</label>
                                            <Select
                                                value={newExpense.counterparty_id}
                                                onValueChange={(value) => handleExpenseInputChange('counterparty_id', value)}
                                            >
                                                <SelectTrigger    style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <SelectValue placeholder="Выберите контрагента" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {counterparties.map((counterparty) => (
                                                        <SelectItem     style={{
                                                            border: 'var(--custom-border-primary)',
                                                            background: 'var(--custom-bg-inpyt)',
                                                            color: 'var(--custom-text)',
                                                        }} key={counterparty.id} value={counterparty.id.toString()}>
                                                            {counterparty.Full_name || `Контрагент #${counterparty.id}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Склад *</label>
                                            <Select
                                                value={newExpense.warehouse_id}
                                                onValueChange={(value) => handleExpenseInputChange('warehouse_id', value)}
                                            >
                                                <SelectTrigger    style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <SelectValue placeholder="Выберите склад" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {warehouses.map((warehouse) => (
                                                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                            {warehouse.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Точка продаж</label>
                                            <Select
                                                value={newExpense.point_retail_id}
                                                onValueChange={(value) => handleExpenseInputChange('point_retail_id', value)}
                                            >
                                                <SelectTrigger    style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <SelectValue placeholder="Выберите точку" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {pointsRetail.map((point) => (
                                                        <SelectItem key={point.id} value={point.id.toString()}>
                                                            {point.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Тип оплаты</label>
                                            <Select
                                                value={newExpense.type_payment}
                                                onValueChange={(value) => handleExpenseInputChange('type_payment', value)}
                                            >
                                                <SelectTrigger    style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <SelectValue placeholder="Выберите тип оплаты" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cash">Наличные</SelectItem>
                                                    <SelectItem value="card">Карта</SelectItem>
                                                    <SelectItem value="transfer">Перевод</SelectItem>
                                                    <SelectItem value="mixed">Смешанная</SelectItem>
                                                    <SelectItem value="credit">В кредит</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Статус</label>
                                            <Select
                                                value={newExpense.status}
                                                onValueChange={(value) => handleExpenseInputChange('status', value)}
                                            >
                                                <SelectTrigger    style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <SelectValue placeholder="Выберите статус" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Черновик</SelectItem>
                                                    <SelectItem value="approved">Проведен</SelectItem>
                                                    <SelectItem value="cancelled">Отменен</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Сумма</label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={newExpense.amount}
                                                onChange={(e) => handleExpenseInputChange('amount', e.target.value)}
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Дата создания</label>
                                            <Input
                                                type="datetime-local"
                                                value={newExpense.date_create}
                                                onChange={(e) => handleExpenseInputChange('date_create', e.target.value)}
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Дата подтверждения</label>
                                            <Input
                                                type="datetime-local"
                                                value={newExpense.date_approval}
                                                onChange={(e) => handleExpenseInputChange('date_approval', e.target.value)}
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card style={{
                                borderRadius: '20px',
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-secondaryLineCard)',
                                color: 'var(--custom-text)',
                            }}>
                                <CardHeader>
                                    <CardTitle style={{color:'var(--custom-text)'}} className='text-white'>Товары</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="border rounded-lg relative" style={{ minHeight: '400px', maxHeight: '600px', overflow: 'auto' }}>
                                        <Table>
                                            <TableHeader className="bg-gray-50 sticky top-0 z-10">
                                                <TableRow>
                                                    <TableHead className="w-[250px] min-w-[250px] bg-gray-50">Наименование товара</TableHead>
                                                    <TableHead className="min-w-[120px] bg-gray-50">Штрихкод</TableHead>
                                                    <TableHead className="min-w-[80px] bg-gray-50">Ед. изм.</TableHead>
                                                    <TableHead className="min-w-[100px] bg-gray-50">Упаковок</TableHead>
                                                    <TableHead className="min-w-[120px] bg-gray-50">Штрихкод упак.</TableHead>
                                                    <TableHead className="min-w-[120px] bg-gray-50">Кол-во в упак.</TableHead>
                                                    <TableHead className="min-w-[100px] bg-gray-50">Кол-во всего</TableHead>
                                                    <TableHead className="min-w-[120px] bg-gray-50">Цена</TableHead>
                                                    <TableHead className="min-w-[80px] bg-gray-50">НДС %</TableHead>
                                                    <TableHead className="min-w-[120px] bg-gray-50">Сумма налога</TableHead>
                                                    <TableHead className="min-w-[120px] bg-gray-50">Итого без НДС</TableHead>
                                                    <TableHead className="min-w-[120px] bg-gray-50">Срок годности</TableHead>
                                                    <TableHead className="w-[80px] bg-gray-50"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {newExpense.items && newExpense.items.map((item, index) => (
                                                    <TableRow key={index} >
                                                        <TableCell className="font-medium py-3">{item.name}</TableCell>
                                                        <TableCell className="py-3">{item.barcode}</TableCell>
                                                        <TableCell className="py-3">{item.unit}</TableCell>
                                                        <TableCell className="py-3">{item.packages}</TableCell>
                                                        <TableCell className="py-3">{item.packageBarcode}</TableCell>
                                                        <TableCell className="py-3">{item.qtyInPackage}</TableCell>
                                                        <TableCell className="py-3 font-medium">{item.totalQty}</TableCell>
                                                        <TableCell className="py-3 text-red-600 font-medium">{item.purchasePrice}</TableCell>
                                                        <TableCell className="py-3">{item.vat}</TableCell>
                                                        <TableCell className="py-3">{item.taxAmount}</TableCell>
                                                        <TableCell className="py-3 font-medium">{item.totalWithoutVat}</TableCell>
                                                        <TableCell className="py-3">{item.expiryDate}</TableCell>
                                                        <TableCell className="py-3">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const newItems = newExpense.items.filter((_, i) => i !== index);
                                                                    setNewExpense({ ...newExpense, items: newItems });
                                                                }}
                                                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}

                                                <TableRow className=" sticky bottom-0 ">
                                                    <TableCell className="py-3">
                                                        <div className="relative" ref={searchContainerRef}>
                                                            <Input
                                                                placeholder="Начните вводить название товара..."
                                                                value={searchQuery}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    setSearchQuery(value);
                                                                    setNewExpenseItem({ ...newExpenseItem, name: value });
                                                                    searchProducts(value);
                                                                }}
                                                                onFocus={() => {
                                                                    if (searchQuery.length >= 1) {
                                                                        setShowSearchResults(true);
                                                                    }
                                                                }}
                                                                onBlur={() => {
                                                                    setTimeout(() => setShowSearchResults(false), 200);
                                                                }}
                                                                className="h-10 text-sm"
                                                                style={{
                                                                    border: 'var(--custom-border-primary)',
                                                                    background: 'var(--custom-bg-inpyt)',
                                                                    color: 'var(--custom-text)',
                                                                }}
                                                            />
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            placeholder="Штрихкод"
                                                            value={newExpenseItem.barcode}
                                                            onChange={(e) => setNewExpenseItem({ ...newExpenseItem, barcode: e.target.value })}
                                                            className="h-10 text-sm"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            placeholder="шт"
                                                            value={newExpenseItem.unit}
                                                            onChange={(e) => setNewExpenseItem({ ...newExpenseItem, unit: e.target.value })}
                                                            className="h-10 text-sm"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            value={newExpenseItem.packages}
                                                            onChange={(e) => {
                                                                const packages = e.target.value;
                                                                const qtyInPackage = newExpenseItem.qtyInPackage;
                                                                const totalQty = packages && qtyInPackage ? String(Number(packages) * Number(qtyInPackage)) : '';
                                                                setNewExpenseItem({ ...newExpenseItem, packages, totalQty });
                                                            }}
                                                            className="h-10 text-sm"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            placeholder="Штрихкод"
                                                            value={newExpenseItem.packageBarcode}
                                                            onChange={(e) => setNewExpenseItem({ ...newExpenseItem, packageBarcode: e.target.value })}
                                                            className="h-10 text-sm"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            value={newExpenseItem.qtyInPackage}
                                                            onChange={(e) => {
                                                                const qtyInPackage = e.target.value;
                                                                const packages = newExpenseItem.packages;
                                                                const totalQty = packages && qtyInPackage ? String(Number(packages) * Number(qtyInPackage)) : '';
                                                                setNewExpenseItem({ ...newExpenseItem, qtyInPackage, totalQty });
                                                            }}
                                                            className="h-10 text-sm"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            value={newExpenseItem.totalQty}
                                                            onChange={(e) => setNewExpenseItem({ ...newExpenseItem, totalQty: e.target.value })}
                                                            className="h-10 text-sm"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            type="number"
                                                            placeholder="0.00"
                                                            value={newExpenseItem.purchasePrice}
                                                            onChange={(e) => {
                                                                const price = e.target.value;
                                                                const vat = newExpenseItem.vat;
                                                                const totalQty = newExpenseItem.totalQty;
                                                                if (price && vat && totalQty) {
                                                                    const total = Number(price) * Number(totalQty);
                                                                    const taxAmount = String((total * Number(vat) / 100).toFixed(2));
                                                                    const totalWithoutVat = String((total - Number(taxAmount)).toFixed(2));
                                                                    setNewExpenseItem({ ...newExpenseItem, purchasePrice: price, taxAmount, totalWithoutVat });
                                                                } else {
                                                                    setNewExpenseItem({ ...newExpenseItem, purchasePrice: price });
                                                                }
                                                            }}
                                                            className="h-10 text-sm"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            value={newExpenseItem.vat}
                                                            onChange={(e) => {
                                                                const vat = e.target.value;
                                                                const price = newExpenseItem.purchasePrice;
                                                                const totalQty = newExpenseItem.totalQty;
                                                                if (price && vat && totalQty) {
                                                                    const total = Number(price) * Number(totalQty);
                                                                    const taxAmount = String((total * Number(vat) / 100).toFixed(2));
                                                                    const totalWithoutVat = String((total - Number(taxAmount)).toFixed(2));
                                                                    setNewExpenseItem({ ...newExpenseItem, vat, taxAmount, totalWithoutVat });
                                                                } else {
                                                                    setNewExpenseItem({ ...newExpenseItem, vat });
                                                                }
                                                            }}
                                                            className="h-10 text-sm"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            placeholder="0.00"
                                                            value={newExpenseItem.taxAmount}
                                                            readOnly
                                                            className="h-10 text-sm bg-gray-100"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            placeholder="0.00"
                                                            value={newExpenseItem.totalWithoutVat}
                                                            readOnly
                                                            className="h-10 text-sm bg-gray-100"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            type="date"
                                                            value={newExpenseItem.expiryDate}
                                                            onChange={(e) => setNewExpenseItem({ ...newExpenseItem, expiryDate: e.target.value })}
                                                            className="h-10 text-sm"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => {
                                                                if (newExpenseItem.name && newExpenseItem.totalQty && newExpenseItem.purchasePrice) {
                                                                    setNewExpense({
                                                                        ...newExpense,
                                                                        items: [...(newExpense.items || []), newExpenseItem]
                                                                    });
                                                                    setNewExpenseItem({
                                                                        name: '',
                                                                        category: '',
                                                                        barcode: '',
                                                                        unit: '',
                                                                        packages: '',
                                                                        packageBarcode: '',
                                                                        qtyInPackage: '',
                                                                        totalQty: '',
                                                                        purchasePrice: '',
                                                                        vat: '',
                                                                        taxAmount: '',
                                                                        totalWithoutVat: '',
                                                                        expiryDate: ''
                                                                    });
                                                                    setSearchQuery('');
                                                                    setShowSearchResults(false);
                                                                } else {
                                                                    alert('Пожалуйста, заполните название, количество и цену товара');
                                                                }
                                                            }}
                                                            className="h-10 w-10 bg-red-600 hover:bg-red-700"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {showSearchResults && (
                                        <div
                                            className="fixed bg-white border border-gray-300 rounded-md shadow-lg z-[9999] max-h-60 overflow-y-auto"
                                            style={{
                                                top: searchContainerRef.current ? searchContainerRef.current.getBoundingClientRect().bottom + window.scrollY + 5 : 0,
                                                left: searchContainerRef.current ? searchContainerRef.current.getBoundingClientRect().left + window.scrollX : 0,
                                                width: searchContainerRef.current ? searchContainerRef.current.offsetWidth : 250
                                            }}
                                        >
                                            {searchResults.length > 0 ? (
                                                <>
                                                    <div className="px-3 py-2 bg-gray-50 border-b text-xs text-gray-500 sticky top-0">
                                                        Найдено {searchResults.length} товаров
                                                    </div>
                                                    {searchResults.map((product) => (
                                                        <div
                                                            key={product.id}
                                                            className="px-3 py-3 hover:bg-red-50 cursor-pointer border-b last:border-b-0 transition-colors"
                                                            onClick={() => {
                                                                setNewExpenseItem({
                                                                    name: product.name,
                                                                    category: product.categories_products_id || '',
                                                                    barcode: product.barcode || '',
                                                                    unit: getUnitName(product.unit_id) || 'шт',
                                                                    packages: '',
                                                                    packageBarcode: '',
                                                                    qtyInPackage: '',
                                                                    totalQty: '1',
                                                                    purchasePrice: product.purchase_price || '0',
                                                                    vat: '',
                                                                    taxAmount: '',
                                                                    totalWithoutVat: '',
                                                                    expiryDate: product.expiration_date ? product.expiration_date.split('T')[0] : ''
                                                                });
                                                                setSearchQuery(product.name);
                                                                setShowSearchResults(false);
                                                            }}
                                                        >
                                                            <div className="font-medium text-sm">
                                                                {product.name}
                                                            </div>
                                                            <div className="text-xs text-gray-600 mt-1">
                                                                Цена: {product.purchase_price} ₽ |
                                                                Штрихкод: {product.barcode || 'нет'} |
                                                                Категория: {product.categories_products_id}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : searchQuery.length >= 1 ? (
                                                <div className="px-3 py-4 text-center text-gray-500">
                                                    <div>Товары не найдены для "{searchQuery}"</div>
                                                    <div className="text-xs mt-1">
                                                        Всего продуктов в базе: {products.length}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}

                                    {newExpense.items && newExpense.items.length > 0 && (
                                        <div className="flex justify-end pt-4 border-t">
                                            <div className="space-y-2 min-w-[300px] bg-red-50 p-4 rounded-lg">
                                                <div className="flex justify-between font-medium">
                                                    <span>Всего товаров:</span>
                                                    <span>{newExpense.items.length} позиций</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Общая сумма с НДС:</span>
                                                    <span className="font-medium">
                  ₽{newExpense.items.reduce((sum, item) =>
                                                        sum + (Number(item.purchasePrice || 0) * Number(item.totalQty || 0)), 0
                                                    ).toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Сумма НДС:</span>
                                                    <span className="text-orange-600 font-medium">
                  ₽{newExpense.items.reduce((sum, item) =>
                                                        sum + Number(item.taxAmount || 0), 0
                                                    ).toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                </span>
                                                </div>
                                                <div className="flex justify-between border-t pt-2">
                                                    <span className="font-semibold">Итого без НДС:</span>
                                                    <span className="text-red-600 font-semibold text-lg">
                  ₽{newExpense.items.reduce((sum, item) =>
                                                        sum + Number(item.totalWithoutVat || 0), 0
                                                    ).toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {showReturnForm && (
                    <div>
                        <div className="mb-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowReturnForm(false);
                                    setNewReturn({ counterparty: '', category: '', amount: '', account: '', comment: '' });
                                }}
                                className="mb-4"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Назад
                            </Button>
                            <h2 className="text-xl">Новый документ возврата</h2>
                            <p className="text-sm text-muted-foreground">Регистрация возврата денежных средств или товаров</p>
                        </div>
                        <div className="max-w-4xl">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Информация о возврате</CardTitle>
                                    <Button onClick={handleAddReturn} className="bg-yellow-600 hover:bg-yellow-700">
                                        <Save className="h-4 w-4 mr-2" />
                                        Сохранить
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Контрагент *</label>
                                            <Input
                                                placeholder="Название контрагента"
                                                value={newReturn.counterparty}
                                                onChange={(e) => setNewReturn({ ...newReturn, counterparty: e.target.value })}
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Категория *</label>
                                            <Select value={newReturn.category} onValueChange={(value) => setNewReturn({ ...newReturn, category: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите категорию" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Возврат поставщику">Возврат поставщику</SelectItem>
                                                    <SelectItem value="Возврат гостю">Возврат гостю</SelectItem>
                                                    <SelectItem value="Возврат за отмененный заказ">Возврат за отмененный заказ</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Сумма (₽) *</label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={newReturn.amount}
                                                onChange={(e) => setNewReturn({ ...newReturn, amount: e.target.value })}
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Счет *</label>
                                            <Select value={newReturn.account} onValueChange={(value) => setNewReturn({ ...newReturn, account: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите счет" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Касса основная">Касса основная</SelectItem>
                                                    <SelectItem value="Касса бара">Касса бара</SelectItem>
                                                    <SelectItem value="Расчетный счет">Расчетный счет</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Комментарий</label>
                                        <Textarea
                                            placeholder="Причина возврата"
                                            value={newReturn.comment}
                                            onChange={(e) => setNewReturn({ ...newReturn, comment: e.target.value })}
                                            rows={4}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {showWriteOffForm && (
                    <div>
                        <div className="mb-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowWriteOffForm(false);
                                    setNewWriteOff({
                                        point_retail_id: selectedSalesPoint ? selectedSalesPoint.id.toString() : '',
                                        warehouse_id: '',
                                        reason_write_off: '',
                                        date_create: new Date().toISOString().slice(0, 16),
                                        date_approval: '',
                                        metadate: {},
                                        items: []
                                    });
                                    setNewWriteOffItem({
                                        name: '',
                                        barcode: '',
                                        article: '',
                                        unit: '',
                                        total: ''
                                    });
                                    setSearchQueryWriteOff('');
                                    setShowSearchResultsWriteOff(false);
                                }}
                                className="mb-4"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Назад
                            </Button>
                            <h2 className="text-xl text-white">Новый акт списания</h2>
                            <p className="text-sm text-muted-foreground">Регистрация списания товаров со склада</p>
                        </div>
                        <div className="space-y-6">
                            <Card style={{
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-primaryLine)',
                                color: 'var(--custom-text)',
                            }}>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Информация о документе</CardTitle>
                                    <Button onClick={handleAddWriteOff} className="bg-orange-600 hover:bg-orange-700">
                                        <Save className="h-4 w-4 mr-2" />
                                        Сохранить
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Точка продаж *</label>
                                            <Select
                                                value={newWriteOff.point_retail_id}
                                                onValueChange={(value) => handleWriteOffInputChange('point_retail_id', value)}
                                            >
                                                <SelectTrigger    style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <SelectValue placeholder="Выберите точку" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.isArray(pointsRetail) && pointsRetail.map((point) => (
                                                        <SelectItem key={point.id} value={point.id.toString()}>
                                                            {point.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Склад *</label>
                                            <Select
                                                value={newWriteOff.warehouse_id}
                                                onValueChange={(value) => handleWriteOffInputChange('warehouse_id', value)}
                                            >
                                                <SelectTrigger    style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <SelectValue placeholder="Выберите склад" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.isArray(warehouses) && warehouses.map((warehouse) => (
                                                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                            {warehouse.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2 col-span-2">
                                            <label className="text-sm font-medium">Причина списания *</label>
                                            <Select
                                                value={newWriteOff.reason_write_off}
                                                onValueChange={(value) => handleWriteOffInputChange('reason_write_off', value)}
                                            >
                                                <SelectTrigger    style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}>
                                                    <SelectValue placeholder="Выберите причину" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Порча продуктов">Порча продуктов</SelectItem>
                                                    <SelectItem value="Истек срок годности">Истек срок годности</SelectItem>
                                                    <SelectItem value="Потери">Потери</SelectItem>
                                                    <SelectItem value="Бой посуды">Бой посуды</SelectItem>
                                                    <SelectItem value="Прочее списание">Прочее списание</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Дата создания *</label>
                                            <Input
                                                type="datetime-local"
                                                value={newWriteOff.date_create}
                                                onChange={(e) => handleWriteOffInputChange('date_create', e.target.value)}
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Дата подтверждения</label>
                                            <Input
                                                type="datetime-local"
                                                value={newWriteOff.date_approval}
                                                onChange={(e) => handleWriteOffInputChange('date_approval', e.target.value)}
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card style={{
                                borderRadius: '20px',
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-secondaryLineCard)',
                                color: 'var(--custom-text)',
                            }} >
                                <CardHeader>
                                    <CardTitle style={{color:'var(--custom-text)'}} className='text-white'>Товары для списания</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="border rounded-lg relative" style={{ minHeight: '400px', maxHeight: '600px', overflow: 'auto' }}>
                                        <Table>
                                            <TableHeader className="bg-gray-50 sticky top-0 z-10">
                                                <TableRow>
                                                    <TableHead className="w-[300px] min-w-[300px] bg-gray-50">Наименование товара</TableHead>
                                                    <TableHead className="min-w-[120px] bg-gray-50">Штрихкод</TableHead>
                                                    <TableHead className="min-w-[100px] bg-gray-50">Артикль</TableHead>
                                                    <TableHead className="min-w-[80px] bg-gray-50">Ед. изм.</TableHead>
                                                    <TableHead className="min-w-[100px] bg-gray-50">Количество</TableHead>
                                                    <TableHead className="w-[80px] bg-gray-50"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {newWriteOff.items && newWriteOff.items.map((item, index) => (
                                                    <TableRow key={index} >
                                                        <TableCell className="font-medium py-3">{item.name}</TableCell>
                                                        <TableCell className="py-3">{item.barcode}</TableCell>
                                                        <TableCell className="py-3">{item.article}</TableCell>
                                                        <TableCell className="py-3">{item.unit}</TableCell>
                                                        <TableCell className="py-3 font-medium">{item.total}</TableCell>
                                                        <TableCell className="py-3">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const newItems = newWriteOff.items.filter((_, i) => i !== index);
                                                                    setNewWriteOff({ ...newWriteOff, items: newItems });
                                                                }}
                                                                className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}

                                                <TableRow className=" border-orange-200 sticky bottom-0 ">
                                                    <TableCell className="py-3">
                                                        <div className="relative" ref={searchContainerRefWriteOff}>
                                                            <Input
                                                                placeholder="Начните вводить название товара..."
                                                                value={searchQueryWriteOff}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    setSearchQueryWriteOff(value);
                                                                    setNewWriteOffItem({ ...newWriteOffItem, name: value });

                                                                    searchProductsWriteOff(value);
                                                                }}
                                                                onFocus={() => {
                                                                    if (searchQueryWriteOff.length >= 1) {
                                                                        setShowSearchResultsWriteOff(true);
                                                                    }
                                                                }}
                                                                style={{
                                                                    border: 'var(--custom-border-primary)',
                                                                    background: 'var(--custom-bg-inpyt)',
                                                                    color: 'var(--custom-text)',
                                                                }}
                                                                onBlur={() => {
                                                                    setTimeout(() => setShowSearchResultsWriteOff(false), 200);
                                                                }}
                                                                className="h-10 text-sm"
                                                            />
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            placeholder="Штрихкод"
                                                            value={newWriteOffItem.barcode}
                                                            onChange={(e) => setNewWriteOffItem({ ...newWriteOffItem, barcode: e.target.value })}
                                                            className="h-10 text-sm"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            placeholder="Артикль"
                                                            value={newWriteOffItem.article}
                                                            onChange={(e) => setNewWriteOffItem({ ...newWriteOffItem, article: e.target.value })}
                                                            className="h-10 text-sm"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            placeholder="шт"
                                                            value={newWriteOffItem.unit}
                                                            onChange={(e) => setNewWriteOffItem({ ...newWriteOffItem, unit: e.target.value })}
                                                            className="h-10 text-sm"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            value={newWriteOffItem.total}
                                                            onChange={(e) => setNewWriteOffItem({ ...newWriteOffItem, total: e.target.value })}
                                                            className="h-10 text-sm"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </TableCell>

                                                    <TableCell className="py-3">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => {
                                                                if (newWriteOffItem.name && newWriteOffItem.total) {
                                                                    setNewWriteOff({
                                                                        ...newWriteOff,
                                                                        items: [...(newWriteOff.items || []), newWriteOffItem]
                                                                    });
                                                                    setNewWriteOffItem({
                                                                        name: '',
                                                                        barcode: '',
                                                                        article: '',
                                                                        unit: '',
                                                                        total: ''
                                                                    });
                                                                    setSearchQueryWriteOff('');
                                                                    setShowSearchResultsWriteOff(false);
                                                                } else {
                                                                    alert('Пожалуйста, заполните название и количество товара');
                                                                }
                                                            }}
                                                            className="h-10 w-10 bg-orange-600 hover:bg-orange-700"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {showSearchResultsWriteOff && (
                                        <div
                                            className="fixed bg-white border border-gray-300 rounded-md shadow-lg z-[9999] max-h-60 overflow-y-auto"
                                            style={{
                                                top: searchContainerRefWriteOff.current ? searchContainerRefWriteOff.current.getBoundingClientRect().bottom + window.scrollY + 5 : 0,
                                                left: searchContainerRefWriteOff.current ? searchContainerRefWriteOff.current.getBoundingClientRect().left + window.scrollX : 0,
                                                width: searchContainerRefWriteOff.current ? searchContainerRefWriteOff.current.offsetWidth : 300
                                            }}
                                        >
                                            {searchResults.length > 0 ? (
                                                <>
                                                    <div className="px-3 py-2 bg-gray-50 border-b text-xs text-gray-500 sticky top-0">
                                                        Найдено {searchResults.length} товаров
                                                    </div>
                                                    {searchResults.map((product) => (
                                                        <div
                                                            key={product.id}
                                                            className="px-3 py-3 hover:bg-orange-50 cursor-pointer border-b last:border-b-0 transition-colors"
                                                            onClick={() => {
                                                                handleProductSelectWriteOff(product);
                                                            }}
                                                        >
                                                            <div className="font-medium text-sm">
                                                                {product.name}
                                                            </div>
                                                            <div className="text-xs text-gray-600 mt-1">
                                                                Штрихкод: {product.barcode || 'нет'} |
                                                                Артикль: {product.article || 'нет'} |
                                                                Ед. изм.: {getUnitName(product.unit_id) || 'шт'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : searchQueryWriteOff.length >= 1 ? (
                                                <div className="px-3 py-4 text-center text-gray-500">
                                                    <div>Товары не найдены для "{searchQueryWriteOff}"</div>
                                                    <div className="text-xs mt-1">
                                                        Всего продуктов в базе: {products.length}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}

                                    {newWriteOff.items && newWriteOff.items.length > 0 && (
                                        <div className="flex justify-end pt-4 border-t">
                                            <div className="space-y-2 min-w-[300px] bg-orange-50 p-4 rounded-lg">
                                                <div className="flex justify-between font-medium">
                                                    <span>Всего товаров:</span>
                                                    <span>{newWriteOff.items.length} позиций</span>
                                                </div>
                                                <div className="flex justify-between border-t pt-2">
                                                    <span className="font-semibold">Общее количество:</span>
                                                    <span className="text-orange-600 font-semibold text-lg">
                  {newWriteOff.items.reduce((sum, item) =>
                      sum + Number(item.total || 0), 0
                  )} единиц
                </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {showTransferForm && (
                    <div>
                        <div className="mb-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowTransferForm(false);
                                    setNewTransfer({ fromAccount: '', toAccount: '', amount: '', comment: '' });
                                }}
                                className="mb-4"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Назад
                            </Button>
                            <h2 className="text-xl">Новый документ перемещения</h2>
                            <p className="text-sm text-muted-foreground">Перемещение средств между счетами и кассами</p>
                        </div>
                        <div className="max-w-4xl">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Информация о перемещении</CardTitle>
                                    <Button onClick={handleAddTransfer} className="bg-blue-600 hover:bg-blue-700">
                                        <Save className="h-4 w-4 mr-2" />
                                        Сохранить
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Откуда *</label>
                                            <Select value={newTransfer.fromAccount} onValueChange={(value) => setNewTransfer({ ...newTransfer, fromAccount: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите счет" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Касса основная">Касса основная</SelectItem>
                                                    <SelectItem value="Касса бара">Касса бара</SelectItem>
                                                    <SelectItem value="Расчетный счет">Расчетный счет</SelectItem>
                                                    <SelectItem value="Касса доставки">Касса доставки</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Куда *</label>
                                            <Select value={newTransfer.toAccount} onValueChange={(value) => setNewTransfer({ ...newTransfer, toAccount: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите счет" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Касса основная">Касса основная</SelectItem>
                                                    <SelectItem value="Касса бара">Касса бара</SelectItem>
                                                    <SelectItem value="Расчетный счет">Расчетный счет</SelectItem>
                                                    <SelectItem value="Касса доставки">Касса доставки</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Сумма (₽) *</label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={newTransfer.amount}
                                            onChange={(e) => setNewTransfer({ ...newTransfer, amount: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Комментарий</label>
                                        <Textarea
                                            placeholder="Назначение перемещения"
                                            value={newTransfer.comment}
                                            onChange={(e) => setNewTransfer({ ...newTransfer, comment: e.target.value })}
                                            rows={4}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShowForm;