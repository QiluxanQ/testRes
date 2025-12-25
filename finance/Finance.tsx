import React, {useState, useEffect, useRef} from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../ui/dialog';
import {
  Plus,
  Search,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  Trash2,
  MoveRight,
  FileText,
  Calendar,
  Edit,
  X,
  Save,
  ArrowLeft,
  Eye,
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Truck,
  Filter
} from 'lucide-react';
import ShowForm from "./blocks/ShowForm";
import ViewDiteil from "./blocks/ViewDiteil";

const initialReturns = [
  {
    id: 1,
    date: '2024-03-19',
    documentNumber: 'ВЗВ-00001',
    counterparty: 'ООО "Молочная Ферма"',
    category: 'Возврат поставщику',
    amount: 8500,
    account: 'Расчетный счет',
    comment: 'Возврат испорченной продукции',
    responsible: 'Сидоров П.К.',
    status: 'проведен'
  }
];
const initialTransfers = [
  {
    id: 1,
    date: '2024-03-20',
    documentNumber: 'ПРМ-00001',
    fromAccount: 'Касса основная',
    toAccount: 'Расчетный счет',
    amount: 50000,
    comment: 'Инкассация',
    responsible: 'Иванов И.И.',
    status: 'проведен'
  }
];
const initialCashRegisters = [
  { id: 1, name: 'Касса основная', balance: 125000, status: 'active', lastZReport: '2024-03-20', responsible: 'Иванов И.И.' },
  { id: 2, name: 'Касса бара', balance: 45000, status: 'active', lastZReport: '2024-03-20', responsible: 'Петрова А.С.' },
  { id: 3, name: 'Касса банкетного зала', balance: 15000, status: 'inactive', lastZReport: '2024-03-19', responsible: 'Сидоров П.К.' }
];
const initialCashOperations = [
  { id: 1, date: '2024-03-20 14:30', type: 'Инкассация', amount: -50000, register: 'Касса основная', responsible: 'Иванов И.И.', comment: 'Плановая инкассация' },
  { id: 2, date: '2024-03-20 10:00', type: 'Внесение', amount: 20000, register: 'Касса бара', responsible: 'Петрова А.С.', comment: 'Размен' },
  { id: 3, date: '2024-03-19 18:00', type: 'Снятие', amount: -15000, register: 'Касса основная', responsible: 'Иванов И.И.', comment: 'Выплата аванса' }
];
const initialSupplierPayments = [
  { id: 1, supplier: 'ООО "МясоТорг"', invoice: 'СФ-00245', amount: 125000, paid: 75000, debt: 50000, dueDate: '2024-03-25', status: 'partial' },
  { id: 2, supplier: 'ООО "Молочная Ферма"', invoice: 'СФ-00312', amount: 85000, paid: 85000, debt: 0, dueDate: '2024-03-22', status: 'paid' },
  { id: 3, supplier: 'ИП Овощи и Фрукты', invoice: 'СФ-00198', amount: 45000, paid: 0, debt: 45000, dueDate: '2024-03-21', status: 'overdue' }
];
const initialOpexExpenses = [
  { id: 1, date: '2024-03-20', category: 'Аренда', amount: 150000, payee: 'ООО "Недвижимость"', account: 'Расчетный счет', status: 'paid', comment: 'Аренда за март' },
  { id: 2, date: '2024-03-18', category: 'Коммунальные услуги', amount: 35000, payee: 'ООО "ЖКХ Сервис"', account: 'Расчетный счет', status: 'paid', comment: 'Электричество + вода' },
  { id: 3, date: '2024-03-15', category: 'Зарплата', amount: 450000, payee: 'Сотрудники', account: 'Расчетный счет', status: 'paid', comment: 'Зарплата за февраль' },
  { id: 4, date: '2024-03-10', category: 'Маркетинг', amount: 25000, payee: 'ООО "Реклама+"', account: 'Расчетный счет', status: 'pending', comment: 'Размещение рекламы' },
  { id: 5, date: '2024-03-05', category: 'Ремонт', amount: 18000, payee: 'ИП Мастер', account: 'Касса', status: 'paid', comment: 'Ремонт холодильника' }
];
const initialStaffPayments = [
  { id: 1, employee: 'Иванов Иван', type: 'Аванс', amount: 15000, date: '2024-03-15', status: 'paid', comment: 'Аванс за март' },
  { id: 2, employee: 'Петрова Анна', type: 'Премия', amount: 10000, date: '2024-03-10', status: 'paid', comment: 'За высокие продажи' },
  { id: 3, employee: 'Сидоров Петр', type: 'Штраф', amount: -2000, date: '2024-03-08', status: 'applied', comment: 'Опоздание' },
  { id: 4, employee: 'Козлова Мария', type: 'Аванс', amount: 12000, date: '2024-03-15', status: 'pending', comment: 'Аванс за март' }
];

const DownloadReportSection = ({ onDownload }) => {
  const [downloadFormat, setDownloadFormat] = useState('excel');
  const [downloadCategory, setDownloadCategory] = useState('incomes');

  const handleDownloadClick = () => {
    onDownload(downloadCategory, downloadFormat);
  };

  return (
      <Card className="mb-6" style={{
        borderRadius: '20px',
        border: 'var(--custom-border-primary)',
        background: 'var(--custom-bg-secondaryLineCard)',
        color: 'var(--custom-text)',
      }}>
        <CardHeader>
          <CardTitle className="text-sm">Скачать отчет</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Категория</label>
              <Select
                  value={downloadCategory}
                  onValueChange={setDownloadCategory}
              >
                <SelectTrigger className="w-full"      style={{
                  border: 'var(--custom-border-primary)',
                  background: 'var(--custom-bg-inpyt)',
                  color: 'var(--custom-text)',
                }}>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incomes">Приходы</SelectItem>
                  <SelectItem value="expenses">Расходы</SelectItem>
                  <SelectItem value="writeoffs">Списания</SelectItem>
                  <SelectItem value="documents">Все документы</SelectItem>
                  <SelectItem value="cash">Кассы</SelectItem>
                  <SelectItem value="suppliers">Поставщики</SelectItem>
                  <SelectItem value="opex">ОРЕХ</SelectItem>
                  <SelectItem value="staff">Сотрудники</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Формат</label>
              <Select
                  value={downloadFormat}
                  onValueChange={setDownloadFormat}
              >
                <SelectTrigger className="w-full"    style={{
                  border: 'var(--custom-border-primary)',
                  background: 'var(--custom-bg-inpyt)',
                  color: 'var(--custom-text)',
                }}>
                  <SelectValue placeholder="Формат" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
                onClick={handleDownloadClick}
                className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Скачать отчет
            </Button>
          </div>
        </CardContent>
      </Card>
  );
};

