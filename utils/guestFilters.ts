import { Guest } from "../types/guest";

export const filterGuests = (
    guests: Guest[],
    searchTerm: string,
    statusFilter: string,
    categoryFilter: string,
): Guest[] => {
    return guests.filter(guest => {
        const matchesSearch = guest.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guest.phone.includes(searchTerm) ||
            guest.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'Все' || guest.status === statusFilter;
        const matchesCategory = categoryFilter === 'Все' || guest.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    })
}

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'VIP': return 'bg-purple-100 text-purple-800';
        case 'Премиум': return 'bg-gold-100 text-gold-800';
        case 'Обычный': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};
