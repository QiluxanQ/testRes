import React, {useEffect, useState, useCallback} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import {
  Plus,
  Search,
  UserCheck,
  Phone,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Users,
  Award,
  TrendingUp,
  CalendarIcon,
  CheckCircle,
  XCircle, ArrowLeft, User,
  MapPin,
  Save,
  Bookmark, FileText, Home, Briefcase, CalendarDays, ExternalLink, Info, Download, CalendarX
} from 'lucide-react';
import {Popover, PopoverContent, PopoverTrigger} from "../../ui/popover";

const initialPositions = ['Все должности', 'Официант', 'Повар', 'Бармен', 'Менеджер зала', 'Су-шеф', 'Администратор', 'Хостес'];
const initialDepartments = ['Все отделы', 'Обслуживание', 'Кухня', 'Бар', 'Управление', 'Клининг'];

const getStatusColor = (status) => {
  switch (status) {
    case 'работает': return 'bg-green-100 text-green-800';
    case 'отпуск': return 'bg-blue-100 text-blue-800';
    case 'больничный': return 'bg-yellow-100 text-yellow-800';
    case 'уволен': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Функции для бейджей статусов
const getStatusBadge = (status) => {
  const colors = {
    'active': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-blue-100 text-blue-800',
    'rejected': 'bg-red-100 text-red-800'
  };

  const labels = {
    'active': 'Активный',
    'pending': 'Ожидание',
    'approved': 'Одобрено',
    'rejected': 'Отклонено'
  };

  return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
        {labels[status] || status}
      </Badge>
  );
};

const getLeaveTypeBadge = (type) => {
  const labels = {
    'vacation': 'Отпуск',
    'sick': 'Больничный',
    'dayoff': 'Отгул'
  };

  return labels[type] || type;
};

interface StaffProps {
  selectedSalesPoint: any;
}

export function Staff({ selectedSalesPoint }: StaffProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('Все должности');
  const [departmentFilter, setDepartmentFilter] = useState('Все отделы');
  const [statusFilter, setStatusFilter] = useState('Все статусы');
  const [isEditEmployer,setIsEditEmployer] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    point_retail_id: 0,
    fullname: '',
    address: '',
    phone: '',
    email: '',
    contract: '',
    url_contract: '',
    url_document: '',
    birthdate: '',
    salary_rate:'',
    start_date_work: '',
    end_date_work: '',
    createUser: false,
    username: '',
    password: '',
    userPosition: '',
    department_id: 1,
    role_id: 1,
    isActive: true
  });
  const [editEmployeeDialogOpen, setEditEmployeeDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [roles, setRoles] = useState([]);
  const [pointsRetail, setPointsRetail] = useState([]);

  // Состояния для графика работы
  const [schedules, setSchedules] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditingCell, setCurrentEditingCell] = useState(null);
  const [openPopover, setOpenPopover] = useState(false);

  const [positions, setPositions] = useState(initialPositions);
  const [departments, setDepartments] = useState(initialDepartments);
  const [addEmployeeSheetOpen, setAddEmployeeSheetOpen] = useState(false);

  const [isAddingEmployee, setIsAddingEmployee] = useState(false);

  const [isProfile,setIsProfile] = useState(false);
  const [selectEmployer, setSelectEmployer] = useState(null);

  const [staff, setStaff] = useState([]);




  useEffect(() => {
    const savedSettings = localStorage.getItem('staffScheduleSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.currentMonth) {
          setCurrentDate(new Date(settings.currentMonth));
        }
        if (settings.filters) {
          if (settings.filters.searchTerm) setSearchTerm(settings.filters.searchTerm);
          if (settings.filters.positionFilter) setPositionFilter(settings.filters.positionFilter);
          if (settings.filters.departmentFilter) setDepartmentFilter(settings.filters.departmentFilter);
          if (settings.filters.statusFilter) setStatusFilter(settings.filters.statusFilter);
        }
      } catch (error) {
        console.error('Ошибка загрузки сохраненных настроек:', error);
      }
    }
  }, []);


  const loadingEmployerProfile = async (employer) => {
    try {
      const token = localStorage.getItem('token');
      const responst = await fetch('employee-profiles/?skip=0&limit=1000',{
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await responst.json();
      const profile = data.find(item => item.employee_id  == employer);
      setSelectEmployer(profile || null);
    }catch(error) {
      setSelectEmployer(null);
    }
  }


  const filterStaffBySalesPoint = useCallback((staff: any[], salesPoint: any) => {
    if (!salesPoint) return staff;
    return staff.filter(employee => employee.point_retail_id === salesPoint.id);
  }, []);


  const filterSchedulesBySalesPoint = useCallback((schedules: any[], staff: any[], salesPoint: any) => {
    if (!salesPoint) return schedules;
    const filteredEmployeeIds = staff
        .filter(employee => employee.point_retail_id === salesPoint.id)
        .map(employee => employee.id);
    return schedules.filter(schedule => filteredEmployeeIds.includes(schedule.employee_id));
  }, []);

  const formatDateWithoutZ = (dateInput) => {
    if (!dateInput) return '';
    let date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      // Если это строка, проверяем наличие Z
      if (dateInput.includes('T') && dateInput.endsWith('Z')) {
        date = new Date(dateInput);
      } else {
        return dateInput;
      }
    } else {
      try {
        date = new Date(dateInput);
      } catch (error) {
        console.error('Ошибка преобразования даты:', dateInput, error);
        return '';
      }
    }


    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };


  const formatDateDayOnly = (dateString) => {
    if (!dateString) return '';

    let date;
    if (dateString instanceof Date) {
      date = dateString;
    } else {
      date = new Date(dateString);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  const createDateFromString = (dateString) => {
    if (!dateString) return new Date();

    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    const loadAllData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [staffResponse, schedulesResponse, rolesResponse, pointsRetailResponse] = await Promise.all([
          fetch('/employees/?skip=0&limit=100', {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('/work-schedules/?skip=0&limit=1000', {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('/roles/?skip=0&limit=100', {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('/points-retail/?skip=0&limit=100', {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })
        ]);

        let staffData = [];
        let schedulesData = [];

        if (staffResponse.ok) {
          staffData = await staffResponse.json();
        }

        if (schedulesResponse.ok) {
          schedulesData = await schedulesResponse.json();
        }

        if (rolesResponse.ok) {
          const rolesData = await rolesResponse.json();
          setRoles(Array.isArray(rolesData) ? rolesData : []);
        }

        if (pointsRetailResponse.ok) {
          const pointsRetailData = await pointsRetailResponse.json();
          setPointsRetail(Array.isArray(pointsRetailData) ? pointsRetailData : []);

          if (selectedSalesPoint && !newEmployee.point_retail_id) {
            setNewEmployee(prev => ({
              ...prev,
              point_retail_id: selectedSalesPoint.id
            }));
          }
        }

        const nonDeletedStaff = staffData.filter(employee =>
            !employee.metadate?.is_deleted
        );

        const filteredStaff = filterStaffBySalesPoint(nonDeletedStaff, selectedSalesPoint);
        const filteredSchedules = filterSchedulesBySalesPoint(schedulesData, staffData, selectedSalesPoint);

        setStaff(filteredStaff);
        setSchedules(Array.isArray(filteredSchedules) ? filteredSchedules : []);

      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadAllData();
  }, [selectedSalesPoint, filterStaffBySalesPoint, filterSchedulesBySalesPoint]);

  // Эффект для перезагрузки данных при смене точки продаж
  useEffect(() => {
    const reloadData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [staffResponse, schedulesResponse] = await Promise.all([
          fetch('/employees/?skip=0&limit=100', {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('/work-schedules/?skip=0&limit=1000', {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })
        ]);

        let staffData = [];
        let schedulesData = [];

        if (staffResponse.ok) {
          staffData = await staffResponse.json();
        }

        if (schedulesResponse.ok) {
          schedulesData = await schedulesResponse.json();
        }

        // Фильтруем данные по выбранной точке продаж
        const filteredStaff = filterStaffBySalesPoint(staffData, selectedSalesPoint);
        const filteredSchedules = filterSchedulesBySalesPoint(schedulesData, staffData, selectedSalesPoint);

        setStaff(filteredStaff);
        setSchedules(Array.isArray(filteredSchedules) ? filteredSchedules : []);

      } catch (error) {
        console.error('Error reloading data:', error);
      }
    };

    reloadData();
  }, [selectedSalesPoint, filterStaffBySalesPoint, filterSchedulesBySalesPoint]);

  const fetchSchedules = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/work-schedules/?skip=0&limit=1000', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Фильтруем графики по выбранной точке продаж
        const filteredSchedules = filterSchedulesBySalesPoint(data, staff, selectedSalesPoint);
        setSchedules(Array.isArray(filteredSchedules) ? filteredSchedules : []);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  // Получение дней месяца
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      days.push({
        date: day,
        dayOfWeek: currentDay.toLocaleDateString('ru-RU', { weekday: 'short' }),
        fullDate: currentDay.toISOString().split('T')[0],
        isWeekend: currentDay.getDay() === 0 || currentDay.getDay() === 6
      });
    }
    return days;
  };

  // Получение смены для сотрудника
  const getScheduleForEmployee = (employeeId, dateKey) => {
    const schedule = schedules.find(s =>
        s.employee_id === employeeId &&
        formatDateDayOnly(s.work_date) === dateKey
    );
    return schedule?.shift_type || '';
  };

  // Цвета для смен
  const getShiftColor = (shift) => {
    switch (shift) {
      case 'day': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'evening': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'night': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'off': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // Перевод типа смены в букву для отображения
  const getShiftLetter = (shift) => {
    switch (shift) {
      case 'day': return 'Д';
      case 'evening': return 'В';
      case 'night': return 'Н';
      case 'off': return 'О';
      default: return shift || '';
    }
  };

  // Перевод буквы в тип смены для отправки
  const getShiftTypeFromLetter = (letter) => {
    switch (letter) {
      case 'Д': return 'day';
      case 'В': return 'evening';
      case 'Н': return 'night';
      case 'О': return 'off';
      default: return '';
    }
  };

  const updateSchedule = async (id, scheduleData) => {
    const token = localStorage.getItem('token');
    try {
      console.log('Обновление смены ID:', id, 'Данные:', scheduleData);

      const response = await fetch(`/work-schedules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scheduleData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка обновления:', errorText);

        let errorMessage = 'Неизвестная ошибка';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorJson.message || errorText;
        } catch {
          errorMessage = errorText;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Смена обновлена:', result);
      await fetchSchedules();

    } catch (error) {
      console.error('Ошибка обновления смены:', error);
      throw error;
    }
  };

  const handleShiftSelect = async (shiftLetter) => {
    if (!currentEditingCell) return;

    const { employeeId, dateKey } = currentEditingCell;

    try {
      const existingSchedule = schedules.find(s =>
          s.employee_id === employeeId &&
          formatDateDayOnly(s.work_date) === dateKey
      );

      const shiftType = getShiftTypeFromLetter(shiftLetter);

      if (shiftLetter === '') {
        // Удаляем смену
        if (existingSchedule?.id) {
          await deleteSchedule(existingSchedule.id);
        }
      } else {
        // Создаем базовую дату из строки YYYY-MM-DD
        const baseDate = createDateFromString(dateKey);

        // Формируем время для разных смен
        let startTime, endTime;

        switch (shiftType) {
          case 'day':
            baseDate.setHours(8, 0, 0, 0);
            startTime = formatDateWithoutZ(baseDate);
            baseDate.setHours(16, 0, 0, 0);
            endTime = formatDateWithoutZ(baseDate);
            break;
          case 'evening':
            baseDate.setHours(16, 0, 0, 0);
            startTime = formatDateWithoutZ(baseDate);
            baseDate.setHours(23, 59, 59, 999);
            endTime = formatDateWithoutZ(baseDate);
            break;
          case 'night':
            baseDate.setHours(0, 0, 0, 0);
            startTime = formatDateWithoutZ(baseDate);
            // Ночная смена заканчивается на следующий день в 8 утра
            const nextDay = new Date(baseDate);
            nextDay.setDate(nextDay.getDate() + 1);
            nextDay.setHours(8, 0, 0, 0);
            endTime = formatDateWithoutZ(nextDay);
            break;
          case 'off':
            baseDate.setHours(0, 0, 0, 0);
            startTime = formatDateWithoutZ(baseDate);
            baseDate.setHours(23, 59, 59, 999);
            endTime = formatDateWithoutZ(baseDate);
            break;
          default:
            baseDate.setHours(8, 0, 0, 0);
            startTime = formatDateWithoutZ(baseDate);
            baseDate.setHours(20, 0, 0, 0);
            endTime = formatDateWithoutZ(baseDate);
        }

        // Создаем дату для work_date (только дата, без времени)
        const workDate = new Date(baseDate);
        workDate.setHours(0, 0, 0, 0);

        // Создаем данные в правильном формате согласно API
        const scheduleData = {
          employee_id: employeeId,
          work_date: formatDateWithoutZ(workDate),
          start_time: startTime,
          end_time: endTime,
          shift_type: shiftType,
          status: 'scheduled',
          break_duration: 60,
          notes: '',
          metadate: {}
        };

        console.log('Отправляемые данные графика:', scheduleData);

        if (existingSchedule?.id) {
          await updateSchedule(existingSchedule.id, scheduleData);
        } else {
          await createSchedule(scheduleData);
        }
      }

      setOpenPopover(false);
      setCurrentEditingCell(null);
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert(`Ошибка при сохранении смены: ${error.message}`);
    }
  };

  const createSchedule = async (scheduleData) => {
    const token = localStorage.getItem('token');
    try {
      console.log('Создание смены, данные:', scheduleData);

      const response = await fetch('/work-schedules/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scheduleData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка создания:', errorText);

        let errorMessage = 'Неизвестная ошибка';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorJson.message || errorText;
        } catch {
          errorMessage = errorText;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Смена создана:', result);
      await fetchSchedules();

    } catch (error) {
      console.error('Ошибка создания смены:', error);
      throw error;
    }
  };

  const deleteSchedule = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/work-schedules/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка удаления смены:', errorText);

        let errorMessage = 'Неизвестная ошибка';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorJson.message || errorText;
        } catch {
          errorMessage = errorText;
        }

        throw new Error(errorMessage);
      }

      await fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setEditEmployeeDialogOpen(true);
  };

  const handleUpdateEmployee = async () => {
    const token = localStorage.getItem('token');
    if (!editingEmployee.fullname || !editingEmployee.phone || !editingEmployee.start_date_work) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      const response = await fetch(`/employees/${editingEmployee.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        method: 'PUT',
        body: JSON.stringify({
          ...editingEmployee,
          point_retail_id: parseInt(editingEmployee.point_retail_id) || 0,
          salary_rate: editingEmployee.salary_rate || null // Добавляем зарплату
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      // Обновляем список сотрудников
      const updatedStaff = staff.map(emp =>
          emp.id === editingEmployee.id ? { ...emp, ...editingEmployee } : emp
      );
      setStaff(updatedStaff);

      setEditEmployeeDialogOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error('Ошибка обновления:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setNewEmployee(prev => ({ ...prev, [field]: value }));
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.fullname || !newEmployee.phone || !newEmployee.start_date_work) {
      alert('Пожалуйста, заполните все обязательные поля (ФИО, телефон, дата приема)');
      return;
    }

    if (newEmployee.createUser && (!newEmployee.username || !newEmployee.password)) {
      alert('Для создания учетной записи заполните имя пользователя и пароль');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const pointRetailId = selectedSalesPoint ? selectedSalesPoint.id : parseInt(newEmployee.point_retail_id) || 0;

      // 1. Сначала создаем базового сотрудника в таблице employees
      const employeeData = {
        point_retail_id: pointRetailId,
        fullname: newEmployee.fullname,
        salary_rate: newEmployee.salary_rate || '',
        metadate: {}
      };

      console.log('Создаем сотрудника в таблице employees:', employeeData);
      const employeeResponse = await fetch('/employees/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(employeeData)
      });

      if (!employeeResponse.ok) {
        const errorText = await employeeResponse.text();
        throw new Error(`Ошибка при создании сотрудника в таблице employees: ${errorText}`);
      }

      const employeeResult = await employeeResponse.json();
      const employeeId = employeeResult.id;
      console.log('Сотрудник создан в таблице employees, ID:', employeeId);


      const profileData = {
        employee_id: employeeId,
        fullname: newEmployee.fullname,
        address: newEmployee.address || '',
        phone: newEmployee.phone,
        email: newEmployee.email || '',
        contract: newEmployee.contract || '',
        url_contract: newEmployee.url_contract || '',
        url_document: newEmployee.url_document || '',
        salary_rate: newEmployee.salary_rate || '',
        birthdate: newEmployee.birthdate ? `${newEmployee.birthdate}T12:00:00` : null,
        start_date_work: newEmployee.start_date_work ? `${newEmployee.start_date_work}T12:00:00` : null,
        end_date_work: newEmployee.end_date_work ? `${newEmployee.end_date_work}T12:00:00` : null
      };

      console.log('Создаем профиль сотрудника:', profileData);
      const profileResponse = await fetch('/employee-profiles/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData)
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('Ошибка при создании профиля:', errorText);


        await fetch(`/employees/${employeeId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        throw new Error(`Ошибка при создании профиля сотрудника: ${errorText}`);
      }

      const profileResult = await profileResponse.json();
      console.log('Профиль сотрудника создан:', profileResult);


      if (newEmployee.createUser) {

        const generateUniquePassword = () => {
          const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
          let password = '';
          for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return password;
        };

        const userPassword = newEmployee.password || generateUniquePassword();


        const userData = {
          point_retail_id: pointRetailId,
          employee_id: employeeResult.id,
          department_id: newEmployee.department_id || 1,
          role_id: newEmployee.role_id || 1,
          username: newEmployee.username,
          pincode: newEmployee.password,
          last_login: null,
          is_active: newEmployee.isActive !== false,
          metadate: {
            full_name: newEmployee.fullname,
            position: newEmployee.userPosition || newEmployee.contract || 'Employee',
            email: newEmployee.email || '',
            phone: newEmployee.phone
          }
        };

        console.log('Создаем пользователя:', userData);
        const userResponse = await fetch('/users/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(userData)
        });

        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          console.warn('Пользователь не создан:', errorText);
          alert(`Сотрудник и профиль созданы успешно! Но не удалось создать учетную запись: ${errorText}\n\nЛогин: ${newEmployee.username}\nПароль: ${userPassword}`);
        } else {
          const userResult = await userResponse.json();
          console.log('Пользователь создан:', userResult);
          alert('Сотрудник, профиль и учетная запись успешно созданы!');
        }
      } else {
        alert('Сотрудник и профиль успешно созданы!');
      }

      // 4. Обновляем список сотрудников
      const updatedProfilesResponse = await fetch('/employee-profiles/?skip=0&limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (updatedProfilesResponse.ok) {
        const allProfiles = await updatedProfilesResponse.json();
        const filteredProfiles = allProfiles.filter(profile => {

          return true;
        });
      }

      setIsAddingEmployee(false);
      setNewEmployee({
        point_retail_id: selectedSalesPoint ? selectedSalesPoint.id : (pointsRetail.length > 0 ? pointsRetail[0].id : 0),
        fullname: '',
        address: '',
        phone: '',
        email: '',
        contract: '',
        url_contract: '',
        salary_rate: '',
        url_document: '',
        birthdate: '',
        start_date_work: '',
        end_date_work: '',
        createUser: false,
        username: '',
        password: '',
        userPosition: '',
        department_id: 1,
        role_id: 1,
        isActive: true
      });

    } catch (error) {
      console.error('Ошибка:', error);
      alert(`Не удалось добавить сотрудника: ${error.message}`);
    }
  };




  const handleDeleteEmployee = async (employeeId) => {
    const token = localStorage.getItem('token');
    if (!confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      return;
    }
    try {
      const response = await fetch(`/employees/${employeeId}`, {
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        method: 'PUT',
        body: JSON.stringify({
          metadate: {
            is_deleted: true,
            deleted_at: new Date().toISOString(),
            ...(staff.find(emp => emp.id === employeeId)?.metadate || {})
          }
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка ${response.status}: ${errorText}`);
      }
      const updatedStaff = staff.map(emp => {
        if (emp.id === employeeId) {
          return {
            ...emp,
            metadate: {
              ...emp.metadate,
              is_deleted: true,
              deleted_at: new Date().toISOString()
            }
          };
        }
        return emp;
      });
      setStaff(updatedStaff);
      alert('Сотрудник удален!');

    } catch (error) {
      console.error('Ошибка:', error);
      alert(`Не удалось удалить сотрудника: ${error.message}`);
    }
  };


  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  const filteredStaff = staff.filter(employee => {

    if (employee.metadate?.is_deleted) {
      return false;
    }

    const matchesSearch = employee.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone?.includes(searchTerm) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === 'Все должности' || employee.position === positionFilter;
    const matchesDepartment = departmentFilter === 'Все отделы' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'Все статусы' || employee.status === statusFilter;
    return matchesSearch && matchesPosition && matchesDepartment && matchesStatus;
  });

  const getStaffStats = () => {
    const activeStaff = staff.filter(emp => !emp.is_deleted);
    const total = activeStaff.length;
    const working = activeStaff.filter(emp => emp.status === 'работает').length;
    const onLeave = activeStaff.filter(emp => emp.status === 'отпуск' || emp.status === 'больничный').length;
    const avgSalary = activeStaff.length > 0 ?
        Math.round(activeStaff.reduce((sum, emp) => sum + (emp.salary || 0), 0) / activeStaff.length) : 0;

    return { total, working, onLeave, avgSalary };
  };

  const stats = getStaffStats();
  const daysInMonth = getDaysInMonth(currentDate);
  if (isAddingEmployee) {
    return (
        <div className="space-y-6">
          {/* Кнопка возврата */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setIsAddingEmployee(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к списку
            </Button>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">Новый сотрудник</Badge>
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
            background: 'var(--custom-bg-primaryLine)',
            color: 'var(--custom-text)',
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div >
                  <CardTitle style={{color:'var(--custom-text)'}} className="text-2xl flex items-center gap-3 text-white">
                    <User className="h-6 w-6 text-orange-600 " />
                    Добавление нового сотрудника
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Заполните всю необходимую информацию о новом сотруднике
                    {selectedSalesPoint && ` для точки продаж: ${selectedSalesPoint.name}`}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Форма добавления сотрудника */}
          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardContent className="p-6">
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* Показываем выбранную точку продаж как read-only */}
                {selectedSalesPoint && (
                    <div className="space-y-2">
                      <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Точка продаж</label>
                      <Input
                          value={`${selectedSalesPoint.name} (${selectedSalesPoint.address})`}
                          disabled
                          className="bg-gray-100"
                          style={{
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-inpyt)',
                            color: 'var(--custom-text)',
                          }}
                      />
                      <input
                          type="hidden"
                          value={selectedSalesPoint.id}
                          onChange={(e) => handleInputChange('point_retail_id', parseInt(e.target.value))}
                      />
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">ФИО *</label>
                  <Input
                      placeholder="Фамилия Имя Отчество"
                      value={newEmployee.fullname}
                      onChange={(e) => handleInputChange('fullname', e.target.value)}
                      style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                      }}
                  />
                </div>

                <div className="space-y-2">
                  <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Адрес</label>
                  <Input
                      placeholder="Адрес проживания"
                      value={newEmployee.address}
                      style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                      }}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Телефон *</label>
                    <Input
                        placeholder="+7 (999) 123-45-67"
                        value={newEmployee.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Email</label>
                    <Input
                        placeholder="email@restaurant.ru"
                        value={newEmployee.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Договор</label>
                    <Input
                        placeholder="Номер договора"
                        value={newEmployee.contract}
                        onChange={(e) => handleInputChange('contract', e.target.value)}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Зарплата</label>
                    <Input
                        placeholder="Зарплата"
                        value={newEmployee.salary_rate || ''}
                        onChange={(e) => handleInputChange('salary_rate', e.target.value)}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Дата рождения</label>
                    <Input
                        type="date"
                        value={newEmployee.birthdate || ''}
                        onChange={(e) => handleInputChange('birthdate', e.target.value)}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Дата приема на работу *</label>
                    <Input
                        type="date"
                        value={newEmployee.start_date_work || ''}
                        onChange={(e) => handleInputChange('start_date_work', e.target.value)}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Дата увольнения</label>
                    <Input
                        type="date"
                        value={newEmployee.end_date_work || ''}
                        onChange={(e) => handleInputChange('end_date_work', e.target.value)}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Ссылка на договор</label>
                    <Input
                        placeholder="URL договора"
                        value={newEmployee.url_contract}
                        onChange={(e) => handleInputChange('url_contract', e.target.value)}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Ссылка на документы</label>
                    <Input
                        placeholder="URL документов"
                        value={newEmployee.url_document}
                        onChange={(e) => handleInputChange('url_document', e.target.value)}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>
                </div>

                {/* Checkbox для создания пользователя */}
                <div className="flex items-center space-x-2 pt-4 border-t">
                  <input
                      type="checkbox"
                      id="createUser"
                      checked={newEmployee.createUser || false}
                      onChange={(e) => handleInputChange('createUser', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label style={{color:'var(--custom-text)'}} htmlFor="createUser" className="text-sm font-medium text-white">
                    Создать учетную запись пользователя
                  </label>
                </div>

                {/* Дополнительные поля для пользователя */}
                {newEmployee.createUser && (
                    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50" style={{
                      borderRadius: '20px',
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-secondaryLineCard)',
                      color: 'var(--custom-text)',
                    }}>
                      <h3 style={{color:'var(--custom-text)'}} className="text-lg font-medium text-white">Учетная запись пользователя</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Имя пользователя *</label>
                          <Input
                              placeholder="username"
                              value={newEmployee.username || ''}
                              onChange={(e) => handleInputChange('username', e.target.value)}
                              style={{
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-inpyt)',
                                color: 'var(--custom-text)',
                              }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Пароль *</label>
                          <Input
                              type="password"
                              placeholder="Пароль"
                              value={newEmployee.password || ''}
                              onChange={(e) => handleInputChange('password', e.target.value)}
                              style={{
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-inpyt)',
                                color: 'var(--custom-text)',
                              }}
                              maxLength='4'
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Должность</label>
                          <Input
                              placeholder="Должность в системе"
                              value={newEmployee.userPosition || ''}
                              onChange={(e) => handleInputChange('userPosition', e.target.value)}
                              style={{
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-inpyt)',
                                color: 'var(--custom-text)',
                              }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Роль *</label>
                          <Select
                              value={newEmployee.role_id?.toString() || ''}
                              onValueChange={(value) => handleInputChange('role_id', parseInt(value))}
                              style={{
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-inpyt)',
                                color: 'var(--custom-text)',
                              }}
                          >
                            <SelectTrigger    style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}>
                              <SelectValue placeholder="Выберите роль" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                  <SelectItem key={role.id} value={role.id.toString()}>
                                    {role.name}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={newEmployee.isActive || true}
                            onChange={(e) => handleInputChange('isActive', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <label style={{color:'var(--custom-text)'}} htmlFor="isActive" className="text-sm font-medium text-white">
                          Активный пользователь
                        </label>
                      </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsAddingEmployee(false)}>
                    Отмена
                  </Button>
                  <Button
                      onClick={handleAddEmployee}
                      className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить сотрудника
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    );
  }

  if (editEmployeeDialogOpen) {
    return (
        <div className="space-y-6">
          {/* Кнопка возврата */}
          <div className="flex items-center justify-between" >
            <Button variant="outline" onClick={() => setEditEmployeeDialogOpen(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к списку
            </Button>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">Редактирование сотрудника</Badge>
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
            background: 'var(--custom-bg-primaryLine)',
            color: 'var(--custom-text)',
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle style={{color:'var(--custom-text)'}} className="text-2xl flex items-center text-white gap-3">
                    <User className="h-6 w-6 text-orange-600 " />
                    Редактирование сотрудника
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Внесите изменения в информацию о сотруднике
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Форма редактирования сотрудника */}
          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardContent className="p-6">
              <div className="space-y-6 max-w-4xl mx-auto">
                {editingEmployee && (
                    <>
                      {/* Показываем выбранную точку продаж как read-only */}
                      {selectedSalesPoint && (
                          <div className="space-y-2">
                            <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white" >Точка продаж</label>
                            <Input
                                value={`${selectedSalesPoint.name} (${selectedSalesPoint.address || ''})`}
                                disabled
                                className="bg-gray-100"
                                style={{
                                  border: 'var(--custom-border-primary)',
                                  background: 'var(--custom-bg-inpyt)',
                                  color: 'var(--custom-text)',
                                }}
                            />
                            <input
                                type="hidden"
                                value={selectedSalesPoint.id}
                                onChange={(e) => setEditingEmployee(prev => ({
                                  ...prev,
                                  point_retail_id: parseInt(e.target.value)

                                }))}
                            />
                          </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">ФИО *</label>
                          <Input
                              placeholder="Фамилия Имя Отчество"
                              value={editingEmployee.fullname || ''}
                              onChange={(e) => setEditingEmployee(prev => ({
                                ...prev,
                                fullname: e.target.value
                              }))}
                              style={{
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-inpyt)',
                                color: 'var(--custom-text)',
                              }}
                          />
                        </div>

                        <div className="space-y-2">
                          <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Адрес</label>
                          <Input
                              placeholder="Адрес проживания"
                              value={editingEmployee.address || ''}
                              onChange={(e) => setEditingEmployee(prev => ({
                                ...prev,
                                address: e.target.value
                              }))}
                              style={{
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-inpyt)',
                                color: 'var(--custom-text)',
                              }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white" >Телефон *</label>
                          <Input
                              placeholder="+7 (999) 123-45-67"
                              value={editingEmployee.phone || ''}
                              onChange={(e) => setEditingEmployee(prev => ({
                                ...prev,
                                phone: e.target.value
                              }))}
                              style={{
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-inpyt)',
                                color: 'var(--custom-text)',
                              }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Email</label>
                          <Input
                              placeholder="email@restaurant.ru"
                              value={editingEmployee.email || ''}
                              onChange={(e) => setEditingEmployee(prev => ({
                                ...prev,
                                email: e.target.value
                              }))}
                              style={{
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-inpyt)',
                                color: 'var(--custom-text)',
                              }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Договор</label>
                          <Input
                              placeholder="Номер договора"
                              value={editingEmployee.contract || ''}
                              onChange={(e) => setEditingEmployee(prev => ({
                                ...prev,
                                contract: e.target.value
                              }))}
                              style={{
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-inpyt)',
                                color: 'var(--custom-text)',
                              }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Зарплата</label>
                          <Input
                              type="number"
                              placeholder="Зарплата"
                              value={editingEmployee.salary_rate || ''}
                              onChange={(e) => setEditingEmployee(prev => ({
                                ...prev,
                                salary_rate: e.target.value
                              }))}
                              style={{
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-inpyt)',
                                color: 'var(--custom-text)',
                              }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Дата рождения</label>
                          <Input
                              type="date"
                              value={formatDateForInput(editingEmployee.birthdate)}
                              onChange={(e) => setEditingEmployee(prev => ({
                                ...prev,
                                birthdate: e.target.value
                              }))}
                              style={{
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-inpyt)',
                                color: 'var(--custom-text)',
                              }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Дата приема на работу *</label>
                          <Input
                              type="date"
                              value={formatDateForInput(editingEmployee.start_date_work)}
                              onChange={(e) => setEditingEmployee(prev => ({
                                ...prev,
                                start_date_work: e.target.value
                              }))}
                              style={{
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-inpyt)',
                                color: 'var(--custom-text)',
                              }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Дата увольнения</label>
                          <Input
                              type="date"
                              value={formatDateForInput(editingEmployee.end_date_work)}
                              onChange={(e) => setEditingEmployee(prev => ({
                                ...prev,
                                end_date_work: e.target.value
                              }))}
                              style={{
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-inpyt)',
                                color: 'var(--custom-text)',
                              }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Ссылка на договор</label>
                          <Input
                              placeholder="URL договора"
                              value={editingEmployee.url_contract || ''}
                              onChange={(e) => setEditingEmployee(prev => ({
                                ...prev,
                                url_contract: e.target.value
                              }))}
                              style={{
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-inpyt)',
                                color: 'var(--custom-text)',
                              }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label style={{color:'var(--custom-text)'}} className="text-sm font-medium text-white">Ссылка на документы</label>
                          <Input
                              placeholder="URL документов"
                              value={editingEmployee.url_document || ''}
                              onChange={(e) => setEditingEmployee(prev => ({
                                ...prev,
                                url_document: e.target.value
                              }))}
                              style={{
                                border: 'var(--custom-border-primary)',
                                background: 'var(--custom-bg-inpyt)',
                                color: 'var(--custom-text)',
                              }}
                          />
                        </div>
                      </div>


                      {!selectedSalesPoint && (
                          <div className="space-y-2" >
                            <label style={{color:'var(--custom-text)'}} className="text-sm font-medium">Точка продаж *</label>
                            <Select
                                value={editingEmployee.point_retail_id?.toString() || ''}
                                onValueChange={(value) => setEditingEmployee(prev => ({
                                  ...prev,
                                  point_retail_id: parseInt(value)
                                }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите точку продаж" />
                              </SelectTrigger>
                              <SelectContent>
                                {pointsRetail.map((point) => (
                                    <SelectItem key={point.id} value={point.id.toString()}>
                                      {point.name} ({point.address})
                                    </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                      )}


                      {editingEmployee.user && (
                          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <h3 className="text-lg font-medium">Учетная запись пользователя</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Имя пользователя</label>
                                <Input
                                    value={editingEmployee.user.username || ''}
                                    disabled
                                    className="bg-gray-100"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Должность</label>
                                <Input
                                    value={editingEmployee.user.position || ''}
                                    disabled
                                    className="bg-gray-100"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Роль</label>
                              <Input
                                  value={editingEmployee.user.role?.name || ''}
                                  disabled
                                  className="bg-gray-100"
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <input
                                  type="checkbox"
                                  checked={editingEmployee.user.is_active || false}
                                  disabled
                                  className="h-4 w-4 rounded border-gray-300"
                              />
                              <label className="text-sm font-medium">
                                Активный пользователь
                              </label>
                            </div>
                          </div>
                      )}

                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => setEditEmployeeDialogOpen(false)}
                        >
                          Отмена
                        </Button>
                        <Button
                            onClick={handleUpdateEmployee}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                          Сохранить изменения
                        </Button>
                      </div>
                    </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
    )
  }


  if (isProfile && selectEmployer) {
    const handleSaveProfile = async () => {
      try {
        const token = localStorage.getItem('token');

        // Подготавливаем данные для обновления
        const updateData = {
          fullname: selectEmployer.fullname,
          address: selectEmployer.address,
          phone: selectEmployer.phone,
          email: selectEmployer.email,
          contract: selectEmployer.contract || '',
          url_contract: selectEmployer.url_contract || '',
          url_document: selectEmployer.url_document || '',
          salary_rate: selectEmployer.salary_rate || '',
          birthdate: selectEmployer.birthdate || null,
          start_date_work: selectEmployer.start_date_work || null,
          end_date_work: selectEmployer.end_date_work || null
        };

        console.log('Обновляем профиль сотрудника:', updateData);

        const response = await fetch(`/employee-profiles/${selectEmployer.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updateData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ошибка обновления профиля: ${errorText}`);
        }

        const updatedProfile = await response.json();
        console.log('Профиль обновлен:', updatedProfile);

        // Обновляем локальное состояние
        setSelectEmployer(updatedProfile);

        // Обновляем список сотрудников
        const updatedProfilesResponse = await fetch('/employee-profiles/?skip=0&limit=1000', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        if (updatedProfilesResponse.ok) {
          const allProfiles = await updatedProfilesResponse.json();
          // Обновляем staff с новыми данными профиля
          const updatedStaff = staff.map(emp => {
            if (emp.employee_id === selectEmployer.employee_id || emp.id === selectEmployer.employee_id) {
              return { ...emp, ...updatedProfile };
            }
            return emp;
          });
          setStaff(updatedStaff);
        }

        setIsEditEmployer(false);
        alert('Профиль успешно обновлен!');

      } catch (error) {
        console.error('Ошибка сохранения профиля:', error);
        alert(`Не удалось сохранить изменения: ${error.message}`);
      }
    };

    const handleInputChange = (field, value) => {
      setSelectEmployer(prev => ({
        ...prev,
        [field]: value
      }));
    };

    return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setIsProfile(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к списку
            </Button>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">Информация о сотруднике</Badge>
              {selectedSalesPoint && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Точка продаж: {selectedSalesPoint.name}
                  </div>
              )}
            </div>
          </div>

          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-primaryLine)',
            color: 'var(--custom-text)',
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle style={{color:'var(--custom-text)'}} className="text-2xl flex items-center gap-3 text-white">
                    <User className="h-6 w-6 text-orange-600" />
                    Информация о сотруднике
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedSalesPoint && ` для точки продаж: ${selectedSalesPoint.name}`}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border shadow-lg overflow-hidden" style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-secondaryLineCard)',
            color: 'var(--custom-text)',
          }}>
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-black">
                <div className="flex items-center justify-between">
                  <div >
                    <h2 style={{color:'var(--custom-text)'}} className="text-2xl font-bold font-medium flex items-center gap-3 text-white">
                      <div className="bg-black p-2 rounded-lg">
                        <User className="h-6 w-6" />
                      </div>
                      {selectEmployer.fullname}
                    </h2>
                    <p style={{color:'var(--custom-text)'}} className="text-blue-100 mt-1 opacity-90 text-white">Профиль сотрудника</p>
                  </div>
                  <Badge
                      variant={selectEmployer.end_date_work ? "destructive" : "default"}
                      className="text-sm px-4 py-1 backdrop-blur-sm border-black"
                  >
                    {selectEmployer.end_date_work ? "Неактивен" : "Активен"}
                  </Badge>
                </div>
              </div>
              <div className="p-6 space-y-8" >
                <div  className="grid md:grid-cols-2 gap-8">

                  <div className="space-y-4" >
                    <div style={{color:'var(--custom-text)'}} className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                      <Phone style={{color:'var(--custom-text)'}} className="h-5 w-5 text-blue-600" />
                      <h3 style={{color:'var(--custom-text)'}} className='text-white'>Контактная информация</h3>
                    </div>
                    <div className="space-y-3 pl-7">

                      {isEditEmployer ? (
                              <>
                                <div style={{color:'var(--custom-text)'}} className="flex items-start gap-3">
                                  <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                                  <div>
                                    <p style={{color:'var(--custom-text)'}} className="text-sm text-gray-500">Телефон</p>
                                    <input
                                        type='text'
                                        value={selectEmployer.phone || ''}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        style={{
                                          border: 'var(--custom-border-primary)',
                                          background: 'var(--custom-bg-inpyt)',
                                          color: 'var(--custom-text)',
                                        }}
                                    />
                                  </div>
                                </div>

                                <div className="flex items-start gap-3">
                                  <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                                  <div>
                                    <p style={{color:'var(--custom-text)'}} className="text-sm text-gray-500">Email</p>
                                    <input
                                        type='text'
                                        value={selectEmployer.email || ''}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        style={{
                                          border: 'var(--custom-border-primary)',
                                          background: 'var(--custom-bg-inpyt)',
                                          color: 'var(--custom-text)',
                                        }}
                                    />
                                  </div>
                                </div>

                                <div className="flex items-start gap-3">
                                  <Home className="h-4 w-4 text-gray-400 mt-0.5" />
                                  <div>
                                    <p style={{color:'var(--custom-text)'}} className="text-sm text-gray-500">Адрес</p>
                                    <input
                                        type='text'
                                        value={selectEmployer.address || ''}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        style={{
                                          border: 'var(--custom-border-primary)',
                                          background: 'var(--custom-bg-inpyt)',
                                          color: 'var(--custom-text)',
                                        }}
                                    />
                                  </div>
                                </div>

                              </>
                          ) :
                          (
                              <>
                                <div className="flex items-start gap-3">
                                  <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                                  <div>
                                    <p style={{color:'var(--custom-text)'}} className="text-sm text-gray-500">Телефон</p>
                                    <p style={{color:'var(--custom-text)'}} className="font-medium text-white">{selectEmployer.phone}</p>
                                  </div>
                                </div>

                                <div style={{color:'var(--custom-text)'}} className="flex items-start gap-3">
                                  <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                                  <div >
                                    <p style={{color:'var(--custom-text)'}} className="text-sm text-gray-500">Email</p>
                                    <p style={{color:'var(--custom-text)'}} className="font-medium text-white">{selectEmployer.email}</p>
                                  </div>
                                </div>

                                <div className="flex items-start gap-3">
                                  <Home className="h-4 w-4 text-gray-400 mt-0.5" />
                                  <div>
                                    <p style={{color:'var(--custom-text)'}} className="text-sm text-gray-500">Адрес</p>
                                    <p style={{color:'var(--custom-text)'}} className="font-medium text-white">{selectEmployer.address}</p>
                                  </div>
                                </div>
                              </>
                          )}

                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold text-white">
                      <Briefcase className="h-5 w-5 text-green-600" />
                      <h3 style={{color:'var(--custom-text)'}}>Трудовая информация</h3>
                    </div>

                    <div className="space-y-3 pl-7">

                      {isEditEmployer ? (
                          <>
                            <div className="flex items-start gap-3">
                              <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p style={{color:'var(--custom-text)'}} className="text-sm text-gray-500">Дата рождения</p>
                                <input
                                    type="date"
                                    value={selectEmployer.birthdate ? selectEmployer.birthdate.split('T')[0] : ''}
                                    onChange={(e) => handleInputChange('birthdate', e.target.value ? `${e.target.value}T12:00:00` : null)}
                                    style={{
                                      border: 'var(--custom-border-primary)',
                                      background: 'var(--custom-bg-inpyt)',
                                      color: 'var(--custom-text)',
                                    }}
                                />
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <CalendarDays className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p style={{color:'var(--custom-text)'}} className="text-sm text-gray-500">Дата начала работы</p>
                                <input
                                    type="date"
                                    value={selectEmployer.start_date_work ? selectEmployer.start_date_work.split('T')[0] : ''}
                                    onChange={(e) => handleInputChange('start_date_work', e.target.value ? `${e.target.value}T12:00:00` : null)}
                                    style={{
                                      border: 'var(--custom-border-primary)',
                                      background: 'var(--custom-bg-inpyt)',
                                      color: 'var(--custom-text)',
                                    }}
                                />
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <CalendarX className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p style={{color:'var(--custom-text)'}} className="text-sm text-gray-500">Дата окончания работы</p>
                                <input
                                    type="date"
                                    value={selectEmployer.end_date_work ? selectEmployer.end_date_work.split('T')[0] : ''}
                                    onChange={(e) => handleInputChange('end_date_work', e.target.value ? `${e.target.value}T12:00:00` : null)}
                                    style={{
                                      border: 'var(--custom-border-primary)',
                                      background: 'var(--custom-bg-inpyt)',
                                      color: 'var(--custom-text)',
                                    }}
                                />
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <DollarSign className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p style={{color:'var(--custom-text)'}} className="text-sm text-gray-500">Зарплата</p>
                                <input
                                    type="text"
                                    value={selectEmployer.salary_rate || ''}
                                    onChange={(e) => handleInputChange('salary_rate', e.target.value)}
                                    placeholder="Зарплата"
                                    style={{
                                      border: 'var(--custom-border-primary)',
                                      background: 'var(--custom-bg-inpyt)',
                                      color: 'var(--custom-text)',
                                    }}
                                />
                              </div>
                            </div>
                          </>
                      ): (
                          <>
                            <div className="flex items-start gap-3">
                              <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p style={{color:'var(--custom-text)'}} className="text-sm text-gray-500">Дата рождения</p>
                                <p style={{color:'var(--custom-text)'}} className="font-medium text-white">
                                  {selectEmployer.birthdate ? new Date(selectEmployer.birthdate).toLocaleDateString('ru-RU', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  }) : 'Не указано'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <CalendarDays className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p style={{color:'var(--custom-text)'}} className="text-sm text-gray-500">Дата начала работы</p>
                                <p style={{color:'var(--custom-text)'}} className="font-medium text-white">
                                  {selectEmployer.start_date_work ? new Date(selectEmployer.start_date_work).toLocaleDateString('ru-RU', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  }) : 'Не указано'}
                                </p>
                              </div>
                            </div>
                            {selectEmployer.end_date_work && (
                                <div className="flex items-start gap-3">
                                  <CalendarX className="h-4 w-4 text-red-400 mt-0.5" />
                                  <div>
                                    <p style={{color:'var(--custom-text)'}} className="text-sm text-gray-500">Дата окончания работы</p>
                                    <p  className="font-medium text-red-600">
                                      {new Date(selectEmployer.end_date_work).toLocaleDateString('ru-RU', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>
                            )}
                            {selectEmployer.salary_rate && (
                                <div className="flex items-start gap-3">
                                  <DollarSign className="h-4 w-4 text-gray-400 mt-0.5" />
                                  <div>
                                    <p className="text-sm text-gray-500">Зарплата</p>
                                    <p className="font-medium text-white">₽{selectEmployer.salary_rate}</p>
                                  </div>
                                </div>
                            )}
                          </>
                      )}

                    </div>

                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Дополнительные поля */}
                  {isEditEmployer && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-lg font-semibold text-white">
                          <FileText className="h-5 w-5 text-yellow-600" />
                          <h3 style={{color:'var(--custom-text)'}}>Документы</h3>
                        </div>
                        <div className="space-y-3 pl-7">
                          <div className="flex items-start gap-3">
                            <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p style={{color:'var(--custom-text)'}} className="text-sm text-gray-500">Договор</p>
                              <input
                                  type='text'
                                  value={selectEmployer.contract || ''}
                                  onChange={(e) => handleInputChange('contract', e.target.value)}
                                  placeholder="Номер договора"
                                  style={{
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-inpyt)',
                                    color: 'var(--custom-text)',
                                  }}
                              />
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <ExternalLink className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Ссылка на договор</p>
                              <input
                                  type='text'
                                  value={selectEmployer.url_contract || ''}
                                  onChange={(e) => handleInputChange('url_contract', e.target.value)}
                                  placeholder="URL договора"
                                  style={{
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-inpyt)',
                                    color: 'var(--custom-text)',
                                  }}
                              />
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <ExternalLink className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Ссылка на документы</p>
                              <input
                                  type='text'
                                  value={selectEmployer.url_document || ''}
                                  onChange={(e) => handleInputChange('url_document', e.target.value)}
                                  placeholder="URL документов"
                                  style={{
                                    border: 'var(--custom-border-primary)',
                                    background: 'var(--custom-bg-inpyt)',
                                    color: 'var(--custom-text)',
                                  }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  {isEditEmployer ? (
                      <>
                        <Button variant="outline" className="gap-2" onClick={() => setIsEditEmployer(false)}>
                          <XCircle className="h-4 w-4" />
                          Отмена
                        </Button>
                        <Button variant="default" className="gap-2 bg-green-600 hover:bg-green-700" onClick={handleSaveProfile}>
                          <Save className="h-4 w-4" />
                          Сохранить изменения
                        </Button>
                      </>
                  ) : (
                      <Button variant="outline" className="gap-2" onClick={() => setIsEditEmployer(true)}>
                        <Edit className="h-4 w-4" />
                        Редактировать профиль
                      </Button>
                  )}
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
              <CardContent className="pt-6" >
                <div style={{color:'var(--custom-text)'}} className="flex items-center gap-2 text-sm text-muted-foreground text-white">
                  <MapPin className="h-4 w-4" />
                  Точка продаж: {selectedSalesPoint.name}
                  {selectedSalesPoint.address && ` (${selectedSalesPoint.address})`}
                </div>
              </CardContent>
            </Card>
        )}

        <Tabs defaultValue="employees" className="space-y-6" >
          <TabsList className="grid w-full grid-cols-6 bg-blue-100"  >
            <TabsTrigger value="employees">Сотрудники</TabsTrigger>
            <TabsTrigger value="schedule">График работы</TabsTrigger>
            <TabsTrigger value="timesheet">Табель</TabsTrigger>
            <TabsTrigger value="leaves">Отпуска и больничные</TabsTrigger>
            <TabsTrigger value="payroll">Расчет зарплаты</TabsTrigger>
          </TabsList>

          {/* Вкладка Сотрудники */}
          <TabsContent value="employees" className="space-y-6">
            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-primaryLine)',
                color: 'var(--custom-text)',
              }}>
                <CardHeader style={{color:'var(--custom-text)'}} className="pb-2 text-white">
                  <CardTitle style={{color:'var(--custom-text)'}} className="text-sm flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Всего сотрудников
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-orange-600">{stats.total}</div>
                  <div  className="text-xs text-muted-foreground">
                    Активных: {stats.working}
                  </div>
                </CardContent>
              </Card >
              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-primaryLine)',
                color: 'var(--custom-text)',
              }}>
                <CardHeader className="pb-2 text-white">
                  <CardTitle style={{color:'var(--custom-text)'}} className="text-sm flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Фонд оплаты труда
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-red-600">
                    ₽{stats.avgSalary * stats.total || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">в месяц</div>
                </CardContent>
              </Card>
              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-primaryLine)',
                color: 'var(--custom-text)',
              }}>
                <CardHeader className="pb-2 text-white">
                  <CardTitle style={{color:'var(--custom-text)'}} className="text-sm flex items-center">
                    <Award className="h-4 w-4 mr-2 " />
                    Средний стаж
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{color:'var(--custom-text)'}} className="text-2xl text-white">2.5 года</div>
                </CardContent>
              </Card>
              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-primaryLine)',
                color: 'var(--custom-text)',
              }}>
                <CardHeader className="pb-2">
                  <CardTitle style={{color:'var(--custom-text)'}} className="text-sm flex items-center text-white">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Средняя оценка
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{color:'var(--custom-text)'}} className="text-2xl text-green-600 text-white">4.7</div>
                </CardContent>
              </Card>
            </div>

            {/* Управление персоналом */}
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle style={{color:'var(--custom-text)'}} className='text-white'>База сотрудников {selectedSalesPoint && `- ${selectedSalesPoint.name}`}</CardTitle>

                  <Button
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={() => setIsAddingEmployee(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить сотрудника
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Поиск сотрудников..."
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
                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger className="w-48"   style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }}>
                      <SelectValue placeholder="Должность" />
                    </SelectTrigger>
                    <SelectContent >
                      {positions.map(position => (
                          <SelectItem key={position} value={position}>{position}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-48"   style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }}>
                      <SelectValue placeholder="Отдел" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(department => (
                          <SelectItem key={department} value={department}>{department}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48"   style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }}>
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Все статусы">Все статусы</SelectItem>
                      <SelectItem value="работает">Работает</SelectItem>
                      <SelectItem value="отпуск">Отпуск</SelectItem>
                      <SelectItem value="больничный">Больничный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="px-6 pb-6" style={{ height: '340px', overflowY: 'auto' }}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead style={{color:'rgb(101,125,156)'}}>Сотрудник</TableHead>
                        <TableHead style={{color:'rgb(101,125,156)'}}>Должность</TableHead>
                        <TableHead style={{color:'rgb(101,125,156)'}}>Контакты</TableHead>
                        <TableHead style={{color:'rgb(101,125,156)'}}>Зарплата</TableHead>
                        <TableHead style={{color:'rgb(101,125,156)'}}>Часы</TableHead>
                        <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                        <TableHead style={{color:'rgb(101,125,156)'}}>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className='text-white'>
                      {filteredStaff.map((employee) => (
                          <TableRow key={employee.id} onClick={(e) => {
                            e.stopPropagation();
                            setIsProfile(true);
                            loadingEmployerProfile(employee.id)

                          }  } >
                            <TableCell>
                              <div style={{color:'var(--custom-text)'}} className="flex items-center space-x-3">
                                <Avatar >
                                  <AvatarFallback className='text-blue-600'>{getInitials(employee.fullname)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{employee.fullname}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Опыт: {employee.experience}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div style={{color:'var(--custom-text)'}}>
                                <div  className="font-medium">{employee.position}</div>
                                <div className="text-sm text-muted-foreground">{employee.department}</div>
                              </div>
                            </TableCell>
                            <TableCell style={{color:'var(--custom-text)'}}>
                              <div className="space-y-1">
                                <div className="flex items-center space-x-1 text-sm">
                                  <Phone className="h-3 w-3" />
                                  <span>{employee.phone}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-sm">
                                  <Mail className="h-3 w-3" />
                                  <span>{employee.email}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell style={{color:'var(--custom-text)'}}>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4" />
                                <span className="font-medium">₽{employee.salary_rate?.toLocaleString() || '0'}</span>
                              </div>
                            </TableCell>
                            <TableCell style={{color:'var(--custom-text)'}}>
                              <div>
                                <div className="font-medium">{employee.todayHours || 0}ч сегодня</div>
                                <div className="text-sm text-muted-foreground">{employee.weekHours || 0}ч за неделю</div>
                              </div>
                            </TableCell>
                            <TableCell style={{color:'var(--custom-text)'}}>
                              <Badge className={getStatusColor(employee.status)}>
                                {employee.status || 'работает'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(employee)

                                }}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEmployee(employee.id)

                                }}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка График работы */}
          <TabsContent value="schedule" className="space-y-6">
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => changeMonth(-1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <CardTitle>
                      {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                      {selectedSalesPoint && ` - ${selectedSalesPoint.name}`}
                    </CardTitle>

                    <Button variant="outline" size="sm" onClick={() => changeMonth(1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div style={{color:'var(--custom-text)'}} className="text-sm text-white">
                      Обозначения:
                      <span className="mx-2"><Badge variant="outline" className="bg-green-500">Д</Badge> День</span>
                      <span className="mx-2"><Badge variant="outline" className="bg-blue-500">В</Badge> Вечер</span>
                      <span className="mx-2"><Badge variant="outline" className="bg-purple-500">Н</Badge> Ночь</span>
                      <span className="mx-2"><Badge variant="outline" className="bg-red-500">О</Badge> Выходной</span>
                    </div>

                  </div>

                  <div className="flex gap-2">
                    <Button
                        variant={isEditMode ? "default" : "outline"}
                        onClick={() => setIsEditMode(!isEditMode)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditMode ? 'Завершить редактирование' : 'Редактировать график'}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-white z-10 min-w-[200px]">
                          Сотрудник
                        </TableHead>
                        {daysInMonth.map((day) => (
                            <TableHead
                                key={day.date}
                                style={{color:'var(--custom-text)'}}
                                className={`text-center text-white min-w-[50px] ${day.isWeekend ? 'bg-red-500' : ''}`}
                            >
                              <div className="flex flex-col">
                                <span className="text-xs">{day.dayOfWeek}</span>
                                <span>{day.date}</span>
                              </div>
                            </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredStaff.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell className="sticky left-0  z-10">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8 text-black">
                                  <AvatarFallback className="text-xs " style={{color:'black'}}>
                                    {getInitials(employee.fullname)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-sm">{employee.fullname}</div>
                                  <div className="text-xs text-muted-foreground">{employee.position || 'Сотрудник'}</div>
                                </div>
                              </div>
                            </TableCell>
                            {daysInMonth.map((day) => {
                              const shiftType = getScheduleForEmployee(employee.id, day.fullDate);
                              const shiftLetter = getShiftLetter(shiftType);
                              const isSelected = currentEditingCell?.employeeId === employee.id &&
                                  currentEditingCell?.dateKey === day.fullDate;

                              return (
                                  <TableCell
                                      key={day.date}
                                      className={`text-center p-1 ${day.isWeekend ? 'bg-red-50' : ''} ${isEditMode ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                                  >
                                    {isEditMode ? (
                                        <Popover
                                            open={isSelected}
                                            onOpenChange={(open) => {
                                              if (!open) {
                                                setCurrentEditingCell(null);
                                                setOpenPopover(false);
                                              }
                                            }}
                                        >
                                          <PopoverTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className={`h-8 w-full p-0 ${
                                                    shiftType ? getShiftColor(shiftType) : 'bg-transparent'
                                                } hover:bg-gray-200`}
                                                onClick={() => {
                                                  setCurrentEditingCell({
                                                    employeeId: employee.id,
                                                    dateKey: day.fullDate
                                                  });
                                                  setOpenPopover(true);
                                                }}
                                            >
                                              {shiftLetter ? (
                                                  <Badge className={`${getShiftColor(shiftType)} text-xs px-2 py-1 border-0`}>
                                                    {shiftLetter}
                                                  </Badge>
                                              ) : (
                                                  <span className="text-muted-foreground">-</span>
                                              )}
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-48 p-2" align="center">
                                            <div className="grid grid-cols-2 gap-2">
                                              <Button
                                                  variant="outline"
                                                  className="bg-green-100 hover:bg-green-200 text-green-800 h-8"
                                                  onClick={() => handleShiftSelect('Д')}
                                              >
                                                Д (День)
                                              </Button>
                                              <Button
                                                  variant="outline"
                                                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 h-8"
                                                  onClick={() => handleShiftSelect('В')}
                                              >
                                                В (Вечер)
                                              </Button>
                                              <Button
                                                  variant="outline"
                                                  className="bg-purple-100 hover:bg-purple-200 text-purple-800 h-8"
                                                  onClick={() => handleShiftSelect('Н')}
                                              >
                                                Н (Ночь)
                                              </Button>
                                              <Button
                                                  variant="outline"
                                                  className="bg-red-100 hover:bg-red-200 text-red-800 h-8"
                                                  onClick={() => handleShiftSelect('О')}
                                              >
                                                О (Вых.)
                                              </Button>
                                              <Button
                                                  variant="outline"
                                                  className="col-span-2 h-8"
                                                  onClick={() => handleShiftSelect('')}
                                              >
                                                Очистить
                                              </Button>
                                            </div>
                                          </PopoverContent>
                                        </Popover>
                                    ) : shiftLetter ? (
                                        <Badge className={`${getShiftColor(shiftType)} text-xs px-2 py-1`}>
                                          {shiftLetter}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                  </TableCell>
                              );
                            })}
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Остальные вкладки остаются без изменений */}
          <TabsContent value="timesheet" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Табель учета рабочего времени - {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })} {selectedSalesPoint && `- ${selectedSalesPoint.name}`}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline">Экспорт в Excel</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Функциональность табеля в разработке</p>
                  <p className="text-sm">Скоро здесь появится полный учет рабочего времени</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaves" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Отпуска и больничные {selectedSalesPoint && `- ${selectedSalesPoint.name}`}</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Новый запрос
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Новый запрос на отпуск/отгул</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm">Сотрудник</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите сотрудника" />
                            </SelectTrigger>
                            <SelectContent>
                              {staff.map(emp => (
                                  <SelectItem key={emp.id} value={emp.id.toString()}>{emp.fullname}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm">Тип</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите тип" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vacation">Отпуск</SelectItem>
                              <SelectItem value="sick">Больничный</SelectItem>
                              <SelectItem value="dayoff">Отгул</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm">Дата начала</label>
                            <Input type="date" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm">Дата окончания</label>
                            <Input type="date" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm">Причина</label>
                          <Input placeholder="Основание для запроса..." />
                        </div>
                        <Button className="w-full">Отправить запрос</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Функциональность отпусков в разработке</p>
                  <p className="text-sm">Скоро здесь появится управление отпусками и больничными</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Расчет заработной платы - {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })} {selectedSalesPoint && `- ${selectedSalesPoint.name}`}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline">Экспорт в Excel</Button>
                    <Button className="bg-orange-600 hover:bg-orange-700">Провести выплаты</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Функциональность расчета зарплаты в разработке</p>
                  <p className="text-sm">Скоро здесь появится полный расчет заработной платы</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}