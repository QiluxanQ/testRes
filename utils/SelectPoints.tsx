import React from 'react';
import {
    Home,
    ShoppingCart,
    Users,
    Truck,
    Warehouse,
    ChefHat,
    UserCheck,
    Utensils,
    Calendar,
    BarChart3,
    DollarSign,
    Settings,
    Clock,
    MapPin,
    Wine,
    TrendingUp,
    BookOpen,
    Wrench,
    X,
    ChevronDown,
    ChevronRight, Search
} from 'lucide-react';
import {Input} from "../components/ui/input";
const SelectPoints = ({setShowSalesPointModal,setSelectPoint,selectPoint,selectedSalesPoint,salesPoints,handleSalesPointChange}) => {

    const fillterPoint = salesPoints.filter(point => {
        const matchesSearch =
            !salesPoints || point.name?.toLowerCase().includes(selectPoint.toLowerCase())||
            point.address?.toLowerCase().includes(selectPoint.toLowerCase())
             return matchesSearch
    })

    return (
        <div>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
                    style={{
                        borderRadius: '20px',
                        border: 'var(--custom-border-primary)',
                        background: 'rgba(var(--custom-bg-point-rgb), 0.8)',
                        color: 'white',
                        backdropFilter: 'blur(12px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    }}
                >
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <div className='flex-col items-center space-y-3   '>
                                    <h2 className="text-xl font-bold text-white/80">Выбор точки продаж</h2>
                                    <p className="text-white/80 text-sm">Выберите рабочую точку</p>
                                    <div className="relative flex-1">
                                        <Input className='' type='text' placeholder='Введите названия точки'
                                               onChange={(e) => setSelectPoint(e.target.value)} value={selectPoint}    style={{
                                            border: 'var(--custom-border-primary)',

                                            color: 'black',
                                        }}  />
                                    </div>

                                </div>
                            </div>
                            <button
                                onClick={() => setShowSalesPointModal(false)}
                                className="text-white/80 hover:text-white transition-colors cursor-pointer hover:text-red-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 max-h-96 overflow-y-auto">
                        <div className="space-y-3">
                            {fillterPoint.map((point) => (
                                <div
                                    key={point.id}
                                    onClick={() => handleSalesPointChange(point)}
                                    className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
                                        selectedSalesPoint?.id === point.id
                                            ? 'bg-blue-60 border-blue-200 shadow-md'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                                    style={{
                                        borderRadius: '20px',
                                        border: 'var(--custom-border-primary)',
                                        background: 'var(--custom-bg-secondaryLineCard)',
                                        color: 'white',
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-semibold text-lg ${
                                                selectedSalesPoint?.id === point.id ? 'text-blue-600' : 'text-gray-900'
                                            }`}>
                                                {point.name}
                                            </h4>
                                            <p className="text-gray-600 mt-1 text-sm">
                                                {point.address}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedSalesPoint?.id === point.id
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-gray-800'
                      }`}>
                        {point.type}
                      </span>
                                                {point.metadate?.is_24h && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          24/7
                        </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`flex-shrink-0 ml-4 ${
                                            selectedSalesPoint?.id === point.id
                                                ? 'text-blue-600'
                                                : 'text-red-400 group-hover:text-gray-600'
                                        }`} >
                                            {selectedSalesPoint?.id === point.id ? (
                                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center" >
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 border-2  border-current rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-current rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className=" px-6 py-4 border-t border-gray-200" >
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span style={{color:'var(--custom-text)'}} className='text-white'>Всего точек: {salesPoints.length}</span>
                            <button
                                onClick={() => setShowSalesPointModal(false)}
                                className="text-gray-500 hover:text-red-700 font-medium cursor-pointer"
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectPoints;