import { useState, useEffect, useMemo } from 'react';

interface Supplier {
    id: number;
    name: string;
    Full_name?: string;
    type?: string;
    inn?: string;
    kpp?: string;
    ogrn?: string;
    legal_adress?: string;
    actual_adress?: string;
    phone?: string;
    email?: string;
    website?: string;
    nds?: number;
    egais?: boolean;
    honest_sign?: boolean;
    update_at?: string;
    create_at?: string;
    is_active?: boolean;
    point_retail_id: number;
}

interface Contact {
    id: number;
    counterparty_id: number;
    full_name: string;
    position?: string;
    phone?: string;
    email?: string;
    is_primary: boolean;
}

interface SalesPoint {
    id: number;
    name: string;
    address?: string;
}

interface UseSuppliersResult {
    suppliers: Supplier[];
    contacts: Contact[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useSuppliers = (selectedSalesPoint?: SalesPoint | null): UseSuppliersResult => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        try {
            setLoading(true);
            setError(null);

            // Загрузка поставщиков
            const counterpartiesResponse = await fetch('/counterparties/?skip=0&limit=100',{
                headers:{
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!counterpartiesResponse.ok) {
                throw new Error('Ошибка загрузки поставщиков');
            }
            const counterpartiesData: Supplier[] = await counterpartiesResponse.json();

            // Загрузка контактных лиц
            const contactsResponse = await fetch('/counterparties/contacts/?skip=0&limit=100',{
                headers:{
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!contactsResponse.ok) {
                throw new Error('Ошибка загрузки контактов');
            }
            const contactsData: Contact[] = await contactsResponse.json();

            setSuppliers(counterpartiesData);
            setContacts(contactsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
            console.error('Error loading suppliers data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Фильтрация поставщиков по точке продаж
    const filteredSuppliers = useMemo(() => {
        if (!selectedSalesPoint) return suppliers;

        return suppliers.filter(supplier =>
            supplier.point_retail_id === selectedSalesPoint.id
        );
    }, [suppliers, selectedSalesPoint]);

    // Фильтрация контактов по поставщикам выбранной точки продаж
    const filteredContacts = useMemo(() => {
        if (!selectedSalesPoint) return contacts;

        // Получаем ID поставщиков выбранной точки продаж
        const supplierIdsFromSelectedPoint = filteredSuppliers.map(supplier => supplier.id);

        // Фильтруем контакты, оставляя только те, которые принадлежат поставщикам выбранной точки
        return contacts.filter(contact =>
            supplierIdsFromSelectedPoint.includes(contact.counterparty_id)
        );
    }, [contacts, filteredSuppliers, selectedSalesPoint]);

    useEffect(() => {
        fetchData();
    }, []);

    return {
        suppliers: filteredSuppliers,
        contacts: filteredContacts,
        loading,
        error,
        refetch: fetchData
    };
};