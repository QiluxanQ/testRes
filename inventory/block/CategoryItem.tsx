import React, {useCallback, useMemo} from 'react';
import {Button} from "../../../ui/button";
import {ChevronDown, ChevronRight, Folder, Trash2} from "lucide-react";
import {Badge} from "../../../ui/badge";

const CategoryItem =React.memo( ({category, selectedCategory, onSelect, onDelete, inventoryItems, expandedCategories, onToggleExpand,
                                     allCategories, showAllItems = false}) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const itemCount = inventoryItems[category.id]?.length || 0;

    const getCategoryPath = (categoryId: number): string => {
        const path: string[] = [];
        let current = allCategories.find(c => c.id === categoryId);

        while (current) {
            path.unshift(current.name);
            current = allCategories.find(c => c.id === current!.parent_id);
        }

        return path.join(' → ') || 'Корневая категория';
    };

    const countAllItems = useCallback((cat: any): number => {
        let count = inventoryItems[cat.id]?.length || 0;

        if (cat.children) {
            cat.children.forEach((child: any) => {
                count += countAllItems(child);
            });
        }

        return count;
    }, [inventoryItems]);

    const totalItemsInCategory = useMemo(() => {
        if (showAllItems) {
            return countAllItems(category);
        }
        return itemCount;
    }, [category, showAllItems, countAllItems, itemCount]);


    return (
        <div>
            <div
                className={`p-3 rounded-lg cursor-pointer transition-all group ${
                    selectedCategory === category.id
                        ? 'hover:bg-green-700 border border-orange-200'
                        : 'hover:bg-gray-100 border border-transparent'
                }`}
                onClick={() => onSelect(category.id)}
                style={{ marginLeft: `${category.level * 16}px` }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                        {hasChildren ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-gray-200"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleExpand(category.id);
                                }}
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </Button>
                        ) : (
                            <div className="w-6" />
                        )}

                        <Folder
                            style={{color:'var(--custom-text)'}} className={`h-4 w-4 ${selectedCategory === category.id ? 'text-orange-600' : 'text-white'}`} />

                        <div className="flex-1 min-w-0">
                            <div style={{color:'var(--custom-text)'}} className="font-medium truncate text-white">{category.name}</div>
                            <div className="text-xs text-muted-foreground truncate" title={getCategoryPath(category.id)}>
                                {getCategoryPath(category.id)}
                            </div>
                            {showAllItems && hasChildren && (
                                <div className="text-xs text-blue-600 mt-1">
                                    Включая {category.children.length} подкатегорий
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                            {totalItemsInCategory}
                        </Badge>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(category.id);
                            }}
                        >
                            <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                    </div>
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div className="space-y-1">
                    {category.children.map((child: any) => (
                        <CategoryItem
                            key={child.id}
                            category={child}
                            selectedCategory={selectedCategory}
                            onSelect={onSelect}
                            onDelete={onDelete}
                            inventoryItems={inventoryItems}
                            expandedCategories={expandedCategories}
                            onToggleExpand={onToggleExpand}
                            allCategories={allCategories}
                            showAllItems={showAllItems}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});
CategoryItem.displayName = 'CategoryItem';
export default CategoryItem;