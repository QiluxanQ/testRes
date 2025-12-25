import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { AlertCircle, Edit, Plus, Trash2, Wine } from "lucide-react";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Button } from "../../../ui/button";
import { Switch } from "../../../ui/switch";
import { Separator } from "../../../ui/separator";
import { Badge } from "../../../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table";

interface EgaisSettings {
    id: number;
    point_retail_id: number;
    name: string;
    ip_address: string;
    port: string;
    is_activ: boolean;
    metadate: {
        egaisUrl: string;
        egaisLogin: string;
        egaisPassword: string;
        fsrarId: string;
        egaisOrgType: string;
        enableIntegration: boolean;
        autoSendTtn: boolean;
        checkBalance: boolean;
        recordSales: boolean;
        syncInterval: string;
    };
}

interface EgaisProps {
    editingEgais: EgaisSettings | null;
    egaisForm: any;
    setEgaisForm: (form: any) => void;
    handleDeleteEgais: (id: number) => void;
    handleEditEgais: () => void;
    handleAddEgais: () => void;
    resetEgaisForm: () => void;
    loadEgais: () => void;
    egaisList: EgaisSettings[];
    getEgaisStatus: (egais: EgaisSettings) => string;
    openEditEgais: (egais: EgaisSettings) => void;
    handleEgaisChange: (field: string, value: any) => void;
    isEgaisChanged: boolean;
    handleSaveEgais: () => void;
    handleTestConnection: () => void;
}

