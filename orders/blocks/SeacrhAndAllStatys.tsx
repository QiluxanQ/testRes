import React from 'react';
import { Search, Calendar } from "lucide-react";
import { Input } from "../../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";

const SeacrhAndAllStatys = ({
                                searchTerm,
                                setSearchTerm,
                                statusFilter,
                                setStatusFilter,
                                dateSort,
                                setDateSort,
                                dateRange,
                                setDateRange
                            }) => {
    return (
        <div>
            <div className="flex space-x-4 items-center">
                {/* Поле поиска */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"

                    />
                    <Input
                        style={{
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-inpyt)',
                            color: 'var(--custom-text)',
                        }}
                        placeholder="Поиск по номеру, гостю или столу..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Фильтр по статусу */}
                <Select value={statusFilter} onValueChange={setStatusFilter} >
                    <SelectTrigger className="w-48 text-white" style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                    }}>
                        <SelectValue placeholder="Фильтр по статусу" />
                    </SelectTrigger>
                    <SelectContent  >
                        <SelectItem  value="all">Все статусы</SelectItem>
                        <SelectItem value="новый">Новые</SelectItem>
                        <SelectItem value="готовится">Готовятся</SelectItem>
                        <SelectItem value="готов">Готовые</SelectItem>
                        <SelectItem value="доставляется">Доставляются</SelectItem>
                        <SelectItem value="выполнен">Выполненные</SelectItem>
                    </SelectContent>
                </Select>

                {/* Сортировка по дате */}
                <Select value={dateSort} onValueChange={setDateSort}>
                    <SelectTrigger className="w-48 text-white" style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                    }}>
                        <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Сортировка по дате" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Сначала новые</SelectItem>
                        <SelectItem value="oldest">Сначала старые</SelectItem>
                        <SelectItem value="none">Без сортировки</SelectItem>
                    </SelectContent>
                </Select>
            </div>


            <div className="flex items-center gap-4" style={{paddingTop:'10px'}}>
                <div className="relative">
                    <Input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        className="text-xs h-8 w-32 text-white"
                        style={{
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-inpyt)',
                            color: 'var(--custom-text)',
                        }}
                        placeholder="с"
                    />
                </div>

                <span className="text-xs text-gray-400">-</span>

                <div className="relative">
                    <Input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        className="text-xs h-8 w-32 text-white"
                        placeholder="по"
                        style={{
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-inpyt)',
                            color: 'var(--custom-text)',
                        }}
                    />
                </div>

                {(dateRange.from || dateRange.to) && (
                    <button
                        onClick={() => setDateRange({ from: '', to: '' })}
                        className="px-2 text-xs h-8 w-32 hover:text-red-500 text-white"
                        title="Сбросить"
                        style={{
                            borderRadius: '5px',
                            border: '1px solid #334155',
                            background: '#0f172a'
                        }}
                    >
                        Сбросить
                    </button>
                )}
            </div>
        </div>
    );
};

export default SeacrhAndAllStatys;