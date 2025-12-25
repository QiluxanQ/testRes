import React, {useEffect, useState} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Switch } from '../../../ui/switch';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Badge } from '../../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Settings, Bell, Shield, Database, CreditCard, Printer, Receipt, Wine, Package, Monitor, Plus, Edit, Trash2, AlertCircle, X, Save } from 'lucide-react';
import { Separator } from '../../../ui/separator';
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../../../ui/tabs";


const AVAILABLE_PERMISSIONS = [
    {
        key: 'dashboard',
        label: 'Дашборд',
        description: 'Доступ к главной панели управления'
    },
    {
        key: 'analytics',
        label: 'Аналитика',
        description: 'Просмотр аналитических отчетов'
    },
    {
        key: 'orders',
        label: 'Заказы',
        description: 'Управление заказами и бронированиями'
    },
    {
        key: 'menu',
        label: 'Меню',
        description: 'Редактирование меню и цен'
    },
    {
        key: 'guests',
        label: 'Гости',
        description: 'Управление базой гостей'
    },
    {
        key: 'tables',
        label: 'Столы',
        description: 'Управление столиками и зонами'
    },
    {
        key: 'staff',
        label: 'Персонал',
        description: 'Управление сотрудниками'
    },
    {
        key: 'inventory',
        label: 'Склад',
        description: 'Управление запасами и поставками'
    },
    {
        key: 'suppliers',
        label: 'Поставщики',
        description: 'Управление поставщиками'
    },
    {
        key: 'finance',
        label: 'Финансы',
        description: 'Доступ к финансовым отчетам'
    },
    {
        key: 'egais',
        label: 'ЕГАИС',
        description: 'Работа с алкогольной продукцией'
    },
    {
        key: 'reports',
        label: 'Отчеты',
        description: 'Генерация и просмотр отчетов'
    },
    {
        key: 'settings',
        label: 'Настройки',
        description: 'Изменение системных настроек'
    }
];

