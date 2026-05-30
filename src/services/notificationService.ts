import { LocalNotifications } from '@capacitor/local-notifications';
import { calculatePanchang, PanchangData } from './panchangService';
import { translations, Language } from '../translations';

export interface NotificationSettings {
  enabled: boolean;
  time: string; // HH:mm format
}

const STORAGE_KEY = 'panchang_notification_settings';

export const getNotificationSettings = (): NotificationSettings => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : { enabled: false, time: '07:00' };
};

export const saveNotificationSettings = async (settings: NotificationSettings, language: Language) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  
  if (settings.enabled) {
    await scheduleDailyNotifications(settings.time, language);
  } else {
    await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
  }
};

export const scheduleDailyNotifications = async (timeStr: string, language: Language) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const t = translations[language];

  // Request permission
  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== 'granted') return;

  // Cancel existing
  await LocalNotifications.cancel({ notifications: [{ id: 1 }] });

  // Get today's panchang for the notification content
  // Note: In a real app, we might want to fetch this dynamically or schedule multiple days
  // For simplicity, we'll use today's data as a template or generic message if data isn't ready
  // Using default location for notification template
  const panchang = calculatePanchang(new Date(), 30.3165, 78.0322, 435);

  const title = t.appName;
  const body = panchang 
    ? `${t.selectedDate}: ${panchang.tithi.name}, ${panchang.vara}, ${panchang.nakshatra.name}`
    : t.notificationDesc;

  await LocalNotifications.schedule({
    notifications: [
      {
        title,
        body,
        id: 1,
        schedule: {
          allowWhileIdle: true,
          every: 'day',
          on: {
            hour: hours,
            minute: minutes
          }
        },
        sound: 'default',
        attachments: [],
        actionTypeId: '',
        extra: null
      }
    ]
  });
};
