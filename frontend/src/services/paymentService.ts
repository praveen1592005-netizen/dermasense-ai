import { MembershipPlanId } from '../types/membership';
import { apiClient } from './apiClient';

export interface PaymentIntentRequest {
  planId?: MembershipPlanId;
  amount: number;
  currency: string;
  description: string;
  couponCode?: string;
  billingCycle?: 'monthly' | 'yearly';
}

export interface PaymentResult {
  status: 'success' | 'failed' | 'cancelled' | 'requires_configuration';
  transactionId?: string;
  message: string;
  gateway?: string;
  requiresConfiguration?: boolean;
  configurationNeeded?: string[];
}

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

export const paymentService = {
  /**
   * Initiates a Razorpay payment flow.
   * When VITE_RAZORPAY_KEY_ID is configured, opens the real Razorpay checkout.
   * When not configured, shows a clear configuration-required state.
   */
  async initiateCheckout(request: PaymentIntentRequest): Promise<PaymentResult> {
    // If Razorpay is not configured, return honest integration-required state
    if (!RAZORPAY_KEY_ID) {
      return {
        status: 'requires_configuration',
        message:
          'Payment gateway is not yet configured. To enable real payments, add your Razorpay Key ID to the environment configuration.',
        requiresConfiguration: true,
        configurationNeeded: [
          'VITE_RAZORPAY_KEY_ID – Your Razorpay public API key',
          'Backend: Razorpay order creation endpoint at /api/v1/payments/create-order',
          'Backend: Webhook handler for payment verification at /api/v1/payments/verify',
        ],
        gateway: 'Razorpay',
      };
    }

    // Real Razorpay integration when key is available
    return new Promise((resolve) => {
      try {
        // Dynamically load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = async () => {
          try {
            // Get order ID from backend
            const orderRes = await apiClient.post('/payments/create-order', {
              amount_inr: request.amount
            });

            if (!orderRes.success || !orderRes.order_id) {
               throw new Error('Failed to create payment order');
            }

            const options = {
              key: RAZORPAY_KEY_ID,
              order_id: orderRes.order_id,
              amount: request.amount * 100, // Fallback (backend order dictates real amount)
              currency: request.currency || 'INR',
              name: 'DermaSense AI',
              description: request.description,
              theme: { color: '#6366f1' },
            handler: (response: any) => {
              resolve({
                status: 'success',
                transactionId: response.razorpay_payment_id,
                message: 'Payment successful. Your subscription is now active.',
                gateway: 'Razorpay',
              });
            },
            modal: {
              ondismiss: () => {
                resolve({
                  status: 'cancelled',
                  message: 'Payment was cancelled. You can retry anytime.',
                  gateway: 'Razorpay',
                });
              },
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', (response: any) => {
            resolve({
              status: 'failed',
              message: `Payment failed: ${response.error?.description || 'Unknown error'}`,
              gateway: 'Razorpay',
            });
          });
          rzp.open();
          } catch (e: any) {
            resolve({
              status: 'failed',
              message: e.message || 'Could not initialize payment.',
              gateway: 'Razorpay',
            });
          }
        };

        script.onerror = () => {
          resolve({
            status: 'failed',
            message: 'Could not load payment gateway. Please check your internet connection.',
            gateway: 'Razorpay',
          });
        };

        document.body.appendChild(script);
      } catch (err) {
        resolve({
          status: 'failed',
          message: 'An unexpected error occurred during payment initialization.',
          gateway: 'Razorpay',
        });
      }
    });
  },

  /**
   * Returns whether the payment gateway is configured.
   */
  isConfigured(): boolean {
    return Boolean(RAZORPAY_KEY_ID);
  },
};
