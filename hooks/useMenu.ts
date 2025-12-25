import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {

    refreshMenuData,
    updateDish,
    addDish,
    deleteDish,
    addCalculation,
    removeCalculation,
    updateCalculation,
    setSelectedSalesPoint,
    updateDishLocally,
    updateComboLocally
} from '../slice/menuSlice';

// Types
import {
    ApiDish,
    ApiCategory,
    ApiProduct,
    ApiCalculation,
    ApiAllergen,
    ApiModifier,
    ApiDishModifierItem,
    ApiComboMeal,
    ApiPriceDish,
    ApiComboMealItem,
    ApiPriceCombo,
    ApiDishAllergenItem
} from '../types/menu';

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
    price_history?: ApiPriceDish[];
    allergens?: ApiAllergen[];
    modifiers?: ApiModifier[];
    dish_modifier_items?: ApiDishModifierItem[];
    combo_price_history?: ApiPriceCombo[];
    units_id?: number;
    point_retail_id?: number;
}

interface ComboItem {
    dish_id: number;
    dish_name: string;
    price: number;
    quantity: number;
    included: boolean;
    allergens?: ApiAllergen[]; // Аллергены блюда в комбо
    modifiers?: ApiModifier[]; // Модификаторы блюда в комбо
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

interface NestedCategory {
    id: number;
    name: string;
    parent_id: number | null;
    level: number;
    children: NestedCategory[];
    dishes: Dish[];
    isOpen?: boolean;
}

interface UseMenuOptions {
    selectedSalesPoint?: any;
    onError?: (error: string) => void;
    onSuccess?: (message: string) => void;
}

export const useMenu = (options: UseMenuOptions = {}) => {
    const { selectedSalesPoint, onError, onSuccess } = options;

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
        comboMealItems
    } = useSelector((state: RootState) => state.menu);

    const [categories, setCategories] = useState<NestedCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<NestedCategory | null>(null);
    const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
    const [allDishesList, setAllDishesList] = useState<Dish[]>([]);


    useEffect(() => {
        if (selectedSalesPoint) {
            dispatch(setSelectedSalesPoint(selectedSalesPoint.id));
        } else {
            dispatch(setSelectedSalesPoint(null));
        }
    }, [dispatch, selectedSalesPoint]);


    useEffect(() => {
        const loadData = async () => {
            if (selectedSalesPointId !== null || selectedSalesPoint === null) {
                try {
                    await dispatch(fetchAllData(selectedSalesPointId)).unwrap();
                } catch (error: any) {
                    onError?.(error.message || 'Ошибка загрузки данных');
                }
            }
        };
        loadData();
    }, [dispatch, selectedSalesPointId, selectedSalesPoint]);


    const getComboAllergensAndModifiers = useCallback((comboId: number, comboItems: ComboItem[]): {
        allergens: ApiAllergen[];
        modifiers: ApiModifier[];
    } => {
        const allAllergens: ApiAllergen[] = [];
        const allModifiers: ApiModifier[] = [];
        const seenAllergenIds = new Set<number>();
        const seenModifierIds = new Set<number>();

        comboItems.forEach(item => {
            // Ищем базовое блюдо
            const baseDish = filteredDishes.find(d => d.id === item.dish_id);

            if (baseDish) {

                const dishAllergens = dishAllergensItems
                    .filter(dai => dai.dish_id === baseDish.id)
                    .map(dai => {
                        const allergen = allergens.find(a => a.id === dai.allergens_id);
                        return allergen ? { ...allergen, comment: dai.comment } : null;
                    })
                    .filter(Boolean) as ApiAllergen[];

                dishAllergens.forEach(allergen => {
                    if (!seenAllergenIds.has(allergen.id)) {
                        seenAllergenIds.add(allergen.id);
                        allAllergens.push(allergen);
                    }
                });

                const dishModifiers = dishModifierItems
                    .filter(dmi => dmi.dish_id === baseDish.id)
                    .map(dmi => {
                        const modifier = modifiers.find(m => m.id === dmi.modifiers_id);
                        return modifier ? {
                            ...modifier,
                            status: dmi.status,
                            comment: dmi.comment
                        } : null;
                    })
                    .filter(Boolean) as ApiModifier[];

                dishModifiers.forEach(modifier => {
                    if (!seenModifierIds.has(modifier.id)) {
                        seenModifierIds.add(modifier.id);
                        allModifiers.push(modifier);
                    }
                });
            }
        });

        return { allergens: allAllergens, modifiers: allModifiers };
    }, [filteredDishes, dishAllergensItems, allergens, dishModifierItems, modifiers]);