const Finance = () => {
  // Получение выбранной точки продаж из localStorage
  const [selectedSalesPoint, setSelectedSalesPoint] = useState(null);
  const [units, setUnits] = useState([]);
  useEffect(() => {
    const savedPoint = localStorage.getItem('selectedSalesPoint');
    if (savedPoint) {
      try {
        setSelectedSalesPoint(JSON.parse(savedPoint));
      } catch (error) {
        console.error('Ошибка парсинга selectedSalesPoint из localStorage:', error);
      }
    }
  }, []);

  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef(null);

  const [returns, setReturns] = useState(initialReturns);
  const [transfers, setTransfers] = useState(initialTransfers);
  const [searchTerm, setSearchTerm] = useState('');

  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [showWriteOffForm, setShowWriteOffForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showDocumentDetail, setShowDocumentDetail] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [counterparties, setCounterparties] = useState([]);
  const [pointsRetail, setPointsRetail] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [users, setUsers] = useState([]);



  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Токен не найден в localStorage');
      return {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
    }
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    const loadUnits = async () => {
      const headers = getAuthHeaders();
      try {
        const response = await fetch('/units/?skip=0&limit=100', { headers });
        if (response.ok) {
          const data = await response.json();
          setUnits(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Ошибка загрузки единиц измерения:', error);
      }
    };
    loadUnits();
  }, []);

  const handleDeleteIncome = async (incomeId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот приход?')) {
      return;
    }
    const headers = getAuthHeaders();
    try {
      const response = await fetch(`/receipt-invoices=${incomeId}`, {
        method: 'DELETE',
        headers
      });
      if (response.ok) {
        setIncomes(prevIncomes => prevIncomes.filter(income => income.id !== incomeId));
        setDocuments(prevDocs => prevDocs.filter(doc =>
            !(doc.documentType === 'receipt' && doc.id === incomeId)
        ));
        alert('Приход успешно удален!');
      } else {
        const errorText = await response.text();
        throw new Error(`Ошибка при удалении: ${errorText}`);
      }
    } catch (error) {
      console.error('Ошибка при удалении прихода:', error);
      alert(`Ошибка при удалении прихода: ${error.message}`);
    }
  };

  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentTypeFilter, setDocumentTypeFilter] = useState('all');
  const [documentStatusFilter, setDocumentStatusFilter] = useState('all-status');
  const [pointFilter, setPointFilter] = useState('current'); // По умолчанию фильтруем по текущей точке

  const [addIncomeLoading, setAddIncomeLoading] = useState(false);
  const [newIncome, setNewIncome] = useState({
    transaction_id: '',
    number_doc: '',
    ext_number_doc: '',
    user_id: '',
    counterparty_id: '',
    point_retail_id: selectedSalesPoint ? selectedSalesPoint.id.toString() : '',
    date_create: new Date().toISOString().slice(0, 16),
    date_approval: '',
    status: 'draft',
    warehouse_id: '',
    type_payment: 'cash',
    amount: '0',
    metadate: {},
    items: []
  });

  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);
  const getCurrentUserId = () => {
    return currentUser ? currentUser.id : 1;
  };
  const getCurrentUserName = () => {
    return currentUser ? currentUser.username : 'Текущий пользователь';
  };

  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(true);

  const [incomes, setIncomes] = useState([]);
  const [incomesLoading, setIncomesLoading] = useState(true);

  const [writeOffs, setWriteOffs] = useState([]);
  const [writeOffsLoading, setWriteOffsLoading] = useState(true);
  const [newWriteOff, setNewWriteOff] = useState({
    point_retail_id: selectedSalesPoint ? selectedSalesPoint.id.toString() : '',
    warehouse_id: '',
    reason_write_off: '',
    date_create: new Date().toISOString().slice(0, 16),
    date_approval: '',
    metadate: {},
    items: []
  });

  const [newIncomeItem, setNewIncomeItem] = useState({
    name: '',
    category: '',
    barcode: '',
    unit: '',
    packages: '',
    packageBarcode: '',
    qtyInPackage: '',
    totalQty: '',
    purchasePrice: '',
    vat: '',
    taxAmount: '',
    totalWithoutVat: '',
    expiryDate: ''
  });

  const [newExpenseItem, setNewExpenseItem] = useState({
    name: '',
    category: '',
    barcode: '',
    unit: '',
    packages: '',
    packageBarcode: '',
    qtyInPackage: '',
    totalQty: '',
    purchasePrice: '',
    vat: '',
    taxAmount: '',
    totalWithoutVat: '',
    expiryDate: ''
  });

  const [newExpense, setNewExpense] = useState({
    transaction_id: '',
    number_doc: '',
    ext_number_doc: '',
    user_id: '',
    counterparty_id: '',
    point_retail_id: selectedSalesPoint ? selectedSalesPoint.id.toString() : '',
    date_create: new Date().toISOString().slice(0, 16),
    date_approval: '',
    status: 'draft',
    warehouse_id: '',
    type_payment: 'cash',
    amount: '0',
    metadate: {},
    items: []
  });
  const [addExpenseLoading, setAddExpenseLoading] = useState(false);

  const [newReturn, setNewReturn] = useState({
    counterparty: '',
    category: '',
    amount: '',
    account: '',
    comment: ''
  });

  const [newWriteOffItem, setNewWriteOffItem] = useState({
    name: '',
    barcode: '',
    article: '',
    unit: '',
    total: ''
  });

  const [newTransfer, setNewTransfer] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    comment: ''
  });

  const [cashRegisters, setCashRegisters] = useState(initialCashRegisters);
  const [cashOperations, setCashOperations] = useState(initialCashOperations);
  const [supplierPayments, setSupplierPayments] = useState(initialSupplierPayments);
  const [opexExpenses, setOpexExpenses] = useState(initialOpexExpenses);
  const [staffPayments, setStaffPayments] = useState(initialStaffPayments);

  const [downloadFormat, setDownloadFormat] = useState('excel');
  const [downloadCategory, setDownloadCategory] = useState('incomes');

  const handleDownload = (category, format) => {
    switch (category) {
      case 'incomes':
        downloadIncomes(format);
        break;
      case 'expenses':
        downloadExpenses(format);
        break;
      case 'writeoffs':
        downloadWriteOffs(format);
        break;
      case 'documents':
        downloadAllDocuments(format);
        break;
      case 'cash':
        downloadCashOperations(format);
        break;
      case 'suppliers':
        downloadSupplierPayments(format);
        break;
      case 'opex':
        downloadOpexExpenses(format);
        break;
      case 'staff':
        downloadStaffPayments(format);
        break;
      default:
        break;
    }
  };

  const prepareIncomeData = () => {
    const filteredIncomes = getFilteredIncomes();
    return filteredIncomes.map(income => ({
      'Дата создания': new Date(income.date_create).toLocaleDateString('ru-RU'),
      'Номер документа': income.number_doc || 'Без номера',
      'Внешний номер': income.ext_number_doc || '-',
      'Контрагент': getCounterpartyName(income.counterparty_id),
      'Склад': getWarehouseName(income.warehouse_id),
      'Тип оплаты': formatPaymentType(income.type_payment),
      'Сумма': parseFloat(income.amount || 0),
      'Статус': formatStatus(income.status)
    }));
  };

  const prepareExpenseData = () => {
    const filteredExpenses = getFilteredExpenses();
    return filteredExpenses.map(expense => ({
      'Дата создания': new Date(expense.date_create).toLocaleDateString('ru-RU'),
      'Номер документа': expense.number_doc || 'Без номера',
      'Внешний номер': expense.ext_number_doc || '-',
      'Контрагент': getCounterpartyName(expense.counterparty_id),
      'Склад': getWarehouseName(expense.warehouse_id),
      'Тип оплаты': formatPaymentType(expense.type_payment),
      'Сумма': parseFloat(expense.amount || 0),
      'Статус': formatExpenseStatus(expense.status)
    }));
  };

  const prepareWriteOffData = () => {
    const filteredWriteOffs = getFilteredWriteOffs();
    return filteredWriteOffs.map(writeOff => ({
      'Дата создания': new Date(writeOff.date_create).toLocaleDateString('ru-RU'),
      'Причина списания': writeOff.reason_write_off || 'Без причины',
      'Склад': getWarehouseName(writeOff.warehouse_id),
      'Статус': formatWriteOffStatus(getWriteOffStatus(writeOff))
    }));
  };

  const prepareDocumentData = () => {
    const filteredDocs = getFilteredDocuments();
    return filteredDocs.map(doc => ({
      'Дата': new Date(doc.displayDate).toLocaleDateString('ru-RU'),
      'Тип': doc.type,
      'Номер документа': doc.displayNumber || 'Без номера',
      'Контрагент/Описание': doc.displayCounterparty || 'Не указано',
      'Сумма': doc.displayAmount,
      'Ответственный': doc.displayResponsible,
      'Статус': formatDocumentStatus(doc.displayStatus)
    }));
  };

  const prepareCashData = () => {
    return cashOperations.map(op => ({
      'Дата/Время': op.date,
      'Тип операции': op.type,
      'Касса': op.register,
      'Сумма': op.amount,
      'Ответственный': op.responsible,
      'Комментарий': op.comment
    }));
  };

  const prepareSupplierData = () => {
    return supplierPayments.map(payment => ({
      'Поставщик': payment.supplier,
      'Счет': payment.invoice,
      'Сумма счета': payment.amount,
      'Оплачено': payment.paid,
      'Задолженность': payment.debt,
      'Срок оплаты': payment.dueDate,
      'Статус': payment.status === 'paid' ? 'Оплачено' :
          payment.status === 'partial' ? 'Частично' : 'Просрочено'
    }));
  };

  const prepareOpexData = () => {
    return opexExpenses.map(expense => ({
      'Дата': expense.date,
      'Категория': expense.category,
      'Получатель': expense.payee,
      'Сумма': expense.amount,
      'Счет': expense.account,
      'Статус': expense.status === 'paid' ? 'Оплачено' : 'Ожидается',
      'Комментарий': expense.comment
    }));
  };

  const prepareStaffData = () => {
    return staffPayments.map(payment => ({
      'Сотрудник': payment.employee,
      'Тип': payment.type,
      'Дата': payment.date,
      'Сумма': payment.amount,
      'Статус': payment.status === 'paid' ? 'Выплачено' :
          payment.status === 'pending' ? 'Ожидается' : 'Применен',
      'Комментарий': payment.comment
    }));
  };

  const downloadExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Данные');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const downloadPDF = (data, filename, headers) => {
    const doc = new jsPDF();
    const cleanText = (text) => {
      if (typeof text !== 'string') return String(text);
      let cleaned = text.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '');
      cleaned = cleaned.replace(//g, '')
          .replace(//g, '')
          .replace(//g, '')
          .replace(//g, '')
          .replace(//g, '')
          .replace(//g, '');
      return cleaned.trim() || 'Документ';
    };
    const cleanFilename = cleanText(filename);
    const cleanHeaders = headers.map(header => cleanText(header));

    doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');

    doc.setFontSize(16);
    doc.text(cleanFilename, 14, 15);

    const tableData = data.map(row =>
        headers.map((originalHeader, index) => {
          const value = row[originalHeader];
          if (value === null || value === undefined) return '';
          if (typeof value === 'number') return value.toString();
          return cleanText(String(value));
        })
    );
    autoTable(doc, {
      head: [cleanHeaders],
      body: tableData,
      startY: 25,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        font: 'Roboto',
        fontStyle: 'normal',
        halign: 'left'
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
        font: 'Roboto',
        halign: 'center'
      },
      bodyStyles: {
        font: 'Roboto',
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: {top: 25},
      tableWidth: 'wrap'
    });

    doc.save(`${cleanFilename}.pdf`);
  };

  const downloadIncomes = (format = 'excel') => {
    const data = prepareIncomeData();
    const headers = ['Дата создания', 'Номер документа', 'Внешний номер', 'Контрагент', 'Склад', 'Тип оплаты', 'Сумма', 'Статус'];

    if (format === 'excel') {
      downloadExcel(data, 'Приходы');
    } else {
      downloadPDF(data, 'Приходы', headers);
    }
  };

  const downloadExpenses = (format = 'excel') => {
    const data = prepareExpenseData();
    const headers = ['Дата создания', 'Номер документа', 'Внешний номер', 'Контрагент', 'Склад', 'Тип оплаты', 'Сумма', 'Статус'];

    if (format === 'excel') {
      downloadExcel(data, 'Расходы');
    } else {
      downloadPDF(data, 'Расходы', headers);
    }
  };

  const downloadWriteOffs = (format = 'excel') => {
    const data = prepareWriteOffData();
    const headers = ['Дата создания', 'Причина списания', 'Склад', 'Статус'];

    if (format === 'excel') {
      downloadExcel(data, 'Списания');
    } else {
      downloadPDF(data, 'Списания', headers);
    }
  };

  const downloadAllDocuments = (format = 'excel') => {
    const data = prepareDocumentData();
    const headers = ['Дата', 'Тип', 'Номер документа', 'Контрагент/Описание', 'Сумма', 'Ответственный', 'Статус'];

    if (format === 'excel') {
      downloadExcel(data, 'Все_документы');
    } else {
      downloadPDF(data, 'Все_документы', headers);
    }
  };

  const downloadCashOperations = (format = 'excel') => {
    const data = prepareCashData();
    const headers = ['Дата/Время', 'Тип операции', 'Касса', 'Сумма', 'Ответственный', 'Комментарий'];

    if (format === 'excel') {
      downloadExcel(data, 'Кассовые_операции');
    } else {
      downloadPDF(data, 'Кассовые_операции', headers);
    }
  };

  const downloadSupplierPayments = (format = 'excel') => {
    const data = prepareSupplierData();
    const headers = ['Поставщик', 'Счет', 'Сумма счета', 'Оплачено', 'Задолженность', 'Срок оплаты', 'Статус'];

    if (format === 'excel') {
      downloadExcel(data, 'Поставщики');
    } else {
      downloadPDF(data, 'Поставщики', headers);
    }
  };

  const downloadOpexExpenses = (format = 'excel') => {
    const data = prepareOpexData();
    const headers = ['Дата', 'Категория', 'Получатель', 'Сумма', 'Счет', 'Статус', 'Комментарий'];

    if (format === 'excel') {
      downloadExcel(data, 'Операционные_расходы');
    } else {
      downloadPDF(data, 'Операционные_расходы', headers);
    }
  };

  const downloadStaffPayments = (format = 'excel') => {
    const data = prepareStaffData();
    const headers = ['Сотрудник', 'Тип', 'Дата', 'Сумма', 'Статус', 'Комментарий'];

    if (format === 'excel') {
      downloadExcel(data, 'Выплаты_сотрудникам');
    } else {
      downloadPDF(data, 'Выплаты_сотрудникам', headers);
    }
  };

  const [activeTab, setActiveTab] = useState('incomes');

  const getStatusBadge = (status) => {
    const variants = {
      active: {label: 'Активна', className: 'bg-green-100 text-green-800'},
      inactive: {label: 'Неактивна', className: 'bg-gray-100 text-gray-800'},
      paid: {label: 'Оплачено', className: 'bg-green-100 text-green-800'},
      partial: {label: 'Частично', className: 'bg-yellow-100 text-yellow-800'},
      overdue: {label: 'Просрочено', className: 'bg-red-100 text-red-800'},
      pending: {label: 'Ожидается', className: 'bg-blue-100 text-blue-800'},
      applied: {label: 'Применен', className: 'bg-purple-100 text-purple-800'}
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const handleViewDocument = async (document) => {
    try {
      console.log('🔍 Opening document:', document);

      let endpoint = '';
      const headers = getAuthHeaders();

      switch (document.documentType) {
        case 'receipt':
          endpoint = '/receipt-invoices/';
          break;
        case 'expenditure':
          endpoint = '/expenditure-invoices/';
          break;
        case 'writeoff':
          endpoint = '/act-debitings/';
          break;
        default:
          console.error('❌ Unknown document type:', document.documentType);
          return;
      }

      endpoint += `${document.id}?include_items=true`;
      console.log('📡 Fetching from:', endpoint);

      const response = await fetch(endpoint, {headers});
      console.log('📊 Response status:', response.status);

      if (response.ok) {
        const documentData = await response.json();
        console.log('✅ Document loaded:', documentData);

        setShowDocumentDetail(false);
        setTimeout(() => {
          setSelectedDocument({
            ...documentData,
            type: document.type,
            documentType: document.documentType
          });
          setShowDocumentDetail(true);
        }, 100);

      } else {
        const errorText = await response.text();
        console.error('❌ Error loading document:', response.status, errorText);
        alert(`Ошибка загрузки документа: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('💥 Error loading document:', error);
      alert(`Ошибка загрузки документа: ${error.message}`);
    }
  };

  const DocumentDetailView = () => {
    if (!selectedDocument) return null;

    const getStatusColor = (status) => {
      const colors = {
        'approved': 'bg-green-100 text-green-800',
        'pending': 'bg-yellow-100 text-yellow-800',
        'rejected': 'bg-red-100 text-red-800',
        'draft': 'bg-gray-100 text-gray-800'
      };
      return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatStatus = (status) => {
      const statusMap = {
        'approved': 'Подтвержден',
        'pending': 'В ожидании',
        'rejected': 'Отклонен',
        'draft': 'Черновик'
      };
      return statusMap[status] || status;
    };

    const formatPaymentType = (type) => {
      const typeMap = {
        'cash': 'Наличные',
        'card': 'Карта',
        'transfer': 'Перевод'
      };
      return typeMap[type] || type;
    };

    const getCounterpartyName = (counterpartyId) => {
      if (!counterpartyId) return 'Не указан';
      const counterparty = counterparties.find(c => c.id === counterpartyId);
      return counterparty?.Full_name || counterparty?.full_name || `Контрагент #${counterpartyId}`;
    };

    const getWarehouseName = (warehouseId) => {
      if (!warehouseId) return 'Не указан';
      const warehouse = warehouses.find(w => w.id === warehouseId);
      return warehouse?.name || `Склад #${warehouseId}`;
    };

    const getPointRetailName = (pointRetailId) => {
      if (!pointRetailId) return 'Не указана';
      const point = pointsRetail.find(p => p.id === pointRetailId);
      return point?.name || `Точка #${pointRetailId}`;
    };

    const getUserName = (userId) => {
      if (!userId) return 'Не указан';
      const user = users.find(u => u.id === userId);
      return user?.name || user?.username || `Пользователь #${userId}`;
    };

    // Функция для получения товаров из документа
    const getDocumentItems = () => {
      // Сначала пробуем получить товары из items
      if (selectedDocument.items && selectedDocument.items.length > 0) {
        return selectedDocument.items;
      }

      // Если нет, пробуем получить из metadate.items
      if (selectedDocument.metadate && selectedDocument.metadate.items) {
        return selectedDocument.metadate.items;
      }

      return [];
    };

    const items = getDocumentItems();

    return (
        <div className="space-y-6">
          <div className="mb-6">
            <Button
                variant="outline"
                onClick={() => {
                  setShowDocumentDetail(false);
                  setSelectedDocument(null);
                }}
                className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2"/>
              Назад
            </Button>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
              <FileText className="h-6 w-6"/>
              {selectedDocument.type} #{selectedDocument.number_doc || selectedDocument.id}
            </h2>
            <p className="text-sm text-muted-foreground">Детальная информация о документе</p>
          </div>

          <div className="flex gap-6">


            <div className="flex-1 space-y-6">
              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
              }}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Информация о документе</CardTitle>
                  <Badge className={getStatusColor(selectedDocument.status)}>
                    {formatStatus(selectedDocument.status)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Номер документа</label>
                      <p className="font-medium">{selectedDocument.number_doc || 'Не указан'}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Внешний номер</label>
                      <p className="font-medium">{selectedDocument.ext_number_doc || 'Не указан'}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Дата создания</label>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4"/>
                        {new Date(selectedDocument.date_create).toLocaleDateString('ru-RU')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Дата подтверждения</label>
                      <p className="font-medium">
                        {selectedDocument.date_approval ?
                            new Date(selectedDocument.date_approval).toLocaleDateString('ru-RU') :
                            'Не подтверждена'
                        }
                      </p>
                    </div>

                    {selectedDocument.counterparty_id && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Контрагент</label>
                          <p className="font-medium">{getCounterpartyName(selectedDocument.counterparty_id)}</p>
                        </div>
                    )}

                    {selectedDocument.warehouse_id && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Склад</label>
                          <p className="font-medium">{getWarehouseName(selectedDocument.warehouse_id)}</p>
                        </div>
                    )}

                    {selectedDocument.point_retail_id && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Точка продаж</label>
                          <p className="font-medium">{getPointRetailName(selectedDocument.point_retail_id)}</p>
                        </div>
                    )}

                    {selectedDocument.user_id && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Пользователь</label>
                          <p className="font-medium">{getUserName(selectedDocument.user_id)}</p>
                        </div>
                    )}

                    {selectedDocument.type_payment && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Тип оплаты</label>
                          <p className="font-medium">{formatPaymentType(selectedDocument.type_payment)}</p>
                        </div>
                    )}

                    {selectedDocument.amount && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Сумма</label>
                          <p className={`font-bold text-lg ${
                              selectedDocument.type === 'Приход' ? 'text-green-600' :
                                  selectedDocument.type === 'Расход' ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            ₽{parseFloat(selectedDocument.amount || 0).toLocaleString('ru-RU', {minimumFractionDigits: 2})}
                          </p>
                        </div>
                    )}

                    {selectedDocument.reason_write_off && (
                        <div className="space-y-2 col-span-2">
                          <label className="text-sm font-medium">Причина списания</label>
                          <p className="font-medium">{selectedDocument.reason_write_off}</p>
                        </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {items.length > 0 && (
                  <Card style={{
                    borderRadius: '20px',
                    border: 'var(--custom-border-primary)',
                    background: 'var(--custom-bg-secondaryLineCard)',
                    color: 'var(--custom-text)',
                  }}>
                    <CardHeader>
                      <CardTitle>Товары</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead style={{color:'rgb(101,125,156)'}}>Наименование</TableHead>
                              <TableHead style={{color:'rgb(101,125,156)'}}>Количество</TableHead>
                              <TableHead style={{color:'rgb(101,125,156)'}}>Ед. изм.</TableHead>
                              <TableHead style={{color:'rgb(101,125,156)'}}>Цена закуп.</TableHead>
                              <TableHead style={{color:'rgb(101,125,156)'}}>Сумма</TableHead>
                              <TableHead style={{color:'rgb(101,125,156)'}}>Штрихкод</TableHead>
                              {selectedDocument.documentType === 'receipt' && (
                                  <>
                                    <TableHead style={{color:'rgb(101,125,156)'}}>НДС</TableHead>
                                    <TableHead style={{color:'rgb(101,125,156)'}}>Срок годности</TableHead>
                                  </>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">
                                    {item.name || item.product_name || `Товар #${item.product_id}`}
                                  </TableCell>
                                  <TableCell>{item.quantity || item.qty || item.total || 0}</TableCell>
                                  <TableCell>{item.unit || 'шт'}</TableCell>
                                  <TableCell className="text-green-600">
                                    ₽{parseFloat(item.purchase_price || item.price || 0).toLocaleString('ru-RU')}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    ₽{parseFloat(item.total_price || item.total || 0).toLocaleString('ru-RU')}
                                  </TableCell>
                                  <TableCell>{item.barcode || '-'}</TableCell>
                                  {selectedDocument.documentType === 'receipt' && (
                                      <>
                                        <TableCell>{item.vat_rate || item.vat || 0}%</TableCell>
                                        <TableCell>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('ru-RU') : '-'}</TableCell>
                                      </>
                                  )}
                                </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        <div className="border-t p-4 ">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">Итого товаров:</div>
                            <div className="font-medium">{items.length} позиций</div>
                          </div>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t">
                            <div className="font-bold">Общая сумма:</div>
                            <div className={`font-bold text-lg ${
                                selectedDocument.type === 'Приход' ? 'text-green-600' :
                                    selectedDocument.type === 'Расход' ? 'text-red-600' : 'text-orange-600'
                            }`}>
                              ₽{items.reduce((sum, item) =>
                                sum + (parseFloat(item.total_price || item.price || item.total || 0) * (parseFloat(item.quantity || item.qty || 1))), 0)
                                .toLocaleString('ru-RU', {minimumFractionDigits: 2})}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              )}
            </div>
          </div>
        </div>
    );
  };


  const renderViewButton = (document) => (
      <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleViewDocument(document);
          }}
      >
        <Eye className="h-4 w-4"/>
      </Button>
  );


  const getFilteredIncomes = () => {
    if (pointFilter === 'all') return incomes;
    if (!selectedSalesPoint) return incomes;

    const pointId = selectedSalesPoint.id;
    return incomes.filter(income =>
        income.point_retail_id === pointId ||
        income.point_retail_id === pointId.toString()
    );
  };

  const getFilteredExpenses = () => {
    if (pointFilter === 'all') return expenses;
    if (!selectedSalesPoint) return expenses;

    const pointId = selectedSalesPoint.id;
    return expenses.filter(expense =>
        expense.point_retail_id === pointId ||
        expense.point_retail_id === pointId.toString()
    );
  };

  const getFilteredWriteOffs = () => {
    if (pointFilter === 'all') return writeOffs;
    if (!selectedSalesPoint) return writeOffs;

    const pointId = selectedSalesPoint.id;
    return writeOffs.filter(writeOff =>
        writeOff.point_retail_id === pointId ||
        writeOff.point_retail_id === pointId.toString()
    );
  };

  const getFilteredDocuments = () => {
    let filtered = documents.filter(doc => {
      const matchesSearch =
          doc.displayNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.displayCounterparty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
          documentTypeFilter === 'all' ||
          (documentTypeFilter === 'Приход' && doc.documentType === 'receipt') ||
          (documentTypeFilter === 'Расход' && doc.documentType === 'expenditure') ||
          (documentTypeFilter === 'Списание' && doc.documentType === 'writeoff');

      const matchesStatus =
          documentStatusFilter === 'all-status' ||
          (documentStatusFilter === 'проведен' && doc.displayStatus === 'approved') ||
          (documentStatusFilter === 'черновик' && doc.displayStatus === 'draft') ||
          (documentStatusFilter === 'отменен' && doc.displayStatus === 'cancelled');

      // Фильтрация по точке продаж
      let matchesPoint = true;
      if (pointFilter !== 'all' && selectedSalesPoint) {
        const pointId = selectedSalesPoint.id;
        matchesPoint = doc.point_retail_id === pointId || doc.point_retail_id === pointId.toString();
      }

      return matchesSearch && matchesType && matchesStatus && matchesPoint;
    });

    return filtered;
  };

  const getFinanceStats = () => {
    const filteredIncomes = getFilteredIncomes();
    const filteredExpenses = getFilteredExpenses();
    const filteredWriteOffs = getFilteredWriteOffs();

    const totalIncome = filteredIncomes.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const totalExpense = filteredExpenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const totalReturns = returns.reduce((sum, item) => sum + item.amount, 0);
    const totalWriteOffs = filteredWriteOffs.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const balance = totalIncome - totalExpense - totalReturns - totalWriteOffs;

    return { totalIncome, totalExpense, totalReturns, totalWriteOffs, balance };
  };

  const stats = getFinanceStats();

  const fetchIncomes = async () => {
    const headers = getAuthHeaders();
    try {
      const response = await fetch('/receipt-invoices/?skip=0&limit=100&include_items=true', { headers });
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      setIncomes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching incomes:', error);
      setIncomes([]);
    } finally {
      setIncomesLoading(false);
    }
  };

  const fetchExpenses = async () => {
    const headers = getAuthHeaders();
    try {
      const response = await fetch('/expenditure-invoices/?skip=0&limit=100&include_items=true', { headers });
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка загрузки расходов:', error);
      setExpenses([]);
    } finally {
      setExpensesLoading(false);
    }
  };

  const fetchCounterparties = async () => {
    const headers = getAuthHeaders();
    try {
      const response = await fetch('/counterparties/?skip=0&limit=100', { headers });
      const data = await response.json();
      setCounterparties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching counterparties:', error);
      setCounterparties([]);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        fetchIncomes(),
        fetchExpenses(),
        fetchCounterparties(),
        fetchWriteOffs(),
        fetchAllDocuments()
      ]);
    };
    loadAllData();
  }, []);

  // Обновляем point_retail_id в формах при изменении selectedSalesPoint
  useEffect(() => {
    if (selectedSalesPoint) {
      setNewIncome(prev => ({
        ...prev,
        point_retail_id: selectedSalesPoint.id.toString()
      }));
      setNewExpense(prev => ({
        ...prev,
        point_retail_id: selectedSalesPoint.id.toString()
      }));
      setNewWriteOff(prev => ({
        ...prev,
        point_retail_id: selectedSalesPoint.id.toString()
      }));
    }
  }, [selectedSalesPoint]);

  const getIncomeStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      'approved': 'Подтвержден',
      'pending': 'В ожидании',
      'rejected': 'Отклонен',
      'draft': 'Черновик',
      'string': 'Не указан'
    };
    return statusMap[status] || status;
  };

  const formatPaymentType = (type) => {
    const typeMap = {
      'cash': 'Наличные',
      'card': 'Карта',
      'transfer': 'Перевод',
      'string': 'Не указан'
    };
    return typeMap[type] || type;
  };

  const getCounterpartyName = (counterpartyId) => {
    if (!counterpartyId) return 'Не указан';
    const counterparty = counterparties.find(c => c.id === counterpartyId);
    return counterparty ?
        (counterparty.Full_name || counterparty.full_name || `Контрагент #${counterpartyId}`) :
        `Контрагент #${counterpartyId}`;
  };

  const getWarehouseName = (warehouseId) => {
    if (!warehouseId) return 'Не указан';
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ?
        (warehouse.name || `Склад #${warehouseId}`) :
        `Склад #${warehouseId}`;
  };

  const getPointRetailName = (pointRetailId) => {
    if (!pointRetailId) return 'Не указана';
    const point = pointsRetail.find(p => p.id === pointRetailId);
    return point?.name || `Точка #${pointRetailId}`;
  };

  const handleAddIncome = async () => {
    if (!newIncome.number_doc || !newIncome.counterparty_id || !newIncome.warehouse_id) {
      alert('Пожалуйста, заполните обязательные поля: Номер документа, Контрагент, Склад');
      return;
    }
    const headers = getAuthHeaders();
    setAddIncomeLoading(true);
    try {
      const formatDateWithoutTimezone = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toISOString().slice(0, 19).replace('T', ' ');
      };

      // Подготавливаем данные для metadate и items
      const itemsForMetadata = newIncome.items.map((item, index) => {
        const existingProduct = products.find(p =>
            p.name.toLowerCase() === item.name.toLowerCase()
        );

        return {
          product_id: existingProduct?.id || 1,
          name: item.name,
          quantity: parseFloat(item.totalQty) || 1,
          price: item.purchasePrice || "0",
          purchase_price: item.purchasePrice || "0",
          retail_price: item.purchasePrice || "0",
          barcode: item.barcode || "",
          sku: item.barcode || `SKU-${Date.now()}-${index}`,
          unit: item.unit || "шт",
          vat_rate: parseFloat(item.vat) || 0,
          vat_amount: parseFloat(item.taxAmount) || 0,
          total_without_vat: parseFloat(item.totalWithoutVat) || 0,
          expiry_date: item.expiryDate ? formatDateWithoutTimezone(item.expiryDate + 'T00:00:00') : null
        };
      });

      const totalAmount = newIncome.items.reduce((sum, item) =>
          sum + (Number(item.purchasePrice || 0) * Number(item.totalQty || 0)), 0
      );


      const incomeData = {
        transaction_id: newIncome.transaction_id || `TRX-${Date.now()}`,
        number_doc: newIncome.number_doc,
        ext_number_doc: newIncome.ext_number_doc || '',
        user_id: getCurrentUserId(),
        counterparty_id: parseInt(newIncome.counterparty_id),
        point_retail_id: parseInt(newIncome.point_retail_id) || (selectedSalesPoint ? selectedSalesPoint.id : 1),
        date_create: formatDateWithoutTimezone(newIncome.date_create) || formatDateWithoutTimezone(new Date()),
        date_approval: newIncome.date_approval ? formatDateWithoutTimezone(newIncome.date_approval) : null,
        status: newIncome.status,
        warehouse_id: parseInt(newIncome.warehouse_id),
        type_payment: newIncome.type_payment,
        amount: totalAmount.toString(),
        metadate: {
          ...newIncome.metadate,
          items: itemsForMetadata,
          items_count: newIncome.items.length,
          total_amount: totalAmount,
          total_with_vat: newIncome.items.reduce((sum, item) =>
              sum + (Number(item.purchasePrice || 0) * Number(item.totalQty || 0)), 0
          ),
          total_without_vat: newIncome.items.reduce((sum, item) =>
              sum + Number(item.totalWithoutVat || 0), 0
          )
        },
      };

      console.log('📤 Отправляемые данные прихода:', JSON.stringify(incomeData, null, 2));

      const response = await fetch('/receipt-invoices/', {
        method: 'POST',
        headers,
        body: JSON.stringify(incomeData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка при создании прихода: ${errorText}`);
      }

      const createdIncome = await response.json();
      console.log('✅ Приход создан:', createdIncome);

      await fetchIncomes();

      setNewIncome({
        transaction_id: '',
        number_doc: '',
        ext_number_doc: '',
        user_id: '',
        counterparty_id: '',
        point_retail_id: selectedSalesPoint ? selectedSalesPoint.id.toString() : '',
        date_create: new Date().toISOString().slice(0, 16),
        date_approval: '',
        status: 'draft',
        warehouse_id: '',
        type_payment: 'cash',
        amount: '0',
        metadate: {},
        items: []
      });

      setNewIncomeItem({
        name: '',
        category: '',
        barcode: '',
        unit: '',
        packages: '',
        packageBarcode: '',
        qtyInPackage: '',
        totalQty: '',
        purchasePrice: '',
        vat: '',
        taxAmount: '',
        totalWithoutVat: '',
        expiryDate: ''
      });

      setSearchQuery('');

      alert('Приход успешно создан!');

    } catch (error) {
      console.error('💥 Ошибка при создании прихода:', error);
      alert(`Ошибка при создании прихода: ${error.message}`);
    } finally {
      setAddIncomeLoading(false);
    }
  };
  useEffect(() => {
    const loadProducts = async () => {
      const headers = getAuthHeaders();
      try {
        const response = await fetch('/products/?skip=0&limit=1000', { headers });
        if (response.ok) {
          const data = await response.json();
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Ошибка загрузки продуктов:', error);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const loadFormData = async () => {
      const headers = getAuthHeaders();
      try {
        const [counterpartiesRes, pointsRes, warehousesRes, usersRes] = await Promise.all([
          fetch('/counterparties/?skip=0&limit=100', { headers }),
          fetch('/points-retail/?skip=0&limit=100', { headers }),
          fetch('/warehouses/?skip=0&limit=100', { headers }),
          fetch('/users/?skip=0&limit=100', { headers })
        ]);

        if (counterpartiesRes.ok) setCounterparties(await counterpartiesRes.json());
        if (pointsRes.ok) setPointsRetail(await pointsRes.json());
        if (warehousesRes.ok) setWarehouses(await warehousesRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());

      } catch (error) {
        console.error('Error loading form data:', error);
      }
    };

    loadFormData();
  }, []);

  const handleIncomeInputChange = (field, value) => {
    setNewIncome(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddExpense = async () => {
    if (!newExpense.counterparty_id || !newExpense.warehouse_id || !newExpense.amount) {
      alert('Пожалуйста, заполните обязательные поля: Контрагент, Склад, Сумма');
      return;
    }

    const getNextDocumentNumber = async () => {
      try {
        console.log('🔄 Получаем последний номер документа из списка расходов...');
        const headers = getAuthHeaders();
        const expensesResponse = await fetch('/expenditure-invoices/?skip=0&limit=100&include_items=true', { headers });

        if (expensesResponse.ok) {
          const expensesData = await expensesResponse.json();

          if (expensesData && expensesData.length > 0) {
            let maxNumber = 0;

            expensesData.forEach(exp => {
              if (exp.number_doc) {
                const num = parseInt(exp.number_doc);
                if (!isNaN(num) && num > maxNumber) {
                  maxNumber = num;
                }
              }
            });

            const nextNumber = maxNumber + 1;
            console.log(`✅ Найден последний номер: ${maxNumber}, следующий: ${nextNumber}`);
            return nextNumber;
          } else {
            console.log('📝 Документов нет, начинаем с 1');
            return 1;
          }
        } else {
          throw new Error('Не удалось загрузить список расходов');
        }
      } catch (error) {
        console.error('❌ Ошибка при получении номера документа:', error);

        const manualNumber = prompt(
            'Не удалось автоматически получить номер документа. Пожалуйста, введите номер вручную:'
        );
        if (manualNumber) {
          return manualNumber;
        } else {
          const timestampNumber = Math.floor(Date.now() / 1000) % 10000;
          console.log(`⏰ Генерируем номер на основе времени: ${timestampNumber}`);
          return timestampNumber.toString();
        }
      }
    };

    setAddExpenseLoading(true);
    try {
      const nextDocNumber = await getNextDocumentNumber();
      console.log('✅ Используем номер документа:', nextDocNumber);

      const formatDateWithoutTimezone = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toISOString().slice(0, 19).replace('T', ' ');
      };

      const getOrCreateProductId = async (itemName, unitName) => {
        const existingProduct = products.find(p =>
            p.name.toLowerCase() === itemName.toLowerCase()
        );

        if (existingProduct) {
          return {
            productId: existingProduct.id,
            unitId: existingProduct.unit_id || 1
          };
        }

        const findUnitId = (unitName) => {
          const unit = units.find(u =>
              u.name?.toLowerCase() === unitName?.toLowerCase() ||
              u.abbreviation?.toLowerCase() === unitName?.toLowerCase()
          );
          return unit ? unit.id : 1; // По умолчанию ID 1 (штуки)
        };

        console.log(`Продукт "${itemName}" не найден, используем fallback`);
        return {
          productId: 1,
          unitId: findUnitId(unitName)
        };
      };

      const itemsWithProductIds = await Promise.all(
          newExpense.items.map(async (item) => {
            const { productId, unitId } = await getOrCreateProductId(item.name, item.unit);

            return {
              product_id: productId,
              name: item.name,
              quantity: parseFloat(item.totalQty) || 1,
              price: item.purchasePrice || "0",
              purchase_price: item.purchasePrice || "0",
              retail_price: item.purchasePrice || "0",
              barcode: item.barcode || "",
              unit: item.unit || "шт",
              unit_id: unitId,
              vat_rate: parseFloat(item.vat) || 0,
              vat_amount: parseFloat(item.taxAmount) || 0,
              total_without_vat: parseFloat(item.totalWithoutVat) || 0,
              expiry_date: item.expiryDate ? formatDateWithoutTimezone(item.expiryDate + 'T00:00:00') : null
            };
          })
      );

      const totalAmountFromItems = newExpense.items.reduce((sum, item) =>
          sum + (Number(item.purchasePrice || 0) * Number(item.totalQty || 0)), 0
      );

      const expenseData = {
        transaction_id: newExpense.transaction_id || `EXP-${Date.now()}`,
        number_doc: nextDocNumber.toString(),
        ext_number_doc: newExpense.ext_number_doc || '',
        user_id: getCurrentUserId(),
        counterparty_id: parseInt(newExpense.counterparty_id),
        point_retail_id: parseInt(newExpense.point_retail_id) || (selectedSalesPoint ? selectedSalesPoint.id : 1),
        date_create: formatDateWithoutTimezone(newExpense.date_create) || formatDateWithoutTimezone(new Date()),
        date_approval: newExpense.date_approval ? formatDateWithoutTimezone(newExpense.date_approval) : null,
        status: newExpense.status,
        warehouse_id: parseInt(newExpense.warehouse_id),
        type_payment: newExpense.type_payment,
        amount: totalAmountFromItems.toString(),
        metadate: {
          ...newExpense.metadate,
          items: itemsWithProductIds,
          items_count: newExpense.items ? newExpense.items.length : 0,
          total_with_vat: newExpense.items ? newExpense.items.reduce((sum, item) =>
              sum + (Number(item.purchasePrice || 0) * Number(item.totalQty || 0)), 0
          ) : 0,
          total_without_vat: newExpense.items ? newExpense.items.reduce((sum, item) =>
              sum + Number(item.totalWithoutVat || 0), 0
          ) : 0
        }
      };

      console.log('📤 Отправляемые данные расхода:', JSON.stringify(expenseData, null, 2));
      const headers = getAuthHeaders();
      const response = await fetch('/expenditure-invoices/', {
        method: 'POST',
        headers,
        body: JSON.stringify(expenseData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка при создании расхода: ${errorText}`);
      }

      const createdExpense = await response.json();
      console.log('✅ Расход создан:', createdExpense);

      await fetchExpenses();

      setNewExpense({
        transaction_id: '',
        number_doc: '',
        ext_number_doc: '',
        user_id: '',
        counterparty_id: '',
        point_retail_id: selectedSalesPoint ? selectedSalesPoint.id.toString() : '',
        date_create: new Date().toISOString().slice(0, 16),
        date_approval: '',
        status: 'draft',
        warehouse_id: '',
        type_payment: 'cash',
        amount: '0',
        metadate: {},
        items: []
      });

      setNewExpenseItem({
        name: '',
        category: '',
        barcode: '',
        unit: '',
        packages: '',
        packageBarcode: '',
        qtyInPackage: '',
        totalQty: '',
        purchasePrice: '',
        vat: '',
        taxAmount: '',
        totalWithoutVat: '',
        expiryDate: ''
      });

      setSearchQuery('');

      alert('Расход успешно создан!');

    } catch (error) {
      console.error('💥 Ошибка при создании расхода:', error);
      alert(`Ошибка при создании расхода: ${error.message}`);
    } finally {
      setAddExpenseLoading(false);
    }
  };

  const fetchWriteOffs = async () => {
    const headers = getAuthHeaders();
    try {
      const response = await fetch('/act-debitings/?skip=0&limit=100&include_items=true', { headers });
      if (response.ok) {
        const data = await response.json();

        const processedWriteOffs = Array.isArray(data) ? data.map(writeOff => ({
          ...writeOff,
          items: writeOff.items && writeOff.items.length > 0
              ? writeOff.items
              : (writeOff.metadate?.items || [])
        })) : [];

        setWriteOffs(processedWriteOffs);
      } else {
        setWriteOffs([]);
      }
    } catch (error) {
      console.error('Error fetching write-offs:', error);
      setWriteOffs([]);
    } finally {
      setWriteOffsLoading(false);
    }
  };

  const fetchAllDocuments = async () => {
    const headers = getAuthHeaders();
    try {
      const [receiptsRes, expendituresRes, writeOffsRes] = await Promise.all([
        fetch('/receipt-invoices/?skip=0&limit=100&include_items=true', { headers }),
        fetch('/expenditure-invoices/?skip=0&limit=100&include_items=true', { headers }),
        fetch('/act-debitings/?skip=0&limit=100&include_items=true', { headers })
      ]);

      const receipts = receiptsRes.ok ? await receiptsRes.json() : [];
      const expenditures = expendituresRes.ok ? await expendituresRes.json() : [];
      const writeOffs = writeOffsRes.ok ? await writeOffsRes.json() : [];

      const allDocuments = [
        ...receipts.map(doc => ({
          ...doc,
          id: doc.id,
          type: 'Приход',
          documentType: 'receipt',
          displayDate: doc.date_create,
          displayNumber: doc.number_doc || `Приход-${doc.id}`,
          displayCounterparty: getCounterpartyName(doc.counterparty_id),
          displayAmount: parseFloat(doc.amount || 0),
          displayStatus: doc.status,
          displayResponsible: `Пользователь #${doc.user_id}`,
          point_retail_id: doc.point_retail_id
        })),
        ...expenditures.map(doc => ({
          ...doc,
          id: doc.id,
          type: 'Расход',
          documentType: 'expenditure',
          displayDate: doc.date_create,
          displayNumber: doc.number_doc || `Расход-${doc.id}`,
          displayCounterparty: getCounterpartyName(doc.counterparty_id),
          displayAmount: parseFloat(doc.amount || 0),
          displayStatus: doc.status,
          displayResponsible: `Пользователь #${doc.user_id}`,
          point_retail_id: doc.point_retail_id
        })),
        ...writeOffs.map(doc => ({
          ...doc,
          id: doc.id,
          type: 'Списание',
          documentType: 'writeoff',
          displayDate: doc.date_create,
          displayNumber: `Акт-${doc.id}`,
          displayCounterparty: doc.reason_write_off || 'Списание',
          displayAmount: 0,
          displayStatus: doc.date_approval ? 'approved' : 'draft',
          displayResponsible: `Точка #${doc.point_retail_id}`,
          point_retail_id: doc.point_retail_id
        }))
      ];

      setDocuments(allDocuments);
    } catch (error) {
      console.error('Ошибка загрузки документов:', error);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleExpenseInputChange = (field, value) => {
    setNewExpense(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddReturn = () => {
    if (newReturn.counterparty && newReturn.amount) {
      const returnDoc = {
        id: returns.length + 1,
        date: new Date().toISOString().split('T')[0],
        documentNumber: `ВЗВ-${String(returns.length + 1).padStart(5, '0')}`,
        counterparty: newReturn.counterparty,
        category: newReturn.category,
        amount: parseFloat(newReturn.amount),
        account: newReturn.account,
        comment: newReturn.comment,
        responsible: getCurrentUserName(),
        status: 'проведен'
      };
      setReturns([returnDoc, ...returns]);
      setNewReturn({ counterparty: '', category: '', amount: '', account: '', comment: '' });
      setShowReturnForm(false);
    }
  };

  const handleAddTransfer = () => {
    if (newTransfer.fromAccount && newTransfer.toAccount && newTransfer.amount) {
      const transfer = {
        id: transfers.length + 1,
        date: new Date().toISOString().split('T')[0],
        documentNumber: `ПРМ-${String(transfers.length + 1).padStart(5, '0')}`,
        fromAccount: newTransfer.fromAccount,
        toAccount: newTransfer.toAccount,
        amount: parseFloat(newTransfer.amount),
        comment: newTransfer.comment,
        responsible: getCurrentUserName(),
        status: 'проведен'
      };
      setTransfers([transfer, ...transfers]);
      setNewTransfer({ fromAccount: '', toAccount: '', amount: '', comment: '' });
      setShowTransferForm(false);
    }
  };

  const getExpenseStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatExpenseStatus = (status) => {
    const statusMap = {
      'approved': 'Проведен',
      'pending': 'В ожидании',
      'rejected': 'Отклонен',
      'draft': 'Черновик',
      'string': 'Не указан'
    };
    return statusMap[status] || status;
  };

  const getWriteOffStatus = (writeOff) => {
    if (writeOff.date_approval) return 'approved';
    return 'draft';
  };

  const getWriteOffStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatWriteOffStatus = (status) => {
    const statusMap = {
      'approved': 'Проведен',
      'draft': 'Черновик',
      'string': 'Не указан'
    };
    return statusMap[status] || status;
  };

  const formatDocumentStatus = (status) => {
    const statusMap = {
      'approved': 'Проведен',
      'draft': 'Черновик',
      'cancelled': 'Отменен',
      'pending': 'В ожидании',
      'string': 'Не указан'
    };
    return statusMap[status] || status;
  };

  const [searchQueryWriteOff, setSearchQueryWriteOff] = useState('');
  const [showSearchResultsWriteOff, setShowSearchResultsWriteOff] = useState(false);
  const searchContainerRefWriteOff = useRef(null);

  const searchProductsWriteOff = async (query) => {
    if (!query || query.length < 1) {
      setSearchResults([]);
      setShowSearchResultsWriteOff(false);
      return;
    }

    try {
      const filtered = products.filter(product =>
          product.name?.toLowerCase().includes(query.toLowerCase()) ||
          product.barcode?.toLowerCase().includes(query.toLowerCase()) ||
          product.sku?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);

      setSearchResults(filtered);
      setShowSearchResultsWriteOff(true);

    } catch (error) {
      console.error('Ошибка поиска продуктов для списания:', error);
      setSearchResults([]);
    }
  };

  const handleProductSelectWriteOff = (product) => {
    setNewWriteOffItem({
      name: product.name,
      barcode: product.barcode || '',
      article: product.article || '',
      unit: getUnitName(product.unit_id) || 'шт',
      total: '1'
    });
    setSearchQueryWriteOff(product.name);
    setShowSearchResultsWriteOff(false);
  };

  const handleAddWriteOff = async () => {
    if (!newWriteOff.warehouse_id || !newWriteOff.reason_write_off) {
      alert('Пожалуйста, заполните обязательные поля: Склад, Причина списания');
      return;
    }

    const getNextWriteOffNumber = async () => {
      try {
        console.log('🔄 Получаем последний номер документа для списания...');
        const headers = getAuthHeaders();
        const writeOffsResponse = await fetch('/act-debitings/?skip=0&limit=100', { headers });

        if (writeOffsResponse.ok) {
          const writeOffsData = await writeOffsResponse.json();

          if (writeOffsData && writeOffsData.length > 0) {
            let maxNumber = 0;

            writeOffsData.forEach(writeOff => {
              if (writeOff.number_doc) {
                const num = parseInt(writeOff.number_doc);
                if (!isNaN(num) && num > maxNumber) {
                  maxNumber = num;
                }
              }
            });

            const nextNumber = maxNumber + 1;
            console.log(`✅ Найден последний номер списания: ${maxNumber}, следующий: ${nextNumber}`);
            return nextNumber;
          } else {
            console.log('📝 Документов списания нет, начинаем с 1');
            return 1;
          }
        } else {
          throw new Error('Не удалось загрузить список списаний');
        }
      } catch (error) {
        console.error('❌ Ошибка при получении номера документа списания:', error);

        const manualNumber = prompt(
            'Не удалось автоматически получить номер документа списания. Пожалуйста, введите номер вручную:'
        );
        if (manualNumber) {
          return manualNumber;
        } else {
          const timestampNumber = Math.floor(Date.now() / 1000) % 10000;
          console.log(`⏰ Генерируем номер на основе времени: ${timestampNumber}`);
          return timestampNumber.toString();
        }
      }
    };

    try {
      const nextDocNumber = await getNextWriteOffNumber();
      console.log('✅ Используем номер документа списания:', nextDocNumber);

      const formatDateWithoutTimezone = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toISOString().slice(0, 19).replace('T', ' ');
      };

      // Подготавливаем товары для метаданных
      const itemsForMetadata = newWriteOff.items.map(item => ({
        name: item.name,
        barcode: item.barcode || '',
        article: item.article || '',
        unit: item.unit || 'шт',
        quantity: parseFloat(item.total) || 1,
        total: parseFloat(item.total) || 1
      }));

      const writeOffData = {
        number_doc: nextDocNumber.toString(),
        user_id: getCurrentUserId(),
        point_retail_id: parseInt(newWriteOff.point_retail_id) || (selectedSalesPoint ? selectedSalesPoint.id : 1),
        warehouse_id: parseInt(newWriteOff.warehouse_id),
        reason_write_off: newWriteOff.reason_write_off,
        date_create: formatDateWithoutTimezone(newWriteOff.date_create) || formatDateWithoutTimezone(new Date()),
        date_approval: newWriteOff.date_approval ? formatDateWithoutTimezone(newWriteOff.date_approval) : null,
        metadate: {
          ...newWriteOff.metadate,
          items: itemsForMetadata, // Сохраняем товары в метаданных
          items_count: newWriteOff.items ? newWriteOff.items.length : 0
        }
      };

      console.log('📤 Отправляемые данные списания:', JSON.stringify(writeOffData, null, 2));
      const headers = getAuthHeaders();
      const response = await fetch('/act-debitings/', {
        method: 'POST',
        headers,
        body: JSON.stringify(writeOffData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка при создании списания: ${errorText}`);
      }

      const createdWriteOff = await response.json();
      console.log('✅ Списание создано:', createdWriteOff);

      await fetchWriteOffs();

      setNewWriteOff({
        point_retail_id: selectedSalesPoint ? selectedSalesPoint.id.toString() : '',
        warehouse_id: '',
        reason_write_off: '',
        date_create: new Date().toISOString().slice(0, 16),
        date_approval: '',
        metadate: {},
        items: []
      });

      setNewWriteOffItem({
        name: '',
        barcode: '',
        article: '',
        unit: '',
        total: ''
      });

      setSearchQueryWriteOff('');
      setShowSearchResultsWriteOff(false);

      alert('Списание успешно создано!');

    } catch (error) {
      console.error('❌ Ошибка при создании списания:', error);
      alert(`Ошибка при создании списания: ${error.message}`);
    }
  };

  const handleWriteOffInputChange = (field, value) => {
    setNewWriteOff(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const searchProducts = async (query) => {
    if (!query || query.length < 1) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const filtered = products.filter(product =>
          product.name?.toLowerCase().includes(query.toLowerCase()) ||
          product.barcode?.toLowerCase().includes(query.toLowerCase()) ||
          product.sku?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);

      setSearchResults(filtered);
      setShowSearchResults(true);

    } catch (error) {
      console.error('Ошибка поиска продуктов:', error);
      setSearchResults([]);
    }
  };

  const handleProductSelect = (product) => {
    setNewIncomeItem({
      name: product.name,
      category: product.categories_products_id || '',
      barcode: product.barcode || '',
      unit: getUnitName(product.unit_id) || 'шт',
      packages: '',
      packageBarcode: '',
      qtyInPackage: '',
      totalQty: '1',
      purchasePrice: product.purchase_price || '0',
      vat: '',
      taxAmount: '',
      totalWithoutVat: '',
      expiryDate: product.expiration_date ? product.expiration_date.split('T')[0] : ''
    });
    setSearchQuery(product.name);
    setShowSearchResults(false);
  };

  const getUnitName = (unitId) => {
    const units = {
      1: 'шт',
      2: 'кг',
      3: 'г',
      4: 'л',
      5: 'мл',
      6: 'уп',
      7: 'пак'
    };
    return units[unitId] || 'шт';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'проведен': return 'bg-green-100 text-green-800';
      case 'черновик': return 'bg-gray-100 text-gray-800';
      case 'отменен': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Приход': return 'bg-green-100 text-green-800';
      case 'Расход': return 'bg-red-100 text-red-800';
      case 'Списание': return 'bg-orange-100 text-orange-800';
      case 'Перемещение': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showIncomeForm || showExpenseForm || showReturnForm || showWriteOffForm || showTransferForm) {
    return (
       <ShowForm showIncomeForm={showIncomeForm} setNewIncome={setNewIncome} selectedSalesPoint={selectedSalesPoint} setShowIncomeForm={setShowIncomeForm} setNewIncomeItem={setNewIncomeItem} handleAddIncome={handleAddIncome}
                 addIncomeLoading={addIncomeLoading} newIncome={newIncome} handleIncomeInputChange={handleIncomeInputChange} counterparties={counterparties} searchContainerRef={searchContainerRef} newIncomeItem={newIncomeItem}
                 searchProducts={searchProducts} warehouses={warehouses} pointsRetail={pointsRetail} newExpense={newExpense} setNewExpense={setNewExpense} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                 setShowSearchResults={setShowSearchResults} searchResults={searchResults} showSearchResults={showSearchResults} handleProductSelect={handleProductSelect} products={products} showExpenseForm={showExpenseForm}
                 setShowExpenseForm={setShowExpenseForm} setNewExpenseItem={setNewExpenseItem} addExpenseLoading={addExpenseLoading} handleAddExpense={handleAddExpense} handleExpenseInputChange={handleExpenseInputChange}
                 newExpenseItem={newExpenseItem} newTransfer={newTransfer} getUnitName={getUnitName} showReturnForm={showReturnForm} setShowReturnForm={setShowReturnForm} setNewReturn={setNewReturn} handleAddReturn={handleAddReturn}
                 newReturn={newReturn} showWriteOffForm={showWriteOffForm} setShowWriteOffForm={setShowWriteOffForm} setNewWriteOff={setNewWriteOff} setSearchQueryWriteOff={setSearchQueryWriteOff} setShowSearchResultsWriteOff={setShowSearchResultsWriteOff}
                 setNewWriteOffItem={setNewWriteOffItem} handleAddWriteOff={handleAddWriteOff} newWriteOff={newWriteOff} handleWriteOffInputChange={handleWriteOffInputChange} searchContainerRefWriteOff={searchContainerRefWriteOff}
                 newWriteOffItem={newWriteOffItem} searchQueryWriteOff={searchQueryWriteOff} searchProductsWriteOff={searchProductsWriteOff} handleProductSelectWriteOff={handleProductSelectWriteOff} showSearchResultsWriteOff={showSearchResultsWriteOff}
                 showTransferForm={showTransferForm} setNewTransfer={setNewTransfer} handleAddTransfer={handleAddTransfer} setShowTransferForm={setShowTransferForm}
       />
    );
  }

  const showSidebar = !showIncomeForm && !showExpenseForm && !showReturnForm && !showWriteOffForm && !showTransferForm;

  return (
      <div className="flex gap-6">
        {showSidebar && (
            <Card className="w-64 h-fit self-start" style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle className="text-sm">Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                    className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setShowIncomeForm(true)}
                >
                  <ArrowDownCircle className="h-4 w-4 mr-2" />
                  Приход
                </Button>

                <Button
                    className="w-full justify-start bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setShowExpenseForm(true)}
                >
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                  Расход
                </Button>

                <Button
                    className="w-full justify-start bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={() => setShowWriteOffForm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Списание
                </Button>

                <div className="border-t pt-2 mt-3">
                  <DownloadReportSection onDownload={handleDownload} />
                  <Button variant="outline" className="w-full justify-start mt-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    Выбрать период
                  </Button>
                </div>
              </CardContent>
            </Card>
        )}
        {!showDocumentDetail && (
           <ViewDiteil stats={stats} activeTab={activeTab} setActiveTab={setActiveTab} searchTerm={searchTerm}
                       setPointFilter={setPointFilter} setSearchTerm={setSearchTerm} pointFilter={pointFilter}
                       selectedSalesPoint={selectedSalesPoint}
                       incomesLoading={incomesLoading} getFilteredExpenses={getFilteredExpenses}
                       getExpenseStatusColor={getExpenseStatusColor} formatExpenseStatus={formatExpenseStatus}
                       writeOffsLoading={writeOffsLoading}
                       getWriteOffStatus={getWriteOffStatus} getPointRetailName={getPointRetailName}
                       getWriteOffStatusColor={getWriteOffStatusColor} getFilteredWriteOffs={getFilteredWriteOffs}
                       formatWriteOffStatus={formatWriteOffStatus}
                       handleViewDocument={handleViewDocument} documentTypeFilter={documentTypeFilter}
                       setDocumentTypeFilter={setDocumentTypeFilter} documentStatusFilter={documentStatusFilter}
                       setDocumentStatusFilter={setDocumentStatusFilter}
                       documentsLoading={documentsLoading} getTypeColor={getTypeColor}
                       getFilteredDocuments={getFilteredDocuments} getStatusColor={getStatusColor}
                       formatDocumentStatus={formatDocumentStatus} cashRegisters={cashRegisters}
                       cashOperations={cashOperations} getStatusBadge={getStatusBadge}
                       supplierPayments={supplierPayments} opexExpenses={opexExpenses} staffPayments={staffPayments}
                       getCounterpartyName={getCounterpartyName} getWarehouseName={getWarehouseName}
                       getFilteredIncomes={getFilteredIncomes}
                       formatPaymentType={formatPaymentType} renderViewButton={renderViewButton}
                       getIncomeStatusColor={getIncomeStatusColor} formatStatus={formatStatus}
                       handleDeleteIncome={handleDeleteIncome} expensesLoading={undefined}/>
        )}

        {showDocumentDetail && <DocumentDetailView />}
      </div>
  );
}

export default Finance;