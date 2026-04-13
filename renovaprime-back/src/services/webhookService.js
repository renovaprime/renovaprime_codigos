const { ResellerSale, PaymentWebhookEvent } = require('../models');

// Maps Asaas payment/subscription event types to internal sale statuses
const EVENT_STATUS_MAP = {
  'PAYMENT_CONFIRMED': 'CONFIRMED',
  'PAYMENT_RECEIVED': 'CONFIRMED',
  'PAYMENT_APPROVED_BY_RISK_ANALYSIS': 'CONFIRMED',
  'PAYMENT_OVERDUE': 'OVERDUE',
  'PAYMENT_REFUNDED': 'REFUNDED',
  'PAYMENT_DELETED': 'CANCELED',
  'PAYMENT_REPROVED_BY_RISK_ANALYSIS': 'FAILED',
  'PAYMENT_DUNNING_RECEIVED': 'CONFIRMED',
  'PAYMENT_CHARGEBACK_REQUESTED': 'REFUNDED',
  'PAYMENT_CHARGEBACK_DISPUTE': 'REFUNDED',
};

class WebhookService {
  async processAsaasWebhook(payload) {
    const eventType = payload.event;
    const payment = payload.payment || {};

    const eventId = `${eventType}_${payment.id || payload.id || Date.now()}`;

    // Idempotency: skip if already processed
    const existing = await PaymentWebhookEvent.findOne({
      where: { event_id: eventId }
    });
    if (existing) {
      return { skipped: true, message: 'Event already processed' };
    }

    // Find the sale by gateway subscription or payment ID
    let sale = null;
    if (payment.subscription) {
      sale = await ResellerSale.findOne({
        where: { gateway_subscription_id: payment.subscription }
      });
    }
    if (!sale && payment.id) {
      sale = await ResellerSale.findOne({
        where: { gateway_payment_id: payment.id }
      });
    }

    // Record the raw event
    await PaymentWebhookEvent.create({
      event_id: eventId,
      event_type: eventType,
      gateway: 'asaas',
      payload: JSON.stringify(payload),
      sale_id: sale?.id || null,
      processed: !!sale
    });

    if (!sale) {
      return { skipped: true, message: 'No matching sale found' };
    }

    // Map event to new status
    const newStatus = EVENT_STATUS_MAP[eventType];
    if (!newStatus) {
      return { skipped: true, message: `Unhandled event type: ${eventType}` };
    }

    const updateData = { status: newStatus };

    if (newStatus === 'CONFIRMED' && !sale.confirmed_at) {
      updateData.confirmed_at = new Date();
    }

    if (payment.id && !sale.gateway_payment_id) {
      updateData.gateway_payment_id = payment.id;
    }

    await sale.update(updateData);

    return {
      processed: true,
      saleId: sale.uuid,
      newStatus
    };
  }
}

module.exports = new WebhookService();
