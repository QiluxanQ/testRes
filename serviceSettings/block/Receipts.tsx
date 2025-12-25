import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { AlertCircle, Edit, Plus, Receipt, Trash2 } from "lucide-react";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Button } from "../../../ui/button";
import { Switch } from "../../../ui/switch";
import { Separator } from "../../../ui/separator";
import { Badge } from "../../../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table";

interface ReceiptSettings {
    id: number;
    point_retail_id: number;
    name: string;
    type: string;
    vat: string;
    is_activ: boolean;
    metadate: {
        receiptFormat: string;
        receiptCopies: number;
        receiptTitle: string;
        receiptFooter: string;
        receiptPhone: string;
        receiptWebsite: string;
        showQrCode: boolean;
        autoPrintReceipt: boolean;
        printPrecheck: boolean;
        showDiscounts: boolean;
        showWaiter: boolean;
        emailReceipts: boolean;
    };
}

interface ReceiptsProps {
    editingReceipt: ReceiptSettings | null;
    receiptForm: any;
    setReceiptForm: (form: any) => void;
    handleDeleteReceipt: (id: number) => void;
    handleEditReceipt: () => void;
    handleAddReceipt: () => void;
    resetReceiptForm: () => void;
    loadReceipts: () => void;
    receipts: ReceiptSettings[];
    getReceiptStatus: (receipt: ReceiptSettings) => string;
    openEditReceipt: (receipt: ReceiptSettings) => void;
    handleReceiptChange: (field: string, value: any) => void;
    isReceiptChanged: boolean;
    handleSaveReceipt: () => void;
    check: ReceiptSettings[];
}

