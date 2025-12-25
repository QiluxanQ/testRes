import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Textarea } from '../../../ui/textarea';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Progress } from '../../../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { Separator } from '../../../ui/separator';
import {
    AlertCircle,
    ArrowLeft,
    Edit,
    FileText,
    Loader2,
    Plus,
    Trash2,
    MapPin,
    Calendar,
    Clock,
    Package,
    ChevronDown
} from 'lucide-react';
import { Label } from '../../../ui/label';
import { Category, Unit, InventoryItem, PointRetail } from '../../../types/inventory';

// Типы из оригинального файла
interface Price {
    products_id: number;
    value: string;
    currency: string;
    price_type: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    metadate: any;
    id: number;
}

interface ProductBatch {
    warehouse_id: number;
    receipt_invoice_id: number;
    quantity: string;
    unit_id: number;
    name: string;
    status: string;
    date: string;
    metadate: any;
    id: number;
}

interface ProductBatchItem {
    product_batch_id: number;
    storage_id: number | null;
    product_id: number;
    quantity: string;
    unit_id: number;
    expiration_date: string;
    metadate: any;
    id: number;
}

interface Warehouse {
    name: string;
    address: string;
    type: string;
    metadate: any;
    id: number;
}

interface InventoryItemAPI {
    inventory_id: number;
    storage_id: number;
    product_id: number;
    expected_quantity: string;
    actual_quantity: string;
    unit_id: number;
    metadate: any;
    id: number;
}


interface ProductDetailViewProps {
    product: InventoryItem;
    onBack: () => void;
    pointsRetail: PointRetail[];
    categories: Category[];
    selectedSalesPoint: PointRetail | null;
    prices: Price[];
    productBatches: ProductBatch[];
    productBatchItems: ProductBatchItem[];
    warehouses: Warehouse[];
    inventoryItemsAPI: InventoryItemAPI[];
}


const parseBigNumber = (value: string): number => {
    try {
        const cleanedValue = value.replace(/^\+0+/, '');
        if (cleanedValue === '') return 0;
        return parseInt(cleanedValue) / 100;
    } catch (error) {
        console.error('Ошибка парсинга цены:', value, error);
        return 0;
    }
};

const getCurrentPrice = (prices: Price[], productId: number, priceType: string = 'purchase'): number => {
    const productPrices = prices.filter(price =>
        price.products_id === productId &&
        price.price_type === priceType &&
        price.is_current === true
    );

    if (productPrices.length > 0) {
        const latestPrice = productPrices.sort((a, b) =>
            new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        )[0];
        return parseBigNumber(latestPrice.value);
    }

    return 0;
};

