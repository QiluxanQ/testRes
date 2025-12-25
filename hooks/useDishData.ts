import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../store/store";
import {useCallback} from "react";
import {fetchAdditionalMenuData} from "../slice/menuSlice";
import {Dish} from "../types/menu";

export const useDishDataUpdater = () => {
    const dispatch = useDispatch();
    const {
        loaded,
        loading,
        allergens,
        modifiers,
        calculations,
        priceDishes,
        products,
        units,
        dishAllergensItems,
        dishModifierItems
    } = useSelector((state: RootState) => state.menu);

    const updateDishData = useCallback(async (dish: Dish): Promise<Dish> => {
        if (!loaded.additional && !loading.additional) {
            await dispatch(fetchAdditionalMenuData());
        }

        await new Promise(resolve => {
            if (loaded.additional) {
                resolve(true);
            } else {
                const interval = setInterval(() => {
                    if (loaded.additional) {
                        clearInterval(interval);
                        resolve(true);
                    }
                }, 0);
            }
        });


        const dishAllergens = dishAllergensItems
            .filter(item => item.dish_id === dish.id)
            .map(item => {
                const allergen = allergens.find(a => a.id === item.allergens_id);
                return allergen ? {
                    ...allergen,
                    comment: item.comment
                } : null;
            })
            .filter(Boolean);

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
            .filter(Boolean);

        const dishCalculations = calculations
            .filter(calc => calc.dish_id === dish.id)
            .map(calc => {
                const product = products.find(p => p.id === calc.products_id);
                const unit = units.find(u => u.id === calc.units_id);
                return {
                    id: calc.id,
                    productId: calc.products_id,
                    productName: product?.name || 'Неизвестный продукт',
                    quantity: calc.quantity || 0,
                    unit: unit?.symbol || 'ед.',
                    price: parseFloat(calc.price || "0"),
                    totalCost: (calc.quantity || 0) * parseFloat(calc.price || "0")
                };
            });

        const currentPrice = priceDishes.find(p =>
            p.dish_id === dish.id && p.is_current
        ) || { value: dish.price.toString() };

        return {
            ...dish,
            price: parseFloat(currentPrice.value),
            allergens: dishAllergens,
            modifiers: dishModifiers,
            calculation: dishCalculations,
            dish_modifier_items: dishModifierItems.filter(item => item.dish_id === dish.id),
            price_history: priceDishes.filter(p => p.dish_id === dish.id)
        };
    }, [dispatch, loaded, loading, allergens, modifiers, calculations,
        priceDishes, products, units, dishAllergensItems, dishModifierItems]);

    return updateDishData;
};