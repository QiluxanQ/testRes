import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    Plus,
    Utensils,
    Layers,
    AlertCircle,
    Package,
    Calculator,
    Search,
    Trash2,
    X,
    Save
} from 'lucide-react';
import {fetcAlergenAndModifaiRefresh, fetchAdditionalMenuData} from "../../../../slice/menuSlice";
import {useDispatch} from "react-redux";

// Типы
interface ApiAllergen {
    id: number;
    name: string;
    metadate: any;
}

interface ApiModifier {
    id: number;
    name: string;
    price: string;
    metadate: any;
}

interface ApiProduct {
    id: number;
    name: string;
    purchase_price: string;
    is_active: boolean;
    [key: string]: any;
}

interface Dish {
    id: number;
    name: string;
    price: number;
    weight: string;
    cost_dish: number;
    is_active: boolean;
    kcal: number;
    proteins: number;
    fats: number;
    carbohydrates: number;
    display_website: boolean;
    category_menu_id: number;
    calculation: Calculation[];
    metadate?: any;
    is_combo?: boolean;
    combo_items?: ComboItem[];
    units_id?: number;
    point_retail_id?: number;
}

interface Calculation {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    unit: string;
    price: number;
    totalCost: number;
}

interface ComboItem {
    dish_id: number;
    dish_name: string;
    price: number;
    quantity: number;
    included: boolean;
}

interface DishModifier {
    id: number;
    name: string;
    type: 'required' | 'optional';
    options: string[];
    minSelection?: number;
    maxSelection?: number;
}

interface NestedCategory {
    id: number;
    name: string;
    parent_id: number | null;
    level: number;
    children: NestedCategory[];
    dishes: Dish[];
    isOpen?: boolean;
}

// Функция для форматирования даты без timezone (только локальное время)
const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
};

