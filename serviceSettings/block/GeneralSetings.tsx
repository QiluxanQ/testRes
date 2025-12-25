import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "../../../ui/card";
import {AlertCircle, Edit, Package, Plus, Trash2} from "lucide-react";
import {Separator} from "../../../ui/separator";
import {Badge} from "../../../ui/badge";
import {Label} from "../../../ui/label";
import {Input} from "../../../ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../../ui/select";
import {Button} from "../../../ui/button";

const GeneralSetings = ({isOrganizationChanged,organizationForm,handleOrganizationChange,setEditingWarehouse,resetWarehouseForm,
                            setShowAddWarehouse,setEditingPoint,resetPointForm,setShowAddPoint,loadOrganizationData,loading,pointsRetail,selectedSalesPoint,handleSalesPointChange,
                            openEditPoint,handleDeletePoint,handleSaveOrganization }) => {
    return (
        <div>
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader>
                    <CardTitle>Общие настройки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <div className="font-medium text-blue-800">Основные настройки системы</div>
                                <div className="text-sm text-blue-700">
                                    Информация о владельце, юридические данные и точки продаж
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium">Информация о владельце</h3>
                            {isOrganizationChanged && (
                                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                                    Есть несохраненные изменения
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">

                            <div className="space-y-2">
                                <Label htmlFor="companyName">Название компании</Label>
                                <Input
                                    id="companyName"
                                    value={organizationForm.Full_name}
                                    onChange={(e) => handleOrganizationChange('Full_name', e.target.value)}
                                    placeholder="Введите название компании"
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="companyType">Организационная форма</Label>
                                <Select
                                    value={organizationForm.companyType}
                                    onValueChange={(value) => handleOrganizationChange('companyType', value)}
                                >
                                    <SelectTrigger id="companyType"    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}>
                                        <SelectValue placeholder="Выберите форму" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ooo">ООО</SelectItem>
                                        <SelectItem value="ao">АО</SelectItem>
                                        <SelectItem value="ip">ИП</SelectItem>
                                        <SelectItem value="pao">ПАО</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="inn">ИНН</Label>
                                <Input
                                    id="inn"
                                    placeholder="7707123456"
                                    value={organizationForm.inn}
                                    onChange={(e) => handleOrganizationChange('inn', e.target.value)}
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="kpp">КПП</Label>
                                <Input
                                    id="kpp"
                                    placeholder="770701001"
                                    value={organizationForm.kpp}
                                    onChange={(e) => handleOrganizationChange('kpp', e.target.value)}
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ogrn">ОГРН</Label>
                                <Input
                                    id="ogrn"
                                    placeholder="1234567890123"
                                    value={organizationForm.ogrn}
                                    onChange={(e) => handleOrganizationChange('ogrn', e.target.value)}
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="okpo">ОКПО</Label>
                                <Input
                                    id="okpo"
                                    placeholder="12345678"
                                    value={organizationForm.okpo}
                                    onChange={(e) => handleOrganizationChange('okpo', e.target.value)}
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="legalAddress">Юридический адрес</Label>
                                <Input
                                    id="legalAddress"
                                    placeholder="г. Москва, ул. Примерная, д. 1"
                                    value={organizationForm.legal_address}
                                    onChange={(e) => handleOrganizationChange('legal_address', e.target.value)}
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="actualAddress">Фактический адрес</Label>
                                <Input
                                    id="actualAddress"
                                    placeholder="г. Москва, ул. Примерная, д. 1"
                                    value={organizationForm.actual_address}
                                    onChange={(e) => handleOrganizationChange('actual_address', e.target.value)}
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                            </div>

                            {/* Поля из metadata */}
                            <div className="space-y-2">
                                <Label htmlFor="directorName">ФИО директора</Label>
                                <Input
                                    id="directorName"
                                    placeholder="Иванов Иван Иванович"
                                    value={organizationForm.directorName}
                                    onChange={(e) => handleOrganizationChange('directorName', e.target.value)}
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="directorPosition">Должность</Label>
                                <Input
                                    id="directorPosition"
                                    placeholder="Генеральный директор"
                                    value={organizationForm.directorPosition}
                                    onChange={(e) => handleOrganizationChange('directorPosition', e.target.value)}
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Телефон</Label>
                                <Input
                                    id="phone"
                                    placeholder="+7 (495) 123-45-67"
                                    value={organizationForm.phone}
                                    onChange={(e) => handleOrganizationChange('phone', e.target.value)}
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="info@company.ru"
                                    value={organizationForm.email}
                                    onChange={(e) => handleOrganizationChange('email', e.target.value)}
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">Веб-сайт</Label>
                                <Input
                                    id="website"
                                    placeholder="www.company.ru"
                                    value={organizationForm.website}
                                    onChange={(e) => handleOrganizationChange('website', e.target.value)}
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bankName">Название банка</Label>
                                <Input
                                    id="bankName"
                                    placeholder="ПАО Сбербанк"
                                    value={organizationForm.bankName}
                                    onChange={(e) => handleOrganizationChange('bankName', e.target.value)}
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bik">БИК</Label>
                                <Input
                                    id="bik"
                                    placeholder="044525225"
                                    value={organizationForm.bik}
                                    onChange={(e) => handleOrganizationChange('bik', e.target.value)}
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accountNumber">Расчетный счет</Label>
                                <Input
                                    id="accountNumber"
                                    placeholder="40702810123456789012"
                                    value={organizationForm.accountNumber}
                                    onChange={(e) => handleOrganizationChange('accountNumber', e.target.value)}
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="corrAccount">Корр. счет</Label>
                                <Input
                                    id="corrAccount"
                                    placeholder="30101810400000000225"
                                    value={organizationForm.corrAccount}
                                    onChange={(e) => handleOrganizationChange('corrAccount', e.target.value)}
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium">Точки продаж</h3>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setEditingWarehouse(null);
                                        resetWarehouseForm();
                                        setShowAddWarehouse(true);
                                    }}
                                >
                                    <Package className="h-4 w-4 mr-2" />
                                    Управление складами
                                </Button>
                                <Button
                                    className="bg-orange-600 hover:bg-orange-700"
                                    onClick={() => {
                                        setEditingPoint(null);
                                        resetPointForm();
                                        setShowAddPoint(true);
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Добавить точку
                                </Button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                                <p className="text-sm text-gray-600 mt-2">Загрузка точек продаж...</p>
                            </div>
                        ) : pointsRetail.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>Точки продаж не настроены</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pointsRetail.map((point) => (
                                    <Card key={point.id} className={`border-2 ${selectedSalesPoint?.id === point.id ? 'border-orange-400 bg-orange-50' : ''}`}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={`${selectedSalesPoint?.id === point.id ? 'bg-orange-500' : 'bg-green-500'}`}>
                                                        {selectedSalesPoint?.id === point.id ? 'Текущая' : 'Активна'}
                                                    </Badge>
                                                    <span className="font-medium">{point.name}</span>
                                                    {selectedSalesPoint?.id === point.id && (
                                                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                                            ID: {point.id}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleSalesPointChange(point)}
                                                        disabled={selectedSalesPoint?.id === point.id}
                                                    >
                                                        Выбрать
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditPoint(point)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeletePoint(point.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label>Название</Label>
                                                    <div className="text-sm p-2 bg-muted/30 rounded">{point.name}</div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Тип</Label>
                                                    <div className="text-sm p-2 bg-muted/30 rounded">{point.type}</div>
                                                </div>
                                                <div className="space-y-2 col-span-2">
                                                    <Label>Адрес</Label>
                                                    <div className="text-sm p-2 bg-muted/30 rounded">{point.address}</div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>ID склада</Label>
                                                    <div className="text-sm p-2 bg-muted/30 rounded">{point.warehouse_id || 'Не указан'}</div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Дата создания</Label>
                                                    <div className="text-sm p-2 bg-muted/30 rounded">
                                                        {new Date(point.create_at).toLocaleDateString('ru-RU')}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h3 className="font-medium">Региональные настройки</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="currency">Валюта по умолчанию</Label>
                                <Select>
                                    <SelectTrigger id="currency">
                                        <SelectValue placeholder="RUB" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rub">RUB (₽)</SelectItem>
                                        <SelectItem value="usd">USD ($)</SelectItem>
                                        <SelectItem value="eur">EUR (€)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="timezone">Часовой пояс</Label>
                                <Select>
                                    <SelectTrigger id="timezone">
                                        <SelectValue placeholder="Europe/Moscow" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="europe_moscow">Europe/Moscow (МСК)</SelectItem>
                                        <SelectItem value="asia_yekaterinburg">Asia/Yekaterinburg (YEKT)</SelectItem>
                                        <SelectItem value="asia_vladivostok">Asia/Vladivostok (VLAT)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="language">Язык системы</Label>
                                <Select>
                                    <SelectTrigger id="language">
                                        <SelectValue placeholder="Русский" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ru">Русский</SelectItem>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="uk">Українська</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateFormat">Формат даты</Label>
                                <Select>
                                    <SelectTrigger id="dateFormat">
                                        <SelectValue placeholder="ДД.ММ.ГГГГ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ddmmyyyy">ДД.ММ.ГГГГ</SelectItem>
                                        <SelectItem value="mmddyyyy">ММ/ДД/ГГГГ</SelectItem>
                                        <SelectItem value="yyyymmdd">ГГГГ-ММ-ДД</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            className="bg-orange-600 hover:bg-orange-700"
                            onClick={handleSaveOrganization}
                            disabled={!isOrganizationChanged}
                        >
                            Сохранить все настройки
                        </Button>
                        <Button
                            variant="outline"
                            onClick={loadOrganizationData}
                            disabled={!isOrganizationChanged}
                        >
                            Отменить изменения
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default GeneralSetings;