const Egais = ({
                   editingEgais,
                   egaisForm,
                   setEgaisForm,
                   handleDeleteEgais,
                   handleEditEgais,
                   handleAddEgais,
                   resetEgaisForm,
                   loadEgais,
                   egaisList,
                   getEgaisStatus,
                   openEditEgais,
                   handleEgaisChange,
                   isEgaisChanged,
                   handleSaveEgais,
                   handleTestConnection
               }: EgaisProps) => {
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
                        <Wine className="h-5 w-5" />
                        Настройки ЕГАИС
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <div className="font-medium text-blue-800">Настройка ЕГАИС</div>
                                <div className="text-sm text-blue-700">
                                    Интеграция с системой учета алкогольной продукции
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Форма добавления/редактирования настроек ЕГАИС */}
                    <Card style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}
                          className={editingEgais ? "border-2 border-orange-300" : "border-dashed border-2"}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {editingEgais ? 'Редактировать настройки ЕГАИС' : 'Добавить новые настройки ЕГАИС'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="egaisName">Название настроек *</Label>
                                    <Input
                                        id="egaisName"
                                        placeholder="Настройки ЕГАИС"
                                        value={egaisForm.name}
                                        onChange={(e) => handleEgaisChange('name', e.target.value)}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="egaisIp">IP-адрес</Label>
                                    <Input
                                        id="egaisIp"
                                        placeholder="192.168.1.100"
                                        value={egaisForm.ip_address}
                                        onChange={(e) => handleEgaisChange('ip_address', e.target.value)}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="egaisPort">Порт</Label>
                                    <Input
                                        id="egaisPort"
                                        placeholder="8080"
                                        value={egaisForm.port}
                                        onChange={(e) => handleEgaisChange('port', e.target.value)}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="egaisStatus">Статус</Label>
                                    <Select
                                        value={egaisForm.is_activ ? 'active' : 'inactive'}
                                        onValueChange={(value) => handleEgaisChange('is_activ', value === 'active')}
                                    >
                                        <SelectTrigger id="egaisStatus"    style={{
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
                                    <Label htmlFor="egaisUrl">URL сервера ЕГАИС</Label>
                                    <Input
                                        id="egaisUrl"
                                        placeholder="https://egais.server.ru"
                                        value={egaisForm.metadate?.egaisUrl || ''}
                                        onChange={(e) => handleEgaisChange('metadate', {
                                            ...egaisForm.metadate,
                                            egaisUrl: e.target.value
                                        })}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="egaisLogin">Логин ЕГАИС</Label>
                                    <Input
                                        id="egaisLogin"
                                        placeholder="Введите логин"
                                        value={egaisForm.metadate?.egaisLogin || ''}
                                        onChange={(e) => handleEgaisChange('metadate', {
                                            ...egaisForm.metadate,
                                            egaisLogin: e.target.value
                                        })}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="egaisPassword">Пароль</Label>
                                    <Input
                                        id="egaisPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={egaisForm.metadate?.egaisPassword || ''}
                                        onChange={(e) => handleEgaisChange('metadate', {
                                            ...egaisForm.metadate,
                                            egaisPassword: e.target.value
                                        })}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fsrarId">FSRAR ID</Label>
                                    <Input
                                        id="fsrarId"
                                        placeholder="030000123456"
                                        value={egaisForm.metadate?.fsrarId || ''}
                                        onChange={(e) => handleEgaisChange('metadate', {
                                            ...egaisForm.metadate,
                                            fsrarId: e.target.value
                                        })}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="egaisOrgType">Тип организации</Label>
                                    <Select
                                        value={egaisForm.metadate?.egaisOrgType || 'retail'}
                                        onValueChange={(value) => handleEgaisChange('metadate', {
                                            ...egaisForm.metadate,
                                            egaisOrgType: value
                                        })}
                                    >
                                        <SelectTrigger id="egaisOrgType"    style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}>
                                            <SelectValue placeholder="Выберите тип" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="retail">Розничная торговля</SelectItem>
                                            <SelectItem value="wholesale">Оптовая торговля</SelectItem>
                                            <SelectItem value="restaurant">Ресторан/Бар</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="syncInterval">Интервал синхронизации</Label>
                                    <Select
                                        value={egaisForm.metadate?.syncInterval || '30'}
                                        onValueChange={(value) => handleEgaisChange('metadate', {
                                            ...egaisForm.metadate,
                                            syncInterval: value
                                        })}
                                    >
                                        <SelectTrigger id="syncInterval"    style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}>
                                            <SelectValue placeholder="Выберите интервал" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5 минут</SelectItem>
                                            <SelectItem value="15">15 минут</SelectItem>
                                            <SelectItem value="30">30 минут</SelectItem>
                                            <SelectItem value="60">1 час</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    className="bg-orange-600 hover:bg-orange-700"
                                    onClick={editingEgais ? handleEditEgais : handleAddEgais}
                                    disabled={!egaisForm.name.trim()}
                                >
                                    {editingEgais ? (
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
                                {editingEgais && (
                                    <Button
                                        variant="outline"
                                        onClick={resetEgaisForm}
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
                                <p className="font-medium">Включить интеграцию с ЕГАИС</p>
                                <p className="text-sm text-muted-foreground">Активировать обмен данными с системой</p>
                            </div>
                            <Switch
                                checked={egaisForm.metadate?.enableIntegration ?? true}
                                onCheckedChange={(checked) => handleEgaisChange('metadate', {
                                    ...egaisForm.metadate,
                                    enableIntegration: checked
                                })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                            <div>
                                <p className="font-medium">Автоматическая отправка ТТН</p>
                                <p className="text-sm text-muted-foreground">Отправлять товарно-транспортные накладные</p>
                            </div>
                            <Switch
                                checked={egaisForm.metadate?.autoSendTtn ?? true}
                                onCheckedChange={(checked) => handleEgaisChange('metadate', {
                                    ...egaisForm.metadate,
                                    autoSendTtn: checked
                                })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                            <div>
                                <p className="font-medium">Проверка остатков</p>
                                <p className="text-sm text-muted-foreground">Сверять остатки с данными ЕГАИС</p>
                            </div>
                            <Switch
                                checked={egaisForm.metadate?.checkBalance ?? true}
                                onCheckedChange={(checked) => handleEgaisChange('metadate', {
                                    ...egaisForm.metadate,
                                    checkBalance: checked
                                })}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Список настроек ЕГАИС */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Список настроек ЕГАИС</h3>
                            <Button
                                variant="outline"
                                onClick={loadEgais}
                                size="sm"
                            >
                                Обновить список
                            </Button>
                        </div>

                        {egaisList.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border rounded-lg">
                                <Wine className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>Настройки ЕГАИС не добавлены</p>
                                <p className="text-sm">Добавьте первые настройки ЕГАИС используя форму выше</p>
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Название</TableHead>
                                            <TableHead>IP-адрес</TableHead>
                                            <TableHead>Порт</TableHead>
                                            <TableHead>Статус</TableHead>
                                            <TableHead>FSRAR ID</TableHead>
                                            <TableHead>Тип организации</TableHead>
                                            <TableHead>Действия</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {egaisList.map((egais) => (
                                            <TableRow key={egais.id} className={editingEgais?.id === egais.id ? 'bg-blue-50' : ''}>
                                                <TableCell className="font-medium">{egais.name}</TableCell>
                                                <TableCell className="font-mono text-sm">{egais.ip_address || '-'}</TableCell>
                                                <TableCell className="font-mono text-sm">{egais.port || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            egais.is_activ
                                                                ? 'bg-green-500 hover:bg-green-600'
                                                                : 'bg-red-500 hover:bg-red-600'
                                                        }
                                                    >
                                                        {egais.is_activ ? 'Активен' : 'Неактивен'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{egais.metadate?.fsrarId || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {egais.metadate?.egaisOrgType === 'retail' ? 'Розничная' :
                                                            egais.metadate?.egaisOrgType === 'wholesale' ? 'Оптовая' : 'Ресторан'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openEditEgais(egais)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteEgais(egais.id)}
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
                            onClick={handleSaveEgais}
                            disabled={!isEgaisChanged}
                        >
                            Сохранить все настройки
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleTestConnection}
                        >
                            Тестировать подключение
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                loadEgais();
                                resetEgaisForm();
                            }}
                            disabled={!isEgaisChanged}
                        >
                            Отменить изменения
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Egais;