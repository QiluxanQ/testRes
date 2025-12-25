export interface Dish {
    id: number;
    name: string;
    price: number;
    cookTime: number;
    calories: number;
    description: string;
    ingredients: string[];
    allergens: string[];
    available: boolean;
    popular: boolean;
    calculation: ProductCalculation[];
}

export interface Subcategory {
    id: number;
    name: string;
    dishes: Dish[];
}

export interface Category {
    id: number;
    name: string;
    subcategories: Subcategory[];
}

export interface NewCategory {
    name: string;
}

export interface NewSubcategory {
    name: string;
    categoryId: number | null;
}

export interface NewDish {
    name: string;
    subcategoryId: number | null;
    categoryId: number | null;
    price: string;
    cookTime: string;
    description: string;
    ingredients: string;
    allergens: string;
    calories: string;
    available: boolean;
    popular: false;
}

export interface ProductCalculation {
    inventoryId: string;
    quantity: string;
}

export interface MenuStats {
    totalDishes: number;
    popularDishes: number;
    unavailableDishes: number;
    avgPrice: number;
}


export interface DishMetadata {
    subcategory?: string;
    kitchenStation?: string;
    cookTime?: number;
    description?: string;
    seasonal?: boolean;
    popular?: boolean;
    allergens?: string[];
    cookingSteps?: string[];
    portionWeight?: number;
    markup?: number;
    modifiers?: DishModifier[];
    [key: string]: any;
}
export interface DishModifier {
    id: number;
    name: string;
    type: 'required' | 'optional';
    options: string[];
    minSelection?: number;
    maxSelection?: number;
}
export interface Dish {
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
    modifiers?: (ApiModifier & { status?: string; comment?: string })[];
    dish_modifier_items?: ApiDishModifierItem[];
    combo_price_history?: ApiPriceCombo[];
    units_id?: number;
    point_retail_id?: number;
}
export interface Calculation {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    unit: string;
    price: number;
    totalCost: number;
}
export interface ComboItem {
    dish_id: number;
    dish_name: string;
    price: number;
    quantity: number;
    included: boolean;
    dish?: Dish; // Добавлено: полное блюдо с аллергенами и модификаторами
}
export interface NestedCategory {
    id: number;
    name: string;
    parent_id: number | null;
    level: number;
    children: NestedCategory[];
    dishes: Dish[];
    isOpen?: boolean;
}
