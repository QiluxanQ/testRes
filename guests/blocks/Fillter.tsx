import React from 'react';

import { Search} from "lucide-react";
import {Input} from "../../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';

const Fillter = ({searchTerm,setSearchTerm,statusFilter,setStatusFilter,categoryFilter,setCategoryFilter}) => {
    return (
        <>
            <div className="flex space-x-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Поиск по имени, телефону или email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        style={{
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-inpyt)',
                            color: 'var(--custom-text)',
                        }}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48"    style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                    }}>
                        <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Все">Все статусы</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                        <SelectItem value="Премиум">Премиум</SelectItem>
                        <SelectItem value="Обычный">Обычный</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48"    style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                    }}>
                        <SelectValue placeholder="Категория" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Все">Все категории</SelectItem>
                        <SelectItem value="Новый гость">Новые гости</SelectItem>
                        <SelectItem value="Постоянный гость">Постоянные</SelectItem>
                        <SelectItem value="Корпоративный клиент">Корпоративные</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </>
    );
};

export default Fillter;