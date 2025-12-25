import { useState } from 'react';

interface ReservationFormData {
    guest_id: string;
    table_id: string;
    reservation_date: string;
    reservation_time: string;
    status: string;
    count_guest: number;
    comment: string;
}

interface ReservationData {
    point_retail_id: number;
    guest_id: number;
    table_id: number;
    reservation_time: string;
    end_time: string;
    status: string;
    count_guest: number;
    comment: string;
    metadate: any;
}

interface UseReservationProps {
    onSuccess?: () => void;
    onError?: (error: any) => void;
    onBack?: () => void;
}

export const useReservation = ({ onSuccess, onError, onBack }: UseReservationProps = {}) => {

    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatDateTime = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const validateFormData = (formData: ReservationFormData, selectedSalesPoint: any): string | null => {
        if (!selectedSalesPoint?.id) return 'Точка продаж не выбрана';
        if (!formData.guest_id) return 'Выберите гостя';
        if (!formData.table_id) return 'Выберите стол';
        if (!formData.reservation_date || !formData.reservation_time) return 'Выберите дату и время';
        return null;
    };

    const prepareReservationData = (
        formData: ReservationFormData,
        selectedSalesPoint: any
    ): ReservationData => {
        const reservationDateTime = new Date(`${formData.reservation_date}T${formData.reservation_time}:00`);
        const endDateTime = new Date(reservationDateTime.getTime() + 2 * 60 * 60 * 1000);

        return {
            point_retail_id: selectedSalesPoint.id,
            guest_id: parseInt(formData.guest_id),
            table_id: parseInt(formData.table_id),
            reservation_time: formatDateTime(reservationDateTime),
            end_time: formatDateTime(endDateTime),
            status: formData.status,
            count_guest: formData.count_guest,
            comment: formData.comment,
            metadate: null
        };
    };

    const createReservation = async (
        formData: ReservationFormData,
        selectedSalesPoint: any
    ) => {
        // Валидация
        const validationError = validateFormData(formData, selectedSalesPoint);
        if (validationError) {
            throw new Error(validationError);
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const reservationData = prepareReservationData(formData, selectedSalesPoint);

            console.log('Отправляемые данные бронирования:', reservationData);

            const response = await fetch('/reservations/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reservationData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Ошибка сервера:', errorText);
                throw new Error(`Ошибка создания бронирования: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateReservation = async (
        formData: ReservationFormData,
        selectedSalesPoint: any
    ) => {
        try {
            const newReservation = await createReservation(formData, selectedSalesPoint);

            alert('Бронирование успешно создано');

            if (onSuccess) onSuccess();
            if (onBack) onBack();

            return newReservation;
        } catch (error: any) {
            console.error('Error creating reservation:', error);
            alert(error.message || 'Ошибка создания бронирования');

            if (onError) onError(error);

            throw error;
        }
    };

    return {
        createReservation,
        handleCreateReservation,
        isSubmitting,
        setIsSubmitting
    };
};

