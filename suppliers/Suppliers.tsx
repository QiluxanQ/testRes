import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Separator } from '../../ui/separator';
import { Progress } from '../../ui/progress';
import {
  Truck,
  User,
  Phone,
  Mail,
  Globe,
  Plus,
  Eye,
  Edit,
  Search,
  CreditCard,
  FileText,
  Package,
  Delete,
  ArrowLeft,
  XCircle,
  CheckCircle,
  Calendar,
  AlertCircle,
  Star,
  StarHalf,
  MapPin
} from 'lucide-react';
import { useSuppliers } from '../../../hooks/useSuppliers';
import {Input} from "../../ui/input";

// Интерфейс для поставщика
interface Supplier {
  id: number;
  name: string;
  Full_name?: string;
  type?: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  legal_adress?: string;
  actual_adress?: string;
  phone?: string;
  email?: string;
  website?: string;
  nds?: number;
  egais?: boolean;
  honest_sign?: boolean;
  update_at?: string;
  create_at?: string;
  is_active?: boolean;
  point_retail_id: number;

  category?: string;
  rating?: number;
  contact?: {
    person: string;
    phone: string;
    email: string;
    address: string;
  };
  paymentTerms?: {
    type: string;
    days: number;
    discount: number;
  };
  deliveryTerms?: {
    minOrder: number;
    deliveryDays: number;
    deliveryTime: string;
    freeDeliveryFrom: number;
  };
  stats?: {
    totalOrders: number;
    totalAmount: number;
    avgOrderAmount: number;
    avgDeliveryTime: number;
    onTimeDelivery: number;
    qualityReturns: number;
    lastOrder?: string;
    nextPlannedOrder?: string;
  };
  products?: Array<{
    name: string;
    price: number;
    unit: string;
  }>;
  documents?: Array<{
    type: string;
    number: string;
    date: string;
    validUntil: string;
  }>;
}

interface Contact {
  id: number;
  counterparty_id: number;
  full_name: string;
  position?: string;
  phone?: string;
  email?: string;
  is_primary: boolean;
}

interface SalesPoint {
  id: number;
  name: string;
  address?: string;
}

interface Document {
  transaction_id: string;
  number_doc: string;
  ext_number_doc: string;
  user_id: number;
  counterparty_id: number;
  point_retail_id: number;
  date_create: string;
  date_approval: string;
  status: string;
  warehouse_id: number;
  type_payment: string;
  amount: string;
  metadate: {
    items: Array<{
      product_id: number;
      name: string;
      quantity: number;
      price: string;
      purchase_price: string;
      retail_price: string;
      barcode: string;
      sku: string;
      unit: string;
      vat_rate: number;
      vat_amount: number;
      total_without_vat: number;
      expiry_date: string;
    }>;
    items_count: number;
    total_amount: number;
    total_with_vat: number;
    total_without_vat: number;
  };
  id: number;
  items: Array<{
    product_id: number;
    quantity: number;
    price: string;
    purchase_price: string;
    retail_price: string;
    vat: any;
    discount: string;
    metadate: any;
    id: number;
    invoice_id: number;
    total: any;
  }>;
}

interface Product {
  id: number;
  name: string;
  article?: string;
  category?: string;
  unit?: string;
  price?: number;
  purchase_price?: number;
  quantity?: number;
}

interface SuppliersProps {
  selectedSalesPoint?: SalesPoint | null;
}


