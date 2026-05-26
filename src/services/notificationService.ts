// src/services/notificationService.ts
import axios from 'axios';
import Config from 'react-native-config';

export async function saveFCMToken(token: string, jwtToken: string): Promise<void> {
  await axios.post(
    `${Config.BACKEND_URL}/api/user/fcm-token`,
    { fcmToken: token },
    { headers: { Authorization: `Bearer ${jwtToken}` } }
  );
}

export async function sendNotificationToTopic(
  topic: string,
  title: string,
  body: string,
  jwtToken: string,
  data?: Record<string, string>
): Promise<void> {
  await axios.post(
    `${Config.BACKEND_URL}/api/notifications/send`,
    { topic, title, body, data },
    { headers: { Authorization: `Bearer ${jwtToken}` } }
  );
}