    const transformApiDataToDishes = useCallback(() => {
        const currentPrices = priceDishes.filter(p => p.is_current);
        const currentComboPrices = priceCombos.filter(p => p.is_current);

        const dishes: Dish[] = filteredDishes
            .filter(dish => dish.is_active)
            .map(dish => {
                const dishPrice = currentPrices.find(p => p.dish_id === dish.id);
                const priceValue = dishPrice ? parseFloat(dishPrice.value) : parseFloat(dish.price || "0");

                const dishAllergens = dishAllergensItems
                    .filter(item => item.dish_id === dish.id)
                    .map(item => {
                        const allergen = allergens.find(a => a.id === item.allergens_id);
                        return allergen ? { ...allergen, comment: item.comment } : null;
                    })
                    .filter(Boolean) as ApiAllergen[];

                const dishModifiers = dishModifierItems
                    .filter(item => item.dish_id === dish.id)
                    .map(item => {
                        const modifier = modifiers.find(m => m.id === item.modifiers_id);
                        return modifier ? {
                            ...modifier,
                            status: item.status,
                            comment: item.comment
                        } : null;
                    })
                    .filter(Boolean) as ApiModifier[];

                return {
                    ...dish,
                    price: priceValue,
                    cost_dish: parseFloat(dish.cost_dish || "0"),
                    kcal: parseFloat(dish.kcal || "0"),
                    proteins: parseFloat(dish.proteins || "0"),
                    fats: parseFloat(dish.fats || "0"),
                    carbohydrates: parseFloat(dish.carbohydrates || "0"),
                    calculation: calculations
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
                        }),
                    allergens: dishAllergens,
                    modifiers: dishModifiers,
                    dish_modifier_items: dishModifierItems.filter(item => item.dish_id === dish.id),
                    price_history: priceDishes.filter(p => p.dish_id === dish.id),
                    is_combo: false
                };
            });

        const comboDishes: Dish[] = filteredComboMeals
            .filter(combo => combo.is_active)
            .map(combo => {
                const comboPrice = currentComboPrices.find(p => p.combo_meal_id === combo.id);
                const priceValue = comboPrice ? parseFloat(comboPrice.value) : 0;

                const comboItems: ComboItem[] = [];
                const items = comboMealItems.filter(item => item.combo_meal_id === combo.id);

                items.forEach(item => {
                    const dish = filteredDishes.find(d => d.id === item.dish_id);
                    if (dish) {
                        const dishPrice = currentPrices.find(p => p.dish_id === dish.id);
                        const dishPriceValue = dishPrice ? parseFloat(dishPrice.value) : parseFloat(dish.price || "0");

                        const dishAllergens = dishAllergensItems
                            .filter(dai => dai.dish_id === dish.id)
                            .map(dai => {
                                const allergen = allergens.find(a => a.id === dai.allergens_id);
                                return allergen ? { ...allergen, comment: dai.comment } : null;
                            })
                            .filter(Boolean) as ApiAllergen[];

                        const dishModifiers = dishModifierItems
                            .filter(dmi => dmi.dish_id === dish.id)
                            .map(dmi => {
                                const modifier = modifiers.find(m => m.id === dmi.modifiers_id);
                                return modifier ? {
                                    ...modifier,
                                    status: dmi.status,
                                    comment: dmi.comment
                                } : null;
                            })
                            .filter(Boolean) as ApiModifier[];

                        comboItems.push({
                            dish_id: dish.id,
                            dish_name: dish.name,
                            price: dishPriceValue,
                            quantity: 1,
                            included: true,
                            allergens: dishAllergens,
                            modifiers: dishModifiers
                        });
                    }
                });


                const { allergens: comboAllergens, modifiers: comboModifiers } =
                    getComboAllergensAndModifiers(combo.id, comboItems);

                return {
                    id: combo.id,
                    name: combo.name,
                    price: priceValue,
                    weight: combo.weight,
                    cost_dish: 0,
                    is_active: combo.is_active,
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
                    allergens: comboAllergens,
                    modifiers: comboModifiers,
                    dish_modifier_items: dishModifierItems.filter(item => item.dish_id === combo.id),
                    combo_price_history: priceCombos.filter(p => p.combo_meal_id === combo.id)
                };
            });

