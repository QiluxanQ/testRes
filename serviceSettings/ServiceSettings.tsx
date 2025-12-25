import React, {useCallback, useEffect, useState} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Settings, Bell, Shield, Database, CreditCard, Printer, Receipt, Wine, Package, Monitor, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Separator } from '../../ui/separator';
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../../ui/tabs";
import {
  ApiPrecheck,
  PrecheckFormData,
  ApiPointRetail,
  ApiWarehouse,
  PointRetailFormData,
  WarehouseFormData,
  ApiPrinter,
  PrinterFormData,
  Organization,
  ApiEgais,
  EgaisFormData,
  ApiMarking,
  MarkingFormData
} from '../../../types/setings';
import { UserManagementSection } from '../serviceSettings/block/UserManagementSection';
import GeneralSetings from "./block/GeneralSetings";
import KitchenPrinter from "./block/KitchenPrinter";
import Receipts from "./block/Receipts";
import Egais from "./block/Egais";

import {ApiEgaisType,ApiTerminalType} from '../../../types/setings'



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

export const ServiceSettings = () => {


  const [pointsRetail, setPointsRetail] = useState<ApiPointRetail[]>([]);
  const [warehouses, setWarehouses] = useState<ApiWarehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddPoint, setShowAddPoint] = useState(false);
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [editingPoint, setEditingPoint] = useState<ApiPointRetail | null>(null);
  const [editingWarehouse, setEditingWarehouse] = useState<ApiWarehouse | null>(null);
  const [selectedSalesPoint, setSelectedSalesPoint] = useState<ApiPointRetail | null>(null);

  // кассы
  const fetchCash = async () => {
    try {
      const respone = await fetch('/cash-registers/?skip=0&limit=500',{
        headers: getAuthHeaders()
      });
      const data = await respone.json();
      setCashRegisters(data);
    }catch(err) {
      console.error(err);
      setCashRegisters([])
    }finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchCash()
  }, []);
  const [cashRegisters, setCashRegisters] = useState([]);
  const [cashForm,setCashForm] = useState({
    point_retail_id:0,
    name:'',
    factory_number:'',
    ip_address:'',
    port:'',
    is_activ:true
  });

  const hendlerAddCash = async () => {
    try {
      const sentToData = {
        point_retail_id: getCurrentPointRetailId(),
        name: cashForm.name,
        factory_number: cashForm.factory_number,
        ip_address: cashForm.ip_address,
        port: cashForm.port,
        is_activ: cashForm.is_activ
      };
      const response = await fetch('/cash-registers/', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sentToData)
      });

      if (response.ok) {
        alert('Касса добавлена');
        setCashForm({
          point_retail_id: 0,
          name: '',
          factory_number: '',
          ip_address: '',
          port: '',
          is_activ: false
        });
        fetchCash();
      } else {
        const errorText = await response.text();
        throw new Error(`Ошибка при добавлении: ${errorText}`);
      }
    } catch (err) {
      console.error(err);
      alert("Ошибка добавления");
    }
  };

  const deleteCash = async (id: number): Promise<void> => {
    if (!confirm('Вы уверены, что хотите удалить эту кассу?')) return;
    try {
      const response = await fetch(`/cash-registers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        alert("Касса удалена");
        fetchCash();
      } else {
        throw new Error('Ошибка удаления кассы');
      }
    } catch (error) {
      console.error('Ошибка удаления кассы:', error);
      alert("Не удалось удалить кассу");
    }
  };

  const [check, setCheck] = useState([]);


  // Принтер
  const [printers, setPrinters] = useState<ApiPrinter[]>([]);
  const [editingPrinter, setEditingPrinter] = useState<ApiPrinter | null>(null);
  const [printerForm, setPrinterForm] = useState<PrinterFormData>({
    point_retail_id: 0,
    name: '',
    ip_address: '',
    port: '9100',
    kitchen_name: '',
    is_activ: true,
    autoPrint: true,
    soundSignal: true,
    printCookingTime: true,
    paperWidth: '80mm',
    copies: 1
  });

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizationForm, setOrganizationForm] = useState({
    Full_name: '',
    inn: '',
    kpp: '',
    ogrn: '',
    legal_address: '',
    actual_address: '',
    phone: '',
    email: '',
    website: '',
    nds: -1,
    companyType: '',
    okpo: '',
    directorName: '',
    directorPosition: '',
    bankName: '',
    bik: '',
    accountNumber: '',
    corrAccount: ''
  });
  const [isOrganizationChanged, setIsOrganizationChanged] = useState(false);





  // Чек
  const [precheckSettings, setPrecheckSettings] = useState<ApiPrecheck | null>(null);
  const [precheckForm, setPrecheckForm] = useState<PrecheckFormData>({
    point_retail_id: 0,
    name: 'Основные настройки чеков',
    type: 'receipt',
    vat: '0',
    is_activ: true,
    receiptFormat: 'thermal_80',
    receiptCopies: 1,
    receiptTitle: '',
    receiptFooter: '',
    receiptPhone: '',
    receiptWebsite: '',
    showQrCode: true,
    autoPrintReceipt: true,
    printPrecheck: true,
    showDiscounts: true,
    showWaiter: true,
    emailReceipts: false
  });
  const [isPrecheckChanged, setIsPrecheckChanged] = useState(false);

  // Егаис
  const [editingEgais, setEditingEgais] = useState<ApiEgaisType | null>(null);
  const [egaisList, setEgaisList] = useState<ApiEgaisType[]>([]);
  const [egaisForm, setEgaisForm] = useState({
    point_retail_id: 0,
    name: 'Настройки ЕГАИС',
    ip_address: '',
    port: '8080',
    is_activ: true,
    metadate: {
      egaisUrl: 'https://egais.server.ru',
      egaisLogin: '',
      egaisPassword: '',
      fsrarId: '',
      egaisOrgType: 'retail',
      enableIntegration: true,
      autoSendTtn: true,
      checkBalance: true,
      recordSales: true,
      syncInterval: '30'
    }
  });
  const [isEgaisChanged, setIsEgaisChanged] = useState(false);
  const [egaisSettings, setEgaisSettings] = useState<ApiEgaisType | null>(null);

  // Маркировка
  const [markingSettings, setMarkingSettings] = useState<ApiMarking | null>(null);
  const [markingList, setMarkingList] = useState<ApiMarking[]>([]);
  const [editingMarking, setEditingMarking] = useState<ApiMarking | null>(null);
  const [markingForm, setMarkingForm] = useState<MarkingFormData>({
    point_retail_id: 0,
    name: 'Настройки маркировки',
    ip_address: '',
    port: '',
    is_activ: true,
    markingUrl: 'https://markirovka.crpt.ru',
    markingToken: '',
    markingInn: '',
    markingOgrn: '',
    productGroups: [],
    scannerType: '2d',
    enableMarking: true,
    checkOnSale: true,
    withdrawalFromCirculation: true,
    blockSaleWithoutCode: false,
    errorNotifications: true
  });
  const [isMarkingChanged, setIsMarkingChanged] = useState(false);

  // Терминалы
  const [terminalList, setTerminalList] = useState<ApiTerminalType[]>([]);
  const [editingTerminal, setEditingTerminal] = useState<ApiTerminalType | null>(null);
  const [terminalForm, setTerminalForm] = useState({
    point_retail_id: 0,
    name: 'Настройки терминала',
    ip_address: '',
    port: '',
    is_activ: true,
    metadate: {
      terminalProvider: 'sberbank',
      terminalModel: 'ingenico_move5000',
      terminalId: '',
      merchantId: '',
      terminalApiKey: '',
      connectionType: 'ethernet',
      enableCardPayments: true,
      contactlessPayments: true,
      tipsEnabled: true,
      tipPercentages: '5,10,15',
      printSlip: true,
      autoReconciliation: true
    }
  });
  const [isTerminalChanged, setIsTerminalChanged] = useState(false);

  const getCurrentPointRetailId = (): number => {
    return selectedSalesPoint?.id || pointsRetail[0]?.id || 1;
  };

  const fetchAllEgaisSettings = useCallback(async (): Promise<ApiEgaisType[]> => {
    try {
      const response = await fetch(`/settings-egais/?skip=0&limit=100`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Ошибка загрузки настроек ЕГАИС');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Ошибка загрузки всех настроек ЕГАИС:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    const initializeEgaisSettings = async () => {
      try {
        const allSettings = await fetchAllEgaisSettings();
        setEgaisList(allSettings);
      } catch (error) {
        console.error('Ошибка инициализации настроек ЕГАИС:', error);
      }
    };

    initializeEgaisSettings();
  }, [fetchAllEgaisSettings]);

  const updateFormsPointRetailId = () => {
    const pointId = getCurrentPointRetailId();

    setPrinterForm(prev => ({
      ...prev,
      point_retail_id: pointId
    }));

    setCashForm(prev => ({
      ...prev,
      point_retail_id: pointId
    }))

    setPrecheckForm(prev => ({
      ...prev,
      point_retail_id: pointId
    }));

    setEgaisForm(prev => ({
      ...prev,
      point_retail_id: pointId
    }));

    setMarkingForm(prev => ({
      ...prev,
      point_retail_id: pointId
    }));

    setTerminalForm(prev => ({
      ...prev,
      point_retail_id: pointId
    }));
  };

  const fetchAllMarkingSettings = useCallback(async (): Promise<ApiMarking[]> => {
    try {
      const response = await fetch(`/settings-marking/?skip=0&limit=100`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Ошибка загрузки настроек маркировки');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Ошибка загрузки всех настроек маркировки:', error);
      return [];
    }
  }, []);

  const fetchMarkingSettings = async (pointRetailId?: number): Promise<ApiMarking[]> => {
    const pointId = pointRetailId || getCurrentPointRetailId();
    const response = await fetch(`/settings-marking/?skip=0&limit=100&point_retail_id=${pointId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Ошибка загрузки настроек маркировки');
    return response.json();
  };

  const createMarking = async (data: MarkingFormData): Promise<ApiMarking> => {
    const {
      markingUrl, markingToken, markingInn, markingOgrn, productGroups, scannerType,
      enableMarking, checkOnSale, withdrawalFromCirculation, blockSaleWithoutCode, errorNotifications,
      ...mainData
    } = data;

    const dataToSend = {
      ...mainData,
      point_retail_id: getCurrentPointRetailId(),
      metadate: {
        markingUrl,
        markingToken,
        markingInn,
        markingOgrn,
        productGroups,
        scannerType,
        enableMarking,
        checkOnSale,
        withdrawalFromCirculation,
        blockSaleWithoutCode,
        errorNotifications
      }
    };

    const response = await fetch('/settings-marking/', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dataToSend)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Ошибка создания настроек маркировки');
    }
    return response.json();
  };

  const updateMarking = async (id: number, data: MarkingFormData): Promise<ApiMarking> => {
    const {
      markingUrl, markingToken, markingInn, markingOgrn, productGroups, scannerType,
      enableMarking, checkOnSale, withdrawalFromCirculation, blockSaleWithoutCode, errorNotifications,
      ...mainData
    } = data;

    const dataToSend = {
      ...mainData,
      point_retail_id: getCurrentPointRetailId(),
      metadate: {
        markingUrl,
        markingToken,
        markingInn,
        markingOgrn,
        productGroups,
        scannerType,
        enableMarking,
        checkOnSale,
        withdrawalFromCirculation,
        blockSaleWithoutCode,
        errorNotifications
      }
    };

    const response = await fetch(`/settings-marking/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dataToSend)
    });
    if (!response.ok) throw new Error('Ошибка обновления настроек маркировки');
    return response.json();
  };

  const loadMarkingSettings = async () => {
    try {
      const markingData = await fetchMarkingSettings();
      if (markingData.length > 0) {
        const settings = markingData[0];
        setMarkingSettings(settings);

        const metadata = settings.metadate || {};

        setMarkingForm({
          point_retail_id: settings.point_retail_id,
          name: settings.name,
          ip_address: settings.ip_address,
          port: settings.port,
          is_activ: settings.is_activ,
          markingUrl: metadata.markingUrl || 'https://markirovka.crpt.ru',
          markingToken: metadata.markingToken || '',
          markingInn: metadata.markingInn || '',
          markingOgrn: metadata.markingOgrn || '',
          productGroups: metadata.productGroups || [],
          scannerType: metadata.scannerType || '2d',
          enableMarking: metadata.enableMarking ?? true,
          checkOnSale: metadata.checkOnSale ?? true,
          withdrawalFromCirculation: metadata.withdrawalFromCirculation ?? true,
          blockSaleWithoutCode: metadata.blockSaleWithoutCode ?? false,
          errorNotifications: metadata.errorNotifications ?? true
        });
      } else {
        updateFormsPointRetailId();
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек маркировки:', error);
    }
  };

  const loadMarkingList = async () => {
    try {
      const markingData = await fetchAllMarkingSettings();
      setMarkingList(markingData);
    } catch (error) {
      console.error('Ошибка загрузки списка настроек маркировки:', error);
    }
  };

  const handleMarkingChange = (field: keyof MarkingFormData, value: any) => {
    setMarkingForm(prev => ({
      ...prev,
      [field]: value
    }));
    setIsMarkingChanged(true);
  };

  const handleProductGroupsChange = (values: string[]) => {
    handleMarkingChange('productGroups', values);
  };

  const handleAddMarking = async () => {
    try {
      if (!markingForm.name.trim()) {
        alert('Заполните обязательное поле: название');
        return;
      }

      let nameToUse = markingForm.name;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const newMarking = await createMarking({ ...markingForm, name: nameToUse });
          const updatedMarkingList = await fetchAllMarkingSettings();
          setMarkingList(updatedMarkingList);
          resetMarkingForm();
          alert('Настройки маркировки успешно созданы!');
          return;
        } catch (error: any) {
          console.error('Ошибка создания:', error);

          if ((error.message.includes('duplicate key') ||
                  error.message.includes('UniqueViolationError') ||
                  error.message.includes('already exists')) &&
              retryCount < maxRetries - 1) {

            const existingSettings = await fetchAllMarkingSettings();
            const existingNames = existingSettings
                .filter(s => s.point_retail_id === getCurrentPointRetailId())
                .map(s => s.name);

            let suggestedName = `Настройки маркировки ${existingNames.length + 1}`;
            let counter = 1;

            while (existingNames.includes(suggestedName)) {
              suggestedName = `Настройки маркировки ${existingNames.length + 1 + counter}`;
              counter++;
            }

            const newName = prompt(
                `Настройки с названием "${nameToUse}" уже существуют.\n` +
                `Введите новое уникальное название:`,
                suggestedName
            );

            if (newName) {
              nameToUse = newName;
              retryCount++;
              setMarkingForm(prev => ({ ...prev, name: newName }));
            } else {
              alert('Создание отменено');
              return;
            }
          } else {
            alert(`Не удалось создать настройки маркировки: ${error.message}`);
            return;
          }
        }
      }

      alert('Превышено количество попыток. Попробуйте позже.');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось создать настройки маркировки');
    }
  };

  const handleEditMarking = async () => {
    if (!editingMarking) return;

    try {
      const updatedMarking = await updateMarking(editingMarking.id, markingForm);
      const updatedMarkingList = await fetchAllMarkingSettings();
      setMarkingList(updatedMarkingList);
      setEditingMarking(null);
      resetMarkingForm();
      alert('Настройки маркировки успешно обновлены!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось обновить настройки маркировки');
    }
  };

  const handleDeleteMarking = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эти настройки маркировки?')) return;

    try {
      const response = await fetch(`/settings-marking/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Ошибка удаления настроек маркировки');

      const updatedMarkingList = await fetchAllMarkingSettings();
      setMarkingList(updatedMarkingList);

      alert('Настройки маркировки успешно удалены!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось удалить настройки маркировки');
    }
  };

  const resetMarkingForm = async () => {
    try {
      const existingSettings = await fetchAllMarkingSettings();
      const existingNames = existingSettings
          .filter(s => s.point_retail_id === getCurrentPointRetailId())
          .map(s => s.name);

      let defaultName = 'Настройки маркировки';
      let counter = 1;

      while (existingNames.includes(defaultName)) {
        defaultName = `Настройки маркировки ${counter}`;
        counter++;
      }

      setMarkingForm({
        point_retail_id: getCurrentPointRetailId(),
        name: defaultName,
        ip_address: '',
        port: '',
        is_activ: true,
        markingUrl: 'https://markirovka.crpt.ru',
        markingToken: '',
        markingInn: '',
        markingOgrn: '',
        productGroups: [],
        scannerType: '2d',
        enableMarking: true,
        checkOnSale: true,
        withdrawalFromCirculation: true,
        blockSaleWithoutCode: false,
        errorNotifications: true
      });
      setEditingMarking(null);
      setIsMarkingChanged(false);
    } catch (error) {
      console.error('Ошибка при сбросе формы маркировки:', error);
      setMarkingForm({
        point_retail_id: getCurrentPointRetailId(),
        name: 'Настройки маркировки',
        ip_address: '',
        port: '',
        is_activ: true,
        markingUrl: 'https://markirovka.crpt.ru',
        markingToken: '',
        markingInn: '',
        markingOgrn: '',
        productGroups: [],
        scannerType: '2d',
        enableMarking: true,
        checkOnSale: true,
        withdrawalFromCirculation: true,
        blockSaleWithoutCode: false,
        errorNotifications: true
      });
    }
  };

  const openEditMarking = (marking: ApiMarking) => {
    setEditingMarking(marking);
    const metadata = marking.metadate || {};
    setMarkingForm({
      point_retail_id: marking.point_retail_id,
      name: marking.name,
      ip_address: marking.ip_address,
      port: marking.port,
      is_activ: marking.is_activ,
      markingUrl: metadata.markingUrl || 'https://markirovka.crpt.ru',
      markingToken: metadata.markingToken || '',
      markingInn: metadata.markingInn || '',
      markingOgrn: metadata.markingOgrn || '',
      productGroups: metadata.productGroups || [],
      scannerType: metadata.scannerType || '2d',
      enableMarking: metadata.enableMarking ?? true,
      checkOnSale: metadata.checkOnSale ?? true,
      withdrawalFromCirculation: metadata.withdrawalFromCirculation ?? true,
      blockSaleWithoutCode: metadata.blockSaleWithoutCode ?? false,
      errorNotifications: metadata.errorNotifications ?? true
    });
    setIsMarkingChanged(false);
  };

  const getMarkingStatus = (marking: ApiMarking) => {
    return marking.is_activ ? 'Активен' : 'Неактивен';
  };

  const handleSaveMarking = async () => {
    try {
      if (editingMarking) {
        await handleEditMarking();
      } else {
        await handleAddMarking();
      }
      setIsMarkingChanged(false);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Не удалось сохранить настройки');
    }
  };

  // Функции для работы с терминалами
  const fetchAllTerminalSettings = useCallback(async (): Promise<ApiTerminalType[]> => {
    try {
      const response = await fetch(`/settings-terminal/?skip=0&limit=100`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Ошибка загрузки настроек терминалов');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Ошибка загрузки всех настроек терминалов:', error);
      return [];
    }
  }, []);

  const fetchTerminalSettings = async (pointRetailId?: number): Promise<ApiTerminalType[]> => {
    const pointId = pointRetailId || getCurrentPointRetailId();
    const response = await fetch(`/settings-terminal/?skip=0&limit=100&point_retail_id=${pointId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Ошибка загрузки настроек терминалов');
    return response.json();
  };

  const createTerminal = async (data: any): Promise<ApiTerminalType> => {
    const dataToSend = {
      ...data,
      point_retail_id: getCurrentPointRetailId(),
    };

    const response = await fetch('/settings-terminal/', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dataToSend)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Ошибка создания настроек терминала');
    }
    return response.json();
  };

  const updateTerminal = async (id: number, data: any): Promise<ApiTerminalType> => {
    const dataToSend = {
      ...data,
      point_retail_id: getCurrentPointRetailId(),
    };

    const response = await fetch(`/settings-terminal/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dataToSend)
    });
    if (!response.ok) throw new Error('Ошибка обновления настроек терминала');
    return response.json();
  };

  const loadTerminalList = async () => {
    try {
      const terminalData = await fetchAllTerminalSettings();
      setTerminalList(terminalData);
    } catch (error) {
      console.error('Ошибка загрузки списка настроек терминалов:', error);
    }
  };

  const handleTerminalChange = (field: string, value: any) => {
    if (field === 'metadate') {
      setTerminalForm(prev => ({
        ...prev,
        metadate: { ...prev.metadate, ...value }
      }));
    } else {
      setTerminalForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setIsTerminalChanged(true);
  };

  const handleAddTerminal = async () => {
    try {
      if (!terminalForm.name.trim()) {
        alert('Заполните обязательное поле: название');
        return;
      }

      let nameToUse = terminalForm.name;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const newTerminal = await createTerminal({ ...terminalForm, name: nameToUse });
          const updatedTerminalList = await fetchAllTerminalSettings();
          setTerminalList(updatedTerminalList);
          resetTerminalForm();
          alert('Настройки терминала успешно созданы!');
          return;
        } catch (error: any) {
          console.error('Ошибка создания:', error);

          if ((error.message.includes('duplicate key') ||
                  error.message.includes('UniqueViolationError') ||
                  error.message.includes('already exists')) &&
              retryCount < maxRetries - 1) {

            const existingSettings = await fetchAllTerminalSettings();
            const existingNames = existingSettings
                .filter(s => s.point_retail_id === getCurrentPointRetailId())
                .map(s => s.name);

            let suggestedName = `Настройки терминала ${existingNames.length + 1}`;
            let counter = 1;

            while (existingNames.includes(suggestedName)) {
              suggestedName = `Настройки терминала ${existingNames.length + 1 + counter}`;
              counter++;
            }

            const newName = prompt(
                `Настройки с названием "${nameToUse}" уже существуют.\n` +
                `Введите новое уникальное название:`,
                suggestedName
            );

            if (newName) {
              nameToUse = newName;
              retryCount++;
              setTerminalForm(prev => ({ ...prev, name: newName }));
            } else {
              alert('Создание отменено');
              return;
            }
          } else {
            alert(`Не удалось создать настройки терминала: ${error.message}`);
            return;
          }
        }
      }

      alert('Превышено количество попыток. Попробуйте позже.');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось создать настройки терминала');
    }
  };

  const handleEditTerminal = async () => {
    if (!editingTerminal) return;

    try {
      const updatedTerminal = await updateTerminal(editingTerminal.id, terminalForm);
      const updatedTerminalList = await fetchAllTerminalSettings();
      setTerminalList(updatedTerminalList);
      setEditingTerminal(null);
      resetTerminalForm();
      alert('Настройки терминала успешно обновлены!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось обновить настройки терминала');
    }
  };

  const handleDeleteTerminal = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эти настройки терминала?')) return;

    try {
      const response = await fetch(`/settings-terminal/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Ошибка удаления настроек терминала');

      const updatedTerminalList = await fetchAllTerminalSettings();
      setTerminalList(updatedTerminalList);

      alert('Настройки терминала успешно удалены!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось удалить настройки терминала');
    }
  };

  const resetTerminalForm = async () => {
    try {
      const existingSettings = await fetchAllTerminalSettings();
      const existingNames = existingSettings
          .filter(s => s.point_retail_id === getCurrentPointRetailId())
          .map(s => s.name);

      let defaultName = 'Настройки терминала';
      let counter = 1;

      while (existingNames.includes(defaultName)) {
        defaultName = `Настройки терминала ${counter}`;
        counter++;
      }

      setTerminalForm({
        point_retail_id: getCurrentPointRetailId(),
        name: defaultName,
        ip_address: '',
        port: '',
        is_activ: true,
        metadate: {
          terminalProvider: 'sberbank',
          terminalModel: 'ingenico_move5000',
          terminalId: '',
          merchantId: '',
          terminalApiKey: '',
          connectionType: 'ethernet',
          enableCardPayments: true,
          contactlessPayments: true,
          tipsEnabled: true,
          tipPercentages: '5,10,15',
          printSlip: true,
          autoReconciliation: true
        }
      });
      setEditingTerminal(null);
      setIsTerminalChanged(false);
    } catch (error) {
      console.error('Ошибка при сбросе формы терминала:', error);
      setTerminalForm({
        point_retail_id: getCurrentPointRetailId(),
        name: 'Настройки терминала',
        ip_address: '',
        port: '',
        is_activ: true,
        metadate: {
          terminalProvider: 'sberbank',
          terminalModel: 'ingenico_move5000',
          terminalId: '',
          merchantId: '',
          terminalApiKey: '',
          connectionType: 'ethernet',
          enableCardPayments: true,
          contactlessPayments: true,
          tipsEnabled: true,
          tipPercentages: '5,10,15',
          printSlip: true,
          autoReconciliation: true
        }
      });
    }
  };

  const openEditTerminal = (terminal: ApiTerminalType) => {
    setEditingTerminal(terminal);
    const metadata = terminal.metadate || {};
    setTerminalForm({
      point_retail_id: terminal.point_retail_id,
      name: terminal.name,
      ip_address: terminal.ip_address,
      port: terminal.port,
      is_activ: terminal.is_activ,
      metadate: {
        terminalProvider: metadata.terminalProvider || 'sberbank',
        terminalModel: metadata.terminalModel || 'ingenico_move5000',
        terminalId: metadata.terminalId || '',
        merchantId: metadata.merchantId || '',
        terminalApiKey: metadata.terminalApiKey || '',
        connectionType: metadata.connectionType || 'ethernet',
        enableCardPayments: metadata.enableCardPayments ?? true,
        contactlessPayments: metadata.contactlessPayments ?? true,
        tipsEnabled: metadata.tipsEnabled ?? true,
        tipPercentages: metadata.tipPercentages || '5,10,15',
        printSlip: metadata.printSlip ?? true,
        autoReconciliation: metadata.autoReconciliation ?? true
      }
    });
    setIsTerminalChanged(false);
  };

  const getTerminalStatus = (terminal: ApiTerminalType) => {
    return terminal.is_activ ? 'Активен' : 'Неактивен';
  };

  const handleSaveTerminal = async () => {
    try {
      if (editingTerminal) {
        await handleEditTerminal();
      } else {
        await handleAddTerminal();
      }
      setIsTerminalChanged(false);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Не удалось сохранить настройки');
    }
  };

  const handleTestTerminalConnection = async () => {
    try {
      alert('Тестирование подключения терминала...');
    } catch (error) {
      console.error('Ошибка тестирования подключения терминала:', error);
      alert('Ошибка при тестировании подключения терминала');
    }
  };

  // Функции для работы с ЕГАИС
  const createEgais = async (data: EgaisFormData): Promise<ApiEgaisType> => {
    const {
      egaisUrl, egaisLogin, egaisPassword, fsrarId, egaisOrgType,
      enableIntegration, autoSendTtn, checkBalance, recordSales, syncInterval,
      ...mainData
    } = data;

    const dataToSend = {
      ...mainData,
      point_retail_id: getCurrentPointRetailId(),
      metadate: {
        egaisUrl,
        egaisLogin,
        egaisPassword,
        fsrarId,
        egaisOrgType,
        enableIntegration,
        autoSendTtn,
        checkBalance,
        recordSales,
        syncInterval
      }
    };

    const response = await fetch('/settings-egais/', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dataToSend)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Ошибка создания настроек ЕГАИС');
    }
    return response.json();
  };

  const updateEgais = async (id: number, data: EgaisFormData): Promise<ApiEgaisType> => {
    const {
      egaisUrl, egaisLogin, egaisPassword, fsrarId, egaisOrgType,
      enableIntegration, autoSendTtn, checkBalance, recordSales, syncInterval,
      ...mainData
    } = data;

    const dataToSend = {
      ...mainData,
      point_retail_id: getCurrentPointRetailId(),
      metadate: {
        egaisUrl,
        egaisLogin,
        egaisPassword,
        fsrarId,
        egaisOrgType,
        enableIntegration,
        autoSendTtn,
        checkBalance,
        recordSales,
        syncInterval
      }
    };

    const response = await fetch(`/settings-egais/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dataToSend)
    });
    if (!response.ok) throw new Error('Ошибка обновления настроек ЕГАИС');
    return response.json();
  };

  const fetchEgaisSettings = async (pointRetailId?: number): Promise<ApiEgaisType[]> => {
    const pointId = pointRetailId || getCurrentPointRetailId();
    const response = await fetch(`/settings-egais/?skip=0&limit=100&point_retail_id=${pointId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Ошибка загрузки настроек ЕГАИС');
    return response.json();
  };

  const loadEgaisSettings = async () => {
    try {
      const egaisData = await fetchEgaisSettings();
      if (egaisData.length > 0) {
        const settings = egaisData[0];
        setEgaisSettings(settings);

        const metadata = settings.metadate || {};

        setEgaisForm({
          point_retail_id: settings.point_retail_id,
          name: settings.name,
          ip_address: settings.ip_address,
          port: settings.port,
          is_activ: settings.is_activ,
          metadate: {
            egaisUrl: metadata.egaisUrl || 'https://egais.server.ru',
            egaisLogin: metadata.egaisLogin || '',
            egaisPassword: metadata.egaisPassword || '',
            fsrarId: metadata.fsrarId || '',
            egaisOrgType: metadata.egaisOrgType || 'retail',
            enableIntegration: metadata.enableIntegration ?? true,
            autoSendTtn: metadata.autoSendTtn ?? true,
            checkBalance: metadata.checkBalance ?? true,
            recordSales: metadata.recordSales ?? true,
            syncInterval: metadata.syncInterval || '30'
          }
        });
      } else {
        updateFormsPointRetailId();
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек ЕГАИС:', error);
    }
  };

  const handleEgaisChange = (field: string, value: any) => {
    if (field === 'metadate') {
      setEgaisForm(prev => ({
        ...prev,
        metadate: { ...prev.metadate, ...value }
      }));
    } else {
      setEgaisForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setIsEgaisChanged(true);
  };

  const handleAddEgais = async () => {
    try {
      if (!egaisForm.name.trim()) {
        alert('Заполните обязательное поле: название');
        return;
      }

      let nameToUse = egaisForm.name;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const newEgais = await createEgais({ ...egaisForm, name: nameToUse });
          const updatedEgaisList = await fetchAllEgaisSettings();
          setEgaisList(updatedEgaisList);
          resetEgaisForm();
          alert('Настройки ЕГАИС успешно созданы!');
          return;
        } catch (error: any) {
          console.error('Ошибка создания:', error);

          if ((error.message.includes('duplicate key') ||
                  error.message.includes('UniqueViolationError') ||
                  error.message.includes('already exists')) &&
              retryCount < maxRetries - 1) {

            const existingSettings = await fetchAllEgaisSettings();
            const existingNames = existingSettings
                .filter(s => s.point_retail_id === getCurrentPointRetailId())
                .map(s => s.name);

            let suggestedName = `Настройки ЕГАИС ${existingNames.length + 1}`;
            let counter = 1;

            while (existingNames.includes(suggestedName)) {
              suggestedName = `Настройки ЕГАИС ${existingNames.length + 1 + counter}`;
              counter++;
            }

            const newName = prompt(
                `Настройки с названием "${nameToUse}" уже существуют.\n` +
                `Введите новое уникальное название:`,
                suggestedName
            );

            if (newName) {
              nameToUse = newName;
              retryCount++;
              setEgaisForm(prev => ({ ...prev, name: newName }));
            } else {
              alert('Создание отменено');
              return;
            }
          } else {
            alert(`Не удалось создать настройки ЕГАИС: ${error.message}`);
            return;
          }
        }
      }

      alert('Превышено количество попыток. Попробуйте позже.');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось создать настройки ЕГАИС');
    }
  };

  const handleEditEgais = async () => {
    if (!editingEgais) return;

    try {
      const updatedEgais = await updateEgais(editingEgais.id, egaisForm);
      const updatedEgaisList = await fetchAllEgaisSettings();
      setEgaisList(updatedEgaisList);
      setEditingEgais(null);
      resetEgaisForm();
      alert('Настройки ЕГАИС успешно обновлены!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось обновить настройки ЕГАИС');
    }
  };

  const handleDeleteEgais = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эти настройки ЕГАИС?')) return;

    try {
      const response = await fetch(`/settings-egais/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Ошибка удаления настроек ЕГАИС');

      const updatedEgaisList = await fetchAllEgaisSettings();
      setEgaisList(updatedEgaisList);

      alert('Настройки ЕГАИС успешно удалены!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось удалить настройки ЕГАИС');
    }
  };

  const resetEgaisForm = async () => {
    try {
      const existingSettings = await fetchAllEgaisSettings();
      const existingNames = existingSettings
          .filter(s => s.point_retail_id === getCurrentPointRetailId())
          .map(s => s.name);

      let defaultName = 'Настройки ЕГАИС';
      let counter = 1;

      while (existingNames.includes(defaultName)) {
        defaultName = `Настройки ЕГАИС ${counter}`;
        counter++;
      }

      setEgaisForm({
        point_retail_id: getCurrentPointRetailId(),
        name: defaultName,
        ip_address: '',
        port: '8080',
        is_activ: true,
        metadate: {
          egaisUrl: 'https://egais.server.ru',
          egaisLogin: '',
          egaisPassword: '',
          fsrarId: '',
          egaisOrgType: 'retail',
          enableIntegration: true,
          autoSendTtn: true,
          checkBalance: true,
          recordSales: true,
          syncInterval: '30'
        }
      });
      setEditingEgais(null);
      setIsEgaisChanged(false);
    } catch (error) {
      console.error('Ошибка при сбросе формы ЕГАИС:', error);
      setEgaisForm({
        point_retail_id: getCurrentPointRetailId(),
        name: 'Настройки ЕГАИС',
        ip_address: '',
        port: '8080',
        is_activ: true,
        metadate: {
          egaisUrl: 'https://egais.server.ru',
          egaisLogin: '',
          egaisPassword: '',
          fsrarId: '',
          egaisOrgType: 'retail',
          enableIntegration: true,
          autoSendTtn: true,
          checkBalance: true,
          recordSales: true,
          syncInterval: '30'
        }
      });
    }
  };

  const openEditEgais = (egais: ApiEgaisType) => {
    setEditingEgais(egais);
    setEgaisForm({
      point_retail_id: egais.point_retail_id || getCurrentPointRetailId(),
      name: egais.name,
      ip_address: egais.ip_address,
      port: egais.port,
      is_activ: egais.is_activ,
      metadate: {
        egaisUrl: egais.metadate?.egaisUrl || 'https://egais.server.ru',
        egaisLogin: egais.metadate?.egaisLogin || '',
        egaisPassword: egais.metadate?.egaisPassword || '',
        fsrarId: egais.metadate?.fsrarId || '',
        egaisOrgType: egais.metadate?.egaisOrgType || 'retail',
        enableIntegration: egais.metadate?.enableIntegration ?? true,
        autoSendTtn: egais.metadate?.autoSendTtn ?? true,
        checkBalance: egais.metadate?.checkBalance ?? true,
        recordSales: egais.metadate?.recordSales ?? true,
        syncInterval: egais.metadate?.syncInterval || '30'
      }
    });
    setIsEgaisChanged(false);
  };

  const getEgaisStatus = (egais: ApiEgaisType) => {
    return egais.is_activ ? 'Активен' : 'Неактивен';
  };

  const loadEgaisList = async () => {
    try {
      const egaisData = await fetchAllEgaisSettings();
      setEgaisList(egaisData);
    } catch (error) {
      console.error('Ошибка загрузки настроек ЕГАИС:', error);
    }
  };

  const handleSaveEgais = async () => {
    try {
      if (editingEgais) {
        await handleEditEgais();
      } else {
        await handleAddEgais();
      }
      setIsEgaisChanged(false);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Не удалось сохранить настройки');
    }
  };

  const handleTestConnection = async () => {
    try {
      alert('Тестирование подключения к ЕГАИС...');
    } catch (error) {
      console.error('Ошибка тестирования подключения:', error);
      alert('Ошибка при тестировании подключения');
    }
  };

  // Функции для работы с чеками
  const [receiptForm, setReceiptForm] = useState({
    point_retail_id: 0,
    name: 'Основные настройки чеков',
    type: 'receipt',
    vat: '0',
    is_activ: true,
    metadate: {
      receiptFormat: 'thermal_80',
      receiptCopies: 1,
      receiptTitle: '',
      receiptFooter: '',
      receiptPhone: '',
      receiptWebsite: '',
      showQrCode: true,
      autoPrintReceipt: true,
      printPrecheck: true,
      showDiscounts: true,
      showWaiter: true,
      emailReceipts: false
    }
  });
  const [isReceiptChanged, setIsReceiptChanged] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<any>(null);

  const handleReceiptChange = (field: string, value: any) => {
    if (field === 'metadate') {
      setReceiptForm(prev => ({
        ...prev,
        metadate: { ...prev.metadate, ...value }
      }));
    } else {
      setReceiptForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setIsReceiptChanged(true);
  };

  const fetchPrecheckSettings = async (pointRetailId?: number): Promise<ApiPrecheck[]> => {
    const pointId = pointRetailId || getCurrentPointRetailId();
    const response = await fetch(`/settings-check/?skip=0&limit=100&point_retail_id=${pointId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Ошибка загрузки настроек чеков');
    return response.json();
  };

  const createPrecheck = async (data: PrecheckFormData): Promise<ApiPrecheck> => {
    const {
      receiptFormat, receiptCopies, receiptTitle, receiptFooter, receiptPhone, receiptWebsite,
      showQrCode, autoPrintReceipt, printPrecheck, showDiscounts, showWaiter, emailReceipts,
      ...mainData
    } = data;

    const dataToSend = {
      ...mainData,
      point_retail_id: getCurrentPointRetailId(),
      metadate: {
        receiptFormat,
        receiptCopies,
        receiptTitle,
        receiptFooter,
        receiptPhone,
        receiptWebsite,
        showQrCode,
        autoPrintReceipt,
        printPrecheck,
        showDiscounts,
        showWaiter,
        emailReceipts
      }
    };

    const response = await fetch('/settings-check/', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dataToSend)
    });
    if (!response.ok) throw new Error('Ошибка создания настроек чеков');
    return response.json();
  };

  const updatePrecheck = async (id: number, data: PrecheckFormData): Promise<ApiPrecheck> => {
    const {
      receiptFormat, receiptCopies, receiptTitle, receiptFooter, receiptPhone, receiptWebsite,
      showQrCode, autoPrintReceipt, printPrecheck, showDiscounts, showWaiter, emailReceipts,
      ...mainData
    } = data;

    const dataToSend = {
      ...mainData,
      point_retail_id: getCurrentPointRetailId(),
      metadate: {
        receiptFormat,
        receiptCopies,
        receiptTitle,
        receiptFooter,
        receiptPhone,
        receiptWebsite,
        showQrCode,
        autoPrintReceipt,
        printPrecheck,
        showDiscounts,
        showWaiter,
        emailReceipts
      }
    };

    const response = await fetch(`/settings-check/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dataToSend)
    });
    if (!response.ok) throw new Error('Ошибка обновления настроек чеков');
    return response.json();
  };

  const loadPrecheckSettings = async () => {
    try {
      const precheckData = await fetchPrecheckSettings();
      if (precheckData.length > 0) {
        const settings = precheckData[0];
        setPrecheckSettings(settings);

        const metadata = settings.metadate || {};

        setPrecheckForm({
          point_retail_id: settings.point_retail_id,
          name: settings.name,
          type: settings.type,
          vat: settings.vat,
          is_activ: settings.is_activ,
          receiptFormat: metadata.receiptFormat || 'thermal_80',
          receiptCopies: metadata.receiptCopies || 1,
          receiptTitle: metadata.receiptTitle || '',
          receiptFooter: metadata.receiptFooter || '',
          receiptPhone: metadata.receiptPhone || '',
          receiptWebsite: metadata.receiptWebsite || '',
          showQrCode: metadata.showQrCode ?? true,
          autoPrintReceipt: metadata.autoPrintReceipt ?? true,
          printPrecheck: metadata.printPrecheck ?? true,
          showDiscounts: metadata.showDiscounts ?? true,
          showWaiter: metadata.showWaiter ?? true,
          emailReceipts: metadata.emailReceipts ?? false
        });
      } else {
        updateFormsPointRetailId();
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек чеков:', error);
    }
  };

  const handlePrecheckChange = (field: keyof PrecheckFormData, value: any) => {
    setPrecheckForm(prev => ({
      ...prev,
      [field]: value
    }));
    setIsPrecheckChanged(true);
  };


  const handleAddReceipt = async () => {
    try {
      if (!receiptForm.name.trim() || !receiptForm.type.trim()) {
        alert('Заполните обязательные поля: название и тип');
        return;
      }

      const newReceipt = await createPrecheck({
        point_retail_id: getCurrentPointRetailId(),
        name: receiptForm.name,
        type: receiptForm.type,
        vat: receiptForm.vat,
        is_activ: receiptForm.is_activ,
        receiptFormat: receiptForm.metadate.receiptFormat,
        receiptCopies: receiptForm.metadate.receiptCopies,
        receiptTitle: receiptForm.metadate.receiptTitle,
        receiptFooter: receiptForm.metadate.receiptFooter,
        receiptPhone: receiptForm.metadate.receiptPhone,
        receiptWebsite: receiptForm.metadate.receiptWebsite,
        showQrCode: receiptForm.metadate.showQrCode,
        autoPrintReceipt: receiptForm.metadate.autoPrintReceipt,
        printPrecheck: receiptForm.metadate.printPrecheck,
        showDiscounts: receiptForm.metadate.showDiscounts,
        showWaiter: receiptForm.metadate.showWaiter,
        emailReceipts: receiptForm.metadate.emailReceipts
      });

      const updatedCheck = await fetchPrecheckSettings();
      setCheck(updatedCheck);

      resetReceiptForm();
      alert('Настройки чеков успешно созданы!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось создать настройки чеков');
    }
  };

  const handleEditReceipt = async () => {
    if (!editingReceipt) return;

    try {
      const updatedReceipt = await updatePrecheck(editingReceipt.id, {
        point_retail_id: getCurrentPointRetailId(),
        name: receiptForm.name,
        type: receiptForm.type,
        vat: receiptForm.vat,
        is_activ: receiptForm.is_activ,
        receiptFormat: receiptForm.metadate.receiptFormat,
        receiptCopies: receiptForm.metadate.receiptCopies,
        receiptTitle: receiptForm.metadate.receiptTitle,
        receiptFooter: receiptForm.metadate.receiptFooter,
        receiptPhone: receiptForm.metadate.receiptPhone,
        receiptWebsite: receiptForm.metadate.receiptWebsite,
        showQrCode: receiptForm.metadate.showQrCode,
        autoPrintReceipt: receiptForm.metadate.autoPrintReceipt,
        printPrecheck: receiptForm.metadate.printPrecheck,
        showDiscounts: receiptForm.metadate.showDiscounts,
        showWaiter: receiptForm.metadate.showWaiter,
        emailReceipts: receiptForm.metadate.emailReceipts
      });

      const updatedCheck = await fetchPrecheckSettings();
      setCheck(updatedCheck);

      setEditingReceipt(null);
      resetReceiptForm();
      alert('Настройки чеков успешно обновлены!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось обновить настройки чеков');
    }
  };

  const handleDeleteReceipt = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эти настройки чеков?')) return;

    try {
      const response = await fetch(`/settings-check/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Ошибка удаления настроек чеков');

      const updatedCheck = await fetchPrecheckSettings();
      setCheck(updatedCheck);

      alert('Настройки чеков успешно удалены!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось удалить настройки чеков');
    }
  };

  const resetReceiptForm = () => {
    setReceiptForm({
      point_retail_id: getCurrentPointRetailId(),
      name: 'Основные настройки чеков',
      type: 'receipt',
      vat: '0',
      is_activ: true,
      metadate: {
        receiptFormat: 'thermal_80',
        receiptCopies: 1,
        receiptTitle: '',
        receiptFooter: '',
        receiptPhone: '',
        receiptWebsite: '',
        showQrCode: true,
        autoPrintReceipt: true,
        printPrecheck: true,
        showDiscounts: true,
        showWaiter: true,
        emailReceipts: false
      }
    });
    setEditingReceipt(null);
    setIsReceiptChanged(false);
  };

  const openEditReceipt = (receipt: any) => {
    setEditingReceipt(receipt);
    setReceiptForm({
      point_retail_id: receipt.point_retail_id || getCurrentPointRetailId(),
      name: receipt.name,
      type: receipt.type,
      vat: receipt.vat,
      is_activ: receipt.is_activ,
      metadate: {
        receiptFormat: receipt.metadate?.receiptFormat || 'thermal_80',
        receiptCopies: receipt.metadate?.receiptCopies || 1,
        receiptTitle: receipt.metadate?.receiptTitle || '',
        receiptFooter: receipt.metadate?.receiptFooter || '',
        receiptPhone: receipt.metadate?.receiptPhone || '',
        receiptWebsite: receipt.metadate?.receiptWebsite || '',
        showQrCode: receipt.metadate?.showQrCode ?? true,
        autoPrintReceipt: receipt.metadate?.autoPrintReceipt ?? true,
        printPrecheck: receipt.metadate?.printPrecheck ?? true,
        showDiscounts: receipt.metadate?.showDiscounts ?? true,
        showWaiter: receipt.metadate?.showWaiter ?? true,
        emailReceipts: receipt.metadate?.emailReceipts ?? false
      }
    });
    setIsReceiptChanged(false);
  };

  const getReceiptStatus = (receipt: any) => {
    return receipt.is_activ ? 'Активен' : 'Неактивен';
  };

  const loadReceipts = async () => {
    try {
      const receiptsData = await fetchPrecheckSettings();
      setCheck(receiptsData);
    } catch (error) {
      console.error('Ошибка загрузки настроек чеков:', error);
      alert('Не удалось загрузить настройки чеков');
    }
  };

  const handleSaveReceipt = async () => {
    try {
      if (editingReceipt) {
        await handleEditReceipt();
      } else {
        await handleAddReceipt();
      }
      setIsReceiptChanged(false);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Не удалось сохранить настройки');
    }
  };

  // Функции для работы с принтерами
  const fetchPrinters = async (pointRetailId?: number): Promise<ApiPrinter[]> => {
    const pointId = pointRetailId || getCurrentPointRetailId();
    const response = await fetch(`/kitchen-printers/?skip=0&limit=100&point_retail_id=${pointId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Ошибка загрузки принтеров');
    return response.json();
  };

  const createPrinter = async (data: PrinterFormData): Promise<ApiPrinter> => {
    const { autoPrint, soundSignal, printCookingTime, paperWidth, copies, ...mainData } = data;
    const dataToSend = {
      ...mainData,
      point_retail_id: getCurrentPointRetailId(),
      metadate: {
        autoPrint,
        soundSignal,
        printCookingTime,
        paperWidth,
        copies
      }
    };
    const response = await fetch('/kitchen-printers/', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dataToSend)
    });
    if (!response.ok) throw new Error('Ошибка создания принтера');
    return response.json();
  };

  const updatePrinter = async (id: number, data: PrinterFormData): Promise<ApiPrinter> => {
    const { autoPrint, soundSignal, printCookingTime, paperWidth, copies, ...mainData } = data;

    const dataToSend = {
      ...mainData,
      point_retail_id: getCurrentPointRetailId(),
      metadate: {
        autoPrint,
        soundSignal,
        printCookingTime,
        paperWidth,
        copies
      }
    };

    const response = await fetch(`/kitchen-printers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dataToSend)
    });
    if (!response.ok) throw new Error('Ошибка обновления принтера');
    return response.json();
  };

  const deletePrinter = async (id: number): Promise<void> => {
    const response = await fetch(`/kitchen-printers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Ошибка удаления принтера');
  };

  const loadPrinters = async () => {
    try {
      const printersData = await fetchPrinters();
      setPrinters(printersData);
    } catch (error) {
      console.error('Ошибка загрузки принтеров:', error);
      alert('Не удалось загрузить данные принтеров');
    }
  };

  const handleAddPrinter = async () => {
    try {
      if (!printerForm.name.trim() || !printerForm.ip_address.trim()) {
        alert('Заполните обязательные поля: название и IP-адрес');
        return;
      }

      const newPrinter = await createPrinter(printerForm);
      setPrinters(prev => [...prev, newPrinter]);
      resetPrinterForm();
      alert('Принтер успешно создан!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось создать принтер');
    }
  };

  const handleEditPrinter = async () => {
    if (!editingPrinter) return;

    try {
      const updatedPrinter = await updatePrinter(editingPrinter.id, printerForm);
      setPrinters(prev => prev.map(p => p.id === editingPrinter.id ? updatedPrinter : p));
      setEditingPrinter(null);
      resetPrinterForm();
      alert('Принтер успешно обновлен!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось обновить принтер');
    }
  };

  const handleDeletePrinter = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот принтер?')) return;

    try {
      await deletePrinter(id);
      setPrinters(prev => prev.filter(p => p.id !== id));
      alert('Принтер успешно удален!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось удалить принтер');
    }
  };

  const resetPrinterForm = () => {
    setPrinterForm({
      point_retail_id: getCurrentPointRetailId(),
      name: '',
      ip_address: '',
      port: '9100',
      kitchen_name: '',
      is_activ: true,
      autoPrint: true,
      soundSignal: true,
      printCookingTime: true,
      paperWidth: '80mm',
      copies: 1
    });
    setEditingPrinter(null);
  };

  const openEditPrinter = (printer: ApiPrinter) => {
    setEditingPrinter(printer);
    const metadata = printer.metadate || {};
    setPrinterForm({
      point_retail_id: printer.point_retail_id,
      name: printer.name,
      ip_address: printer.ip_address,
      port: printer.port,
      kitchen_name: printer.kitchen_name,
      is_activ: printer.is_activ,
      autoPrint: metadata.autoPrint ?? true,
      soundSignal: metadata.soundSignal ?? true,
      printCookingTime: metadata.printCookingTime ?? true,
      paperWidth: metadata.paperWidth || '80mm',
      copies: metadata.copies || 1
    });
  };

  const getPrinterStatus = (printer: ApiPrinter) => {
    return printer.is_activ ? 'online' : 'offline';
  };

  const getPrinterType = (printer: ApiPrinter) => {
    const kitchenName = printer.kitchen_name.toLowerCase();
    if (kitchenName.includes('бар')) return 'bar';
    if (kitchenName.includes('десерт') || kitchenName.includes('кондит')) return 'dessert';
    if (kitchenName.includes('чек')) return 'receipt';
    return 'kitchen';
  };

  const getPrinterLocation = (printer: ApiPrinter) => {
    return printer.kitchen_name || 'Не указано';
  };

  // Функции для работы с организацией
  const fetchOrganization = async (): Promise<Organization[]> => {
    const response = await fetch('/organizations/?skip=0&limit=100', {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Ошибка загрузки данных организации');
    return response.json();
  };

  const updateOrganization = async (id: number, data: any): Promise<Organization> => {
    const response = await fetch(`/organizations/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Ошибка обновления данных организации');
    return response.json();
  };

  const loadOrganizationData = async () => {
    try {
      const orgData = await fetchOrganization();
      if (orgData.length > 0) {
        const org = orgData[0];
        setOrganization(org);

        const metadata = org.metadate || {};

        setOrganizationForm({
          Full_name: org.Full_name || '',
          inn: org.inn || '',
          kpp: org.kpp || '',
          ogrn: org.ogrn || '',
          legal_address: org.legal_address || '',
          actual_address: org.actual_address || '',
          phone: org.phone || '',
          email: org.email || '',
          website: org.website || '',
          nds: org.nds || -1,
          companyType: metadata.companyType || '',
          okpo: metadata.okpo || '',
          directorName: metadata.directorName || '',
          directorPosition: metadata.directorPosition || '',
          bankName: metadata.bankName || '',
          bik: metadata.bik || '',
          accountNumber: metadata.accountNumber || '',
          corrAccount: metadata.corrAccount || ''
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки данных организации:', error);
      alert('Не удалось загрузить данные организации');
    }
  };

  const handleOrganizationChange = (field: string, value: string) => {
    setOrganizationForm(prev => ({
      ...prev,
      [field]: value
    }));
    setIsOrganizationChanged(true);
  };

  const handleSaveOrganization = async () => {
    if (!organization) return;

    try {
      const dataToSend = {
        Full_name: organizationForm.Full_name,
        inn: organizationForm.inn,
        kpp: organizationForm.kpp,
        ogrn: organizationForm.ogrn,
        legal_address: organizationForm.legal_address,
        actual_address: organizationForm.actual_address,
        phone: organizationForm.phone,
        email: organizationForm.email,
        website: organizationForm.website,
        nds: organizationForm.nds,
        metadate: {
          companyType: organizationForm.companyType,
          okpo: organizationForm.okpo,
          directorName: organizationForm.directorName,
          directorPosition: organizationForm.directorPosition,
          bankName: organizationForm.bankName,
          bik: organizationForm.bik,
          accountNumber: organizationForm.accountNumber,
          corrAccount: organizationForm.corrAccount
        }
      };

      const updatedOrganization = await updateOrganization(organization.id, dataToSend);
      setOrganization(updatedOrganization);
      setIsOrganizationChanged(false);
      alert('Данные организации успешно сохранены!');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Не удалось сохранить данные организации');
    }
  };

  // Функции для работы с точками продаж и складами
  const [pointForm, setPointForm] = useState<PointRetailFormData>({
    name: '',
    address: '',
    type: 'restaurant',
    warehouse_id: null,
    organizations_id: 1
  });

  const [warehouseForm, setWarehouseForm] = useState<WarehouseFormData>({
    name: '',
    address: '',
    type: 'main'
  });

  const fetchPointsRetail = async (): Promise<ApiPointRetail[]> => {
    const response = await fetch('/points-retail/?skip=0&limit=100', {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Ошибка загрузки точек продаж');
    return response.json();
  };

  const fetchWarehouses = async (): Promise<ApiWarehouse[]> => {
    const response = await fetch('/warehouses/?skip=0&limit=100', {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Ошибка загрузки складов');
    return response.json();
  };

  const createPointRetail = async (data: PointRetailFormData): Promise<ApiPointRetail> => {
    const response = await fetch('/points-retail/', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Ошибка создания точки продаж');
    return response.json();
  };

  const updatePointRetail = async (id: number, data: PointRetailFormData): Promise<ApiPointRetail> => {
    const response = await fetch(`/points-retail/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Ошибка обновления точки продаж');
    return response.json();
  };

  const deletePointRetail = async (id: number): Promise<void> => {
    const response = await fetch(`/points-retail/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Ошибка удаления точки продаж');
  };

  const createWarehouse = async (data: WarehouseFormData): Promise<ApiWarehouse> => {
    const response = await fetch('/warehouses/', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Ошибка создания склада');
    return response.json();
  };

  const updateWarehouse = async (id: number, data: WarehouseFormData): Promise<ApiWarehouse> => {
    const response = await fetch(`/warehouses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Ошибка обновления склада');
    return response.json();
  };

  const deleteWarehouse = async (id: number): Promise<void> => {
    const response = await fetch(`/warehouses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Ошибка удаления склада');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [pointsData, warehousesData] = await Promise.all([
        fetchPointsRetail(),
        fetchWarehouses()
      ]);
      setPointsRetail(pointsData);
      setWarehouses(warehousesData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      alert('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPoint = async () => {
    try {
      if (!pointForm.name.trim()) {
        alert('Введите название точки продаж');
        return;
      }

      const newPoint = await createPointRetail(pointForm);
      setPointsRetail(prev => [...prev, newPoint]);
      setShowAddPoint(false);
      resetPointForm();
      alert('Точка продаж успешно создана!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось создать точку продаж');
    }
  };

  const handleEditPoint = async () => {
    if (!editingPoint) return;

    try {
      const updatedPoint = await updatePointRetail(editingPoint.id, pointForm);
      setPointsRetail(prev => prev.map(p => p.id === editingPoint.id ? updatedPoint : p));
      setEditingPoint(null);
      resetPointForm();
      alert('Точка продаж успешно обновлена!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось обновить точку продаж');
    }
  };

  const handleDeletePoint = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту точку продаж?')) return;

    try {
      await deletePointRetail(id);
      setPointsRetail(prev => prev.filter(p => p.id !== id));
      alert('Точка продаж успешно удалена!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось удалить точку продаж');
    }
  };

  const resetPointForm = () => {
    setPointForm({
      name: '',
      address: '',
      type: 'restaurant',
      warehouse_id: null,
      organizations_id: 1
    });
  };

  const openEditPoint = (point: ApiPointRetail) => {
    setEditingPoint(point);
    setPointForm({
      name: point.name,
      address: point.address,
      type: point.type,
      warehouse_id: point.warehouse_id,
      organizations_id: point.organizations_id
    });
    setShowAddPoint(true);
  };

  const handleAddWarehouse = async () => {
    try {
      if (!warehouseForm.name.trim()) {
        alert('Введите название склада');
        return;
      }

      const newWarehouse = await createWarehouse(warehouseForm);
      setWarehouses(prev => [...prev, newWarehouse]);
      setShowAddWarehouse(false);
      resetWarehouseForm();
      alert('Склад успешно создан!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось создать склад');
    }
  };

  const handleEditWarehouse = async () => {
    if (!editingWarehouse) return;

    try {
      const updatedWarehouse = await updateWarehouse(editingWarehouse.id, warehouseForm);
      setWarehouses(prev => prev.map(w => w.id === editingWarehouse.id ? updatedWarehouse : w));
      setEditingWarehouse(null);
      resetWarehouseForm();
      alert('Склад успешно обновлен!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось обновить склад');
    }
  };

  const handleDeleteWarehouse = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот склад?')) return;

    try {
      await deleteWarehouse(id);
      setWarehouses(prev => prev.filter(w => w.id !== id));
      alert('Склад успешно удален!');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось удалить склад');
    }
  };

  const resetWarehouseForm = () => {
    setWarehouseForm({
      name: '',
      address: '',
      type: 'main'
    });
  };

  const openEditWarehouse = (warehouse: ApiWarehouse) => {
    setEditingWarehouse(warehouse);
    setWarehouseForm({
      name: warehouse.name,
      address: warehouse.address,
      type: warehouse.type
    });
    setShowAddWarehouse(true);
  };

  // Функция для переключения между точками продаж
  const handleSalesPointChange = (point: ApiPointRetail) => {
    setSelectedSalesPoint(point);
    localStorage.setItem('selectedSalesPoint', JSON.stringify(point));

    // Перезагружаем все настройки для выбранной точки
    loadPrecheckSettings();
    loadEgaisSettings();
    loadMarkingSettings();
    loadPrinters();

    // Обновляем point_retail_id во всех формах
    updateFormsPointRetailId();

    alert(`Точка продаж "${point.name}" выбрана! Все настройки загружены для этой точки.`);
  };

  // Загрузка всех данных при монтировании компонента
  useEffect(() => {
    const savedSalesPoint = localStorage.getItem('selectedSalesPoint');
    if (savedSalesPoint) {
      try {
        const parsedPoint = JSON.parse(savedSalesPoint);
        setSelectedSalesPoint(parsedPoint);
      } catch (error) {
        console.error('Ошибка парсинга selectedSalesPoint:', error);
      }
    }

    loadPrinters();
    loadOrganizationData();
    loadData();
    loadReceipts();
    loadEgaisList();
    loadMarkingList();
    loadTerminalList();
  }, []);

  useEffect(() => {
    if (pointsRetail.length > 0) {
      updateFormsPointRetailId();
      loadPrecheckSettings();
      loadEgaisSettings();
      loadMarkingSettings();
      loadPrinters();
    }
  }, [pointsRetail, selectedSalesPoint]);

  return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-white">
          <Settings className="h-5 w-5" />
          <h2>Сервис & Настройки</h2>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="flex w-full flex-wrap">
            <TabsTrigger value="general" className="flex-1 min-w-[100px]">Общие</TabsTrigger>
            <TabsTrigger value="cashiers" className="flex-1 min-w-[100px]">Кассы</TabsTrigger>
            <TabsTrigger value="kitchen_printers" className="flex-1 min-w-[100px]">Кух. принтеры</TabsTrigger>
            <TabsTrigger value="receipts" className="flex-1 min-w-[100px]">Чеки</TabsTrigger>
            <TabsTrigger value="egais" className="flex-1 min-w-[100px]">ЕГАИС</TabsTrigger>
            <TabsTrigger value="marking" className="flex-1 min-w-[100px]">Маркировка</TabsTrigger>
            <TabsTrigger value="terminal" className="flex-1 min-w-[100px]">Терминал</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 min-w-[100px]">Уведомления</TabsTrigger>
            <TabsTrigger value="security" className="flex-1 min-w-[100px]">Безопасность</TabsTrigger>
            <TabsTrigger value="backup" className="flex-1 min-w-[100px]">Резервирование</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralSetings
                isOrganizationChanged={isOrganizationChanged}
                organizationForm={organizationForm}
                handleOrganizationChange={handleOrganizationChange}
                setEditingWarehouse={setEditingWarehouse}
                resetWarehouseForm={resetWarehouseForm}
                setShowAddWarehouse={setShowAddWarehouse}
                setEditingPoint={setEditingPoint}
                resetPointForm={resetPointForm}
                setShowAddPoint={setShowAddPoint}
                loadOrganizationData={loadOrganizationData}
                loading={loading}
                pointsRetail={pointsRetail}
                selectedSalesPoint={selectedSalesPoint}
                handleSalesPointChange={handleSalesPointChange}
                openEditPoint={openEditPoint}
                handleDeletePoint={handleDeletePoint}
                handleSaveOrganization={handleSaveOrganization}
            />
          </TabsContent>

          <TabsContent value="cashiers">
            <Card    style={{
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-inpyt)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Управление кассами
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">Настройка касс</div>
                      <div className="text-sm text-blue-700">
                        Управление кассовыми аппаратами, ККТ и фискальными накопителями
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cashRegisterName">Название кассы</Label>
                    <Input id="cashRegisterName" placeholder="Касса №1"     style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }}
                    value={cashForm.name}
                           onChange={(e) => setCashForm(prev => ({ ...prev, name: e.currentTarget.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cashRegisterModel">Модель</Label>
                    <Input  id="serialNumber" placeholder="190.10.208"    style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }}
                           value={cashForm.factory_number}
                           onChange={(e) => setCashForm(prev => ({ ...prev, factory_number: e.currentTarget.value }))}
                    />

                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Ip адресс</Label>
                    <Input type='number' id="serialNumber" placeholder="190.10.208"    style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }}
                           value={cashForm.ip_address}
                           onChange={(e) => setCashForm(prev => ({ ...prev, ip_address: e.currentTarget.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fiscalNumber">Порт</Label>
                    <Input type='number' id="fiscalNumber" placeholder="8080"    style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }}
                           value={cashForm.port}
                           onChange={(e) => setCashForm(prev => ({ ...prev, port: e.currentTarget.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regNumber">Активная</Label>
                   <Switch

                   />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">Автоматическое открытие смены</p>
                    <p className="text-sm text-muted-foreground">Открывать смену автоматически в начале рабочего дня</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">Печать Z-отчета при закрытии смены</p>
                    <p className="text-sm text-muted-foreground">Автоматическая печать отчета</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button onClick={hendlerAddCash}
                        className="bg-orange-600 hover:bg-orange-700" >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить кассу
                </Button>

                <Separator />

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Название</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Модель</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>IP адресс</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>port</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Активность</TableHead>
                      <TableHead style={{color:'rgb(101,125,156)'}}>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashRegisters.map((register) => (
                        <TableRow key={register.id}>
                          <TableCell>{register.name}</TableCell>
                          <TableCell>{register.factory_number}</TableCell>
                          <TableCell>{register.ip_address}</TableCell>
                          <TableCell>
                            {register.port}
                          </TableCell>
                          <TableCell>
                           <Switch  checked={register.is_active}  />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Button
                                  variant="ghost"
                                  className="h-4 w-4 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                  variant="ghost"
                                  className="h-4 w-4 p-0 ml-2"
                                  onClick={() => deleteCash(register.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kitchen_printers">
            <KitchenPrinter
                editingPrinter={editingPrinter}
                printerForm={printerForm}
                setPrinterForm={setPrinterForm}
                getPrinterType={getPrinterType}
                handleDeletePrinter={handleDeletePrinter}
                handleEditPrinter={handleEditPrinter}
                handleAddPrinter={handleAddPrinter}
                resetPrinterForm={resetPrinterForm}
                loadPrinters={loadPrinters}
                printers={printers}
                getPrinterLocation={getPrinterLocation}
                getPrinterStatus={getPrinterStatus}
                openEditPrinter={openEditPrinter}
            />
          </TabsContent>

          <TabsContent value="receipts">
            <Receipts
                editingReceipt={editingReceipt}
                receiptForm={receiptForm}
                setReceiptForm={setReceiptForm}
                handleDeleteReceipt={handleDeleteReceipt}
                handleEditReceipt={handleEditReceipt}
                handleAddReceipt={handleAddReceipt}
                resetReceiptForm={resetReceiptForm}
                loadReceipts={loadReceipts}
                receipts={check}
                getReceiptStatus={getReceiptStatus}
                openEditReceipt={openEditReceipt}
                handleReceiptChange={handleReceiptChange}
                isReceiptChanged={isReceiptChanged}
                handleSaveReceipt={handleSaveReceipt}
                check={check}
            />
          </TabsContent>

          <TabsContent value="egais">
            <Egais
                editingEgais={editingEgais}
                egaisForm={egaisForm}
                setEgaisForm={setEgaisForm}
                handleDeleteEgais={handleDeleteEgais}
                handleEditEgais={handleEditEgais}
                handleAddEgais={handleAddEgais}
                resetEgaisForm={resetEgaisForm}
                loadEgais={loadEgaisList}
                egaisList={egaisList}
                getEgaisStatus={getEgaisStatus}
                openEditEgais={openEditEgais}
                handleEgaisChange={handleEgaisChange}
                handleSaveEgais={handleSaveEgais}
                handleTestConnection={handleTestConnection}
                isEgaisChanged={isEgaisChanged}
            />
          </TabsContent>

          <TabsContent value="marking">
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Система маркировки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">Настройка маркировки</div>
                      <div className="text-sm text-blue-700">
                        Интеграция с системой "Честный ЗНАК" для учета маркированных товаров
                      </div>
                    </div>
                  </div>
                </div>

                {/* Форма добавления/редактирования настроек маркировки */}
                <Card style={{
                  borderRadius: '20px',
                  border: 'var(--custom-border-primary)',
                  background: 'var(--custom-bg-secondaryLineCard)',
                  color: 'var(--custom-text)',
                }}
                      className={editingMarking ? "border-2 border-orange-300" : "border-dashed border-2"}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {editingMarking ? 'Редактировать настройки маркировки' : 'Добавить новые настройки маркировки'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="markingName">Название настроек *</Label>
                        <Input
                            id="markingName"
                            placeholder="Настройки маркировки"
                            value={markingForm.name}
                            onChange={(e) => handleMarkingChange('name', e.target.value)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="markingIp">IP-адрес</Label>
                        <Input
                            id="markingIp"
                            placeholder="192.168.1.100"
                            value={markingForm.ip_address}
                            onChange={(e) => handleMarkingChange('ip_address', e.target.value)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="markingPort">Порт</Label>
                        <Input
                            id="markingPort"
                            placeholder="8080"
                            value={markingForm.port}
                            onChange={(e) => handleMarkingChange('port', e.target.value)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="markingStatus">Статус</Label>
                        <Select
                            value={markingForm.is_activ ? 'active' : 'inactive'}
                            onValueChange={(value) => handleMarkingChange('is_activ', value === 'active')}
                        >
                          <SelectTrigger id="markingStatus"   style={{
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-inpyt)',
                            color: 'var(--custom-text)',
                          }} >
                            <SelectValue placeholder="Выберите статус" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Активен</SelectItem>
                            <SelectItem value="inactive">Неактивен</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="markingUrl">URL API Честный ЗНАК</Label>
                        <Input
                            id="markingUrl"
                            placeholder="https://markirovka.crpt.ru"
                            value={markingForm.markingUrl}
                            onChange={(e) => handleMarkingChange('markingUrl', e.target.value)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="markingToken">Токен доступа</Label>
                        <Input
                            id="markingToken"
                            type="password"
                            placeholder="••••••••••••••••"
                            value={markingForm.markingToken}
                            onChange={(e) => handleMarkingChange('markingToken', e.target.value)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="markingInn">ИНН организации</Label>
                        <Input
                            id="markingInn"
                            placeholder="7707123456"
                            value={markingForm.markingInn}
                            onChange={(e) => handleMarkingChange('markingInn', e.target.value)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="markingOgrn">ОГРН</Label>
                        <Input
                            id="markingOgrn"
                            placeholder="1234567890123"
                            value={markingForm.markingOgrn}
                            onChange={(e) => handleMarkingChange('markingOgrn', e.target.value)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productGroups">Группы товаров</Label>
                        <Select
                            value={markingForm.productGroups}
                            onValueChange={handleProductGroupsChange}
                            multiple
                        >
                          <SelectTrigger id="productGroups"    style={{
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-inpyt)',
                            color: 'var(--custom-text)',
                          }}>
                            <SelectValue placeholder="Выберите группы">
                              {markingForm.productGroups.length > 0
                                  ? `${markingForm.productGroups.length} выбрано`
                                  : "Выберите группы"
                              }
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tobacco">Табачная продукция</SelectItem>
                            <SelectItem value="shoes">Обувь</SelectItem>
                            <SelectItem value="perfume">Парфюмерия</SelectItem>
                            <SelectItem value="milk">Молочная продукция</SelectItem>
                            <SelectItem value="water">Питьевая вода</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="scannerType">Тип сканера</Label>
                        <Select
                            value={markingForm.scannerType}
                            onValueChange={(value) => handleMarkingChange('scannerType', value)}
                        >
                          <SelectTrigger id="scannerType"    style={{
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-inpyt)',
                            color: 'var(--custom-text)',
                          }}>
                            <SelectValue placeholder="Выберите тип" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2d">2D сканер</SelectItem>
                            <SelectItem value="camera">Камера</SelectItem>
                            <SelectItem value="mobile">Мобильное приложение</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                          className="bg-orange-600 hover:bg-orange-700"
                          onClick={editingMarking ? handleEditMarking : handleAddMarking}
                          disabled={!markingForm.name.trim()}
                      >
                        {editingMarking ? (
                            <>
                              <Edit className="h-4 w-4 mr-2" />
                              Сохранить изменения
                            </>
                        ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Добавить настройки
                            </>
                        )}
                      </Button>
                      {editingMarking && (
                          <Button
                              variant="outline"
                              onClick={resetMarkingForm}
                          >
                            Отмена
                          </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Separator />

                {/* Дополнительные настройки маркировки */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Параметры работы</h3>
                    {isMarkingChanged && (
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                          Есть несохраненные изменения
                        </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">Включить систему маркировки</p>
                        <p className="text-sm text-muted-foreground">Активировать проверку маркированных товаров</p>
                      </div>
                      <Switch
                          checked={markingForm.enableMarking}
                          onCheckedChange={(checked) => handleMarkingChange('enableMarking', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">Проверка при продаже</p>
                        <p className="text-sm text-muted-foreground">Сканировать DataMatrix коды при оформлении заказа</p>
                      </div>
                      <Switch
                          checked={markingForm.checkOnSale}
                          onCheckedChange={(checked) => handleMarkingChange('checkOnSale', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">Вывод из оборота</p>
                        <p className="text-sm text-muted-foreground">Автоматически выводить товары из оборота</p>
                      </div>
                      <Switch
                          checked={markingForm.withdrawalFromCirculation}
                          onCheckedChange={(checked) => handleMarkingChange('withdrawalFromCirculation', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">Блокировка продажи без кода</p>
                        <p className="text-sm text-muted-foreground">Запрещать продажу товаров без сканирования кода</p>
                      </div>
                      <Switch
                          checked={markingForm.blockSaleWithoutCode}
                          onCheckedChange={(checked) => handleMarkingChange('blockSaleWithoutCode', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">Уведомления об ошибках</p>
                        <p className="text-sm text-muted-foreground">Показывать предупреждения при проблемах с кодами</p>
                      </div>
                      <Switch
                          checked={markingForm.errorNotifications}
                          onCheckedChange={(checked) => handleMarkingChange('errorNotifications', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Список настроек маркировки */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Список настроек маркировки</h3>
                    <Button
                        variant="outline"
                        onClick={loadMarkingList}
                        size="sm"
                    >
                      Обновить список
                    </Button>
                  </div>

                  {markingList.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border rounded-lg">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Настройки маркировки не добавлены</p>
                        <p className="text-sm">Добавьте первые настройки маркировки используя форму выше</p>
                      </div>
                  ) : (
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Название</TableHead>
                              <TableHead>IP-адрес</TableHead>
                              <TableHead>Порт</TableHead>
                              <TableHead>Статус</TableHead>
                              <TableHead>ИНН</TableHead>
                              <TableHead>Тип сканера</TableHead>
                              <TableHead>Действия</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {markingList.map((marking) => (
                                <TableRow key={marking.id} className={editingMarking?.id === marking.id ? 'bg-blue-50' : ''}>
                                  <TableCell className="font-medium">{marking.name}</TableCell>
                                  <TableCell className="font-mono text-sm">{marking.ip_address || '-'}</TableCell>
                                  <TableCell className="font-mono text-sm">{marking.port || '-'}</TableCell>
                                  <TableCell>
                                    <Badge
                                        className={
                                          marking.is_activ
                                              ? 'bg-green-500 hover:bg-green-600'
                                              : 'bg-red-500 hover:bg-red-600'
                                        }
                                    >
                                      {marking.is_activ ? 'Активен' : 'Неактивен'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{marking.metadate?.markingInn || '-'}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {marking.metadate?.scannerType === '2d' ? '2D сканер' :
                                          marking.metadate?.scannerType === 'camera' ? 'Камера' : 'Мобильное'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => openEditMarking(marking)}
                                          className="h-8 w-8 p-0"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteMarking(marking.id)}
                                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={handleSaveMarking}
                      disabled={!isMarkingChanged}
                  >
                    Сохранить все настройки
                  </Button>
                  <Button
                      variant="outline"
                      onClick={loadMarkingSettings}
                      disabled={!isMarkingChanged}
                  >
                    Отменить изменения
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terminal">
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Платежный терминал
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">Настройка терминала</div>
                      <div className="text-sm text-blue-700">
                        Интеграция с POS-терминалами для приема безналичных платежей
                      </div>
                    </div>
                  </div>
                </div>

                {/* Форма добавления/редактирования настроек терминала */}
                <Card style={{
                  borderRadius: '20px',
                  border: 'var(--custom-border-primary)',
                  background: 'var(--custom-bg-secondaryLineCard)',
                  color: 'var(--custom-text)',
                }}
                      className={editingTerminal ? "border-2 border-orange-300" : "border-dashed border-2"}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {editingTerminal ? 'Редактировать настройки терминала' : 'Добавить новые настройки терминала'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="terminalName">Название настроек *</Label>
                        <Input
                            id="terminalName"
                            placeholder="Настройки терминала"
                            value={terminalForm.name}
                            onChange={(e) => handleTerminalChange('name', e.target.value)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="terminalIp">IP-адрес</Label>
                        <Input
                            id="terminalIp"
                            placeholder="192.168.1.100"
                            value={terminalForm.ip_address}
                            onChange={(e) => handleTerminalChange('ip_address', e.target.value)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="terminalPort">Порт</Label>
                        <Input
                            id="terminalPort"
                            placeholder="8080"
                            value={terminalForm.port}
                            onChange={(e) => handleTerminalChange('port', e.target.value)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="terminalStatus">Статус</Label>
                        <Select
                            value={terminalForm.is_activ ? 'active' : 'inactive'}
                            onValueChange={(value) => handleTerminalChange('is_activ', value === 'active')}
                        >
                          <SelectTrigger id="terminalStatus"    style={{
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-inpyt)',
                            color: 'var(--custom-text)',
                          }}>
                            <SelectValue placeholder="Выберите статус" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Активен</SelectItem>
                            <SelectItem value="inactive">Неактивен</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="terminalProvider">Провайдер</Label>
                        <Select
                            value={terminalForm.metadate.terminalProvider}
                            onValueChange={(value) => handleTerminalChange('metadate', { terminalProvider: value })}
                        >
                          <SelectTrigger id="terminalProvider"    style={{
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-inpyt)',
                            color: 'var(--custom-text)',
                          }}>
                            <SelectValue placeholder="Выберите провайдера" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sberbank">Сбербанк</SelectItem>
                            <SelectItem value="tinkoff">Тинькофф</SelectItem>
                            <SelectItem value="alfabank">Альфа-Банк</SelectItem>
                            <SelectItem value="vtb">ВТБ</SelectItem>
                            <SelectItem value="other">Другой</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="terminalModel">Модель терминала</Label>
                        <Select
                            value={terminalForm.metadate.terminalModel}
                            onValueChange={(value) => handleTerminalChange('metadate', { terminalModel: value })}
                        >
                          <SelectTrigger id="terminalModel"    style={{
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-inpyt)',
                            color: 'var(--custom-text)',
                          }}>
                            <SelectValue placeholder="Выберите модель" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ingenico_move5000">Ingenico Move/5000</SelectItem>
                            <SelectItem value="pax_a920">PAX A920</SelectItem>
                            <SelectItem value="verifone_v400">Verifone V400</SelectItem>
                            <SelectItem value="other">Другая модель</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="terminalId">ID терминала</Label>
                        <Input
                            id="terminalId"
                            placeholder="12345678"
                            value={terminalForm.metadate.terminalId}
                            onChange={(e) => handleTerminalChange('metadate', { terminalId: e.target.value })}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="merchantId">Merchant ID</Label>
                        <Input
                            id="merchantId"
                            placeholder="MID123456"
                            value={terminalForm.metadate.merchantId}
                            onChange={(e) => handleTerminalChange('metadate', { merchantId: e.target.value })}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="terminalApiKey">API ключ</Label>
                        <Input
                            id="terminalApiKey"
                            type="password"
                            placeholder="••••••••••••••••"
                            value={terminalForm.metadate.terminalApiKey}
                            onChange={(e) => handleTerminalChange('metadate', { terminalApiKey: e.target.value })}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="connectionType">Тип подключения</Label>
                        <Select
                            value={terminalForm.metadate.connectionType}
                            onValueChange={(value) => handleTerminalChange('metadate', { connectionType: value })}
                        >
                          <SelectTrigger id="connectionType"    style={{
                            border: 'var(--custom-border-primary)',
                            background: 'var(--custom-bg-inpyt)',
                            color: 'var(--custom-text)',
                          }}>
                            <SelectValue placeholder="Выберите тип" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ethernet">Ethernet</SelectItem>
                            <SelectItem value="wifi">Wi-Fi</SelectItem>
                            <SelectItem value="bluetooth">Bluetooth</SelectItem>
                            <SelectItem value="usb">USB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tipPercentages">Варианты чаевых (%)</Label>
                        <Input
                            id="tipPercentages"
                            placeholder="5,10,15"
                            value={terminalForm.metadate.tipPercentages}
                            onChange={(e) => handleTerminalChange('metadate', { tipPercentages: e.target.value })}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                          className="bg-orange-600 hover:bg-orange-700"
                          onClick={editingTerminal ? handleEditTerminal : handleAddTerminal}
                          disabled={!terminalForm.name.trim()}
                      >
                        {editingTerminal ? (
                            <>
                              <Edit className="h-4 w-4 mr-2" />
                              Сохранить изменения
                            </>
                        ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Добавить настройки
                            </>
                        )}
                      </Button>
                      {editingTerminal && (
                          <Button
                              variant="outline"
                              onClick={resetTerminalForm}
                          >
                            Отмена
                          </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Separator />

                {/* Параметры работы терминала */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Параметры платежей</h3>
                    {isTerminalChanged && (
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                          Есть несохраненные изменения
                        </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">Включить прием карт</p>
                        <p className="text-sm text-muted-foreground">Принимать оплату банковскими картами</p>
                      </div>
                      <Switch
                          checked={terminalForm.metadate.enableCardPayments}
                          onCheckedChange={(checked) => handleTerminalChange('metadate', { enableCardPayments: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">Бесконтактные платежи</p>
                        <p className="text-sm text-muted-foreground">PayPass, PayWave, Apple Pay, Google Pay</p>
                      </div>
                      <Switch
                          checked={terminalForm.metadate.contactlessPayments}
                          onCheckedChange={(checked) => handleTerminalChange('metadate', { contactlessPayments: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">Чаевые на терминале</p>
                        <p className="text-sm text-muted-foreground">Позволить гостям оставлять чаевые</p>
                      </div>
                      <Switch
                          checked={terminalForm.metadate.tipsEnabled}
                          onCheckedChange={(checked) => handleTerminalChange('metadate', { tipsEnabled: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">Печать слипа</p>
                        <p className="text-sm text-muted-foreground">Печатать чек терминала автоматически</p>
                      </div>
                      <Switch
                          checked={terminalForm.metadate.printSlip}
                          onCheckedChange={(checked) => handleTerminalChange('metadate', { printSlip: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">Сверка итогов</p>
                        <p className="text-sm text-muted-foreground">Автоматическая сверка в конце смены</p>
                      </div>
                      <Switch
                          checked={terminalForm.metadate.autoReconciliation}
                          onCheckedChange={(checked) => handleTerminalChange('metadate', { autoReconciliation: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Список настроек терминалов */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Список настроек терминалов</h3>
                    <Button
                        variant="outline"
                        onClick={loadTerminalList}
                        size="sm"
                    >
                      Обновить список
                    </Button>
                  </div>

                  {terminalList.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border rounded-lg">
                        <Monitor className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Настройки терминалов не добавлены</p>
                        <p className="text-sm">Добавьте первые настройки терминалов используя форму выше</p>
                      </div>
                  ) : (
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Название</TableHead>
                              <TableHead>IP-адрес</TableHead>
                              <TableHead>Порт</TableHead>
                              <TableHead>Статус</TableHead>
                              <TableHead>Провайдер</TableHead>
                              <TableHead>Модель</TableHead>
                              <TableHead>Действия</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {terminalList.map((terminal) => (
                                <TableRow key={terminal.id} className={editingTerminal?.id === terminal.id ? 'bg-blue-50' : ''}>
                                  <TableCell className="font-medium">{terminal.name}</TableCell>
                                  <TableCell className="font-mono text-sm">{terminal.ip_address || '-'}</TableCell>
                                  <TableCell className="font-mono text-sm">{terminal.port || '-'}</TableCell>
                                  <TableCell>
                                    <Badge
                                        className={
                                          terminal.is_activ
                                              ? 'bg-green-500 hover:bg-green-600'
                                              : 'bg-red-500 hover:bg-red-600'
                                        }
                                    >
                                      {terminal.is_activ ? 'Активен' : 'Неактивен'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {terminal.metadate?.terminalProvider === 'sberbank' ? 'Сбербанк' :
                                          terminal.metadate?.terminalProvider === 'tinkoff' ? 'Тинькофф' :
                                              terminal.metadate?.terminalProvider === 'alfabank' ? 'Альфа-Банк' :
                                                  terminal.metadate?.terminalProvider === 'vtb' ? 'ВТБ' : 'Другой'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {terminal.metadate?.terminalModel === 'ingenico_move5000' ? 'Ingenico' :
                                          terminal.metadate?.terminalModel === 'pax_a920' ? 'PAX A920' :
                                              terminal.metadate?.terminalModel === 'verifone_v400' ? 'Verifone' : 'Другая'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => openEditTerminal(terminal)}
                                          className="h-8 w-8 p-0"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteTerminal(terminal.id)}
                                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={handleSaveTerminal}
                      disabled={!isTerminalChanged}
                  >
                    Сохранить все настройки
                  </Button>
                  <Button
                      variant="outline"
                      onClick={handleTestTerminalConnection}
                  >
                    Тестировать терминал
                  </Button>
                  <Button
                      variant="outline"
                      onClick={resetTerminalForm}
                      disabled={!isTerminalChanged}
                  >
                    Отменить изменения
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Настройка уведомлений
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">Управление уведомлениями</div>
                      <div className="text-sm text-blue-700">
                        Настройте каналы и типы уведомлений для оперативного контроля бизнеса
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Каналы уведомлений</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emailNotif">Email для уведомлений</Label>
                      <Input id="emailNotif" type="email" placeholder="notifications@restaurant.ru" defaultValue="notifications@restaurant.ru"    style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                      }} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smsPhone">Телефон для SMS</Label>
                      <Input id="smsPhone" placeholder="+7 (916) 123-45-67" defaultValue="+7 (916) 123-45-67"    style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                      }} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telegramBot">Telegram Bot Token</Label>
                      <Input id="telegramBot" placeholder="123456:ABC-DEF1234..."    style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                      }} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telegramChat">Telegram Chat ID</Label>
                      <Input id="telegramChat" placeholder="-1001234567890"    style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                      }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Email уведомления</p>
                      <p className="text-sm text-muted-foreground">Получать уведомления на email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Push уведомления</p>
                      <p className="text-sm text-muted-foreground">Браузерные уведомления в реальном времени</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">SMS уведомления</p>
                      <p className="text-sm text-muted-foreground">Отправка критичных уведомлений по SMS</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Telegram уведомления</p>
                      <p className="text-sm text-muted-foreground">Получать уведомления в Telegram</p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Уведомления о заказах</h3>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Новый заказ</p>
                      <p className="text-sm text-muted-foreground">Уведомление при поступлении нового заказа</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Изменение статуса заказа</p>
                      <p className="text-sm text-muted-foreground">При переводе заказа между этапам</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Отмена заказа</p>
                      <p className="text-sm text-muted-foreground">При отмене заказа клиентом или персоналом</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Задержка заказа</p>
                      <p className="text-sm text-muted-foreground">Если время приготовления превышено</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Уведомления о складе</h3>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Критические остатки</p>
                      <p className="text-sm text-muted-foreground">При достижении минимального остатка</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="criticalLevel">Критический уровень остатков (%)</Label>
                    <Input id="criticalLevel" type="number" defaultValue="20" min="0" max="100"    style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }}/>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Истечение срока годности</p>
                      <p className="text-sm text-muted-foreground">За N дней до окончания срока годности</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiryDays">Дней до истечения срока</Label>
                    <Input id="expiryDays" type="number" defaultValue="7" min="1" max="30"     style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }}/>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Поступление товара</p>
                      <p className="text-sm text-muted-foreground">При оформлении прихода на склад</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Списание товара</p>
                      <p className="text-sm text-muted-foreground">При списании товаров со склада</p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Финансовые уведомления</h3>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Крупная транзакция</p>
                      <p className="text-sm text-muted-foreground">Уведомление о транзакциях выше установленной суммы</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="largeTransactionAmount">Сумма крупной транзакции (₽)</Label>
                    <Input id="largeTransactionAmount" type="number" defaultValue="50000" min="0"    style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Ежедневный отчет о выручке</p>
                      <p className="text-sm text-muted-foreground">Сводка по выручке в конце дня</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dailyReportTime">Время отправки отчета</Label>
                    <Input id="dailyReportTime" type="time" defaultValue="23:00"    style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Недельный отчет</p>
                      <p className="text-sm text-muted-foreground">Сводка по результатам недели</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Возврат платежа</p>
                      <p className="text-sm text-muted-foreground">При оформлении возврата средств</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Уведомления о персонале</h3>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Опоздание сотрудника</p>
                      <p className="text-sm text-muted-foreground">При опоздании на смену</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Отсутствие на смене</p>
                      <p className="text-sm text-muted-foreground">Если сотрудник не вышел на работу</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Окончание срока договора</p>
                      <p className="text-sm text-muted-foreground">За N дней до окончания трудового договора</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractExpiryDays">Дней до окончания договора</Label>
                    <Input id="contractExpiryDays" type="number" defaultValue="30" min="1" max="90"    style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">День рождения сотрудника</p>
                      <p className="text-sm text-muted-foreground">Напоминание о днях рождения</p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Уведомления о гостях</h3>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Новая резервация</p>
                      <p className="text-sm text-muted-foreground">При создании бронирования столика</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Отмена резервации</p>
                      <p className="text-sm text-muted-foreground">При отмене бронирования</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Напоминание о резервации</p>
                      <p className="text-sm text-muted-foreground">Напоминание гостю о предстоящем бронировании</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reservationReminderHours">Часов до резервации</Label>
                    <Input id="reservationReminderHours" type="number" defaultValue="3" min="1" max="24"    style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">День рождения гостя</p>
                      <p className="text-sm text-muted-foreground">Уведомление о дне рождения постоянного клиента</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Отзыв клиента</p>
                      <p className="text-sm text-muted-foreground">При получении нового отзыва</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Системные уведомления</h3>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Ошибки системы</p>
                      <p className="text-sm text-muted-foreground">Критические ошибки и сбои</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Обновления системы</p>
                      <p className="text-sm text-muted-foreground">Информация о новых версиях и функциях</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Резервное копирование</p>
                      <p className="text-sm text-muted-foreground">Статус выполнения резервных копий</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Действия безопасности</p>
                      <p className="text-sm text-muted-foreground">Подозрительные входы и действия</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Расписание уведомлений</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quietHoursStart">Не беспокоить с</Label>
                      <Input id="quietHoursStart" type="time" defaultValue="00:00"    style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                      }} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quietHoursEnd">Не беспокоить до</Label>
                      <Input id="quietHoursEnd" type="time" defaultValue="08:00"    style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                      }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Тихий режим в выходные</p>
                      <p className="text-sm text-muted-foreground">Отключить некритичные уведомления в выходные</p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Button className="bg-orange-600 hover:bg-orange-700">
                  Сохранить настройки уведомлений
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Безопасность и пользователи
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">Управление безопасностью</div>
                      <div className="text-sm text-blue-700">
                        Настройте параметры безопасности и управление доступом пользователей
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Параметры аутентификации</h3>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Двухфакторная аутентификация (2FA)</p>
                      <p className="text-sm text-muted-foreground">Дополнительная защита через SMS или приложение</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twoFactorMethod">Метод 2FA</Label>
                    <Select>
                      <SelectTrigger id="twoFactorMethod"    style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                      }}>
                        <SelectValue placeholder="Выберите метод" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sms">SMS-код</SelectItem>
                        <SelectItem value="email">Email-код</SelectItem>
                        <SelectItem value="app">Приложение аутентификатор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Автоматический выход</p>
                      <p className="text-sm text-muted-foreground">Выход при бездействии</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Время бездействия (минут)</Label>
                    <Select>
                      <SelectTrigger id="sessionTimeout "    style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                      }}>
                        <SelectValue placeholder="30 минут" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 минут</SelectItem>
                        <SelectItem value="30">30 минут</SelectItem>
                        <SelectItem value="60">1 час</SelectItem>
                        <SelectItem value="120">2 часа</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Политика паролей</h3>

                  <div className="space-y-2">
                    <Label htmlFor="minPasswordLength">Минимальная длина пароля</Label>
                    <Input id="minPasswordLength" type="number" defaultValue="8" min="6" max="20"    style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }}/>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Требовать заглавные буквы</p>
                      <p className="text-sm text-muted-foreground">Пароль должен содержать A-Z</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Требовать цифры</p>
                      <p className="text-sm text-muted-foreground">Пароль должен содержать 0-9</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Требовать спецсимволы</p>
                      <p className="text-sm text-muted-foreground">Пароль должен содержать !@#$%</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiry">Срок действия пароля (дней)</Label>
                    <Select>
                      <SelectTrigger id="passwordExpiry"    style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                      }}>
                        <SelectValue placeholder="90 дней" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 дней</SelectItem>
                        <SelectItem value="60">60 дней</SelectItem>
                        <SelectItem value="90">90 дней</SelectItem>
                        <SelectItem value="180">180 дней</SelectItem>
                        <SelectItem value="never">Не истекает</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passwordHistory">Запретить повтор паролей</Label>
                    <Input id="passwordHistory" type="number" defaultValue="5" min="0" max="10"    style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }} />
                    <p className="text-sm text-muted-foreground">Количество последних паролей для запрета</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Контроль доступа</h3>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Ограничение по IP-адресам</p>
                      <p className="text-sm text-muted-foreground">Разрешить вход только с указанных IP</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allowedIps">Разрешенные IP-адреса</Label>
                    <Input id="allowedIps" placeholder="192.168.1.1, 192.168.1.100-150"    style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Макс. попыток входа</Label>
                    <Input id="maxLoginAttempts" type="number" defaultValue="5" min="3" max="10"    style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lockoutDuration">Время блокировки после попыток (минут)</Label>
                    <Input id="lockoutDuration" type="number" defaultValue="30" min="5" max="120"    style={{
                      border: 'var(--custom-border-primary)',
                      background: 'var(--custom-bg-inpyt)',
                      color: 'var(--custom-text)',
                    }} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Уведомления о входе</p>
                      <p className="text-sm text-muted-foreground">Отправлять уведомления о новых входах</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Журналирование и аудит</h3>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Журнал аудита</p>
                      <p className="text-sm text-muted-foreground">Ведение логов действий пользователей</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Логирование изменений данных</p>
                      <p className="text-sm text-muted-foreground">Отслеживать все изменения в базе данных</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Логирование входов</p>
                      <p className="text-sm text-muted-foreground">История успешных и неудачных входов</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logRetention">Срок хранения логов (дней)</Label>
                    <Select>
                      <SelectTrigger id="logRetention"    style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                      }}>
                        <SelectValue placeholder="90 дней" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 дней</SelectItem>
                        <SelectItem value="90">90 дней</SelectItem>
                        <SelectItem value="180">180 дней</SelectItem>
                        <SelectItem value="365">1 год</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <UserManagementSection />

                <Button className="bg-orange-600 hover:bg-orange-700">
                  Сохранить настройки безопасности
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup">
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Резервное копирование
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p>Автоматическое резервирование</p>
                    <p className="text-sm text-gray-600">Ежедневное создание резервных копий</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Последняя резервная копия: 05.07.2025 в 02:00
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      Создать резервную копию
                    </Button>
                    <Button variant="outline">
                      Восстановить из копии
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Модальное окно для точки продаж */}
        {(showAddPoint || editingPoint) && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>
                    {editingPoint ? 'Редактировать точку продаж' : 'Добавить точку продаж'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pointName">Название *</Label>
                      <Input
                          id="pointName"
                          value={pointForm.name}
                          onChange={(e) => setPointForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Введите название"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pointType">Тип</Label>
                      <Select
                          value={pointForm.type}
                          onValueChange={(value) => setPointForm(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger id="pointType">
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="restaurant">Ресторан</SelectItem>
                          <SelectItem value="cafe">Кафе</SelectItem>
                          <SelectItem value="bar">Бар</SelectItem>
                          <SelectItem value="fastfood">Фастфуд</SelectItem>
                          <SelectItem value="shop">Магазин</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="pointAddress">Адрес</Label>
                      <Input
                          id="pointAddress"
                          value={pointForm.address}
                          onChange={(e) => setPointForm(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Введите адрес"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pointWarehouse">Склад</Label>
                      <Select
                          value={pointForm.warehouse_id?.toString() || "none"}
                          onValueChange={(value) => setPointForm(prev => ({
                            ...prev,
                            warehouse_id: value !== "none" ? parseInt(value) : null
                          }))}
                      >
                        <SelectTrigger id="pointWarehouse">
                          <SelectValue placeholder="Выберите склад" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Не указан</SelectItem>
                          {warehouses.map(warehouse => (
                              <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                {warehouse.name}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardContent>
                  <div className="flex gap-2 justify-end">
                    <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddPoint(false);
                          setEditingPoint(null);
                          resetPointForm();
                        }}
                    >
                      Отмена
                    </Button>
                    <Button
                        className="bg-orange-600 hover:bg-orange-700"
                        onClick={editingPoint ? handleEditPoint : handleAddPoint}
                        disabled={!pointForm.name.trim()}
                    >
                      {editingPoint ? 'Сохранить' : 'Добавить'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
        )}
      </div>
  );
};