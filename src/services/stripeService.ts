import axios from 'axios';
import Config from 'react-native-config';

export const createPaymentIntent = async (
  amountInPesos: number,
  jwtToken: string
): Promise<string> => {
  // Send pesos directly — backend PaymentService handles * 100 conversion
  const response = await axios.post(
    `${Config.BACKEND_URL}/api/payment/create-intent`,
    { amount: amountInPesos },
    { headers: { Authorization: `Bearer ${jwtToken}` } }
  );

  return response.data.clientSecret;
};

export const confirmPayment = async (
  orderId: number,
  paymentMethod: 'cod' | 'stripe',
  jwtToken: string,
  paymentIntentId?: string
): Promise<{ success: boolean; status: string }> => {
  const response = await axios.post(
    `${Config.BACKEND_URL}/api/payment/confirm`,
    {
      orderId,
      paymentMethod,
      ...(paymentIntentId ? { paymentIntentId } : {}),
    },
    { headers: { Authorization: `Bearer ${jwtToken}` } }
  );

  return response.data;
};