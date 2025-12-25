import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "../../../ui/card";
import {AlertCircle, Edit, Plus, Printer, Trash2} from "lucide-react";
import {Label} from "../../../ui/label";
import {Input} from "../../../ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../../ui/select";
import {Button} from "../../../ui/button";
import {Switch} from "../../../ui/switch";
import {Separator} from "../../../ui/separator";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../../../ui/table";
import {Badge} from "../../../ui/badge";

const KitchenPrinter = ({editingPrinter,printerForm,setPrinterForm,getPrinterType,handleDeletePrinter,handleEditPrinter,handleAddPrinter,
                            resetPrinterForm,loadPrinters,printers,getPrinterLocation,getPrinterStatus,openEditPrinter}) => {
    return (
        <div>
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }} >
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Printer className="h-5 w-5" />
                        Кухонные принтеры
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <div className="font-medium text-blue-800">Настройка принтеров</div>
                                <div className="text-sm text-blue-700">
                                    Управление кухонными принтерами для печати заказов по различным цехам
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Форма добавления/редактирования принтера */}
                    <Card style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}
                          className={editingPrinter ? "border-2 border-orange-300" : "border-dashed border-2"}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {editingPrinter ? 'Редактировать принтер' : 'Добавить новый принтер'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="printerName">Название принтера *</Label>
                                    <Input
                                        id="printerName"
                                        placeholder="Принтер Горячий цех"
                                        value={printerForm.name}
                                        onChange={(e) => setPrinterForm(prev => ({ ...prev, name: e.target.value }))}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="printerLocation">Местоположение (кухня)</Label>
                                    <Input
                                        id="printerLocation"
                                        placeholder="Кухня - основной зал"
                                        value={printerForm.kitchen_name}
                                        onChange={(e) => setPrinterForm(prev => ({ ...prev, kitchen_name: e.target.value }))}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="printerIp">IP-адрес *</Label>
                                    <Input
                                        id="printerIp"
                                        placeholder="192.168.1.101"
                                        value={printerForm.ip_address}
                                        onChange={(e) => setPrinterForm(prev => ({ ...prev, ip_address: e.target.value }))}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="printerPort">Порт *</Label>
                                    <Input
                                        id="printerPort"
                                        placeholder="9100"
                                        value={printerForm.port}
                                        onChange={(e) => setPrinterForm(prev => ({ ...prev, port: e.target.value }))}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="printerType">Тип принтера</Label>
                                    <Select
                                        value={getPrinterType({
                                            ...printerForm,
                                            kitchen_name: printerForm.kitchen_name || ''
                                        })}
                                        onValueChange={(value) => {
                                            const kitchenNames = {
                                                kitchen: 'Основная кухня',
                                                bar: 'Бар',
                                                dessert: 'Кондитерский цех',
                                                receipt: 'Касса'
                                            };
                                            setPrinterForm(prev => ({
                                                ...prev,
                                                kitchen_name: kitchenNames[value as keyof typeof kitchenNames] || prev.kitchen_name
                                            }));
                                        }}
                                    >
                                        <SelectTrigger id="printerType"    style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}>
                                            <SelectValue placeholder="Выберите тип" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="kitchen">Кухонный</SelectItem>
                                            <SelectItem value="bar">Барный</SelectItem>
                                            <SelectItem value="dessert">Десертный</SelectItem>
                                            <SelectItem value="receipt">Чековый</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="printerStatus">Статус</Label>
                                    <Select
                                        value={printerForm.is_activ ? 'active' : 'inactive'}
                                        onValueChange={(value) => setPrinterForm(prev => ({
                                            ...prev,
                                            is_activ: value === 'active'
                                        }))}
                                    >
                                        <SelectTrigger id="printerStatus"    style={{
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
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    className="bg-orange-600 hover:bg-orange-700"
                                    onClick={editingPrinter ? handleEditPrinter : handleAddPrinter}
                                    disabled={!printerForm.name.trim() || !printerForm.ip_address.trim()}
                                >
                                    {editingPrinter ? (
                                        <>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Сохранить изменения
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Добавить принтер
                                        </>
                                    )}
                                </Button>
                                {editingPrinter && (
                                    <Button
                                        variant="outline"
                                        onClick={resetPrinterForm}
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
                                <p className="font-medium">Автоматическая печать</p>
                                <p className="text-sm text-muted-foreground">Печатать заказы автоматически при поступлении</p>
                            </div>
                            <Switch
                                checked={printerForm.autoPrint}
                                onCheckedChange={(checked) => setPrinterForm(prev => ({ ...prev, autoPrint: checked }))}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                            <div>
                                <p className="font-medium">Звуковой сигнал</p>
                                <p className="text-sm text-muted-foreground">Подавать звуковой сигнал при печати</p>
                            </div>
                            <Switch
                                checked={printerForm.soundSignal}
                                onCheckedChange={(checked) => setPrinterForm(prev => ({ ...prev, soundSignal: checked }))}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                            <div>
                                <p className="font-medium">Печать времени приготовления</p>
                                <p className="text-sm text-muted-foreground">Выводить ожидаемое время готовки на чеке</p>
                            </div>
                            <Switch
                                checked={printerForm.printCookingTime}
                                onCheckedChange={(checked) => setPrinterForm(prev => ({ ...prev, printCookingTime: checked }))}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Список принтеров */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Список принтеров</h3>
                            <Button
                                variant="outline"
                                onClick={loadPrinters}
                                size="sm"
                            >
                                Обновить список
                            </Button>
                        </div>

                        {printers.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border rounded-lg">
                                <Printer className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>Принтеры не настроены</p>
                                <p className="text-sm">Добавьте первый принтер используя форму выше</p>
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Название</TableHead>
                                            <TableHead>Местоположение</TableHead>
                                            <TableHead>IP-адрес</TableHead>
                                            <TableHead>Порт</TableHead>
                                            <TableHead>Статус</TableHead>
                                            <TableHead>Тип</TableHead>
                                            <TableHead>Действия</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {printers.map((printer) => (
                                            <TableRow key={printer.id} className={editingPrinter?.id === printer.id ? 'bg-blue-50' : ''}>
                                                <TableCell className="font-medium">{printer.name}</TableCell>
                                                <TableCell>{getPrinterLocation(printer)}</TableCell>
                                                <TableCell className="font-mono text-sm">{printer.ip_address}</TableCell>
                                                <TableCell className="font-mono text-sm">{printer.port}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            getPrinterStatus(printer) === 'online'
                                                                ? 'bg-green-500 hover:bg-green-600'
                                                                : 'bg-red-500 hover:bg-red-600'
                                                        }
                                                    >
                                                        {getPrinterStatus(printer)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            getPrinterType(printer) === 'kitchen'
                                                                ? 'border-blue-500 text-blue-700'
                                                                : getPrinterType(printer) === 'bar'
                                                                    ? 'border-purple-500 text-purple-700'
                                                                    : getPrinterType(printer) === 'dessert'
                                                                        ? 'border-pink-500 text-pink-700'
                                                                        : 'border-gray-500 text-gray-700'
                                                        }
                                                    >
                                                        {getPrinterType(printer)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openEditPrinter(printer)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeletePrinter(printer.id)}
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
                </CardContent>
            </Card>
        </div>
    );
};

export default KitchenPrinter;