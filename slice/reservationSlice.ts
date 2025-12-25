import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'sonner';

export interface Reservation {
    id: number;
    point_retail_id: number;
    guest_id: number;
    table_id: number;
    reservation_time: string;
    end_time: string;
    status: string;
    count_guest: number;
    comment: string;
    metadate: Record<string, any> | null;
}

export interface Guest {
    id: number;
    point_retail_id: number;
    full_name: string;
    phone: string;
    email: string;
    status: string;
    discount_id: number | null;
    date_at: string;
    address?: string;
    birthday?: string;
    amount_orders?: string;
    balls?: string;
    metadate?: {
        food_preferences?: string;
        preferred_drinks?: string;
        dietary_restrictions?: string;
        allergies?: string;
        special_requests?: string;
        preferred_table?: string;
    };
}

export interface TableData {
    id: number;
    point_retail_id: number;
    hall_id: number;
    name: string;
    count_seats: number;
    status: string;
}

export interface Hall {
    id: number;
    point_retail_id: number;
    name: string;
}

export interface PointRetail {
    id: number;
    name: string;
    address: string;
}

interface ReservationState {
    reservations: Reservation[];
    guests: Guest[];
    tables: TableData[];
    halls: Hall[];
    points: PointRetail[];
    selectedPoint: PointRetail | null;
    selectedDate: string | null;
    searchTerm: string;
    statusFilter: string;
    isLoading: boolean;
    isCreatingNewReservation: boolean;
    editingReservation: Reservation | null;
    viewingGuest: Guest | null;
    error: string | null;
}

const initialState: ReservationState = {
    reservations: [],
    guests: [],
    tables: [],
    halls: [],
    points: [],
    selectedPoint: null,
    selectedDate: null,
    searchTerm: '',
    statusFilter: 'Все',
    isLoading: false,
    isCreatingNewReservation: false,
    editingReservation: null,
    viewingGuest: null,
    error: null,
};

// Асинхронные thunks
export const fetchReservations = createAsyncThunk(
    'reservations/fetchReservations',
    async (forceRefresh = false) => {
        const token = localStorage.getItem('token');
        const response = await fetch('/reservations/?skip=0&limit=100', {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Ошибка загрузки бронирований');
        return await response.json();
    }
);

export const fetchGuests = createAsyncThunk(
    'reservations/fetchGuests',
    async () => {
        const token = localStorage.getItem('token');
        const response = await fetch('/guests/?skip=0&limit=100', {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    }
);

export const fetchTables = createAsyncThunk(
    'reservations/fetchTables',
    async () => {
        const token = localStorage.getItem('token');
        const response = await fetch('/tables/?skip=0&limit=100', {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    }
);

export const fetchHalls = createAsyncThunk(
    'reservations/fetchHalls',
    async () => {
        const token = localStorage.getItem('token');
        const response = await fetch('/hall-tables/?skip=0&limit=100', {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    }
);

export const fetchPoints = createAsyncThunk(
    'reservations/fetchPoints',
    async () => {
        const token = localStorage.getItem('token');
        const response = await fetch('/points-retail/?skip=0&limit=100', {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    }
);

export const updateReservation = createAsyncThunk(
    'reservations/updateReservation',
    async ({ id, data }: { id: number; data: Partial<Reservation> }) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`/reservations/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Ошибка обновления бронирования');
        return await response.json();
    }
);

export const deleteReservation = createAsyncThunk(
    'reservations/deleteReservation',
    async (id: number) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`/reservations/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Ошибка удаления бронирования');
        return id;
    }
);

export const createReservation = createAsyncThunk(
    'reservations/createReservation',
    async (data: Partial<Reservation>) => {
        const token = localStorage.getItem('token');
        const response = await fetch('/reservations/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Ошибка создания бронирования');
        return await response.json();
    }
);

const reservationSlice = createSlice({
    name: 'reservations',
    initialState,
    reducers: {
        setSelectedPoint: (state, action: PayloadAction<PointRetail | null>) => {
            state.selectedPoint = action.payload;
        },
        setSelectedDate: (state, action: PayloadAction<string | null>) => {
            state.selectedDate = action.payload;
        },
        setSearchTerm: (state, action: PayloadAction<string>) => {
            state.searchTerm = action.payload;
        },
        setStatusFilter: (state, action: PayloadAction<string>) => {
            state.statusFilter = action.payload;
        },
        setIsCreatingNewReservation: (state, action: PayloadAction<boolean>) => {
            state.isCreatingNewReservation = action.payload;
        },
        setEditingReservation: (state, action: PayloadAction<Reservation | null>) => {
            state.editingReservation = action.payload;
        },
        setViewingGuest: (state, action: PayloadAction<Guest | null>) => {
            state.viewingGuest = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetReservationState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // fetchReservations
            .addCase(fetchReservations.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchReservations.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reservations = action.payload;
                state.error = null;
            })
            .addCase(fetchReservations.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Ошибка загрузки бронирований';
            })

            // fetchGuests
            .addCase(fetchGuests.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchGuests.fulfilled, (state, action) => {
                state.guests = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchGuests.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Ошибка загрузки гостей';
            })

            // fetchTables
            .addCase(fetchTables.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchTables.fulfilled, (state, action) => {
                state.tables = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchTables.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Ошибка загрузки столов';
            })

            // fetchHalls
            .addCase(fetchHalls.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchHalls.fulfilled, (state, action) => {
                state.halls = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchHalls.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Ошибка загрузки залов';
            })

            // fetchPoints
            .addCase(fetchPoints.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPoints.fulfilled, (state, action) => {
                state.points = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchPoints.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Ошибка загрузки точек';
            })

            // updateReservation
            .addCase(updateReservation.fulfilled, (state, action) => {
                const index = state.reservations.findIndex(r => r.id === action.payload.id);
                if (index !== -1) {
                    state.reservations[index] = action.payload;
                }
                toast.success('Бронирование успешно обновлено');
            })
            .addCase(updateReservation.rejected, (state, action) => {
                state.error = action.error.message || 'Ошибка обновления бронирования';
                toast.error('Ошибка при обновлении бронирования');
            })

            // deleteReservation
            .addCase(deleteReservation.fulfilled, (state, action) => {
                state.reservations = state.reservations.filter(r => r.id !== action.payload);
                toast.success('Бронирование успешно удалено');
            })
            .addCase(deleteReservation.rejected, (state, action) => {
                state.error = action.error.message || 'Ошибка удаления бронирования';
                toast.error('Ошибка при удалении бронирования');
            })

            // createReservation
            .addCase(createReservation.fulfilled, (state, action) => {
                state.reservations.push(action.payload);
                state.isCreatingNewReservation = false;
                toast.success('Бронирование успешно создано');
            })
            .addCase(createReservation.rejected, (state, action) => {
                state.error = action.error.message || 'Ошибка создания бронирования';
                state.isCreatingNewReservation = false;
                toast.error('Ошибка при создании бронирования');
            });
    },
});

export const {
    setSelectedPoint,
    setSelectedDate,
    setSearchTerm,
    setStatusFilter,
    setIsCreatingNewReservation,
    setEditingReservation,
    setViewingGuest,
    clearError,
    resetReservationState,
} = reservationSlice.actions;

export default reservationSlice.reducer;