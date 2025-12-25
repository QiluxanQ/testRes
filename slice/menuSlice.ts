import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ApiDish, ApiCategory, ApiProduct, ApiCalculation } from '../../src/types/menu';

interface MenuState {
    dishes: ApiDish[];
    filteredDishes: ApiDish[];
    categories: ApiCategory[];
    filteredCategories: ApiCategory[];
    priceDishes: any[];
    comboMeals: any[];
    filteredComboMeals: any[];
    priceCombos: any[];
    units: any[];

    products: ApiProduct[];
    calculations: ApiCalculation[];
    allergens: any[];
    dishAllergensItems: any[];
    modifiers: any[];
    dishModifierItems: any[];
    comboMealItems: any[];

    loading: {
        initial: boolean;
        additional: boolean;
        refreshing: boolean;
    };
    loaded: {
        initial: boolean;
        additional: boolean;
    };
    error: string | null;
    usingCache: boolean;
    lastUpdated: number | null;
    selectedSalesPointId: number | null;
}

const initialState: MenuState = {
    dishes: [],
    filteredDishes: [],
    categories: [],
    filteredCategories: [],
    products: [],
    calculations: [],
    priceDishes: [],
    allergens: [],
    dishAllergensItems: [],
    modifiers: [],
    dishModifierItems: [],
    comboMeals: [],
    filteredComboMeals: [],
    comboMealItems: [],
    priceCombos: [],
    units: [],

    loading: {
        initial: false,
        additional: false,
        refreshing: false
    },
    loaded: {
        initial: false,
        additional: false
    },
    error: null,
    usingCache: false,
    lastUpdated: null,
    selectedSalesPointId: null,
};

const filterDishesBySalesPoint = (dishes: ApiDish[], salesPointId: number | null) => {
    if (!salesPointId) return dishes;
    return dishes.filter(dish => dish.point_retail_id === salesPointId);
};

const filterCombosBySalesPoint = (combos: any[], salesPointId: number | null) => {
    if (!salesPointId) return combos;
    return combos.filter(combo => combo.point_retail_id === salesPointId);
};

const filterCategoriesBySalesPoint = (
    categories: ApiCategory[],
    dishes: ApiDish[],
    salesPointId: number | null
): ApiCategory[] => {
    if (!salesPointId) return categories;

    const dishesInSalesPoint = dishes.filter(dish => dish.point_retail_id === salesPointId);
    const categoryIdsFromDishes = new Set(
        dishesInSalesPoint
            .map(dish => dish.category_menu_id)
            .filter(id => id !== null && id !== undefined)
    );

    const categoriesInSalesPoint = categories.filter(cat => cat.point_retail_id === salesPointId);
    const categoryIdsFromPoint = new Set(categoriesInSalesPoint.map(cat => cat.id));

    const getAllParentCategoryIds = (categoryId: number, allCategories: ApiCategory[]): number[] => {
        const parentIds: number[] = [];
        let currentCategory = allCategories.find(c => c.id === categoryId);

        while (currentCategory && currentCategory.parent_id) {
            parentIds.push(currentCategory.parent_id);
            currentCategory = allCategories.find(c => c.id === currentCategory!.parent_id);
        }

        return parentIds;
    };

    const allCategoryIdsToShow = new Set<number>();

    categoryIdsFromPoint.forEach(categoryId => {
        allCategoryIdsToShow.add(categoryId);
    });

    categoryIdsFromDishes.forEach(categoryId => {
        allCategoryIdsToShow.add(categoryId);
    });

    Array.from(allCategoryIdsToShow).forEach(categoryId => {
        const parentIds = getAllParentCategoryIds(categoryId, categories);
        parentIds.forEach(parentId => allCategoryIdsToShow.add(parentId));
    });

    categories.forEach(category => {
        if (!category.point_retail_id) {
            allCategoryIdsToShow.add(category.id);
        }
    });

    const filteredCategories = categories.filter(category =>
        allCategoryIdsToShow.has(category.id)
    );

    return filteredCategories.sort((a, b) => a.name.localeCompare(b.name));
};

const getCurrentPrice = async (endpoint: string, id: number, isCombo: boolean = false) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const prices = await response.json();
            const currentPrice = prices.find((p: any) =>
                p.is_current &&
                (isCombo ? p.combo_meal_id === id : p.dish_id === id)
            );
            return currentPrice;
        }
        return null;
    } catch (error) {
        console.error('Ошибка получения текущей цены:');
        return null;
    }
};


const createNewPrice = async (isCombo: boolean, priceData: any) => {
    const token = localStorage.getItem('token');
    const endpoint = isCombo ? '/price-combos/' : '/price-dishes/';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(priceData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка создания цены: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Ошибка при создании цены:',);
        throw error;
    }
};


