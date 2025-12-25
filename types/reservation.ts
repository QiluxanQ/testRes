export interface Reservation {
    id: number;
    guestName:string;
    phone:string;
    date:string;
    time:string;
    guests:number;
    table:string;
    zone:string;
    status: 'подтверждена' | 'ожидает подтверждения' | 'отменена' | 'завершена';
    notes:string;
    waiter:string;
    createdAt:string;
}
export interface NewReservation {
    guestName: string;
    phone: string;
    date: string;
    time: string;
    guests: string;
    zone: string;
    notes: string;
}