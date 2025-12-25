import { Reservation, NewReservation } from '../types/reservation';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { ReactElement } from 'react';

export const filterReservations = (
    reservations: Reservation[],
    searchTerm: string,
    statusFilter: string,
    dateFilter?: string | null,
): Reservation[] => {
    console.log('filterReservations called:', {
        reservationsCount: reservations.length,
        searchTerm,
        statusFilter,
        dateFilter,
        isDateFiltered: !!dateFilter
    });

    try {
        const result = reservations.filter(reservation => {
            // Фильтр по поиску
            const matchesSearch = searchTerm === '' ||
                reservation.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reservation.phone.includes(searchTerm);
            // Фильтр по статусу
            const matchesStatus = statusFilter === 'Все' || reservation.status === statusFilter;

            // Фильтр по дате - применяется ТОЛЬКО если dateFilter указан
            const matchesDate = !dateFilter || reservation.date === dateFilter;

            return matchesSearch && matchesStatus && matchesDate;
        });
        return result;
    } catch (error) {
        return reservations;
    }
};

export const getStatusIcon = (status: string): ReactElement => {
    switch (status) {
        case 'подтверждена':
            return <CheckCircle className="h-4 w-4" />;
        case 'отменена':
            return <XCircle className="h-4 w-4" />;
        default:
            return <Clock className="h-4 w-4" />;
    }
};

export const statusColors: Record<string, string> = {
    'подтверждена': 'bg-green-100 text-green-800',
    'ожидает подтверждения': 'bg-yellow-100 text-yellow-800',
    'отменена': 'bg-red-100 text-red-800',
    'завершена': 'bg-gray-100 text-gray-800'
};

export const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
];


export const zones = ['Основной зал', 'VIP зона', 'Терраса', 'Бар'];


export const getReservationStats = (reservations: Reservation[], date?: string) => {
    // Используем переданную дату или сегодняшнюю
    const targetDate = date || new Date().toISOString().split('T')[0];

    const dateReservations = reservations.filter(r => r.date === targetDate);
    const pending = dateReservations.filter(r => r.status === 'ожидает подтверждения').length;
    const confirmed = dateReservations.filter(r => r.status === 'подтверждена').length;
    const totalGuests = dateReservations
        .filter(r => r.status === 'подтверждена')
        .reduce((sum, r) => sum + r.guests, 0);

    return {
        todayReservations: dateReservations.length,
        pending,
        confirmed,
        totalGuests
    };
};

export const reservationData: Reservation[] = [
    {
        id: 1,
        guestName: 'Иванов Иван Иванович',
        phone: '+7 (495) 123-45-67',
        date: '2025-10-20',
        time: '19:00',
        guests: 4,
        table: 'Стол 5',
        zone: 'Основной зал',
        status: 'подтверждена',
        notes: 'Юбилей, нужен торт',
        waiter: 'Анна С.',
        createdAt: '2025-10-20 14:30'
    },
    {
        id: 2,
        guestName: 'Петрова Анна Сергеевна',
        phone: '+7 (495) 234-56-78',
        date: '2025-10-20',
        time: '18:30',
        guests: 2,
        table: 'Стол 12',
        zone: 'VIP зона',
        status: 'ожидает подтверждения',
        notes: 'Романтический ужин',
        waiter: null,
        createdAt: '2025-10-20 16:45'
    },
    {
        id: 3,
        guestName: 'Сидоров Владимир Николаевич',
        phone: '+7 (495) 345-67-89',
        date: '2025-10-20',
        time: '13:00',
        guests: 8,
        table: 'VIP зал',
        zone: 'VIP зона',
        status: 'подтверждена',
        notes: 'Деловой обед, отдельный счет на каждого',
        waiter: 'Мария Л.',
        createdAt: '2025-10-20 11:20'
    },
    {
        id: 4,
        guestName: 'Козлова Елена Петровна',
        phone: '+7 (495) 456-78-90',
        date: '2025-10-20',
        time: '20:00',
        guests: 6,
        table: 'Стол 8',
        zone: 'Терраса',
        status: 'отменена',
        notes: 'Семейный ужин',
        waiter: null,
        createdAt: '2025-10-20 09:15'
    },
    {
        id: 4,
        guestName: 'Козлова Елена Петровна',
        phone: '+7 (495) 456-78-90',
        date: '2025-10-21',
        time: '20:00',
        guests: 6,
        table: 'Стол 8',
        zone: 'Терраса',
        status: 'отменена',
        notes: 'Семейный ужин',
        waiter: null,
        createdAt: '2025-10-21 09:15'
    },
];