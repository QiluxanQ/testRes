import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { Separator } from '../../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Switch } from '../../ui/switch';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    ChevronRight,
    ChevronDown,
    Clock,
    ArrowLeft,
    Calculator,
    Package,
    LayoutGrid,
    List,
    X,
    AlertCircle,
    RefreshCw,
    Utensils,
    MapPin,
    Layers,
    Tag,
    DollarSign,
    Percent,
    Info,
    ChevronUp
} from 'lucide-react';

// Redux imports
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import {
    setSelectedSalesPoint,
    clearError,
    updateDishLocally,
    updateComboLocally,
    clearCache,
    refreshMenuData,
    updateDish,
    addDish,
    deleteDish,
    addCalculation,
    removeCalculation,
    updateCalculation,
    fetchInitialMenuData,
    fetchAdditionalMenuData,
    loadAdditionalDataIfNeeded,
    fetcAlergenAndModifaiRefresh,
    fetchDishesAndCombosRefreshOptimized,
    fetchCalculateRefresh
} from '../../../slice/menuSlice';


import {Dish, ApiCategory, ApiProduct, Calculation, ApiAllergen, ApiModifier, ApiDishModifierItem, DishModifier,
    ApiPriceDish, DishMetadata,
    ApiPriceCombo, NestedCategory,ComboItem } from '../../../types/menu';
import {useDishDataUpdater} from '../../../hooks/useDishData'

import FullPageDishView from "./blocks/FullPageDishView";
import FullScreenAddDish from "./blocks/FullScreenAddDish";