const BlcokDiteilView: React.FC<ProductDetailViewProps> = React.memo(({
                                                                            product,
                                                                            onBack,
                                                                            pointsRetail,
                                                                            categories,
                                                                            selectedSalesPoint,
                                                                            prices,
                                                                            productBatches,
                                                                            productBatchItems,
                                                                            warehouses,
                                                                            inventoryItemsAPI
                                                                        }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedProduct, setEditedProduct] = useState({
        name: product.name,
        sku: product.sku || '',
        barcode: product.barcode || '',
        purchase_price: product.purchase_price || '',
        description: product.description || '',
        categories_products_id: product.categories_products_id,
        unit_id: product.unit_id
    });

    const [saving, setSaving] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['general', 'price', 'batches']));
    const [units, setUnits] = useState<Unit[]>([]);

    const handleToggleSection = (section: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(section)) {
                newSet.delete(section);
            } else {
                newSet.add(section);
            }
            return newSet;
        });
    };

    const handleEditToggle = () => {
        if (isEditing) {
            setEditedProduct({
                name: product.name,
                sku: product.sku || '',
                barcode: product.barcode || '',
                purchase_price: product.purchase_price || '',
                description: product.description || '',
                categories_products_id: product.categories_products_id,
                unit_id: product.unit_id
            });
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            };

            const updateData = {
                name: editedProduct.name,
                sku: editedProduct.sku,
                barcode: editedProduct.barcode,
                purchase_price: editedProduct.purchase_price,
                description: editedProduct.description || '',
                categories_products_id: editedProduct.categories_products_id,
                unit_id: editedProduct.unit_id
            };

            const response = await fetch(`/products/${product.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error(`Ошибка обновления: ${response.statusText}`);
            }

            Object.assign(product, updateData);

            setIsEditing(false);
            alert('Товар успешно обновлен!');

        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Не удалось сохранить изменения: ' + (error as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const getExpiryStatus = (daysUntilExpiry: number) => {
        if (daysUntilExpiry <= 0) return { status: 'expired', label: 'Просрочен', color: 'red' };
        if (daysUntilExpiry <= 3) return { status: 'warning', label: 'Скоро истекает', color: 'orange' };
        if (daysUntilExpiry <= 7) return { status: 'notice', label: 'Истекает', color: 'yellow' };
        return { status: 'ok', label: 'В норме', color: 'green' };
    };

    const getCategoryPath = (categoryId: number): string => {
        const path: string[] = [];
        let current = categories.find(c => c.id === categoryId);

        while (current) {
            path.unshift(current.name);
            current = categories.find(c => c.id === current!.parent_id);
        }

        return path.join(' → ') || 'Корневая категория';
    };

    const currentPrice = useMemo(() => {
        return getCurrentPrice(prices, product.id, 'purchase');
    }, [prices, product.id]);

    const productRelatedBatches = useMemo(() => {
        const batchItemsForProduct = productBatchItems.filter(item => item.product_id === product.id);

        const batches = batchItemsForProduct.map(item => {
            const batch = productBatches.find(b => b.id === item.product_batch_id);
            const warehouse = warehouses.find(w => w.id === (batch?.warehouse_id || item.storage_id));

            const quantity = parseFloat(item.quantity);
            const purchasePrice = currentPrice || parseFloat(product.purchase_price || "0");

            return {
                id: batch?.id || item.id,
                batchNumber: batch?.name || `Партия #${item.product_batch_id}`,
                supplier: batch ? `Поставщик ${batch.receipt_invoice_id}` : 'Неизвестный поставщик',
                quantity: quantity,
                purchasePrice: purchasePrice,
                receivedDate: batch?.date || item.expiration_date,
                expiryDate: item.expiration_date,
                daysUntilExpiry: Math.ceil((new Date(item.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
                totalCost: quantity * purchasePrice,
                warehouse: warehouse?.name || 'Неизвестный склад',
                status: batch?.status || 'in_stock'
            };
        });

        return batches.sort((a, b) => new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime());
    }, [productBatches, productBatchItems, product.id, warehouses, currentPrice, product.purchase_price]);

    const productInventoryItem = useMemo(() => {
        return inventoryItemsAPI.find(item => item.product_id === product.id);
    }, [inventoryItemsAPI, product.id]);

    const currentStock = useMemo(() => {
        if (productInventoryItem) {
            return parseFloat(productInventoryItem.actual_quantity) || parseFloat(productInventoryItem.expected_quantity) || 0;
        }
        return product.currentStock;
    }, [productInventoryItem, product.currentStock]);

    const productData = useMemo(() => ({
        name: product.name,
        totalStock: currentStock,
        unit: product.unit,
        avgPrice: currentPrice || parseFloat(product.purchase_price || "0"),
        minStock: 10,
        optimalStock: 100,
        usagePerDay: 5.2,
        daysInStock: currentStock / 5.2,
        turnoverRate: 2.5,
        wastePercentage: 2.1,
        alternativeSuppliers: ['Поставщик А', 'Поставщик Б', 'Поставщик В', 'Поставщик Г'],
        batches: productRelatedBatches
    }), [product, productRelatedBatches, currentPrice, currentStock]);

    const fetchUnits = async () => {
        try {
            const response = await fetch('/units/?skip=0&limit=100', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setUnits(data);
        } catch (error) {
            console.error('Ошибка при загрузке единиц измерения:', error);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    const getUnitName = (unitId: number) => {
        const unit = units.find(u => u.id === unitId);
        return unit ? unit.name : 'Не указано';
    };

    const getUnitSymbol = (unitId: number) => {
        const unit = units.find(u => u.id === unitId);
        return unit ? unit.symbol : '';
    };

    return (
        <div className="space-y-6">
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <Button variant="outline" onClick={onBack}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Назад к списку
                        </Button>
                        {selectedSalesPoint && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                Точка продаж: {selectedSalesPoint.name}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader>
                    <div className="flex items-end ">
                        <div className="text-right">
                            <div className="text-3xl text-orange-600">
                                ₽{(productData.totalStock * productData.avgPrice).toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">общая стоимость</div>
                        </div>
                    </div>
                </CardHeader>
            </Card>
            <Tabs defaultValue="edit" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4" >
                    <TabsTrigger value="edit">Редактирование</TabsTrigger>
                    <TabsTrigger value="batches">Партии (FIFO)</TabsTrigger>
                    <TabsTrigger value="suppliers">Поставщики</TabsTrigger>
                    <TabsTrigger value="stats">Статистика</TabsTrigger>
                </TabsList>


                <TabsContent value="edit" className="space-y-4">
                    <Card style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader>
                            <CardTitle style={{color:'var(--custom-text)'}} className='text-white'>Информация о товаре</CardTitle>
                            <div className="flex items-center justify-between">
                                <Button
                                    variant={isEditing ? "outline" : "default"}
                                    onClick={handleEditToggle}
                                    className={isEditing ? "" : "bg-orange-600 hover:bg-orange-700"}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    {isEditing ? 'Отменить редактирование' : 'Редактировать'}
                                </Button>
                                {isEditing && (
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Сохранение...
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="h-4 w-4 mr-2" />
                                                Сохранить изменения
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">

                                <div className="border rounded-lg">
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer bg-muted/50 hover:bg-muted/70"
                                        onClick={() => handleToggleSection('general')}
                                    >
                                        <div className="font-medium">Общая информация</div>
                                        <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.has('general') ? 'rotate-180' : ''}`} />
                                    </div>
                                    {expandedSections.has('general') && (
                                        <div className="p-4 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2 text-white">
                                                    <Label style={{color:'var(--custom-text)'}} htmlFor="sku">SKU</Label>
                                                    {isEditing ? (
                                                        <Input
                                                            id="sku"
                                                            value={editedProduct.sku}
                                                            onChange={(e) => setEditedProduct({ ...editedProduct, sku: e.target.value })}
                                                            placeholder="Артикул товара"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    ) : (
                                                        <div style={{color:'var(--custom-text)'}} className="text-sm p-2 bg-muted rounded">{product.sku || 'Не указан'}</div>
                                                    )}
                                                </div>
                                                <div className="space-y-2 text-white">
                                                    <Label style={{color:'var(--custom-text)'}} htmlFor="barcode">Штрих-код</Label>
                                                    {isEditing ? (
                                                        <Input
                                                            id="barcode"
                                                            value={editedProduct.barcode}
                                                            onChange={(e) => setEditedProduct({ ...editedProduct, barcode: e.target.value })}
                                                            placeholder="Штрих-код"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    ) : (
                                                        <div style={{color:'var(--custom-text)'}} className="text-sm p-2 bg-muted rounded">{product.barcode || 'Не указан'}</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-white">
                                                <Label style={{color:'var(--custom-text)'}} htmlFor="description">Описание</Label>
                                                {isEditing ? (
                                                    <Textarea
                                                        id="description"
                                                        value={editedProduct.description || ''}
                                                        onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
                                                        placeholder="Описание товара"
                                                        rows={3}
                                                        style={{
                                                            borderRadius: '20px',
                                                            border: 'var(--custom-border-primary)',
                                                            background: 'var(--custom-bg-secondaryLineCard)',
                                                            color: 'var(--custom-text)',
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{color:'var(--custom-text)'}} className="text-sm p-2 bg-muted rounded min-h-[60px]">
                                                        {product.description || 'Нет описания'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <div className='flex items-center p-4 gap-6'>
                                        <CardTitle style={{color:'var(--custom-text)'}} className="text-3xl text-white">
                                            {isEditing ? (
                                                <Input
                                                    value={editedProduct.name}
                                                    onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
                                                    className="text-2xl font-bold"
                                                    style={{
                                                        borderRadius: '20px',
                                                        border: 'var(--custom-border-primary)',
                                                        background: 'var(--custom-bg-secondaryLineCard)',
                                                        color: 'var(--custom-text)',
                                                    }}
                                                />
                                            ) : (
                                                productData.name
                                            )}
                                        </CardTitle>

                                        <div className="text-sm text-muted-foreground mt-1">
                                            {isEditing ? (
                                                <Select
                                                    value={editedProduct.categories_products_id.toString()}
                                                    onValueChange={(value) => setEditedProduct({ ...editedProduct, categories_products_id: parseInt(value) })}
                                                >
                                                    <SelectTrigger className="w-64"   style={{
                                                        borderRadius: '20px',
                                                        border: 'var(--custom-border-primary)',
                                                        background: 'var(--custom-bg-secondaryLineCard)',
                                                        color: 'var(--custom-text)',
                                                    }}>
                                                        <SelectValue placeholder="Выберите категорию" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map(cat => (
                                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                                {cat.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                `Категория: ${getCategoryPath(product.categories_products_id)}`
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Цена и единицы измерения */}
                                <div className="border rounded-lg">
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer bg-muted/50 hover:bg-muted/70"
                                        onClick={() => handleToggleSection('price')}
                                    >
                                        <div className="font-medium">Цена и единицы измерения</div>
                                        <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.has('price') ? 'rotate-180' : ''}`} />
                                    </div>
                                    {expandedSections.has('price') && (
                                        <div className="p-4 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2 text-white">
                                                    <Label style={{color:'var(--custom-text)'}} htmlFor="purchase_price text-white">Цена закупки</Label>
                                                    {isEditing ? (
                                                        <Input
                                                            id="purchase_price"
                                                            type="number"
                                                            step="0.01"
                                                            value={editedProduct.purchase_price}
                                                            onChange={(e) => setEditedProduct({ ...editedProduct, purchase_price: e.target.value })}
                                                            placeholder="0.00"
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    ) : (
                                                        <div style={{color:'var(--custom-text)'}} style={{color:'var(--custom-text)'}} className="text-sm p-2 bg-muted rounded">
                                                            ₽{parseFloat(product.purchase_price || "0").toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-2 text-white">
                                                    <Label style={{color:'var(--custom-text)'}} htmlFor="unit">Единица измерения</Label>
                                                    {isEditing ? (
                                                        <Select
                                                            value={editedProduct.unit_id?.toString() || ''}
                                                            onValueChange={(value) => setEditedProduct({ ...editedProduct, unit_id: parseInt(value) })}
                                                        >
                                                            <SelectTrigger className="w-full"      style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}>
                                                                <SelectValue placeholder="Выберите единицу измерения" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {units.map(unit => (
                                                                    <SelectItem key={unit.id} value={unit.id.toString()}>
                                                                        {unit.name} ({unit.symbol})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <div style={{color:'var(--custom-text)'}} className="text-sm p-2 bg-muted rounded">
                                                            {getUnitName(product.unit_id)} ({getUnitSymbol(product.unit_id)})
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Текущие остатки */}
                                <div className="border rounded-lg">
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer bg-muted/50 hover:bg-muted/70"
                                        onClick={() => handleToggleSection('stock')}
                                    >
                                        <div className="font-medium">Текущие остатки</div>
                                        <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.has('stock') ? 'rotate-180' : ''}`} />
                                    </div>
                                    {expandedSections.has('stock') && (
                                        <div className="p-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Всего на складе</div>
                                                    <div className="text-2xl font-medium text-green-500">
                                                        {productData.totalStock} {getUnitSymbol(product.unit_id)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground ">Текущая цена</div>
                                                    <div className="text-2xl font-medium text-red-600">₽{productData.avgPrice}</div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Общая стоимость</div>
                                                    <div className="text-2xl font-medium text-orange-600">
                                                        ₽{(productData.totalStock * productData.avgPrice).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="batches" className="space-y-4">
                    <Card style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader>
                            <CardTitle>Общая информация</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className=" rounded-lg p-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Всего на складе</div>
                                        <div style={{color:'var(--custom-text)'}} className="text-2xl font-medium text-white">
                                            {productData.totalStock} {getUnitSymbol(product.unit_id)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Текущая цена</div>
                                        <div className="text-2xl font-medium text-red-600">₽{productData.avgPrice}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Общая стоимость</div>
                                        <div className="text-2xl font-medium text-orange-600">
                                            ₽{(productData.totalStock * productData.avgPrice).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader className='text-white'>
                            <CardTitle style={{color:'var(--custom-text)'}}>Партии товара (порядок списания FIFO)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>№ партии</TableHead>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>Поставщик</TableHead>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>Склад</TableHead>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>Количество</TableHead>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>Цена</TableHead>
                                        <TableHead style={{color:'rgb(101,125,156)'}}> Получено</TableHead>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>Срок годности</TableHead>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>Стоимость</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productData.batches.map((batch, idx) => {
                                        const expiryStatus = getExpiryStatus(batch.daysUntilExpiry);
                                        return (
                                            <TableRow key={batch.id} className={idx === 0 ? 'text-white' : ''}>
                                                <TableCell style={{color:'var(--custom-text)'}}>
                                                    {batch.batchNumber}
                                                    {idx === 0 && (
                                                        <Badge variant="secondary"
                                                               className="ml-2 bg-blue-100 text-blue-800 text-xs">
                                                            Списывается первым
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell style={{color:'var(--custom-text)'}}>{batch.supplier}</TableCell>
                                                <TableCell style={{color:'var(--custom-text)'}}>
                                                    <Badge variant="outline" className="text-xs text-white">
                                                        {batch.warehouse}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell style={{color:'var(--custom-text)'}}>{batch.quantity} {getUnitSymbol(product.unit_id)}</TableCell>
                                                <TableCell style={{color:'var(--custom-text)'}}>₽{batch.purchasePrice}</TableCell>
                                                <TableCell style={{color:'var(--custom-text)'}}>
                                                    {new Date(batch.receivedDate).toLocaleDateString('ru-RU')}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className={`font-medium ${expiryStatus.color === 'red' ? 'text-red-600' :
                                                            expiryStatus.color === 'orange' ? 'text-orange-600' :
                                                                'text-green-600'
                                                        }`}>
                                                            {new Date(batch.expiryDate).toLocaleDateString('ru-RU')}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {batch.daysUntilExpiry} дн.
                                                        </div>
                                                        {expiryStatus.status !== 'ok' && (
                                                            <Badge variant="outline" className={`mt-1 text-xs ${expiryStatus.color === 'red' ? 'bg-red-100 text-red-800 border-red-200' :
                                                                expiryStatus.color === 'orange' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                            }`}>
                                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                                {expiryStatus.label}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
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
                                                <TableCell className="text-orange-600">
                                                    ₽{batch.totalCost.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="suppliers" className="space-y-4">
                    <Card style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader className='text-white'>
                            <CardTitle style={{color:'var(--custom-text)'}}>Альтернативные поставщики</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {pointsRetail.filter((point, index, self) =>
                                    index === self.findIndex(p => p.id === point.id)
                                ).map((supplier) => (
                                    <Card key={supplier.id} style={{
                                        borderRadius: '20px',
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-secondaryLineCard)',
                                        color: 'var(--custom-text)',
                                    }}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div style={{color:'var(--custom-text)'}} className="font-medium text-white">{supplier.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {supplier.address}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        ID: {supplier.id} | Тип: {supplier.type}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg text-orange-600">₽{productData.avgPrice}</div>
                                                    <div className="text-xs text-muted-foreground">за {getUnitSymbol(product.unit_id)}</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader className='text-white'>
                            <CardTitle style={{color:'var(--custom-text)'}}>Автозаказ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-blue-800 mb-1">
                                            Автозаказ при минимальном запасе
                                        </div>
                                        <div className="text-sm text-blue-700">
                                            При достижении минимального запаса
                                            ({productData.minStock} {getUnitSymbol(product.unit_id)})
                                            система автоматически сформирует заказ поставщику
                                            на {productData.optimalStock - productData.minStock} {getUnitSymbol(product.unit_id)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="stats" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Card style={{
                            borderRadius: '20px',
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-secondaryLineCard)',
                            color: 'var(--custom-text)',
                        }}>
                            <CardHeader className="pb-3">
                                <CardTitle style={{color:'var(--custom-text)'}} className="text-sm text-white">Расход</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div style={{color:'var(--custom-text)'}} className="text-2xl text-white">{productData.usagePerDay} {getUnitSymbol(product.unit_id)}/день</div>
                                <div style={{color:'var(--custom-text)'}} className="text-xs text-muted-foreground mt-1">
                                    Запасов хватит на {productData.daysInStock.toFixed(1)} дней
                                </div>
                            </CardContent>
                        </Card>
                        <Card style={{
                            borderRadius: '20px',
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-secondaryLineCard)',
                            color: 'var(--custom-text)',
                        }}>
                            <CardHeader className="pb-3">
                                <CardTitle style={{color:'var(--custom-text)'}} className="text-sm text-white">Оборачиваемость</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div style={{color:'var(--custom-text)'}} className="text-2xl text-white">{productData.turnoverRate.toFixed(1)}x</div>
                                <div style={{color:'var(--custom-text)'}} className="text-xs text-muted-foreground mt-1">
                                    раз в месяц
                                </div>
                            </CardContent>
                        </Card>
                        <Card style={{
                            borderRadius: '20px',
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-secondaryLineCard)',
                            color: 'var(--custom-text)',
                        }}>
                            <CardHeader className="pb-3 text-white">
                                <CardTitle style={{color:'var(--custom-text)'}} className="text-sm">Процент порчи</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`text-2xl ${productData.wastePercentage > 5 ? 'text-red-600' : 'text-green-600'}`}>
                                    {productData.wastePercentage}%
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {productData.wastePercentage > 5 ? 'Требует внимания' : 'В пределах нормы'}
                                </div>
                            </CardContent>
                        </Card>
                        <Card style={{
                            borderRadius: '20px',
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-secondaryLineCard)',
                            color: 'var(--custom-text)',
                        }}>
                            <CardHeader className="pb-3">
                                <CardTitle style={{color:'var(--custom-text)'}} className="text-sm text-white">Связь с меню</CardTitle>
                            </CardHeader>
                            <CardContent style={{color:'var(--custom-text)'}}>
                                <div style={{color:'var(--custom-text)'}} className="text-2xl text-white">3 блюда</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    используют этот ингредиент
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
                        <CardHeader style={{color:'var(--custom-text)'}}>
                            <CardTitle style={{color:'var(--custom-text)'}} className="text-base text-white">Прогноз потребности</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div style={{color:'var(--custom-text)'}} className="space-y-2 text-white">
                                <div className="flex justify-between text-sm">
                                    <span>Расход за неделю:</span>
                                    <span
                                        className="font-medium">{(productData.usagePerDay * 7).toFixed(1)} {getUnitSymbol(product.unit_id)}</span>
                                </div>
                                <div style={{color:'var(--custom-text)'}} className="flex justify-between text-sm">
                                    <span>Расход за месяц:</span>
                                    <span
                                        className="font-medium">{(productData.usagePerDay * 30).toFixed(1)} {getUnitSymbol(product.unit_id)}</span>
                                </div>
                                <Separator />
                                <div style={{color:'var(--custom-text)'}} className="flex justify-between text-sm">
                                    <span >Рекомендуемый заказ:</span>
                                    <span className="font-medium text-orange-600">
                {Math.max(0, productData.optimalStock - productData.totalStock).toFixed(1)} {getUnitSymbol(product.unit_id)}
              </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardContent className="pt-6">
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onBack}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Списать
                        </Button>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Добавить партию
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

BlcokDiteilView.displayName = 'BlcokDiteilView';

export default BlcokDiteilView;