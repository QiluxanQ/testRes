import { Guest } from "../types/guest";
import { useState, useMemo, useEffect } from 'react';
import { filterGuests, getStatusColor } from "../utils/guestFilters";


export const useGuest = (selectedSalesPoint = null) => {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Все');
    const [categoryFilter, setCategoryFilter] = useState('Все');
    const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const [deletingGuest, setDeletingGuest] = useState<Guest | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const openDeleteDialog = (guest: Guest) => {
        setDeletingGuest(guest);
        setIsDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeletingGuest(null);
        setIsDeleteDialogOpen(false);
        setDeleteLoading(false);
    };

    const deleteGuest = async (guestId: number) => {
        setDeleteLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/guests/${guestId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка при удалении гостя: ${errorText}`);
            }

            // Удаляем гостя из локального состояния
            setGuests(prev => prev.filter(guest => guest.id !== guestId));
            closeDeleteDialog();

            alert('Гость успешно удален!');

        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert(`Не удалось удалить гостя: ${error.message}`);
            setDeleteLoading(false);
        }
    };

    const addGuest = (newGuest: Guest) => {
        setGuests(prev => [...prev, newGuest]);
    };

    const closeEditDialog = () => {
        setEditingGuest(null);
        setIsEditDialogOpen(false);
    };

    const updateGuest = (updatedGuest: Guest) => {
        setGuests(prev => prev.map(guest =>
            guest.id === updatedGuest.id ? updatedGuest : guest
        ));
        closeEditDialog();
    };

    const openEditDialog = (guest: Guest) => {
        setEditingGuest(guest);
        setIsEditDialogOpen(true);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchGuests = async () => {
            try {
                setLoading(true);
                const response = await fetch('/guests/?skip=0&limit=100',{
                    headers:{
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`

                    }
                });

                if (!response.ok) {
                    throw new Error(`Ошибка загрузки: ${response.status}`);
                }

                const guestsData: Guest[] = await response.json();
                setGuests(guestsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
                console.error('Ошибка загрузки гостей:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchGuests();
    }, []);


    const filteredGuests = useMemo(() => {
        let result = guests;


        if (selectedSalesPoint) {
            result = result.filter(guest =>
                guest.point_retail_id === selectedSalesPoint.id
            );
        }

        // Затем применяем остальные фильтры
        return filterGuests(result, searchTerm, statusFilter, categoryFilter);
    }, [guests, searchTerm, statusFilter, categoryFilter, selectedSalesPoint]);

    return {
        guests,
        setGuests,
        addGuest,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        categoryFilter,
        setCategoryFilter,
        filteredGuests,
        getStatusColor,
        loading,
        editingGuest,
        isEditDialogOpen,
        openEditDialog,
        closeEditDialog,
        updateGuest,
        deletingGuest,
        isDeleteDialogOpen,
        openDeleteDialog,
        closeDeleteDialog,
        deleteGuest,
        deleteLoading,
        error
    };
}