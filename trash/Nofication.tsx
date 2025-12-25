import React, { useState, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';


import {Badge} from "../components/ui/badge";
import {ScrollArea} from "../components/ui/scroll-area";
import {Button} from "../components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../components/ui/dropdown-menu";



// Типы уведомлений
const mockNotifications = [
    {
        id: 1,
        type: 'order',
        title: 'Новый заказ',
        message: 'Стол 5 сделал новый заказ',
        time: '2 мин назад',
        read: false,
        important: true
    },
    {
        id: 2,
        type: 'reservation',
        title: 'Новое бронирование',
        message: 'Иван Иванов забронировал стол 3 на 19:00',
        time: '5 мин назад',
        read: false,
        important: false
    },
    {
        id: 3,
        type: 'kitchen',
        title: 'Кухня',
        message: 'Заканчивается лосось',
        time: '10 мин назад',
        read: true,
        important: true
    },
    {
        id: 4,
        type: 'system',
        title: 'Системное уведомление',
        message: 'Запланировано обновление системы',
        time: '1 час назад',
        read: true,
        important: false
    },
    {
        id: 5,
        type: 'system',
        title: 'Системное уведомление',
        message: 'Запланировано обновление системы',
        time: '1 час назад',
        read: true,
        important: false
    },
    {
        id: 6,
        type: 'system',
        title: 'Системное уведомление',
        message: 'Запланировано обновление системы',
        time: '5 мин назад',
        read: true,
        important: false
    }
];

const NotificationBell = () => {
    const [notifications, setNotifications] = useState(mockNotifications);
    const [isOpen, setIsOpen] = useState(false);

    // Количество непрочитанных уведомлений
    const unreadCount = notifications.filter(n => !n.read).length;

    // Пометить все как прочитанные
    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({
                ...notification,
                read: true
            }))
        );
    };

    // Пометить одно уведомление как прочитанное
    const markAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    // Удалить уведомление
    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Получить цвет для типа уведомления
    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'order': return 'bg-blue-100 text-blue-800';
            case 'reservation': return 'bg-green-100 text-green-800';
            case 'kitchen': return 'bg-orange-100 text-orange-800';
            case 'system': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Получить иконку для типа уведомления
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'order': return '🛒';
            case 'reservation': return '📅';
            case 'kitchen': return '👨‍🍳';
            case 'system': return '⚙️';
            default: return '🔔';
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    {unreadCount > 0 ? (
                        <BellRing className="h-5 w-5" />
                    ) : (
                        <Bell className="h-5 w-5" />
                    )}
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Уведомления</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
                        >
                            Прочитать все
                        </Button>
                    )}
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <ScrollArea className="h-80">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            Нет новых уведомлений
                        </div>
                    ) : (
                        <div className="space-y-1 p-1">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                        notification.read
                                            ? 'bg-white hover:bg-gray-50'
                                            : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
                                    }`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-2 flex-1">
                      <span className="text-lg mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <p className={`text-sm font-medium ${
                                                        notification.read ? 'text-gray-900' : 'text-gray-900'
                                                    }`}>
                                                        {notification.title}
                                                    </p>
                                                    {notification.important && (
                                                        <Badge variant="destructive" className="text-xs px-1">
                                                            Важно
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {notification.time}
                                                </p>
                                            </div>
                                        </div>

                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 flex-shrink-0 opacity-1 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeNotification(notification.id);
                                            }}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="justify-center text-center cursor-pointer">
          <span className="text-blue-600 hover:text-blue-800 text-sm">
            Показать все уведомления
          </span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;