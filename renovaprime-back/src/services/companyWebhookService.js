const {
  CompanyBilling,
  CompanyBillingWebhookEvent
} = require('../models');

const EVENT_STATUS_MAP = {
  PAYMENT_CONFIRMED: 'PAID',
  PAYMENT_RECEIVED: 'PAID',
  PAYMENT_OVERDUE: 'OVERDUE',
  PAYMENT_DELETED: 'CANCELED',
  PAYMENT_REFUNDED: 'CANCELED',
  PAYMENT_CHARGEBACK_REQUESTED: 'CANCELED'
};

class CompanyWebhookService {
  async processAsaasWebhook(payload) {
    const eventType = payload.event;
    const payment = payload.payment || {};

    const eventId = `${eventType}_${payment.id || payload.id || Date.now()}`;

    const existing = await CompanyBillingWebhookEvent.findOne({
      where: { event_id: eventId }
    });

    if (existing) {
      return { skipped: true, message: 'Event already processed' };
    }

    let billing = null;

    if (payment.id) {
      billing = await CompanyBilling.findOne({
        where: { asaas_payment_id: payment.id }
      });
    }

    if (!billing && payment.externalReference) {
      const match = String(payment.externalReference).match(/^company_billing:(\d+)$/);
      if (match) {
        billing = await CompanyBilling.findByPk(parseInt(match[1], 10));
      }
    }

    await CompanyBillingWebhookEvent.create({
      event_id: eventId,
      event_type: eventType,
      gateway: 'asaas',
      payload,
      company_billing_id: billing?.id || null,
      processed: !!billing
    });

    if (!billing) {
      return { skipped: true, message: 'No matching company billing found' };
    }

    const newStatus = EVENT_STATUS_MAP[eventType];
    if (!newStatus) {
      return { skipped: true, message: `Unhandled event type: ${eventType}` };
    }

    await billing.update({ status: newStatus });

    console.log('[asaas.webhook]', {
      billingId: billing.id,
      eventType,
      newStatus
    });

    return {
      processed: true,
      billingId: billing.id,
      newStatus
    };
  }
}

module.exports = new CompanyWebhookService();
