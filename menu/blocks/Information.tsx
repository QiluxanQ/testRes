import React from 'react';

const Information = ({fullPageDish}) => {
    return (
        <div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">Название</p>
                    <p>{fullPageDish.name}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Цена</p>
                    <p>₽{fullPageDish.price}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Время приготовления</p>
                    <p>{fullPageDish.cookTime} мин</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Калории</p>
                    <p>{fullPageDish.calories} ккал</p>
                </div>
            </div>
        </div>
    );
};

export default Information;