const ComboAllergensAndModifiers: React.FC<{
    comboItems: ComboItem[];
}> = ({ comboItems }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [expandedDishes, setExpandedDishes] = useState<number[]>([]);

    const allAllergens = useMemo(() => {
        const allergens = new Map<number, ApiAllergen>();

        comboItems.forEach(item => {
            if (item.dish?.allergens) {
                item.dish.allergens.forEach(allergen => {
                    if (!allergens.has(allergen.id)) {
                        allergens.set(allergen.id, allergen);
                    }
                });
            }
        });

        return Array.from(allergens.values());
    }, [comboItems]);

    const allModifiers = useMemo(() => {
        const modifiers = new Map<number, ApiModifier & { status?: string; comment?: string }>();

        comboItems.forEach(item => {
            if (item.dish?.modifiers) {
                item.dish.modifiers.forEach(modifier => {
                    if (!modifiers.has(modifier.id)) {
                        modifiers.set(modifier.id, modifier);
                    }
                });
            }
        });

        return Array.from(modifiers.values());
    }, [comboItems]);

    // Группируем аллергены и модификаторы по блюдам для детального отображения
    const groupedByDish = useMemo(() => {
        return comboItems.map(item => ({
            dishId: item.dish_id,
            dishName: item.dish_name,
            allergens: item.dish?.allergens || [],
            modifiers: item.dish?.modifiers || []
        }));
    }, [comboItems]);

    const toggleDishExpansion = (dishId: number) => {
        setExpandedDishes(prev =>
            prev.includes(dishId)
                ? prev.filter(id => id !== dishId)
                : [...prev, dishId]
        );
    };

    if (comboItems.length === 0 || (allAllergens.length === 0 && allModifiers.length === 0)) {
        return null;
    }

    return (
        <Card className="mt-4 border-blue-100" style={{
            borderRadius: '20px',
            border: '1px solid #334155',
            backgroundImage: 'linear-gradient(185deg, #1e293b 100%, #0f172a 100%)'}}>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                            <Info className="h-5 w-5 text-blue-500" />
                            Аллергены и модификаторы комбо
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            {showDetails ? (
                                <>
                                    <ChevronUp className="h-4 w-4 mr-1" />
                                    Свернуть детали
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4 mr-1" />
                                    Подробнее
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Сводная информация */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-700 text-white">Аллергены комбо</h4>
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    {allAllergens.length} типов
                                </Badge>
                            </div>
                            {allAllergens.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {allAllergens.map(allergen => (
                                        <Badge
                                            key={allergen.id}
                                            variant="outline"
                                            className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                            title={allergen.description || ''}
                                        >
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            {allergen.name}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">В комбо нет аллергенов</p>
                            )}
                        </div>

                        <div className="space-y-2" >
                            <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-700 text-white">Модификаторы комбо</h4>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    <Package className="h-3 w-3 mr-1" />
                                    {allModifiers.length} видов
                                </Badge>
                            </div>
                            {allModifiers.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {allModifiers.map(modifier => (
                                        <Badge
                                            key={modifier.id}
                                            variant="outline"
                                            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                            title={`${modifier.name} - ${parseFloat(modifier.price).toFixed(2)}₽`}
                                        >
                                            <Package className="h-3 w-3 mr-1" />
                                            {modifier.name}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">В комбо нет модификаторов</p>
                            )}
                        </div>
                    </div>

                    {/* Детальная информация по блюдам */}
                    {showDetails && (
                        <div className="border-t pt-4 mt-4">
                            <h4 className="font-medium mb-3 text-gray-700">Подробно по блюдам:</h4>
                            <div className="space-y-3">
                                {groupedByDish.map((dish, index) => (
                                    <Card key={index} className="border hover:border-blue-200 transition-colors">
                                        <CardContent className="p-3">
                                            <div
                                                className="flex items-center justify-between cursor-pointer"
                                                onClick={() => toggleDishExpansion(dish.dishId)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <h5 className="font-medium text-blue-600">{dish.dishName}</h5>
                                                    <div className="flex gap-1">
                                                        {dish.allergens.length > 0 && (
                                                            <Badge
                                                                variant="outline"
                                                                size="sm"
                                                                className="bg-red-50 text-red-700 text-xs"
                                                            >
                                                                {dish.allergens.length} аллергенов
                                                            </Badge>
                                                        )}
                                                        {dish.modifiers.length > 0 && (
                                                            <Badge
                                                                variant="outline"
                                                                size="sm"
                                                                className="bg-blue-50 text-blue-700 text-xs"
                                                            >
                                                                {dish.modifiers.length} модификаторов
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                >
                                                    {expandedDishes.includes(dish.dishId) ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>

                                            {expandedDishes.includes(dish.dishId) && (
                                                <div className="mt-3 pt-3 border-t">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <p style={{color:'var(--custom-text)'}} className="text-sm font-medium text-gray-500 mb-2 text-white">
                                                                Аллергены
                                                            </p>
                                                            {dish.allergens.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {dish.allergens.map(allergen => (
                                                                        <div
                                                                            key={allergen.id}
                                                                            className="flex items-center gap-2 p-2 bg-red-50 rounded"
                                                                        >
                                                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                                                            <div className="flex-1">
                                                                                <p className="font-medium text-sm text-red-700">
                                                                                    {allergen.name}
                                                                                </p>
                                                                                {allergen.description && (
                                                                                    <p className="text-xs text-gray-600">
                                                                                        {allergen.description}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-gray-500">Аллергенов нет</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500 mb-2">
                                                                Модификаторы
                                                            </p>
                                                            {dish.modifiers.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {dish.modifiers.map(modifier => (
                                                                        <div
                                                                            key={modifier.id}
                                                                            className="flex items-center justify-between p-2 bg-blue-50 rounded"
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <Package className="h-4 w-4 text-blue-600" />
                                                                                <div>
                                                                                    <p className="font-medium text-sm text-blue-700">
                                                                                        {modifier.name}
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-600">
                                                                                        {parseFloat(modifier.price).toFixed(2)}₽
                                                                                        {modifier.status === 'required' && ' • Обязателен'}
                                                                                        {modifier.status === 'unavailable' && ' • Недоступен'}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-gray-500">Модификаторов нет</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Информационное сообщение */}
                    <div className="text-xs text-gray-500 border-t pt-3">
                        <p>
                            <Info className="h-3 w-3 inline mr-1" />
                            Аллергены и модификаторы автоматически собраны из всех блюд, входящих в комбо.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const getExtendedDishData = (dish: any) => {
    const metadata = dish.metadate || {};
    const seasonal = typeof metadata.seasonal === 'boolean' ? metadata.seasonal : false;
    const popular = typeof metadata.popular === 'boolean' ? metadata.popular : false;

    const baseFields = {
        name: dish.name,
        price: parseFloat(dish.price) || 0,
        weight: dish.weight,
        is_active: dish.is_active,
        kcal: parseFloat(dish.kcal) || 0,
        proteins: parseFloat(dish.proteins) || 0,
        fats: parseFloat(dish.fats) || 0,
        carbohydrates: parseFloat(dish.carbohydrates) || 0,
        display_website: dish.display_website,
        units_id: dish.units_id
    };

    return {
        ...baseFields,
        subcategory: metadata.subcategory || '',
        kitchenStation: metadata.kitchenStation || '',
        cookTime: metadata.cookTime || 0,
        description: metadata.description || '',
        seasonal: seasonal,
        popular: popular,
        allergens: metadata.allergens || [],
        cookingSteps: metadata.cookingSteps || [],
        portionWeight: metadata.portionWeight || 0,
        markup: metadata.markup || 0,
        modifiers: getModifiersFromMetadata(metadata),
        is_combo: dish.is_combo || false,
        combo_items: dish.combo_items || [],
        metadate: metadata
    };
};

const getModifiersFromMetadata = (metadata: DishMetadata): DishModifier[] => {
    return metadata?.modifiers || [];
};

const prepareDishForApi = (dishData: any, isCombo: boolean = false) => {
    const {
        subcategory, kitchenStation, cookTime, description,
        seasonal, popular, allergens, cookingSteps, combo_menu,
        portionWeight, markup, modifiers,
        name, price, weight, units_id, is_active, kcal, proteins, fats, carbohydrates, display_website,
        combo_items,cost_dish,
        ...rest
    } = dishData;

    const metadata: DishMetadata = {
        ...dishData.metadate,
        subcategory,
        kitchenStation,
        cookTime,
        description,
        seasonal,
        popular,
        combo_menu,
        allergens,
        cookingSteps,
        portionWeight,
        markup,
        modifiers
    };

    const apiData: any = {
        name,
        weight: weight || "0",
        units_id: units_id || 1,
        cost_dish: cost_dish?.toString() || "0",
        is_active,
        kcal: kcal?.toString() || "0",
        proteins: proteins?.toString() || "0",
        fats: fats?.toString() || "0",
        carbohydrates: carbohydrates?.toString() || "0",
        display_website,
        metadate: Object.keys(metadata).length > 0 ? metadata : null,
        ...rest
    };

    if (isCombo) {
        apiData.is_combo = true;
        apiData.combo_items = combo_items || [];

        apiData.price = price?.toString() || "0";
    } else {

        apiData.price = price?.toString() || "0";
    }

    return apiData;
};


const AllergensManager: React.FC<{
    dishId: number;
    currentAllergens: ApiAllergen[];
    allAllergens: ApiAllergen[];
    onUpdate: (allergenIds: number[]) => void;
}> = ({ dishId, currentAllergens, allAllergens, onUpdate }) => {
    const [selectedAllergenId, setSelectedAllergenId] = useState<number | null>(null);
    const [comment, setComment] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const dispatch = useDispatch();

    const handleAddAllergen = async () => {
        if (!selectedAllergenId) return;

        const alreadyExistsLocally = currentAllergens.some(a => a.id === selectedAllergenId);
        if (alreadyExistsLocally) {
            alert('Этот аллерген уже добавлен в блюдо');
            setSelectedAllergenId(null);
            setComment('');
            return;
        }

        setIsSaving(true);
        const token = localStorage.getItem('token');

        try {
            // Добавляем на сервер
            const allergenData = {
                dish_id: dishId,
                allergens_id: selectedAllergenId,
                comment: comment.trim() || null,
                metadate: null
            };

            const response = await fetch('/dish-allergens-items/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(allergenData)
            });

            if (response.status === 409) {
                alert('Этот аллерген уже добавлен в блюдо (конфликт)');
                setSelectedAllergenId(null);
                setComment('');
                return;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка добавления аллергена: ${errorText}`);
            }
            await dispatch(fetcAlergenAndModifaiRefresh()).unwrap();
            const selectedAllergen = allAllergens.find(a => a.id === selectedAllergenId);
            if (selectedAllergen) {
                const updatedAllergens = [...currentAllergens, {
                    ...selectedAllergen,
                    comment: comment.trim() || undefined
                }];
                onUpdate(updatedAllergens.map(a => a.id));
            }
            setSelectedAllergenId(null);
            setComment('');
            alert('Аллерген успешно добавлен!');

        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось добавить аллерген');
        } finally {
            setIsSaving(false);
        }
    };


    const handleRemoveAllergen = async (allergenId: number) => {
        if (!confirm('Удалить этот аллерген из блюда?')) return;

        setIsSaving(true);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`/dish-allergens-items/?dish_id=${dishId}&allergens_id=${allergenId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const items = await response.json();
                if (items.length > 0) {
                    const deleteResponse = await fetch(`/dish-allergens-items/${items[0].id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!deleteResponse.ok) throw new Error('Ошибка удаления аллергена');
                }
            }

            const updatedAllergens = currentAllergens.filter(a => a.id !== allergenId);
            onUpdate(updatedAllergens.map(a => a.id));
            alert('Аллерген удален!');
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось удалить аллерген');
        } finally {
            setIsSaving(false);
        }
    };

    const availableAllergens = allAllergens.filter(allergen =>
        !currentAllergens.some(a => a.id === allergen.id)
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 style={{color:'var(--custom-text)'}} className="text-lg font-semibold text-white">Аллергены</h3>
                <Badge style={{color:'var(--custom-text)'}} className='text-white' variant="outline">{currentAllergens.length} аллергенов</Badge>
            </div>

            <Card className="p-4 border-dashed border-2"  style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Выберите аллерген</label>
                            <Select
                                value={selectedAllergenId?.toString() || ''}
                                onValueChange={(value) => setSelectedAllergenId(value ? parseInt(value) : null)}
                            >
                                <SelectTrigger   style={{
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-inpyt)',
                                    color: 'var(--custom-text)',
                                }}>
                                    <SelectValue placeholder="Выберите аллерген" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableAllergens.map(allergen => (
                                        <SelectItem key={allergen.id} value={allergen.id.toString()} >
                                            {allergen.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Комментарий (опционально)</label>
                            <Input
                                placeholder="Комментарий к аллергену"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                style={{
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-inpyt)',
                                    color: 'var(--custom-text)',
                                }}
                            />
                        </div>
                    </div>
                    <Button
                        type="button"
                        onClick={handleAddAllergen}
                        disabled={!selectedAllergenId || isSaving}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить аллерген
                    </Button>
                </div>
            </Card>

            {currentAllergens.length > 0 ? (
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                        {currentAllergens.map((allergen) => (
                            <Badge key={allergen.id} className="bg-red-100 text-red-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {allergen.name}
                                <X
                                    className="h-3 w-3 ml-1 cursor-pointer"
                                    onClick={() => handleRemoveAllergen(allergen.id)}
                                />
                            </Badge>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-4 text-muted-foreground border rounded-lg">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>Аллергены не указаны</p>
                </div>
            )}
        </div>
    );
};

const ModifiersManager: React.FC<{
    dishId: number;
    currentModifiers: (ApiModifier & { status?: string; comment?: string })[];
    allModifiers: ApiModifier[];
    onUpdate: (modifierItems: { modifiers_id: number; status: string; comment: string }[]) => void;
}> = ({ dishId, currentModifiers, allModifiers, onUpdate }) => {
    const [selectedModifierId, setSelectedModifierId] = useState<number | null>(null);
    const [status, setStatus] = useState('available');
    const [comment, setComment] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const dispatch = useDispatch();

    const handleAddModifier = async () => {
        if (!selectedModifierId) return;

        setIsSaving(true);
        const token = localStorage.getItem('token');

        try {
            const modifierData = {
                dish_id: dishId,
                modifiers_id: selectedModifierId,
                status: status,
                comment: comment.trim() || null,
                metadate: null
            };

            const response = await fetch('/dish-modifier-items/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(modifierData)
            });

            if (!response.ok) throw new Error('Ошибка добавления модификатора');
            if (response.ok) {
                await dispatch(fetcAlergenAndModifaiRefresh()).unwrap();
            }
            const newItem = await response.json();

            const selectedModifier = allModifiers.find(m => m.id === selectedModifierId);
            if (selectedModifier) {
                const updatedModifiers = [...currentModifiers, {
                    ...selectedModifier,
                    status,
                    comment
                }];

                onUpdate(updatedModifiers.map(m => ({
                    modifiers_id: m.id,
                    status: m.status || 'available',
                    comment: m.comment || ''
                })));
            }

            setSelectedModifierId(null);
            setStatus('available');
            setComment('');
            alert('Модификатор успешно добавлен!');
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось добавить модификатор');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveModifier = async (modifierId: number) => {
        if (!confirm('Удалить этот модификатор из блюда?')) return;

        setIsSaving(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/dish-modifier-items/?dish_id=${dishId}&modifiers_id=${modifierId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const items = await response.json();
                if (items.length > 0) {
                    const deleteResponse = await fetch(`/dish-modifier-items/${items[0].id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!deleteResponse.ok) throw new Error('Ошибка удаления модификатора');
                }
            }

            const updatedModifiers = currentModifiers.filter(m => m.id !== modifierId);
            onUpdate(updatedModifiers.map(m => ({
                modifiers_id: m.id,
                status: m.status || 'available',
                comment: m.comment || ''
            })));

            alert('Модификатор удален!');
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось удалить модификатор');
        } finally {
            setIsSaving(false);
        }
    };

    const availableModifiers = allModifiers.filter(modifier =>
        !currentModifiers.some(m => m.id === modifier.id)
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 style={{color:'var(--custom-text)'}} className="text-lg font-semibold text-white">Модификаторы</h3>
                <Badge style={{color:'var(--custom-text)'}} className='text-white' variant="outline">{currentModifiers.length} модификаторов</Badge>
            </div>

            <Card className="p-4 border-dashed border-2"  style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}
            >
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Выберите модификатор</label>
                            <Select
                                value={selectedModifierId?.toString() || ''}
                                onValueChange={(value) => setSelectedModifierId(value ? parseInt(value) : null)}
                            >
                                <SelectTrigger   style={{
                                    borderRadius: '20px',
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-inpyt)',
                                    color: 'var(--custom-text)',
                                }}>
                                    <SelectValue placeholder="Выберите модификатор" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableModifiers.map(modifier => (
                                        <SelectItem key={modifier.id} value={modifier.id.toString()}>
                                            {modifier.name} - {parseFloat(modifier.price).toFixed(2)}₽
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Статус</label>
                            <Select
                                value={status}
                                onValueChange={setStatus}
                            >
                                <SelectTrigger   style={{
                                    borderRadius: '20px',
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-inpyt)',
                                    color: 'var(--custom-text)',
                                }}>
                                    <SelectValue placeholder="Выберите статус" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Доступен</SelectItem>
                                    <SelectItem value="required">Обязателен</SelectItem>
                                    <SelectItem value="unavailable">Недоступен</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Комментарий</label>
                            <Input
                                placeholder="Комментарий к модификатору"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                style={{
                                    borderRadius: '20px',
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-inpyt)',
                                    color: 'var(--custom-text)',
                                }}
                            />
                        </div>
                    </div>
                    <Button
                        type="button"
                        onClick={handleAddModifier}
                        disabled={!selectedModifierId || isSaving}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить модификатор
                    </Button>
                </div>
            </Card>

            {currentModifiers.length > 0 ? (
                <div className="overflow-x-auto border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead style={{color:'rgb(101,125,156)'}}>Название</TableHead>
                                <TableHead style={{color:'rgb(101,125,156)'}}>Цена</TableHead>
                                <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                                <TableHead style={{color:'rgb(101,125,156)'}}>Комментарий</TableHead>
                                <TableHead style={{color:'rgb(101,125,156)'}}>Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className='text-white'>
                            {currentModifiers.map((modifier) => (
                                <TableRow key={modifier.id}>
                                    <TableCell style={{color:'var(--custom-text)'}} className="font-medium">{modifier.name}</TableCell>
                                    <TableCell style={{color:'var(--custom-text)'}}>{parseFloat(modifier.price).toFixed(2)}₽</TableCell>
                                    <TableCell >
                                        <Badge style={{color:'var(--custom-text)'}} variant={
                                            modifier.status === 'available' ? 'default' :
                                                modifier.status === 'required' ? 'destructive' : 'outline'
                                        }>
                                            {modifier.status === 'available' ? 'Доступен' :
                                                modifier.status === 'required' ? 'Обязателен' : 'Недоступен'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell style={{color:'var(--custom-text)'}}>{modifier.comment || '-'}</TableCell>
                                    <TableCell style={{color:'var(--custom-text)'}}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveModifier(modifier.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Модификаторы не настроены</p>
                </div>
            )}
        </div>
    );
};

const DishCalculation: React.FC<{
    dish: Dish;
    onAddProduct: (dishId: number, productId: number, quantity: number, unitId: number) => void;
    onRemoveProduct: (calculationId: number) => void;
    onUpdateProduct: (calculationId: number, updates: {
        productId?: number;
        quantity?: number;
        unitId?: number;
    }) => void;
    products: ApiProduct[];
    isAdding: boolean;
    units?: any[];
}> = React.memo(({ dish, onAddProduct, onRemoveProduct, onUpdateProduct, products, isAdding, units = [] }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [selectedUnitId, setSelectedUnitId] = useState<string>('1');

    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [editSelectedProductId, setEditSelectedProductId] = useState('');
    const [editQuantity, setEditQuantity] = useState('');
    const [editSelectedUnitId, setEditSelectedUnitId] = useState<string>('1');

    const getUnitName = (unitId: number): string => {
        const unit = units.find(u => u.id === unitId);
        return unit ? unit.symbol : 'ед.';
    };

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || !quantity || !selectedUnitId) {
            alert("Выберите продукт, укажите количество и единицу измерения");
            return;
        }

        onAddProduct(
            dish.id,
            parseInt(selectedProductId),
            parseFloat(quantity),
            parseInt(selectedUnitId)
        );
        setSelectedProductId('');
        setQuantity('');
        setSelectedUnitId('1');
        setShowAddForm(false);
    }, [selectedProductId, quantity, selectedUnitId, dish.id, onAddProduct]);

    const handleStartEdit = useCallback((item: Calculation) => {
        setEditingItemId(item.id);
        setEditSelectedProductId(item.productId.toString());
        setEditQuantity(item.quantity.toString());
        const unitId = units.find(u => u.symbol === item.unit)?.id || 1;
        setEditSelectedUnitId(unitId.toString());
    }, [units]);

    const handleSaveEdit = useCallback(async () => {
        if (!editingItemId || !editSelectedProductId || !editQuantity || !editSelectedUnitId) {
            alert("Заполните все поля");
            return;
        }

        try {
            await onUpdateProduct(editingItemId, {
                productId: parseInt(editSelectedProductId),
                quantity: parseFloat(editQuantity),
                unitId: parseInt(editSelectedUnitId)
            });

            setEditingItemId(null);
            setEditSelectedProductId('');
            setEditQuantity('');
            setEditSelectedUnitId('1');
        } catch (error) {
            console.error("Ошибка при обновлении:", error);
            alert(`Не удалось обновить продукт: ${error.message}`);
        }
    }, [editingItemId, editSelectedProductId, editQuantity, editSelectedUnitId, onUpdateProduct]);

    const handleCancelEdit = useCallback(() => {
        setEditingItemId(null);
        setEditSelectedProductId('');
        setEditQuantity('');
        setEditSelectedUnitId('1');
    }, []);

    const activeProducts = useMemo(() =>
            products.filter(product => product.is_active),
        [products]
    );

    const totalCost = useMemo(() =>
            dish.calculation.reduce((sum, item) => sum + item.totalCost, 0),
        [dish.calculation]
    );

    const profit = dish.price - totalCost;
    const profitMargin = dish.price > 0 ? (profit / dish.price) * 100 : 0;

    if (dish.is_combo) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Состав комбо-набора</h3>
                </div>

                {dish.combo_items && dish.combo_items.length > 0 ? (
                    <div className="space-y-4">
                        <div className="overflow-x-auto border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>Блюдо</TableHead>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>Цена</TableHead>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>Количество</TableHead>
                                        <TableHead style={{color:'rgb(101,125,156)'}}>Включено</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dish.combo_items.map((item) => (
                                        <TableRow key={item.dish_id} className='text-white'>
                                            <TableCell className="font-medium">{item.dish_name}</TableCell>
                                            <TableCell>₽{item.price.toFixed(2)}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>
                                                {item.included ? (
                                                    <Badge variant="outline" className="bg-green-50">Да</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-red-50">Нет</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <Card className="bg-purple-50 border-purple-200">
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Сумма блюд</p>
                                        <p className="text-xl font-bold">
                                            ₽{dish.combo_items.reduce((sum, item) =>
                                            sum + (item.price * item.quantity), 0).toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Цена комбо</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            ₽{dish.price.toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Экономия</p>
                                        <p className="text-xl font-bold text-green-600">
                                            ₽{(dish.combo_items.reduce((sum, item) =>
                                            sum + (item.price * item.quantity), 0) - dish.price).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Добавляем отображение аллергенов и модификаторов для комбо */}
                        <ComboAllergensAndModifiers comboItems={dish.combo_items} />
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                        <Layers className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>Состав комбо не настроен</p>
                        <p className="text-sm">Добавьте блюда в состав комбо-набора</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 style={{color:'var(--custom-text)'}} className="text-lg font-semibold text-white">Калькуляция блюда</h3>
                <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    size="sm"
                    variant={showAddForm ? "secondary" : "default"}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {showAddForm ? 'Скрыть форму' : 'Добавить продукт'}
                </Button>
            </div>

            {showAddForm && (
                <Card  style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-secondaryLineCard)',
                    color: 'var(--custom-text)',
                }} className="bg-gray-50 border-dashed">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label style={{color:'var(--custom-text)'}} className="text-sm font-medium block mb-2 text-white">Продукт *</label>
                                    <select
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        style={{
                                            borderRadius: '20px',
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                        value={selectedProductId}
                                        onChange={(e) => setSelectedProductId(e.target.value)}
                                        required
                                    >
                                        <option value="">Выберите продукт</option>
                                        {activeProducts.map(product => (
                                            <option key={product.id} value={product.id} >
                                                {product.name} ({parseFloat(product.purchase_price || "0").toFixed(2)}₽)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{color:'var(--custom-text)'}} className="text-sm font-medium block mb-2 text-white">Количество *</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Введите количество"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="w-full"
                                        required
                                        style={{
                                            borderRadius: '20px',
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{color:'var(--custom-text)'}} className="text-sm font-medium block mb-2 text-white">Единица измерения *</label>
                                    <select
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={selectedUnitId}
                                        onChange={(e) => setSelectedUnitId(e.target.value)}
                                        required
                                        style={{
                                            borderRadius: '20px',
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    >
                                        <option value="">Выберите единицу</option>
                                        {units.length > 0 ? (
                                            units.map(unit => (
                                                <option key={unit.id} value={unit.id}>
                                                    {unit.symbol} ({unit.name})
                                                </option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="1">г (граммы)</option>
                                                <option value="2">мл (миллилитры)</option>
                                                <option value="3">шт (штуки)</option>
                                                <option value="4">кг (килограммы)</option>
                                                <option value="5">л (литры)</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddForm(false)}
                                    disabled={isAdding}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={!selectedProductId || !quantity || !selectedUnitId || isAdding}
                                >
                                    {isAdding ? 'Добавление...' : 'Добавить продукт'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {dish.calculation.length > 0 ? (
                <div className="space-y-4">
                    <div className="overflow-x-auto border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead style={{color:'rgb(101,125,156)'}}>Продукт</TableHead>
                                    <TableHead style={{color:'rgb(101,125,156)'}}>Количество</TableHead>
                                    <TableHead style={{color:'rgb(101,125,156)'}}>Ед. изм.</TableHead>
                                    <TableHead style={{color:'rgb(101,125,156)'}}>Цена за ед.</TableHead>
                                    <TableHead style={{color:'rgb(101,125,156)'}}>Общая стоимость</TableHead>
                                    <TableHead style={{color:'rgb(101,125,156)'}}>Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dish.calculation.map((item) => (
                                    editingItemId === item.id ? (
                                        <TableRow key={item.id} className="bg-blue-50">
                                            <TableCell>
                                                <select
                                                    className="w-full p-2 border rounded-md"
                                                    value={editSelectedProductId}
                                                    onChange={(e) => setEditSelectedProductId(e.target.value)}
                                                >
                                                    <option value="">Выберите продукт</option>
                                                    {activeProducts.map(product => (
                                                        <option key={product.id} value={product.id}>
                                                            {product.name} ({parseFloat(product.purchase_price || "0").toFixed(2)}₽)
                                                        </option>
                                                    ))}
                                                </select>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={editQuantity}
                                                    onChange={(e) => setEditQuantity(e.target.value)}
                                                    className="w-full"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <select
                                                    className="w-full p-2 border rounded-md"
                                                    value={editSelectedUnitId}
                                                    onChange={(e) => setEditSelectedUnitId(e.target.value)}
                                                >
                                                    <option value="">Выберите единицу</option>
                                                    {units.map(unit => (
                                                        <option key={unit.id} value={unit.id}>
                                                            {unit.symbol}
                                                        </option>
                                                    ))}
                                                </select>
                                            </TableCell>
                                            <TableCell>₽{item.price.toFixed(2)}</TableCell>
                                            <TableCell>₽{item.totalCost.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleSaveEdit}
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        Сохранить
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleCancelEdit}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        Отмена
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <TableRow key={item.id} className='text-white'>
                                            <TableCell style={{color:'var(--custom-text)'}} className="font-medium">{item.productName}</TableCell>
                                            <TableCell style={{color:'var(--custom-text)'}}>{item.quantity}</TableCell>
                                            <TableCell style={{color:'var(--custom-text)'}}>{item.unit}</TableCell>
                                            <TableCell style={{color:'var(--custom-text)'}}>₽{item.price.toFixed(2)}</TableCell>
                                            <TableCell style={{color:'var(--custom-text)'}}>₽{item.totalCost.toFixed(2)}</TableCell>
                                            <TableCell style={{color:'var(--custom-text)'}}>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleStartEdit(item)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onRemoveProduct(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                            <p className="text-sm text-muted-foreground">Себестоимость</p>
                            <p className="text-xl font-bold">₽{totalCost.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Прибыль</p>
                            <p className="text-xl font-bold text-green-600">₽{profit.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Маржа</p>
                            <p className="text-xl font-bold text-blue-600">{profitMargin.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Калькуляция не настроена</p>
                    <p className="text-sm">Добавьте продукты для расчета себестоимости</p>
                </div>
            )}
        </div>
    );
});

const ComboItemsEditor: React.FC<{
    comboItems: ComboItem[];
    allDishes: Dish[];
    onUpdate: (items: ComboItem[]) => void;
}> = ({ comboItems, allDishes, onUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDishId, setSelectedDishId] = useState<number | null>(null);

    const filteredDishes = useMemo(() => {
        return allDishes.filter(dish =>
            dish.is_active && // Только активные блюда
            dish.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !comboItems.some(item => item.dish_id === dish.id) && // Не добавлять повторно
            dish.metadate?.combo_menu === true
        );
    }, [allDishes, searchTerm, comboItems]);

    const handleAddDish = () => {
        if (!selectedDishId) return;

        const dish = allDishes.find(d => d.id === selectedDishId);
        if (dish) {
            const newItem: ComboItem = {
                dish_id: dish.id,
                dish_name: dish.name,
                price: dish.price,
                quantity: 1,
                included: true,
                dish: dish // Сохраняем полное блюдо с аллергенами и модификаторами
            };
            onUpdate([...comboItems, newItem]);
            setSelectedDishId(null);
            setSearchTerm('');
        }
    };

    const handleRemoveItem = (dishId: number) => {
        onUpdate(comboItems.filter(item => item.dish_id !== dishId));
    };

    const handleUpdateItem = (dishId: number, updates: Partial<ComboItem>) => {
        const updatedItems = comboItems.map(item =>
            item.dish_id === dishId ? { ...item, ...updates } : item
        );
        onUpdate(updatedItems);
    };

    const totalOriginalPrice = useMemo(() =>
            comboItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        [comboItems]
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 style={{color:'var(--custom-text)'}}  className="text-lg font-semibold text-white">Состав комбо</h3>
                <Badge variant="outline">
                    {comboItems.length} позиций
                </Badge>
            </div>

            <Card className="p-4 border-dashed border-2" style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-primaryLine)',
                color: 'var(--custom-text)',
            }}>
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Поиск блюд</label>
                            <Input
                                placeholder="Начните вводить название..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-inpyt)',
                                    color: 'var(--custom-text)',
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Выберите блюдо</label>
                            <Select
                                value={selectedDishId?.toString() || ''}
                                onValueChange={(value) => setSelectedDishId(value ? parseInt(value) : null)}
                            >
                                <SelectTrigger   style={{
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-inpyt)',
                                    color: 'var(--custom-text)',
                                }}>
                                    <SelectValue placeholder="Выберите блюдо" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredDishes.map(dish => (
                                        <SelectItem key={dish.id} value={dish.id.toString()}>
                                            <div className="flex items-center justify-between">
                                                <span>{dish.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    {dish.allergens?.length > 0 && (
                                                        <AlertCircle className="h-3 w-3 inline text-red-500 mr-1" />
                                                    )}
                                                    {dish.modifiers?.length > 0 && (
                                                        <Package className="h-3 w-3 inline text-blue-500 mr-1" />
                                                    )}
                                                    ₽{dish.price}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button
                        onClick={handleAddDish}
                        disabled={!selectedDishId}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить в комбо
                    </Button>
                </div>
            </Card>

            {comboItems.length > 0 ? (
                <div className="space-y-4">
                    <div className="overflow-x-auto border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead style={{color:'rgb(101,125,156)'}}>Блюдо</TableHead>
                                    <TableHead style={{color:'rgb(101,125,156)'}}>Цена</TableHead>
                                    <TableHead style={{color:'rgb(101,125,156)'}}>Количество</TableHead>
                                    <TableHead style={{color:'rgb(101,125,156)'}}>Включено</TableHead>
                                    <TableHead style={{color:'rgb(101,125,156)'}}>Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {comboItems.map((item) => (
                                    <TableRow key={item.dish_id} className='text-white
                                    '>
                                        <TableCell style={{color:'var(--custom-text)'}} className="font-medium text-white">
                                            <div className="flex flex-col">
                                                <span>{item.dish_name}</span>
                                                <div className="flex gap-1 mt-1">
                                                    {item.dish?.allergens && item.dish.allergens.length > 0 && (
                                                        <Badge variant="outline" size="sm" className="text-xs bg-red-50">
                                                            {item.dish.allergens.length} ал.
                                                        </Badge>
                                                    )}
                                                    {item.dish?.modifiers && item.dish.modifiers.length > 0 && (
                                                        <Badge variant="outline" size="sm" className="text-xs bg-blue-50">
                                                            {item.dish.modifiers.length} мод.
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell style={{color:'var(--custom-text)'}}>₽{item.price.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleUpdateItem(item.dish_id, {
                                                    quantity: parseInt(e.target.value) || 1
                                                })}
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                                className="w-20"

                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={item.included}
                                                onCheckedChange={(checked) =>
                                                    handleUpdateItem(item.dish_id, { included: checked })
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveItem(item.dish_id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Итоговая цена без скидки</p>
                                    <p className="text-xl font-bold">₽{totalOriginalPrice.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Экономия покупателя</p>
                                    <p className="text-xl font-bold text-green-600">
                                        ₽{(totalOriginalPrice * 0.2).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    <Layers className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Комбо пока пустое</p>
                    <p className="text-sm">Добавьте блюда для создания комбо-набора</p>
                </div>
            )}
        </div>
    );
};

const buildCategoryHierarchy = (categories: ApiCategory[]): NestedCategory[] => {
    const categoryMap = new Map<number, NestedCategory>();
    const rootCategories: NestedCategory[] = [];

    categories.forEach(cat => {
        categoryMap.set(cat.id, {
            id: cat.id,
            name: cat.name,
            parent_id: cat.parent_id,
            level: 0,
            children: [],
            dishes: []
        });
    });

    categoryMap.forEach(category => {
        if (category.parent_id === null) {
            rootCategories.push(category);
        } else {
            const parent = categoryMap.get(category.parent_id);
            if (parent) {
                category.level = parent.level + 1;
                parent.children.push(category);
            } else {
                rootCategories.push(category);
            }
        }
    });

    const sortCategories = (cats: NestedCategory[]): NestedCategory[] => {
        return cats.sort((a, b) => a.name.localeCompare(b.name)).map(cat => ({
            ...cat,
            children: sortCategories(cat.children)
        }));
    };

    return sortCategories(rootCategories);
};

const distributeDishesToCategories = (
    categories: NestedCategory[],
    dishes: Dish[],
    comboMeals: Dish[]
): NestedCategory[] => {
    const createCleanCategory = (cat: NestedCategory): NestedCategory => ({
        ...cat,
        dishes: [],
        children: cat.children.map(child => createCleanCategory(child))
    });

    const cleanCategories = categories.map(cat => createCleanCategory(cat));

    const processCategory = (category: NestedCategory): NestedCategory => {
        const categoryDishes = dishes.filter(dish =>
            dish.category_menu_id === category.id && dish.is_active !== false
        );
        const categoryComboMeals = comboMeals.filter(combo =>
            combo.category_menu_id === category.id && combo.is_active !== false
        );
        const allDishes = [...categoryDishes, ...categoryComboMeals].sort((a, b) =>
            a.name.localeCompare(b.name)
        );
        return {
            ...category,
            dishes: allDishes,
            children: category.children.map(child => processCategory(child))
        };
    };

    const result = cleanCategories.map(category => processCategory(category));
    return result;
};

const getAllDishesFromCategory = (category: NestedCategory): Dish[] => {
    return [
        ...category.dishes,
        ...category.children.flatMap(child => getAllDishesFromCategory(child))
    ];
};

const NestedCategoryTree: React.FC<{
    category: NestedCategory;
    selectedCategoryId: number | null;
    onSelectCategory: (category: NestedCategory) => void;
    openCategories: Record<number, boolean>;
    onToggleCategory: (categoryId: number) => void;
}> = React.memo(({ category, selectedCategoryId, onSelectCategory, openCategories, onToggleCategory }) => {
    const hasChildren = category.children.length > 0;
    const isSelected = selectedCategoryId === category.id;
    const isOpen = openCategories[category.id] || false;

    const countAllDishes = useCallback((cat: NestedCategory): number => {
        let count = cat.dishes.length; // Уже только активные блюда
        cat.children.forEach(child => {
            count += countAllDishes(child);
        });
        return count;
    }, []);

    const totalDishes = useMemo(() => countAllDishes(category), [category, countAllDishes]);

    const handleToggle = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleCategory(category.id);
    }, [category.id, onToggleCategory]);

    const handleSelect = useCallback(() => {
        onSelectCategory(category);
    }, [category, onSelectCategory]);

    return (
        <div>
            <div
                className={`flex items-center justify-between p-3 hover:bg-blue-700 cursor-pointer text-white ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}

                style={{ paddingLeft: `${16 + category.level * 16}px`,

                    borderRadius: '2px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-primaryLine)',
                    color: 'var(--custom-text)',
                }}
                onClick={handleSelect}
            >
                <div className="flex items-center gap-2 flex-1">
                    {hasChildren && (
                        <button
                            onClick={handleToggle}
                            className="p-1 hover:bg-gray-200 rounded"
                        >
                            {isOpen ? (
                                <ChevronDown className="h-3 w-3" />
                            ) : (
                                <ChevronRight className="h-3 w-3" />
                            )}
                        </button>
                    )}
                    {!hasChildren && <div className="w-5" />}
                    <span className={isSelected ? "font-semibold text-blue-600" : ""}>
                        {category.name}
                    </span>
                </div>
                <Badge style={{
                    borderRadius: '4px',
                    border: '1px solid #334155',
                    background: 'rgb(51, 65, 85)',
                    color: 'white',
                }} variant="secondary">{totalDishes}</Badge>
            </div>

            {hasChildren && isOpen && (
                <div>
                    {category.children.map(child => (
                        <NestedCategoryTree
                            key={child.id}
                            category={child}
                            selectedCategoryId={selectedCategoryId}
                            onSelectCategory={onSelectCategory}
                            openCategories={openCategories}
                            onToggleCategory={onToggleCategory}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

const Stats: React.FC<{
    totalDishes: number;
    activeDishes: number;
    inactiveDishes: number;
    avgPrice: number;
    onRefresh?: () => void;
    refreshing?: boolean;
    selectedSalesPoint?: any;
    categories?: NestedCategory[];
}> = ({
          totalDishes ,
          activeDishes,
          inactiveDishes,
          avgPrice,
          onRefresh,
          refreshing,
          selectedSalesPoint,
          categories = []
      }) => {
    const totalCategories = categories.length;
    const categoriesWithDishes = categories.filter(cat =>
        cat.dishes.length > 0 ||
        cat.children.some(child => child.dishes.length > 0)
    ).length;



    return (
        <div className="space-y-4">
            {selectedSalesPoint && (
                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-primaryLine)',
                    color: 'var(--custom-text)',
                }}>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="font-medium text-sm text-gray-500">
                                        Точка продаж
                                    </div>
                                    <div style={{color:'var(--custom-text)'}} className="text-lg font-semibold text-white">
                                        {selectedSalesPoint.name}
                                        {selectedSalesPoint.address && (
                                            <span style={{color:'var(--custom-text)'}} className="text-sm font-normal text-gray-500 ml-2 text-white">
                                                ({selectedSalesPoint.address})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">Категорий {totalCategories}</div>
                                    <div className="text-xs text-gray-400">
                                        {categoriesWithDishes} с блюдами
                                    </div>
                                </div>
                                {onRefresh && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onRefresh}
                                        disabled={refreshing}
                                        className="h-9 w-9 p-0 text-white"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-primaryLine)',
                    color: 'var(--custom-text)',
                }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Всего блюд</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div style={{color:'var(--custom-text)'}} className="text-2xl font-bold text-white">{totalDishes}</div>
                        <p className="text-xs text-muted-foreground">
                            {selectedSalesPoint ? `В точке ${selectedSalesPoint.name}` : 'Во всех точках'}
                        </p>
                    </CardContent>
                </Card>
                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-primaryLine)',
                    color: 'var(--custom-text)',
                }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Активные</CardTitle>
                        <Badge variant="secondary" className="h-4 w-4 bg-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeDishes}</div>
                        <p  className="text-xs text-muted-foreground">
                            {totalDishes > 0 ? `${Math.round((activeDishes / totalDishes) * 100)}% от общего` : 'Нет данных'}
                        </p>
                    </CardContent>
                </Card>
                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-primaryLine)',
                    color: 'var(--custom-text)',
                }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Неактивные</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{inactiveDishes}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalDishes > 0 ? `${Math.round((inactiveDishes / totalDishes) * 100)}% от общего` : 'Нет данных'}
                        </p>
                    </CardContent>
                </Card>
                <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-primaryLine)',
                    color: 'var(--custom-text)',
                }}>
                    <CardHeader style={{color:'var(--custom-text)'}} className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Средняя цена</CardTitle>
                        <Calculator className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">₽{avgPrice.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Средняя стоимость блюда
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-between items-center">
                <div style={{color:'var(--custom-text)'}} className="text-m text-muted-foreground text-white">
                    {refreshing ? 'Обновление данных...' : 'Данные актуальны'}
                </div>
                {onRefresh && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Обновление...' : 'Обновить данные'}
                    </Button>
                )}
            </div>
        </div>
    );
};

interface MenuProps {
    selectedSalesPoint: any;
}

export function Menu({ selectedSalesPoint }: MenuProps) {

    const dispatch = useDispatch();
    const {
        filteredDishes,
        filteredCategories,
        filteredComboMeals,
        products,
        calculations,
        units,
        allergens,
        modifiers,
        loading,
        refreshing,
        dishAllergensItems,
        dishModifierItems,
        error,
        usingCache,
        selectedSalesPointId,
        priceDishes,
        priceCombos,
        comboMealItems,
        loaded
    } = useSelector((state: RootState) => state.menu);

    const [categories, setCategories] = useState<NestedCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<NestedCategory | null>(null);
    const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('table');
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
    const [showAddDish, setShowAddDish] = useState(false);
    const [showAddCombo, setShowAddCombo] = useState(false);
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [fullPageDish, setFullPageDish] = useState<Dish | null>(null);
    const [newCategory, setNewCategory] = useState({ name: '', parent_id: null as number | null });
    const [displayMode, setDisplayMode] = useState<'category' | 'subcategory'>('category');
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [hasLoadedAdditionalData, setHasLoadedAdditionalData] = useState(false);


    useEffect(() => {

        const timer = setTimeout(() => {
            setCategories(prev => [...prev]);
        }, 500);

        return () => clearTimeout(timer);
    }, [filteredDishes.length, filteredComboMeals.length]);

    const [kitchen,setKitchen] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const response = fetch('kitchens/?skip=0&limit=100',{
            headers:{
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            }
        }).then(res => res.json())
            .then(data => setKitchen(data))
    }, []);

    const handleOpenAddDishForm = useCallback(async () => {
        if (!loaded.additional && !loading.additional) {
            try {
                await dispatch(fetchAdditionalMenuData()).unwrap();
                setHasLoadedAdditionalData(true);
            } catch (error) {
                console.error('Ошибка загрузки дополнительных данных:');
            }
        }
        setShowAddDish(true);
    }, [dispatch, loaded.additional, loading.additional]);
    useEffect(() => {
        if (selectedSalesPoint) {
            dispatch(setSelectedSalesPoint(selectedSalesPoint.id));
        } else {
            dispatch(setSelectedSalesPoint(null));
        }
    }, [dispatch, selectedSalesPoint]);

    // useEffect(() => {
    //     const loadInitialData = async () => {
    //         if (selectedSalesPointId !== null || selectedSalesPoint === null) {
    //             await dispatch(fetchInitialMenuData(selectedSalesPointId)).unwrap();
    //         }
    //     };
    //
    //     loadInitialData();
    // }, [dispatch, selectedSalesPointId]);

    useEffect(() => {
        const loadAllData = async () => {
            if (selectedSalesPointId !== null || selectedSalesPoint === null) {
                try {
                    await dispatch(fetchInitialMenuData(selectedSalesPointId)).unwrap();

                    setTimeout(async () => {
                        if (!loaded.additional && !loading.additional) {
                            try {
                                await dispatch(fetchAdditionalMenuData()).unwrap();
                            } catch (error) {
                                console.warn('Фоновая загрузка');
                            }
                        }
                    }, 1000);
                } catch (error) {
                    console.error('Ошибка загрузки данных:');
                }
            }
        };

        loadAllData();
    }, [dispatch, selectedSalesPointId]);

    useEffect(() => {
        if (fullPageDish && !loaded.additional && !loading.additional && !hasLoadedAdditionalData) {
            const loadAdditionalData = async () => {
                try {
                    await dispatch(fetchAdditionalMenuData()).unwrap();
                    setHasLoadedAdditionalData(true);
                } catch (error) {
                    console.error('Ошибка загрузки дополнительных данных:', error);
                }
            };

            loadAdditionalData();
        }
    }, [fullPageDish, dispatch, loaded.additional, loading.additional, hasLoadedAdditionalData]);

    useEffect(() => {
        const updateCategories = () => {
            if (filteredCategories.length > 0 && loaded.initial) {
                const currentPrices = priceDishes.filter(p => p.is_current);
                const currentComboPrices = priceCombos.filter(p => p.is_current);

                const dishes: Dish[] = filteredDishes
                    .filter(dish => dish.is_active !== false) // Явная проверка на false
                    .map(dish => {
                        const dishPrice = currentPrices.find(p => p.dish_id === dish.id);
                        const priceValue = dishPrice ? parseFloat(dishPrice.value) : parseFloat(dish.price || "0");

                        const dishAllergens = loaded.additional ?
                            dishAllergensItems
                                .filter(item => item.dish_id === dish.id)
                                .map(item => {
                                    const allergen = allergens.find(a => a.id === item.allergens_id);
                                    return allergen ? { ...allergen, comment: item.comment } : null;
                                })
                                .filter(Boolean)
                            : [];

                        const dishModifiers = loaded.additional ?
                            dishModifierItems
                                .filter(item => item.dish_id === dish.id)
                                .map(item => {
                                    const modifier = modifiers.find(m => m.id === item.modifiers_id);
                                    return modifier ? {
                                        ...modifier,
                                        status: item.status,
                                        comment: item.comment
                                    } : null;
                                })
                                .filter(Boolean)
                            : [];

                        const dishCalculations = loaded.additional ?
                            calculations
                                .filter(calc => calc.dish_id === dish.id)
                                .map(calc => {
                                    const product = products.find(p => p.id === calc.products_id);
                                    return {
                                        id: calc.id,
                                        productId: calc.products_id,
                                        productName: product?.name || 'Неизвестный продукт',
                                        quantity: calc.quantity || 0,
                                        unit: units.find(u => u.id === calc.units_id)?.symbol || 'ед.',
                                        price: parseFloat(calc.price || "0"),
                                        totalCost: (calc.quantity || 0) * parseFloat(calc.price || "0")
                                    };
                                })
                            : [];

                        return {
                            ...dish,
                            price: priceValue,
                            cost_dish: parseFloat(dish.cost_dish || "0"),
                            kcal: parseFloat(dish.kcal || "0"),
                            proteins: parseFloat(dish.proteins || "0"),
                            fats: parseFloat(dish.fats || "0"),
                            carbohydrates: parseFloat(dish.carbohydrates || "0"),
                            calculation: dishCalculations,
                            allergens: dishAllergens,
                            modifiers: dishModifiers,
                            dish_modifier_items: dishModifierItems.filter(item => item.dish_id === dish.id),
                            price_history: priceDishes.filter(p => p.dish_id === dish.id),
                            is_active: dish.is_active !== false
                        };
                    });
                const comboDishes: Dish[] = filteredComboMeals
                    .filter(combo => combo.is_active !== false)
                    .map(combo => {
                        const comboPrice = currentComboPrices.find(p => p.combo_meal_id === combo.id);
                        const priceValue = comboPrice ? parseFloat(comboPrice.value) : 0;

                        const dishAllergens = loaded.additional ?
                            dishAllergensItems
                                .filter(item => item.dish_id === combo.id)
                                .map(item => {
                                    const allergen = allergens.find(a => a.id === item.allergens_id);
                                    return allergen ? { ...allergen, comment: item.comment } : null;
                                })
                                .filter(Boolean)
                            : [];

                        const dishModifiers = loaded.additional ?
                            dishModifierItems
                                .filter(item => item.dish_id === combo.id)
                                .map(item => {
                                    const modifier = modifiers.find(m => m.id === item.modifiers_id);
                                    return modifier ? {
                                        ...modifier,
                                        status: item.status,
                                        comment: item.comment
                                    } : null;
                                })
                                .filter(Boolean)
                            : [];
                        const comboItems: ComboItem[] = loaded.additional ? [] : [];
                        if (loaded.additional) {
                            const items = comboMealItems.filter(item => item.combo_meal_id === combo.id);
                            items.forEach(item => {
                                const dish = filteredDishes.find(d => d.id === item.dish_id);
                                if (dish) {
                                    const dishPrice = currentPrices.find(p => p.dish_id === dish.id);
                                    const dishPriceValue = dishPrice ? parseFloat(dishPrice.value) : parseFloat(dish.price || "0");

                                    // ОБНОВЛЯЕМ:
                                    const dishAllergens = dishAllergensItems
                                        .filter(allergenItem => allergenItem.dish_id === dish.id)
                                        .map(allergenItem => {
                                            const allergen = allergens.find(a => a.id === allergenItem.allergens_id);
                                            return allergen ? { ...allergen, comment: allergenItem.comment } : null;
                                        })
                                        .filter(Boolean);
                                    const dishModifiers = dishModifierItems
                                        .filter(modifierItem => modifierItem.dish_id === dish.id)
                                        .map(modifierItem => {
                                            const modifier = modifiers.find(m => m.id === modifierItem.modifiers_id);
                                            return modifier ? {
                                                ...modifier,
                                                status: modifierItem.status,
                                                comment: modifierItem.comment
                                            } : null;
                                        })
                                        .filter(Boolean);
                                    const dishCalculations = loaded.additional ?
                                        calculations
                                            .filter(calc => calc.dish_id === dish.id)
                                            .map(calc => {
                                                const product = products.find(p => p.id === calc.products_id);
                                                return {
                                                    id: calc.id,
                                                    productId: calc.products_id,
                                                    productName: product?.name || 'Неизвестный продукт',
                                                    quantity: calc.quantity || 0,
                                                    unit: units.find(u => u.id === calc.units_id)?.symbol || 'ед.',
                                                    price: parseFloat(calc.price || "0"),
                                                    totalCost: (calc.quantity || 0) * parseFloat(calc.price || "0")
                                                };
                                            })
                                        : [];

                                    // Создаем полное блюдо со всеми данными
                                    const fullDish: Dish = {
                                        ...dish,
                                        id: dish.id,
                                        name: dish.name,
                                        price: dishPriceValue,
                                        weight: dish.weight,
                                        cost_dish: parseFloat(dish.cost_dish || "0"),
                                        is_active: dish.is_active !== false,
                                        kcal: parseFloat(dish.kcal || "0"),
                                        proteins: parseFloat(dish.proteins || "0"),
                                        fats: parseFloat(dish.fats || "0"),
                                        carbohydrates: parseFloat(dish.carbohydrates || "0"),
                                        display_website: dish.display_website,
                                        category_menu_id: dish.category_menu_id,
                                        units_id: dish.units_id,
                                        point_retail_id: dish.point_retail_id,
                                        is_combo: false,
                                        calculation: dishCalculations,
                                        allergens: dishAllergens,
                                        modifiers: dishModifiers,
                                        dish_modifier_items: dishModifierItems.filter(dmi => dmi.dish_id === dish.id),
                                        price_history: priceDishes.filter(p => p.dish_id === dish.id),
                                        metadate: dish.metadate || {}
                                    };

                                    comboItems.push({
                                        dish_id: dish.id,
                                        dish_name: dish.name,
                                        price: dishPriceValue,
                                        quantity: 1,
                                        included: true,
                                        dish: fullDish // Передаем полное блюдо со всеми данными
                                    });
                                }
                            });
                        }

                        return {
                            id: combo.id,
                            name: combo.name,
                            price: priceValue,
                            weight: combo.weight,
                            cost_dish: 0,
                            is_active: combo.is_active !== false,
                            kcal: parseFloat(combo.kcal || "0"),
                            proteins: parseFloat(combo.proteins || "0"),
                            fats: parseFloat(combo.fats || "0"),
                            carbohydrates: parseFloat(combo.carbohydrates || "0"),
                            display_website: combo.display_website,
                            category_menu_id: combo.category_menu_id,
                            calculation: [],
                            metadate: combo.metadate,
                            is_combo: true,
                            combo_items: comboItems,
                            units_id: combo.units_id,
                            point_retail_id: combo.point_retail_id,
                            allergens: dishAllergens,
                            modifiers: dishModifiers,
                            dish_modifier_items: dishModifierItems.filter(item => item.dish_id === combo.id),
                            combo_price_history: priceCombos.filter(p => p.combo_meal_id === combo.id)
                        };
                    });


                const categoryHierarchy = buildCategoryHierarchy(filteredCategories);
                const categoriesWithDishes = distributeDishesToCategories(
                    categoryHierarchy,
                    dishes,
                    comboDishes
                );

                if (selectedCategory) {
                    const selectedCat = categoriesWithDishes.find(cat => cat.id === selectedCategory.id);
                    if (selectedCat) {

                    }
                }

                setCategories(categoriesWithDishes);

                if (categoriesWithDishes.length > 0 && !selectedCategory) {
                    setSelectedCategory(categoriesWithDishes[0]);
                    setOpenCategories(prev => ({ ...prev, [categoriesWithDishes[0].id]: true }));
                }
            }
        };

        updateCategories();

        const interval = setInterval(() => {
            updateCategories();
        }, 1000);

        return () => clearInterval(interval);
    }, [
        filteredCategories,
        filteredDishes,
        filteredComboMeals,
        calculations,
        products,
        units,
        dishAllergensItems,
        allergens,
        dishModifierItems,
        modifiers,
        priceDishes,
        priceCombos,
        comboMealItems,
        loaded.initial,
        loaded.additional,
        selectedCategory?.id // Только id выбранной категории
    ]);


    const handleRefresh = useCallback(() => {
        dispatch(refreshMenuData(selectedSalesPointId));
        setHasLoadedAdditionalData(false);
    }, [dispatch, selectedSalesPointId]);

    const toggleCategory = useCallback((categoryId: number) => {
        setOpenCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    }, []);

    const handleSelectCategory = useCallback((category: NestedCategory) => {
        setSelectedCategory(category);
        setSelectedDish(null);
        setFullPageDish(null);
        setSearchTerm('');
        setDisplayMode('category');
        setSelectedSubcategory(null);
    }, []);

    const updateDishData = useDishDataUpdater();
    const handleOpenFullPageDish = useCallback(async (dish: Dish) => {
        try {
            const updatedDish = await updateDishData(dish);
            setFullPageDish(updatedDish);
        } catch (error) {
            console.error('Ошибка обновления данных блюда:', error);
            setFullPageDish(dish);
        }
    }, [updateDishData]);



    const handleCloseFullPageDish = useCallback(() => {
        setFullPageDish(null);
    }, []);

    const handleSelectDish = useCallback((dish: Dish) => {
        setSelectedDish(dish);
        handleOpenFullPageDish(dish);
    }, [handleOpenFullPageDish]);

    const handleUpdateDish = useCallback(async (dishId: number, updatedData: any) => {
        try {
            await dispatch(updateDish({ dishId, data: updatedData })).unwrap();
        } catch (error) {
            console.error('Ошибка при обновлении блюда:', error);
            throw error;
        }
    }, [dispatch]);

    // const handleAddDish = useCallback(async (newDish: Dish) => {
    //     try {
    //         const uniqueName = `${newDish.name}_${Date.now()}`;
    //         const dishWithUniqueName = {
    //             ...newDish,
    //             name: uniqueName
    //         };
    //
    //         await dispatch(addDish({
    //             dish: dishWithUniqueName,
    //             salesPointId: selectedSalesPointId
    //         })).unwrap();
    //         alert('Блюдо успешно создано!');
    //     } catch (error) {
    //         console.error("Ошибка при добавлении блюда:", error);
    //         alert('Не удалось создать блюдо.');
    //     }
    // }, [dispatch, selectedSalesPointId]);

    const handleAddDish = useCallback(async (newDish: any) => {
        try {
            const dishToSubmit = {
                ...newDish,
                price: newDish.price || (newDish.is_combo ? 0 : 0),
                category_menu_id: newDish.category_menu_id ,
                salesPointId: selectedSalesPointId,

                metadate: {
                    ...newDish.metadate,
                    allergens: newDish.metadate?.allergens || [],
                    modifiers: newDish.metadate?.modifiers || [],
                    calculation: newDish.calculation || []
                }
            };

            const result = await dispatch(addDish({
                dish: dishToSubmit,
                salesPointId: selectedSalesPointId
            })).unwrap();

            // Обновляем данные с сервера
            await dispatch(fetchInitialMenuData(selectedSalesPointId)).unwrap();

            alert(`${newDish.is_combo ? 'Комбо-набор' : 'Блюдо'} успешно добавлено!`);

            setShowAddDish(false);
            setShowAddCombo(false);

            return result;

        } catch (error: any) {
            console.error("Ошибка при добавлении блюда:", error);

            if (typeof error === 'string') {
                alert(error);
            } else if (error.message) {
                alert(`Не удалось добавить блюдо: ${error.message}`);
            } else {
                alert('Не удалось добавить блюдо. Обратитесь к администратору.');
            }

            throw error;
        } finally {

        }
    }, [dispatch, selectedSalesPointId,]);


    const handleDeleteDish = useCallback(async (dishId: number) => {
        if (!confirm('Вы уверены, что хотите деактивировать это блюдо? Оно будет скрыто из меню.')) return;

        try {
            await dispatch(deleteDish({
                dishId,
                salesPointId: selectedSalesPointId
            })).unwrap();

            if (selectedDish && selectedDish.id === dishId) {
                setSelectedDish(null);
                setFullPageDish(null);
            }

            alert('Блюдо успешно деактивировано и скрыто из меню!');
        } catch (error) {
            console.error('Ошибка при деактивации блюда:', error);
            alert(`Не удалось деактивировать блюдо: ${error.message}`);
        }
    }, [dispatch, selectedSalesPointId, selectedDish]);
    const handleAddProductToCalculation = useCallback(async (dishId: number, productId: number, quantity: number, unitId: number) => {
        if (!loaded.additional) {
            alert('Данные для калькуляции еще загружаются. Пожалуйста, подождите.');
            return;
        }
        setIsAddingProduct(true);
        try {
            const product = products.find(p => p.id === productId);
            const unit = units.find(u => u.id === unitId);

            if (!product) {
                throw new Error('Продукт не найден');
            }

            const tempCalculationItem = {
                id: Date.now(),
                productId: productId,
                productName: product.name,
                quantity: quantity,
                unit: unit?.symbol || 'ед.',
                price: parseFloat(product.purchase_price || "0"),
                totalCost: quantity * parseFloat(product.purchase_price || "0")
            };
            if (fullPageDish && fullPageDish.id === dishId) {
                const updatedDish = {
                    ...fullPageDish,
                    calculation: [...(fullPageDish.calculation || []), tempCalculationItem]
                };
                setFullPageDish(updatedDish);
            }

            await dispatch(addCalculation({ dishId, productId, quantity, unitId })).unwrap();

            setTimeout(async () => {
                try {
                    await dispatch(fetchCalculateRefresh()).unwrap();
                } catch (error) {
                    console.warn('Фоновая загрузка расчетов:', error);
                }
            }, 100);

            alert('Продукт успешно добавлен в калькуляцию!');

        } catch (error) {
            console.error("Ошибка при добавлении продукта:", error);
            alert(`Не удалось добавить продукт: ${error.message}`);
            if (fullPageDish && fullPageDish.id === dishId) {
                setFullPageDish(prev => ({
                    ...prev,
                    calculation: prev.calculation.filter(item => !item.id || item.id < Date.now() - 1000)
                }));
            }
        } finally {
            setIsAddingProduct(false);
        }
    }, [dispatch, loaded.additional, products, units, fullPageDish]);


    const handleRemoveProductFromCalculation = useCallback(async (calculationId: number) => {
        if (!confirm('Вы уверены, что хотите удалить этот продукт из калькуляции?')) return;

        try {
            await dispatch(removeCalculation({ calculationId })).unwrap();
            alert('Продукт удален из калькуляции!');
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось удалить продукт из калькуляции');
        }
    }, [dispatch]);

    const handleUpdateCalculation = useCallback(async (calculationId: number, updates: {
        productId?: number;
        quantity?: number;
        unitId?: number;
    }) => {
        try {
            await dispatch(updateCalculation({ calculationId, updates })).unwrap();
        } catch (error) {
            console.error("Ошибка при обновлении расчета:", error);
            throw error;
        }
    }, [dispatch]);

    const handleAddCategory = useCallback(async () => {
        if (!newCategory.name.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const pointRetailId = selectedSalesPoint ? selectedSalesPoint.id : 1;

            const categoryData = {
                name: newCategory.name,
                parent_id: newCategory.parent_id,
                point_retail_id: pointRetailId,
                metadate: null
            };

            const response = await fetch('/categories-menu/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(categoryData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка ${response.status}: ${errorText}`);
            }

            await response.json();
            await dispatch(fetchInitialMenuData(selectedSalesPointId)).unwrap();

            setNewCategory({ name: '', parent_id: null });
            setCategoryDialogOpen(false);
            alert(`Категория "${newCategory.name}" успешно создана!`);

        } catch (error) {
            console.error('Ошибка создания категории:', error);
            alert(`Не удалось создать категорию: ${error.message}`);
        }
    }, [dispatch, newCategory, selectedSalesPoint, selectedSalesPointId]);

    const findAllDishes = useCallback((cats: NestedCategory[]): Dish[] => {
        let dishes: Dish[] = [];
        const collectDishes = (categoryList: NestedCategory[]) => {
            categoryList.forEach(cat => {
                dishes = [...dishes, ...cat.dishes];
                if (cat.children.length > 0) {
                    collectDishes(cat.children);
                }
            });
        };
        collectDishes(cats);
        return dishes;
    }, []);

    const findAllCategories = useCallback((cats: NestedCategory[]): NestedCategory[] => {
        let allCategories: NestedCategory[] = [];
        const collectCategories = (categoryList: NestedCategory[]) => {
            categoryList.forEach(cat => {
                allCategories.push(cat);
                if (cat.children.length > 0) {
                    collectCategories(cat.children);
                }
            });
        };
        collectCategories(cats);
        return allCategories;
    }, []);

    const allDishes = useMemo(() => findAllDishes(categories), [categories, findAllDishes]);
    const totalDishes = allDishes.length;
    const activeDishes = totalDishes;
    const inactiveDishes = 0;
    const avgPrice = useMemo(() =>
            totalDishes > 0 ? allDishes.reduce((acc, dish) => acc + dish.price, 0) / totalDishes : 0,
        [totalDishes, allDishes]
    );

    const allCategories = useMemo(() => findAllCategories(categories), [categories, findAllCategories]);

    const currentDishes = useMemo(() => {
        if (!selectedCategory) return [];

        const getAllDishesFromCategoryAndChildren = (category: NestedCategory): Dish[] => {
            return [
                ...category.dishes,
                ...category.children.flatMap(child => getAllDishesFromCategoryAndChildren(child))
            ];
        };
        let dishes = getAllDishesFromCategoryAndChildren(selectedCategory);
        if (displayMode === 'subcategory' && selectedSubcategory) {
            dishes = dishes.filter(dish => {
                if (dish.metadate?.subcategory) {
                    return dish.metadate.subcategory.toLowerCase() === selectedSubcategory.toLowerCase();
                }
                return false;
            });
        }

        if (searchTerm) {
            dishes = dishes.filter(dish =>
                dish.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return dishes.sort((a, b) => a.name.localeCompare(b.name));
    }, [selectedCategory, searchTerm, displayMode, selectedSubcategory]);

    if (loading.initial && !loaded.initial) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <div className="text-lg text-gray-600">Загрузка меню...</div>
                </div>
            </div>
        );
    }

    if (error && !loaded.initial) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="text-lg text-red-600 mb-2">Ошибка загрузки данных</div>
                    <div className="text-sm text-gray-600 mb-4">{error}</div>
                    <Button onClick={handleRefresh}>Попробовать снова</Button>
                </div>
            </div>
        );
    }

    if (fullPageDish && (!loaded.additional || loading.additional)) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <div className="text-lg text-gray-600">Загрузка деталей блюда...</div>
                </div>
            </div>
        );
    }

    if (fullPageDish) {
        return (
            <FullPageDishView
                dish={fullPageDish}
                onClose={handleCloseFullPageDish}
                onAddProduct={handleAddProductToCalculation}
                onRemoveProduct={handleRemoveProductFromCalculation}
                onUpdateCalculation={handleUpdateCalculation}
                products={products}
                isAddingProduct={isAddingProduct}
                categories={categories}
                onUpdateDish={handleUpdateDish}
                allDishes={allDishes}

                allergens={allergens}
                modifiers={modifiers}
                units={units}
                onDeleteDish={handleDeleteDish}
                getExtendedDishData={getExtendedDishData}
                ComboItemsEditor={ComboItemsEditor}
                AllergensManager={AllergensManager}
                ModifiersManager={ModifiersManager}
                DishCalculation={DishCalculation}
                prepareDishForApi={prepareDishForApi}
                dishAllergensItems={dishAllergensItems}
                dishModifierItems={dishModifierItems}

            />
        );
    }

    if (showAddDish && selectedCategory) {
        return (
            <FullScreenAddDish
                category={selectedCategory}
                onClose={() => setShowAddDish(false)}
                onAddDish={handleAddDish}
                selectedSalesPoint={selectedSalesPoint}
                isCombo={false}
                allDishes={allDishes}
                allergens={allergens}
                modifiers={modifiers}
                formatDateForAPI={(date: Date) => date.toISOString()}
                getExtendedDishData={getExtendedDishData}
                prepareDishForApi={prepareDishForApi}
            />
        );
    }

    if (showAddCombo && selectedCategory) {
        return (
            <FullScreenAddDish
                category={selectedCategory}
                onClose={() => setShowAddCombo(false)}
                onAddDish={handleAddDish}
                selectedSalesPoint={selectedSalesPoint}
                isCombo={true}
                allDishes={allDishes}
                allergens={allergens}
                modifiers={modifiers}
                formatDateForAPI={(date: Date) => date.toISOString()}
                getExtendedDishData={getExtendedDishData}
                prepareDishForApi={prepareDishForApi}
            />
        );
    }

    return (
        <div className="space-y-6">
            <Stats
                totalDishes={totalDishes}
                activeDishes={activeDishes}
                inactiveDishes={inactiveDishes}
                avgPrice={avgPrice}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                selectedSalesPoint={selectedSalesPoint}
                categories={categories}
            />

            <Card  style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader >
                    <div className="flex justify-between items-center ">
                        <CardTitle style={{color:'var(--custom-text)'}} className='text-white'>
                            Управление меню
                            {selectedSalesPoint && (
                                <span className="text-sm font-normal text-muted-foreground ml-2">
                                    - {selectedSalesPoint.name}
                                </span>
                            )}
                        </CardTitle>
                    </div>
                </CardHeader>
            </Card>

            <div className="flex gap-6">
                <div className="w-80">
                    <Card  style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }} >
                        <CardHeader>
                            <CardTitle style={{color:'var(--custom-text)'}} className='text-white'>Категории</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start bg-green-600 text-white cursor-pointer">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Добавить категорию
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent >
                                        <DialogHeader>
                                            <DialogTitle>Новая категория</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4" >
                                            <div>
                                                <label className="text-sm font-medium">Родительская категория</label>
                                                <select
                                                    className="w-full p-2 border rounded-md"
                                                    value={newCategory.parent_id || ''}
                                                    onChange={(e) => setNewCategory({
                                                        ...newCategory,
                                                        parent_id: e.target.value ? parseInt(e.target.value) : null
                                                    })}
                                                >
                                                    <option value="">Корневая категория</option>
                                                    {allCategories
                                                        .filter(cat => cat.parent_id === null)
                                                        .map(cat => (
                                                            <option key={cat.id} value={cat.id}>
                                                                {cat.name}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                                {!newCategory.parent_id && (
                                                    <div className='flex items-center justify-center gap-3'>
                                                     <select  className="w-full p-2  border rounded-md">
                                                         <option value=''>Цех</option>
                                                         {kitchen.map(item => (
                                                             <option key={item.id} value={item.id}>
                                                                 {item.name}
                                                             </option>
                                                         ) )}
                                                     </select>
                                                        <Button className='bg-green-500 p-2 text-white  '>+</Button>
                                                     </div>
                                                )}

                                            </div>
                                            <Input
                                                placeholder="Название категория"
                                                value={newCategory.name}
                                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                            />
                                            <Button onClick={handleAddCategory} className="w-full">
                                                Создать категорию
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <div className="border rounded-lg max-h-96 overflow-y-auto">
                                    {categories.map((category) => (
                                        <NestedCategoryTree
                                            key={category.id}
                                            category={category}
                                            selectedCategoryId={selectedCategory?.id || null}
                                            onSelectCategory={handleSelectCategory}
                                            openCategories={openCategories}
                                            onToggleCategory={toggleCategory}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex-1 flex flex-col">
                    <Card className="flex-1"  style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader>
                            <div  className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-white" style={{color:'var(--custom-text)'}}>
                                        {selectedCategory ? selectedCategory.name : 'Выберите категорию'}
                                    </CardTitle>
                                    <p className="text-sm text-gray-500">
                                        {currentDishes.length} блюд
                                        {usingCache && <span className="text-blue-600 ml-2">(из кеша)</span>}
                                    </p>
                                </div>
                                <div className="flex gap-2 text-white" style={{color:'var(--custom-text)'}}>
                                    <div className="flex border rounded-md">
                                        <Button
                                            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('table')}
                                            className="rounded-r-none"
                                        >
                                            <List className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                            className="rounded-l-none"
                                        >
                                            <LayoutGrid className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            className=" hover:bg-orange-700"
                                            style={{backgroundImage:'linear-gradient(135deg, #0d9488, #0891b2)'}}
                                            onClick={() => {
                                                if (!selectedCategory) {
                                                    alert("Сначала выберите категорию");
                                                    return;
                                                }
                                                handleOpenAddDishForm()
                                                setShowAddDish(true);
                                            }}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Новое блюдо
                                        </Button>
                                        <Button
                                            className="bg-orange-600 hover:bg-orange-700"
                                            style={{backgroundImage:'linear-gradient(135deg, #0d9488, #0891b2)'}}
                                            onClick={() => {
                                                if (!selectedCategory) {
                                                    alert("Сначала выберите категорию");
                                                    return;
                                                }

                                                setShowAddCombo(true);
                                            }}
                                        >
                                            <Layers className="h-4 w-4 mr-2" />
                                            Комбо блюдо
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="mb-4" >
                                <div className="relative">
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        style={{
                                            borderRadius: '20px',
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                        placeholder="Поиск блюд..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {!selectedCategory ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    Выберите категорию для просмотра блюд
                                </div>
                            ) : currentDishes.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    Нет блюд в этой категории
                                </div>
                            ) : viewMode === 'table' ? (
                                <div className="overflow-x-auto" >
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead style={{color:'rgb(148, 163, 184)'}} >Название</TableHead>
                                                <TableHead style={{color:'rgb(148, 163, 184)'}}>Цена</TableHead>
                                                <TableHead style={{color:'rgb(148, 163, 184)'}}>Вес</TableHead>
                                                <TableHead style={{color:'rgb(148, 163, 184)'}}>Калории</TableHead>
                                                <TableHead style={{color:'rgb(148, 163, 184)'}}>Тип</TableHead>
                                                <TableHead style={{color:'rgb(148, 163, 184)'}}>Статус</TableHead>
                                                <TableHead style={{color:'rgb(148, 163, 184)'}}>На сайте</TableHead>
                                                <TableHead style={{color:'rgb(148, 163, 184)'}}>Действия</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className='text-white'>
                                            {currentDishes.map((dish) => (
                                                <TableRow
                                                    key={dish.id}
                                                    className={`cursor-pointer hover:bg-green-700 ${
                                                        selectedDish?.id === dish.id ? 'bg-blue-500 ' : ''
                                                    }`}
                                                    onClick={() => handleSelectDish(dish)}
                                                >
                                                    <TableCell>
                                                        <div style={{color:'var(--custom-text)'}} className="flex items-center gap-2">
                                                            {dish.name}
                                                            {dish.is_combo && (
                                                                <Badge className="bg-purple-100 text-purple-800">
                                                                    <Layers className="h-3 w-3 mr-1" />
                                                                    Комбо
                                                                </Badge>
                                                            )}
                                                            {dish.display_website &&
                                                                <Badge variant="secondary">На сайте</Badge>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell style={{color:'var(--custom-text)'}}>₽{dish.price.toFixed(2)}</TableCell>
                                                    <TableCell style={{color:'var(--custom-text)'}}>
                                                        {dish.weight} {units.find(u => u.id === dish.units_id)?.symbol || 'ед.'}
                                                    </TableCell>
                                                    <TableCell style={{color:'var(--custom-text)'}}>{dish.kcal} ккал</TableCell>
                                                    <TableCell>
                                                        {dish.is_combo ? (
                                                            <Badge variant="outline"
                                                                   className="border-purple text-purple-800">
                                                                Комбо-набор
                                                            </Badge>
                                                        ) : (
                                                            <Badge className='text-blue-600' variant="outline">Обычное</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="bg-green-600 text-white">
                                                            Активно
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell >
                                                        {dish.display_website ? (
                                                            <Badge className='text-grey/10 bg-green-600' variant="secondary">Да</Badge>
                                                        ) : (
                                                            <Badge className='text-grey/10 bg-red-500' variant="outline">Нет</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex space-x-2"
                                                             onClick={(e) => e.stopPropagation()}>
                                                            <Button
                                                                className='hover:bg-red-700 hover:text-white'
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteDish(dish.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {currentDishes.map((dish) => (
                                        <Card
                                            key={dish.id}
                                            className={`cursor-pointer hover:shadow-lg transition-shadow ${
                                                selectedDish?.id === dish.id ? 'ring-2 ring-blue-500' : ''
                                            }`}
                                            onClick={() => handleSelectDish(dish)}
                                            style={{
                                                borderRadius: '20px',
                                                border: 'var(--custom-border-primary)',
                                                background: 'var(--custom-bg-primaryLine)',
                                                color: 'var(--custom-text)',
                                            }}
                                        >
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-start">
                                                    <CardTitle style={{color:'var(--custom-text)'}} className="text-base text-white">{dish.name}</CardTitle>
                                                    <div className="flex gap-1">
                                                        {dish.is_combo && (
                                                            <Badge className="bg-purple-100 text-purple-800">
                                                                <Layers className="h-3 w-3 mr-1" />
                                                            </Badge>
                                                        )}
                                                        {dish.display_website &&
                                                            <Badge variant="secondary">САЙТ</Badge>}
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-2xl font-bold text-orange-600">₽{dish.price.toFixed(2)}</p>
                                                    <div className="text-right text-sm text-gray-500">
                                                        <p>{dish.weight} {units.find(u => u.id === dish.units_id)?.symbol || 'ед.'}</p>
                                                        <p>{dish.kcal} ккал</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}