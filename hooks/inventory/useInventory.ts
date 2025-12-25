import {Category, Price} from "../../types/inventory";
import {useCallback, useState} from "react";


export const UseInventory = () => {


    const buildCategoryTree = (categories: Category[]) => {
        const categoryMap = new Map();
        const rootCategories: any[] = [];

        categories.forEach(category => {
            categoryMap.set(category.id, {
                ...category,
                children: [],
                level: 0
            });
        });

        categories.forEach(category => {
            const categoryNode = categoryMap.get(category.id);
            if (category.parent_id === null) {
                rootCategories.push(categoryNode);
            } else {
                const parent = categoryMap.get(category.parent_id);
                if (parent) {
                    categoryNode.level = parent.level + 1;
                    parent.children.push(categoryNode);
                } else {
                    rootCategories.push(categoryNode);
                }
            }
        });

        const sortCategories = (cats: any[]) => {
            return cats.sort((a, b) => a.name.localeCompare(b.name)).map(cat => ({
                ...cat,
                children: sortCategories(cat.children)
            }));
        };

        return sortCategories(rootCategories);
    };

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
    const getStockLevel = (current: number) => {
        const max = 100;
        return Math.min((current / max) * 100, 100);
    };
    const formatDateWithoutTimezone = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    return {buildCategoryTree,
        getCurrentPrice,
        getStockLevel,formatDateWithoutTimezone }
}