        return [...dishes, ...comboDishes];
    }, [
        filteredDishes, filteredComboMeals, products, calculations, units,
        dishAllergensItems, allergens, dishModifierItems, modifiers,
        priceDishes, priceCombos, comboMealItems, getComboAllergensAndModifiers
    ]);


    const buildCategoryHierarchy = useCallback((categories: ApiCategory[]): NestedCategory[] => {
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
    }, []);

    const distributeDishesToCategories = useCallback((
        categories: NestedCategory[],
        dishes: Dish[]
    ): NestedCategory[] => {
        const createCleanCategory = (cat: NestedCategory): NestedCategory => ({
            ...cat,
            dishes: [],
            children: cat.children.map(child => createCleanCategory(child))
        });

        const cleanCategories = categories.map(cat => createCleanCategory(cat));

        const processCategory = (category: NestedCategory): NestedCategory => {
            const categoryDishes = dishes.filter(dish =>
                dish.category_menu_id === category.id && dish.is_active
            );

            return {
                ...category,
                dishes: categoryDishes,
                children: category.children.map(child => processCategory(child))
            };
        };

        return cleanCategories.map(category => processCategory(category));
    }, []);

    useEffect(() => {
        if (filteredCategories.length > 0) {
            const dishes = transformApiDataToDishes();
            setAllDishesList(dishes);

            const categoryHierarchy = buildCategoryHierarchy(filteredCategories);
            const categoriesWithDishes = distributeDishesToCategories(categoryHierarchy, dishes);

            setCategories(categoriesWithDishes);

            if (categoriesWithDishes.length > 0 && !selectedCategory) {
                setSelectedCategory(categoriesWithDishes[0]);
                setOpenCategories(prev => ({ ...prev, [categoriesWithDishes[0].id]: true }));
            }
        }
    }, [
        filteredCategories,
        transformApiDataToDishes,
        buildCategoryHierarchy,
        distributeDishesToCategories,
        selectedCategory
    ]);

    const handleRefresh = useCallback(() => {
        dispatch(refreshMenuData(selectedSalesPointId));
    }, [dispatch, selectedSalesPointId]);

    const handleSelectCategory = useCallback((category: NestedCategory) => {
        setSelectedCategory(category);
        setSelectedDish(null);
        setSearchTerm('');
    }, []);

    const handleToggleCategory = useCallback((categoryId: number) => {
        setOpenCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    }, []);

    const handleSelectDish = useCallback((dish: Dish) => {
        setSelectedDish(dish);
    }, []);

    const currentDishes = useMemo(() => {
        if (!selectedCategory) return [];

        const getAllDishesFromCategoryAndChildren = (category: NestedCategory): Dish[] => {
            return [
                ...category.dishes,
                ...category.children.flatMap(child => getAllDishesFromCategoryAndChildren(child))
            ];
        };

        let dishes = getAllDishesFromCategoryAndChildren(selectedCategory);

        if (searchTerm) {
            dishes = dishes.filter(dish =>
                dish.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return dishes;
    }, [selectedCategory, searchTerm]);

    const stats = useMemo(() => {
        const totalDishes = allDishesList.length;
        const activeDishes = allDishesList.filter(d => d.is_active).length;
        const inactiveDishes = totalDishes - activeDishes;
        const avgPrice = totalDishes > 0
            ? allDishesList.reduce((acc, dish) => acc + dish.price, 0) / totalDishes
            : 0;

        return {
            totalDishes,
            activeDishes,
            inactiveDishes,
            avgPrice
        };
    }, [allDishesList]);

    const getComboDetails = useCallback((comboId: number) => {
        const combo = allDishesList.find(d => d.id === comboId && d.is_combo);
        if (!combo || !combo.combo_items) return null;

        // Расширяем информацию о блюдах в комбо
        const enrichedItems = combo.combo_items.map(item => {
            const baseDish = allDishesList.find(d => d.id === item.dish_id && !d.is_combo);
            return {
                ...item,
                allergens: baseDish?.allergens || [],
                modifiers: baseDish?.modifiers || [],
                weight: baseDish?.weight,
                description: baseDish?.metadate?.description
            };
        });

        return {
            ...combo,
            combo_items: enrichedItems
        };
    }, [allDishesList]);

    const getAllComboAllergens = useCallback((comboId: number): ApiAllergen[] => {
        const combo = allDishesList.find(d => d.id === comboId && d.is_combo);
        if (!combo) return [];

        return combo.allergens || [];
    }, [allDishesList]);


    const getAllComboModifiers = useCallback((comboId: number): ApiModifier[] => {
        const combo = allDishesList.find(d => d.id === comboId && d.is_combo);
        if (!combo) return [];


        return combo.modifiers || [];
    }, [allDishesList]);

    return {
        categories,
        selectedCategory,
        openCategories,
        searchTerm,
        setSearchTerm,
        selectedDish,
        setSelectedDish,
        allDishes: allDishesList,
        currentDishes,

        stats,

        loading,
        refreshing,
        error,
        usingCache,

        products,
        units,
        allergens,
        modifiers,


        handleRefresh,
        handleSelectCategory,
        handleToggleCategory,
        handleSelectDish,

        getComboDetails,
        getAllComboAllergens,
        getAllComboModifiers,

        handleAddDish: (dish: Dish) => dispatch(addDish({ dish, salesPointId: selectedSalesPointId })),
        handleUpdateDish: (dishId: number, data: any) => dispatch(updateDish({ dishId, data })),
        handleDeleteDish: (dishId: number) => dispatch(deleteDish({ dishId, salesPointId: selectedSalesPointId })),
        handleAddProductToCalculation: (dishId: number, productId: number, quantity: number, unitId: number) =>
            dispatch(addCalculation({ dishId, productId, quantity, unitId })),
        handleRemoveProductFromCalculation: (calculationId: number) =>
            dispatch(removeCalculation({ calculationId })),
        handleUpdateCalculation: (calculationId: number, updates: any) =>
            dispatch(updateCalculation({ calculationId, updates }))
    };
};




export const getExtendedDishData = (dish: any) => {
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
        modifiers: metadata.modifiers || [],
        is_combo: dish.is_combo || false,
        combo_items: dish.combo_items || [],
        metadate: metadata
    };
};