const updateExistingPrice = async (isCombo: boolean, priceId: number, priceData: any) => {
    const token = localStorage.getItem('token');
    const endpoint = isCombo ? `/price-combos/${priceId}` : `/price-dishes/${priceId}`;

    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(priceData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка обновления цены: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Ошибка при обновлении цены:', error);
        throw error;
    }
};


const fetchWithPagination = async (endpoint: string, limit = 1000) => {
    const token = localStorage.getItem('token');
    const baseUrl = '';

    let allItems: any[] = [];
    let skip = 0;
    let hasMore = true;
    let requestCount = 0;
    const maxRequests = 50;

    while (hasMore && requestCount < maxRequests) {
        requestCount++;

        try {
            const url = `${baseUrl}${endpoint}?skip=${skip}&limit=${limit}`;
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error(`Ошибка ${response.status} при загрузке ${endpoint}`);
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
            const data = await response.json();
            if (!Array.isArray(data)) {
                console.error(`Для ${endpoint} ожидался массив, получен:`, typeof data);
                break;
            }

            if (data.length === 0) {
                hasMore = false;
            } else {
                allItems = [...allItems, ...data];
                skip += limit;

                if (data.length < limit) {
                    hasMore = false;
                }
            }
        } catch (error) {
            console.error(`Ошибка при загрузке ${endpoint}:`, error);
            hasMore = false;
        }
    }

    return allItems;
};

export const fetchInitialMenuData = createAsyncThunk(
    'menu/fetchInitialMenuData',
    async (salesPointId: number | null, { rejectWithValue }) => {
        try {
            const endpoints = [
                '/dishes/',
                '/categories-menu/',
                '/price-dishes/',
                '/combo-meals/',
                '/price-combos/',
                '/units/'
            ];

            const promises = endpoints.map(endpoint => fetchWithPagination(endpoint, 1000));
            const results = await Promise.allSettled(promises);

            return {
                dishes: results[0].status === 'fulfilled' ? results[0].value : [],
                categories: results[1].status === 'fulfilled' ? results[1].value : [],
                priceDishes: results[2].status === 'fulfilled' ? results[2].value : [],
                comboMeals: results[3].status === 'fulfilled' ? results[3].value : [],
                priceCombos: results[4].status === 'fulfilled' ? results[4].value : [],
                units: results[5].status === 'fulfilled' ? results[5].value : [],
                salesPointId,
            };
        } catch (error: any) {
            console.error('Ошибка загрузки  данных:');
            return rejectWithValue(error.message);
        }
    }
);

export const fetchCalculateRefresh = createAsyncThunk(
    'menu/fetchCalculateRefresh',
    async (_, { rejectWithValue }) => {
        try {
            const endpoints = [
                '/calculation-cards/',
            ];
            const promises = endpoints.map(endpoint => fetchWithPagination(endpoint, 500));
            const results = await Promise.allSettled(promises);
            return {
                calculations: results[0].status === 'fulfilled' ? results[0].value : [],
            };
        }catch (e){
            console.log(e);
            return rejectWithValue(e.message);
        }

    }
);


export const fetchAdditionalMenuData = createAsyncThunk(
    'menu/fetchAdditionalMenuData',
    async (_, { rejectWithValue }) => {
        try {
            const endpoints = [
                '/products/',
                '/calculation-cards/',
                '/allergens/',
                '/dish-allergens-items/',
                '/modifiers/',
                '/dish-modifier-items/',
                '/combo-meal-items/'
            ];

            const promises = endpoints.map(endpoint => fetchWithPagination(endpoint, 1000));
            const results = await Promise.allSettled(promises);

            return {
                products: results[0].status === 'fulfilled' ? results[0].value : [],
                calculations: results[1].status === 'fulfilled' ? results[1].value : [],
                allergens: results[2].status === 'fulfilled' ? results[2].value : [],
                dishAllergensItems: results[3].status === 'fulfilled' ? results[3].value : [],
                modifiers: results[4].status === 'fulfilled' ? results[4].value : [],
                dishModifierItems: results[5].status === 'fulfilled' ? results[5].value : [],
                comboMealItems: results[6].status === 'fulfilled' ? results[6].value : [],
            };
        } catch (error: any) {
            console.error('Ошибка загрузки дополнительных данных:', error);
            return rejectWithValue(error.message);
        }
    }
);
export const fetcAlergenAndModifaiRefresh = createAsyncThunk(
    'menu/fetcAlergenAndModifaiRefresh',
    async (_, { rejectWithValue }) => {
        try {
            const endpoints = [
                '/allergens/',
                '/modifiers/',
                '/dish-allergens-items/',
                '/dish-modifier-items/',
            ];

            const promises = endpoints.map(endpoint => fetchWithPagination(endpoint, 500));
            const results = await Promise.allSettled(promises);
            return {
                allergens: results[0].status === 'fulfilled' ? results[0].value : [],
                modifiers: results[1].status === 'fulfilled' ? results[1].value : [],
                dishAllergensItems: results[2].status === 'fulfilled' ? results[2].value : [],
                dishModifierItems: results[3].status === 'fulfilled' ? results[3].value : [],
            };
        } catch (e: any) {
            console.log(e);
            return rejectWithValue(e.message);
        }
    }
);

