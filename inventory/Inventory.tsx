import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Progress } from '../../ui/progress';
import {
    Plus,
    Search,
    Package,
    Edit,
    Trash2,
    FolderOpen,
    Folder,
    ChevronRight,
    Loader2,
    ChevronDown,
    FileText,
    TrendingDown,
    ArrowUpDown,
    MapPin,
    History,
    Calendar,
    Download,
    Eye,
    Clock,
    ArrowLeft,
    ChevronLeft
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Separator } from '../../ui/separator';
import { AlertCircle } from 'lucide-react';
import { Label } from '../../ui/label';
import { Category, Unit,NewInventory,Price,Warehouse,InventoryItemAPI, Counterparty, ProductBatchItem, ProductBatch, Product, Inventory,InventoryRecord, Storage, PointRetail, InventoryItem, Batch, StockItem, Movement, InventoryDataItem, User, Counterparty } from '../../../types/inventory'
import Analitics from "./block/Analitics";
import BlcokDiteilView from "./block/BlcokDiteilView";
import ShowHistory from "./block/ShowHistory";
import CategoryItem from "./block/CategoryItem";
import {UseInventory} from '../../../hooks/inventory/useInventory'












const {buildCategoryTree,getCurrentPrice,getStockLevel,formatDateWithoutTimezone} = UseInventory()

const CategoryTree: React.FC<{
    categories: Category[];
    selectedCategory: number | null;
    onSelectCategory: (id: number) => void;
    onDeleteCategory: (id: number) => void;
    inventoryItems: Record<number, InventoryItem[]>;
    showAllItems?: boolean;
}> = React.memo(({ categories, selectedCategory, onSelectCategory, onDeleteCategory, inventoryItems, showAllItems = false }) => {
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
    const handleToggleExpand = useCallback((categoryId: number) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    }, []);


    const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);



    return (
        <div className="space-y-1">
            {categoryTree.map(category => (
                <CategoryItem
                    key={category.id}
                    category={category}
                    selectedCategory={selectedCategory}
                    onSelect={onSelectCategory}
                    onDelete={onDeleteCategory}
                    inventoryItems={inventoryItems}
                    expandedCategories={expandedCategories}
                    onToggleExpand={handleToggleExpand}
                    allCategories={categories}
                    showAllItems={showAllItems}
                />
            ))}
        </div>
    );
});

CategoryTree.displayName = 'CategoryTree';



interface InventoryProps {
    selectedSalesPoint: PointRetail | null;
}