const Receipts = ({
                      editingReceipt,
                      receiptForm,
                      setReceiptForm,
                      handleDeleteReceipt,
                      handleEditReceipt,
                      handleAddReceipt,
                      resetReceiptForm,
                      loadReceipts,
                      receipts,
                      getReceiptStatus,
                      openEditReceipt,
                      handleReceiptChange,
                      isReceiptChanged,
                      handleSaveReceipt,
                      check
                  }: ReceiptsProps) => {
    return (
        <div>
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Настройка чеков
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <div className="font-medium text-blue-800">Настройка чеков и предчеков</div>
                                <div className="text-sm text-blue-700">
                                    Управление форматом и содержимым чеков и предчеков
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Форма добавления/редактирования настроек чеков */}
                    <Card style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}
                          className={editingReceipt ? "border-2 border-orange-300" : "border-dashed border-2"}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {editingReceipt ? 'Редактировать настройки чеков' : 'Добавить новые настройки чеков'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="receiptName">Название настроек *</Label>
                                    <Input
                                        id="receiptName"
                                        placeholder="Основные настройки чеков"
                                        value={receiptForm.name}
                                        onChange={(e) => handleReceiptChange('name', e.target.value)}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="receiptType">Тип *</Label>
                                    <Select
                                        value={receiptForm.type}
                                        onValueChange={(value) => handleReceiptChange('type', value)}
                                    >
                                        <SelectTrigger id="receiptType"    style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}>
                                            <SelectValue placeholder="Выберите тип" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="receipt">Чек</SelectItem>
                                            <SelectItem value="precheck">Предчек</SelectItem>
                                            <SelectItem value="report">Отчет</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="receiptVat">Ставка НДС *</Label>
                                    <Select
                                        value={receiptForm.vat}
                                        onValueChange={(value) => handleReceiptChange('vat', value)}
                                    >
                                        <SelectTrigger id="receiptVat"    style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}>
                                            <SelectValue placeholder="Выберите ставку" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">0%</SelectItem>
                                            <SelectItem value="10">10%</SelectItem>
                                            <SelectItem value="20">20%</SelectItem>
                                            <SelectItem value="-1">Не облагается</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="receiptStatus">Статус *</Label>
                                    <Select
                                        value={receiptForm.is_activ ? 'active' : 'inactive'}
                                        onValueChange={(value) => handleReceiptChange('is_activ', value === 'active')}
                                    >
                                        <SelectTrigger id="receiptStatus"    style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}>
                                            <SelectValue placeholder="Выберите статус" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Активен</SelectItem>
                                            <SelectItem value="inactive">Неактивен</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="receiptTitle">Заголовок чека</Label>
                                    <Input
                                        id="receiptTitle"
                                        placeholder="Ресторан 'Вкусно'"
                                        value={receiptForm.metadate?.receiptTitle || ''}
                                        onChange={(e) => handleReceiptChange('metadate', {
                                            ...receiptForm.metadate,
                                            receiptTitle: e.target.value
                                        })}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="receiptFormat">Формат чека</Label>
                                    <Select
                                        value={receiptForm.metadate?.receiptFormat || 'thermal_80'}
                                        onValueChange={(value) => handleReceiptChange('metadate', {
                                            ...receiptForm.metadate,
                                            receiptFormat: value
                                        })}
                                    >
                                        <SelectTrigger id="receiptFormat"    style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}>
                                            <SelectValue placeholder="Выберите формат" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="thermal_58">Термопечать 58мм</SelectItem>
                                            <SelectItem value="thermal_80">Термопечать 80мм</SelectItem>
                                            <SelectItem value="a4">A4 лист</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="receiptCopies">Количество копий</Label>
                                    <Input
                                        id="receiptCopies"
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={receiptForm.metadate?.receiptCopies || 1}
                                        onChange={(e) => handleReceiptChange('metadate', {
                                            ...receiptForm.metadate,
                                            receiptCopies: parseInt(e.target.value) || 1
                                        })}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="receiptPhone">Телефон на чеке</Label>
                                    <Input
                                        id="receiptPhone"
                                        placeholder="+7 (495) 123-45-67"
                                        value={receiptForm.metadate?.receiptPhone || ''}
                                        onChange={(e) => handleReceiptChange('metadate', {
                                            ...receiptForm.metadate,
                                            receiptPhone: e.target.value
                                        })}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="receiptFooter">Текст в конце чека</Label>
                                    <Input
                                        id="receiptFooter"
                                        placeholder="Спасибо за покупку! Ждем Вас снова!"
                                        value={receiptForm.metadate?.receiptFooter || ''}
                                        onChange={(e) => handleReceiptChange('metadate', {
                                            ...receiptForm.metadate,
                                            receiptFooter: e.target.value
                                        })}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="receiptWebsite">Веб-сайт</Label>
                                    <Input
                                        id="receiptWebsite"
                                        placeholder="www.restaurant.ru"
                                        value={receiptForm.metadate?.receiptWebsite || ''}
                                        onChange={(e) => handleReceiptChange('metadate', {
                                            ...receiptForm.metadate,
                                            receiptWebsite: e.target.value
                                        })}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    className="bg-orange-600 hover:bg-orange-700"
                                    onClick={editingReceipt ? handleEditReceipt : handleAddReceipt}
                                    disabled={!receiptForm.name.trim() || !receiptForm.type.trim()}
                                >
                                    {editingReceipt ? (
                                        <>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Сохранить изменения
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Добавить настройки
                                        </>
                                    )}
                                </Button>
                                {editingReceipt && (
                                    <Button
                                        variant="outline"
                                        onClick={resetReceiptForm}
                                    >
                                        Отмена
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Дополнительные настройки */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                            <div>
                                <p className="font-medium">Автоматическая печать чека</p>
                                <p className="text-sm text-muted-foreground">Печатать чек сразу после оплаты</p>
                            </div>
                            <Switch
                                checked={receiptForm.metadate?.autoPrintReceipt || true}
                                onCheckedChange={(checked) => handleReceiptChange('metadate', {
                                    ...receiptForm.metadate,
                                    autoPrintReceipt: checked
                                })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                            <div>
                                <p className="font-medium">Печать предчека перед оплатой</p>
                                <p className="text-sm text-muted-foreground">Выводить предчек для уточнения заказа</p>
                            </div>
                            <Switch
                                checked={receiptForm.metadate?.printPrecheck || true}
                                onCheckedChange={(checked) => handleReceiptChange('metadate', {
                                    ...receiptForm.metadate,
                                    printPrecheck: checked
                                })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                            <div>
                                <p className="font-medium">Показывать QR-код</p>
                                <p className="text-sm text-muted-foreground">QR-код для проверки чека на сайте ФНС</p>
                            </div>
                            <Switch
                                checked={receiptForm.metadate?.showQrCode || true}
                                onCheckedChange={(checked) => handleReceiptChange('metadate', {
                                    ...receiptForm.metadate,
                                    showQrCode: checked
                                })}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Список настроек чеков */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Список настроек чеков</h3>
                            <Button
                                variant="outline"
                                onClick={loadReceipts}
                                size="sm"
                            >
                                Обновить список
                            </Button>
                        </div>

                        {check.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border rounded-lg">
                                <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>Настройки чеков не добавлены</p>
                                <p className="text-sm">Добавьте первые настройки чеков используя форму выше</p>
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Название</TableHead>
                                            <TableHead>Тип</TableHead>
                                            <TableHead>VAT</TableHead>
                                            <TableHead>Статус</TableHead>
                                            <TableHead>Формат</TableHead>
                                            <TableHead>Заголовок</TableHead>
                                            <TableHead>Телефон</TableHead>
                                            <TableHead>Действия</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {check.map((receipt) => (
                                            <TableRow key={receipt.id} className={editingReceipt?.id === receipt.id ? 'bg-blue-50' : ''}>
                                                <TableCell className="font-medium">{receipt.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {receipt.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {receipt.vat === '0' ? '0%' :
                                                            receipt.vat === '10' ? '10%' :
                                                                receipt.vat === '20' ? '20%' : 'Не облагается'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            receipt.is_activ
                                                                ? 'bg-green-500 hover:bg-green-600'
                                                                : 'bg-red-500 hover:bg-red-600'
                                                        }
                                                    >
                                                        {receipt.is_activ ? 'Активен' : 'Неактивен'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {receipt.metadate?.receiptFormat === 'thermal_58' ? '58мм' :
                                                        receipt.metadate?.receiptFormat === 'thermal_80' ? '80мм' : 'A4'}
                                                </TableCell>
                                                <TableCell>{receipt.metadate?.receiptTitle || '-'}</TableCell>
                                                <TableCell>{receipt.metadate?.receiptPhone || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openEditReceipt(receipt)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteReceipt(receipt.id)}
                                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button
                            className="bg-orange-600 hover:bg-orange-700"
                            onClick={handleSaveReceipt}
                            disabled={!isReceiptChanged}
                        >
                            Сохранить все настройки
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                loadReceipts();
                                resetReceiptForm();
                            }}
                            disabled={!isReceiptChanged}
                        >
                            Отменить изменения
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Receipts;