export const fetchDishesAndCombosRefreshOptimized = createAsyncThunk(
    'menu/fetchDishesAndCombosRefreshOptimized',
    async (_, { rejectWithValue }) => {
    try {
        const endpoints = [
            '/dishes/',
            '/combo-meals/',
        ];
        const promises = endpoints.map(endpoint => fetchWithPagination(endpoint, 500));
        const results = await Promise.allSettled(promises);
        return {
            dishes: results[0].status === 'fulfilled' ? results[0].value : [],
            comboMeals: results[1].status === 'fulfilled' ? results[1].value : [],
        };
    }catch (e){
        console.log(e);
        return rejectWithValue(e.message);
    }

    }
);



export const refreshMenuData = createAsyncThunk(
    'menu/refreshMenuData',
    async (salesPointId: number | null, { dispatch }) => {
        dispatch(fetchInitialMenuData(salesPointId));
        dispatch(fetchAdditionalMenuData());
    }
);




export const updateDish = createAsyncThunk(
    'menu/updateDish',
    async ({ dishId, data }: { dishId: number; data: any }, { rejectWithValue, dispatch }) => {
        try {
            const token = localStorage.getItem('token');
            const isCombo = data.is_combo || false;

            const priceEndpoint = isCombo
                ? `/price-combos/?combo_meal_id=${dishId}`
                : `/price-dishes/?dish_id=${dishId}`;


            let currentPrice = null;
            try {
                const priceResponse = await fetch(priceEndpoint, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (priceResponse.ok) {
                    const prices = await priceResponse.json();
                    currentPrice = prices.find((p: any) => p.is_current);
                }
            } catch (priceError) {
                console.error('Ошибка получения цены:');
            }

            if (data.price !== undefined && data.price !== null) {
                const newPriceValue = data.price.toString();
                if (currentPrice) {
                    if (currentPrice.value !== newPriceValue) {
                        await fetch(isCombo ? `/price-combos/${currentPrice.id}` : `/price-dishes/${currentPrice.id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                ...currentPrice,
                                is_current: false
                            })
                        });

                        const priceData = {
                            [isCombo ? 'combo_meal_id' : 'dish_id']: dishId,
                            value: newPriceValue,
                            date_start: new Date().toISOString().split('T')[0],
                            is_current: true,
                            metadate: null
                        };

                        const newPriceResponse = await fetch(
                            isCombo ? '/price-combos/' : '/price-dishes/',
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify(priceData)
                            }
                        );

                        if (!newPriceResponse.ok) {
                            const errorText = await newPriceResponse.text();
                            console.error('Ошибка создания новой цены:');
                        } else {
                            const newPrice = await newPriceResponse.json();
                            console.log('Новая цена создана:');


                            dispatch(updatePriceInState({
                                isCombo,
                                id: dishId,
                                value: newPriceValue
                            }));
                        }
                    } else {
                        console.log('Цена не изменилась');
                    }
                } else {
                    console.log('Нет текущей цены');
                    const priceData = {
                        [isCombo ? 'combo_meal_id' : 'dish_id']: dishId,
                        value: newPriceValue,
                        date_start: new Date().toISOString().split('T')[0],
                        is_current: true,
                        metadate: null
                    };

                    const newPriceResponse = await fetch(
                        isCombo ? '/price-combos/' : '/price-dishes/',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify(priceData)
                        }
                    );

                    if (!newPriceResponse.ok) {
                        const errorText = await newPriceResponse.text();
                        console.error('Ошибка создания цены:', errorText);
                    } else {
                        const newPrice = await newPriceResponse.json();
                        console.log('Цена создана:', newPrice);

                        dispatch(updatePriceInState({
                            isCombo,
                            id: dishId,
                            value: newPriceValue
                        }));
                    }
                }
            }
            const dishDataWithoutPrice = { ...data };
            delete dishDataWithoutPrice.price;

            const endpoint = isCombo ? `/combo-meals/${dishId}` : `/dishes/${dishId}`;
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dishDataWithoutPrice)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error( errorText);
                throw new Error(`Ошибка ${response.status}: ${errorText}`);
            }

            const updatedDish = await response.json();
            console.log('Блюдо обновлено:');

            if (data.price !== undefined) {
                dispatch(updateDishLocally({
                    dishId,
                    data: {
                        price: parseFloat(data.price),
                        ...updatedDish
                    }
                }));
            }

            return updatedDish;
        } catch (error: any) {
            console.error('Ошибка в updateDish:', error);
            return rejectWithValue(error.message);
        }
    }
);


export const addDish = createAsyncThunk(
    'menu/addDish',
    async ({ dish, salesPointId }: { dish: any; salesPointId?: number }, { rejectWithValue, dispatch, getState }) => {
        try {
            const token = localStorage.getItem('token');
            const isCombo = dish.is_combo || false;
            const state = getState() as { menu: MenuState };
            const existingDish = state.menu.dishes.find(d =>
                d.name.toLowerCase() === dish.name.toLowerCase() &&
                d.category_menu_id === dish.category_menu_id &&
                (d.point_retail_id === salesPointId ||
                    (d.point_retail_id === null && salesPointId === null))
            );
            const existingCombo = state.menu.comboMeals.find(c =>
                c.name.toLowerCase() === dish.name.toLowerCase() &&
                c.category_menu_id === dish.category_menu_id &&
                (c.point_retail_id === salesPointId ||
                    (c.point_retail_id === null && salesPointId === null))
            );

            if (existingDish || existingCombo) {
                return rejectWithValue(`Блюдо "${dish.name}" уже существует в этой категории`);
            }
            const dishData = {
                name: dish.name.trim(),
                weight: dish.weight?.toString() || "0",
                units_id: dish.units_id?.toString() || "1",
                cost_dish: dish.cost_dish?.toString() || "0",
                is_active: dish.is_active !== false,
                kcal: dish.kcal?.toString() || "0",
                proteins: dish.proteins?.toString() || "0",
                fats: dish.fats?.toString() || "0",
                carbohydrates: dish.carbohydrates?.toString() || "0",
                display_website: dish.display_website || false,
                category_menu_id: dish.category_menu_id?.toString(),
                point_retail_id: salesPointId?.toString() || dish.point_retail_id?.toString(),
                is_combo: isCombo,
                combo_items: isCombo ? dish.combo_items || [] : undefined,
                metadate: dish.metadate || null
            };

            Object.keys(dishData).forEach(key => {
                if (dishData[key] === undefined) {
                    delete dishData[key];
                }
            });
            const endpoint = isCombo ? '/combo-meals/' : '/dishes/';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dishData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка создания блюда: ${errorText}`);
            }

            const createdDish = await response.json();
            const dishId = createdDish.id;

            if (dish.price && parseFloat(dish.price) > 0) {
                const priceData = {
                    [isCombo ? 'combo_meal_id' : 'dish_id']: dishId,
                    value: dish.price.toString(),
                    date_start: new Date().toISOString().split('T')[0],
                    is_current: true,
                    metadate: null
                };

                const priceEndpoint = isCombo ? '/price-combos/' : '/price-dishes/';
                const priceResponse = await fetch(priceEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(priceData)
                });

                if (!priceResponse.ok) {
                    console.warn('Не удалось создать цену, продолжаем...');
                }
            }

            if (dish.metadate?.allergens && Array.isArray(dish.metadate.allergens)) {
                for (const allergenId of dish.metadate.allergens) {
                    try {
                        const allergenData = {
                            dish_id: dishId,
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
                    } catch (error) {
                        console.error('Ошибка добавления аллергена:', error);
                    }
                }
            }
            if (dish.metadate?.modifiers && Array.isArray(dish.metadate.modifiers)) {
                for (const modifier of dish.metadate.modifiers) {
                    try {
                        const modifierData = {
                            dish_id: dishId,
                            modifiers_id: modifier.modifiers_id || modifier.id,
                            status: modifier.status || 'available',
                            comment: modifier.comment || null,
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
                    } catch (error) {
                        console.error('Ошибка добавления модификатора:', error);
                    }
                }
            }
            if (!isCombo && dish.calculation && Array.isArray(dish.calculation) && dish.calculation.length > 0) {
                for (const calcItem of dish.calculation) {
                    try {
                        const unit = state.menu.units.find(u => u.symbol === calcItem.unit);
                        const calculationData = {
                            dish_id: dishId,
                            products_id: calcItem.productId,
                            quantity: calcItem.quantity,
                            units_id: unit?.id || 1,
                            weight_loss: "0",
                            output_weight: "0",
                            price: calcItem.price?.toString() || "0",
                            metadate: null
                        };

                        await fetch('/calculation-cards/', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(calculationData)
                        });
                    } catch (error) {
                        console.error('Ошибка добавления расчета:');
                    }
                }
            }

            if (isCombo && dish.combo_items && Array.isArray(dish.combo_items) && dish.combo_items.length > 0) {
                for (const item of dish.combo_items) {
                    try {
                        const comboItemData = {
                            combo_meal_id: dishId,
                            dish_id: item.dish_id,
                            weight: "0",
                            metadate: null
                        };

                        await fetch('/combo-meal-items/', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(comboItemData)
                        });
                    } catch (error) {
                        console.error('Ошибка добавления состава комбо:', error);
                    }
                }
            }

            const fullDish = {
                ...createdDish,
                price: parseFloat(dish.price || "0"),
                cost_dish: parseFloat(dish.cost_dish || "0"),
                is_active: true,
                calculation: dish.calculation || [],
                allergens: [],
                modifiers: [],
                combo_items: dish.combo_items || [],
                metadate: dish.metadate || {}
            };
            if (isCombo) {
                dispatch({
                    type: 'menu/addComboLocally',
                    payload: { dish: fullDish, salesPointId }
                });
            } else {
                dispatch({
                    type: 'menu/addDishLocally',
                    payload: { dish: fullDish, salesPointId }
                });
            }
            return {
                dish: fullDish,
                salesPointId
            };
        } catch (error: any) {
            console.error('Ошибка в addDish:', error);

            let errorMessage = error.message || 'Неизвестная ошибка';
            if (errorMessage.includes('duplicate key')) {
                errorMessage = 'Блюдо названием уже существует';
            }
            return rejectWithValue(errorMessage);
        }
    }
);


export const deleteDish = createAsyncThunk(
    'menu/deleteDish',
    async ({ dishId, salesPointId }: { dishId: number; salesPointId?: number }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const dishResponse = await fetch(`/dishes/${dishId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (dishResponse.ok) {
                const response = await fetch(`/dishes/${dishId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ is_active: false })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Ошибка ${response.status}: ${errorText}`);
                }
                return { dishId, salesPointId };
            } else {
                const comboResponse = await fetch(`/combo-meals/${dishId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ is_active: false })
                });
                if (!comboResponse.ok) {
                    const errorText = await comboResponse.text();
                    throw new Error(`Ошибка ${response.status}: ${errorText}`);
                }

                return { dishId, salesPointId };
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const addCalculation = createAsyncThunk(
    'menu/addCalculation',
    async ({ dishId, productId, quantity, unitId }: {
        dishId: number;
        productId: number;
        quantity: number;
        unitId: number
    }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const productResponse = await fetch(`/products/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!productResponse.ok) {
                throw new Error('Продукт не найден');
            }
            const product = await productResponse.json();
            const calculationData = {
                dish_id: dishId,
                products_id: productId,
                quantity: quantity,
                units_id: unitId,
                weight_loss: "0",
                output_weight: "0",
                price: product.purchase_price || "0"
            };
            const response = await fetch('/calculation-cards/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(calculationData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка ${response.status}: ${errorText}`);
            }
            return await response.json();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeCalculation = createAsyncThunk(
    'menu/removeCalculation',
    async ({ calculationId }: { calculationId: number }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/calculation-cards/${calculationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка ${response.status}: ${errorText}`);
            }
            return { calculationId };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
export const loadAdditionalData = createAsyncThunk(
    'menu/loadAdditionalData',
    async (_, { dispatch, getState }) => {
        const state = getState() as { menu: MenuState };

        if (!state.menu.loaded.additional && !state.menu.loading.additional) {
            await dispatch(fetchAdditionalMenuData()).unwrap();
        }
    }
);


export const updateCalculation = createAsyncThunk(
    'menu/updateCalculation',
    async ({ calculationId, updates }: {
        calculationId: number;
        updates: { productId?: number; quantity?: number; unitId?: number }
    }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');

            const currentResponse = await fetch(`/calculation-cards/${calculationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!currentResponse.ok) {
                throw new Error('Расчет не найден');
            }
            const currentCalculation = await currentResponse.json();

            const updatedData = {
                ...currentCalculation,
                products_id: updates.productId !== undefined ? updates.productId : currentCalculation.products_id,
                quantity: updates.quantity !== undefined ? updates.quantity : currentCalculation.quantity,
                units_id: updates.unitId !== undefined ? updates.unitId : currentCalculation.units_id
            };
            const response = await fetch(`/calculation-cards/${calculationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка ${response.status}: ${errorText}`);
            }

            return await response.json();
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const menuSlice = createSlice({
    name: 'menu',
    initialState,
    reducers: {
        setSelectedSalesPoint: (state, action: PayloadAction<number | null>) => {
            state.selectedSalesPointId = action.payload;

            if (state.selectedSalesPointId) {
                state.filteredDishes = filterDishesBySalesPoint(state.dishes, state.selectedSalesPointId);
                state.filteredComboMeals = filterCombosBySalesPoint(state.comboMeals, state.selectedSalesPointId);
                state.filteredCategories = filterCategoriesBySalesPoint(
                    state.categories,
                    state.filteredDishes,
                    state.selectedSalesPointId
                );
            } else {
                state.filteredDishes = state.dishes;
                state.filteredComboMeals = state.comboMeals;
                state.filteredCategories = state.categories;
            }
        },
        clearError: (state) => {
            state.error = null;
        },

        updateDishAllergensLocally: (state, action: PayloadAction<{
            dishId: number;
            allergenId: number;
            comment: string | null;
        }>) => {
            const { dishId, allergenId, comment } = action.payload;
            const existingIndex = state.dishAllergensItems.findIndex(
                item => item.dish_id === dishId && item.allergens_id === allergenId
            );

            if (existingIndex !== -1) {
                state.dishAllergensItems[existingIndex].comment = comment;
            } else {

                state.dishAllergensItems.push({
                    id: Date.now(),
                    dish_id: dishId,
                    allergens_id: allergenId,
                    comment: comment,
                    metadate: null
                });
            }
        },

        updateDishLocally: (state, action: PayloadAction<{ dishId: number; data: Partial<ApiDish> }>) => {
            const { dishId, data } = action.payload;
            const dishIndex = state.dishes.findIndex(d => d.id === dishId);
            if (dishIndex !== -1) {
                state.dishes[dishIndex] = { ...state.dishes[dishIndex], ...data };
            }
            const comboIndex = state.comboMeals.findIndex(c => c.id === dishId);
            if (comboIndex !== -1) {
                state.comboMeals[comboIndex] = { ...state.comboMeals[comboIndex], ...data };
            }

            const filteredIndex = state.filteredDishes.findIndex(d => d.id === dishId);
            if (filteredIndex !== -1) {
                state.filteredDishes[filteredIndex] = { ...state.filteredDishes[filteredIndex], ...data };
            }

            const filteredComboIndex = state.filteredComboMeals.findIndex(c => c.id === dishId);
            if (filteredComboIndex !== -1) {
                state.filteredComboMeals[filteredComboIndex] = { ...state.filteredComboMeals[filteredComboIndex], ...data };
            }
        },
        updateComboLocally: (state, action: PayloadAction<{ comboId: number; data: any }>) => {
            const { comboId, data } = action.payload;
            const comboIndex = state.comboMeals.findIndex(c => c.id === comboId);
            if (comboIndex !== -1) {
                state.comboMeals[comboIndex] = {
                    ...state.comboMeals[comboIndex],
                    ...data
                };
                if (data.combo_items) {
                    state.comboMealItems = state.comboMealItems.filter(
                        item => item.combo_meal_id !== comboId
                    );
                    data.combo_items.forEach((comboItem: any) => {
                        state.comboMealItems.push({
                            id: Date.now(), // временный ID
                            combo_meal_id: comboId,
                            dish_id: comboItem.dish_id,
                            weight: "0",
                            metadate: null
                        });
                    });
                }

                const filteredIndex = state.filteredComboMeals.findIndex(c => c.id === comboId);
                if (filteredIndex !== -1) {
                    state.filteredComboMeals[filteredIndex] = {
                        ...state.filteredComboMeals[filteredIndex],
                        ...data
                    };
                }
            }
        },
        clearCache: (state) => {
            state.dishes = [];
            state.filteredDishes = [];
            state.categories = [];
            state.filteredCategories = [];
            state.products = [];
            state.calculations = [];
            state.priceDishes = [];
            state.allergens = [];
            state.dishAllergensItems = [];
            state.modifiers = [];
            state.dishModifierItems = [];
            state.comboMeals = [];
            state.filteredComboMeals = [];
            state.comboMealItems = [];
            state.priceCombos = [];
            state.units = [];

            state.loaded.initial = false;
            state.loaded.additional = false;
            state.lastUpdated = null;
            state.usingCache = false;
        },
        updatePriceInState: (state, action: PayloadAction<{
            isCombo: boolean;
            id: number;
            value: string
        }>) => {
            const { isCombo, id, value } = action.payload;
            if (isCombo) {
                const priceIndex = state.priceCombos.findIndex(p =>
                    p.combo_meal_id === id && p.is_current
                );
                if (priceIndex !== -1) {
                    state.priceCombos[priceIndex].value = value;
                }
            } else {
                const priceIndex = state.priceDishes.findIndex(p =>
                    p.dish_id === id && p.is_current
                );
                if (priceIndex !== -1) {
                    state.priceDishes[priceIndex].value = value;
                }
            }
        },

        loadAdditionalDataIfNeeded: (state) => {
            if (!state.loaded.additional && !state.loading.additional) {
                state.loading.additional = true;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInitialMenuData.pending, (state) => {
                state.loading.initial = true;
                state.error = null;
            })
            .addCase(fetchInitialMenuData.fulfilled, (state, action) => {
                const {
                    dishes,
                    categories,
                    priceDishes,
                    comboMeals,
                    priceCombos,
                    units,
                    salesPointId
                } = action.payload;

                state.dishes = dishes;
                state.categories = categories;
                state.priceDishes = priceDishes;
                state.comboMeals = comboMeals;
                state.priceCombos = priceCombos;
                state.units = units;
                state.selectedSalesPointId = salesPointId;

                state.filteredDishes = filterDishesBySalesPoint(dishes, salesPointId);
                state.filteredComboMeals = filterCombosBySalesPoint(comboMeals, salesPointId);
                state.filteredCategories = filterCategoriesBySalesPoint(
                    categories,
                    state.filteredDishes,
                    salesPointId
                );

                state.loading.initial = false;
                state.loaded.initial = true;
                state.lastUpdated = Date.now();
                state.usingCache = false;
            })
            .addCase(fetchInitialMenuData.rejected, (state, action) => {
                state.loading.initial = false;
                state.error = action.payload as string;
            })

            .addCase(fetchAdditionalMenuData.pending, (state) => {
                state.loading.additional = true;
                state.error = null;
            })
            .addCase(fetchAdditionalMenuData.fulfilled, (state, action) => {
                const {
                    products,
                    calculations,
                    allergens,
                    dishAllergensItems,
                    modifiers,
                    dishModifierItems,
                    comboMealItems
                } = action.payload;

                state.products = products;
                state.calculations = calculations;
                state.allergens = allergens;
                state.dishAllergensItems = dishAllergensItems;
                state.modifiers = modifiers;
                state.dishModifierItems = dishModifierItems;
                state.comboMealItems = comboMealItems;

                state.loading.additional = false;
                state.loaded.additional = true;
                state.lastUpdated = Date.now();
            })
            .addCase(fetchAdditionalMenuData.rejected, (state, action) => {
                state.loading.additional = false;
                state.error = action.payload as string;
            })

            .addCase(fetchCalculateRefresh.pending, (state, action) => {
                state.loading.refreshing = true;
                state.error = null;
            })
            .addCase(fetchCalculateRefresh.fulfilled, (state, action) => {
                state.calculations = action.payload.calculations || state.calculations;
                state.loading.refreshing = false;
            })
            .addCase(fetchCalculateRefresh.rejected, (state, action) => {
                state.loading.refreshing = false;
                state.error = action.payload as string;
            })

            .addCase(fetchDishesAndCombosRefreshOptimized.pending, (state) => {
                state.loading.refreshing = true;
                state.error = null;
            })
            .addCase(fetchDishesAndCombosRefreshOptimized.fulfilled, (state, action) => {
                const { dishes, comboMeals } = action.payload;

                if (dishes && Array.isArray(dishes)) {
                    state.dishes = dishes;
                    state.filteredDishes = filterDishesBySalesPoint(dishes, state.selectedSalesPointId);
                }
                if (comboMeals && Array.isArray(comboMeals)) {
                    state.comboMeals = comboMeals;
                    state.filteredComboMeals = filterCombosBySalesPoint(comboMeals, state.selectedSalesPointId);
                }
                state.loading.refreshing = false;
                state.lastUpdated = Date.now();
            })
            .addCase(fetchDishesAndCombosRefreshOptimized.rejected, (state, action) => {
                state.loading.refreshing = false;
                state.error = action.payload as string || action.error?.message;

            })
            .addCase(fetcAlergenAndModifaiRefresh.pending, (state) => {
                state.loading.refreshing = true;
            })
            .addCase(fetcAlergenAndModifaiRefresh.fulfilled, (state, action) => {
                state.allergens = action.payload.allergens || state.allergens;
                state.modifiers = action.payload.modifiers || state.modifiers;
                state.dishAllergensItems = action.payload.dishAllergensItems || state.dishAllergensItems;
                state.dishModifierItems = action.payload.dishModifierItems || state.dishModifierItems;
                state.loading.refreshing = false;
            })

            .addCase(refreshMenuData.pending, (state) => {
                state.loading.refreshing = true;
            })
            .addCase(refreshMenuData.fulfilled, (state) => {
                state.loading.refreshing = false;
            })


            .addCase(updateDish.fulfilled, (state, action) => {
                console.log('Блюдо успешно обновлено:', action.payload);
            })
            .addCase(addDish.fulfilled, (state, action) => {
                const { dish, salesPointId } = action.payload;

                if (dish.is_combo) {
                    // Добавляем в comboMeals
                    const comboExists = state.comboMeals.some(c => c.id === dish.id);
                    if (!comboExists) {
                        state.comboMeals.push(dish);
                    }

                    const shouldShowInFiltered =
                        !salesPointId ||
                        salesPointId === state.selectedSalesPointId ||
                        dish.point_retail_id === state.selectedSalesPointId;

                    if (shouldShowInFiltered) {
                        const filteredComboExists = state.filteredComboMeals.some(c => c.id === dish.id);
                        if (!filteredComboExists) {
                            state.filteredComboMeals.push(dish);

                        }
                    }
                } else {
                    const dishExists = state.dishes.some(d => d.id === dish.id);
                    if (!dishExists) {
                        state.dishes.push(dish);

                    }

                    const shouldShowInFiltered =
                        !salesPointId ||
                        salesPointId === state.selectedSalesPointId ||
                        dish.point_retail_id === state.selectedSalesPointId;

                    if (shouldShowInFiltered) {
                        const filteredDishExists = state.filteredDishes.some(d => d.id === dish.id);
                        if (!filteredDishExists) {
                            state.filteredDishes.push(dish);

                        }
                    }
                }
                if (dish.category_menu_id && !state.filteredCategories.some(cat => cat.id === dish.category_menu_id)) {
                    const category = state.categories.find(cat => cat.id === dish.category_menu_id);
                    if (category) {
                        state.filteredCategories.push(category);
                        state.filteredCategories.sort((a, b) => a.name.localeCompare(b.name));
                    }
                }
                if (dish.price !== undefined) {
                    if (dish.is_combo) {
                        const priceExists = state.priceCombos.some(p =>
                            p.combo_meal_id === dish.id && p.is_current
                        );
                        if (!priceExists) {
                            state.priceCombos.push({
                                id: Date.now(),
                                combo_meal_id: dish.id,
                                value: dish.price.toString(),
                                date_start: new Date().toISOString().split('T')[0],
                                is_current: true,
                                metadate: null
                            });
                        }
                    } else {
                        const priceExists = state.priceDishes.some(p =>
                            p.dish_id === dish.id && p.is_current
                        );
                        if (!priceExists) {
                            state.priceDishes.push({
                                id: Date.now(),
                                dish_id: dish.id,
                                value: dish.price.toString(),
                                date_start: new Date().toISOString().split('T')[0],
                                is_current: true,
                                metadate: null
                            });
                        }
                    }
                }
            })
            .addCase(deleteDish.fulfilled, (state, action) => {
                const { dishId, salesPointId } = action.payload;

                const dishIndex = state.dishes.findIndex(d => d.id === dishId);
                if (dishIndex !== -1) {
                    state.dishes[dishIndex].is_active = false;

                    const filteredIndex = state.filteredDishes.findIndex(d => d.id === dishId);
                    if (filteredIndex !== -1) {
                        state.filteredDishes[filteredIndex].is_active = false;
                    }
                } else {
                    const comboIndex = state.comboMeals.findIndex(c => c.id === dishId);
                    if (comboIndex !== -1) {
                        state.comboMeals[comboIndex].is_active = false;

                        const filteredComboIndex = state.filteredComboMeals.findIndex(c => c.id === dishId);
                        if (filteredComboIndex !== -1) {
                            state.filteredComboMeals[filteredComboIndex].is_active = false;
                        }
                    }
                }
            })
            .addCase(addCalculation.fulfilled, (state, action) => {
                state.calculations.push(action.payload);
            })
            .addCase(removeCalculation.fulfilled, (state, action) => {
                const { calculationId } = action.payload;
                state.calculations = state.calculations.filter(c => c.id !== calculationId);
            })
            .addCase(updateCalculation.fulfilled, (state, action) => {
                const updatedCalculation = action.payload;
                const index = state.calculations.findIndex(c => c.id === updatedCalculation.id);
                if (index !== -1) {
                    state.calculations[index] = updatedCalculation;
                }
            })
            .addCase(loadAdditionalData.pending, (state) => {
            state.loading.additional = true;
             })
            .addCase(loadAdditionalData.fulfilled, (state) => {
                state.loading.additional = false;
                state.loaded.additional = true;
            })
            .addCase(loadAdditionalData.rejected, (state, action) => {
                state.loading.additional = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setSelectedSalesPoint,
    clearError,
    updateDishLocally,
    updateComboLocally,
    clearCache,
    updatePriceInState,
    loadAdditionalDataIfNeeded
} = menuSlice.actions;
export default menuSlice.reducer;