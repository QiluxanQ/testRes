import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Plus, Users, Clock, MapPin, Edit, Trash2, Eye, CheckCircle, Receipt, Calendar, Utensils, Grid, List, Move, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';


interface OrderTable {
  id: number;
  order_id: number;
  table_id: number;
  status: string;
  comment: string;
  metadate: any;
}

interface Order {
  id: number;
  transaction_id: string;
  change_id: number;
  guest_id: number | null;
  user_id_open: number;
  user_id_close: number;
  count_positions: number;
  amount: string;
  status: string;
  number_fiscal_document: string | null;
  service_fee: string;
  discount: string | null;
  NDS: string | null;
  date_open: string;
  date_close: string;
  order_type: string;
  display_website: boolean;
  metadate: any;
}

interface OrderPosition {
  id: number;
  order_id: number;
  dish_id: number;
  quantity: number;
  price: string;
  amount: string;
  status: string;
  metadate: any;
}

interface Dish {
  id: number;
  name: string;
  price: string;
  weight: string;
  point_retail_id?: number;
}

interface Table {
  id: number;
  point_retail_id: number;
  hall_id: number;
  name: string;
  count_seats: number;
  position: number;
  position_x: number;
  position_y: number;
  status: string;
  metadate: any;
}

interface Hall {
  id: number;
  point_retail_id: number;
  name: string;
  width?: number;
  height?: number;
  background_image?: string;
}

interface Guest {
  id: number;
  point_retail_id: number;
  full_name: string;
  phone: string;
  email: string;
}

interface Employee {
  id: number;
  point_retail_id: number;
  fullname: string;
  phone: string;
}

interface SalesPoint {
  id: number;
  name: string;
  address?: string;
}

interface TablesProps {
  selectedSalesPoint?: SalesPoint | null;
}

const CACHE_KEYS = {
  HALLS: 'tables_halls_cache',
  TABLES: 'tables_tables_cache',
  ORDER_TABLES: 'tables_order_tables_cache',
  ORDERS: 'tables_orders_cache',
  ORDER_POSITIONS: 'tables_order_positions_cache',
  DISHES: 'tables_dishes_cache',
  GUESTS: 'tables_guests_cache',
  EMPLOYEES: 'tables_employees_cache',
  LAST_UPDATED: 'tables_last_updated'
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

const dataCache = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  },

  set: (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  },

  getHalls: () => dataCache.get(CACHE_KEYS.HALLS),
  getTables: () => dataCache.get(CACHE_KEYS.TABLES),
  getOrderTables: () => dataCache.get(CACHE_KEYS.ORDER_TABLES),
  getOrders: () => dataCache.get(CACHE_KEYS.ORDERS),
  getOrderPositions: () => dataCache.get(CACHE_KEYS.ORDER_POSITIONS),
  getDishes: () => dataCache.get(CACHE_KEYS.DISHES),
  getGuests: () => dataCache.get(CACHE_KEYS.GUESTS),
  getEmployees: () => dataCache.get(CACHE_KEYS.EMPLOYEES),
  getLastUpdated: () => dataCache.get(CACHE_KEYS.LAST_UPDATED),

  // Функции для сохранения данных в кеш
  setHalls: (data: any) => dataCache.set(CACHE_KEYS.HALLS, data),
  setTables: (data: any) => dataCache.set(CACHE_KEYS.TABLES, data),
  setOrderTables: (data: any) => dataCache.set(CACHE_KEYS.ORDER_TABLES, data),
  setOrders: (data: any) => dataCache.set(CACHE_KEYS.ORDERS, data),
  setOrderPositions: (data: any) => dataCache.set(CACHE_KEYS.ORDER_POSITIONS, data),
  setDishes: (data: any) => dataCache.set(CACHE_KEYS.DISHES, data),
  setGuests: (data: any) => dataCache.set(CACHE_KEYS.GUESTS, data),
  setEmployees: (data: any) => dataCache.set(CACHE_KEYS.EMPLOYEES, data),
  setLastUpdated: (data: any) => dataCache.set(CACHE_KEYS.LAST_UPDATED, data),

  isCacheValid: () => {
    const lastUpdated = dataCache.getLastUpdated();
    if (!lastUpdated) return false;
    return Date.now() - lastUpdated < CACHE_DURATION;
  },

  clear: () => {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};

// Статусы столов
const tableStatusMap = {
  'free': 'свободен',
  'occupied': 'занят',
  'reserved': 'забронирован',
  'cleaning': 'требует уборки',
  'string': 'неизвестно'
};

const statusColors = {
  'free': 'bg-green-100 text-green-800',
  'occupied': 'bg-red-100 text-red-800',
  'reserved': 'bg-blue-100 text-blue-800',
  'cleaning': 'bg-yellow-100 text-yellow-800',
  'string': 'bg-gray-100 text-gray-800'
};

const statusIcons = {
  'free': CheckCircle,
  'occupied': Users,
  'reserved': Clock,
  'cleaning': MapPin,
  'string': MapPin
};

const orderStatusMap = {
  'open': 'открыт',
  'closed': 'закрыт',
  'paid': 'оплачен',
  'cancelled': 'отменен'
};