export function Inventory({ selectedSalesPoint }: InventoryProps) {
    // Основные состояния
    const [categories, setCategories] = useState<Category[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [storages, setStorages] = useState<Storage[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [pointsRetail, setPointsRetail] = useState<PointRetail[]>([]);
    const [inventoryItems, setInventoryItems] = useState<Record<number, InventoryItem[]>>({});
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
    const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [addingItem, setAddingItem] = useState(false);
    const [prices, setPrices] = useState<Price[]>([]);
    const [productBatches, setProductBatches] = useState<ProductBatch[]>([]);
    const [productBatchItems, setProductBatchItems] = useState<ProductBatchItem[]>([]);


    const [inventoryItemsAPI, setInventoryItemsAPI] = useState<InventoryItemAPI[]>([]);

    const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'detail' | 'inventory' | 'history'>('list');

    const [inputValues, setInputValues] = useState<Record<number, string>>({});

    const [inventoryDateStart, setInventoryDateStart] = useState('');
    const [inventoryDateEnd, setInventoryDateEnd] = useState('');

    const [showAllSubcategories, setShowAllSubcategories] = useState(true);
    const [inventorySelectedCategory, setInventorySelectedCategory] = useState<number | null>(null);
    const [inventorySearchTerm, setInventorySearchTerm] = useState('');
    const [inventoryFilterStatus, setInventoryFilterStatus] = useState('all');
    const [inventoryFilterCategory, setInventoryFilterCategory] = useState('all');
    const [inventoryData, setInventoryData] = useState<StockItem[]>([]);
    const [inventoryCheckData, setInventoryCheckData] = useState<InventoryDataItem[]>([]);

    // Состояния для истории инвентаризаций
    const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>([]);

    const [currentInventory, setCurrentInventory] = useState<InventoryRecord | null>(null);
    const [inventoryName, setInventoryName] = useState('Инвентаризация ' + new Date().toLocaleDateString('ru-RU'));
    const [selectedWarehouseForInventory, setSelectedWarehouseForInventory] = useState<string>('');
    const [creatingInventory, setCreatingInventory] = useState(false);
    const [completingInventory, setCompletingInventory] = useState(false);


    const [activeTab, setActiveTab] = useState('categories');
    const [searchTermStock, setSearchTermStock] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedProductStock, setSelectedProductStock] = useState('');
    const [supplier, setSupplier] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [batchNumber, setBatchNumber] = useState('');
    const [receivedDate, setReceivedDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');

    // Состояния для движений
    const [users, setUsers] = useState<User[]>([]);
    const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
    const [movements, setMovements] = useState<Movement[]>([]);
    const [movementsLoading, setMovementsLoading] = useState(false);
    const [movementTypeFilter, setMovementTypeFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Состояния для прихода товара
    const [incomingWarehouse, setIncomingWarehouse] = useState<string>('');
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
    const [selectedIncomingProduct, setSelectedIncomingProduct] = useState<string>('');
    const [incomingQuantity, setIncomingQuantity] = useState<string>('');
    const [incomingPrice, setIncomingPrice] = useState<string>('');
    const [incomingBatchNumber, setIncomingBatchNumber] = useState<string>('');
    const [incomingSupplier, setIncomingSupplier] = useState<string>('');
    const [creatingIncoming, setCreatingIncoming] = useState(false);

    const [newCategory, setNewCategory] = useState({
        name: '',
        parent_id: null as number | null,
        point_retail_id: selectedSalesPoint ? selectedSalesPoint.id : null
    });

    const [newItem, setNewItem] = useState({
        name: '',
        unit_id: 1,
        currentStock: '',
        warehouse_id: 0,
        barcode: '',
        sku: '',
        purchase_price: '',
        type: 'product'
    });

    const dataLoadedRef = useRef(false);
    const movementsLoadedRef = useRef(false);

    useEffect(() => {
        const now = new Date();
        const formattedNow = now.toISOString().slice(0, 16);
        setInventoryDateStart(formattedNow);

        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formattedTomorrow = tomorrow.toISOString().slice(0, 16);
        setInventoryDateEnd(formattedTomorrow);
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };



    const getCurrentUser = (): { id: number; name: string } => {
        try {
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
                const user = JSON.parse(userStr);
                return { id: user.id || 1, name: user.username || 'Администратор' };
            }
        } catch (error) {
            console.error('Ошибка получения текущего пользователя:', error);
        }
        return { id: 1, name: 'Администратор' };
    };

    const loadInventoryRecords = useCallback(async () => {
        const headers = getAuthHeaders();
        try {
            const response = await fetch('/inventories/?skip=0&limit=100', { headers });
            if (response.ok) {
                const data = await response.json();
                setInventoryRecords(data);
                console.log('Инвентаризации загружены:', data.length);

                const activeInventory = data.find((inv: InventoryRecord) => !inv.date_end);
                if (activeInventory) {
                    setCurrentInventory(activeInventory);
                    console.log('Активная инвентаризация найдена:', activeInventory);
                }
            } else {
                console.error('Ошибка загрузки инвентаризаций:', response.status);
            }
        } catch (error) {
            console.error('Ошибка загрузки инвентаризаций:', error);
        }
    }, []);



    const createNewInventory = async () => {
        if (!selectedWarehouseForInventory) {
            alert('Пожалуйста, выберите склад для инвентаризации');
            return;
        }
        if (!inventoryDateStart) {
            alert('Пожалуйста, укажите дату начала инвентаризации');
            return;
        }
        try {
            setCreatingInventory(true);
            const currentUser = getCurrentUser();
            const headers = getAuthHeaders();
            const formatDateForAPI = (dateTimeString: string) => {
                if (!dateTimeString) return '';
                const date = new Date(dateTimeString);
                return formatDateWithoutTimezone(date);
            };
            const newInventoryData: NewInventory = {
                name: inventoryName,
                warehouse_id: parseInt(selectedWarehouseForInventory),
                user_id: currentUser.id,
                date_start: formatDateForAPI(inventoryDateStart),
                date_end: inventoryDateEnd ? formatDateForAPI(inventoryDateEnd) : '',
                count_product: products.length.toString(),
                metadate: {
                    description: `Инвентаризация склада ${warehouses.find(w => w.id === parseInt(selectedWarehouseForInventory))?.name}`,
                    created_by: currentUser.name,
                    items_count: products.length,
                    planned_end_date: inventoryDateEnd
                }
            };
            const response = await fetch('/inventories/', {
                method: 'POST',
                headers,
                body: JSON.stringify(newInventoryData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка создания инвентаризации: ${errorText}`);
            }

            const createdInventory = await response.json();
            setCurrentInventory(createdInventory);
            await loadInventoryRecords();

            // Сбрасываем форму
            setInventoryName('Инвентаризация ' + new Date().toLocaleDateString('ru-RU'));

            alert('Инвентаризация успешно создана!');

        } catch (error) {
            console.error('Ошибка создания инвентаризации:', error);
            alert('Не удалось создать инвентаризацию: Такое название уже используется');
        } finally {
            setCreatingInventory(false);
        }
    };


    const completeInventory = async () => {
        if (!currentInventory) {
            alert('Нет активной инвентаризации для завершения');
            return;
        }

        try {
            setCompletingInventory(true);

            const itemsToUpdate = inventoryCheckData.filter(item => {
                const actual = parseInventoryQuantity(item.actual);
                const system = parseInventoryQuantity(item.system);
                return actual !== system;
            });

            if (itemsToUpdate.length > 0) {
                await saveInventoryChanges(itemsToUpdate);
            }

            const headers = getAuthHeaders();
            const dateEnd = formatDateWithoutTimezone(new Date());

            const updateData = {
                ...currentInventory,
                date_end: dateEnd,
                count_product: inventoryCheckData.filter(i => i.difference !== 0).length.toString(),
                metadate: {
                    ...currentInventory.metadate,
                    completed_at: dateEnd,
                    discrepancies_count: inventoryCheckData.filter(i => i.difference !== 0).length,
                    total_items: inventoryCheckData.length,
                    items_updated: itemsToUpdate.length
                }
            };

            const response = await fetch(`/inventories/${currentInventory.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка завершения инвентаризации: ${errorText}`);
            }

            const completedInventory = await response.json();

            await loadInventoryRecords();

            setCurrentInventory(null);

            // Сбрасываем данные инвентаризации
            setInventoryCheckData([]);
            setInputValues({});
            setInventorySelectedCategory(null);
            setInventorySearchTerm('');
            setInventoryFilterStatus('all');
            setInventoryFilterCategory('all');

            alert(`Инвентаризация "${completedInventory.name}" успешно завершена!${itemsToUpdate.length > 0 ? ` Обновлено позиций: ${itemsToUpdate.length}` : ''}`);

        } catch (error) {
            console.error('Ошибка завершения инвентаризации:', error);
            alert('Не удалось завершить инвентаризацию: ' + (error as Error).message);
        } finally {
            setCompletingInventory(false);
        }
    };

    const saveInventoryChanges = async (itemsToUpdate) => {
        try {
            const updatePromises = itemsToUpdate.map(async (item) => {
                const inventoryItem = inventoryItemsAPI.find(inv => inv.product_id === item.id);
                if (inventoryItem) {
                    console.log('Updating inventory item:', inventoryItem.id, 'product:', item.name, 'actual:', item.actual);
                    return await saveInventoryData(inventoryItem.id, item.actual);
                } else {
                    console.log('Inventory item not found for product:', item.name, 'product_id:', item.id);
                    return null;
                }
            });

            const results = await Promise.all(updatePromises);
            console.log('Update results:', results);
            const updatedInventoryItemsAPI = [...inventoryItemsAPI];
            const updatedInventoryItems = { ...inventoryItems };

            itemsToUpdate.forEach((item, index) => {
                const inventoryItem = inventoryItemsAPI.find(inv => inv.product_id === item.id);
                if (inventoryItem && results[index]) {
                    const invIndex = updatedInventoryItemsAPI.findIndex(inv => inv.id === inventoryItem.id);
                    if (invIndex !== -1) {
                        updatedInventoryItemsAPI[invIndex] = {
                            ...updatedInventoryItemsAPI[invIndex],
                            actual_quantity: item.actual.toString()
                        };
                    }
                    const product = products.find(p => p.id === item.id);
                    if (product) {
                        const categoryId = product.categories_products_id;
                        if (updatedInventoryItems[categoryId]) {
                            const itemIndex = updatedInventoryItems[categoryId].findIndex(i => i.id === item.id);
                            if (itemIndex !== -1) {
                                updatedInventoryItems[categoryId][itemIndex] = {
                                    ...updatedInventoryItems[categoryId][itemIndex],
                                    currentStock: item.actual
                                };
                            }
                        }
                    }
                }
            });
            setInventoryItemsAPI(updatedInventoryItemsAPI);
            setInventoryItems(updatedInventoryItems);
            setInventoryData(prev => prev.map(stockItem => {
                const updatedItem = itemsToUpdate.find(item => item.id === stockItem.id);
                if (updatedItem) {
                    return {
                        ...stockItem,
                        totalStock: updatedItem.actual,
                        quantity: updatedItem.actual.toString()
                    };
                }
                return stockItem;
            }));
            return { success: true, count: itemsToUpdate.length };
        } catch (error) {
            console.error('Ошибка при сохранении изменений инвентаризации:', error);
            throw error;
        }
    };
    const getUserName = useCallback((userId?: number) => {
        if (!userId) return 'Не указан';

        const user = users.find(u => u.id === userId);
        if (user) {
            return user.username || user.name || `Пользователь #${userId}`;
        }
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (currentUser && currentUser.id === userId) {
                return currentUser.username || currentUser.name || `Пользователь #${userId}`;
            }
        } catch (error) {
            console.error('Ошибка при получении текущего пользователя:', error);
        }
        return `Пользователь #${userId}`;
    }, [users]);

    const getCounterpartyName = useCallback((counterpartyId?: number) => {
        if (!counterpartyId) return 'Не указан';

        const counterparty = counterparties.find(c => c.id === counterpartyId);
        if (counterparty) {
            return counterparty.name || counterparty.full_name || `Контрагент #${counterpartyId}`;
        }

        return `Контрагент #${counterpartyId}`;
    }, [counterparties]);

    const filterProductsBySalesPoint = useCallback((products: Product[], salesPoint: PointRetail | null) => {
        if (!salesPoint) return products;
        return products.filter(product => product.point_retail_id === salesPoint.id);
    }, []);

    const filterInventoryItemsBySalesPoint = useCallback((inventoryItems: InventoryItemAPI[], products: Product[], salesPoint: PointRetail | null) => {
        if (!salesPoint) return inventoryItems;
        const filteredProductIds = products
            .filter(product => product.point_retail_id === salesPoint.id)
            .map(product => product.id);
        return inventoryItems.filter(item => filteredProductIds.includes(item.product_id));
    }, []);

    const filterCategoriesBySalesPoint = useCallback((categories: Category[], salesPoint: PointRetail | null) => {
        if (!salesPoint) return categories;
        return categories.filter(category => category.point_retail_id === salesPoint.id);
    }, []);

    const fetchMovements = useCallback(async () => {
        try {
            setMovementsLoading(true);
            movementsLoadedRef.current = true;

            const headers = getAuthHeaders();

            const [receiptsRes, expendituresRes, writeOffsRes] = await Promise.all([
                fetch('/receipt-invoices/?skip=0&limit=50&include_items=true', { headers }),
                fetch('/expenditure-invoices/?skip=0&limit=50&include_items=true', { headers }),
                fetch('/act-debitings/?skip=0&limit=50&include_items=true', { headers })
            ]);

            const [receipts, expenditures, writeOffs] = await Promise.all([
                receiptsRes.ok ? receiptsRes.json() : [],
                expendituresRes.ok ? expendituresRes.json() : [],
                writeOffsRes.ok ? writeOffsRes.json() : []
            ]);

            const allMovements: Movement[] = [];

            const getProductName = (productId: number) => {
                const product = products.find(p => p.id === productId);
                return product ? product.name : `Товар #${productId}`;
            };
            const filteredProductIds = products.map(p => p.id);

            receipts.forEach((receipt: any) => {
                if (receipt.items && receipt.items.length > 0) {
                    receipt.items.forEach((item: any) => {

                        if (filteredProductIds.includes(item.product_id)) {
                            allMovements.push({
                                id: `receipt-${receipt.id}-${item.id}`,
                                date: receipt.date_create,
                                type: 'income' as const,
                                item: getProductName(item.product_id) || item.name || `Товар #${item.product_id}`,
                                quantity: parseFloat(item.quantity) || 0,
                                unit: item.unit || 'шт',
                                supplier: getCounterpartyName(receipt.counterparty_id),
                                batchNumber: receipt.number_doc,
                                total: parseFloat(item.price) || 0,
                                user: getUserName(receipt.user_id),
                                userId: receipt.user_id
                            });
                        }
                    });
                } else {
                    allMovements.push({
                        id: `receipt-${receipt.id}`,
                        date: receipt.date_create,
                        type: 'income' as const,
                        item: `Приходная накладная ${receipt.number_doc}`,
                        quantity: 1,
                        unit: 'док',
                        supplier: getCounterpartyName(receipt.counterparty_id),
                        batchNumber: receipt.number_doc,
                        total: parseFloat(receipt.amount) || 0,
                        user: getUserName(receipt.user_id),
                        userId: receipt.user_id
                    });
                }
            });

            expenditures.forEach((expenditure: any) => {
                if (expenditure.metadate?.items && expenditure.metadate.items.length > 0) {
                    expenditure.metadate.items.forEach((item: any, index: number) => {

                        if (filteredProductIds.includes(item.product_id)) {
                            allMovements.push({
                                id: `expenditure-${expenditure.id}-${index}`,
                                date: expenditure.date_create,
                                type: 'outcome' as const,
                                item: getProductName(item.product_id) || item.name || `Товар #${item.product_id || index + 1}`,
                                quantity: parseFloat(item.totalQty) || 0,
                                unit: item.unit || 'шт',
                                orderId: expenditure.number_doc,
                                total: parseFloat(item.purchasePrice) * parseFloat(item.totalQty) || 0,
                                user: getUserName(expenditure.user_id),
                                userId: expenditure.user_id
                            });
                        }
                    });
                } else {
                    allMovements.push({
                        id: `expenditure-${expenditure.id}`,
                        date: expenditure.date_create,
                        type: 'outcome' as const,
                        item: `Расходная накладная ${expenditure.number_doc}`,
                        quantity: 1,
                        unit: 'док',
                        orderId: expenditure.number_doc,
                        total: parseFloat(expenditure.amount) || 0,
                        user: getUserName(expenditure.user_id),
                        userId: expenditure.user_id
                    });
                }
            });

            writeOffs.forEach((writeOff: any) => {
                if (writeOff.metadate?.items && writeOff.metadate.items.length > 0) {
                    writeOff.metadate.items.forEach((item: any, index: number) => {
                        if (filteredProductIds.includes(item.product_id)) {
                            allMovements.push({
                                id: `writeoff-${writeOff.id}-${index}`,
                                date: writeOff.date_create,
                                type: 'writeoff' as const,
                                item: getProductName(item.product_id) || item.name || `Товар #${item.product_id || index + 1}`,
                                quantity: parseFloat(item.total) || 0,
                                unit: item.unit || 'шт',
                                reason: writeOff.reason_write_off,
                                user: getUserName(writeOff.user_id),
                                userId: writeOff.user_id
                            });
                        }
                    });
                } else {
                    allMovements.push({
                        id: `writeoff-${writeOff.id}`,
                        date: writeOff.date_create,
                        type: 'writeoff' as const,
                        item: `Акт списания ${writeOff.number_doc}`,
                        quantity: 1,
                        unit: 'док',
                        reason: writeOff.reason_write_off,
                        user: getUserName(writeOff.user_id),
                        userId: writeOff.user_id
                    });
                }
            });

            allMovements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setMovements(allMovements);

        } catch (error) {
            console.error('Ошибка загрузки движений:', error);
            movementsLoadedRef.current = false;
        } finally {
            setMovementsLoading(false);
        }
    }, [products, getUserName, getCounterpartyName]);

    useEffect(() => {
        if (activeTab === 'movements' && products.length > 0) {
            movementsLoadedRef.current = false;
            fetchMovements();
        }
    }, [activeTab, products, fetchMovements]);

    useEffect(() => {
        if (activeTab === 'movements' && !movementsLoading && !movementsLoadedRef.current && products.length > 0) {
            fetchMovements();
        }
    }, [activeTab, movementsLoading, fetchMovements, products]);

    const parseInventoryQuantity = useCallback((quantity: string | number): number => {
        if (quantity === undefined || quantity === null) return 0;

        try {
            if (typeof quantity === 'number') {
                return isNaN(quantity) ? 0 : quantity;
            }

            const strValue = String(quantity).trim();
            if (strValue === '' || strValue === 'null' || strValue === 'undefined') return 0;

            const parsed = parseFloat(strValue.replace(',', '.'));
            return isNaN(parsed) ? 0 : parsed;
        } catch (error) {
            console.error('Ошибка парсинга quantity:', quantity, error);
            return 0;
        }
    }, []);

    const loadUsersAndCounterparties = useCallback(async () => {
        const headers = getAuthHeaders();
        try {
            const [usersResponse, counterpartiesResponse] = await Promise.all([
                fetch('/users/?skip=0&limit=200', { headers }),
                fetch('/counterparties/?skip=0&limit=200', { headers })
            ]);

            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                setUsers(usersData);
            }

            if (counterpartiesResponse.ok) {
                const counterpartiesData = await counterpartiesResponse.json();
                setCounterparties(counterpartiesData);
                console.log('Поставщики загружены:', counterpartiesData.length);
            }
        } catch (error) {
            console.error('Ошибка загрузки пользователей и контрагентов:', error);
        }
    }, []);


    const getInventoryCategoryItems = useCallback((): InventoryDataItem[] => {
        if (!inventorySelectedCategory) {

            return products.map(product => {
                const inventoryItem = inventoryItemsAPI.find(item => item.product_id === product.id);
                const currentStock = inventoryItem ?
                    parseInventoryQuantity(inventoryItem.actual_quantity) ||
                    parseInventoryQuantity(inventoryItem.expected_quantity) : 0;

                const currentPrice = getCurrentPrice(prices, product.id, 'purchase');

                return {
                    id: product.id,
                    name: product.name,
                    system: currentStock,
                    actualString: currentStock.toString() || "0",
                    actual: currentStock,
                    difference: 0,
                    unit: units.find(u => u.id === product.unit_id)?.symbol || 'шт',
                    inventory_id: inventoryItem?.id,
                    product_id: product.id,
                    price: currentPrice,
                    category_id: product.categories_products_id,
                    category_name: categories.find(c => c.id === product.categories_products_id)?.name || 'Без категории'
                };
            });
        }

        const getAllProductsFromCategory = (categoryId: number): Product[] => {
            const items: Product[] = [];

            const productsInCategory = products.filter(p => p.categories_products_id === categoryId);
            items.push(...productsInCategory);

            const findSubcategories = (parentId: number): Category[] => {
                return categories.filter(cat => cat.parent_id === parentId);
            };

            const subcategories = findSubcategories(categoryId);

            // Рекурсивно добавляем товары из подкатегорий
            subcategories.forEach(subcategory => {
                items.push(...getAllProductsFromCategory(subcategory.id));
            });

            return items;
        };

        const productsInCategory = getAllProductsFromCategory(inventorySelectedCategory);

        return productsInCategory.map(product => {
            // Ищем inventory item для этого продукта
            const inventoryItem = inventoryItemsAPI.find(item => item.product_id === product.id);
            const currentStock = inventoryItem ?
                parseInventoryQuantity(inventoryItem.actual_quantity) ||
                parseInventoryQuantity(inventoryItem.expected_quantity) : 0;

            const currentPrice = getCurrentPrice(prices, product.id, 'purchase');

            return {
                id: product.id,
                name: product.name,
                system: currentStock,
                actualString: currentStock.toString(),
                actual: currentStock,
                difference: 0,
                unit: units.find(u => u.id === product.unit_id)?.symbol || 'шт',
                inventory_id: inventoryItem?.id,
                product_id: product.id,
                price: currentPrice,
                category_id: product.categories_products_id,
                category_name: categories.find(c => c.id === product.categories_products_id)?.name || 'Без категории'
            };
        });
    }, [inventorySelectedCategory, products, categories, units, prices, parseInventoryQuantity, inventoryItemsAPI]);

    const getFilteredInventoryCheckData = useMemo(() => {
        let filteredData = getInventoryCategoryItems();

        if (inventorySearchTerm) {
            filteredData = filteredData.filter(item =>
                item.name.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
                (item.category_name && item.category_name.toLowerCase().includes(inventorySearchTerm.toLowerCase()))
            );
        }

        if (inventoryFilterStatus !== 'all') {
            filteredData = filteredData.filter(item => {
                if (inventoryFilterStatus === 'matching' && item.difference === 0) return true;
                if (inventoryFilterStatus === 'mismatch' && item.difference !== 0) return true;
                if (inventoryFilterStatus === 'shortage' && item.difference < 0) return true;
                if (inventoryFilterStatus === 'excess' && item.difference > 0) return true;
                return false;
            });
        }

        if (inventoryFilterCategory !== 'all') {
            filteredData = filteredData.filter(item =>
                item.category_name === inventoryFilterCategory
            );
        }

        return filteredData;
    }, [getInventoryCategoryItems, inventorySearchTerm, inventoryFilterStatus, inventoryFilterCategory]);

    const loadPrices = useCallback(async () => {
        const headers = getAuthHeaders();
        try {
            const response = await fetch('/prices-products/?skip=0&limit=500', { headers });
            if (response.ok) {
                const pricesData = await response.json();
                setPrices(pricesData);
                console.log('Цены загружены:', pricesData.length);
            } else {
                console.error('Ошибка загрузки цен:', response.status);
            }
        } catch (error) {
            console.error('Ошибка загрузки цен:', error);
        }
    }, []);

    const loadProductBatches = useCallback(async () => {
        const headers = getAuthHeaders();
        try {
            const response = await fetch('/product-batches/?skip=0&limit=100', { headers });
            if (response.ok) {
                const batchesData = await response.json();
                setProductBatches(batchesData);
                console.log('Партии товаров загружены:', batchesData.length);
            } else {
                console.error('Ошибка загрузки партий товаров:', response.status);
            }
        } catch (error) {
            console.error('Ошибка загрузки партий товаров:', error);
        }
    }, []);

    // Загрузка элементов партий товаров
    const loadProductBatchItems = useCallback(async () => {
        const headers = getAuthHeaders();
        try {
            const response = await fetch('/product-batch-items/?skip=0&limit=100', { headers });
            if (response.ok) {
                const batchItemsData = await response.json();
                setProductBatchItems(batchItemsData);
                console.log('Элементы партий товаров загружены:', batchItemsData.length);
            } else {
                console.error('Ошибка загрузки элементов партий товаров:', response.status);
            }
        } catch (error) {
            console.error('Ошибка загрузки элементов партий товаров:', error);
        }
    }, []);

    // Загрузка складов (warehouses)
    const loadWarehouses = useCallback(async () => {
        const headers = getAuthHeaders();
        try {
            const response = await fetch('/warehouses/?skip=0&limit=100', { headers });
            if (response.ok) {
                const warehousesData = await response.json();
                setWarehouses(warehousesData);
                console.log('Склады загружены из /warehouses/:', warehousesData.length);

                if (warehousesData.length > 0 && newItem.warehouse_id === 0) {
                    setNewItem(prev => ({
                        ...prev,
                        warehouse_id: warehousesData[0].id
                    }));
                }

                if (warehousesData.length > 0 && !selectedWarehouseForInventory) {
                    setSelectedWarehouseForInventory(warehousesData[0].id.toString());
                }
            } else {
                console.error('Ошибка загрузки складов:', response.status);
            }
        } catch (error) {
            console.error('Ошибка загрузки складов:', error);
        }
    }, []);

    const loadAllData = useCallback(async () => {
        if (dataLoadedRef.current) return;
        try {
            setLoading(true);
            dataLoadedRef.current = true;
            movementsLoadedRef.current = false;
            const headers = getAuthHeaders();
            const [
                categoriesResponse,
                unitsResponse,
                productsResponse,
                inventoriesResponse,
                inventoryItemsResponse,
                storagesResponse,
                pointsRetailResponse
            ] = await Promise.all([
                fetch('/categories-products/?skip=0&limit=500', { headers }),
                fetch('/units/?skip=0&limit=200', { headers }),
                fetch('/products/?skip=0&limit=500', { headers }),
                fetch('/inventories/?skip=0&limit=500', { headers }),
                fetch('/inventory-items/?skip=0&limit=500', { headers }),
                fetch('/storages/?skip=0&limit=100', { headers }),
                fetch('/points-retail/?skip=0&limit=100', { headers })
            ]);
            const [
                categoriesData,
                unitsData,
                productsData,
                inventoriesData,
                inventoryItemsData,
                storagesData,
                pointsRetailData
            ] = await Promise.all([
                categoriesResponse.ok ? categoriesResponse.json() : [],
                unitsResponse.ok ? unitsResponse.json() : [],
                productsResponse.ok ? productsResponse.json() : [],
                inventoriesResponse.ok ? inventoriesResponse.json() : [],
                inventoryItemsResponse.ok ? inventoryItemsResponse.json() : [],
                storagesResponse.ok ? storagesResponse.json() : [],
                pointsRetailResponse.ok ? pointsRetailResponse.json() : []
            ]);


            const filteredProducts = filterProductsBySalesPoint(productsData, selectedSalesPoint);
            const filteredCategories = filterCategoriesBySalesPoint(categoriesData, selectedSalesPoint);
            const filteredInventoryItems = filterInventoryItemsBySalesPoint(inventoryItemsData, productsData, selectedSalesPoint);



            setCategories(filteredCategories);
            setUnits(unitsData);
            setPointsRetail(pointsRetailData);
            setProducts(filteredProducts);
            setInventories(inventoriesData);
            setInventoryItemsAPI(filteredInventoryItems); // Устанавливаем данные из inventory-items
            setStorages(storagesData);

            // Загружаем дополнительные данные
            await Promise.all([
                loadPrices(),
                loadProductBatches(),
                loadProductBatchItems(),
                loadWarehouses(),
                loadUsersAndCounterparties(),
                loadInventoryRecords() // Загружаем историю инвентаризаций
            ]);

            const itemsByCategory: Record<number, InventoryItem[]> = {};

            filteredProducts.forEach((product: Product) => {
                // Ищем inventory item для этого продукта из inventoryItemsAPI
                const inventoryItem = filteredInventoryItems.find((item: InventoryItemAPI) => item.product_id === product.id);
                const currentStock = inventoryItem ?
                    parseInventoryQuantity(inventoryItem.actual_quantity) ||
                    parseInventoryQuantity(inventoryItem.expected_quantity) : 0;

                const unit = unitsData.find(u => u.id === product.unit_id);
                const unitSymbol = unit?.symbol || 'шт';
                const productPrice = parseFloat(product.purchase_price || "0");

                const inventoryItemUI: InventoryItem = {
                    ...product,
                    currentStock: currentStock,
                    unit: unitSymbol,
                    storage_id: inventoryItem?.storage_id,
                    inventory_id: inventoryItem?.id,
                    purchase_price: productPrice.toString()
                };

                const categoryId = product.categories_products_id;
                if (!itemsByCategory[categoryId]) {
                    itemsByCategory[categoryId] = [];
                }
                itemsByCategory[categoryId].push(inventoryItemUI);
            });

            setInventoryItems(itemsByCategory);

        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            dataLoadedRef.current = false;
        } finally {
            setLoading(false);
        }
    }, [parseInventoryQuantity, selectedSalesPoint, filterProductsBySalesPoint, filterCategoriesBySalesPoint, filterInventoryItemsBySalesPoint, loadPrices, loadProductBatches, loadProductBatchItems, loadWarehouses, loadUsersAndCounterparties, loadInventoryRecords]);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    useEffect(() => {
        if (activeTab === 'movements' && !movementsLoading && !movementsLoadedRef.current) {
            fetchMovements();
        }
    }, [activeTab, movementsLoading, fetchMovements]);

    useEffect(() => {
        if (activeTab === 'inventory' && products.length > 0 && prices.length > 0 && inventoryItemsAPI.length > 0) {
            const initialData: InventoryDataItem[] = products.map(product => {
                // Ищем inventory item для этого продукта
                const inventoryItem = inventoryItemsAPI.find(item => item.product_id === product.id);
                const currentStock = inventoryItem ?
                    parseInventoryQuantity(inventoryItem.actual_quantity) ||
                    parseInventoryQuantity(inventoryItem.expected_quantity) : 0;

                const currentPrice = getCurrentPrice(prices, product.id, 'purchase');
                const category = categories.find(c => c.id === product.categories_products_id);

                return {
                    id: product.id,
                    name: product.name,
                    system: currentStock,
                    actualString: currentStock.toString() || '0',
                    actual: currentStock,
                    difference: 0,
                    unit: units.find(u => u.id === product.unit_id)?.symbol || 'шт',
                    inventory_id: inventoryItem?.id,
                    product_id: product.id,
                    price: currentPrice,
                    category_id: product.categories_products_id,
                    category_name: category?.name || 'Без категории'
                };
            });
            setInventoryCheckData(initialData);
        }
    }, [activeTab, products, units, prices, categories, inventoryItemsAPI]);

    const handleProductClick = useCallback((product: InventoryItem) => {
        setSelectedProduct(product);
        setViewMode('detail');
    }, []);

    const handleBackToList = useCallback(() => {
        setSelectedProduct(null);
        setViewMode('list');
    }, []);

    const handleBackToInventory = useCallback(() => {
        setViewMode('inventory');
    }, []);

    const handleShowHistory = useCallback(() => {
        setViewMode('history');
    }, []);

    const handleStartInventory = useCallback(() => {
        // Устанавливаем флаг, что пользователь нажал "Провести инвентаризацию"
        // и теперь нужно показать блок с категориями
        setViewMode('inventory');
    }, []);

    const getStockStatus = useCallback((item: StockItem) => {
        const percentage = (item.totalStock / item.optimalStock) * 100;
        if (percentage <= 20) return { label: 'Критично мало', color: 'red' };
        if (percentage <= 50) return { label: 'Мало', color: 'yellow' };
        return { label: 'В норме', color: 'green' };
    }, []);

    const getSimpleStockStatus = useCallback((currentStock: number) => {
        if (currentStock <= 0) return 'закончился';
        if (currentStock <= 10) return 'заканчивается';
        return 'в наличии';
    }, []);

    const getStatusColor = useCallback((status: string) => {
        switch (status) {
            case 'в наличии':
                return 'bg-green-100 text-green-800';
            case 'заканчивается':
                return 'bg-yellow-100 text-yellow-800';
            case 'закончился':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }, []);

    const getExpiryStatus = useCallback((daysUntilExpiry: number) => {
        if (daysUntilExpiry <= 0) return { status: 'expired', label: 'Просрочен', color: 'red' };
        if (daysUntilExpiry <= 3) return { status: 'warning', label: 'Скоро истекает', color: 'orange' };
        if (daysUntilExpiry <= 7) return { status: 'notice', label: 'Истекает', color: 'yellow' };
        return { status: 'ok', label: 'В норме', color: 'green' };
    }, []);

    const getMovementTypeBadge = useCallback((type: string) => {
        switch (type) {
            case 'income':
                return <Badge className="bg-green-100 text-green-800">Приход</Badge>;
            case 'outcome':
                return <Badge className="bg-blue-100 text-blue-800">Расход</Badge>;
            case 'writeoff':
                return <Badge className="bg-red-100 text-red-800">Списание</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    }, []);

    const filteredMovements = useMemo(() => {
        return movements.filter(movement => {
            const matchesType =
                movementTypeFilter === 'all' ||
                (movementTypeFilter === 'income' && movement.type === 'income') ||
                (movementTypeFilter === 'outcome' && movement.type === 'outcome') ||
                (movementTypeFilter === 'writeoff' && movement.type === 'writeoff');

            const movementDate = new Date(movement.date);
            const fromDate = dateFrom ? new Date(dateFrom) : null;
            const toDate = dateTo ? new Date(dateTo + 'T23:59:59') : null;

            const matchesDate =
                (!fromDate || movementDate >= fromDate) &&
                (!toDate || movementDate <= toDate);

            return matchesType && matchesDate;
        });
    }, [movements, movementTypeFilter, dateFrom, dateTo]);

    // Обновляем inventoryData с учетом цен и inventory items
    useEffect(() => {
        if (products.length > 0 && inventoryItemsAPI.length > 0 && prices.length > 0) {
            const stockItems: StockItem[] = products.map((product: Product) => {
                // Ищем inventory item для этого продукта
                const inventoryItem = inventoryItemsAPI.find(item => item.product_id === product.id);
                const currentStock = inventoryItem ?
                    parseInventoryQuantity(inventoryItem.actual_quantity) ||
                    parseInventoryQuantity(inventoryItem.expected_quantity) : 0;

                const unit = units.find(u => u.id === product.unit_id);
                const category = categories.find(c => c.id === product.categories_products_id);
                const currentPrice = getCurrentPrice(prices, product.id, 'purchase');

                const minStock = Math.max(1, Math.round(currentStock * 0.2));
                const optimalStock = Math.max(minStock * 2, Math.round(currentStock * 1.5));

                return {
                    id: product.id,
                    name: product.name,
                    category: category?.name || 'Без категории',
                    totalStock: currentStock,
                    unit: unit?.symbol || 'шт',
                    minStock: minStock,
                    optimalStock: optimalStock,
                    avgPrice: currentPrice || parseFloat(product.purchase_price || "0"),
                    turnoverRate: 2.5 + Math.random() * 2,
                    daysInStock: currentStock / (5.2 + Math.random() * 3),
                    wastePercentage: Math.random() * 5,
                    batches: [
                        {
                            id: 1,
                            quantity: currentStock,
                            purchasePrice: currentPrice || parseFloat(product.purchase_price || "0"),
                            receivedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            daysUntilExpiry: 30,
                            batchNumber: `BATCH-${product.id}`,
                            supplier: 'Основной поставщик'
                        }
                    ],
                    product_id: product.id,
                    storage_id: inventoryItem?.storage_id,
                    quantity: inventoryItem ? inventoryItem.actual_quantity || inventoryItem.expected_quantity : "0"
                };
            });

            setInventoryData(stockItems);
        }
    }, [products, units, categories, prices, inventoryItemsAPI]);

    const filteredInventory = useMemo(() => {
        return inventoryData.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTermStock.toLowerCase());
            const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [inventoryData, searchTermStock, filterCategory]);

    const categoriesList = useMemo(() =>
            Array.from(new Set(inventoryData.map(item => item.category))),
        [inventoryData]
    );

    const getAllItems = useCallback((): InventoryItem[] => {
        return Object.values(inventoryItems).flat();
    }, [inventoryItems]);

    const getCategoryItems = useCallback((): InventoryItem[] => {
        if (!selectedCategory) return [];

        // Функция для сбора всех элементов из категории и ее подкатегорий
        const getAllItemsFromCategory = (categoryId: number): InventoryItem[] => {
            const items: InventoryItem[] = [];

            // Добавляем элементы из текущей категории
            const currentItems = inventoryItems[categoryId] || [];
            items.push(...currentItems);

            // Находим подкатегории для этой категории
            const findSubcategories = (parentId: number): Category[] => {
                return categories.filter(cat => cat.parent_id === parentId);
            };

            const subcategories = findSubcategories(categoryId);

            // Рекурсивно добавляем элементы из подкатегорий
            subcategories.forEach(subcategory => {
                items.push(...getAllItemsFromCategory(subcategory.id));
            });

            return items;
        };

        return getAllItemsFromCategory(selectedCategory);
    }, [selectedCategory, inventoryItems, categories]);

    const filteredItems = useMemo(() => {
        const items = getCategoryItems();
        return items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.barcode && item.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [getCategoryItems, searchTerm]);

    const getWarehouseStats = useCallback(() => {
        const allItems = getAllItems();
        const total = allItems.length;
        const lowStock = allItems.filter(item => getSimpleStockStatus(item.currentStock) === 'заканчивается').length;
        const outOfStock = allItems.filter(item => getSimpleStockStatus(item.currentStock) === 'закончился').length;

        // Рассчитываем общую стоимость с учетом цен из API
        const totalValue = allItems.reduce((sum, item) => {
            const itemPrice = getCurrentPrice(prices, item.id, 'purchase') || parseFloat(item.purchase_price || "0");
            return sum + (item.currentStock * itemPrice);
        }, 0);

        return { total, lowStock, outOfStock, totalValue };
    }, [getAllItems, getSimpleStockStatus, prices]);

    const stats = useMemo(() => getWarehouseStats(), [getWarehouseStats]);

    const handleAddCategory = async () => {
        if (newCategory.name.trim()) {
            try {
                const headers = getAuthHeaders();
                headers['Content-Type'] = 'application/json';


                const categoryData = {
                    name: newCategory.name,
                    parent_id: newCategory.parent_id,
                    point_retail_id: selectedSalesPoint ? selectedSalesPoint.id : 1
                };

                console.log('Создание категории с данными:', categoryData);

                const response = await fetch('/categories-products/', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(categoryData)
                });

                if (response.ok) {
                    const createdCategory = await response.json();
                    setCategories(prev => [...prev, createdCategory]);
                    setInventoryItems(prev => ({ ...prev, [createdCategory.id]: [] }));

                    // Сбрасываем форму с учетом текущей точки продаж
                    setNewCategory({
                        name: '',
                        parent_id: null,
                        point_retail_id: selectedSalesPoint ? selectedSalesPoint.id : null
                    });

                    setAddCategoryDialogOpen(false);
                    alert('Категория успешно создана!');
                } else {
                    const errorText = await response.text();
                    console.error('Ошибка API при создании категории:', errorText);
                    alert('Не удалось создать категорию: ' + errorText);
                }
            } catch (error) {
                console.error('Ошибка при создании категории:', error);
                alert('Не удалось создать категорию: ' + (error as Error).message);
            }
        } else {
            alert('Пожалуйста, введите название категории');
        }
    };

    const handleAddItem = async () => {
        if (selectedCategory && newItem.name.trim() && newItem.warehouse_id) {
            try {
                setAddingItem(true);

                const headers = getAuthHeaders();
                headers['Content-Type'] = 'application/json';

                const productData = {
                    point_retail_id: selectedSalesPoint ? selectedSalesPoint.id : (pointsRetail.length > 0 ? pointsRetail[0].id : 1),
                    categories_products_id: selectedCategory,
                    name: newItem.name,
                    sku: newItem.sku || `SKU-${Date.now()}`,
                    barcode: newItem.barcode || `BC-${Date.now()}`,
                    type: newItem.type,
                    unit_id: newItem.unit_id,
                    expiration_date: null,
                    purchase_price: newItem.purchase_price || "0.00",
                    is_active: true,
                    metadate: {
                        warehouse_id: newItem.warehouse_id,
                        initial_stock: newItem.currentStock || "0"
                    }
                };

                const productResponse = await fetch('/products/', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(productData)
                });

                if (!productResponse.ok) {
                    const errorText = await productResponse.text();
                    throw new Error(`Не удалось создать продукт: ${errorText}`);
                }

                const createdProduct = await productResponse.json();

                // Теперь создаем инвентарь через /inventory-items/ endpoint
                try {
                    const inventoryItemData = {
                        storage_id: newItem.warehouse_id,
                        product_id: createdProduct.id,
                        expected_quantity: newItem.currentStock || "0",
                        actual_quantity: newItem.currentStock || "0",
                        unit_id: newItem.unit_id || 1,
                        metadate: {}
                    };

                    const inventoryItemResponse = await fetch('/inventory-items/', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(inventoryItemData)
                    });

                    if (!inventoryItemResponse.ok) {
                        const inventoryItemError = await inventoryItemResponse.text();
                        console.warn('Не удалось создать инвентарь через /inventory-items/:', inventoryItemError);
                    } else {
                        const createdInventoryItem = await inventoryItemResponse.json();
                        // Обновляем локальное состояние
                        setInventoryItemsAPI(prev => [...prev, createdInventoryItem]);
                    }
                } catch (inventoryError) {
                    console.warn('Ошибка при создании инвентаря:', inventoryError);
                    // Продолжаем, даже если инвентарь не создался
                }

                // Перезагружаем все данные
                dataLoadedRef.current = false;
                await loadAllData();

                setNewItem({
                    name: '',
                    unit_id: 1,
                    currentStock: '',
                    warehouse_id: warehouses.length > 0 ? warehouses[0].id : 0,
                    barcode: '',
                    sku: '',
                    purchase_price: '',
                    type: 'product'
                });
                setAddItemDialogOpen(false);

                alert('Товар успешно добавлен!');

            } catch (error) {
                console.error('Ошибка при создании элемента:', error);
                alert('Не удалось добавить элемент: ' + (error as Error).message);
            } finally {
                setAddingItem(false);
            }
        } else {
            alert('Пожалуйста, заполните обязательные поля: название и выберите склад');
        }
    };
    const handleDeleteCategory = async (categoryId: number) => {
        if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
            try {
                const headers = getAuthHeaders();
                const response = await fetch(`/categories-products/${categoryId}`, {
                    method: 'DELETE',
                    headers
                });

                if (response.ok) {
                    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
                    setInventoryItems(prev => {
                        const newItems = { ...prev };
                        delete newItems[categoryId];
                        return newItems;
                    });
                    if (selectedCategory === categoryId) {
                        setSelectedCategory(null);
                    }
                } else {
                    const errorText = await response.text();
                    console.error('Ошибка API при удалении категории:', errorText);
                    alert('Не удалось удалить категорию: ' + errorText);
                }
            } catch (error) {
                console.error('Ошибка при удалении категории:', error);
                alert('Не удалось удалить категорию: ' + (error as Error).message);
            }
        }
    };

    const handleDeleteItem = async (categoryId: number, itemId: number, inventoryId?: number) => {
        if (confirm('Вы уверены, что хотите удалить этот элемент?')) {
            try {
                const headers = getAuthHeaders();

                if (inventoryId) {
                    try {
                        const inventoryResponse = await fetch(`/inventory-items/${inventoryId}`, {
                            method: 'DELETE',
                            headers
                        });

                        if (!inventoryResponse.ok) {
                            const errorText = await inventoryResponse.text();
                            if (!errorText.includes('Инвентарь не найден')) {
                                console.warn('Не удалось удалить инвентарь:', errorText);
                            }
                        }
                    } catch (inventoryError) {
                        console.warn('Ошибка при удалении инвентаря:', inventoryError);
                    }
                }

                const productResponse = await fetch(`/products/${itemId}`, {
                    method: 'DELETE',
                    headers
                });

                if (!productResponse.ok) {
                    const errorText = await productResponse.text();
                    throw new Error(`Не удалось удалить продукт: ${errorText}`);
                }

                // Обновляем UI
                setInventoryItems(prev => ({
                    ...prev,
                    [categoryId]: prev[categoryId].filter(item => item.id !== itemId)
                }));

                // Удаляем из inventoryItemsAPI
                setInventoryItemsAPI(prev => prev.filter(item => item.product_id !== itemId));

            } catch (error) {
                console.error('Ошибка при удалении элемента:', error);
                alert('Не удалось удалить элемент: ' + (error as Error).message);
            }
        }
    };

    const saveInventoryData = async (inventoryId: number, actualQuantity: number) => {
        try {
            const headers = getAuthHeaders();
            const formattedQuantity = actualQuantity.toFixed(2);
            console.log('Saving inventory data:', inventoryId, 'quantity:', formattedQuantity);

            const response = await fetch(`/inventory-items/${inventoryId}`, {
                method: 'PUT',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    actual_quantity: formattedQuantity
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Не удалось обновить остаток: ${errorText}`);
            }

            const result = await response.json();
            console.log('Save successful:', result);
            return result;
        } catch (error) {
            console.error('Ошибка при обновлении остатка:', error);
            throw error;
        }
    };

    const handleInventoryActualChange = (itemId: number, newValue: string) => {
        setInputValues(prev => ({
            ...prev,
            [itemId]: newValue
        }));

        const actual = newValue === '' ? 0 : parseFloat(newValue) || 0;

        setInventoryCheckData(prev =>
            prev.map(i =>
                i.id === itemId
                    ? {
                        ...i,
                        actualString: newValue,
                        actual: actual,
                        difference: actual - i.system
                    }
                    : i
            )
        );
    };

    const handleCompleteInventory = async () => {
        const itemsToUpdate = inventoryCheckData.filter(item => {
            const actual = parseInventoryQuantity(item.actual);
            const system = parseInventoryQuantity(item.system);
            return actual !== system;
        });

        console.log('Items to update:', itemsToUpdate);
        console.log('Total items:', inventoryCheckData.length);
        console.log('Items with changes:', itemsToUpdate.length);

        if (itemsToUpdate.length === 0) {
            if (confirm('Нет изменений для сохранения. Завершить инвентаризацию?')) {
                await completeInventory();
            }
            return;
        }

        // Показываем детали изменений
        const changesSummary = itemsToUpdate.map(item => {
            const diff = item.difference;
            const sign = diff > 0 ? '+' : '';
            return `• ${item.name}: ${item.system} → ${item.actual} (${sign}${diff} ${item.unit})`;
        }).join('\n');

        if (confirm(`Вы собираетесь завершить инвентаризацию и сохранить следующие изменения:${changesSummary}Продолжить?`)) {
            await completeInventory();
        }
    };

    const handleCreateIncoming = async () => {
        if (!selectedIncomingProduct || !incomingQuantity || !incomingWarehouse || !incomingSupplier || !incomingPrice) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        try {
            setCreatingIncoming(true);
            const headers = getAuthHeaders();
            headers['Content-Type'] = 'application/json';

            // Находим выбранный продукт
            const product = products.find(p => p.name === selectedIncomingProduct);
            if (!product) {
                throw new Error('Продукт не найден');
            }


            const warehouse = warehouses.find(w => w.id === parseInt(incomingWarehouse));
            if (!warehouse) {
                throw new Error('Склад не найден');
            }
            let storageId = null;
            const existingStorage = storages.find(s => s.warehouse_id === parseInt(incomingWarehouse));
            if (existingStorage) {
                storageId = existingStorage.id;
            } else {

                try {
                    const newStorageData = {
                        warehouse_id: parseInt(incomingWarehouse),
                        capacity: "0",
                        type: "main",
                        metadate: {}
                    };

                    const storageResponse = await fetch('/storages/', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(newStorageData)
                    });

                    if (storageResponse.ok) {
                        const createdStorage = await storageResponse.json();
                        storageId = createdStorage.id;
                        // Обновляем локальный список storages
                        setStorages(prev => [...prev, createdStorage]);
                    } else {

                        console.warn('Не удалось создать storage');
                        storageId = parseInt(incomingWarehouse);
                    }
                } catch (storageError) {
                    console.warn('Ошибка при создании storage:', storageError);
                    storageId = parseInt(incomingWarehouse);
                }
            }

            let counterpartyId = 1;
            const counterparty = counterparties.find(c =>
                c.name.toLowerCase().includes(incomingSupplier.toLowerCase()) ||
                c.full_name?.toLowerCase().includes(incomingSupplier.toLowerCase())
            );

            if (counterparty) {
                counterpartyId = counterparty.id;
            } else if (counterparties.length > 0) {
                counterpartyId = counterparties[0].id;
            }
            const currentDate = new Date();
            const formattedDate = formatDateWithoutTimezone(currentDate);

            // Создаем партию товара
            const batchData = {
                warehouse_id: parseInt(incomingWarehouse),
                receipt_invoice_id: counterpartyId,
                quantity: incomingQuantity,
                unit_id: product.unit_id,
                name: incomingBatchNumber || `Партия ${product.name} ${new Date().toLocaleDateString()}`,
                status: 'in_stock',
                date: formattedDate,
                metadate: {
                    supplier: incomingSupplier,
                    price_per_unit: incomingPrice,
                    total_cost: (parseFloat(incomingQuantity) * parseFloat(incomingPrice)).toFixed(2)
                }
            };

            console.log('Создание партии товара:', batchData);

            const batchResponse = await fetch('/product-batches/', {
                method: 'POST',
                headers,
                body: JSON.stringify(batchData)
            });

            if (!batchResponse.ok) {
                const errorText = await batchResponse.text();
                throw new Error(`Ошибка создания партии: ${errorText}`);
            }

            const createdBatch = await batchResponse.json();
            const batchItemData = {
                product_batch_id: createdBatch.id,
                storage_id: storageId,
                product_id: product.id,
                quantity: incomingQuantity,
                unit_id: product.unit_id,
                expiration_date: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 дней по умолчанию
                metadate: {
                    purchase_price: incomingPrice
                }
            };

            console.log('Создание элемента партии:', batchItemData);

            const batchItemResponse = await fetch('/product-batch-items/', {
                method: 'POST',
                headers,
                body: JSON.stringify(batchItemData)
            });

            if (!batchItemResponse.ok) {
                const errorText = await batchItemResponse.text();
                throw new Error(`Ошибка создания элемента партии: ${errorText}`);
            }

            const createdBatchItem = await batchItemResponse.json();

            // Обновляем или создаем запись в inventory-items
            const existingInventoryItem = inventoryItemsAPI.find(item => item.product_id === product.id);
            const currentQuantity = existingInventoryItem ?
                parseFloat(existingInventoryItem.actual_quantity) ||
                parseFloat(existingInventoryItem.expected_quantity) : 0;

            const newQuantity = currentQuantity + parseFloat(incomingQuantity);

            if (existingInventoryItem) {
                // Обновляем существующий inventory item
                const inventoryItemData = {
                    ...existingInventoryItem,
                    actual_quantity: newQuantity.toFixed(2),
                    storage_id: storageId // Используем storageId
                };

                const inventoryItemResponse = await fetch(`/inventory-items/${existingInventoryItem.id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(inventoryItemData)
                });

                if (!inventoryItemResponse.ok) {
                    console.warn('Не удалось обновить inventory item, но партия создана');
                } else {
                    const updatedItem = await inventoryItemResponse.json();

                    setInventoryItemsAPI(prev => prev.map(item =>
                        item.id === existingInventoryItem.id ? updatedItem : item
                    ));
                }
            } else {

                const inventoryItemData = {
                    storage_id: storageId,
                    product_id: product.id,
                    expected_quantity: incomingQuantity,
                    actual_quantity: incomingQuantity,
                    unit_id: product.unit_id,
                    metadate: {}
                };

                const inventoryItemResponse = await fetch('/inventory-items/', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(inventoryItemData)
                });

                if (!inventoryItemResponse.ok) {
                    console.warn('Не удалось создать inventory item, но партия создана');
                } else {
                    const createdItem = await inventoryItemResponse.json();
                    // Обновляем локальное состояние
                    setInventoryItemsAPI(prev => [...prev, createdItem]);
                }
            }

            // Перезагружаем данные
            dataLoadedRef.current = false;
            await loadAllData();

            // Сбрасываем форму
            setSelectedIncomingProduct('');
            setIncomingQuantity('');
            setIncomingPrice('');
            setIncomingBatchNumber('');
            setIncomingSupplier('');
            setIncomingWarehouse('');
            setExpiryDate('');
            setSelectedWarehouse('');

            alert('Приход товара успешно оформлен!');
        } catch (error) {
            console.error('Ошибка при оформлении прихода:', error);
            alert('Не удалось оформить приход: ' + (error as Error).message);
        } finally {
            setCreatingIncoming(false);
        }
    };


    if (viewMode === 'detail' && selectedProduct) {
        return (
            <BlcokDiteilView
                product={selectedProduct}
                onBack={handleBackToList}
                pointsRetail={pointsRetail}
                categories={categories}
                selectedSalesPoint={selectedSalesPoint}
                prices={prices}
                productBatches={productBatches}
                productBatchItems={productBatchItems}
                warehouses={warehouses}
                inventoryItemsAPI={inventoryItemsAPI}
            />
        );
    }

    return (
        <div className="space-y-6">
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader>
                    <div className="flex items-center justify-between text-white">
                        <CardTitle style={{color:'var(--custom-text)'}}>Управление складом</CardTitle>
                        {selectedSalesPoint && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                Точка продаж: {selectedSalesPoint.name}
                                {selectedSalesPoint.address && ` (${selectedSalesPoint.address})`}
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList className="grid w-full grid-cols-6 bg-blue-100" >
                            <TabsTrigger value="categories">Категории и товары</TabsTrigger>
                            <TabsTrigger value="stock">Остатки на складе</TabsTrigger>
                            <TabsTrigger value="incoming">Приход товара</TabsTrigger>
                            <TabsTrigger value="inventory">Инвентаризация</TabsTrigger>
                            <TabsTrigger value="movements">История движений</TabsTrigger>
                            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
                        </TabsList>

                        {/* Категории и товары */}
                        <TabsContent value="categories" className="space-y-4" >
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <Card className="lg:col-span-1" style={{
                                    borderRadius: '20px',
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-secondaryLineCard)',
                                    color: 'var(--custom-text)',
                                }}>
                                    <CardHeader>
                                        <div className="flex justify-between items-center text-white">
                                            <CardTitle style={{color:'var(--custom-text)'}}>Категории</CardTitle>
                                            <Dialog open={addCategoryDialogOpen} onOpenChange={setAddCategoryDialogOpen} >
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="outline">
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Добавить категорию</DialogTitle>
                                                        <DialogDescription>Создайте новую категорию для складских элементов</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">Название категории *</label>
                                                            <Input
                                                                placeholder="Например: Специи и приправы"
                                                                value={newCategory.name}
                                                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}

                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">Родительская категория</label>
                                                            <Select
                                                                value={newCategory.parent_id?.toString() || "0"}
                                                                onValueChange={(value) => setNewCategory({ ...newCategory, parent_id: value === "0" ? null : parseInt(value) })}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Выберите родительскую категорию" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="0">Основная категория (без родителя)</SelectItem>
                                                                    {categories.map((category) => (
                                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                                            {category.name} (ID: {category.id})
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="outline" onClick={() => setAddCategoryDialogOpen(false)}>
                                                                Отмена
                                                            </Button>
                                                            <Button onClick={handleAddCategory} className="bg-orange-600 hover:bg-orange-700">
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Добавить
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="px-0 pb-2" style={{ height: '400px', overflowY: 'auto' }}>
                                            {categories.length === 0 ? (
                                                <div className="text-center py-8 text-muted-foreground text-sm">
                                                    <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                                    <p>Нет категорий</p>
                                                    <p className="text-xs">Добавьте первую категорию</p>
                                                </div>
                                            ) : (
                                                <CategoryTree
                                                    categories={categories}
                                                    selectedCategory={selectedCategory}
                                                    onSelectCategory={setSelectedCategory}
                                                    onDeleteCategory={handleDeleteCategory}
                                                    inventoryItems={inventoryItems}
                                                />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="lg:col-span-3" style={{
                                    borderRadius: '20px',
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-secondaryLineCard)',
                                    color: 'var(--custom-text)',
                                }}>
                                    <CardHeader>
                                        <div className="flex justify-between items-center text-white">
                                            <div>
                                                <CardTitle style={{color:'var(--custom-text)'}} >
                                                    {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name || `Категория ${selectedCategory}` : 'Выберите категорию'}
                                                </CardTitle>
                                                {selectedCategory && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        ID категории: {selectedCategory} | Элементов: {getCategoryItems().length}
                                                    </p>
                                                )}
                                            </div>
                                            {selectedCategory && (
                                                <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button className="bg-orange-600 hover:bg-orange-700">
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Добавить элемент
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Добавить элемент на склад</DialogTitle>
                                                            <DialogDescription>Добавление в категорию: {categories.find(c => c.id === selectedCategory)?.name}</DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Название *</label>
                                                                    <Input
                                                                        placeholder="Название продукта"
                                                                        value={newItem.name}
                                                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Штрих-код</label>
                                                                    <Input
                                                                        placeholder="Штрих-код"
                                                                        value={newItem.barcode}
                                                                        onChange={(e) => setNewItem({ ...newItem, barcode: e.target.value })}

                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">SKU</label>
                                                                    <Input
                                                                        placeholder="Артикул"
                                                                        value={newItem.sku}
                                                                        onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Цена закупки</label>
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="0"
                                                                        value={newItem.purchase_price}
                                                                        onChange={(e) => setNewItem({ ...newItem, purchase_price: e.target.value })}
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Текущий остаток *</label>
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="0"
                                                                        value={newItem.currentStock}
                                                                        onChange={(e) => setNewItem({ ...newItem, currentStock: e.target.value })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Единица измерения *</label>
                                                                    <Select value={newItem.unit_id.toString()} onValueChange={(value) => setNewItem({ ...newItem, unit_id: parseInt(value) })}>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Выберите" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {units.map((unit) => (
                                                                                <SelectItem key={unit.id} value={unit.id.toString()}>
                                                                                    {unit.name} ({unit.symbol})
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Склад *</label>
                                                                    <Select
                                                                        value={newItem.warehouse_id.toString()}
                                                                        onValueChange={(value) => setNewItem({ ...newItem, warehouse_id: parseInt(value) })}
                                                                        required
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Выберите склад" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {warehouses.map((warehouse) => (
                                                                                <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                                                    {warehouse.name}
                                                                                    {warehouse.address && ` - ${warehouse.address}`}
                                                                                    {warehouse.type && ` (${warehouse.type})`}
                                                                                </SelectItem>
                                                                            ))}
                                                                            {warehouses.length === 0 && (
                                                                                <SelectItem value="0" disabled>
                                                                                    Нет доступных складов
                                                                                </SelectItem>
                                                                            )}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        Выберите склад, на котором будет храниться товар
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-end gap-2 pt-4 border-t">
                                                                <Button variant="outline" onClick={() => setAddItemDialogOpen(false)}>
                                                                    Отмена
                                                                </Button>
                                                                <Button
                                                                    onClick={handleAddItem}
                                                                    className="bg-orange-600 hover:bg-orange-700"
                                                                    disabled={addingItem || newItem.warehouse_id === 0}
                                                                >
                                                                    {addingItem ? (
                                                                        <>
                                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                            Добавление...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Plus className="h-4 w-4 mr-2" />
                                                                            Добавить элемент
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedCategory ? (
                                            <>
                                                <div className="flex gap-4 mb-6">
                                                    <div className="relative flex-1">
                                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                        <Input
                                                            placeholder="Поиск элементов..."
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            className="pl-10"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                {filteredItems.length > 0 ? (
                                                    <div className="px-6 pb-6" style={{ height: '240px', overflowY: 'auto' }}>
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Название</TableHead>
                                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Штрих-код</TableHead>
                                                                    <TableHead style={{color:'rgb(101,125,156)'}}>SKU</TableHead>
                                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Остаток</TableHead>
                                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Уровень запаса</TableHead>
                                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Единица</TableHead>
                                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Цена</TableHead>
                                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                                                                    <TableHead style={{color:'rgb(101,125,156)'}}>Действия</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {filteredItems.map((item) => {
                                                                    const currentPrice = getCurrentPrice(prices, item.id, 'purchase') || parseFloat(item.purchase_price || "0");
                                                                    return (
                                                                        <TableRow key={item.id} className="cursor-pointer hover:bg-blue-700 text-white" onClick={() => handleProductClick(item)}>
                                                                            <TableCell style={{color:'var(--custom-text)'}}>
                                                                                <div className="font-medium">{item.name}</div>
                                                                            </TableCell>
                                                                            <TableCell style={{color:'var(--custom-text)'}}>
                                                                                <div className="font-mono text-sm">{item.barcode}</div>
                                                                            </TableCell>
                                                                            <TableCell style={{color:'var(--custom-text)'}}>
                                                                                <div className="font-mono text-sm">{item.sku}</div>
                                                                            </TableCell>
                                                                            <TableCell style={{color:'var(--custom-text)'}}>
                                                                                <div className="font-medium">{item.currentStock}</div>
                                                                            </TableCell>
                                                                            <TableCell style={{color:'var(--custom-text)'}}>
                                                                                <div className="space-y-1 min-w-[120px]">
                                                                                    <Progress value={getStockLevel(item.currentStock)} className="h-2 " />
                                                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                                                        <span>0</span>
                                                                                        <span>100</span>
                                                                                    </div>
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell style={{color:'var(--custom-text)'}}>
                                                                                <div className="font-medium">{item.unit}</div>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <div className="text-orange-600 font-medium">₽{currentPrice.toLocaleString()}</div>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Badge className={getStatusColor(getSimpleStockStatus(item.currentStock))}>
                                                                                    {getSimpleStockStatus(item.currentStock)}
                                                                                </Badge>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                                                    <Button variant="outline" size="sm" onClick={() => handleProductClick(item)}>
                                                                                        <Edit className="h-4 w-4" />
                                                                                    </Button>
                                                                                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteItem(selectedCategory, item.id, item.inventory_id)}>
                                                                                        <Trash2 className="h-4 w-4" />
                                                                                    </Button>
                                                                                </div>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    );
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12 text-muted-foreground">
                                                        <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                                        <p>Нет элементов в этой категории</p>
                                                        <p className="text-sm mt-1">Добавьте первый элемент</p>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-12 text-muted-foreground">
                                                <Folder className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                                <p>Выберите категорию</p>
                                                <p className="text-sm mt-1">Выберите категорию слева для просмотра элементов</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Остатки на складе */}
                        <TabsContent value="stock" className="space-y-4">
                            <div className="flex gap-4">
                                <Input
                                    placeholder="Поиск по названию..."
                                    value={searchTermStock}
                                    onChange={(e) => setSearchTermStock(e.target.value)}
                                    className="flex-1"
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                                <Select value={filterCategory} onValueChange={setFilterCategory}>
                                    <SelectTrigger className="w-48"     style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}>
                                        <SelectValue placeholder="Категория" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Все категории</SelectItem>
                                        {categoriesList.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-48"     style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}>
                                        <SelectValue placeholder="Статус" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Все</SelectItem>
                                        <SelectItem value="critical">Критично мало</SelectItem>
                                        <SelectItem value="low">Мало</SelectItem>
                                        <SelectItem value="expiring">Истекает срок</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>Наименование</TableHead>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>Категория</TableHead>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>Остаток</TableHead>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>Норма</TableHead>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>Срок годности</TableHead>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>Оборачиваемость</TableHead>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>Стоимость</TableHead>
                                        <TableHead style={{color:'rgb(101,125,156)'}}> Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInventory.map((item) => {
                                        const stockStatus = getStockStatus(item);
                                        const nearestExpiry = Math.min(...item.batches.map(b => b.daysUntilExpiry));
                                        const expiryStatus = getExpiryStatus(nearestExpiry);
                                        const stockPercentage = (item.totalStock / item.optimalStock) * 100;

                                        return (
                                            <TableRow key={item.id} className='text-white'>
                                                <TableCell style={{color:'var(--custom-text)'}}>
                                                    <div>
                                                        <div className="font-medium">{item.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {item.batches.length} партий
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell style={{color:'var(--custom-text)'}}>
                                                    <Badge style={{color:'var(--custom-text)'}} className='text-white' variant="outline">{item.category}</Badge>
                                                </TableCell>
                                                <TableCell style={{color:'var(--custom-text)'}}>
                                                    <div>
                                                        <div  className="font-medium">{item.totalStock} {item.unit}</div>
                                                        <Progress
                                                            value={Math.min(100, stockPercentage)}
                                                            className={`h-1 mt-1 ${stockStatus.color === 'red' ? '[&>div]:bg-red-600' :
                                                                stockStatus.color === 'yellow' ? '[&>div]:bg-yellow-600' :
                                                                    '[&>div]:bg-green-600'
                                                            }`}
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell style={{color:'var(--custom-text)'}}>
                                                    <div className="text-sm">
                                                        <div>Мин: {item.minStock}</div>
                                                        <div className="text-muted-foreground">Опт: {item.optimalStock}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        stockStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                                                            stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                    }>
                                                        {stockStatus.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className={`text-sm ${expiryStatus.color === 'red' ? 'text-red-600' :
                                                            expiryStatus.color === 'orange' ? 'text-orange-600' :
                                                                'text-green-600'
                                                        }`}>
                                                            {nearestExpiry} дн.
                                                        </div>
                                                        {expiryStatus.status !== 'ok' && (
                                                            <Badge className={`mt-1 ${expiryStatus.color === 'red' ? 'bg-red-100 text-red-800 border-red-200' :
                                                                expiryStatus.color === 'orange' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                            } text-xs`}>
                                                                {expiryStatus.label}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell style={{color:'var(--custom-text)'}}>
                                                    <div>
                                                        <div className="text-sm">{item.turnoverRate.toFixed(1)}x/мес</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {item.daysInStock.toFixed(1)} дн. на складе
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-orange-600">
                                                        ₽{(item.totalStock * item.avgPrice).toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        ₽{item.avgPrice}/{item.unit}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            const productFromInventory = getAllItems().find(p => p.name === item.name);
                                                            if (productFromInventory) {
                                                                handleProductClick(productFromInventory);
                                                            }
                                                        }}
                                                    >
                                                        <Edit className="h-3 w-3 mr-1" />
                                                        Детали
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TabsContent>

                        {/* Приход товара */}

                        <TabsContent value="incoming" className="space-y-4">
                            <Card style={{
                                borderRadius: '20px',
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-secondaryLineCard)',
                                color: 'var(--custom-text)',
                            }}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <Plus className="h-5 w-5 text-orange-600" />
                                        Оформление прихода товара
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-start gap-2">
                                                <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                                                <div>
                                                    <div className="font-medium text-blue-800">Информация о поставке</div>
                                                    <div className="text-sm text-blue-700">
                                                        Заполните все поля для оформления прихода товара на склад.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 text-white">
                                            <div className="space-y-2">
                                                <Label style={{color:'var(--custom-text)'}} htmlFor="product">Товар *</Label>
                                                <Select
                                                    value={selectedIncomingProduct}
                                                    onValueChange={setSelectedIncomingProduct}
                                                    required
                                                >
                                                    <SelectTrigger id="product"      style={{
                                                        border: 'var(--custom-border-primary)',
                                                        background: 'var(--custom-bg-inpyt)',
                                                        color: 'var(--custom-text)',
                                                    }}>
                                                        <SelectValue placeholder="Выберите товар" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {products.map(product => (
                                                            <SelectItem key={product.id} value={product.name}>
                                                                {product.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label style={{color:'var(--custom-text)'}} htmlFor="warehouse">Склад *</Label>
                                                <Select
                                                    value={incomingWarehouse}
                                                    onValueChange={setIncomingWarehouse}
                                                    required
                                                >
                                                    <SelectTrigger id="warehouse"      style={{
                                                        border: 'var(--custom-border-primary)',
                                                        background: 'var(--custom-bg-inpyt)',
                                                        color: 'var(--custom-text)',
                                                    }}>
                                                        <SelectValue placeholder="Выберите склад" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {warehouses.map(warehouse => (
                                                            <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                                {warehouse.name}
                                                                {warehouse.address && ` - ${warehouse.address}`}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label style={{color:'var(--custom-text)'}} htmlFor="supplier">Поставщик *</Label>
                                                <Select
                                                    value={incomingSupplier}
                                                    onValueChange={(value) => setIncomingSupplier(value)}
                                                    required
                                                >
                                                    <SelectTrigger id="supplier"      style={{
                                                        border: 'var(--custom-border-primary)',
                                                        background: 'var(--custom-bg-inpyt)',
                                                        color: 'var(--custom-text)',
                                                    }}>
                                                        <SelectValue placeholder="Выберите поставщика" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Добавить нового">+ Добавить нового поставщика</SelectItem>
                                                        {counterparties.map(counterparty => (
                                                            <SelectItem key={counterparty.id} value={counterparty.name} >
                                                                {counterparty.name}
                                                                {counterparty.full_name && ` (${counterparty.full_name})`}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {incomingSupplier === "Добавить нового" && (
                                                    <div className="mt-2 space-y-2">
                                                        <Input
                                                            placeholder="Название нового поставщика"
                                                            onChange={(e) => setIncomingSupplier(e.target.value)}
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                        <p className="text-xs text-muted-foreground">
                                                            Будет создан новый поставщик в системе
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label style={{color:'var(--custom-text)'}} htmlFor="batchNumber">Номер партии</Label>
                                                <Input
                                                    id="batchNumber"
                                                    placeholder="MP-001-2024"
                                                    value={incomingBatchNumber}
                                                    onChange={(e) => setIncomingBatchNumber(e.target.value)}
                                                    style={{
                                                        border: 'var(--custom-border-primary)',
                                                        background: 'var(--custom-bg-inpyt)',
                                                        color: 'var(--custom-text)',
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label style={{color:'var(--custom-text)'}} htmlFor="quantity">Количество *</Label>
                                                <Input
                                                    id="quantity"
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={incomingQuantity}
                                                    onChange={(e) => setIncomingQuantity(e.target.value)}
                                                    required
                                                    style={{
                                                        border: 'var(--custom-border-primary)',
                                                        background: 'var(--custom-bg-inpyt)',
                                                        color: 'var(--custom-text)',
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label style={{color:'var(--custom-text)'}} htmlFor="price">Цена за единицу (₽) *</Label>
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={incomingPrice}
                                                    onChange={(e) => setIncomingPrice(e.target.value)}
                                                    required
                                                    style={{
                                                        border: 'var(--custom-border-primary)',
                                                        background: 'var(--custom-bg-inpyt)',
                                                        color: 'var(--custom-text)',
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-2 col-span-2">
                                                <Label style={{color:'var(--custom-text)'}} htmlFor="expiryDate">Срок годности</Label>
                                                <Input
                                                    id="expiryDate"
                                                    type="date"
                                                    value={expiryDate}
                                                    onChange={(e) => setExpiryDate(e.target.value)}
                                                    style={{
                                                        border: 'var(--custom-border-primary)',
                                                        background: 'var(--custom-bg-inpyt)',
                                                        color: 'var(--custom-text)',
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {incomingQuantity && incomingPrice && (
                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="font-medium">Итоговая стоимость партии:</span>
                                                        <div className="text-sm text-orange-700 mt-1">
                                                            Будет создана партия товара в системе
                                                        </div>
                                                    </div>
                                                    <span className="text-3xl text-orange-600">
                                                        ₽{(parseFloat(incomingQuantity) * parseFloat(incomingPrice)).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-2 pt-4 border-t">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedIncomingProduct('');
                                                    setIncomingWarehouse('');
                                                    setIncomingSupplier('');
                                                    setIncomingQuantity('');
                                                    setIncomingPrice('');
                                                    setIncomingBatchNumber('');
                                                    setExpiryDate('');
                                                }}
                                            >
                                                Очистить
                                            </Button>
                                            <Button
                                                type="button"
                                                className="bg-orange-600 hover:bg-orange-700"
                                                onClick={handleCreateIncoming}
                                                disabled={creatingIncoming}
                                            >
                                                {creatingIncoming ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Оформление...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Package className="h-4 w-4 mr-2" />
                                                        Оформить приход
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Список существующих партий */}
                            <Card style={{
                                borderRadius: '20px',
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-secondaryLineCard)',
                                color: 'var(--custom-text)',
                            }}>
                                <CardHeader>
                                    <CardTitle style={{color:'var(--custom-text)'}} className="text-base text-white">Существующие партии товаров</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead style={{color:'rgb(101,125,156)'}}>Название партии</TableHead>
                                                <TableHead style={{color:'rgb(101,125,156)'}}>Склад</TableHead>
                                                <TableHead style={{color:'rgb(101,125,156)'}}>Количество</TableHead>
                                                <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                                                <TableHead style={{color:'rgb(101,125,156)'}}>Дата</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className='text-white'>
                                            {productBatches.map(batch => {
                                                const warehouse = warehouses.find(w => w.id === batch.warehouse_id);
                                                return (
                                                    <TableRow key={batch.id}>
                                                        <TableCell style={{color:'var(--custom-text)'}} className="font-medium">{batch.name}</TableCell>
                                                        <TableCell style={{color:'var(--custom-text)'}}>
                                                            <Badge style={{color:'var(--custom-text)'}} variant="outline" className='text-white'>
                                                                {warehouse?.name || `Склад #${batch.warehouse_id}`}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell style={{color:'var(--custom-text)'}}>{batch.quantity} ед.</TableCell>
                                                        <TableCell style={{color:'var(--custom-text)'}}>
                                                            <Badge className={
                                                                batch.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                                                                    batch.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                            }>
                                                                {batch.status === 'in_stock' ? 'На складе' :
                                                                    batch.status === 'reserved' ? 'Зарезервировано' :
                                                                        batch.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell style={{color:'var(--custom-text)'}}>
                                                            {new Date(batch.date).toLocaleDateString('ru-RU')}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Инвентаризация */}
                        <TabsContent value="inventory" className="space-y-4">

                            {viewMode !== 'inventory' ? (
                                <ShowHistory
                                    inventoryRecords={inventoryRecords}
                                    warehouses={warehouses}
                                    users={users}
                                    onStartInventory={handleStartInventory}
                                />
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="text-lg font-medium text-white">Инвентаризация склада</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Проверка фактических остатков товаров на складе
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={handleShowHistory}
                                            className="flex items-center gap-2"
                                        >
                                            <History className="h-4 w-4" />
                                            История инвентаризаций
                                            <Badge variant="secondary" className="ml-2">
                                                {inventoryRecords.length}
                                            </Badge>
                                        </Button>
                                    </div>


                                    <Card style={{
                                        borderRadius: '20px',
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-secondaryLineCard)',
                                        color: 'var(--custom-text)',
                                    }} >
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                <div style={{color:'var(--custom-text)'}} className="flex items-center gap-2 text-white">
                                                    <FileText className="h-5 w-5 text-orange-600" />
                                                    {currentInventory ? 'Активная инвентаризация' : 'Начать новую инвентаризацию'}
                                                </div>
                                                {currentInventory && (
                                                    <Badge className="bg-green-100 text-green-800">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        Активна
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {currentInventory ? (
                                                <div className="space-y-4">
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                        <div className="flex items-start justify-between text-white">
                                                            <div>
                                                                <div style={{color:'var(--custom-text)'}} className="font-medium text-green-800">
                                                                    {currentInventory.name}
                                                                </div>
                                                                <div className="text-sm text-green-700 mt-1">
                                                                    Начата: {new Date(currentInventory.date_start).toLocaleString('ru-RU')}
                                                                </div>
                                                                <div className="text-sm text-green-700">
                                                                    Склад: {warehouses.find(w => w.id === currentInventory.warehouse_id)?.name || `Склад #${currentInventory.warehouse_id}`}
                                                                </div>
                                                                <div className="text-sm text-green-700">
                                                                    Ответственный: {getUserName(currentInventory.user_id)}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                className="border-green-300 text-green-700 hover:bg-green-100"
                                                                onClick={handleCompleteInventory}
                                                                disabled={completingInventory}
                                                            >
                                                                {completingInventory ? (
                                                                    <>
                                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                        Завершение...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <FileText className="h-4 w-4 mr-2" />
                                                                        Завершить инвентаризацию
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                        <div className="flex items-start gap-2">
                                                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                                            <div>
                                                                <div className="font-medium text-blue-800">Информация об инвентаризации</div>
                                                                <div className="text-sm text-blue-700">
                                                                    Для начала инвентаризации заполните данные ниже.
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 text-white">
                                                        <div className="space-y-2">
                                                            <Label style={{color:'var(--custom-text)'}} htmlFor="inventoryName">Название инвентаризации *</Label>
                                                            <Input
                                                                id="inventoryName"
                                                                placeholder="Инвентаризация склада"
                                                                value={inventoryName}
                                                                onChange={(e) => setInventoryName(e.target.value)}
                                                                required
                                                                style={{
                                                                    border: 'var(--custom-border-primary)',
                                                                    background: 'var(--custom-bg-inpyt)',
                                                                    color: 'var(--custom-text)',
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label style={{color:'var(--custom-text)'}} htmlFor="inventoryWarehouse">Склад для инвентаризации *</Label>
                                                            <Select
                                                                value={selectedWarehouseForInventory}
                                                                onValueChange={setSelectedWarehouseForInventory}
                                                                required
                                                            >
                                                                <SelectTrigger id="inventoryWarehouse"      style={{
                                                                    border: 'var(--custom-border-primary)',
                                                                    background: 'var(--custom-bg-inpyt)',
                                                                    color: 'var(--custom-text)',
                                                                }}>
                                                                    <SelectValue placeholder="Выберите склад" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {warehouses.map(warehouse => (
                                                                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                                            {warehouse.name}
                                                                            {warehouse.address && ` - ${warehouse.address}`}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 text-white">
                                                        <div className="space-y-2">
                                                            <Label style={{color:'var(--custom-text)'}} htmlFor="inventoryDateStart">Дата начала *</Label>
                                                            <Input
                                                                id="inventoryDateStart"
                                                                type="datetime-local"
                                                                value={inventoryDateStart}
                                                                onChange={(e) => setInventoryDateStart(e.target.value)}
                                                                required
                                                                style={{
                                                                    border: 'var(--custom-border-primary)',
                                                                    background: 'var(--custom-bg-inpyt)',
                                                                    color: 'var(--custom-text)',
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label style={{color:'var(--custom-text)'}} htmlFor="inventoryDateEnd">Плановая дата завершения</Label>
                                                            <Input
                                                                id="inventoryDateEnd"
                                                                type="datetime-local"
                                                                value={inventoryDateEnd}
                                                                onChange={(e) => setInventoryDateEnd(e.target.value)}
                                                                style={{
                                                                    border: 'var(--custom-border-primary)',
                                                                    background: 'var(--custom-bg-inpyt)',
                                                                    color: 'var(--custom-text)',
                                                                }}
                                                            />
                                                            <p className="text-xs text-muted-foreground">
                                                                Опционально. Фактическая дата будет установлена при завершении.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                                        <Button
                                                            type="button"
                                                            className="bg-orange-600 hover:bg-orange-700"
                                                            onClick={createNewInventory}
                                                            disabled={creatingInventory || !inventoryName || !selectedWarehouseForInventory || !inventoryDateStart}
                                                        >
                                                            {creatingInventory ? (
                                                                <>
                                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                    Создание...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Plus className="h-4 w-4 mr-2" />
                                                                    Начать инвентаризацию
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                                        <Card className="lg:col-span-1" style={{
                                            borderRadius: '20px',
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-secondaryLineCard)',
                                            color: 'var(--custom-text)',
                                        }}>
                                            <CardHeader className='text-white'>
                                                <CardTitle style={{color:'var(--custom-text)'}}>Категории</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <Button
                                                    variant={inventorySelectedCategory === null ? "default" : "outline"}
                                                    className={`w-full justify-start ${inventorySelectedCategory === null ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                                                    onClick={() => setInventorySelectedCategory(null)}
                                                >
                                                    <Folder className="h-4 w-4 mr-2" />
                                                    Все товары
                                                    <Badge variant="secondary" className="ml-auto">
                                                        {products.length}
                                                    </Badge>
                                                </Button>

                                                <div className="px-0 pb-2" style={{ height: '400px', overflowY: 'auto' }}>
                                                    {categories.length === 0 ? (
                                                        <div className="text-center py-8 text-muted-foreground text-sm">
                                                            <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                                            <p>Нет категорий</p>
                                                        </div>
                                                    ) : (
                                                        <CategoryTree
                                                            categories={categories}
                                                            selectedCategory={inventorySelectedCategory}
                                                            onSelectCategory={setInventorySelectedCategory}
                                                            onDeleteCategory={handleDeleteCategory}
                                                            inventoryItems={inventoryItems}
                                                        />
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="lg:col-span-3" style={{
                                            borderRadius: '20px',
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-secondaryLineCard)',
                                            color: 'var(--custom-text)',
                                        }}>
                                            <CardHeader>
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <CardTitle style={{color:'var(--custom-text)'}} className="flex items-center gap-2 text-white">
                                                            <FileText className="h-5 w-5 text-orange-600" />
                                                            Инвентаризация склада
                                                            {currentInventory && (
                                                                <Badge variant="outline" className="ml-2 text-xs">
                                                                    {currentInventory.name}
                                                                </Badge>
                                                            )}
                                                        </CardTitle>
                                                        {inventorySelectedCategory && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                Категория: {categories.find(c => c.id === inventorySelectedCategory)?.name} |
                                                                Товаров: {getInventoryCategoryItems().length}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {getFilteredInventoryCheckData.filter(i => i.difference !== 0).length > 0 && (
                                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                                {getFilteredInventoryCheckData.filter(i => i.difference !== 0).length} расхождений
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-4">
                                                <div className="flex gap-4 mb-6">
                                                    <div className="relative flex-1">
                                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                        <Input
                                                            placeholder="Поиск товаров..."
                                                            value={inventorySearchTerm}
                                                            onChange={(e) => setInventorySearchTerm(e.target.value)}
                                                            className="pl-10"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </div>

                                                    <Select value={inventoryFilterStatus} onValueChange={setInventoryFilterStatus}>
                                                        <SelectTrigger className="w-48"     style={{
                                                            border: 'var(--custom-border-primary)',
                                                            background: 'var(--custom-bg-inpyt)',
                                                            color: 'var(--custom-text)',
                                                        }}>
                                                            <SelectValue placeholder="Статус" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Все товары</SelectItem>
                                                            <SelectItem value="matching">Совпадает</SelectItem>
                                                            <SelectItem value="mismatch">Расхождения</SelectItem>
                                                            <SelectItem value="shortage">Недостача</SelectItem>
                                                            <SelectItem value="excess">Излишек</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <Select value={inventoryFilterCategory} onValueChange={setInventoryFilterCategory}>
                                                        <SelectTrigger className="w-48"    style={{
                                                            border: 'var(--custom-border-primary)',
                                                            background: 'var(--custom-bg-inpyt)',
                                                            color: 'var(--custom-text)',
                                                        }}>
                                                            <SelectValue placeholder="Фильтр по категории" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Все категории</SelectItem>
                                                            {Array.from(new Set(getInventoryCategoryItems().map(item => item.category_name))).map(categoryName => (
                                                                <SelectItem key={categoryName} value={categoryName}>{categoryName}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className=" rounded-lg p-4">
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div>
                                                            <div style={{color:'var(--custom-text)'}} className="text-sm text-muted-foreground">Всего позиций</div>
                                                            <div style={{color:'var(--custom-text)'}} className="text-2xl font-medium text-white">{getFilteredInventoryCheckData.length}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm text-muted-foreground">Расхождений</div>
                                                            <div className="text-2xl font-medium text-orange-600">
                                                                {getFilteredInventoryCheckData.filter(i => i.difference !== 0).length}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm text-muted-foreground">Совпадает</div>
                                                            <div className="text-2xl font-medium text-green-600">
                                                                {getFilteredInventoryCheckData.filter(i => i.difference === 0).length}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {getFilteredInventoryCheckData.length === 0 ? (
                                                    <div className="text-center py-12 text-muted-foreground">
                                                        <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                                        <p>Нет товаров для инвентаризации</p>
                                                        {inventorySelectedCategory && (
                                                            <p className="text-sm mt-1">В выбранной категории нет товаров</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="border rounded-lg">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Наименование</TableHead>
                                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Категория</TableHead>
                                                                        <TableHead style={{color:'rgb(101,125,156)'}}>По системе</TableHead>
                                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Фактически</TableHead>
                                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Расхождение</TableHead>
                                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Стоимость</TableHead>
                                                                        <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody className='text-white'>
                                                                    {getFilteredInventoryCheckData.map(item => (
                                                                        <TableRow key={item.id}>
                                                                            <TableCell style={{color:'var(--custom-text)'}} className="font-medium">
                                                                                <div className="flex items-center">
                                                                                    {item.name}
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell style={{color:'var(--custom-text)'}}>
                                                                                <Badge style={{color:'var(--custom-text)'}} variant="outline" className="text-xs text-white">
                                                                                    {item.category_name}
                                                                                </Badge>
                                                                            </TableCell>
                                                                            <TableCell style={{color:'var(--custom-text)'}}>
                                                                                {item.system} {item.unit}
                                                                            </TableCell>
                                                                            <TableCell style={{color:'var(--custom-text)'}}>
                                                                                <Input
                                                                                    type="text"
                                                                                    value={inputValues[item.id] || item.actualString || ""}
                                                                                    onChange={(e) => {
                                                                                        handleInventoryActualChange(item.id, e.target.value);
                                                                                    }}
                                                                                    className="w-32"
                                                                                    placeholder="0"
                                                                                    style={{
                                                                                        border: 'var(--custom-border-primary)',
                                                                                        background: 'var(--custom-bg-inpyt)',
                                                                                        color: 'var(--custom-text)',
                                                                                    }}
                                                                                />

                                                                            </TableCell>
                                                                            <TableCell style={{color:'var(--custom-text)'}}>
                <span style={{color:'var(--custom-text)'}}
                    className={item.difference < 0 ? 'text-red-600 font-medium' :
                        item.difference > 0 ? 'text-green-600 font-medium' :
                            'text-muted-foreground'}>
                    {item.difference > 0 && '+'}{item.difference} {item.unit}
                </span>
                                                                            </TableCell>
                                                                            <TableCell style={{color:'var(--custom-text)'}}>
                <span className="text-orange-600">
                    ₽{(item.actual * (item.price || 0)).toLocaleString()}
                </span>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {item.difference === 0 ? (
                                                                                    <Badge className="bg-green-100 text-green-800">Совпадает</Badge>
                                                                                ) : item.difference < 0 ? (
                                                                                    <Badge className="bg-red-100 text-red-800">Недостача</Badge>
                                                                                ) : (
                                                                                    <Badge className="bg-yellow-100 text-yellow-800">Излишек</Badge>
                                                                                )}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>

                                                        {getFilteredInventoryCheckData.filter(i => i.difference !== 0).length > 0 && (
                                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                                <div className="font-medium text-yellow-800 mb-2">
                                                                    Обнаружены расхождения: {getFilteredInventoryCheckData.filter(i => i.difference !== 0).length}
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                                    <div>
                                                                        <div className="font-medium text-red-600 mb-1">Недостача:</div>
                                                                        <div className="space-y-1">
                                                                            {getFilteredInventoryCheckData
                                                                                .filter(i => i.difference < 0)
                                                                                .map(item => (
                                                                                    <div key={item.id} className="text-red-700">
                                                                                        • {item.name}: {Math.abs(item.difference)} {item.unit} (-₽{(Math.abs(item.difference) * (item.price || 0)).toLocaleString()})
                                                                                    </div>
                                                                                ))}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium text-green-600 mb-1">Излишек:</div>
                                                                        <div className="space-y-1">
                                                                            {getFilteredInventoryCheckData
                                                                                .filter(i => i.difference > 0)
                                                                                .map(item => (
                                                                                    <div key={item.id} className="text-green-700">
                                                                                        • {item.name}: +{item.difference} {item.unit} (+₽{(item.difference * (item.price || 0)).toLocaleString()})
                                                                                    </div>
                                                                                ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-4 text-sm text-yellow-700">
                                                                    <div className="font-medium">Итоговая разница:</div>
                                                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                                                        <div>
                                                                            Общая недостача: -{getFilteredInventoryCheckData
                                                                            .filter(i => i.difference < 0)
                                                                            .reduce((sum, item) => sum + Math.abs(item.difference), 0)} ед.
                                                                        </div>
                                                                        <div>
                                                                            Общий излишек: +{getFilteredInventoryCheckData
                                                                            .filter(i => i.difference > 0)
                                                                            .reduce((sum, item) => sum + item.difference, 0)} ед.
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex justify-end gap-2 pt-4 border-t">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setInventoryCheckData(prev => prev.map(i => ({
                                                                        ...i,
                                                                        actual: i.system,
                                                                        actualString: i.system.toString(),
                                                                        difference: 0
                                                                    })));
                                                                    setInputValues({});
                                                                }}
                                                            >
                                                                Сбросить изменения
                                                            </Button>
                                                            <Button
                                                                onClick={handleCompleteInventory}
                                                                className="bg-orange-600 hover:bg-orange-700"
                                                                disabled={loading}
                                                            >
                                                                {loading ? (
                                                                    <>
                                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                        Завершение...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <FileText className="h-4 w-4 mr-2" />
                                                                        Завершить инвентаризацию ({inventoryCheckData.filter(i => i.difference !== 0).length})
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </>
                            )}
                        </TabsContent>

                        {/* История движений */}
                        <TabsContent value="movements" className="space-y-4">
                            <div className="flex gap-4">
                                <Select value={movementTypeFilter} onValueChange={setMovementTypeFilter}>
                                    <SelectTrigger className="w-48"     style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}>
                                        <SelectValue placeholder="Тип операции" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Все операции</SelectItem>
                                        <SelectItem value="income">Приход</SelectItem>
                                        <SelectItem value="outcome">Расход</SelectItem>
                                        <SelectItem value="writeoff">Списание</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="date"
                                    className="w-48"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    placeholder="С даты"
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                                <Input
                                    type="date"
                                    className="w-48"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    placeholder="По дату"
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setMovementTypeFilter('all');
                                        setDateFrom('');
                                        setDateTo('');
                                    }}
                                    style={{
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                >
                                    Сбросить
                                </Button>
                            </div>

                            {movementsLoading ? (
                                <div className="flex justify-center items-center h-32">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    Загрузка истории движений...
                                </div>
                            ) : (
                                <div className="border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead style={{color:'rgb(101,125,156)'}}>Дата и время</TableHead>
                                                <TableHead style={{color:'rgb(101,125,156)'}}>Тип</TableHead>
                                                <TableHead style={{color:'rgb(101,125,156)'}}>Товар</TableHead>
                                                <TableHead style={{color:'rgb(101,125,156)'}}>Количество</TableHead>
                                                <TableHead style={{color:'rgb(101,125,156)'}}>Детали</TableHead>
                                                <TableHead style={{color:'rgb(101,125,156)'}}>Сумма</TableHead>
                                                <TableHead style={{color:'rgb(101,125,156)'}}>Пользователь</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className='text-white'>
                                            {filteredMovements.length > 0 ? (
                                                filteredMovements.map((movement) => (
                                                    <TableRow key={movement.id}>
                                                        <TableCell style={{color:'var(--custom-text)'}}>
                                                            {new Date(movement.date).toLocaleString('ru-RU', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </TableCell>
                                                        <TableCell>{getMovementTypeBadge(movement.type)}</TableCell>
                                                        <TableCell className="max-w-xs">
                                                            <div style={{color:'var(--custom-text)'}} className="truncate" title={movement.item}>
                                                                {movement.item}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span style={{color:'var(--custom-text)'}}
                                                                className={movement.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                                                {movement.type === 'income' ? '+' : '-'}{movement.quantity} {movement.unit}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell style={{color:'var(--custom-text)'}} className="max-w-xs">
                                                            {movement.type === 'income' && (
                                                                <div className="text-sm">
                                                                    <div>Поставщик: {movement.supplier || 'Не указан'}</div>
                                                                    <div className="text-muted-foreground">Документ: {movement.batchNumber || 'Без номера'}</div>
                                                                </div>
                                                            )}
                                                            {movement.type === 'outcome' && movement.orderId && (
                                                                <div className="text-sm">
                                                                    <div>Документ: {movement.orderId}</div>
                                                                </div>
                                                            )}
                                                            {movement.type === 'writeoff' && (
                                                                <div className="text-sm text-red-600">
                                                                    {movement.reason || 'Списание'}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell style={{color:'var(--custom-text)'}}>
                                                            {movement.total ? (
                                                                <span
                                                                    className={`${movement.type === 'income' ? 'text-green-600' : movement.type === 'outcome' ? 'text-red-600' : 'text-orange-600'}`}>
                                                                    {movement.type === 'income' ? '+' : movement.type === 'outcome' ? '-' : ''}₽{movement.total.toLocaleString('ru-RU')}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell style={{color:'var(--custom-text)'}} className="text-sm">
                                                            <div className="truncate max-w-32" title={movement.user}>
                                                                {movement.user}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                        {movements.length === 0 ? 'Нет данных о движениях' : 'Нет движений по выбранным фильтрам'}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {/* Статистика по движениям */}
                            {filteredMovements.length > 0 && (
                                <Card style={{
                                    borderRadius: '20px',
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-secondaryLineCard)',
                                    color: 'var(--custom-text)',
                                }}>
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-4 gap-4 text-sm">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {filteredMovements.filter(m => m.type === 'income').length}
                                                </div>
                                                <div className="text-muted-foreground">Приходов</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-red-600">
                                                    {filteredMovements.filter(m => m.type === 'outcome').length}
                                                </div>
                                                <div className="text-muted-foreground">Расходов</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-orange-600">
                                                    {filteredMovements.filter(m => m.type === 'writeoff').length}
                                                </div>
                                                <div className="text-muted-foreground">Списаний</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-white">
                                                    {filteredMovements.length}
                                                </div>
                                                <div className="text-muted-foreground">Всего операций</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Аналитика */}
                        <TabsContent value="analytics" className="space-y-4">
                           <Analitics inventoryData={inventoryData} categoriesList={categoriesList} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

        </div>
    );
}