const AddSupplierPage: React.FC<{
  onBack: () => void;
  onSupplierAdded: (newSupplier: any) => void;
  selectedSalesPoint?: SalesPoint | null;
}> = ({ onBack, onSupplierAdded, selectedSalesPoint }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    point_retail_id: selectedSalesPoint?.id || 0,
    name: '',
    Full_name: '',
    type: '',
    inn: '',
    kpp: '',
    ogrn: '',
    legal_adress: '',
    actual_adress: '',
    phone: '',
    email: '',
    website: '',
    nds: 0,
    egais: false,
    honest_sign: false
  });

  useEffect(() => {
    if (selectedSalesPoint) {
      setFormData(prev => ({
        ...prev,
        point_retail_id: selectedSalesPoint.id
      }));
    }
  }, [selectedSalesPoint]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddSupplier = async () => {
    const token = localStorage.getItem('token');
    if (!formData.name.trim() || !formData.inn) {
      alert('Пожалуйста, заполните обязательные поля: Название и ИНН');
      return;
    }

    setLoading(true);

    try {
      const supplierData = {
        point_retail_id: parseInt(formData.point_retail_id.toString()) || 0,
        name: formData.name.trim(),
        Full_name: formData.Full_name.trim() || '',
        type: formData.type.trim() || '',
        inn: formData.inn.trim(),
        kpp: formData.kpp.trim() || '',
        ogrn: formData.ogrn.trim() || '',
        legal_adress: formData.legal_adress.trim() || '',
        actual_adress: formData.actual_adress.trim() || '',
        phone: formData.phone.trim() || '',
        email: formData.email.trim() || '',
        website: formData.website.trim() || '',
        nds: parseFloat(formData.nds.toString()) || 0,
        egais: Boolean(formData.egais),
        honest_sign: Boolean(formData.honest_sign)
      };

      console.log('Отправляемые данные поставщика:', supplierData);

      const response = await fetch('/counterparties/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(supplierData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка при создании поставщика: ${errorText}`);
      }

      const result = await response.json();
      console.log('Поставщик создан:', result);

      // Вызываем колбэк с новым поставщиком
      onSupplierAdded(result);

      // Возвращаемся назад
      onBack();

      alert('Поставщик успешно добавлен!');

    } catch (error) {
      console.error('Ошибка:', error);
      alert(`Не удалось добавить поставщика: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddSupplier();
  };

  const resetForm = () => {
    setFormData({
      point_retail_id: selectedSalesPoint?.id || 0,
      name: '',
      Full_name: '',
      type: '',
      inn: '',
      kpp: '',
      ogrn: '',
      legal_adress: '',
      actual_adress: '',
      phone: '',
      email: '',
      website: '',
      nds: 0,
      egais: false,
      honest_sign: false
    });
  };

  const handleCancel = () => {
    resetForm();
    onBack();
  };

  return (
      <div className="space-y-6">
        {/* Кнопка возврата */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к списку
          </Button>
          <div className="flex items-center gap-2">
            {selectedSalesPoint && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Точка продаж: {selectedSalesPoint.name}
                </div>
            )}
            <Badge className="bg-blue-100 text-blue-800">Новый поставщик</Badge>
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
                <CardTitle style={{color:'var(--custom-text)'}} className="text-2xl flex items-center gap-3 text-white">
                  <Truck  className="h-6 w-6 text-orange-600" />
                  Добавление нового поставщика
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Заполните всю необходимую информацию о новом поставщике. Поля с * обязательны для заполнения.
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Форма добавления поставщика */}
        <Card style={{
          borderRadius: '20px',
          border: 'var(--custom-border-primary)',
          background: 'var(--custom-bg-secondaryLineCard)',
          color: 'var(--custom-text)',
        }}>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
              {/* Основная информация */}
              <div className="space-y-4">
                <h3 style={{color:'var(--custom-text)'}} className="text-lg font-semibold text-white">Основная информация</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                  <div className="space-y-2">
                    <Label style={{color:'var(--custom-text)'}} className="text-sm font-medium">Название *</Label>
                    <Input
                        placeholder="ООО 'Название'"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label style={{color:'var(--custom-text)'}} className="text-sm font-medium">Полное название</Label>
                    <Input
                        placeholder="Полное юридическое название"
                        value={formData.Full_name}
                        onChange={(e) => handleInputChange('Full_name', e.target.value)}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                  <div className="space-y-2">
                    <Label style={{color:'var(--custom-text)'}} className="text-sm font-medium">Тип поставщика</Label>
                    <Input
                        placeholder="Поставщик товаров"
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label style={{color:'var(--custom-text)'}} className="text-sm font-medium">ИНН *</Label>
                    <Input
                        placeholder="1234567890"
                        value={formData.inn}
                        onChange={(e) => handleInputChange('inn', e.target.value)}
                        required
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                  <div className="space-y-2">
                    <Label style={{color:'var(--custom-text)'}} className="text-sm font-medium">КПП</Label>
                    <Input
                        placeholder="123456789"
                        value={formData.kpp}
                        onChange={(e) => handleInputChange('kpp', e.target.value)}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label style={{color:'var(--custom-text)'}} className="text-sm font-medium">ОГРН</Label>
                    <Input
                        placeholder="1234567890123"
                        value={formData.ogrn}
                        onChange={(e) => handleInputChange('ogrn', e.target.value)}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                  <div className="space-y-2">
                    <Label style={{color:'var(--custom-text)'}} className="text-sm font-medium">Телефон</Label>
                    <Input
                        placeholder="+7 (499) 123-45-67"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label style={{color:'var(--custom-text)'}} className="text-sm font-medium">Email</Label>
                    <Input
                        type="email"
                        placeholder="info@company.ru"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-white">
                  <Label style={{color:'var(--custom-text)'}} className="text-sm font-medium">Сайт</Label>
                  <Input
                      placeholder="www.company.ru"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                      }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                  <div className="space-y-2">
                    <Label style={{color:'var(--custom-text)'}} className="text-sm font-medium">Юридический адрес</Label>
                    <Input
                        placeholder="Полный адрес"
                        value={formData.legal_adress}
                        onChange={(e) => handleInputChange('legal_adress', e.target.value)}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label style={{color:'var(--custom-text)'}} className="text-sm font-medium">Фактический адрес</Label>
                    <Input
                        placeholder="Полный адрес"
                        value={formData.actual_adress}
                        onChange={(e) => handleInputChange('actual_adress', e.target.value)}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white ">
                  <div className="space-y-2">
                    <Label style={{color:'var(--custom-text)'}} className="text-sm font-medium">НДС (%)</Label>
                    <Input
                        type="number"
                        placeholder="20"
                        value={formData.nds}
                        onChange={(e) => handleInputChange('nds', parseInt(e.target.value) || 0)}
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="egais"
                        checked={formData.egais}
                        onChange={(e) => handleInputChange('egais', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label style={{color:'var(--custom-text)'}} htmlFor="egais">ЕГАИС</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="honest_sign"
                        checked={formData.honest_sign}
                        onChange={(e) => handleInputChange('honest_sign', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                        style={{
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-inpyt)',
                          color: 'var(--custom-text)',
                        }}
                    />
                    <Label style={{color:'var(--custom-text)'}} htmlFor="honest_sign">Честный знак</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                    type="button"
                >
                  Отмена
                </Button>
                <Button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700"
                    disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? 'Добавление...' : 'Добавить поставщика'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  );
};

// Компонент добавления контактного лица (не модальный)
const AddContactPage: React.FC<{
  onBack: () => void;
  onContactAdded: (newContact: any) => void;
  suppliers: Supplier[];
  selectedSalesPoint?: SalesPoint | null;
}> = ({ onBack, onContactAdded, suppliers, selectedSalesPoint }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    counterparty_id: '',
    full_name: '',
    position: '',
    phone: '',
    email: '',
    is_primary: false
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddContact = async () => {
    const token = localStorage.getItem('token');
    if (!formData.counterparty_id || !formData.full_name.trim()) {
      alert('Пожалуйста, заполните обязательные поля: Поставщик и ФИО');
      return;
    }

    setLoading(true);

    try {
      const contactData = {
        counterparty_id: parseInt(formData.counterparty_id),
        full_name: formData.full_name.trim(),
        position: formData.position.trim() || '',
        phone: formData.phone.trim() || '',
        email: formData.email.trim() || '',
        is_primary: Boolean(formData.is_primary)
      };

      const response = await fetch('/counterparties/contacts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contactData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка при создании контакта: ${errorText}`);
      }

      const result = await response.json();
      console.log('Контакт создан:', result);

      // Вызываем колбэк с новым контактом
      onContactAdded(result);

      // Возвращаемся назад
      onBack();

      alert('Контактное лицо успешно добавлено!');

    } catch (error) {
      console.error('Ошибка:', error);
      alert(`Не удалось добавить контактное лицо: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddContact();
  };

  const resetForm = () => {
    setFormData({
      counterparty_id: '',
      full_name: '',
      position: '',
      phone: '',
      email: '',
      is_primary: false
    });
  };

  const handleCancel = () => {
    resetForm();
    onBack();
  };

  return (
      <div className="space-y-6">
        {/* Кнопка возврата */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к списку
          </Button>
          <div className="flex items-center gap-2">
            {selectedSalesPoint && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Точка продаж: {selectedSalesPoint.name}
                </div>
            )}
            <Badge className="bg-blue-100 text-blue-800">Новое контактное лицо</Badge>
          </div>
        </div>

        {/* Заголовок */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <User className="h-6 w-6 text-orange-600" />
                  Добавление контактного лица
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Заполните информацию о контактном лице поставщика
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Форма добавления контактного лица */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Поставщик *</Label>
                  <Select
                      value={formData.counterparty_id}
                      onValueChange={(value) => handleInputChange('counterparty_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите поставщика" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">ФИО *</Label>
                  <Input
                      placeholder="Иванов Иван Иванович"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Должность</Label>
                  <Input
                      placeholder="Менеджер по продажам"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Телефон</Label>
                  <Input
                      placeholder="+7 (999) 123-45-67"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email</Label>
                  <Input
                      type="email"
                      placeholder="ivanov@company.ru"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                      type="checkbox"
                      id="is_primary"
                      checked={formData.is_primary}
                      onChange={(e) => handleInputChange('is_primary', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="is_primary" className="text-sm font-medium">
                    Основной контакт
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                    type="button"
                >
                  Отмена
                </Button>
                <Button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700"
                    disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? 'Добавление...' : 'Добавить контакт'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  );
};


const SupplierDetailView: React.FC<{
  supplier: Supplier;
  onBack: () => void;
  selectedSalesPoint?: SalesPoint | null;
}> = ({ supplier, onBack, selectedSalesPoint }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSupplier, setEditedSupplier] = useState<Supplier | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);


  useEffect(() => {
    if (supplier) {
      const enhancedSupplier: Supplier = {
        ...supplier,
        category: supplier.type || 'Поставщик',
        rating: 4.5,
        contact: {
          person: supplier.contact?.person || 'Не указано',
          phone: supplier.phone || 'Не указан',
          email: supplier.email || 'Не указан',
          address: supplier.actual_adress || supplier.legal_adress || 'Не указан'
        },
        paymentTerms: supplier.paymentTerms || {
          type: 'postpay',
          days: 30,
          discount: 5
        },
        deliveryTerms: supplier.deliveryTerms || {
          minOrder: 10000,
          deliveryDays: 2,
          deliveryTime: '09:00-18:00',
          freeDeliveryFrom: 50000
        },
        stats: supplier.stats || {
          totalOrders: 45,
          totalAmount: 2500000,
          avgOrderAmount: 55555,
          avgDeliveryTime: 1.5,
          onTimeDelivery: 92,
          qualityReturns: 2,
          lastOrder: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          nextPlannedOrder: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        products: supplier.products || [
          { name: 'Мясо говяжье', price: 450, unit: 'кг' },
          { name: 'Мясо куриное', price: 280, unit: 'кг' },
          { name: 'Свинина', price: 380, unit: 'кг' }
        ],
        documents: supplier.documents || [
          {
            type: 'contract',
            number: 'ДГ-2024-001',
            date: '2024-01-15',
            validUntil: '2024-12-31'
          },
          {
            type: 'certificate',
            number: 'СЕРТ-04562',
            date: '2023-06-20',
            validUntil: '2024-06-20'
          }
        ]
      };
      setEditedSupplier(enhancedSupplier);
    }
  }, [supplier]);


  useEffect(() => {
    const fetchDocumentsAndProducts = async () => {
      const token = localStorage.getItem('token');
      if (!supplier?.id) return;

      setLoadingDocuments(true);
      setLoadingProducts(true);

      try {
        const response = await fetch(
            `/receipt-invoices/?skip=0&limit=1000&include_items=true`,
            {
              headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }
        );

        if (response.ok) {
          const data = await response.json();
          const allDocuments = Array.isArray(data) ? data : [];

          const supplierDocuments = allDocuments.filter((doc: Document) =>
              doc.counterparty_id === supplier.id
          );

          console.log('Все документы:', allDocuments);
          console.log('Документы для поставщика:', supplierDocuments);
          setDocuments(supplierDocuments);

          // ВАРИАНТ 3: Собираем ВСЕ товары без объединения по product_id
          const allProducts: Product[] = [];

          supplierDocuments.forEach((doc: Document, docIndex: number) => {
            // Обработка товаров из metadate.items
            if (doc.metadate?.items && Array.isArray(doc.metadate.items)) {
              doc.metadate.items.forEach((item: any, itemIndex: number) => {
                if (item.name || item.product_id) {
                  // Создаем уникальный ID для каждого товара
                  const uniqueId = item.product_id
                      ? `${item.product_id}-${doc.id}-${itemIndex}`
                      : `${doc.id}-${itemIndex}`;

                  allProducts.push({
                    id: Number(uniqueId.split('-')[0]) || doc.id * 1000 + itemIndex,
                    name: item.name || `Товар ID: ${item.product_id}`,
                    article: item.sku || item.barcode || `PRD${item.product_id || uniqueId}`,
                    category: 'Из документов',
                    unit: item.unit || 'шт',
                    price: parseFloat(item.retail_price || item.price || "0"),
                    purchase_price: parseFloat(item.purchase_price || item.price || "0"),
                    quantity: item.quantity || 0,
                    // Дополнительные поля для информации о документе
                    document_id: doc.id,
                    document_number: doc.number_doc || `Док-${doc.id}`,
                    document_date: doc.date_create,
                  });
                }
              });
            }

            // Обработка товаров из items (если есть)
            if (doc.items && Array.isArray(doc.items)) {
              doc.items.forEach((item: any, itemIndex: number) => {
                if (item.product_id) {
                  const uniqueId = `${item.product_id}-${doc.id}-items-${itemIndex}`;

                  allProducts.push({
                    id: item.product_id,
                    name: item.metadate?.name || `Товар ID: ${item.product_id}`,
                    article: item.metadate?.sku || item.metadate?.barcode || `PRD${item.product_id}`,
                    category: 'Из документов',
                    unit: item.metadate?.unit || 'шт',
                    price: parseFloat(item.retail_price || item.price || "0"),
                    purchase_price: parseFloat(item.purchase_price || item.price || "0"),
                    quantity: item.quantity || 0,
                    document_id: doc.id,
                    document_number: doc.number_doc || `Док-${doc.id}`,
                    document_date: doc.date_create,
                  });
                }
              });
            }
          });

          console.log('Все товары из документов:', allProducts);
          setProducts(allProducts);

        } else {
          console.error('Ошибка загрузки документов:', response.status);
          setDocuments([]);
          setProducts([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setDocuments([]);
        setProducts([]);
      } finally {
        setLoadingDocuments(false);
        setLoadingProducts(false);
      }
    };

    fetchDocumentsAndProducts();
  }, [supplier?.id]);

  // Функции для редактирования
  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedSupplier({
      ...supplier,
      ...editedSupplier
    });
  };

  const handleSaveEdit = async () => {
    const token = localStorage.getItem('token');
    if (!editedSupplier) return;

    try {
      const response = await fetch(`/counterparties/${supplier.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editedSupplier.name,
          phone: editedSupplier.contact?.phone,
          email: editedSupplier.contact?.email,
          actual_adress: editedSupplier.contact?.address
        })
      });

      if (response.ok) {
        setIsEditing(false);
        alert('Данные поставщика успешно обновлены!');
      } else {
        throw new Error('Ошибка при обновлении данных');
      }
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      alert('Не удалось сохранить изменения');
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    if (!editedSupplier) return;
    setEditedSupplier({
      ...editedSupplier,
      [field]: value
    });
  };

  const handleNestedFieldChange = (nestedField: string, field: string, value: any) => {
    if (!editedSupplier) return;
    setEditedSupplier({
      ...editedSupplier,
      [nestedField]: {
        ...(editedSupplier as any)[nestedField],
        [field]: value
      }
    });
  };

  // Вспомогательные функции
  const getStatusBadge = (supplier: Supplier) => {
    if (supplier.is_active) {
      return <Badge className="bg-green-100 text-green-800">Активен</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Неактивен</Badge>;
    }
  };

  const getRatingStars = (rating: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />);
    }

    return (
        <div className="flex items-center gap-1">
          {stars}
          <span className="ml-2 text-sm text-muted-foreground">({rating})</span>
        </div>
    );
  };

  const getPaymentTermsBadge = (type: string) => {
    switch (type) {
      case 'prepay':
        return <Badge className="bg-blue-100 text-blue-800">Предоплата</Badge>;
      case 'postpay':
        return <Badge className="bg-green-100 text-green-800">Постоплата</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Подтвержден</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Ожидание</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Отклонен</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!editedSupplier) {
    return (
        <div className="flex justify-center items-center h-64">
          <div>Загрузка данных поставщика...</div>
        </div>
    );
  }

  const currentSupplier = isEditing ? editedSupplier : {
    ...supplier,
    ...editedSupplier
  };

  return (
      <div className="space-y-6">
        {/* Информация о точке продаж */}
        {selectedSalesPoint && (
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-secondaryLineCard)',
              color: 'var(--custom-text)',
            }}>
              <CardContent className="pt-6 text-white">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Точка продаж: {selectedSalesPoint.name}
                  {selectedSalesPoint.address && ` (${selectedSalesPoint.address})`}
                </div>
              </CardContent>
            </Card>
        )}

        {/* Кнопка возврата */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => {
            onBack();
            setIsEditing(false);
            setEditedSupplier(null);
          }}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к списку
          </Button>
          <div className="flex items-center gap-2">
            {getStatusBadge(currentSupplier)}
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
                <CardTitle style={{color:'var(--custom-text)'}} className="text-2xl flex items-center gap-3 text-white">
                  <Truck className="h-6 w-6 text-orange-600" />
                  {currentSupplier.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentSupplier.category}
                  {currentSupplier.inn && ` • ИНН: ${currentSupplier.inn}`}
                </p>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Отмена
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveEdit}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Сохранить
                      </Button>
                    </>
                ) : (
                    <>
                      <Button variant="outline" onClick={handleStartEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Редактировать
                      </Button>
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        <Package className="h-4 w-4 mr-2" />
                        Создать заказ
                      </Button>
                    </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="info" className="mt-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="info">Информация</TabsTrigger>
            <TabsTrigger value="products">Товары ({products.length})</TabsTrigger>
            <TabsTrigger value="documents">Документы ({documents.length})</TabsTrigger>
            <TabsTrigger value="stats">Статистика</TabsTrigger>
            <TabsTrigger value="history">История</TabsTrigger>
          </TabsList>

          {/* Информация */}
          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
              }}>
                <CardHeader>
                  <CardTitle className="text-base">Контактная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Название</div>
                    {isEditing ? (
                        <Input
                            value={currentSupplier.name}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                    ) : (
                        <div className="font-medium">{currentSupplier.name}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Контактное лицо</div>
                    {isEditing ? (
                        <Input
                            value={currentSupplier.contact!.person}
                            onChange={(e) => handleNestedFieldChange('contact', 'person', e.target.value)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                    ) : (
                        <div className="font-medium">{currentSupplier.contact!.person}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Телефон</div>
                    {isEditing ? (
                        <Input
                            value={currentSupplier.contact!.phone}
                            onChange={(e) => handleNestedFieldChange('contact', 'phone', e.target.value)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                    ) : (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{currentSupplier.contact!.phone}</span>
                        </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Email</div>
                    {isEditing ? (
                        <Input
                            value={currentSupplier.contact!.email}
                            onChange={(e) => handleNestedFieldChange('contact', 'email', e.target.value)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                    ) : (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{currentSupplier.contact!.email}</span>
                        </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Адрес</div>
                    {isEditing ? (
                        <textarea
                            value={currentSupplier.contact!.address}
                            onChange={(e) => handleNestedFieldChange('contact', 'address', e.target.value)}
                            className="w-full border rounded-md p-2 text-sm"
                            rows={2}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                    ) : (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                          <span className="text-sm">{currentSupplier.contact!.address}</span>
                        </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
              }}>
                <CardHeader>
                  <CardTitle className="text-base">Рейтинг и качество</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Общий рейтинг</div>
                    {getRatingStars(currentSupplier.rating)}
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Доставка вовремя</div>
                    <div className="flex items-center gap-2">
                      <Progress value={currentSupplier.stats!.onTimeDelivery} className="flex-1" />
                      <span className="text-sm font-medium">{currentSupplier.stats!.onTimeDelivery}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Возвраты по качеству</div>
                    <div className="flex items-center gap-2">
                      <Progress
                          value={currentSupplier.stats!.qualityReturns}
                          className="flex-1 [&>div]:bg-red-600"
                      />
                      <span className="text-sm font-medium text-red-600">{currentSupplier.stats!.qualityReturns}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
              }}>
                <CardHeader>
                  <CardTitle className="text-base">Условия оплаты</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Тип оплаты</div>
                    {isEditing ? (
                        <select
                            value={currentSupplier.paymentTerms!.type}
                            onChange={(e) => handleNestedFieldChange('paymentTerms', 'type', e.target.value)}
                            className="w-full border rounded-md p-2"
                        >
                          <option value="prepay">Предоплата</option>
                          <option value="postpay">Постоплата</option>
                        </select>
                    ) : (
                        getPaymentTermsBadge(currentSupplier.paymentTerms!.type)
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Отсрочка (дней)</div>
                    {isEditing ? (
                        <Input
                            type="number"
                            value={currentSupplier.paymentTerms!.days}
                            onChange={(e) => handleNestedFieldChange('paymentTerms', 'days', parseInt(e.target.value) || 0)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                    ) : (
                        <span className="font-medium">{currentSupplier.paymentTerms!.days} дней</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Скидка (%)</div>
                    {isEditing ? (
                        <Input
                            type="number"
                            value={currentSupplier.paymentTerms!.discount}
                            onChange={(e) => handleNestedFieldChange('paymentTerms', 'discount', parseInt(e.target.value) || 0)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                    ) : (
                        <span className="font-medium text-green-600">{currentSupplier.paymentTerms!.discount}%</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
              }}>
                <CardHeader>
                  <CardTitle className="text-base">Условия доставки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Минимальный заказ</div>
                    {isEditing ? (
                        <Input
                            type="number"
                            value={currentSupplier.deliveryTerms!.minOrder}
                            onChange={(e) => handleNestedFieldChange('deliveryTerms', 'minOrder', parseInt(e.target.value) || 0)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                    ) : (
                        <span className="font-medium">₽{currentSupplier.deliveryTerms!.minOrder.toLocaleString()}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Срок доставки (дней)</div>
                    {isEditing ? (
                        <Input
                            type="number"
                            value={currentSupplier.deliveryTerms!.deliveryDays}
                            onChange={(e) => handleNestedFieldChange('deliveryTerms', 'deliveryDays', parseInt(e.target.value) || 0)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                    ) : (
                        <span className="font-medium">{currentSupplier.deliveryTerms!.deliveryDays} дн.</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Время доставки</div>
                    {isEditing ? (
                        <Input
                            value={currentSupplier.deliveryTerms!.deliveryTime}
                            onChange={(e) => handleNestedFieldChange('deliveryTerms', 'deliveryTime', e.target.value)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                            placeholder="08:00-12:00"
                        />
                    ) : (
                        <span className="font-medium">{currentSupplier.deliveryTerms!.deliveryTime}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Бесплатная доставка от</div>
                    {isEditing ? (
                        <Input
                            type="number"
                            value={currentSupplier.deliveryTerms!.freeDeliveryFrom}
                            onChange={(e) => handleNestedFieldChange('deliveryTerms', 'freeDeliveryFrom', parseInt(e.target.value) || 0)}
                            style={{
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-inpyt)',
                              color: 'var(--custom-text)',
                            }}
                        />
                    ) : (
                        <span className="font-medium text-green-600">₽{currentSupplier.deliveryTerms!.freeDeliveryFrom.toLocaleString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Товары */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex items-center justify-between mb-4 text-white">
              <h4 className="font-medium">Ассортимент ({products.length} позиций)</h4>
            </div>

            {loadingProducts ? (
                <Card style={{
                  borderRadius: '20px',
                  border: 'var(--custom-border-primary)',
                  background: 'var(--custom-bg-secondaryLineCard)',
                  color: 'var(--custom-text)',
                }}>
                  <CardContent className="p-6 text-center">
                    <div>Загрузка товаров...</div>
                  </CardContent>
                </Card>
            ) : (
                <Card style={{
                  borderRadius: '20px',
                  border: 'var(--custom-border-primary)',
                  background: 'var(--custom-bg-secondaryLineCard)',
                  color: 'var(--custom-text)',
                }}>
                  <CardContent className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Артикул</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Наименование</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Категория</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Ед. изм.</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Цена закупки</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>Цена продажи</TableHead>
                          <TableHead style={{color:'rgb(101,125,156)'}}>В наличии</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">{product.article || '-'}</TableCell>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell>{product.category || '-'}</TableCell>
                              <TableCell>{product.unit || 'шт'}</TableCell>
                              <TableCell className="text-green-600">₽{product.purchase_price?.toLocaleString() || '0'}</TableCell>
                              <TableCell className="text-orange-600">₽{product.price?.toLocaleString() || '0'}</TableCell>
                              <TableCell>{product.quantity || 0}</TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
            )}
          </TabsContent>

          {/* Документы */}
          <TabsContent value="documents" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-white">Документы ({documents.length})</h4>
              <div className="text-sm text-muted-foreground">
                Приходные накладные от поставщика
              </div>
            </div>

            {loadingDocuments ? (
                <Card style={{
                  borderRadius: '20px',
                  border: 'var(--custom-border-primary)',
                  background: 'var(--custom-bg-secondaryLineCard)',
                  color: 'var(--custom-text)',
                }}>
                  <CardContent className="p-6 text-center">
                    <div>Загрузка документов...</div>
                  </CardContent>
                </Card>
            ) : (
                <>
                  {documents.length > 0 ? (
                      <>
                        <Card style={{
                          borderRadius: '20px',
                          border: 'var(--custom-border-primary)',
                          background: 'var(--custom-bg-secondaryLineCard)',
                          color: 'var(--custom-text)',
                        }}>
                          <CardHeader>
                            <CardTitle className="text-base">Список документов</CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead style={{color:'rgb(101,125,156)'}}>№ документа</TableHead>
                                  <TableHead style={{color:'rgb(101,125,156)'}}>Дата создания</TableHead>
                                  <TableHead style={{color:'rgb(101,125,156)'}}>Сумма</TableHead>
                                  <TableHead style={{color:'rgb(101,125,156)'}}>Тип оплаты</TableHead>
                                  <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                                  <TableHead style={{color:'rgb(101,125,156)'}}>Товаров</TableHead>

                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {documents.map((document) => (
                                    <TableRow key={document.id}>
                                      <TableCell className="font-medium">
                                        <div>
                                          <div>{document.number_doc || `Док-${document.id}`}</div>
                                          {document.ext_number_doc && (
                                              <div className="text-xs text-muted-foreground">
                                                Внешний: {document.ext_number_doc}
                                              </div>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="text-sm">
                                          {new Date(document.date_create).toLocaleDateString('ru-RU')}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {new Date(document.date_create).toLocaleTimeString('ru-RU', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-orange-600 font-medium">
                                        ₽{parseFloat(document.amount || "0").toLocaleString('ru-RU')}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className='text-white'>
                                          {document.type_payment === 'cash' ? 'Наличные' :
                                              document.type_payment === 'card' ? 'Карта' :
                                                  document.type_payment === 'transfer' ? 'Перевод' :
                                                      document.type_payment === 'mixed' ? 'Смешанная' :
                                                          document.type_payment || 'Не указан'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className='text-white'>
                                        {getDocumentStatusBadge(document.status)}
                                      </TableCell>
                                      <TableCell>
                                        {document.metadate?.items_count || document.items?.length || 0}
                                      </TableCell>
                                    </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>

                        {/* Детализация по каждому документу */}
                        {documents.map((document) => (
                            <Card key={`detail-${document.id}`} className="mt-4" style={{
                              borderRadius: '20px',
                              border: 'var(--custom-border-primary)',
                              background: 'var(--custom-bg-secondaryLineCard)',
                              color: 'var(--custom-text)',
                            }}>
                              <CardHeader>
                                <CardTitle className="text-base">
                                  Детали документа: {document.number_doc || `Док-${document.id}`}
                                  {document.ext_number_doc && ` (${document.ext_number_doc})`}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Дата создания:</span>
                                      <div className="font-medium">
                                        {new Date(document.date_create).toLocaleDateString('ru-RU')}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Дата подтверждения:</span>
                                      <div className="font-medium">
                                        {document.date_approval ?
                                            new Date(document.date_approval).toLocaleDateString('ru-RU') :
                                            <span className="text-yellow-600">Не подтвержден</span>
                                        }
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Сумма:</span>
                                      <div className="font-medium text-orange-600">
                                        ₽{parseFloat(document.amount || "0").toLocaleString('ru-RU')}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Статус:</span>
                                      <div>{getDocumentStatusBadge(document.status)}</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Тип оплаты:</span>
                                      <div className="font-medium">
                                        {document.type_payment === 'cash' ? 'Наличные' :
                                            document.type_payment === 'card' ? 'Карта' :
                                                document.type_payment === 'transfer' ? 'Перевод' :
                                                    document.type_payment === 'mixed' ? 'Смешанная' :
                                                        document.type_payment || 'Не указан'}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">ID склада:</span>
                                      <div className="font-medium">{document.warehouse_id}</div>
                                    </div>
                                  </div>

                                  <Separator />

                                  <div>
                                    <h5 className="font-medium mb-3">
                                      Товары в документе ({document.metadate?.items_count || document.items?.length || 0}):
                                    </h5>


                                    {document.metadate?.items && document.metadate.items.length > 0 ? (
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead style={{color:'rgb(101,125,156)'}}>ID товара</TableHead>
                                              <TableHead style={{color:'rgb(101,125,156)'}}>Название</TableHead>
                                              <TableHead style={{color:'rgb(101,125,156)'}}>Количество</TableHead>
                                              <TableHead style={{color:'rgb(101,125,156)'}}>Цена</TableHead>
                                              <TableHead style={{color:'rgb(101,125,156)'}}>Закупочная цена</TableHead>
                                              <TableHead style={{color:'rgb(101,125,156)'}}>Штрих-код</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {document.metadate.items.map((item: any, index: number) => (
                                                <TableRow key={index}>
                                                  <TableCell className="font-medium">
                                                    {item.product_id}
                                                  </TableCell>
                                                  <TableCell>
                                                    {item.name || `Товар ID: ${item.name}`}
                                                  </TableCell>
                                                  <TableCell>
                                                    <div className="flex items-center gap-2">
                                                      <span>{item.quantity}</span>
                                                      <Badge variant="outline" className="text-xs">
                                                        {item.unit || 'шт'}
                                                      </Badge>
                                                    </div>
                                                  </TableCell>
                                                  <TableCell>
                                                    ₽{parseFloat(item.price || "0").toLocaleString('ru-RU')}
                                                  </TableCell>
                                                  <TableCell>
                                                    ₽{parseFloat(item.purchase_price || "0").toLocaleString('ru-RU')}
                                                  </TableCell>
                                                  <TableCell>
                                                    {item.barcode || '-'}
                                                  </TableCell>
                                                </TableRow>
                                            ))}

                                            <TableRow className=" font-medium">
                                              <TableCell colSpan={2}>Итого:</TableCell>
                                              <TableCell>
                                                {document.metadate.items_count || 0}
                                              </TableCell>
                                              <TableCell className="text-orange-600">
                                                ₽{document.metadate.total_amount?.toLocaleString('ru-RU') || '0'}
                                              </TableCell>
                                              <TableCell></TableCell>
                                              <TableCell></TableCell>
                                            </TableRow>
                                          </TableBody>
                                        </Table>
                                    ) : document.items && document.items.length > 0 ? (
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>ID товара</TableHead>
                                              <TableHead>Название</TableHead>
                                              <TableHead>Количество</TableHead>
                                              <TableHead>Цена</TableHead>
                                              <TableHead>Закупочная цена</TableHead>
                                              <TableHead>Скидка</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {document.items.map((item) => {
                                              const product = products.find(p => p.id === item.product_id);
                                              return (
                                                  <TableRow key={item.id}>
                                                    <TableCell className="font-medium">
                                                      {item.product_id}
                                                    </TableCell>
                                                    <TableCell>
                                                      {product?.name || `Товар ID: ${item.name}`}
                                                    </TableCell>
                                                    <TableCell>
                                                      <div className="flex items-center gap-2">
                                                        <span>{item.quantity}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                          {product?.unit || 'шт'}
                                                        </Badge>
                                                      </div>
                                                    </TableCell>
                                                    <TableCell>
                                                      ₽{parseFloat(item.price || "0").toLocaleString('ru-RU')}
                                                    </TableCell>
                                                    <TableCell>
                                                      ₽{parseFloat(item.purchase_price || "0").toLocaleString('ru-RU')}
                                                    </TableCell>
                                                    <TableCell>
                                                      {item.discount ? `${parseFloat(item.discount)}%` : '0%'}
                                                    </TableCell>
                                                  </TableRow>
                                              );
                                            })}
                                          </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center p-6 text-muted-foreground">
                                          <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                          <p>Нет товаров в этом документе</p>
                                        </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                        ))}
                      </>
                  ) : (
                      <Card>
                        <CardContent className="p-12 text-center text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Нет документов для этого поставщика</p>
                          <p className="text-sm mt-2">
                            Приходные накладные будут отображаться здесь, когда появятся
                          </p>
                        </CardContent>
                      </Card>
                  )}
                </>
            )}
          </TabsContent>

          {/* Статистика */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
              }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Всего заказов</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl">{currentSupplier.stats!.totalOrders}</div>
                </CardContent>
              </Card>
              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
              }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Общая сумма</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl text-green-600">₽{(currentSupplier.stats!.totalAmount / 1000000).toFixed(2)}М</div>
                </CardContent>
              </Card>
              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
              }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Средний заказ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl text-orange-600">₽{currentSupplier.stats!.avgOrderAmount.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
              }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Среднее время доставки</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl">{currentSupplier.stats!.avgDeliveryTime} дн.</div>
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
                <CardTitle className="text-base">Последние заказы</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Последний заказ:</span>
                  <span className="font-medium">
                  {currentSupplier.stats!.lastOrder ? new Date(currentSupplier.stats!.lastOrder).toLocaleDateString('ru-RU') : '-'}
                </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Следующий плановый заказ:</span>
                  <span className="font-medium text-orange-600">
                  {currentSupplier.stats!.nextPlannedOrder ? new Date(currentSupplier.stats!.nextPlannedOrder).toLocaleDateString('ru-RU') : 'Не запланирован'}
                </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardContent className="p-12">
                <div className="text-center text-muted-foreground">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>История заказов будет отображаться здесь</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export const Suppliers: React.FC<SuppliersProps> = ({ selectedSalesPoint }) => {
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'addSupplier' | 'addContact'>('list');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [contactsSearch, setContactsSearch] = useState('');
  const [activeTab, setActiveTab] = useState('suppliers');


  const { suppliers, contacts, loading, error, refetch } = useSuppliers(selectedSalesPoint);

  if (currentView === 'detail' && selectedSupplier) {
    return (
        <SupplierDetailView
            supplier={selectedSupplier}
            onBack={() => {
              setCurrentView('list');
              setSelectedSupplier(null);
            }}
            selectedSalesPoint={selectedSalesPoint}
        />
    );
  }

  if (currentView === 'addSupplier') {
    return (
        <AddSupplierPage
            onBack={() => setCurrentView('list')}
            onSupplierAdded={(newSupplier) => {
              refetch();
              setCurrentView('list');
            }}
            selectedSalesPoint={selectedSalesPoint}
        />
    );
  }

  if (currentView === 'addContact') {
    return (
        <AddContactPage
            onBack={() => setCurrentView('list')}
            onContactAdded={(newContact) => {
              refetch();
              setCurrentView('list');
            }}
            suppliers={suppliers}
            selectedSalesPoint={selectedSalesPoint}
        />
    );
  }

  const filteredSuppliers = suppliers.filter(supplier =>
      supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.Full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.inn?.includes(searchTerm) ||
      supplier.phone?.includes(searchTerm) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const filteredContacts = contacts.filter(contact =>
      contact.full_name?.toLowerCase().includes(contactsSearch.toLowerCase()) ||
      contact.position?.toLowerCase().includes(contactsSearch.toLowerCase()) ||
      contact.phone?.includes(contactsSearch) ||
      contact.email?.toLowerCase().includes(contactsSearch.toLowerCase())
  );

  const getContactsByCounterpartyId = (counterpartyId: number) => {
    return contacts.filter(contact => contact.counterparty_id === counterpartyId);
  };


  const getPrimaryContact = (counterpartyId: number) => {
    const counterpartyContacts = getContactsByCounterpartyId(counterpartyId);
    return counterpartyContacts.find(contact => contact.is_primary) || counterpartyContacts[0];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const getSupplierStats = () => {
    const totalSuppliers = suppliers.length;
    const activeThisMonth = suppliers.filter(supplier => {
      const lastDelivery = new Date(supplier.update_at || '');
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return lastDelivery > monthAgo;
    }).length;

    const totalDebt = suppliers.reduce((sum, supplier) => sum + 0, 0);
    const avgDeliveryDays = suppliers.length > 0
        ? suppliers.reduce((sum, supplier) => sum + 3, 0) / suppliers.length
        : 0;

    return {
      totalSuppliers,
      activeThisMonth,
      totalDebt,
      avgDeliveryDays: avgDeliveryDays.toFixed(1)
    };
  };

  const stats = getSupplierStats();

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64" style={{color:'var(--custom-text)'}}>
          <div className="text-lg">Загрузка данных...</div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">Ошибка загрузки: {error}</div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {selectedSalesPoint && (
            <Card style={{
              borderRadius: '20px',
              border: 'var(--custom-border-primary)',
              background: 'var(--custom-bg-primaryLine)',
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


        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-primaryLine)',
            color: 'var(--custom-text)',
          }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{color:'var(--custom-text)'}} className="text-sm text-white">Всего поставщиков</p>
                  <p className="text-2xl text-blue-600">{stats.totalSuppliers}</p>
                  {selectedSalesPoint && (
                      <p className="text-xs text-muted-foreground mt-1">
                        для {selectedSalesPoint.name}
                      </p>
                  )}
                </div>
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-primaryLine)',
            color: 'var(--custom-text)',
          }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{color:'var(--custom-text)'}} className="text-sm text-white">Активных в месяце</p>
                  <p className="text-2xl text-green-600">{stats.activeThisMonth}</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-primaryLine)',
            color: 'var(--custom-text)',
          }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{color:'var(--custom-text)'}} className="text-sm text-white">Кредиторская задолженность</p>
                  <p className="text-2xl text-orange-600">{stats.totalDebt.toLocaleString('ru-RU')} ₽</p>
                </div>
                <CreditCard className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card style={{
            borderRadius: '20px',
            border: 'var(--custom-border-primary)',
            background: 'var(--custom-bg-primaryLine)',
            color: 'var(--custom-text)',
          }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{color:'var(--custom-text)'}} className="text-sm text-white">Средний срок поставки</p>
                  <p className="text-2xl text-purple-600">{stats.avgDeliveryDays} дня</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Поиск и добавление */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex gap-2">
              {activeTab === 'suppliers' && (
                  <Input
                      placeholder="Поиск поставщиков..."
                      className="w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                      }}
                  />
              )}
              {activeTab === 'contacts' && (
                  <Input
                      placeholder="Поиск контактов..."
                      className="w-64"
                      value={contactsSearch}
                      onChange={(e) => setContactsSearch(e.target.value)}
                      style={{
                        border: 'var(--custom-border-primary)',
                        background: 'var(--custom-bg-inpyt)',
                        color: 'var(--custom-text)',
                      }}
                  />
              )}
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4"  />
              </Button>
            </div>
          </div>

          {activeTab === 'suppliers' && (
              <Button onClick={() => setCurrentView('addSupplier')}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить поставщика
              </Button>
          )}

          {activeTab === 'contacts' && (
              <Button onClick={() => setCurrentView('addContact')}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить контактное лицо
              </Button>
          )}
        </div>

        {/* Табы */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2" >
            <TabsTrigger value="suppliers">
              Поставщики {selectedSalesPoint && `(${suppliers.length})`}
            </TabsTrigger>
            <TabsTrigger value="contacts">
              Контактные лица ({contacts.length})
            </TabsTrigger>
          </TabsList>

          <div className="px-0 pb-6" style={{ height: '500px', overflowY: 'auto' }}>
            {/* Таб поставщиков */}
            <TabsContent value="suppliers">
              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
              }}>
                <CardHeader>
                  <CardTitle style={{color:'var(--custom-text)'}} className='text-white'>
                    База поставщиков
                    {selectedSalesPoint && ` - ${selectedSalesPoint.name}`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredSuppliers.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        {selectedSalesPoint
                            ? `Нет поставщиков для точки продаж "${selectedSalesPoint.name}"`
                            : 'Поставщики не найдены'
                        }
                      </div>
                  ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Название</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>ИНН/КПП</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Контакты</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Тип</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Адрес</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Обновлен</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Статус</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Действия</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className='text-white'>
                          {filteredSuppliers.map((supplier) => {
                            const primaryContact = getPrimaryContact(supplier.id);
                            return (
                                <TableRow key={supplier.id} onClick={() => {
                                  setSelectedSupplier(supplier);
                                  setCurrentView('detail');
                                }}>
                                  <TableCell style={{color:'var(--custom-text)'}}>
                                    <div className="flex items-center gap-2">
                                      <Truck className="h-4 w-4 text-gray-500" />
                                      <div>
                                        <div
                                            className="font-medium cursor-pointer hover:text-orange-600"
                                            onClick={() => {
                                              setSelectedSupplier(supplier);
                                              setCurrentView('detail');
                                            }}
                                        >
                                          {supplier.name}
                                        </div>
                                        {supplier.Full_name && (
                                            <div className="text-sm text-gray-500">
                                              {supplier.Full_name}
                                            </div>
                                        )}
                                        {supplier.website && (
                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                              <Globe className="h-3 w-3" />
                                              {supplier.website}
                                            </div>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell style={{color:'var(--custom-text)'}}>
                                    <div>
                                      <div>ИНН: {supplier.inn || 'Не указан'}</div>
                                      {supplier.kpp && <div>КПП: {supplier.kpp}</div>}
                                    </div>
                                  </TableCell>
                                  <TableCell style={{color:'var(--custom-text)'}}>
                                    <div>
                                      <div className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {supplier.phone || 'Не указан'}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {supplier.email || 'Не указан'}
                                      </div>
                                      {primaryContact && (
                                          <div className="text-xs text-gray-500 mt-1">
                                            Контакт: {primaryContact.full_name}
                                          </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell style={{color:'var(--custom-text)'}}>
                                    <Badge style={{color:'var(--custom-text)'}} variant="outline" className='text-white'>
                                      {supplier.type || 'Не указан'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell style={{color:'var(--custom-text)'}}>
                                    <div className="max-w-xs">
                                      <div className="text-sm">
                                        {supplier.legal_adress || 'Не указан'}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell style={{color:'var(--custom-text)'}}>
                                    <div className="text-sm text-gray-500">
                                      {formatDate(supplier.update_at)}
                                    </div>
                                  </TableCell>
                                  <TableCell style={{color:'var(--custom-text)'}}>
                                    <Badge className={
                                      supplier.egais ? "bg-green-100 text-green-800" :
                                          supplier.honest_sign ? "bg-blue-100 text-blue-800" :
                                              "bg-gray-100 text-gray-800"
                                    }>
                                      {supplier.egais ? "ЕГАИС" :
                                          supplier.honest_sign ? "Честный знак" : "Обычный"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell style={{color:'var(--custom-text)'}}>
                                    <div className="flex gap-2">
                                      <Button variant="outline" size="sm">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Таб контактных лиц */}
            <TabsContent value="contacts">
              <Card style={{
                borderRadius: '20px',
                border: 'var(--custom-border-primary)',
                background: 'var(--custom-bg-secondaryLineCard)',
                color: 'var(--custom-text)',
              }}>
                <CardHeader>
                  <CardTitle style={{color:'var(--custom-text)'}} className='text-white'>Контактные лица поставщиков</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredContacts.length === 0 ? (
                      <div style={{color:'var(--custom-text)'}} className="text-center py-12 text-muted-foreground">
                        Контактные лица не найдены
                      </div>
                  ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead style={{color:'rgb(101,125,156)'}}>ФИО</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Компания</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Должность</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Телефон</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Email</TableHead>
                            <TableHead style={{color:'rgb(101,125,156)'}}>Основной</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className='text-white'>
                          {filteredContacts.map((contact) => {
                            const supplier = suppliers.find(s => s.id === contact.counterparty_id);
                            return (
                                <TableRow key={contact.id}>
                                  <TableCell style={{color:'var(--custom-text)'}}>
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-gray-500" />
                                      {contact.full_name}
                                    </div>
                                  </TableCell>
                                  <TableCell style={{color:'var(--custom-text)'}}>
                                    {supplier ? (
                                        <div>
                                          <div className="font-medium">{supplier.name}</div>
                                          <div className="text-sm text-gray-500">
                                            ИНН: {supplier.inn || 'Не указан'}
                                          </div>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">Не указан</span>
                                    )}
                                  </TableCell>
                                  <TableCell style={{color:'var(--custom-text)'}}>{contact.position || 'Не указана'}</TableCell>
                                  <TableCell style={{color:'var(--custom-text)'}}>
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {contact.phone || 'Не указан'}
                                    </div>
                                  </TableCell>
                                  <TableCell style={{color:'var(--custom-text)'}}>
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {contact.email || 'Не указан'}
                                    </div>
                                  </TableCell>
                                  <TableCell style={{color:'var(--custom-text)'}}>
                                    {contact.is_primary ? (
                                        <Badge className="bg-green-100 text-green-800">Основной</Badge>
                                    ) : (
                                        <Badge variant="outline">Дополнительный</Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
  );
};