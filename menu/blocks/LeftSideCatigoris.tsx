import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "../../../ui/card";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from "../../../ui/dialog";
import {Button} from "../../../ui/button";
import {ChevronDown, ChevronRight, Plus} from "lucide-react";
import {Input} from "../../../ui/input";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "../../../ui/collapsible";
import {Badge} from "../../../ui/badge";

const LeftSideCatigoris = ({
                               categoryDialogOpen,setCategoryDialogOpen,newCategory,setNewCategory,handleAddCategory,menuData,openCategories,
                               toggleCategory,selectedSubcategoryId,setSelectedSubcategoryId,subcategoryDialogOpen,setSubcategoryDialogOpen,setNewSubcategory,newSubcategory,
                               setSelectedCategoryId,handleAddSubcategory
                           }) => {
    return (
        <div>
            <Card className="w-72 flex-shrink-0 h-fit">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-sm">Категории</CardTitle>
                        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Добавить категорию</DialogTitle>
                                    <DialogDescription>Создайте новую основную категорию меню</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Название категории</label>
                                        <Input
                                            placeholder="Название"
                                            value={newCategory.name}
                                            onChange={(e) => setNewCategory({ name: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Отмена</Button>
                                        <Button onClick={handleAddCategory}>Добавить</Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex flex-col">
                        {menuData.map((category) => (
                            <Collapsible
                                key={category.id}
                                open={openCategories[category.id]}
                                onOpenChange={() => toggleCategory(category.id)}
                            >
                                <CollapsibleTrigger className="w-full">
                                    <div className="flex items-center justify-between px-6 py-3 hover:bg-accent transition-colors">
                                        <span>{category.name}</span>
                                        {openCategories[category.id] ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                    </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    {category.subcategories.map((subcategory) => (
                                        <Button
                                            key={subcategory.id}
                                            variant={selectedSubcategoryId === subcategory.id ? 'secondary' : 'ghost'}
                                            className="w-full justify-start pl-12 py-2 rounded-none"
                                            onClick={() => {
                                                setSelectedCategoryId(category.id);
                                                setSelectedSubcategoryId(subcategory.id);
                                            }}
                                        >
                                            {subcategory.name}
                                            <Badge variant="secondary" className="ml-auto">
                                                {subcategory.dishes.length}
                                            </Badge>
                                        </Button>
                                    ))}
                                    <Dialog open={subcategoryDialogOpen} onOpenChange={setSubcategoryDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full justify-start pl-12 py-2 rounded-none text-muted-foreground"
                                                onClick={() => setNewSubcategory({ ...newSubcategory, categoryId: category.id })}
                                            >
                                                <Plus className="h-3 w-3 mr-2" />
                                                Добавить подкатегорию
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Добавить подкатегорию</DialogTitle>
                                                <DialogDescription>Создайте новую подкатегорию для текущей категории меню</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-medium">Название подкатегории</label>
                                                    <Input
                                                        placeholder="Название"
                                                        value={newSubcategory.name}
                                                        onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex justify-end space-x-2">
                                                    <Button variant="outline" onClick={() => setSubcategoryDialogOpen(false)}>Отмена</Button>
                                                    <Button onClick={handleAddSubcategory}>Добавить</Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LeftSideCatigoris;