export const prepareDishForApi = (dishData: any, isCombo: boolean = false) => {
    const {
        subcategory, kitchenStation, cookTime, description,
        seasonal, popular, allergens, cookingSteps, combo_menu,
        portionWeight, markup, modifiers,
        name, price, weight, units_id, is_active, kcal, proteins, fats, carbohydrates, display_website,
        combo_items,
        ...rest
    } = dishData;

    const metadata: any = {
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

    if (isCombo) {
        return {
            name,
            weight: weight || "0",
            units_id: units_id || 1,
            is_active,
            is_combo: true,
            combo_items: combo_items || [],
            kcal: kcal?.toString() || "0",
            proteins: proteins?.toString() || "0",
            fats: fats?.toString() || "0",
            carbohydrates: carbohydrates?.toString() || "0",
            display_website,
            price: price?.toString() || "0",
            metadate: Object.keys(metadata).length > 0 ? metadata : null,
            ...rest
        };
    } else {
        return {
            name,
            price: price?.toString() || "0",
            weight: weight || "",
            units_id: units_id || 1,
            is_active,
            kcal: kcal?.toString() || "0",
            proteins: proteins?.toString() || "0",
            fats: fats?.toString() || "0",
            carbohydrates: carbohydrates?.toString() || "0",
            display_website,
            metadate: Object.keys(metadata).length > 0 ? metadata : null,
            ...rest
        };
    }
};