const FullScreenAddDish: React.FC<{
    category: NestedCategory;
    onClose: () => void;
    onAddDish: (dishData: any) => void;
    selectedSalesPoint?: any;
    isCombo?: boolean;
    allDishes?: Dish[];
    allergens: ApiAllergen[];
    modifiers: ApiModifier[];
}> = ({ category, onClose, onAddDish, selectedSalesPoint, isCombo = false, allDishes = [], allergens, modifiers }) => {
    const pointRetailId = selectedSalesPoint ? selectedSalesPoint.id : 1;

    // Проверка уникальности названия блюда
    const [dishNameError, setDishNameError] = useState<string | null>(null);

    const checkDishName = useCallback(async (name: string, isCombo: boolean = false) => {
        if (!name.trim()) {
            setDishNameError(null);
            return;
        }

        const token = localStorage.getItem('token');
        const normalizedName = name.trim().toLowerCase();

        try {
            // Запрашиваем ВСЕ блюда и комбо, а затем фильтруем локально
            const dishResponse = await fetch('/dishes/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const comboResponse = await fetch('/combo-meals/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (dishResponse.ok && comboResponse.ok) {
                const existingDishes = await dishResponse.json();
                const existingCombos = await comboResponse.json();

                // Объединяем все блюда
                const allExistingItems = [...existingDishes, ...existingCombos];

                // Проверяем дубликаты ТОЧНО по тем же правилам, что и в БД
                const duplicateExists = allExistingItems.some((item: any) => {
                    // Проверяем название (без учета регистра)
                    const sameName = item.name.trim().toLowerCase() === normalizedName;

                    // Проверяем категорию
                    const sameCategory = item.category_menu_id === category.id;

                    // Проверяем точку продаж (важно: сравниваем именно значения)
                    const itemPointId = item.point_retail_id;
                    const currentPointId = pointRetailId;

                    // Обрабатываем null/undefined случаи
                    const sameSalesPoint =
                        (itemPointId === null && currentPointId === null) ||
                        (itemPointId === undefined && currentPointId === undefined) ||
                        (itemPointId === currentPointId);

                    // Проверяем тип (если нужно разделять обычные и комбо)
                    const sameType = (item.is_combo || false) === isCombo;

                    // ТОЧНОЕ совпадение по всем трем полям уникального индекса
                    return sameName && sameCategory && sameSalesPoint && sameType;
                });

                if (duplicateExists) {
                    setDishNameError(`Блюдо с названием "${name}" уже существует в этой категории и точке продаж`);
                } else {
                    setDishNameError(null);
                }
            }
        } catch (error) {
            console.error('Ошибка при проверке названия блюда:', error);
            setDishNameError('Ошибка проверки уникальности названия');
        }
    }, [category.id, pointRetailId]);

    const [formData, setFormData] = useState({
        point_retail_id: pointRetailId,
        category_menu_id: category.id,
        kitchen_id: 1,
        name: '',
        price: '',
        weight: '',
        units_id: 1,
        cost_dish: '',
        is_active: true,
        kcal: '',
        proteins: '',
        fats: '',
        carbohydrates: '',
        display_website: false,
        is_combo: isCombo,
        combo_menu: false,
        combo_items: [] as ComboItem[],
        subcategory: '',
        kitchenStation: '',
        cookTime: 0,
        description: '',
        seasonal: false,
        popular: false,
        allergens: [] as number[],
        selectedAllergenIds: [] as number[],
        cookingSteps: ['Подготовить все ингредиенты', 'Смешать основные компоненты', 'Приготовить согласно рецепту', 'Подать в горячем виде'],
        portionWeight: 0,
        markup: 0,
        modifiers: [] as DishModifier[],
        selectedModifiers: [] as {
            modifiers_id: number;
            status: string;
            comment: string;
        }[],
        nutritionPer100g: {
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0
        },
        calculation: [] as Calculation[]
    });

    const [units, setUnits] = useState<any[]>([]);
    const [unitsLoading, setUnitsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [newCookingStep, setNewCookingStep] = useState('');
    const [comboSearchTerm, setComboSearchTerm] = useState('');
    const [selectedDishId, setSelectedDishId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedAllergenId, setSelectedAllergenId] = useState<number | null>(null);
    const [selectedModifierId, setSelectedModifierId] = useState<number | null>(null);
    const [modifierStatus, setModifierStatus] = useState('available');
    const [modifierComment, setModifierComment] = useState('');

    // Для калькуляции
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [showAddCalculationForm, setShowAddCalculationForm] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [calculationQuantity, setCalculationQuantity] = useState('');
    const [calculationUnitId, setCalculationUnitId] = useState<string>('1');
    const [isAddingCalculation, setIsAddingCalculation] = useState(false);

    const [newAllergen, setNewAllergen] = useState({
        name: '',
    });

    const dispatch = useDispatch();
    const [newModifier, setNewModifier] = useState({
        name: '',
        price: 0.00
    });
    useEffect(() => {
        const timer = setTimeout(() => {
            checkDishName(formData.name);
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.name, checkDishName]);

    const handleAddAllergenItem = async () => {
        const token = localStorage.getItem('token');
        if (!newAllergen.name) return;

        try {
            const response = await fetch('/allergens/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newAllergen.name,
                    metadate: {}
                })
            });

            if (response.ok) {
                await dispatch(fetcAlergenAndModifaiRefresh()).unwrap();
                setNewAllergen({ name: '' });
                alert('Аллерген успешно добавлен!');
            } else {
                const errorText = await response.text();
                throw new Error(`Ошибка: ${errorText}`);
            }
        } catch (err) {
            console.error('Ошибка добавления аллергена:', err);
            alert('Не удалось добавить аллерген');
        }
    };


    const handleAddModifierItem = async () => {
        const token = localStorage.getItem('token');
        if (!newModifier.name) return;
        try {
            const response = await fetch('/modifiers/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newModifier.name,
                    price: newModifier.price,
                    metadate: {}
                })
            });
            if (response.ok) {
                setNewModifier({ name: '', price: 0.00 });
                alert('Модификатор успешно добавлен!');
            } else {
                const errorText = await response.text();
                throw new Error(`Ошибка: ${errorText}`);
            }
        } catch (err) {
            console.error('Ошибка добавления модификатора:', err);
            alert('Не удалось добавить модификатор');
        }

    };

    useEffect(() => {
        const fetchUnits = async () => {
            setUnitsLoading(true);
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

        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/products/?skip=0&limit=500', {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const productsData = await response.json();
                    setProducts(productsData);
                }
            } catch (error) {
                console.error('Ошибка загрузки продуктов:', error);
            }
        };

        fetchUnits();
        fetchProducts();
    }, []);

    const kitchenStations = [
        'Основная кухня',
        'Холодный цех',
        'Гриль',
        'Пицца',
        'Суши бар',
        'Бар',
        'Патти-станция'
    ];

    const categoryNames = useMemo(() =>
            [category.name],
        [category]
    );

    const handleAddAllergen = () => {
        if (selectedAllergenId && !formData.selectedAllergenIds.includes(selectedAllergenId)) {
            setFormData(prev => ({
                ...prev,
                selectedAllergenIds: [...prev.selectedAllergenIds, selectedAllergenId]
            }));
            setSelectedAllergenId(null);
        }
    };

    const handleRemoveAllergen = (allergenId: number) => {
        setFormData(prev => ({
            ...prev,
            selectedAllergenIds: prev.selectedAllergenIds.filter(id => id !== allergenId)
        }));
    };

    const handleAddModifier = () => {
        if (selectedModifierId && !formData.selectedModifiers.some(m => m.modifiers_id === selectedModifierId)) {
            setFormData(prev => ({
                ...prev,
                selectedModifiers: [...prev.selectedModifiers, {
                    modifiers_id: selectedModifierId,
                    status: modifierStatus,
                    comment: modifierComment
                }]
            }));
            setSelectedModifierId(null);
            setModifierStatus('available');
            setModifierComment('');
        }
    };

    const handleRemoveModifier = (modifierId: number) => {
        setFormData(prev => ({
            ...prev,
            selectedModifiers: prev.selectedModifiers.filter(m => m.modifiers_id !== modifierId)
        }));
    };

    const availableAllergens = useMemo(() =>
            allergens.filter(allergen => !formData.selectedAllergenIds.includes(allergen.id)),
        [allergens, formData.selectedAllergenIds]
    );

    const availableModifiers = useMemo(() =>
            modifiers.filter(modifier => !formData.selectedModifiers.some(m => m.modifiers_id === modifier.id)),
        [modifiers, formData.selectedModifiers]
    );

    const handleAddCalculationItem = async () => {
        if (!selectedProductId || !calculationQuantity || !calculationUnitId) {
            alert("Выберите продукт, укажите количество и единицу измерения");
            return;
        }

        setIsAddingCalculation(true);
        try {
            const product = products.find(p => p.id === parseInt(selectedProductId));
            if (!product) throw new Error("Продукт не найден");

            const calculationItem: Calculation = {
                id: Date.now(), // Временный ID
                productId: parseInt(selectedProductId),
                productName: product.name,
                quantity: parseFloat(calculationQuantity),
                unit: units.find(u => u.id === parseInt(calculationUnitId))?.symbol || 'ед.',
                price: parseFloat(product.purchase_price || "0"),
                totalCost: parseFloat(product.purchase_price || "0") * parseFloat(calculationQuantity)
            };

            setFormData(prev => ({
                ...prev,
                calculation: [...prev.calculation, calculationItem]
            }));

            setSelectedProductId('');
            setCalculationQuantity('');
            setCalculationUnitId('1');
            setShowAddCalculationForm(false);

        } catch (error) {
            console.error("Ошибка при добавлении продукта в калькуляцию:", error);
            alert(`Не удалось добавить продукт: ${error.message}`);
        } finally {
            setIsAddingCalculation(false);
        }
    };

    const handleRemoveCalculationItem = (calculationId: number) => {
        setFormData(prev => ({
            ...prev,
            calculation: prev.calculation.filter(item => item.id !== calculationId)
        }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const dishData = {
                name: formData.name.trim(),
                price: isCombo ? comboPrice : parseFloat(formData.price || "0"),
                weight: parseFloat(formData.weight || "0"),
                units_id: formData.units_id || 1,
                cost_dish: formData.cost_dish || "0",
                is_active: formData.is_active,
                kcal: parseFloat(formData.kcal || "0"),
                proteins: parseFloat(formData.proteins || "0"),
                fats: parseFloat(formData.fats || "0"),
                carbohydrates: parseFloat(formData.carbohydrates || "0"),
                display_website: formData.display_website,
                category_menu_id: category.id,
                point_retail_id: pointRetailId,
                is_combo: isCombo,
                combo_items: isCombo ? formData.combo_items : [],
                calculation: !isCombo ? formData.calculation : [],
                metadate: {
                    subcategory: formData.subcategory,
                    kitchenStation: formData.kitchenStation,
                    cookTime: formData.cookTime,
                    description: formData.description,
                    seasonal: formData.seasonal,
                    popular: formData.popular,
                    cookingSteps: formData.cookingSteps,
                    portionWeight: formData.portionWeight,
                    markup: formData.markup,
                    // Передаем ID аллергенов
                    allergens: formData.selectedAllergenIds,
                    // Передаем модификаторы с их данными
                    modifiers: formData.selectedModifiers.map(mod => ({
                        modifiers_id: mod.modifiers_id,
                        status: mod.status,
                        comment: mod.comment
                    }))
                }
            };

            await onAddDish(dishData);

        } catch (error) {
            console.error("Ошибка:", error);
            alert(`Не удалось создать: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const addCookingStep = () => {
        if (newCookingStep.trim()) {
            setFormData(prev => ({
                ...prev,
                cookingSteps: [...prev.cookingSteps, newCookingStep.trim()]
            }));
            setNewCookingStep('');
        }
    };

    const removeCookingStep = (index: number) => {
        setFormData(prev => ({
            ...prev,
            cookingSteps: prev.cookingSteps.filter((_, i) => i !== index)
        }));
    };

    const handleAddComboItem = () => {
        if (!selectedDishId) return;

        const dish = allDishes.find(d => d.id === selectedDishId);
        if (dish) {
            const newItem: ComboItem = {
                dish_id: dish.id,
                dish_name: dish.name,
                price: dish.price,
                quantity: 1,
                included: true
            };
            setFormData(prev => ({
                ...prev,
                combo_items: [...prev.combo_items, newItem]
            }));
            setSelectedDishId(null);
            setComboSearchTerm('');
        }
    };

    const handleRemoveComboItem = (dishId: number) => {
        setFormData(prev => ({
            ...prev,
            combo_items: prev.combo_items.filter(item => item.dish_id !== dishId)
        }));
    };

    const handleUpdateComboItem = (dishId: number, updates: Partial<ComboItem>) => {
        const updatedItems = formData.combo_items.map(item =>
            item.dish_id === dishId ? { ...item, ...updates } : item
        );
        setFormData(prev => ({
            ...prev,
            combo_items: updatedItems
        }));
    };

    const filteredDishes = useMemo(() => {
        return allDishes.filter(dish => {
            const matchesSearch = dish.name.toLowerCase().includes(comboSearchTerm.toLowerCase());
            const notInCombo = !formData.combo_items.some(item => item.dish_id === dish.id);
            const isComboMenu = dish.metadate?.combo_menu === true;

            return matchesSearch && notInCombo && isComboMenu;
        });
    }, [allDishes, comboSearchTerm, formData.combo_items]);

    const totalOriginalPrice = useMemo(() =>
            formData.combo_items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        [formData.combo_items]
    );

    const comboPrice = useMemo(() =>
            formData.combo_items.reduce((sum, item) => {
                return sum + (item.price * item.quantity * (item.included ? 0.8 : 1));
            }, 0),
        [formData.combo_items]
    );

    const calculationTotalCost = useMemo(() =>
            formData.calculation.reduce((sum, item) => sum + item.totalCost, 0),
        [formData.calculation]
    );

    const profit = parseFloat(formData.price || "0") - calculationTotalCost;
    const profitMargin = parseFloat(formData.price || "0") > 0 ? (profit / parseFloat(formData.price || "0")) * 100 : 0;

    const activeProducts = useMemo(() =>
            products.filter(product => product.is_active),
        [products]
    );

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, name: value }));
    };

    const handleNutritionChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
            nutritionPer100g: {
                ...prev.nutritionPer100g,
                [field === 'kcal' ? 'calories' : field]: parseFloat(value) || 0
            }
        }));
    };

    return (
        <div className="space-y-6">
            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-primaryLine)',
                color: 'var(--custom-text)',
            }}>
                <CardContent className="pt-6">
                    <Button variant="outline" onClick={onClose}>
                        <ArrowLeft className="h-4 w-4 mr-2"/>
                        Назад к меню
                    </Button>
                </CardContent>
            </Card>

            <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-primaryLine)',
                color: 'var(--custom-text)',
            }} >
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle style={{color:'var(--custom-text)'}} className="text-2xl flex items-center gap-3 text-white">
                                {isCombo ? (
                                    <>
                                        <Layers className="h-6 w-6 text-purple-600"/>
                                        Добавление нового комбо-набора
                                    </>
                                ) : (
                                    <>
                                        <Utensils className="h-6 w-6 text-orange-600"/>
                                        Добавление нового блюда
                                    </>
                                )}
                            </CardTitle>
                            <p className="text-muted-foreground mt-2">
                                {isCombo ? 'Создайте комбо-набор из нескольких блюд' : 'Заполните информацию о новом блюде'} в
                                категории: {category.name}
                                {selectedSalesPoint && ` для точки продаж: ${selectedSalesPoint.name}`}
                            </p>
                        </div>
                        <div className="text-right">
                            {isCombo ? (
                                <div className="text-3xl text-purple-600">₽{comboPrice.toFixed(2)}</div>
                            ) : (
                                <div className="text-3xl text-orange-600">₽{formData.price || '0.00'}</div>
                            )}
                            <div className="text-sm text-muted-foreground">цена</div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <form onSubmit={handleSubmit} >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3" >
                    <TabsList className="grid w-full grid-cols-6 " style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-primaryLine)',
                        color: 'var(--custom-text)',
                    }}>
                        <TabsTrigger value="general">Общее</TabsTrigger>
                        <TabsTrigger value="combo" disabled={!isCombo}>
                            <Layers className="h-4 w-4 mr-2"/>
                            Комбо
                        </TabsTrigger>
                        <TabsTrigger value="allergens">
                            Аллергены ({formData.selectedAllergenIds.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="modifiers">
                            Модификаторы ({formData.selectedModifiers.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="technical">Тех. карта</TabsTrigger>
                        <TabsTrigger value="calculation">Калькуляция</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4">
                        <Card style={{
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
                                    <div className="space-y-2 text-white">
                                        <label style={{color:'var(--custom-text)'}} className="text-sm text-white">Название {isCombo ? 'комбо-набора' : 'блюда'}</label>
                                        <Input
                                            value={formData.name}
                                            onChange={handleNameChange}
                                            placeholder={isCombo ? "Название комбо-набора" : "Название блюда"}
                                            className={dishNameError ? "border-red-500" : ""}
                                            style={{
                                                border: 'var(--custom-border-primary)',
                                                background: 'var(--custom-bg-inpyt)',
                                                color: 'var(--custom-text)',
                                            }}
                                        />
                                        {dishNameError && (
                                            <p className="text-sm text-red-500">{dishNameError}</p>
                                        )}
                                    </div>
                                    {!isCombo && (
                                        <div className="space-y-2">
                                            <label style={{color:'var(--custom-text)'}} className="text-sm text-white">Цена (₽)</label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                placeholder="0.00"
                                                required={!isCombo}
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label style={{color:'var(--custom-text)'}} className="text-sm text-white">Вес</label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.weight}
                                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                                placeholder="0"
                                                className="flex-1"
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            />
                                            <Select
                                                value={formData.units_id?.toString() || '1'}
                                                onValueChange={(value) => setFormData({
                                                    ...formData,
                                                    units_id: value ? parseInt(value) : 1
                                                })}
                                                disabled={unitsLoading}
                                            >
                                                <SelectTrigger className="w-32 text-white"
                                                               style={{
                                                                   border: 'var(--custom-border-primary)',
                                                                   background: 'var(--custom-bg-inpyt)',
                                                                   color: 'var(--custom-text)',
                                                               }}
                                                >
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
                                        <label style={{color:'var(--custom-text)'}} className="text-sm text-white">Категория</label>
                                        <Select value={category.name} disabled>
                                            <SelectTrigger>
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent    style={{
                                                border: 'var(--custom-border-primary)',
                                                background: 'var(--custom-bg-inpyt)',
                                                color: 'var(--custom-text)',
                                            }}>
                                                {categoryNames.map(cat => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label style={{color:'var(--custom-text)'}} className="text-sm text-white">Подкатегория</label>
                                        <Input
                                            value={formData.subcategory}
                                            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                            placeholder="Введите подкатегорию"
                                            style={{
                                                border: 'var(--custom-border-primary)',
                                                background: 'var(--custom-bg-inpyt)',
                                                color: 'var(--custom-text)',
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label style={{color:'var(--custom-text)'}} className="text-sm text-white">Станция кухни</label>
                                        <Select
                                            value={formData.kitchenStation}
                                            onValueChange={(value) => setFormData({ ...formData, kitchenStation: value })}
                                        >
                                            <SelectTrigger    style={{
                                                border: 'var(--custom-border-primary)',
                                                background: 'var(--custom-bg-inpyt)',
                                                color: 'var(--custom-text)',
                                            }}>
                                                <SelectValue placeholder="Выберите станцию"/>
                                            </SelectTrigger>
                                            <SelectContent >
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
                                            value={formData.cookTime}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                cookTime: parseInt(e.target.value) || 0
                                            })}
                                            style={{
                                                border: 'var(--custom-border-primary)',
                                                background: 'var(--custom-bg-inpyt)',
                                                color: 'var(--custom-text)',
                                            }}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label style={{color:'var(--custom-text)'}} className="text-sm text-white">Описание</label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        placeholder={isCombo ? "Описание комбо-набора для клиентов" : "Описание блюда для клиентов"}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-5 gap-4 text-white">
                                    <div className="flex items-center gap-2 text-white">
                                        <Switch
                                            checked={formData.is_active}
                                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                        />
                                        <label style={{color:'var(--custom-text)'}} className="text-sm">Активно</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={formData.seasonal}
                                            onCheckedChange={(checked) => setFormData({ ...formData, seasonal: checked })}
                                        />
                                        <label style={{color:'var(--custom-text)'}} className="text-sm">Сезонное</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={formData.popular}
                                            onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
                                        />
                                        <label style={{color:'var(--custom-text)'}} className="text-sm">Хит продаж</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={formData.display_website}
                                            onCheckedChange={(checked) => setFormData({
                                                ...formData,
                                                display_website: checked
                                            })}
                                        />
                                        <label style={{color:'var(--custom-text)'}} className="text-sm">На сайте</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={formData.combo_menu}
                                            onCheckedChange={(checked) => setFormData({ ...formData, combo_menu: checked })}
                                        />
                                        <label style={{color:'var(--custom-text)'}} className="text-sm">Для комбо</label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            style={{
                                borderRadius: '20px',
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-secondaryLineCard)',
                                color: 'var(--custom-text)',
                            }}
                        >
                            <CardHeader>
                                <CardTitle style={{color:'var(--custom-text)'}} className='text-white'>Пищевая ценность (на 100г)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 gap-4 text-white">
                                    <div className="space-y-2">
                                        <label style={{color:'var(--custom-text)'}} className="text-sm">Калории</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.kcal || formData.nutritionPer100g.calories}
                                            onChange={(e) => handleNutritionChange('kcal', e.target.value)}
                                            placeholder="0"
                                            style={{
                                                border: 'var(--custom-border-primary)',
                                                background: 'var(--custom-bg-inpyt)',
                                                color: 'var(--custom-text)',
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label style={{color:'var(--custom-text)'}} className="text-sm">Белки (г)</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.proteins || formData.nutritionPer100g.protein}
                                            onChange={(e) => handleNutritionChange('proteins', e.target.value)}
                                            placeholder="0"
                                            style={{
                                                border: 'var(--custom-border-primary)',
                                                background: 'var(--custom-bg-inpyt)',
                                                color: 'var(--custom-text)',
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label style={{color:'var(--custom-text)'}} className="text-sm">Жиры (г)</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.fats || formData.nutritionPer100g.fat}
                                            onChange={(e) => handleNutritionChange('fats', e.target.value)}
                                            placeholder="0"
                                            style={{
                                                border: 'var(--custom-border-primary)',
                                                background: 'var(--custom-bg-inpyt)',
                                                color: 'var(--custom-text)',
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label style={{color:'var(--custom-text)'}} className="text-sm">Углеводы (г)</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.carbohydrates || formData.nutritionPer100g.carbs}
                                            onChange={(e) => handleNutritionChange('carbohydrates', e.target.value)}
                                            placeholder="0"
                                            style={{
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
                    <Card   style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader>
                            <CardTitle style={{color:'var(--custom-text)'}} className='text-white'>Комбо-набор</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div style={{color:'var(--custom-text)'}} className="flex items-center justify-between">
                                    <h3 style={{color:'var(--custom-text)'}} className="text-lg font-semibold text-white">Состав комбо</h3>
                                    <Badge style={{color:'var(--custom-text)'}} className='text-white' variant="outline">
                                        {formData.combo_items.length} позиций
                                    </Badge>
                                </div>

                                <Card   style={{
                                    borderRadius: '20px',
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-primaryLine)',
                                    color: 'var(--custom-text)',
                                }} className="p-4 border-dashed border-2">
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Поиск блюд</label>
                                                <Input
                                                    placeholder="Начните вводить название..."
                                                    value={comboSearchTerm}
                                                    onChange={(e) => setComboSearchTerm(e.target.value)}
                                                    style={{
                                                        borderRadius: '20px',
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
                                                    <SelectTrigger  style={{
                                                        borderRadius: '20px',
                                                        border: 'var(--custom-border-primary)',
                                                        background: 'var(--custom-bg-inpyt)',
                                                        color: 'var(--custom-text)',
                                                    }}>
                                                        <SelectValue placeholder="Выберите блюдо"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {filteredDishes.map(dish => (
                                                            <SelectItem key={dish.id} value={dish.id.toString()}>
                                                                {dish.name} - ₽{dish.price}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={handleAddComboItem}
                                            disabled={!selectedDishId}
                                            className="w-full bg-green-600"
                                        >
                                            <Plus className="h-4 w-4 mr-2"/>
                                            Добавить в комбо
                                        </Button>
                                    </div>
                                </Card>

                                {formData.combo_items.length > 0 ? (
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
                                                    {formData.combo_items.map((item) => (
                                                        <TableRow key={item.dish_id}>
                                                            <TableCell style={{color:'var(--custom-text)'}}
                                                                className="font-medium text-white">{item.dish_name}</TableCell>
                                                            <TableCell style={{color:'var(--custom-text)'}}  className='text-white'>₽{item.price.toFixed(2)}</TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.quantity}
                                                                    onChange={(e) => handleUpdateComboItem(item.dish_id, {
                                                                        quantity: parseInt(e.target.value) || 1
                                                                    })}
                                                                    className="w-20"
                                                                    style={{
                                                                        border: 'var(--custom-border-primary)',
                                                                        background: 'var(--custom-bg-inpyt)',
                                                                        color: 'var(--custom-text)',
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Switch
                                                                    checked={item.included}
                                                                    onCheckedChange={(checked) =>
                                                                        handleUpdateComboItem(item.dish_id, {included: checked})
                                                                    }
                                                                />
                                                            </TableCell>
                                                            <TableCell >
                                                                <Button style={{color:'var(--custom-text)'}}
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveComboItem(item.dish_id)}
                                                                    className=' text-white'
                                                                >
                                                                    <Trash2 className="h-4 w-4"/>
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <Card  style={{
                                            borderRadius: '20px',
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-secondaryLineCard)',
                                            color: 'var(--custom-text)',
                                        }} className="bg-blue-50 border-blue-200">
                                            <CardContent className="pt-4">
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Итоговая цена без
                                                            скидки</p>
                                                        <p className="text-xl font-bold">₽{totalOriginalPrice.toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Скидка 20%</p>
                                                        <p className="text-xl font-bold text-green-600">
                                                            -₽{(totalOriginalPrice * 0.2).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Цена комбо</p>
                                                        <p className="text-2xl font-bold text-purple-600">
                                                            ₽{comboPrice.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                                        <Layers className="h-12 w-12 mx-auto mb-4 text-gray-400"/>
                                        <p>Комбо пока пустое</p>
                                        <p className="text-sm">Добавьте блюда для создания комбо-набора</p>
                                    </div>
                                )}
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
                            <CardTitle>Настройки комбо</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Скидка (%)</label>
                                        <Input
                                            type="number"
                                            placeholder="20"
                                            value={20}
                                            disabled
                                            className="bg-gray-50"
                                            style={{color:'black'}}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Скидка автоматически рассчитывается
                                        </p>
                                    </div>
                                    <div className="space-y-2" >
                                        <label className="text-sm font-medium">Цена комбо</label>
                                        <div className="p-3 bg-purple-50 rounded-lg" style={{
                                            borderRadius: '20px',
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-secondaryLineCard)',
                                            color: 'var(--custom-text)',
                                        }}>
                                            <div className="text-2xl font-bold text-purple-600">
                                                ₽{comboPrice.toFixed(2)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Экономия: ₽{(totalOriginalPrice * 0.2).toFixed(2)}
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
                            <CardTitle style={{color:'var(--custom-text)'}}>Управление аллергенами</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={selectedAllergenId?.toString() || ''}
                                        onValueChange={(value) => setSelectedAllergenId(value ? parseInt(value) : null)}
                                    >
                                        <SelectTrigger className="w-full"    style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}>
                                            <SelectValue placeholder="Выберите аллерген"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableAllergens.map(allergen => (
                                                <SelectItem key={allergen.id} value={allergen.id.toString()}>
                                                    {allergen.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        type="button"
                                        onClick={handleAddAllergen}
                                        disabled={!selectedAllergenId}
                                    >
                                        <Plus className="h-4 w-4 mr-2"/>
                                        Добавить
                                    </Button>
                                    <Input
                                        className="bg-white text-black border-gray-300"
                                        value={newAllergen.name}
                                        onChange={(e) => setNewAllergen({ ...newAllergen, name: e.target.value })}
                                        placeholder="Описание аллергена"
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                    <Button
                                        className="bg-orange-600 hover:bg-orange-700 text-white"
                                        type="button"
                                        onClick={handleAddAllergenItem}
                                        disabled={!newAllergen.name}
                                    >
                                        <Plus className="h-4 w-4 mr-2"/>
                                        Создать
                                    </Button>
                                </div>

                                {formData.selectedAllergenIds.length > 0 ? (
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Выбранные аллергены:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.selectedAllergenIds.map(allergenId => {
                                                const allergen = allergens.find(a => a.id === allergenId);
                                                return allergen ? (
                                                    <Badge
                                                        key={allergen.id}
                                                        variant="secondary"
                                                        className="px-3 py-1 flex items-center gap-1"
                                                    >
                                                        {allergen.name}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-4 w-4 p-0 ml-1"
                                                            onClick={() => handleRemoveAllergen(allergen.id)}
                                                        >
                                                            <X className="h-3 w-3"/>
                                                        </Button>
                                                    </Badge>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground border rounded-lg">
                                        <AlertCircle className="h-8 w-8 mx-auto mb-2"/>
                                        <p>Аллергены не добавлены</p>
                                        <p className="text-sm">Добавьте аллергены, которые содержатся в блюде</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="modifiers" className="space-y-4">
                    <Card   style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader>
                            <CardTitle style={{color:'var(--custom-text)'}} className='text-white'>Управление модификаторами</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Модификатор</label>
                                        <Select
                                            value={selectedModifierId?.toString() || ''}
                                            onValueChange={(value) => setSelectedModifierId(value ? parseInt(value) : null)}
                                        >
                                            <SelectTrigger   s style={{
                                                border: 'var(--custom-border-primary)',
                                                background: 'var(--custom-bg-inpyt)',
                                                color: 'var(--custom-text)',
                                            }}>
                                                <SelectValue placeholder="Выберите модификатор"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableModifiers.map(modifier => (
                                                    <SelectItem key={modifier.id} value={modifier.id.toString()}>
                                                        {modifier.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Статус</label>
                                        <Select
                                            value={modifierStatus}
                                            onValueChange={setModifierStatus}
                                        >
                                            <SelectTrigger    style={{
                                                border: 'var(--custom-border-primary)',
                                                background: 'var(--custom-bg-inpyt)',
                                                color: 'var(--custom-text)',
                                            }}>
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="available">Доступен</SelectItem>
                                                <SelectItem value="required">Обязателен</SelectItem>
                                                <SelectItem value="excluded">Исключен</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Комментарий</label>
                                        <Input
                                            placeholder="Необязательный комментарий"
                                            value={modifierComment}
                                            onChange={(e) => setModifierComment(e.target.value)}
                                            style={{
                                                border: 'var(--custom-border-primary)',
                                                background: 'var(--custom-bg-inpyt)',
                                                color: 'var(--custom-text)',
                                            }}
                                        />
                                        <div className="space-y-4 py-4 " style={{
                                            borderRadius: '20px',
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-secondaryLineCard)',
                                            color: 'var(--custom-text)',
                                        }}>
                                            <p>Ссоздания модификатора</p>
                                            <div>
                                                <label style={{color:'var(--custom-text)'}} className="text-sm font-medium mb-2 block">Название *</label>
                                                <Input
                                                    className="bg-white text-black border-gray-300"
                                                    value={newModifier.name}
                                                    onChange={(e) => setNewModifier({ ...newModifier, name: e.target.value })}
                                                    placeholder="Название модификатора"
                                                    style={{
                                                        border: 'var(--custom-border-primary)',
                                                        background: 'var(--custom-bg-inpyt)',
                                                        color: 'var(--custom-text)',
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{color:'var(--custom-text)'}} className="text-sm font-medium mb-2 block">Цена</label>
                                                <Input
                                                    className="bg-white text-black border-gray-300"
                                                    type="number"
                                                    step="0.01"
                                                    value={newModifier.price}
                                                    onChange={(e) => setNewModifier({ ...newModifier, price: e.target.value })}
                                                    placeholder="0.00"
                                                    style={{
                                                        border: 'var(--custom-border-primary)',
                                                        background: 'var(--custom-bg-inpyt)',
                                                        color: 'var(--custom-text)',
                                                    }}
                                                />
                                            </div>
                                            <Button
                                                type='button'
                                                className="bg-orange-600 hover:bg-orange-700 text-white"
                                                onClick={handleAddModifierItem}
                                                disabled={!newModifier.name}
                                            >
                                                Создать
                                            </Button>
                                        </div>

                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    onClick={handleAddModifier}
                                    disabled={!selectedModifierId}
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2"/>
                                    Добавить модификатор
                                </Button>

                                {formData.selectedModifiers.length > 0 ? (
                                    <div className="space-y-2">
                                        <h4 style={{color:'var(--custom-text)'}} className="font-medium text-white">Выбранные модификаторы:</h4>
                                        <div className="space-y-2">
                                            {formData.selectedModifiers.map(modifierItem => {
                                                const modifier = modifiers.find(m => m.id === modifierItem.modifiers_id);
                                                return modifier ? (
                                                    <div
                                                        key={modifier.id}
                                                        className="flex items-center justify-between p-3 border rounded-lg text-white"
                                                    >
                                                        <div>
                                                            <div style={{color:'var(--custom-text)'}} className="font-medium">{modifier.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                Статус: {modifierItem.status === 'available' ? 'Доступен' :
                                                                modifierItem.status === 'required' ? 'Обязателен' : 'Исключен'}
                                                                {modifierItem.comment && ` | ${modifierItem.comment}`}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveModifier(modifier.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4"/>
                                                        </Button>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground border rounded-lg">
                                        <Package className="h-8 w-8 mx-auto mb-2"/>
                                        <p>Модификаторы не добавлены</p>
                                        <p className="text-sm">Добавьте модификаторы для этого блюда</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="technical" className="space-y-4">
                    <Card   style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }}>
                        <CardHeader>
                            <CardTitle style={{color:'var(--custom-text)'}}  className='text-white'>Технология приготовления</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {formData.cookingSteps.map((step, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <Badge className="bg-orange-100 text-orange-800 flex-shrink-0 mt-1">
                                            {idx + 1}
                                        </Badge>
                                        <Input
                                            value={step}
                                            onChange={(e) => {
                                                const newSteps = [...formData.cookingSteps];
                                                newSteps[idx] = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    cookingSteps: newSteps
                                                });
                                            }}
                                            style={{
                                                border: 'var(--custom-border-primary)',
                                                background: 'var(--custom-bg-inpyt)',
                                                color: 'var(--custom-text)',
                                            }}
                                            className="flex-1"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                const newSteps = formData.cookingSteps.filter((_, i) => i !== idx);
                                                setFormData({
                                                    ...formData,
                                                    cookingSteps: newSteps
                                                });
                                            }}
                                        >
                                            <Trash2 style={{color:'var(--custom-text)'}} className="h-4 w-4 text-white "/>
                                        </Button>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Новый шаг приготовления"
                                        value={newCookingStep}
                                        onChange={(e) => setNewCookingStep(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCookingStep())}
                                        style={{
                                            border: 'var(--custom-border-primary)',
                                            background: 'var(--custom-bg-inpyt)',
                                            color: 'var(--custom-text)',
                                        }}
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={addCookingStep}
                                        className="bg-green-600 text-white"
                                    >
                                        <Plus className="h-4 w-4 mr-2"/>
                                        Добавить шаг
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {!isCombo && (
                        <Card
                            style={{
                                borderRadius: '20px',
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-secondaryLineCard)',
                                color: 'var(--custom-text)',
                            }}
                        >
                            <CardHeader>
                                <CardTitle style={{color:'var(--custom-text)'}}>Настройки порции</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Вес порции (г)</label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={formData.portionWeight}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    portionWeight: parseInt(e.target.value) || 0
                                                })}
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Себестоимость</label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formData.cost_dish}
                                                onChange={(e) => setFormData({...formData, cost_dish: e.target.value})}
                                                style={{
                                                    border: 'var(--custom-border-primary)',
                                                    background: 'var(--custom-bg-inpyt)',
                                                    color: 'var(--custom-text)',
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="calculation" className="space-y-4">
                    <Card style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-secondaryLineCard)',
                        color: 'var(--custom-text)',
                    }} >
                        <CardHeader>
                            <CardTitle style={{color:'var(--custom-text)'}} className='text-white'>Калькуляция блюда</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 style={{color:'var(--custom-text)'}} className="text-lg font-semibold text-white">Калькуляция блюда</h3>
                                    <Button
                                        onClick={() => setShowAddCalculationForm(!showAddCalculationForm)}
                                        size="sm"
                                        variant={showAddCalculationForm ? "secondary" : "default"}
                                    >
                                        <Plus className="h-4 w-4 mr-2"/>
                                        {showAddCalculationForm ? 'Скрыть форму' : 'Добавить продукт'}
                                    </Button>
                                </div>

                                {showAddCalculationForm && (
                                    <Card className="bg-gray-50 border-dashed" style={{
                                        borderRadius: '20px',
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-secondaryLineCard)',
                                        color: 'var(--custom-text)',
                                    }}>
                                        <CardContent className="pt-6">
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label style={{color:'var(--custom-text)'}} className="text-sm font-medium block mb-2 text-white">Продукт
                                                            *</label>
                                                        <select
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            value={selectedProductId}
                                                            onChange={(e) => setSelectedProductId(e.target.value)}
                                                            required
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        >
                                                            <option value="">Выберите продукт</option>
                                                            {activeProducts.map(product => (
                                                                <option key={product.id} value={product.id}>
                                                                    {product.name} ({parseFloat(product.purchase_price || "0").toFixed(2)}₽)
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label style={{color:'var(--custom-text)'}} className="text-sm font-medium block mb-2 text-white">Количество
                                                            *</label>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="Введите количество"
                                                            value={calculationQuantity}
                                                            onChange={(e) => setCalculationQuantity(e.target.value)}
                                                            className="w-full"
                                                            required
                                                            style={{
                                                                border: 'var(--custom-border-primary)',
                                                                background: 'var(--custom-bg-inpyt)',
                                                                color: 'var(--custom-text)',
                                                            }}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label style={{color:'var(--custom-text)'}} className="text-sm font-medium block mb-2 text-white">Единица
                                                            измерения *</label>
                                                        <select
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            value={calculationUnitId}
                                                            onChange={(e) => setCalculationUnitId(e.target.value)}
                                                            required
                                                            style={{
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
                                                        onClick={() => setShowAddCalculationForm(false)}
                                                        disabled={isAddingCalculation}
                                                    >
                                                        Отмена
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={handleAddCalculationItem}
                                                        disabled={!selectedProductId || !calculationQuantity || !calculationUnitId || isAddingCalculation}
                                                    >
                                                        {isAddingCalculation ? 'Добавление...' : 'Добавить продукт'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {formData.calculation.length > 0 ? (
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
                                                <TableBody className='text-white'>
                                                    {formData.calculation.map((item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell style={{color:'var(--custom-text)'}}
                                                                className="font-medium">{item.productName}</TableCell>
                                                            <TableCell style={{color:'var(--custom-text)'}}>{item.quantity}</TableCell>
                                                            <TableCell style={{color:'var(--custom-text)'}}>{item.unit}</TableCell>
                                                            <TableCell style={{color:'var(--custom-text)'}}>₽{item.price.toFixed(2)}</TableCell>
                                                            <TableCell style={{color:'var(--custom-text)'}}>₽{item.totalCost.toFixed(2)}</TableCell>
                                                            <TableCell>
                                                                <div className="flex space-x-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleRemoveCalculationItem(item.id)}
                                                                    >
                                                                        <Trash2 style={{color:'var(--custom-text)'}} className="h-4 w-4"/>
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                            <div>
                                                <p style={{color:'var(--custom-text)'}} className="text-sm text-muted-foreground text-">Себестоимость</p>
                                                <p style={{color:'var(--custom-text)'}} className="text-xl font-bold text-white">₽{calculationTotalCost.toFixed(2)}</p>
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
                                        <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400"/>
                                        <p>Калькуляция не настроена</p>
                                        <p className="text-sm">Добавьте продукты для расчета себестоимости</p>
                                    </div>
                                )}
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
            }}
            >
                <CardContent className="pt-6">
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Отмена
                        </Button>
                        <Button
                            className={`${isCombo ? 'bg-orange-600 hover:bg-orange-700  ' : 'bg-orange-600 hover:bg-orange-700'}`}
                            onClick={handleSubmit}
                            disabled={isSaving || !formData.name.trim() || (isCombo && formData.combo_items.length === 0)}
                        >
                            {isSaving ? (
                                <>
                                    <div
                                        className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Сохранение...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2"/>
                                    {isCombo ? 'Создать комбо-набор' : 'Добавить блюдо'}
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
                </form>
        </div>
    );
}
export default FullScreenAddDish;