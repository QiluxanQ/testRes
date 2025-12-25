import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../../store/store';
import {
    updateDish,
    addCalculation,
    removeCalculation,
    updateCalculation,
    updateDishLocally,
    updateComboLocally, fetcAlergenAndModifaiRefresh, fetchDishesAndCombosRefreshOptimized
} from '../../../../slice/menuSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Textarea } from '../../../ui/textarea';
import { Switch } from '../../../ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import {
    ArrowLeft,
    Calculator,
    Layers,
    AlertCircle,
    Package,
    Utensils,
    MapPin,
    Clock,
    DollarSign,
    Percent,
    X,
    Plus,
    Edit,
    Trash2,
    Info,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Dish, ApiProduct, ApiAllergen, ApiModifier, ApiDishModifierItem, ApiDishAllergenItem } from "../../../../types/menu";

interface FullPageDishViewProps {
    dish: any;
    onClose: () => void;
}

const ComboAllergensDisplay: React.FC<{
    comboItems: Array<{ dish_id: number; dish_name: string; dish?: any }>;
    allAllergens: ApiAllergen[];
}> = ({ comboItems, allAllergens }) => {
    const [expandedDishes, setExpandedDishes] = useState<number[]>([]);

    const allComboAllergens = useMemo(() => {
        const allergens = new Map<number, ApiAllergen>();

        comboItems.forEach(item => {
            if (item.dish?.allergens) {
                item.dish.allergens.forEach((allergen: any) => {
                    const fullAllergen = allAllergens.find(a => a.id === allergen.id);
                    if (fullAllergen && !allergens.has(fullAllergen.id)) {
                        allergens.set(fullAllergen.id, fullAllergen);
                    }
                });
            }
        });

        return Array.from(allergens.values());
    }, [comboItems, allAllergens]);

    const allergensByDish = useMemo(() => {
        return comboItems.map(item => ({
            dishId: item.dish_id,
            dishName: item.dish_name,
            allergens: item.dish?.allergens?.map((allergen: any) => {
                const fullAllergen = allAllergens.find(a => a.id === allergen.id);
                return fullAllergen || allergen;
            }) || []
        }));
    }, [comboItems, allAllergens]);

    const toggleDishExpansion = (dishId: number) => {
        setExpandedDishes(prev =>
            prev.includes(dishId)
                ? prev.filter(id => id !== dishId)
                : [...prev, dishId]
        );
    };

    if (comboItems.length === 0 || allComboAllergens.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500">
                <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>В комбо нет аллергенов</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Сводная информация */}
            <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-red-700">Аллергены в комбо</h4>
                            <p className="text-sm text-red-600">
                                Автоматически собраны из всех блюд комбо
                            </p>
                        </div>
                        <Badge variant="outline" className="bg-white text-red-700">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {allComboAllergens.length} аллергенов
                        </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {allComboAllergens.map(allergen => (
                            <Badge
                                key={allergen.id}
                                variant="outline"
                                className="bg-white text-red-700 border-red-300"
                                title={allergen.description || ''}
                            >
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {allergen.name}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Детали по блюдам */}
            <Card style={{
                borderRadius: '20px',
                border: '1px solid #334155',
                backgroundImage: 'linear-gradient(185deg, #1e293b 100%, #0f172a 100%)'}}>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-white">
                        Аллергены по блюдам
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {allergensByDish.map((dish, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden">
                            <div
                                className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                                onClick={() => toggleDishExpansion(dish.dishId)}
                                style={{
                                    borderRadius: '5px',
                                    border: '1px solid #334155',
                                    background: '#0f172a',
                                    color:'white'
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <h5 className="font-medium">{dish.dishName}</h5>
                                    {dish.allergens.length > 0 && (
                                        <Badge variant="outline" size="sm" className="bg-red-50 ">
                                            {dish.allergens.length} ал.
                                        </Badge>
                                    )}
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    {expandedDishes.includes(dish.dishId) ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            {expandedDishes.includes(dish.dishId) && dish.allergens.length > 0 && (
                                <div className="p-3 bg-red-50 border-t">
                                    <div className="space-y-2">
                                        {dish.allergens.map((allergen: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded">
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
                                </div>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

const ComboModifiersDisplay: React.FC<{
    comboItems: Array<{ dish_id: number; dish_name: string; dish?: any }>;
    allModifiers: ApiModifier[];
}> = ({ comboItems, allModifiers }) => {
    const [expandedDishes, setExpandedDishes] = useState<number[]>([]);
    const allComboModifiers = useMemo(() => {
        const modifiers = new Map<number, ApiModifier>();

        comboItems.forEach(item => {
            if (item.dish?.modifiers) {
                item.dish.modifiers.forEach((modifier: any) => {
                    const fullModifier = allModifiers.find(m => m.id === modifier.id);
                    if (fullModifier && !modifiers.has(fullModifier.id)) {
                        modifiers.set(fullModifier.id, fullModifier);
                    }
                });
            }
        });

        return Array.from(modifiers.values());
    }, [comboItems, allModifiers]);

    // Группируем модификаторы по блюдам
    const modifiersByDish = useMemo(() => {
        return comboItems.map(item => ({
            dishId: item.dish_id,
            dishName: item.dish_name,
            modifiers: item.dish?.modifiers?.map((modifier: any) => {
                const fullModifier = allModifiers.find(m => m.id === modifier.id);
                return {
                    ...(fullModifier || modifier),
                    status: modifier.status,
                    comment: modifier.comment
                };
            }) || []
        }));
    }, [comboItems, allModifiers]);

    const toggleDishExpansion = (dishId: number) => {
        setExpandedDishes(prev =>
            prev.includes(dishId)
                ? prev.filter(id => id !== dishId)
                : [...prev, dishId]
        );
    };

    if (comboItems.length === 0 || allComboModifiers.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500">
                <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>В комбо нет модификаторов</p>
            </div>
        );
    }

    return (
        <div className="space-y-4" >

            <Card className="bg-blue-50 border-blue-200" >
                <CardContent className="pt-4" >
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-blue-700">Модификаторы в комбо</h4>
                            <p className="text-sm text-blue-600">
                                Автоматически собраны из всех блюд комбо
                            </p>
                        </div>
                        <Badge variant="outline" className="bg-white text-blue-700">
                            <Package className="h-3 w-3 mr-1" />
                            {allComboModifiers.length} модификаторов
                        </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {allComboModifiers.map(modifier => (
                            <Badge
                                key={modifier.id}
                                variant="outline"
                                className="bg-white text-blue-700 border-blue-300"
                                title={`${modifier.name} - ${parseFloat(modifier.price).toFixed(2)}₽`}
                            >
                                <Package className="h-3 w-3 mr-1" />
                                {modifier.name}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Детали по блюдам */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-700">
                        Модификаторы по блюдам
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {modifiersByDish.map((dish, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden">
                            <div
                                className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                                onClick={() => toggleDishExpansion(dish.dishId)}
                            >
                                <div className="flex items-center gap-2">
                                    <h5 className="font-medium">{dish.dishName}</h5>
                                    {dish.modifiers.length > 0 && (
                                        <Badge variant="outline" size="sm" className="bg-blue-50 text-blue-700">
                                            {dish.modifiers.length} мод.
                                        </Badge>
                                    )}
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    {expandedDishes.includes(dish.dishId) ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            {expandedDishes.includes(dish.dishId) && dish.modifiers.length > 0 && (
                                <div className="p-3 bg-blue-50 border-t">
                                    <div className="space-y-2">
                                        {dish.modifiers.map((modifier: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-white rounded">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-blue-600" />
                                                    <div>
                                                        <p className="font-medium text-sm text-blue-700">
                                                            {modifier.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                                            <span>{parseFloat(modifier.price).toFixed(2)}₽</span>
                                                            {modifier.status && (
                                                                <Badge
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className={
                                                                        modifier.status === 'required' ? 'bg-red-100 text-red-700 border-red-300' :
                                                                            modifier.status === 'unavailable' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                                                                                'bg-green-100 text-green-700 border-green-300'
                                                                    }
                                                                >
                                                                    {modifier.status === 'required' ? 'Обязателен' :
                                                                        modifier.status === 'unavailable' ? 'Недоступен' : 'Доступен'}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {modifier.comment && (
                                                    <div className="text-xs text-gray-500">
                                                        {modifier.comment}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

const FullPageDishView: React.FC<{
    dish: Dish;
    onClose: () => void;
    onAddProduct: (dishId: number, productId: number, quantity: number, unitId: number) => void;
    onRemoveProduct: (calculationId: number) => void;
    onUpdateProduct: (calculationId: number, updates: {
        productId?: number;
        quantity?: number;
        unitId?: number;
    }) => void;
    products: ApiProduct[];
    isAddingProduct: boolean;
    categories: NestedCategory[];
    onUpdateDish: (dishId: number, updatedData: any) => Promise<ApiDish>;
    allDishes: Dish[];
    allergens: ApiAllergen[];
    modifiers: ApiModifier[];
    dishModifierItems: ApiDishModifierItem[];
    setDishModifierItems: React.Dispatch<React.SetStateAction<ApiDishModifierItem[]>>;
    getExtendedDishData: (dish: any) => any;
    ComboItemsEditor: React.FC<any>;
    AllergensManager: React.FC<any>;
    ModifiersManager: React.FC<any>;
    DishCalculation: React.FC<any>;
    prepareDishForApi: (dishData: any, isCombo: boolean) => any;
    dishAllergensItems: ApiDishAllergenItem[];
    onAddCalculation?: (dishId: number, productId: number, quantity: number, unitId: number) => void;
    setCalculations?: React.Dispatch<React.SetStateAction<any[]>>;
    onUpdateCalculation?: (updatedCalculation: any) => void;
}> = React.memo(({
                     onUpdateCalculation,
                     onAddCalculation,
                     onRemoveCalculation,
                     setCalculations,
                     dish,
                     onClose,
                     onAddProduct,
                     onRemoveProduct,
                     onUpdateProduct,
                     products,
                     isAddingProduct,
                     categories,
                     onUpdateDish,
                     allDishes,
                     allergens,
                     modifiers,
                     dishModifierItems,
                     setDishModifierItems,
                     getExtendedDishData,
                     ComboItemsEditor,
                     AllergensManager,
                     ModifiersManager,
                     DishCalculation,
                     prepareDishForApi,
                     dishAllergensItems,

                 }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [units, setUnits] = useState<any[]>([]);
    const [unitsLoading, setUnitsLoading] = useState(true);
    const dispatch = useDispatch();
    const kitchenStations = useMemo(() =>
        ['Основная кухня', 'Холодный цех', 'Гриль', 'Пицца', 'Суши бар'], []
    );


    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/units/?skip=0&limit=100', {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const unitsData = await response.json();
                    setUnits(unitsData);
                }
            } catch (error) {
                console.error('Ошибка загрузки единиц измерения:', error);
            } finally {
                setUnitsLoading(false);
            }
        };

        fetchUnits();
    }, []);

    const [dishData, setDishData] = useState(() => {
        const extendedData = getExtendedDishData(dish);
        const totalCost = dish.calculation?.reduce((sum, item) => sum + item.totalCost, 0) || 0;
        const profitMargin = dish.price > 0 ? ((dish.price - totalCost) / dish.price) * 100 : 0;

        const comboItems = dish.combo_items || [];
        let comboPrice = dish.price;

        if (dish.is_combo && comboItems.length > 0) {
            comboPrice = comboItems.reduce((sum, item) => {
                return sum + (item.price * item.quantity * (item.included ? 0.8 : 1));
            }, 0);
        }

        const dishAllergens = dish.allergens || [];
        const dishModifiers = dish.modifiers || [];

        const ingredients = dish.is_combo ? [] : dish.calculation?.map(calc => {
            const unit = units.find(u => u.symbol === calc.unit);
            return {
                id: calc.id,
                productId: calc.productId,
                productName: calc.productName,
                quantity: calc.quantity,
                unit: calc.unit,
                unitId: unit?.id || 1,
                costPerUnit: calc.price,
                totalCost: calc.totalCost
            };
        }) || [];

        return {
            id: dish.id,
            name: extendedData.name,
            price: comboPrice,
            weight: extendedData.weight || "0",
            units_id: extendedData.units_id || 1,
            description: extendedData.description,
            category: categories.find(cat => cat.id === dish.category_menu_id)?.name || '',
            subcategory: extendedData.subcategory,
            kitchenStation: extendedData.kitchenStation,
            cookTime: extendedData.cookTime,
            active: extendedData.is_active,
            seasonal: extendedData.seasonal,
            popular: extendedData.popular,
            combo_menu: extendedData.metadate?.combo_menu || false,
            display_website: extendedData.display_website,
            is_combo: extendedData.is_combo || dish.is_combo || false,
            combo_items: comboItems,
            nutritionPer100g: {
                calories: parseFloat(extendedData.kcal) || 0,
                protein: parseFloat(extendedData.proteins) || 0,
                fat: parseFloat(extendedData.fats) || 0,
                carbs: parseFloat(extendedData.carbohydrates) || 0
            },
            allergens: dishAllergens,
            modifiers: dishModifiers,
            technicalCard: {
                portionWeight: extendedData.portionWeight || parseFloat(extendedData.weight) || 0,
                totalCost: totalCost,
                profitMargin: profitMargin,
                markup: extendedData.markup || (totalCost > 0 ? Math.round((dish.price / totalCost - 1) * 100) : 0),
                ingredients: ingredients,
                cookingSteps: extendedData.cookingSteps || [
                    'Подготовить все ингредиенты',
                    'Смешать основные компоненты',
                    'Приготовить согласно рецепту',
                    'Подать в горячем виде'
                ]
            }
        };
    });


    const handleUpdateProduct = useCallback(async (calculationId: number, updates: {
        productId?: number;
        quantity?: number;
        unitId?: number;
        price?: number;
    }) => {
        const token = localStorage.getItem('token');

        try {
            const calculationResponse = await fetch(`/calculation-cards/${calculationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!calculationResponse.ok) throw new Error('Не удалось получить данные калькуляции');
            const currentCalculation = await calculationResponse.json();

            const updatedData = {
                ...currentCalculation,
                products_id: updates.productId !== undefined ? updates.productId : currentCalculation.products_id,
                quantity: updates.quantity !== undefined ? updates.quantity : currentCalculation.quantity,
                units_id: updates.unitId !== undefined ? updates.unitId : currentCalculation.units_id,
                price: updates.price !== undefined ? updates.price.toString() : currentCalculation.price
            };

            const updateResponse = await fetch(`/calculation-cards/${calculationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                throw new Error(`Ошибка при обновлении: ${errorText}`);
            }

            const updatedCalculation = await updateResponse.json();
            alert('Продукт успешно обновлен!');

            const updatedIngredients = dishData.technicalCard.ingredients.map(item => {
                if (item.id === calculationId) {
                    const unitSymbol = units.find(u => u.id === (updates.unitId || item.unitId))?.symbol || item.unit;
                    return {
                        ...item,
                        quantity: updates.quantity !== undefined ? updates.quantity : item.quantity,
                        unit: unitSymbol,
                        unitId: updates.unitId !== undefined ? updates.unitId : item.unitId,
                        costPerUnit: updates.price !== undefined ? updates.price : item.costPerUnit,
                        totalCost: (updates.quantity || item.quantity) * (updates.price || item.costPerUnit)
                    };
                }
                return item;
            });

            setDishData(prev => ({
                ...prev,
                technicalCard: {
                    ...prev.technicalCard,
                    ingredients: updatedIngredients,
                    totalCost: updatedIngredients.reduce((sum, item) => sum + item.totalCost, 0)
                }
            }));

            if (onUpdateCalculation) {
                onUpdateCalculation(updatedCalculation);
            }

        } catch (error) {
            console.error('Ошибка при обновлении продукта:', error);
            alert(`Не удалось обновить продукт: ${error.message}`);
        }
    }, [dishData.technicalCard.ingredients, units, onUpdateCalculation]);

    const handleSaveChanges = useCallback(async () => {
        setIsSaving(true);
        try {
            let finalPrice = dishData.price;

            if (dishData.is_combo && dishData.combo_items && dishData.combo_items.length > 0) {
                finalPrice = dishData.combo_items.reduce((sum, item) => {
                    return sum + (item.price * item.quantity * (item.included ? 0.8 : 1));
                }, 0);
            }

            const weightValue = dishData.weight?.trim() === '' ? "0" : dishData.weight || "0";

            const updateData = prepareDishForApi({
                name: dishData.name,
                price: finalPrice.toString(), // Передаем цену как строку
                weight: weightValue,
                units_id: dishData.units_id,
                is_active: dishData.active,
                is_combo: dishData.is_combo,
                combo_menu: dishData.combo_menu,
                combo_items: dishData.combo_items,
                kcal: dishData.nutritionPer100g.calories.toString(),
                proteins: dishData.nutritionPer100g.protein.toString(),
                fats: dishData.nutritionPer100g.fat.toString(),
                carbohydrates: dishData.nutritionPer100g.carbs.toString(),
                display_website: dishData.display_website,
                subcategory: dishData.subcategory,
                kitchenStation: dishData.kitchenStation,
                cookTime: dishData.cookTime,
                description: dishData.description,
                seasonal: dishData.seasonal,
                popular: dishData.popular,
                allergens: dishData.allergens,
                cookingSteps: dishData.technicalCard.cookingSteps,
                portionWeight: dishData.technicalCard.portionWeight,
                markup: dishData.technicalCard.markup,
                modifiers: dishData.modifiers
            }, dishData.is_combo);

            await onUpdateDish(dish.id, updateData);
            alert('Изменения успешно сохранены!');

        } catch (error) {
            console.error('Ошибка при сохранении:', error);
            alert(`Не удалось сохранить изменения: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    }, [dishData, dish.id, onUpdateDish]);

    const handleUpdateAllergens = useCallback(async (allergenIds: number[]) => {
        setIsSaving(true);
        const token = localStorage.getItem('token');

        try {
            const currentResponse = await fetch(`/dish-allergens-items/?dish_id=${dish.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            let currentItems = [];
            if (currentResponse.ok) {
                currentItems = await currentResponse.json();
            }
            const currentAllergenIds = currentItems.map((item: any) => item.allergens_id);
            const allergensToRemove = currentItems.filter((item: any) =>
                !allergenIds.includes(item.allergens_id)
            );
            const allergensToAdd = allergenIds.filter(id =>
                !currentAllergenIds.includes(id)
            );
            for (const item of allergensToRemove) {
                await fetch(`/dish-allergens-items/${item.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
            for (const allergenId of allergensToAdd) {
                const exists = currentItems.some((item: any) =>
                    item.allergens_id === allergenId
                );
                if (!exists) {
                    const allergenData = {
                        dish_id: dish.id,
                        allergens_id: allergenId,
                        comment: null,
                        metadate: null
                    };

                    await fetch('/dish-allergens-items/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(allergenData)
                    });
                }
            }

            const updatedAllergens = allergens
                .filter(a => allergenIds.includes(a.id))
                .map(allergen => ({
                    ...allergen,
                    comment: currentItems.find((item: any) =>
                        item.allergens_id === allergen.id
                    )?.comment || null
                }));

            setDishData(prev => ({
                ...prev,
                allergens: updatedAllergens
            }));

            alert('Аллергены успешно обновлены!');

            dispatch({
                type: 'menu/refreshDishAllergens',
                payload: { dishId: dish.id, allergens: updatedAllergens }
            });

        } catch (error) {
            console.error('Ошибка при обновлении аллергенов:', error);
            alert('Не удалось обновить аллергены');
        } finally {
            setIsSaving(false);
        }
    }, [dish.id, allergens, dispatch]);

    const handleUpdateModifiers = useCallback(async (modifierItems: {
        modifiers_id: number;
        status: string;
        comment: string
    }[]) => {
        setIsSaving(true);
        const token = localStorage.getItem('token');

        try {
            const currentResponse = await fetch(`/dish-modifier-items/?dish_id=${dish.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const currentItems = currentResponse.ok ? await currentResponse.json() : [];

            const currentModifierIds = currentItems.map((item: any) => item.modifiers_id);
            const newModifierIds = modifierItems.map(item => item.modifiers_id);

            const modifiersToRemove = currentItems.filter((item: any) =>
                !newModifierIds.includes(item.modifiers_id)
            );

            const modifiersToAddOrUpdate = modifierItems.filter(item =>
                !currentModifierIds.includes(item.modifiers_id)
            );
            for (const item of modifiersToRemove) {
                await fetch(`/dish-modifier-items/${item.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
            for (const item of modifiersToAddOrUpdate) {
                const modifierData = {
                    dish_id: dish.id,
                    modifiers_id: item.modifiers_id,
                    status: item.status,
                    comment: item.comment || null,
                    metadate: null
                };

                await fetch('/dish-modifier-items/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(modifierData)
                });
            }

            const modifiersToUpdate = modifierItems.filter(item =>
                currentModifierIds.includes(item.modifiers_id)
            );

            for (const item of modifiersToUpdate) {
                const existingItem = currentItems.find((ci: any) =>
                    ci.modifiers_id === item.modifiers_id
                );

                if (existingItem && (
                    existingItem.status !== item.status ||
                    existingItem.comment !== item.comment
                )) {
                    await fetch(`/dish-modifier-items/${existingItem.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            ...existingItem,
                            status: item.status,
                            comment: item.comment || null
                        })
                    });
                }
            }

            const updatedModifiers = modifierItems.map(item => {
                const modifier = modifiers.find(m => m.id === item.modifiers_id);
                return modifier ? {
                    ...modifier,
                    status: item.status,
                    comment: item.comment
                } : null;
            }).filter(Boolean) as (ApiModifier & { status: string; comment: string })[];

            setDishData(prev => ({
                ...prev,
                modifiers: updatedModifiers.map(m => ({
                    id: m.id,
                    name: m.name,
                    type: m.status === 'required' ? 'required' as const : 'optional' as const,
                    options: [m.name],
                    price: parseFloat(m.price)
                }))
            }));

            alert('Модификаторы успешно обновлены!');

            const freshResponse = await fetch(`/dish-modifier-items/?dish_id=${dish.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (freshResponse.ok) {
                const freshModifiers = await freshResponse.json();
                const updatedItems = dishModifierItems.filter(dmi => dmi.dish_id !== dish.id);
                setDishModifierItems([...updatedItems, ...freshModifiers]);
            }

        } catch (error) {
            console.error('Ошибка при обновлении модификаторов:', error);
            alert('Не удалось обновить модификаторы');
        } finally {
            setIsSaving(false);
        }
    }, [dish.id, modifiers, dishModifierItems, setDishModifierItems]);

    const handleUpdateComboItems = useCallback(async (updatedItems: any[]) => {
        try {
            setIsSaving(true);
            const comboPrice = updatedItems.reduce((sum, item) => {
                return sum + (item.price * item.quantity * (item.included ? 0.8 : 1));
            }, 0);


            const token = localStorage.getItem('token');

            const checkComboResponse = await fetch(`/combo-meals/${dish.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!checkComboResponse.ok) {
                console.error(' Комбо не найдено !');
                alert('Комбо не найдено ');
                return;
            }
            const existingCombo = await checkComboResponse.json();
            const updateComboData = {
                ...existingCombo,
                price: comboPrice.toString(),
                metadate: {
                    ...(existingCombo.metadate || {}),
                    combo_items: updatedItems.map(item => ({
                        dish_id: item.dish_id,
                        dish_name: item.dish_name,
                        quantity: item.quantity,
                        included: item.included
                    }))
                }
            };

            const updateComboResponse = await fetch(`/combo-meals/${dish.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateComboData)
            });

            if (!updateComboResponse.ok) {
                const errorText = await updateComboResponse.text();
                console.error(' Ошибка обновления комбо:', errorText);
                throw new Error(`Ошибка обновления комбо: ${errorText}`);
            }
            const updatedCombo = await updateComboResponse.json();
            let createdCount = 0;

            for (const item of updatedItems) {
                try {
                    const comboItemData = {
                        combo_meal_id: dish.id,
                        dish_id: item.dish_id,
                        weight: "0",
                        metadate: null
                    };
                    const createResponse = await fetch('/combo-meal-items/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(comboItemData)
                    });

                    if (createResponse.ok) {
                        createdCount++;
                        console.log(`✅ Связь создана: ${item.dish_id}`);
                    } else {
                        const errorText = await createResponse.text();
                        console.error('❌ Ошибка создания связи:', errorText);
                    }
                } catch (error) {
                    console.error('❌ Ошибка при создании связи:', error);
                }
            }

            console.log(`✅ Создано связей: ${createdCount}`);

            // 5. Проверяем, что все сохранилось
            console.log('🔄 Проверяем сохранение...');
            const verifyResponse = await fetch(`/combo-meal-items/?combo_meal_id=${dish.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (verifyResponse.ok) {
                const savedItems = await verifyResponse.json();
                console.log('✅ Сохраненные связи на сервере:', savedItems);

                if (savedItems.length === updatedItems.length) {
                    console.log(' Все связи успешно сохранены!');
                } else {
                    console.warn(`Не все связи сохранены. Ожидалось: ${updatedItems.length}, получено: ${savedItems.length}`);
                }
            }

            setDishData(prev => ({
                ...prev,
                combo_items: updatedItems,
                price: comboPrice
            }));

            dispatch(updateComboLocally({
                comboId: dish.id,
                data: {
                    combo_items: updatedItems,
                    price: comboPrice
                }
            }));

            await dispatch(fetchDishesAndCombosRefreshOptimized()).unwrap();

            alert('Состав комбо успешно сохранен!');

        } catch (error) {
            console.error(' Критическая ошибка:', error);
            alert(`Не удалось сохранить состав комбо`);
        } finally {
            setIsSaving(false);
        }
    }, [dish.id, dispatch]);

    const handleBackToList = useCallback(() => {
        onClose();
    }, [onClose]);

    return (
        <div className="space-y-6">
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-primaryLine)',
                color: 'var(--custom-text)',
            }}>
                <CardContent className="pt-6">
                    <Button variant="outline" onClick={handleBackToList}>
                        <ArrowLeft className="h-4 w-4 mr-2"/>
                        Назад к списку
                    </Button>
                </CardContent>
            </Card>

            <Card  style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
            }}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle style={{color:'var(--custom-text)'}} className="text-2xl text-white">{dishData.name}</CardTitle>
                            {dishData.is_combo && (
                                <Badge className="bg-purple-100 text-purple-800 mt-2">
                                    <Layers className="h-3 w-3 mr-1"/>
                                    Комбо-набор
                                </Badge>
                            )}
                            <p className="text-muted-foreground mt-2">{dishData.description}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl text-orange-600">₽{dishData.price}</div>
                            <div className="text-sm text-muted-foreground">цена</div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-6"  style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-secondaryLineCard)',
                    color: 'var(--custom-text)',
                }}>
                    <TabsTrigger  value="general">Общее</TabsTrigger>
                    <TabsTrigger value="combo" disabled={!dishData.is_combo}>
                        <Layers className="h-4 w-4 mr-2"/>
                        Комбо
                    </TabsTrigger>
                    <TabsTrigger value="allergens">Аллергены</TabsTrigger>
                    <TabsTrigger value="modifiers">Модификаторы</TabsTrigger>
                    <TabsTrigger value="technical">Тех. карта</TabsTrigger>
                    <TabsTrigger value="analytics">Аналитика</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card  style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader>
                            <CardTitle style={{color:'var(--custom-text)'}} className='text-white'>Основная информация</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label style={{color:'var(--custom-text)'}} className="text-sm text-white">Название блюда</label>
                                    <Input
                                        value={dishData.name}
                                        onChange={(e) => setDishData({...dishData, name: e.target.value})}
                                        style={{
                                            borderRadius: '10px',
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label style={{color:'var(--custom-text)'}} className="text-sm text-white">Цена (₽)</label>
                                    <Input
                                        type="number"
                                        value={dishData.price}
                                        onChange={(e) => setDishData({...dishData, price: parseFloat(e.target.value)})}
                                        style={{
                                            borderRadius: '10px',
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label style={{color:'var(--custom-text)'}} className="text-sm text-white">Вес</label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={dishData.weight}
                                            onChange={(e) => setDishData({...dishData, weight: e.target.value})}
                                            placeholder="0"
                                            className="flex-1"
                                            style={{
                                                borderRadius: '10px',
                                                border: 'var(--custom-border-primary)',
                                                background: 'var(--custom-bg-inpyt)',
                                                color: 'var(--custom-text)',
                                            }}
                                        />
                                        <Select
                                            value={dishData.units_id?.toString() || '1'}
                                            onValueChange={(value) => setDishData({
                                                ...dishData,
                                                units_id: parseInt(value)
                                            })}
                                            disabled={unitsLoading}
                                        >
                                            <SelectTrigger className="w-32"  style={{
                                                borderRadius: '10px',
                                                border: 'var(--custom-border-primary)',
                                                background: 'var(--custom-bg-inpyt)',
                                                color: 'var(--custom-text)',
                                            }}>
                                                {unitsLoading ? (
                                                    <span>Загрузка...</span>
                                                ) : (
                                                    <SelectValue placeholder="Ед."/>
                                                )}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {units.map((unit) => (
                                                    <SelectItem key={unit.id} value={unit.id.toString()}>
                                                        {unit.symbol} ({unit.name})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label style={{color:'var(--custom-text)'}} className="text-sm text-white">Подкатегория</label>
                                    <Input
                                        value={dishData.subcategory}
                                        onChange={(e) => setDishData({...dishData, subcategory: e.target.value})}
                                        style={{
                                            borderRadius: '10px',
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label style={{color:'var(--custom-text)'}} className="text-sm text-white">Станция кухни</label>
                                    <Select
                                        value={dishData.kitchenStation}
                                        onValueChange={(value) => setDishData({...dishData, kitchenStation: value})}
                                    >
                                        <SelectTrigger  style={{
                                            borderRadius: '10px',
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}>
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {kitchenStations.map(station => (
                                                <SelectItem key={station} value={station}>{station}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label style={{color:'var(--custom-text)'}} className="text-sm text-white">Время приготовления (мин)</label>
                                    <Input
                                        type="number"
                                        value={dishData.cookTime}
                                        onChange={(e) => setDishData({...dishData, cookTime: parseInt(e.target.value)})}
                                        style={{
                                            borderRadius: '10px',
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label style={{color:'var(--custom-text)'}} className="text-sm text-white">Описание</label>
                                <Textarea
                                    value={dishData.description}
                                    onChange={(e) => setDishData({...dishData, description: e.target.value})}
                                    rows={3}

                                    style={{
                                        borderRadius: '10px',
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-5 gap-2 text-white">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={dishData.active}
                                        onCheckedChange={(checked) => setDishData({...dishData, active: checked})}
                                    />
                                    <label style={{color:'var(--custom-text)'}} className="text-sm">Активно</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={dishData.seasonal}
                                        onCheckedChange={(checked) => setDishData({...dishData, seasonal: checked})}
                                    />
                                    <label style={{color:'var(--custom-text)'}} className="text-sm">Сезонное</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={dishData.popular}
                                        onCheckedChange={(checked) => setDishData({...dishData, popular: checked})}
                                    />
                                    <label style={{color:'var(--custom-text)'}} className="text-sm">Хит продаж</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={dishData.display_website}
                                        onCheckedChange={(checked) => setDishData({
                                            ...dishData,
                                            display_website: checked
                                        })}
                                    />
                                    <label style={{color:'var(--custom-text)'}} className="text-sm">На сайте</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={dishData.combo_menu}
                                        onCheckedChange={(checked) => setDishData({...dishData, combo_menu: checked})}
                                    />
                                    <label style={{color:'var(--custom-text)'}} className="text-sm">Комбо-меню</label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card  style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader>
                            <CardTitle style={{color:'var(--custom-text)'}} className='text-white'>Пищевая ценность (на 100г)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label style={{color:'var(--custom-text)'}} className="text-sm text-white">Калории</label>
                                    <Input
                                        type="number"
                                        value={dishData.nutritionPer100g.calories}
                                        onChange={(e) => setDishData({
                                            ...dishData,
                                            nutritionPer100g: {
                                                ...dishData.nutritionPer100g,
                                                calories: parseFloat(e.target.value)
                                            }

                                        })
                                    }
                                        style={{
                                            borderRadius: '20px',
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label style={{color:'var(--custom-text)'}} className="text-sm text-white">Белки (г)</label>
                                    <Input
                                        type="number"
                                        value={dishData.nutritionPer100g.protein}
                                        onChange={(e) => setDishData({
                                            ...dishData,
                                            nutritionPer100g: {
                                                ...dishData.nutritionPer100g,
                                                protein: parseFloat(e.target.value)
                                            }
                                        })}
                                        style={{
                                            borderRadius: '20px',
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label style={{color:'var(--custom-text)'}} className="text-sm text-white">Жиры (г)</label>
                                    <Input
                                        type="number"
                                        value={dishData.nutritionPer100g.fat}
                                        onChange={(e) => setDishData({
                                            ...dishData,
                                            nutritionPer100g: {
                                                ...dishData.nutritionPer100g,
                                                fat: parseFloat(e.target.value)
                                            }
                                        })}
                                        style={{
                                            borderRadius: '20px',
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label style={{color:'var(--custom-text)'}} className="text-sm text-white">Углеводы (г)</label>
                                    <Input
                                        type="number"
                                        value={dishData.nutritionPer100g.carbs}
                                        onChange={(e) => setDishData({
                                            ...dishData,
                                            nutritionPer100g: {
                                                ...dishData.nutritionPer100g,
                                                carbs: parseFloat(e.target.value)
                                            }
                                        })}
                                        style={{
                                        borderRadius: '20px',
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-inpyt)',
                                        color: 'var(--custom-text)',
                                    }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="combo" className="space-y-4">
                    <Card  style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader>
                            <CardTitle style={{color:'var(--custom-text)'}} className='text-white'>Комбо-набор</CardTitle>
                        </CardHeader>
                        <CardContent >
                            <ComboItemsEditor
                                comboItems={dishData.combo_items}
                                allDishes={allDishes}
                                onUpdate={handleUpdateComboItems}
                            />
                        </CardContent>
                    </Card>

                    <Card  style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader>
                            <CardTitle style={{color:'var(--custom-text)'}} className='text-white'>Настройки комбо</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="space-y-2">
                                        <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Скидка (%)</label>
                                        <Input
                                            type="number"
                                            placeholder="20"
                                            value={20}
                                            disabled
                                            className="bg-gray-50"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Скидка автоматически рассчитывается
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Цена комбо</label>
                                        <div className="p-3 bg-purple-50 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">
                                                ₽{dishData.price.toFixed(2)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Экономия: ₽{(dishData.combo_items.reduce((sum, item) =>
                                                sum + (item.price * item.quantity), 0) * 0.2).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="allergens" className="space-y-4">
                    <Card  style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader>
                            <CardTitle  style={{color:'var(--custom-text)'}} className='text-white'>
                                {dishData.is_combo ? 'Аллергены комбо-набора' : 'Управление аллергенами'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {dishData.is_combo ? (
                                <ComboAllergensDisplay
                                    comboItems={dishData.combo_items || []}
                                    allAllergens={allergens}
                                />
                            ) : (
                                <AllergensManager
                                    dishId={dish.id}
                                    currentAllergens={dishData.allergens}
                                    allAllergens={allergens}
                                    onUpdate={handleUpdateAllergens}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="modifiers" className="space-y-4">
                    <Card  style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}
                    >
                        <CardHeader>
                            <CardTitle>
                                {dishData.is_combo ? 'Модификаторы комбо-набора' : 'Управление модификаторами'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {dishData.is_combo ? (
                                <ComboModifiersDisplay
                                    comboItems={dishData.combo_items || []}
                                    allModifiers={modifiers}
                                />
                            ) : (
                                <ModifiersManager
                                    dishId={dish.id}
                                    currentModifiers={dishData.modifiers}
                                    allModifiers={modifiers}
                                    onUpdate={handleUpdateModifiers}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>



                <TabsContent value="technical" className="space-y-4">
                    <Card  style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader>
                            <CardTitle style={{color:'var(--custom-text)'}} className='text-white'>Калькуляция</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DishCalculation
                                dish={dish}
                                onAddProduct={onAddProduct}
                                onRemoveProduct={onRemoveProduct}
                                onUpdateProduct={handleUpdateProduct}
                                products={products}
                                isAdding={isAddingProduct}
                                units={units}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 " >
                        <Card style={{
                            borderRadius: '20px',
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-primaryLine)',
                            color: 'var(--custom-text)',
                        }}>
                            <CardHeader className="pb-2">
                                <CardTitle style={{color:'var(--custom-text)'}}  className="text-sm text-white">Продаж за месяц</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl text-orange-600">156</div>
                                <div className="text-xs text-green-600">+12% к прошлому месяцу</div>
                            </CardContent>
                        </Card>
                        <Card style={{
                            borderRadius: '20px',
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-primaryLine)',
                            color: 'var(--custom-text)',
                        }}>
                            <CardHeader className="pb-2 text-white">
                                <CardTitle style={{color:'var(--custom-text)'}} className="text-sm">Выручка за месяц</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl text-green-600">
                                    ₽{(dishData.price * 156).toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card style={{
                            borderRadius: '20px',
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-primaryLine)',
                            color: 'var(--custom-text)',
                        }}>
                            <CardHeader className="pb-2">
                                <CardTitle style={{color:'var(--custom-text)'}} className="text-sm text-white">Средний рейтинг</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl text-green-600">4.8 ⭐</div>
                                <div className="text-xs text-muted-foreground">На основе 89 отзывов</div>
                            </CardContent>
                        </Card>
                        <Card style={{
                            borderRadius: '20px',
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-primaryLine)',
                            color: 'var(--custom-text)',
                        }}>
                            <CardHeader className="pb-2">
                                <CardTitle style={{color:'var(--custom-text)'}} className="text-sm text-white">Прибыль за месяц</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl text-green-600">
                                    ₽{((dishData.price - dishData.technicalCard.totalCost) * 156).toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-primaryLine)',
                color: 'var(--custom-text)',
            }}>
                <CardContent className="pt-6">
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={handleBackToList}
                            disabled={isSaving}
                        >
                            Отмена
                        </Button>
                        <Button
                            className="bg-orange-600 hover:bg-orange-700"
                            onClick={handleSaveChanges}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <div
                                        className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Сохранение...
                                </>
                            ) : (
                                'Сохранить изменения'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

export default FullPageDishView;