const orderTypeMap = {
  'dine-in': 'в зале',
  'takeaway': 'с собой',
  'delivery': 'доставка'
};

// Компонент Label
const Label = ({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) => (
    <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children}
    </label>
);

// Функция для получения иконки статуса
const getStatusIcon = (status: string) => {
  const IconComponent = statusIcons[status as keyof typeof statusIcons] || MapPin;
  return <IconComponent className="h-4 w-4" />;
};

const DraggableTable = React.memo(({
                                     table,
                                     onPositionChange,
                                     onSelect,
                                     isSelected
                                   }: {
  table: Table;
  onPositionChange: (tableId: number, x: number, y: number) => void;
  onSelect: (table: Table) => void;
  isSelected: boolean;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: table.position_x, y: table.position_y });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const tableRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const isDraggingRef = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    isDraggingRef.current = true;
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const newX = e.clientX - dragStartPos.current.x;
        const newY = e.clientY - dragStartPos.current.y;

        const boundedX = Math.max(0, Math.min(newX, 820 - 80));
        const boundedY = Math.max(0, Math.min(newY, 620 - 80));

        setPosition({ x: boundedX, y: boundedY });
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      setIsDragging(false);
      isDraggingRef.current = false;

      // Сохраняем окончательную позицию
      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;

      const boundedX = Math.max(0, Math.min(newX, 820 - 80));
      const boundedY = Math.max(0, Math.min(newY, 620 - 80));

      onPositionChange(table.id, boundedX, boundedY);

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      document.body.style.cursor = '';

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    document.body.style.cursor = 'grabbing';
  }, [position, table.id, onPositionChange]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      onSelect(table);
    }
  }, [isDragging, onSelect, table]);

  useEffect(() => {
    setPosition({ x: table.position_x, y: table.position_y });
  }, [table.position_x, table.position_y]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
      <div
          ref={tableRef}
          className={`absolute cursor-move rounded-lg border-2 p-2 shadow-sm transition-all ${
              table.status === 'free' ? 'border-green-300 bg-green-50' :
                  table.status === 'occupied' ? 'border-red-300 bg-red-50' :
                      table.status === 'reserved' ? 'border-blue-300 bg-blue-50' :
                          'border-yellow-300 bg-yellow-50'
          } ${isDragging ? 'z-50 opacity-90 shadow-lg scale-105 cursor-grabbing' : 'hover:shadow-md cursor-grab'} 
      ${isSelected ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: '80px',
            height: '80px',
            userSelect: 'none',
            transition: isDragging ? 'none' : 'all 0.1s ease'
          }}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          title={`${table.name} (${table.count_seats} мест)`}
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <span className="text-xs font-medium text-gray-700">{table.name}</span>
          <span className="text-xs text-gray-500 mt-1">{table.count_seats} мест</span>
        </div>

        <div className="absolute top-1 right-1 opacity-60">
          <Move className="h-3 w-3 text-gray-500" />
        </div>

        {isDragging && (
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1 rounded text-[10px]">
              перемещение
            </div>
        )}
      </div>
  );
});

const RestaurantScheme = React.memo(({
                                       halls,
                                       tables,
                                       selectedHall,
                                       setSelectedHall,
                                       selectedTable,
                                       setSelectedTable,
                                       updateTablePosition
                                     }: {
  halls: Hall[];
  tables: Table[];
  selectedHall: Hall | null;
  setSelectedHall: (hall: Hall | null) => void;
  selectedTable: Table | null;
  setSelectedTable: (table: Table | null) => void;
  updateTablePosition: (tableId: number, x: number, y: number) => void;
}) => {
  const hallTables = selectedHall
      ? tables.filter(table => table.hall_id === selectedHall.id)
      : [];

  const handleTablePositionChange = useCallback((tableId: number, x: number, y: number) => {
    updateTablePosition(tableId, x, y);
  }, [updateTablePosition]);

  const handleTableSelect = useCallback((table: Table) => {
    setSelectedTable(table);
  }, [setSelectedTable]);

  useEffect(() => {
    if (halls.length > 0 && !selectedHall) {
      setSelectedHall(halls[0]);
    }
  }, [halls, selectedHall, setSelectedHall]);

  return (
      <div className="space-y-4">
        {/* Выбор зала */}
        <div className="flex items-center gap-4">
          <Select
              value={selectedHall?.id.toString() || ''}
              onValueChange={(value) => {
                const hall = halls.find(h => h.id === parseInt(value));
                setSelectedHall(hall || null);
              }}
          >
            <SelectTrigger className="w-64"    style={{
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-inpyt)',
              color: 'var(--custom-text)',
            }}>
              <SelectValue placeholder="Выберите зал" />
            </SelectTrigger>
            <SelectContent>
              {halls.map(hall => (
                  <SelectItem key={hall.id} value={hall.id.toString()}>
                    {hall.name}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="text-sm text-muted-foreground">
            {selectedHall ? `${hallTables.length} столов в зале` : 'Выберите зал для просмотра схемы'}
          </div>
        </div>

        {selectedHall && (
            <div className="relative flex justify-center gap-4" >
              {/* Сетка зала */}
              <div
                  className="border-2 border-gray-300 bg-gray-50 rounded-lg relative select-none"
                  style={{
                    width: '820px',
                    height: '620px',
                    backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                  }}
              >
                {/* Столы */}
                {hallTables.map((table) => (
                    <DraggableTable
                        key={table.id}
                        table={table}
                        onPositionChange={handleTablePositionChange}
                        onSelect={handleTableSelect}
                        isSelected={selectedTable?.id === table.id}
                    />
                ))}

                {/* Подсказка */}
                <div className="absolute top-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm text-blue-800">
                    💡 Зажмите и перетащите стол для изменения расположения
                  </div>
                </div>
              </div>

              {/* Ручная настройка позиции */}
              {selectedTable && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-sm">Ручная настройка позиции стола: {selectedTable.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="positionX">Позиция X</Label>
                          <Input
                              id="positionX"
                              type="number"
                              value={selectedTable.position_x}
                              onChange={(e) => {
                                const newX = parseInt(e.target.value) || 0;
                                updateTablePosition(selectedTable.id, newX, selectedTable.position_y);
                              }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="positionY">Позиция Y</Label>
                          <Input
                              id="positionY"
                              type="number"
                              value={selectedTable.position_y}
                              onChange={(e) => {
                                const newY = parseInt(e.target.value) || 0;
                                updateTablePosition(selectedTable.id, selectedTable.position_x, newY);
                              }}
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Максимальные значения: X: 740, Y: 540
                      </div>
                    </CardContent>
                  </Card>
              )}
            </div>
        )}

        {!selectedHall && (
            <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12">
              <div className="text-center">
                <Grid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Выберите зал</h3>
                <p className="text-gray-500 mb-4">
                  Выберите зал из списка выше чтобы увидеть его схему
                </p>
              </div>
            </div>
        )}
      </div>
  );
});

export function Tables({ selectedSalesPoint }: TablesProps) {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [zoneFilter, setZoneFilter] = useState('Все зоны');
  const [statusFilter, setStatusFilter] = useState('Все статусы');
  const [activeTab, setActiveTab] = useState('grid');
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [isAddingTable, setIsAddingTable] = useState(false);

  // Данные для нового стола
  const [newTable, setNewTable] = useState({
    name: '',
    hall_id: '',
    count_seats: '',
    status: 'free',
    guest_id: '',
    employee_id: '',
    position_x: 0,
    position_y: 0,
    point_retail_id: selectedSalesPoint?.id || 1
  });

  const [halls, setHalls] = useState<Hall[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orderTables, setOrderTables] = useState<OrderTable[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderPositions, setOrderPositions] = useState<OrderPosition[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [backgroundLoading, setBackgroundLoading] = useState(false);

  const resetNewTableForm = useCallback(() => {
    setNewTable({
      name: '',
      hall_id: '',
      count_seats: '',
      status: 'free',
      guest_id: '',
      employee_id: '',
      position_x: 0,
      position_y: 0,
      point_retail_id: selectedSalesPoint?.id || 1
    });
  }, [selectedSalesPoint]);

  const handleStartAddTable = () => {
    setIsAddingTable(true);
    resetNewTableForm();
  };

  const handleCancelAddTable = () => {
    setIsAddingTable(false);
    resetNewTableForm();
  };

  useEffect(() => {
    if (selectedSalesPoint) {
      setNewTable(prev => ({
        ...prev,
        point_retail_id: selectedSalesPoint.id
      }));
    }
  }, [selectedSalesPoint]);


  const filteredHalls = useMemo(() => {
    return selectedSalesPoint
        ? halls.filter(hall => hall.point_retail_id === selectedSalesPoint.id)
        : halls;
  }, [halls, selectedSalesPoint]);

  const filteredGuests = useMemo(() => {
    return selectedSalesPoint
        ? guests.filter(guest => guest.point_retail_id === selectedSalesPoint.id)
        : guests;
  }, [guests, selectedSalesPoint]);

  const filteredEmployees = useMemo(() => {
    return selectedSalesPoint
        ? employees.filter(employee => employee.point_retail_id === selectedSalesPoint.id)
        : employees;
  }, [employees, selectedSalesPoint]);

  const filteredTables = useMemo(() => {
    const tablesArray = Array.isArray(tables) ? tables : [];
    const filteredBySalesPoint = selectedSalesPoint
        ? tablesArray.filter(table => table.point_retail_id === selectedSalesPoint.id)
        : tablesArray;

    return filteredBySalesPoint.filter(table => {
      const hallName = halls.find(h => h.id === table.hall_id)?.name || '';
      const matchesZone = zoneFilter === 'Все зоны' || hallName === zoneFilter;
      const matchesStatus = statusFilter === 'Все статусы' || table.status === statusFilter;
      return matchesZone && matchesStatus;
    });
  }, [tables, selectedSalesPoint, halls, zoneFilter, statusFilter]);

  const fetchHalls = useCallback(async (forceRefresh = false) => {
    const token = localStorage.getItem('token');
    if (!forceRefresh && dataCache.isCacheValid() && dataCache.getHalls()) {
      return dataCache.getHalls();
    }

    try {
      const response = await fetch('/hall-tables/?skip=0&limit=100', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      const hallsData = Array.isArray(data) ? data : [];

      dataCache.setHalls(hallsData);
      return hallsData;
    } catch (error) {
      console.error('Error fetching halls:', error);
      const fallback = dataCache.getHalls() || [];
      return fallback;
    }
  }, []);

  const fetchTables = useCallback(async (forceRefresh = false) => {
    const token = localStorage.getItem('token');
    if (!forceRefresh && dataCache.isCacheValid() && dataCache.getTables()) {
      return dataCache.getTables();
    }

    try {
      const response = await fetch('/tables/?skip=0&limit=100', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      const tablesData = Array.isArray(data) ? data : [];
      dataCache.setTables(tablesData);
      return tablesData;
    } catch (error) {
      console.error('Error fetching tables:', error);
      const fallback = dataCache.getTables() || [];
      return fallback;
    }
  }, []);

  const fetchOrderTables = useCallback(async (forceRefresh = false) => {
    const token = localStorage.getItem('token');
    if (!forceRefresh && dataCache.isCacheValid() && dataCache.getOrderTables()) {
      return dataCache.getOrderTables();
    }

    try {
      const response = await fetch('/order-tables/?skip=0&limit=100', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      const orderTablesData = Array.isArray(data) ? data : [];
      dataCache.setOrderTables(orderTablesData);
      return orderTablesData;
    } catch (error) {
      console.error('Error fetching order tables:', error);
      const fallback = dataCache.getOrderTables() || [];
      return fallback;
    }
  }, []);

  const fetchOrders = useCallback(async (forceRefresh = false) => {
    const token = localStorage.getItem('token');
    if (!forceRefresh && dataCache.isCacheValid() && dataCache.getOrders()) {
      return dataCache.getOrders();
    }

    try {
      const response = await fetch('/orders/?skip=0&limit=100', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      const ordersData = Array.isArray(data) ? data : [];
      dataCache.setOrders(ordersData);
      return ordersData;
    } catch (error) {
      console.error('Error fetching orders:', error);
      const fallback = dataCache.getOrders() || [];
      return fallback;
    }
  }, []);

  const fetchOrderPositions = useCallback(async (forceRefresh = false) => {
    const token = localStorage.getItem('token');
    if (!forceRefresh && dataCache.isCacheValid() && dataCache.getOrderPositions()) {
      return dataCache.getOrderPositions();
    }

    try {
      const response = await fetch('/order-positions/?skip=0&limit=1000', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      const orderPositionsData = Array.isArray(data) ? data : [];
      dataCache.setOrderPositions(orderPositionsData);
      return orderPositionsData;
    } catch (error) {
      console.error('Error fetching order positions:', error);
      const fallback = dataCache.getOrderPositions() || [];
      return fallback;
    }
  }, []);

  const fetchDishes = useCallback(async (forceRefresh = false) => {
    const token = localStorage.getItem('token');
    if (!forceRefresh && dataCache.isCacheValid() && dataCache.getDishes()) {
      return dataCache.getDishes();
    }

    try {
      const response = await fetch('/dishes/?skip=0&limit=1000', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      const dishesData = Array.isArray(data) ? data : [];
      dataCache.setDishes(dishesData);
      return dishesData;
    } catch (error) {
      console.error('Error fetching dishes:', error);
      const fallback = dataCache.getDishes() || [];
      return fallback;
    }
  }, []);

  const fetchGuests = useCallback(async (forceRefresh = false) => {
    const token = localStorage.getItem('token');
    if (!forceRefresh && dataCache.isCacheValid() && dataCache.getGuests()) {
      return dataCache.getGuests();
    }

    try {
      const response = await fetch('/guests/?skip=0&limit=100', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      const guestsArray = Array.isArray(data) ? data : [data].filter(Boolean);
      dataCache.setGuests(guestsArray);
      return guestsArray;
    } catch (error) {
      console.error('Error fetching guests:', error);
      const fallback = dataCache.getGuests() || [];
      return fallback;
    }
  }, []);

  const fetchEmployees = useCallback(async (forceRefresh = false) => {
    const token = localStorage.getItem('token');
    if (!forceRefresh && dataCache.isCacheValid() && dataCache.getEmployees()) {
      return dataCache.getEmployees();
    }

    try {
      const response = await fetch('/employees/?skip=0&limit=100', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      const employeesArray = Array.isArray(data) ? data : [data].filter(Boolean);
      dataCache.setEmployees(employeesArray);
      return employeesArray;
    } catch (error) {
      console.error('Error fetching employees:', error);
      const fallback = dataCache.getEmployees() || [];
      return fallback;
    }
  }, []);

  useEffect(() => {
    const initializeFromCache = () => {
      if (dataCache.isCacheValid()) {
        setHalls(dataCache.getHalls() || []);
        setTables(dataCache.getTables() || []);
        setOrderTables(dataCache.getOrderTables() || []);
        setOrders(dataCache.getOrders() || []);
        setOrderPositions(dataCache.getOrderPositions() || []);
        setDishes(dataCache.getDishes() || []);
        setGuests(dataCache.getGuests() || []);
        setEmployees(dataCache.getEmployees() || []);
      }
    };

    initializeFromCache();
  }, []);

  useEffect(() => {
    const loadBackgroundData = async () => {
      setBackgroundLoading(true);

      try {
        const [
          hallsData,
          tablesData,
          orderTablesData,
          ordersData,
          orderPositionsData,
          dishesData,
          guestsData,
          employeesData
        ] = await Promise.all([
          fetchHalls(true),
          fetchTables(true),
          fetchOrderTables(true),
          fetchOrders(true),
          fetchOrderPositions(true),
          fetchDishes(true),
          fetchGuests(true),
          fetchEmployees(true)
        ]);

        setHalls(hallsData);
        setTables(tablesData);
        setOrderTables(orderTablesData);
        setOrders(ordersData);
        setOrderPositions(orderPositionsData);
        setDishes(dishesData);
        setGuests(guestsData);
        setEmployees(employeesData);

        dataCache.setLastUpdated(Date.now());
      } catch (error) {
        console.error('Error in background data loading:', error);
      } finally {
        setBackgroundLoading(false);
      }
    };

    if (!dataCache.isCacheValid()) {
      loadBackgroundData();
    }
  }, [fetchHalls, fetchTables, fetchOrderTables, fetchOrders, fetchOrderPositions, fetchDishes, fetchGuests, fetchEmployees]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        hallsData,
        tablesData,
        orderTablesData,
        ordersData,
        orderPositionsData,
        dishesData,
        guestsData,
        employeesData
      ] = await Promise.all([
        fetchHalls(true),
        fetchTables(true),
        fetchOrderTables(true),
        fetchOrders(true),
        fetchOrderPositions(true),
        fetchDishes(true),
        fetchGuests(true),
        fetchEmployees(true)
      ]);

      setHalls(hallsData);
      setTables(tablesData);
      setOrderTables(orderTablesData);
      setOrders(ordersData);
      setOrderPositions(orderPositionsData);
      setDishes(dishesData);
      setGuests(guestsData);
      setEmployees(employeesData);

      dataCache.setLastUpdated(Date.now());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchHalls, fetchTables, fetchOrderTables, fetchOrders, fetchOrderPositions, fetchDishes, fetchGuests, fetchEmployees]);

  // Получение названия зала по ID
  const getHallName = useCallback((hallId: number) => {
    const hall = halls.find(h => h.id === hallId);
    return hall ? hall.name : 'Неизвестный зал';
  }, [halls]);

  // Получение активного заказа для стола
  const getTableActiveOrder = useCallback((tableId: number) => {
    const orderTable = orderTables.find(ot =>
        ot.table_id === tableId
    );

    if (!orderTable) return null;

    const order = orders.find(o => o.id === orderTable.order_id);
    return order ? { orderTable, order } : null;
  }, [orderTables, orders]);

  const getOrderPositions = useCallback((orderId: number) => {
    return orderPositions.filter(op => op.order_id === orderId);
  }, [orderPositions]);

  const getDishInfo = useCallback((dishId: number) => {
    return dishes.find(d => d.id === dishId);
  }, [dishes]);

  const getOrderGuestInfo = useCallback((order: Order) => {
    if (!order.guest_id) return null;
    const guest = guests.find(g => g.id === order.guest_id);
    return guest ? {
      name: guest.full_name,
      phone: guest.phone,
      email: guest.email
    } : null;
  }, [guests]);

  const getOrderWaiterInfo = useCallback((order: Order) => {
    const employee = employees.find(e => e.id === order.user_id_open);
    return employee ? {
      name: employee.fullname,
      phone: employee.phone
    } : null;
  }, [employees]);

  const formatDateTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getOccupancyStats = useCallback(() => {
    const tablesArray = selectedSalesPoint
        ? tables.filter(table => table.point_retail_id === selectedSalesPoint.id)
        : tables;

    const total = tablesArray.length;
    const occupied = tablesArray.filter(t => t.status === 'occupied').length;
    const reserved = tablesArray.filter(t => t.status === 'reserved').length;
    const free = tablesArray.filter(t => t.status === 'free').length;
    const cleaning = tablesArray.filter(t => t.status === 'cleaning').length;

    return { total, occupied, reserved, free, cleaning };
  }, [tables, selectedSalesPoint]);

  const stats = getOccupancyStats();

  const handleInputChange = (field: string, value: string) => {
    setNewTable(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateTable = async () => {
    if (!newTable.name || !newTable.hall_id || !newTable.count_seats) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      const tableData = {
        point_retail_id: newTable.point_retail_id,
        hall_id: parseInt(newTable.hall_id),
        name: newTable.name,
        count_seats: parseInt(newTable.count_seats),
        position: 0,
        position_x: newTable.position_x,
        position_y: newTable.position_y,
        status: newTable.status,
        metadate: { additionalProp1: {} }
      };

      if (newTable.guest_id) {
        tableData.metadate.guest_id = parseInt(newTable.guest_id);
      }
      if (newTable.employee_id) {
        tableData.metadate.employee_id = parseInt(newTable.employee_id);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/tables/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tableData)
      });

      if (response.ok) {
        await fetchTables(true);
        setIsAddingTable(false);
        resetNewTableForm();
        toast.success('Стол успешно добавлен!');
      } else {
        toast.error('Ошибка при добавлении стола');
      }
    } catch (error) {
      console.error('Error creating table:', error);
      toast.error('Ошибка при добавлении стола');
    }
  };

  const updateTablePosition = async (tableId: number, position_x: number, position_y: number) => {
    try {
      const table = tables.find(t => t.id === tableId);
      const token = localStorage.getItem('token');
      if (!table) return;

      const response = await fetch(`/tables/${tableId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...table,
          position_x,
          position_y
        })
      });

      if (response.ok) {
        const updatedTables = tables.map(t =>
            t.id === tableId ? { ...t, position_x, position_y } : t
        );
        setTables(updatedTables);
        dataCache.setTables(updatedTables);
      }
    } catch (error) {
      console.error('Error updating table position:', error);
    }
  };

  const zones = ['Все зоны', ...filteredHalls.map(hall => hall.name)];

  if (isAddingTable) {
    return (
        <div className="space-y-6">
          <div className="flex items-center justify-between" >
            <Button variant="outline" onClick={handleCancelAddTable}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к списку
            </Button>
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-100 text-orange-800">Добавление стола</Badge>
              {selectedSalesPoint && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Точка продаж: {selectedSalesPoint.name}
                  </div>
              )}
            </div>
          </div>

          {/* Заголовок */}
          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Utensils className="h-6 w-6 text-orange-600" />
                    Добавление нового стола
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Заполните информацию о новом столе
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Форма добавления стола */}
          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardContent className="p-6">
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Название стола *</Label>
                    <Input
                        id="name"
                        placeholder="Стол №9"
                        value={newTable.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="count_seats">Количество мест *</Label>
                    <Input
                        id="count_seats"
                        type="number"
                        placeholder="4"
                        value={newTable.count_seats}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                        onChange={(e) => handleInputChange('count_seats', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hall_id">Зал *</Label>
                  <Select
                      value={newTable.hall_id}
                      onValueChange={(value) => handleInputChange('hall_id', value)}
                  >
                    <SelectTrigger id="hall_id"    style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }}>
                      <SelectValue placeholder="Выберите зал" />
                    </SelectTrigger>
                    <SelectContent >
                      {filteredHalls.map(hall => (
                          <SelectItem key={hall.id} value={hall.id.toString()}  >
                            {hall.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filteredHalls.length === 0 && selectedSalesPoint && (
                      <p className="text-sm text-amber-600 mt-1">
                        Для выбранной точки продаж нет доступных залов. Сначала создайте зал.
                      </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Статус стола</Label>
                  <Select value={newTable.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger id="status"    style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }}>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Свободен</SelectItem>
                      <SelectItem value="occupied">Занят</SelectItem>
                      <SelectItem value="reserved">Забронирован</SelectItem>
                      <SelectItem value="cleaning">Требует уборки</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(newTable.status === 'occupied' || newTable.status === 'reserved') && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="guest_id">Гость</Label>
                        <Select
                            value={newTable.guest_id}
                            onValueChange={(value) => handleInputChange('guest_id', value)}
                        >
                          <SelectTrigger id="guest_id">
                            <SelectValue placeholder="Выберите гостя" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Не выбран</SelectItem>
                            {filteredGuests.map(guest => (
                                <SelectItem key={guest.id} value={guest.id.toString()}>
                                  {guest.full_name} ({guest.phone})
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employee_id">Официант</Label>
                        <Select
                            value={newTable.employee_id}
                            onValueChange={(value) => handleInputChange('employee_id', value)}
                        >
                          <SelectTrigger id="employee_id">
                            <SelectValue placeholder="Выберите официанта" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Не выбран</SelectItem>
                            {filteredEmployees.map(employee => (
                                <SelectItem key={employee.id} value={employee.id.toString()}>
                                  {employee.fullname} ({employee.phone})
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                      variant="outline"
                      onClick={handleCancelAddTable}
                  >
                    Отмена
                  </Button>
                  <Button
                      onClick={handleCreateTable}
                      className="bg-orange-600 hover:bg-orange-700"
                      disabled={!newTable.name || !newTable.hall_id || !newTable.count_seats}
                  >
                    Добавить стол
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    )
  }

  return (
      <div className="space-y-6">
        {selectedSalesPoint && (
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Точка продаж: {selectedSalesPoint.name}
                  {selectedSalesPoint.address && ` (${selectedSalesPoint.address})`}
                </div>
              </CardContent>
            </Card>
        )}

        {backgroundLoading && (
            <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
              Обновление данных...
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Всего столиков</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {selectedSalesPoint ? `в ${selectedSalesPoint.name}` : 'В ресторане'}
              </p>
            </CardContent>
          </Card>

          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Заняты</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.occupied}</div>
              <p className="text-xs text-muted-foreground">Активные гости</p>
            </CardContent>
          </Card>

          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Забронированы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.reserved}</div>
              <p className="text-xs text-muted-foreground">На сегодня</p>
            </CardContent>
          </Card>

          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Свободны</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.free}</div>
              <p className="text-xs text-muted-foreground">Доступны</p>
            </CardContent>
          </Card>

          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Загруженность</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Сейчас</p>
            </CardContent>
          </Card>
        </div>

        <Card style={{
          borderRadius: '20px',
          border: 'var(--custom-border-primary)',
          background: 'var(--custom-bg-secondaryLineCard)',
          color: 'var(--custom-text)',
        }}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Управление столами
                {selectedSalesPoint && ` - ${selectedSalesPoint.name}`}
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                    variant="outline"
                    onClick={refreshData}
                    disabled={loading}
                >
                  {loading ? 'Обновление...' : 'Обновить данные'}
                </Button>
                <Button
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={handleStartAddTable}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить стол
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 mb-6">
              <Select value={zoneFilter} onValueChange={setZoneFilter}>
                <SelectTrigger className="w-48 "    style={{
                  border: 'var(--custom-border-primary)',
                  background: 'var(--custom-bg-inpyt)',
                  color: 'var(--custom-text)',
                }}>
                  <SelectValue placeholder="Фильтр по зоне" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map(zone => (
                      <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 "    style={{
                  border: 'var(--custom-border-primary)',
                  background: 'var(--custom-bg-inpyt)',
                  color: 'var(--custom-text)',
                }}>
                  <SelectValue placeholder="Фильтр по статусу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Все статусы">Все статусы</SelectItem>
                  <SelectItem value="free">Свободные</SelectItem>
                  <SelectItem value="occupied">Занятые</SelectItem>
                  <SelectItem value="reserved">Забронированные</SelectItem>
                  <SelectItem value="cleaning">Требуют уборки</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="scheme" className="flex items-center gap-2">
                  <Grid className="h-4 w-4" />
                  Схема
                </TabsTrigger>
                <TabsTrigger value="grid" className="flex items-center gap-2">
                  <Grid className="h-4 w-4" />
                  Сетка
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Список
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scheme" className="space-y-4">
                <RestaurantScheme
                    halls={filteredHalls}
                    tables={filteredTables}
                    selectedHall={selectedHall}
                    setSelectedHall={setSelectedHall}
                    selectedTable={selectedTable}
                    setSelectedTable={setSelectedTable}
                    updateTablePosition={updateTablePosition}
                />
              </TabsContent>

              <TabsContent value="grid" className="space-y-4">
                {filteredTables.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      {selectedSalesPoint
                          ? `Нет столов для точки продаж "${selectedSalesPoint.name}"`
                          : 'Столы не найдены'
                      }
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredTables.map((table) => {
                        const activeOrder = getTableActiveOrder(table.id);
                        const guestInfo = activeOrder ? getOrderGuestInfo(activeOrder.order) : null;
                        const waiterInfo = activeOrder ? getOrderWaiterInfo(activeOrder.order) : null;

                        const color = `backgroundImage: 'linear-gradient(185deg, #1e293b 100%, #0f172a 100%)',color:'white'}}`

                        return (
                            <Card
                                key={table.id}
                                className={`transition-all hover:shadow-lg ${
                                    table.status === 'free' ? 'bg-green-100' :
                                        table.status === 'occupied' ? 'bg-red-100' :
                                        table.status === 'string' ? 'bg-purple-100' :
                                            table.status === 'reserved' ? 'bg-blue-100' :
                                                'border-yellow-200'
                                  
                                }`}
                                onClick={() => setSelectedTable(table)}
                            >
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-lg">{table.name}</CardTitle>
                                  <Badge className={statusColors[table.status as keyof typeof statusColors]}>
                                    <div className="flex items-center space-x-1">
                                      {getStatusIcon(table.status)}
                                      <span className="text-xs">{tableStatusMap[table.status as keyof typeof tableStatusMap]}</span>
                                    </div>
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Зал:</span>
                                  <span>{getHallName(table.hall_id)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Мест:</span>
                                  <span>{table.count_seats}</span>
                                </div>

                                {activeOrder && (
                                    <>
                                      <div className="border-t pt-2 mt-2">
                                        <div className="flex justify-between text-sm font-medium">
                                          <span>Заказ #{activeOrder.order.id}</span>
                                          <Badge variant="outline" className="text-xs">
                                            {orderStatusMap[activeOrder.order.status as keyof typeof orderStatusMap]}
                                          </Badge>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span>Позиций:</span>
                                          <span>{activeOrder.order.count_positions}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-medium">
                                          <span>Сумма:</span>
                                          <span className="text-orange-600">
                                    ₽{parseFloat(activeOrder.order.amount).toLocaleString()}
                                  </span>
                                        </div>
                                      </div>
                                    </>
                                )}

                                {guestInfo && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Гость:</span>
                                      <span className="font-medium">{guestInfo.name}</span>
                                    </div>
                                )}

                                {waiterInfo && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Официант:</span>
                                      <span>{waiterInfo.name}</span>
                                    </div>
                                )}
                              </CardContent>
                            </Card>
                        );
                      })}
                    </div>
                )}

                <Dialog open={!!selectedTable} onOpenChange={(open) => !open && setSelectedTable(null)}>
                  <DialogContent className="max-w-3xl">
                    {selectedTable && (
                        <>
                          <DialogHeader>
                            <DialogTitle>Информация о столе: {selectedTable.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Зал</Label>
                                <div className="text-sm">{getHallName(selectedTable.hall_id)}</div>
                              </div>
                              <div>
                                <Label>Количество мест</Label>
                                <div className="text-sm">{selectedTable.count_seats}</div>
                              </div>
                              <div>
                                <Label>Статус</Label>
                                <Badge className={statusColors[selectedTable.status as keyof typeof statusColors]}>
                                  {tableStatusMap[selectedTable.status as keyof typeof tableStatusMap]}
                                </Badge>
                              </div>
                            </div>

                            {(() => {
                              const activeOrder = getTableActiveOrder(selectedTable.id);
                              if (!activeOrder) return null;

                              const guestInfo = getOrderGuestInfo(activeOrder.order);
                              const waiterInfo = getOrderWaiterInfo(activeOrder.order);
                              const positions = getOrderPositions(activeOrder.order.id);

                              return (
                                  <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-3">Активный заказ #{activeOrder.order.id}</h4>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                      <div>
                                        <Label>Статус заказа</Label>
                                        <Badge variant="outline">
                                          {orderStatusMap[activeOrder.order.status as keyof typeof orderStatusMap]}
                                        </Badge>
                                      </div>
                                      <div>
                                        <Label>Тип заказа</Label>
                                        <div className="text-sm">{orderTypeMap[activeOrder.order.order_type as keyof typeof orderTypeMap]}</div>
                                      </div>
                                      <div>
                                        <Label>Сумма</Label>
                                        <div className="text-sm font-semibold text-orange-600">
                                          ₽{parseFloat(activeOrder.order.amount).toLocaleString()}
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Позиций</Label>
                                        <div className="text-sm">{activeOrder.order.count_positions}</div>
                                      </div>
                                    </div>

                                    {guestInfo && (
                                        <div className="mb-4">
                                          <Label>Информация о госте</Label>
                                          <div className="text-sm">Имя: {guestInfo.name}</div>
                                          <div className="text-sm">Телефон: {guestInfo.phone}</div>
                                          {guestInfo.email && <div className="text-sm">Email: {guestInfo.email}</div>}
                                        </div>
                                    )}

                                    {waiterInfo && (
                                        <div className="mb-4">
                                          <Label>Официант</Label>
                                          <div className="text-sm">Имя: {waiterInfo.name}</div>
                                          <div className="text-sm">Телефон: {waiterInfo.phone}</div>
                                        </div>
                                    )}

                                    {positions.length > 0 && (
                                        <div>
                                          <Label>Позиции заказа</Label>
                                          <div className="space-y-2 mt-2">
                                            {positions.map(position => {
                                              const dish = getDishInfo(position.dish_id);
                                              return (
                                                  <div key={position.id} className="flex justify-between items-center border-b pb-2">
                                                    <div>
                                                      <div className="font-medium">{dish?.name || 'Неизвестное блюдо'}</div>
                                                      <div className="text-sm text-muted-foreground">
                                                        {position.quantity} x ₽{parseFloat(position.price).toFixed(2)}
                                                      </div>
                                                    </div>
                                                    <div className="font-semibold">
                                                      ₽{parseFloat(position.amount).toFixed(2)}
                                                    </div>
                                                  </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                    )}
                                  </div>
                              );
                            })()}
                          </div>
                        </>
                    )}
                  </DialogContent>
                </Dialog>
              </TabsContent>

              <TabsContent value="list" className="space-y-4">
                <div className="space-y-4">
                  {filteredHalls.map(hall => {
                    const hallTables = filteredTables.filter(table => table.hall_id === hall.id);
                    if (hallTables.length === 0) return null;

                    return (
                        <Card key={hall.id} style={{
                          borderRadius: '20px',
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-primaryLine)',
                          color: 'var(--custom-text)',
                        }}>
                          <CardHeader>
                            <CardTitle className="text-lg">{hall.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead style={{color:'rgb(101,125,156)'}}>Стол</TableHead>
                                  <TableHead style={{color:'rgb(101,125,156)'}}>Мест</TableHead>
                                  <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                                  <TableHead style={{color:'rgb(101,125,156)'}}>Позиция</TableHead>
                                  <TableHead style={{color:'rgb(101,125,156)'}}>Заказ</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {hallTables.map((table) => {
                                  const activeOrder = getTableActiveOrder(table.id);
                                  return (
                                      <TableRow key={table.id}>
                                        <TableCell className="font-medium">{table.name}</TableCell>
                                        <TableCell>{table.count_seats}</TableCell>
                                        <TableCell>
                                          <Badge className={statusColors[table.status as keyof typeof statusColors]}>
                                            {tableStatusMap[table.status as keyof typeof tableStatusMap]}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>X: {table.position_x}, Y: {table.position_y}</TableCell>
                                        <TableCell>
                                          {activeOrder ? (
                                              <div className="space-y-1">
                                                <div className="font-medium">#{activeOrder.order.id}</div>
                                                <div className="text-sm text-muted-foreground">
                                                  ₽{parseFloat(activeOrder.order.amount).toLocaleString()}
                                                </div>
                                              </div>
                                          ) : (
                                              <span className="text-muted-foreground">Нет заказа</span>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
  );
}