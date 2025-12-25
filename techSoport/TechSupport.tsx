import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Textarea } from '../../ui/textarea';
import { Plus, Search, AlertCircle, CheckCircle, Clock, Wrench, Zap, AlertTriangle, Calendar, User, MessageSquare } from 'lucide-react';

// Данные заявок
const initialTickets = [
    {
        id: 1,
        title: 'Не работает POS-терминал #2',
        description: 'Терминал не включается, индикатор не горит',
        category: 'equipment',
        priority: 'high',
        status: 'open',
        reporter: 'Петрова А.С.',
        assignee: 'Техник Иванов',
        location: 'Касса основная',
        created: '2024-03-20 14:30',
        updated: '2024-03-20 14:30',
        dueDate: '2024-03-20 18:00',
        comments: []
    },
    {
        id: 2,
        title: 'Протечка крана на кухне',
        description: 'Кран над мойкой протекает, требуется замена прокладки',
        category: 'plumbing',
        priority: 'medium',
        status: 'in_progress',
        reporter: 'Иванов И.И.',
        assignee: 'Сантехник Петров',
        location: 'Кухня, зона мойки',
        created: '2024-03-19 10:15',
        updated: '2024-03-20 09:00',
        dueDate: '2024-03-21 12:00',
        comments: [
            { author: 'Сантехник Петров', text: 'Заказал прокладку, приду завтра', time: '2024-03-19 15:30' }
        ]
    },
    {
        id: 3,
        title: 'Не работает кондиционер в зале',
        description: 'Кондиционер не охлаждает, дует теплым воздухом',
        category: 'hvac',
        priority: 'high',
        status: 'open',
        reporter: 'Администратор',
        assignee: null,
        location: 'Основной зал',
        created: '2024-03-20 11:00',
        updated: '2024-03-20 11:00',
        dueDate: '2024-03-20 16:00',
        comments: []
    },
    {
        id: 4,
        title: 'Замена лампочки в туалете',
        description: 'Перегорела лампочка в женском туалете',
        category: 'electrical',
        priority: 'low',
        status: 'resolved',
        reporter: 'Уборщица Мария',
        assignee: 'Электрик Сидоров',
        location: 'Женский туалет',
        created: '2024-03-18 16:00',
        updated: '2024-03-18 17:30',
        dueDate: '2024-03-19 12:00',
        comments: [
            { author: 'Электрик Сидоров', text: 'Лампочка заменена', time: '2024-03-18 17:30' }
        ]
    },
    {
        id: 5,
        title: 'Сломался холодильник в баре',
        description: 'Холодильник не морозит, температура +10°C',
        category: 'equipment',
        priority: 'critical',
        status: 'in_progress',
        reporter: 'Козлова М.В.',
        assignee: 'Мастер по холод. оборудованию',
        location: 'Бар',
        created: '2024-03-20 08:00',
        updated: '2024-03-20 10:00',
        dueDate: '2024-03-20 14:00',
        comments: [
            { author: 'Мастер', text: 'Выезжаю, буду через час', time: '2024-03-20 09:00' },
            { author: 'Мастер', text: 'Проблема с компрессором, нужна замена', time: '2024-03-20 10:00' }
        ]
    }
];

// История обслуживания оборудования
const initialMaintenanceHistory = [
    {
        id: 1,
        equipment: 'Холодильник промышленный POLAIR #1',
        location: 'Кухня',
        type: 'Плановое ТО',
        date: '2024-03-15',
        technician: 'ООО "ХолодСервис"',
        cost: 5000,
        nextService: '2024-06-15',
        notes: 'Проведена чистка, замена фреона'
    },
    {
        id: 2,
        equipment: 'Кондиционер LG #1',
        location: 'Основной зал',
        type: 'Ремонт',
        date: '2024-03-10',
        technician: 'ИП Мастер',
        cost: 8500,
        nextService: '2024-09-10',
        notes: 'Замена вентилятора'
    },
    {
        id: 3,
        equipment: 'Посудомоечная машина Electrolux',
        location: 'Кухня',
        type: 'Плановое ТО',
        date: '2024-02-28',
        technician: 'Авторизованный сервис',
        cost: 3500,
        nextService: '2024-05-28',
        notes: 'Замена фильтров, чистка форсунок'
    },
    {
        id: 4,
        equipment: 'POS-терминал Ingenico #1',
        location: 'Касса основная',
        type: 'Ремонт',
        date: '2024-03-05',
        technician: 'Сбербанк Сервис',
        cost: 0,
        nextService: null,
        notes: 'Гарантийный ремонт, замена клавиатуры'
    }
];

// Категории заявок
const ticketCategories = [
    { value: 'equipment', label: 'Оборудование', icon: Wrench },
    { value: 'plumbing', label: 'Сантехника', icon: Zap },
    { value: 'electrical', label: 'Электрика', icon: Zap },
    { value: 'hvac', label: 'Вентиляция и кондиционирование', icon: Zap },
    { value: 'furniture', label: 'Мебель', icon: Wrench },
    { value: 'it', label: 'IT и связь', icon: Wrench },
    { value: 'other', label: 'Прочее', icon: Wrench }
];

export function TechSupport() {
    const [searchTerm, setSearchTerm] = useState('');
    const [tickets, setTickets] = useState(initialTickets);
    const [maintenanceHistory, setMaintenanceHistory] = useState(initialMaintenanceHistory);
    const [selectedTicket, setSelectedTicket] = useState<typeof initialTickets[0] | null>(null);

    const getPriorityBadge = (priority: string) => {
        const variants: Record<string, { label: string; className: string }> = {
            critical: { label: 'Критический', className: 'bg-red-600 text-white' },
            high: { label: 'Высокий', className: 'bg-orange-500 text-white' },
            medium: { label: 'Средний', className: 'bg-yellow-500 text-white' },
            low: { label: 'Низкий', className: 'bg-blue-500 text-white' }
        };
        const variant = variants[priority] || variants.medium;
        return <Badge className={variant.className}>{variant.label}</Badge>;
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            open: { label: 'Открыта', className: 'bg-blue-100 text-blue-800', icon: <AlertCircle className="h-3 w-3 mr-1" /> },
            in_progress: { label: 'В работе', className: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3 mr-1" /> },
            resolved: { label: 'Решена', className: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
            closed: { label: 'Закрыта', className: 'bg-gray-100 text-gray-800', icon: <CheckCircle className="h-3 w-3 mr-1" /> }
        };
        const variant = variants[status] || variants.open;
        return (
            <Badge className={variant.className}>
                {variant.icon}
                {variant.label}
            </Badge>
        );
    };

    const getCategoryLabel = (category: string) => {
        const cat = ticketCategories.find(c => c.value === category);
        return cat ? cat.label : category;
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="tickets" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="tickets">Заявки</TabsTrigger>
                    <TabsTrigger value="maintenance">История обслуживания</TabsTrigger>
                </TabsList>

                {/* Вкладка Заявки */}
                <TabsContent value="tickets" className="space-y-6">
                    {/* Статистика */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <Card style={{
                            borderRadius: '20px',
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-secondaryLineCard)',
                            color: 'var(--custom-text)',
                        }}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center">
                                    <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                                    Критические
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl text-red-600">
                                    {tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed').length}
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
                                <CardTitle className="text-sm flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                                    Открытые
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl text-blue-600">
                                    {tickets.filter(t => t.status === 'open').length}
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
                                <CardTitle className="text-sm flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                                    В работе
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl text-yellow-600">
                                    {tickets.filter(t => t.status === 'in_progress').length}
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
                                <CardTitle className="text-sm flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                    Решенные
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl text-green-600">
                                    {tickets.filter(t => t.status === 'resolved').length}
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
                                <CardTitle className="text-sm flex items-center">
                                    <Wrench className="h-4 w-4 mr-2" />
                                    Всего
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl text-orange-600">{tickets.length}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Список заявок */}
                    <Card style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Заявки в техподдержку</CardTitle>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="bg-orange-600 hover:bg-orange-700">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Создать заявку
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Новая заявка</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm">Заголовок</label>
                                                <Input placeholder="Краткое описание проблемы"  />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm">Категория</label>
                                                <Select>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите категорию" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {ticketCategories.map(cat => (
                                                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm">Приоритет</label>
                                                <Select>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите приоритет" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="low">Низкий</SelectItem>
                                                        <SelectItem value="medium">Средний</SelectItem>
                                                        <SelectItem value="high">Высокий</SelectItem>
                                                        <SelectItem value="critical">Критический</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm">Местоположение</label>
                                                <Input placeholder="Где находится проблема" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm">Описание проблемы</label>
                                                <Textarea placeholder="Подробное описание..." rows={4} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm">Срок решения</label>
                                                <Input type="datetime-local" />
                                            </div>
                                            <Button className="w-full">Создать заявку</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <Input
                                        placeholder="Поиск по заявкам..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="flex-1"
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                    <Select>
                                        <SelectTrigger className="w-48"    style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}>
                                            <SelectValue placeholder="Все статусы" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Все статусы</SelectItem>
                                            <SelectItem value="open">Открытые</SelectItem>
                                            <SelectItem value="in_progress">В работе</SelectItem>
                                            <SelectItem value="resolved">Решенные</SelectItem>
                                            <SelectItem value="closed">Закрытые</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select>
                                        <SelectTrigger className="w-48"    style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}>
                                            <SelectValue placeholder="Все приоритеты" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Все прио��итеты</SelectItem>
                                            <SelectItem value="critical">Критический</SelectItem>
                                            <SelectItem value="high">Высокий</SelectItem>
                                            <SelectItem value="medium">Средний</SelectItem>
                                            <SelectItem value="low">Низкий</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    {tickets.map((ticket) => (
                                        <Dialog key={ticket.id}>
                                            <DialogTrigger asChild>
                                                <div className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className="text-sm text-muted-foreground text-white">#{ticket.id}</span>
                                                                <h4 className="font-medium">{ticket.title}</h4>
                                                                {getPriorityBadge(ticket.priority)}
                                                                {getStatusBadge(ticket.status)}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <div className="text-muted-foreground mb-1">Категория</div>
                                                            <Badge className='text-white' variant="outline">{getCategoryLabel(ticket.category)}</Badge>
                                                        </div>
                                                        <div>
                                                            <div className="text-muted-foreground mb-1">Местоположение</div>
                                                            <div>{ticket.location}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-muted-foreground mb-1">Исполнитель</div>
                                                            <div>{ticket.assignee || 'Не назначен'}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-muted-foreground mb-1">Срок решения</div>
                                                            <div className={new Date(ticket.dueDate) < new Date() && ticket.status !== 'resolved' ? 'text-red-600' : ''}>
                                                                {new Date(ticket.dueDate).toLocaleString('ru-RU')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl">
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center gap-3">
                                                        <span>Заявка #{ticket.id}</span>
                                                        {getPriorityBadge(ticket.priority)}
                                                        {getStatusBadge(ticket.status)}
                                                    </DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-6">
                                                    {/* Информация о заявке */}
                                                    <div>
                                                        <h3 className="font-medium mb-2">{ticket.title}</h3>
                                                        <p className="text-sm text-muted-foreground">{ticket.description}</p>
                                                    </div>

                                                    {/* Детали */}
                                                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                                                        <div>
                                                            <div className="text-xs text-muted-foreground mb-1">Категория</div>
                                                            <Badge variant="outline">{getCategoryLabel(ticket.category)}</Badge>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-muted-foreground mb-1">Местоположение</div>
                                                            <div className="text-sm">{ticket.location}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-muted-foreground mb-1">Создал</div>
                                                            <div className="text-sm flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                {ticket.reporter}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-muted-foreground mb-1">Исполнитель</div>
                                                            <div className="text-sm flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                {ticket.assignee || 'Не назначен'}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-muted-foreground mb-1">Создана</div>
                                                            <div className="text-sm flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(ticket.created).toLocaleString('ru-RU')}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-muted-foreground mb-1">Срок решения</div>
                                                            <div className={`text-sm flex items-center gap-1 ${new Date(ticket.dueDate) < new Date() && ticket.status !== 'resolved' ? 'text-red-600' : ''}`}>
                                                                <Clock className="h-3 w-3" />
                                                                {new Date(ticket.dueDate).toLocaleString('ru-RU')}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Комментарии */}
                                                    <div>
                                                        <h4 className="font-medium mb-3 flex items-center gap-2">
                                                            <MessageSquare className="h-4 w-4" />
                                                            Комментарии ({ticket.comments.length})
                                                        </h4>
                                                        <div className="space-y-3">
                                                            {ticket.comments.map((comment, idx) => (
                                                                <div key={idx} className="bg-muted/30 rounded-lg p-3">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="font-medium text-sm">{comment.author}</span>
                                                                        <span className="text-xs text-muted-foreground">{new Date(comment.time).toLocaleString('ru-RU')}</span>
                                                                    </div>
                                                                    <p className="text-sm">{comment.text}</p>
                                                                </div>
                                                            ))}
                                                            {ticket.comments.length === 0 && (
                                                                <p className="text-sm text-muted-foreground text-center py-4">Комментариев пока нет</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Добавить комментарий */}
                                                    <div className="space-y-2">
                                                        <Textarea placeholder="Добавить комментарий..." rows={3} />
                                                        <Button size="sm">Добавить комментарий</Button>
                                                    </div>

                                                    {/* Действия */}
                                                    <div className="flex gap-2 pt-4 border-t">
                                                        <Select defaultValue={ticket.status}>
                                                            <SelectTrigger className="w-48">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="open">Открыта</SelectItem>
                                                                <SelectItem value="in_progress">В работе</SelectItem>
                                                                <SelectItem value="resolved">Решена</SelectItem>
                                                                <SelectItem value="closed">Закрыта</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Select defaultValue={ticket.assignee || 'unassigned'}>
                                                            <SelectTrigger className="w-48">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="unassigned">Не назначен</SelectItem>
                                                                <SelectItem value="tech1">Техник Иванов</SelectItem>
                                                                <SelectItem value="tech2">Сантехник Петров</SelectItem>
                                                                <SelectItem value="tech3">Электрик Сидоров</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Button className="ml-auto">Сохранить изменения</Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Вкладка История обслуживания */}
                <TabsContent value="maintenance" className="space-y-6">
                    {/* Статистика */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card style={{
                            borderRadius: '20px',
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-secondaryLineCard)',
                            color: 'var(--custom-text)',
                        }}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Всего обслуживаний</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl text-orange-600">{maintenanceHistory.length}</div>
                            </CardContent>
                        </Card>
                        <Card style={{
                            borderRadius: '20px',
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-secondaryLineCard)',
                            color: 'var(--custom-text)',
                        }}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Затраты на обслуживание</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl text-red-600">
                                    ₽{maintenanceHistory.reduce((sum, m) => sum + m.cost, 0).toLocaleString()}
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
                                <CardTitle className="text-sm">Плановых ТО</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl text-green-600">
                                    {maintenanceHistory.filter(m => m.type === 'Плановое ТО').length}
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
                                <CardTitle className="text-sm">Ремонтов</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl text-yellow-600">
                                    {maintenanceHistory.filter(m => m.type === 'Ремонт').length}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>История обслуживания оборудования</CardTitle>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="bg-orange-600 hover:bg-orange-700">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Добавить запись
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Новая запись обслуживания</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm">Оборудование</label>
                                                <Input placeholder="Название и модель" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm">Местоположение</label>
                                                <Input placeholder="Где находится" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm">Тип обслуживания</label>
                                                <Select>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите тип" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="maintenance">Плановое ТО</SelectItem>
                                                        <SelectItem value="repair">Ремонт</SelectItem>
                                                        <SelectItem value="installation">Установка</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm">Дата обслуживания</label>
                                                <Input type="date" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm">Исполнитель (компания/мастер)</label>
                                                <Input placeholder="Название компании или ФИО" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm">Стоимость (₽)</label>
                                                <Input type="number" placeholder="0" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm">Дата следующего обслуживания</label>
                                                <Input type="date" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm">Примечания</label>
                                                <Textarea placeholder="Что было сделано..." rows={3} />
                                            </div>
                                            <Button className="w-full">Добавить запись</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Input
                                    placeholder="Поиск по оборудованию..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead style={{color:'rgb(101,125,156)'}}>Оборудование</TableHead>
                                            <TableHead style={{color:'rgb(101,125,156)'}}>Местоположение</TableHead>
                                            <TableHead style={{color:'rgb(101,125,156)'}}>Тип</TableHead>
                                            <TableHead style={{color:'rgb(101,125,156)'}}>Дата</TableHead>
                                            <TableHead style={{color:'rgb(101,125,156)'}}>Исполнитель</TableHead>
                                            <TableHead style={{color:'rgb(101,125,156)'}}>Стоимость</TableHead>
                                            <TableHead style={{color:'rgb(101,125,156)'}}>Следующее ТО</TableHead>
                                            <TableHead style={{color:'rgb(101,125,156)'}}>Примечания</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {maintenanceHistory.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell>{record.equipment}</TableCell>
                                                <TableCell>
                                                    <Badge className='text-white' variant="outline">{record.location}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={record.type === 'Плановое ТО' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                                        {record.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{record.date}</TableCell>
                                                <TableCell>{record.technician}</TableCell>
                                                <TableCell className="text-red-600">
                                                    {record.cost > 0 ? `₽${record.cost.toLocaleString()}` : 'Бесплатно'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.nextService ? (
                                                        <span className={new Date(record.nextService) < new Date() ? 'text-red-600' : ''}>
                              {record.nextService}
                            </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">{record.notes}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Напоминания о предстоящем обслуживании */}
                    <Card style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-orange-600" />
                                Предстоящее обслуживание
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {maintenanceHistory
                                    .filter(m => m.nextService && new Date(m.nextService) > new Date())
                                    .sort((a, b) => new Date(a.nextService!).getTime() - new Date(b.nextService!).getTime())
                                    .slice(0, 5)
                                    .map((record) => (
                                        <div key={record.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                            <div>
                                                <div className="font-medium">{record.equipment}</div>
                                                <div className="text-sm text-muted-foreground">{record.location}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">{record.nextService}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {Math.ceil((new Date(record.nextService!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} дней
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                {maintenanceHistory.filter(m => m.nextService && new Date(m.nextService) > new Date()).length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">Нет предстоящих обслуживаний</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}