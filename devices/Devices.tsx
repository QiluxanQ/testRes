import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Monitor, Smartphone, Tablet, Wifi, WifiOff, Plus, Edit2, Trash2, X, Check, Clock, Download, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet' | 'pos' | 'pos_cashier' | 'waiter_tablet' | 'manager_pc' | 'kitchen_printer';
  lastActivity: Date;
  status: 'online' | 'offline';
  ipAddress: string;
  browser?: string;
}

interface ActivationLog {
  id: string;
  deviceName: string;
  action: 'activated' | 'deactivated' | 'renamed';
  timestamp: Date;
  details: string;
}

const deviceTypes = [
  { value: 'pos', label: 'POS-терминал', icon: Monitor },
  { value: 'pos_cashier', label: 'Кассовое место POS-терминал', icon: Monitor },
  { value: 'waiter_tablet', label: 'Планшет официанта', icon: Tablet },
  { value: 'manager_pc', label: 'Компьютер менеджера', icon: Monitor },
  { value: 'kitchen_printer', label: 'Кухонный принтер', icon: Printer },
];

export function Devices() {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'Главная касса',
      type: 'pos',
      lastActivity: new Date(Date.now() - 2 * 60 * 1000), // 2 минуты назад
      status: 'online',
      ipAddress: '192.168.1.101',
      browser: 'Chrome 120'
    },
    {
      id: '2',
      name: 'Офис - MacBook Pro',
      type: 'desktop',
      lastActivity: new Date(Date.now() - 3 * 60 * 1000), // 3 минуты назад
      status: 'online',
      ipAddress: '192.168.1.105',
      browser: 'Safari 17'
    },
    {
      id: '3',
      name: 'iPhone менеджера',
      type: 'mobile',
      lastActivity: new Date(Date.now() - 15 * 60 * 1000), // 15 минут назад
      status: 'offline',
      ipAddress: '192.168.1.120',
      browser: 'Mobile Safari'
    },
    {
      id: '4',
      name: 'Планшет официанта #1',
      type: 'tablet',
      lastActivity: new Date(Date.now() - 1 * 60 * 1000), // 1 минута назад
      status: 'online',
      ipAddress: '192.168.1.130',
      browser: 'Chrome Mobile'
    },
  ]);

  const [activationLogs, setActivationLogs] = useState<ActivationLog[]>([
    {
      id: '1',
      deviceName: 'Главная касса',
      action: 'activated',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      details: 'Устройство активировано с IP 192.168.1.101'
    },
    {
      id: '2',
      deviceName: 'iPhone менеджера',
      action: 'renamed',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      details: 'Переименовано с "iPhone" на "iPhone менеджера"'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('pos');
  const [activationCode, setActivationCode] = useState('');
  const [codeExpiryTime, setCodeExpiryTime] = useState(300); // 5 минут в секундах
  const [showHistory, setShowHistory] = useState(false);
  
  // Настройки принтера
  const [printerIpAddress, setPrinterIpAddress] = useState('');
  const [printerFontSize, setPrinterFontSize] = useState('12');
  const [printerPaperWidth, setPrinterPaperWidth] = useState('80');

  // Обновление статусов устройств каждую минуту
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prevDevices =>
        prevDevices.map(device => {
          const minutesSinceActivity = (Date.now() - device.lastActivity.getTime()) / (1000 * 60);
          return {
            ...device,
            status: minutesSinceActivity < 5 ? 'online' : 'offline'
          };
        })
      );
    }, 60000); // Каждую минуту

    return () => clearInterval(interval);
  }, []);

  // Таймер для кода активации
  useEffect(() => {
    if (showAddModal && codeExpiryTime > 0) {
      const timer = setInterval(() => {
        setCodeExpiryTime(prev => {
          if (prev <= 1) {
            generateActivationCode();
            return 300;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showAddModal, codeExpiryTime]);

  const generateActivationCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setActivationCode(code);
    setCodeExpiryTime(300);
  };

  const handleAddDevice = () => {
    generateActivationCode();
    setSelectedDeviceType('pos');
    setNewDeviceName('');
    setPrinterIpAddress('');
    setPrinterFontSize('12');
    setPrinterPaperWidth('80');
    setShowAddModal(true);
  };

  const handleRenameDevice = (device: Device) => {
    setSelectedDevice(device);
    setNewDeviceName(device.name);
    setShowRenameModal(true);
  };

  const confirmRename = () => {
    if (selectedDevice && newDeviceName.trim()) {
      setDevices(prevDevices =>
        prevDevices.map(d =>
          d.id === selectedDevice.id ? { ...d, name: newDeviceName } : d
        )
      );

      setActivationLogs(prev => [{
        id: Date.now().toString(),
        deviceName: selectedDevice.name,
        action: 'renamed',
        timestamp: new Date(),
        details: `Переименовано с "${selectedDevice.name}" на "${newDeviceName}"`
      }, ...prev]);

      setShowRenameModal(false);
      setSelectedDevice(null);
      setNewDeviceName('');
    }
  };

  const handleDisconnectDevice = (device: Device) => {
    if (window.confirm(`Вы уверены, что хотите отключить устройство "${device.name}"?`)) {
      setDevices(prevDevices => prevDevices.filter(d => d.id !== device.id));

      setActivationLogs(prev => [{
        id: Date.now().toString(),
        deviceName: device.name,
        action: 'deactivated',
        timestamp: new Date(),
        details: `Устройство отключено (IP: ${device.ipAddress})`
      }, ...prev]);
    }
  };

  const getDeviceIcon = (type: Device['type']) => {
    const deviceType = deviceTypes.find(dt => dt.value === type);
    return deviceType ? <deviceType.icon style={{ width: '16px', height: '16px' }} /> : <Monitor style={{ width: '16px', height: '16px' }} />;
  };

  const getDeviceTypeName = (type: Device['type']) => {
    const deviceType = deviceTypes.find(dt => dt.value === type);
    return deviceType ? deviceType.label : 'Неизвестно';
  };

  const formatLastActivity = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин назад`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;
    const days = Math.floor(hours / 24);
    return `${days} дн назад`;
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('activation-qr');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `activation-code-${activationCode}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Заголовок и кнопки действи */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2  style={{ fontSize: '24px', fontWeight: '600', marginBottom: '4px',color: 'var(--custom-text)',}}>Управление устройствами</h2>
          <p style={{ color: '#717182', fontSize: '14px' }}>
            Активных устройств: {devices.filter(d => d.status === 'online').length} / {devices.length}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                padding: '8px 16px',
                background: 'var(--custom-bg-secondaryLineCard)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--custom-text)',
              }}
          >
            <Clock style={{ width: '16px', height: '16px' }} />
            {showHistory ? 'Скрыть историю' : 'Показать историю'}
          </Button>
          <Button
            onClick={handleAddDevice}
            style={{
              padding: '8px 16px',
              background: '#00a854',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Добавить устройство
          </Button>
        </div>
      </div>

      {/* Таблица устройств */}
      <Card style={{
        borderRadius: '20px',
        border: 'var(--custom-border-primary)',
        background: 'var(--custom-bg-secondaryLineCard)',
        color: 'var(--custom-text)',
      }}>
        <CardHeader>
          <CardTitle>Активные устройства</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#717182' }}>
                    ИМЯ УСТРОЙСТВА
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#717182' }}>
                    ТИП
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#717182' }}>
                    IP АДРЕС
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#717182' }}>
                    БРАУЗЕР
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#717182' }}>
                    ПОСЛЕДНЯЯ АКТИВНОСТЬ
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#717182' }}>
                    СТАТУС
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#717182' }}>
                    ДЕЙСТВИЯ
                  </th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: device.status === 'online' ? '#e6f7ed' : '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: device.status === 'online' ? '#00a854' : '#999'
                        }}>
                          {getDeviceIcon(device.type)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500', fontSize: '14px' }}>{device.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px' }}>
                      {getDeviceTypeName(device.type)}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#717182' }}>
                      {device.ipAddress}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#717182' }}>
                      {device.browser || '—'}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#717182' }}>
                      {formatLastActivity(device.lastActivity)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Badge
                        style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: device.status === 'online' ? '#e6f7ed' : '#f5f5f5',
                          color: device.status === 'online' ? '#00a854' : '#999',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {device.status === 'online' ? (
                          <Wifi style={{ width: '12px', height: '12px' }} />
                        ) : (
                          <WifiOff style={{ width: '12px', height: '12px' }} />
                        )}
                        {device.status === 'online' ? 'Онлайн' : 'Оффлайн'}
                      </Badge>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleRenameDevice(device)}
                          style={{
                            padding: '8px',
                            background: 'transparent',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#666'
                          }}
                          title="Переименовать"
                        >
                          <Edit2 style={{ width: '14px', height: '14px' }} />
                        </button>
                        <button
                          onClick={() => handleDisconnectDevice(device)}
                          style={{
                            padding: '8px',
                            background: 'transparent',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#d4183d'
                          }}
                          title="Отключить"
                        >
                          <Trash2 style={{ width: '14px', height: '14px' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* История активаций */}
      {showHistory && (
        <Card style={{
          borderRadius: '20px',
          border: 'var(--custom-border-primary)',
          background: 'var(--custom-bg-secondaryLineCard)',
          color: 'var(--custom-text)',
        }}>
          <CardHeader>
            <CardTitle>История активаций</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activationLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '16px',
                    background: '#f9f9f9',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background:
                        log.action === 'activated' ? '#00a854' :
                        log.action === 'deactivated' ? '#d4183d' :
                        '#f0b100',
                      color: 'var(--custom-text)',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px', color: 'var(--custom-text)'}}>
                      <p style={{ color: 'var(--custom-text)' }}>
                        {log.deviceName}
                      </p>
                    </div>
                    <div style={{ fontSize: '13px', color: '#717182' }}>
                      {log.details}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', whiteSpace: 'nowrap' }}>
                    {log.timestamp.toLocaleString('ru-RU')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Модальное окно добавления устройства */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                Добавить устройство
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#666'
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: '#717182', fontSize: '14px', marginBottom: '16px' }}>
                {selectedDeviceType === 'kitchen_printer' 
                  ? 'Укажите настройки кухонного принтера для подключения к системе.'
                  : 'Используйте этот код активации для подключения нового устройства к системе.'}
              </p>

              {/* Выбор типа устройства */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Тип устройства
                </label>
                <select
                  value={selectedDeviceType}
                  onChange={(e) => setSelectedDeviceType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    background: 'white'
                  }}
                >
                  {deviceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDeviceType === 'kitchen_printer' ? (
                // Настройки принтера
                <>
                  {/* Имя принтера */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      Имя принтера
                    </label>
                    <input
                      type="text"
                      value={newDeviceName}
                      onChange={(e) => setNewDeviceName(e.target.value)}
                      placeholder="Например: Кухонный принтер #1"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* IP адрес */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      IP адрес принтера
                    </label>
                    <input
                      type="text"
                      value={printerIpAddress}
                      onChange={(e) => setPrinterIpAddress(e.target.value)}
                      placeholder="192.168.1.100"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>

                  {/* Размер шрифта */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      Размер шрифта (pt)
                    </label>
                    <select
                      value={printerFontSize}
                      onChange={(e) => setPrinterFontSize(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                        background: 'white'
                      }}
                    >
                      <option value="8">8 pt (Очень мелкий)</option>
                      <option value="10">10 pt (Мелкий)</option>
                      <option value="12">12 pt (Стандартный)</option>
                      <option value="14">14 pt (Средний)</option>
                      <option value="16">16 pt (Крупный)</option>
                      <option value="18">18 pt (Очень крупный)</option>
                    </select>
                  </div>

                  {/* Ширина ленты */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      Ширина ленты (мм)
                    </label>
                    <select
                      value={printerPaperWidth}
                      onChange={(e) => setPrinterPaperWidth(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                        background: 'white'
                      }}
                    >
                      <option value="58">58 мм</option>
                      <option value="80">80 мм (Стандарт)</option>
                      <option value="110">110 мм</option>
                    </select>
                  </div>

                  {/* Информация о настройках */}
                  <div
                    style={{
                      background: '#f0f8ff',
                      border: '1px solid #b3d9ff',
                      borderRadius: '8px',
                      padding: '16px'
                    }}
                  >
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Printer style={{ width: '16px', height: '16px' }} />
                      Информация о подключении
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#555' }}>
                      <li style={{ marginBottom: '8px' }}>Принтер должен быть подключен к локальной сети</li>
                      <li style={{ marginBottom: '8px' }}>Проверьте, что IP адрес доступен и не занят другим устройством</li>
                      <li style={{ marginBottom: '8px' }}>Рекомендуется назначить статический IP адрес принтеру</li>
                      <li>После сохранения будет выполнена тестовая печать</li>
                    </ul>
                  </div>
                </>
              ) : (
                // Код активации для обычных устройств
                <>
                  {/* Таймер */}
                  <div
                    style={{
                      background: codeExpiryTime < 60 ? '#fff3cd' : '#e6f7ed',
                      border: `1px solid ${codeExpiryTime < 60 ? '#ffc107' : '#00a854'}`,
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Clock
                      style={{
                        width: '16px',
                        height: '16px',
                        color: codeExpiryTime < 60 ? '#ffc107' : '#00a854'
                      }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                      Код действителен: {formatTimer(codeExpiryTime)}
                    </span>
                  </div>

                  {/* Код активации */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      Код активации
                    </label>
                    <div
                      style={{
                        background: '#f9f9f9',
                        border: '2px dashed #00a854',
                        borderRadius: '8px',
                        padding: '20px',
                        textAlign: 'center'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '32px',
                          fontWeight: 'bold',
                          letterSpacing: '4px',
                          color: '#00a854',
                          fontFamily: 'monospace'
                        }}
                      >
                        {activationCode}
                      </div>
                    </div>
                  </div>

                  {/* QR-код */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      QR-код для быстрой активации
                    </label>
                    <div
                      style={{
                        background: '#f9f9f9',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '8px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px'
                      }}
                    >
                      <QRCodeSVG
                        id="activation-qr"
                        value={`RESTAURANT_CRM_ACTIVATION:${activationCode}`}
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                      <Button
                        onClick={downloadQRCode}
                        style={{
                          padding: '8px 16px',
                          background: 'white',
                          border: '1px solid rgba(0,0,0,0.1)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Download style={{ width: '16px', height: '16px' }} />
                        Скачать QR-код
                      </Button>
                    </div>
                  </div>

                  {/* Инструкция */}
                  <div
                    style={{
                      background: '#f0f8ff',
                      border: '1px solid #b3d9ff',
                      borderRadius: '8px',
                      padding: '16px'
                    }}
                  >
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', margin: 0 }}>
                      Инструкция по активации
                    </h4>
                    <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#555' }}>
                      <li style={{ marginBottom: '8px' }}>Откройте приложение на новом устройстве</li>
                      <li style={{ marginBottom: '8px' }}>Выберите "Добавить устройство" или "Активировать"</li>
                      <li style={{ marginBottom: '8px' }}>Введите код активации или отсканируйте QR-код</li>
                      <li>Дождитесь подтверждения подключения</li>
                    </ol>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              {selectedDeviceType === 'kitchen_printer' ? (
                <>
                  <Button
                    onClick={() => setShowAddModal(false)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: 'white',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={() => {
                      if (newDeviceName.trim() && printerIpAddress.trim()) {
                        // Добавить принтер
                        const newPrinter: Device = {
                          id: Date.now().toString(),
                          name: newDeviceName,
                          type: 'kitchen_printer',
                          lastActivity: new Date(),
                          status: 'online',
                          ipAddress: printerIpAddress,
                          browser: `Шрифт: ${printerFontSize}pt, Лента: ${printerPaperWidth}мм`
                        };
                        setDevices([...devices, newPrinter]);
                        setActivationLogs([{
                          id: Date.now().toString(),
                          deviceName: newDeviceName,
                          action: 'activated',
                          timestamp: new Date(),
                          details: `Принтер добавлен (IP: ${printerIpAddress}, Шрифт: ${printerFontSize}pt, Лента: ${printerPaperWidth}мм)`
                        }, ...activationLogs]);
                        
                        // Сбросить форму
                        setShowAddModal(false);
                        setNewDeviceName('');
                        setPrinterIpAddress('');
                        setPrinterFontSize('12');
                        setPrinterPaperWidth('80');
                        
                        alert('Принтер успешно добавлен! Выполняется тестовая печать...');
                      }
                    }}
                    disabled={!newDeviceName.trim() || !printerIpAddress.trim()}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: (newDeviceName.trim() && printerIpAddress.trim()) ? '#00a854' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: (newDeviceName.trim() && printerIpAddress.trim()) ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Check style={{ width: '16px', height: '16px' }} />
                    Сохранить и подключить
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: '#00a854',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Готово
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно переименования */}
      {showRenameModal && selectedDevice && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowRenameModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '400px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                Переименовать устройство
              </h3>
              <button
                onClick={() => setShowRenameModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#666'
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}
              >
                Новое имя устройства
              </label>
              <input
                type="text"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder="Введите новое имя"
                autoFocus
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    confirmRename();
                  }
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                onClick={() => setShowRenameModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Отмена
              </Button>
              <Button
                onClick={confirmRename}
                disabled={!newDeviceName.trim()}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: newDeviceName.trim() ? '#00a854' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: newDeviceName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Check style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}