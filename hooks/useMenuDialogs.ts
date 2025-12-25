import {useState} from "react";
import {Dish, NewCategory, NewDish, NewSubcategory} from "../types/menu";


export const useMenuDialogs = () => {
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
    const [dishDialogOpen, setDishDialogOpen] = useState(false);
    const [editDishDialogOpen, setEditDishDialogOpen] = useState(false);
    const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);

    const [newCategory, setNewCategory] = useState<NewCategory>({ name: '' });
    const [newSubcategory, setNewSubcategory] = useState<NewSubcategory>({ name: '', categoryId: null });
    const [newDish, setNewDish] = useState<NewDish>({
        name: '',
        subcategoryId: null,
        categoryId: null,
        price: '',
        cookTime: '',
        description: '',
        ingredients: '',
        allergens: '',
        calories: '',
        available: true,
        popular: false
    });
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
    const [newProduct, setNewProduct] = useState({
        inventoryId: '',
        quantity: ''
    });

    const resetCategoryForm = () => {
        setNewCategory({ name: '' });
    };

    const resetSubcategoryForm = () => {
        setNewSubcategory({ name: '', categoryId: null });
    };

    const resetDishForm = () => {
        setNewDish({
            name: '',
            subcategoryId: null,
            categoryId: null,
            price: '',
            cookTime: '',
            description: '',
            ingredients: '',
            allergens: '',
            calories: '',
            available: true,
            popular: false
        });
    };

    const resetProductForm = () => {
        setNewProduct({
            inventoryId: '',
            quantity: ''
        });
    };

    return {
        // Dialog states
        categoryDialogOpen,
        subcategoryDialogOpen,
        dishDialogOpen,
        editDishDialogOpen,
        addProductDialogOpen,

        // Form states
        newCategory,
        newSubcategory,
        newDish,
        selectedDish,
        newProduct,

        // Dialog setters
        setCategoryDialogOpen,
        setSubcategoryDialogOpen,
        setDishDialogOpen,
        setEditDishDialogOpen,
        setAddProductDialogOpen,

        // Form setters
        setNewCategory,
        setNewSubcategory,
        setNewDish,
        setSelectedDish,
        setNewProduct,

        // Reset functions
        resetCategoryForm,
        resetSubcategoryForm,
        resetDishForm,
        resetProductForm
    };
};