export const UserManagementSection: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [userForm, setUserForm] = useState({
        username: '',
        password: '',
        full_name: '',
        email: '',
        phone: '',
        role_id: 1,
        is_active: true,
        permissions: {
            dashboard: true,
            analytics: false,
            orders: true,
            menu: true,
            guests: true,
            tables: false,
            staff: false,
            inventory: false,
            suppliers: false,
            finance: false,
            egais: false,
            reports: false,
            settings: false
        }
    });

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

    // Загрузка пользователей
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/users/?skip=0&limit=100',{
                headers: getAuthHeaders(),
            });
            if (!response.ok) throw new Error('Ошибка загрузки пользователей');
            const usersData = await response.json();
            setUsers(usersData);
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
            alert('Не удалось загрузить пользователей');
        } finally {
            setLoading(false);
        }
    };


    const createUser = async (data: typeof userForm) => {
        const userData = {
            point_retail_id: 1,
            employee_id: 1,
            department_id: 1,
            role_id: data.role_id,
            username: data.username,
            password_HASH: data.password,
            is_active: data.is_active,
            metadate: {
                full_name: data.full_name,
                email: data.email,
                phone: data.phone,
                permissions: data.permissions
            }
        };

        const response = await fetch('/users/', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Ошибка создания пользователя');
        return response.json();
    };

    const updateUser = async (id: number, data: typeof userForm) => {
        const userData = {
            point_retail_id: 1,
            employee_id: 1,
            department_id: 1,
            role_id: data.role_id,
            username: data.username,
            is_active: data.is_active,
            password_HASH:data.password,
            metadate: {
                full_name: data.full_name,
                email: data.email,
                phone: data.phone,
                permissions: data.permissions
            }
        };

        if (data.password) {
            userData.password_HASH = data.password;
        }

        const response = await fetch(`/users/${id}`, {
            method: 'PUT',
            headers:getAuthHeaders(),
            body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Ошибка обновления пользователя');
        return response.json();
    };


    const deleteUser = async (id: number) => {
        const response = await fetch(`/users/${id}`, {
            method: 'DELETE',
            headers:getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Ошибка удаления пользователя');
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const getRoleName = (roleId: number): string => {
        const roles: { [key: number]: string } = {
            1: 'Владелец',
            2: 'Администратор',
            3: 'Менеджер',
            4: 'Официант',
            5: 'Повар',
            6: 'Кассир'
        };
        return roles[roleId] || 'Пользователь';
    };

    const getStatusBadge = (user: any) => {
        if (!user.is_active) {
            return <Badge className="bg-red-500">Заблокирован</Badge>;
        }
        return <Badge className="bg-green-500">Активен</Badge>;
    };

    const resetUserForm = () => {
        setUserForm({
            username: '',
            password: '',
            full_name: '',
            email: '',
            phone: '',
            role_id: 1,
            is_active: true,
            permissions: {
                dashboard: true,
                analytics: false,
                orders: true,
                menu: true,
                guests: true,
                tables: false,
                staff: false,
                inventory: false,
                suppliers: false,
                finance: false,
                egais: false,
                reports: false,
                settings: false
            }
        });
    };

    const handleAddUser = async () => {
        try {
            if (!userForm.username.trim() || !userForm.full_name.trim()) {
                alert('Заполните обязательные поля: логин и ФИО');
                return;
            }

            if (!userForm.password.trim()) {
                alert('Введите пароль для нового пользователя');
                return;
            }

            const newUser = await createUser(userForm);
            setUsers(prev => [...prev, newUser]);
            setShowAddForm(false);
            resetUserForm();
            alert('Пользователь успешно создан!');
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось создать пользователя');
        }
    };

    const handleEditUser = async () => {
        if (!editingUser) return;

        try {
            const updatedUser = await updateUser(editingUser.id, userForm);
            setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
            setEditingUser(null);
            resetUserForm();
            alert('Пользователь успешно обновлен!');
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось обновить пользователя');
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

        try {
            await deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
            alert('Пользователь успешно удален!');
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось удалить пользователя');
        }
    };

    const openEditUser = (user: any) => {
        setEditingUser(user);
        const metadata = user.metadate || {};


        const defaultPermissions = {
            dashboard: false,
            analytics: false,
            orders: false,
            menu: false,
            guests: false,
            tables: false,
            staff: false,
            inventory: false,
            suppliers: false,
            finance: false,
            egais: false,
            reports: false,
            settings: false
        };

        const permissions = metadata.permissions ?
            { ...defaultPermissions, ...metadata.permissions } :
            defaultPermissions;

        setUserForm({
            username: user.username,
            password: '',
            full_name: metadata.full_name || '',
            email: metadata.email || '',
            phone: metadata.phone || '',
            role_id: user.role_id,
            is_active: user.is_active,
            permissions
        });
    };

    const handlePermissionChange = (permission: string, checked: boolean) => {
        setUserForm(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [permission]: checked
            }
        }));
    };

    // Функция для применения предустановленных наборов прав
    const applyPermissionPreset = (preset: string) => {
        const presets: { [key: string]: any } = {
            owner: {
                dashboard: true,
                analytics: true,
                orders: true,
                menu: true,
                guests: true,
                tables: true,
                staff: true,
                inventory: true,
                suppliers: true,
                finance: true,
                egais: true,
                reports: true,
                settings: true
            },
            admin: {
                dashboard: true,
                analytics: true,
                orders: true,
                menu: true,
                guests: true,
                tables: true,
                staff: true,
                inventory: true,
                suppliers: true,
                finance: true,
                egais: true,
                reports: true,
                settings: false
            },
            manager: {
                dashboard: true,
                analytics: true,
                orders: true,
                menu: true,
                guests: true,
                tables: true,
                staff: true,
                inventory: true,
                suppliers: true,
                finance: false,
                egais: true,
                reports: true,
                settings: false
            },
            waiter: {
                dashboard: true,
                analytics: false,
                orders: true,
                menu: true,
                guests: true,
                tables: true,
                staff: false,
                inventory: false,
                suppliers: false,
                finance: false,
                egais: false,
                reports: false,
                settings: false
            },
            chef: {
                dashboard: true,
                analytics: false,
                orders: true,
                menu: true,
                guests: false,
                tables: false,
                staff: false,
                inventory: true,
                suppliers: false,
                finance: false,
                egais: false,
                reports: false,
                settings: false
            },
            cashier: {
                dashboard: true,
                analytics: false,
                orders: true,
                menu: false,
                guests: true,
                tables: false,
                staff: false,
                inventory: false,
                suppliers: false,
                finance: true,
                egais: false,
                reports: true,
                settings: false
            }
        };

        if (presets[preset]) {
            setUserForm(prev => ({
                ...prev,
                permissions: presets[preset]
            }));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium">Управление пользователями</h3>
                <Button
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() => {
                        setEditingUser(null);
                        resetUserForm();
                        setShowAddForm(true);
                    }}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить пользователя
                </Button>
            </div>


            {(showAddForm || editingUser) && (
                <Card className="border-2 border-orange-300" >
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                                {editingUser ? 'Редактировать пользователя' : 'Добавить нового пользователя'}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingUser(null);
                                    resetUserForm();
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Логин *</Label>
                                <Input
                                    id="username"
                                    value={userForm.username}
                                    onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                                    placeholder="Введите логин"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Пароль {editingUser ? '(оставьте пустым чтобы не менять)' : '*'}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={userForm.password}
                                    onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                                    placeholder="Введите пароль"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fullName">ФИО *</Label>
                                <Input
                                    id="fullName"
                                    value={userForm.full_name}
                                    onChange={(e) => setUserForm(prev => ({ ...prev, full_name: e.target.value }))}
                                    placeholder="Иванов Иван Иванович"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={userForm.email}
                                    onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Телефон</Label>
                                <Input
                                    id="phone"
                                    value={userForm.phone}
                                    onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="+7 (999) 123-45-67"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Роль</Label>
                                <Select
                                    value={userForm.role_id.toString()}
                                    onValueChange={(value) => {
                                        setUserForm(prev => ({ ...prev, role_id: parseInt(value) }));
                                        // Автоматически применяем пресет прав при выборе роли
                                        applyPermissionPreset(value);
                                    }}
                                >
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Выберите роль" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Владелец</SelectItem>
                                        <SelectItem value="2">Администратор</SelectItem>
                                        <SelectItem value="3">Менеджер</SelectItem>
                                        <SelectItem value="4">Официант</SelectItem>
                                        <SelectItem value="5">Повар</SelectItem>
                                        <SelectItem value="6">Кассир</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Статус</Label>
                                <Select
                                    value={userForm.is_active ? 'active' : 'inactive'}
                                    onValueChange={(value) => setUserForm(prev => ({ ...prev, is_active: value === 'active' }))}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Выберите статус" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Активен</SelectItem>
                                        <SelectItem value="inactive">Неактивен</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Права доступа</Label>
                                <div className="flex gap-2">
                                    <Select onValueChange={applyPermissionPreset}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="Пресеты прав" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="owner">Права владельца</SelectItem>
                                            <SelectItem value="admin">Права администратора</SelectItem>
                                            <SelectItem value="manager">Права менеджера</SelectItem>
                                            <SelectItem value="waiter">Права официанта</SelectItem>
                                            <SelectItem value="chef">Права повара</SelectItem>
                                            <SelectItem value="cashier">Права кассира</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {AVAILABLE_PERMISSIONS.map((permission) => (
                                    <div key={permission.key} className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
                                        <Switch
                                            checked={userForm.permissions[permission.key as keyof typeof userForm.permissions]}
                                            onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                                        />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium">
                                                {permission.label}
                                            </span>
                                            <p className="text-xs text-muted-foreground">
                                                {permission.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button
                                className="bg-orange-600 hover:bg-orange-700"
                                onClick={editingUser ? handleEditUser : handleAddUser}
                                disabled={!userForm.username.trim() || !userForm.full_name.trim() || (!editingUser && !userForm.password.trim())}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {editingUser ? 'Сохранить изменения' : 'Добавить пользователя'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingUser(null);
                                    resetUserForm();
                                }}
                            >
                                Отмена
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Список пользователей */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">Загрузка пользователей...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                        <div className="h-12 w-12 mx-auto mb-3 opacity-50">👤</div>
                        <p>Пользователи не найдены</p>
                        <p className="text-sm">Добавьте первого пользователя используя кнопку выше</p>
                    </div>
                ) : (
                    users.map((user) => (
                        <Card key={user.id} className="border-2" style={{
                            borderRadius: '20px',
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-primaryLine)',
                            color: 'var(--custom-text)',
                        }}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(user)}
                                        <span className="font-medium">
                                            {user.metadate?.full_name || user.username}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditUser(user)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-sm text-muted-foreground">Логин</Label>
                                        <div className="font-medium">{user.username}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm text-muted-foreground">Роль</Label>
                                        <div className="font-medium">
                                            {getRoleName(user.role_id)}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm text-muted-foreground">Email</Label>
                                        <div className="font-medium">{user.metadate?.email || 'Не указан'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm text-muted-foreground">Телефон</Label>
                                        <div className="font-medium">{user.metadate?.phone || 'Не указан'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm text-muted-foreground">Последний вход</Label>
                                        <div className="font-medium">
                                            {user.last_login ? new Date(user.last_login).toLocaleString('ru-RU') : 'Никогда'}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label className="text-sm">Права доступа</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {AVAILABLE_PERMISSIONS.map((permission) =>
                                                user.metadate?.permissions?.[permission.key] && (
                                                    <Badge
                                                        key={permission.key}
                                                        variant="outline"
                                                        className="bg-blue-50 text-blue-700 border-blue-200"
                                                    >
                                                        {permission.label}
                                                    </Badge>
                                                )
                                        )}
                                        {!user.metadate?.permissions && (
                                            <span className="text-sm text-muted-foreground">Права не настроены</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};