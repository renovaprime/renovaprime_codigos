const webhookService = require('../services/webhookService');

class WebhookController {
  async handleAsaasWebhook(req, res) {
    try {
      const result = await webhookService.processAsaasWebhook(req.body);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Webhook processing error:', error.message);
      // Always return 200 to Asaas to prevent retries for application errors
      return res.status(200).json({ error: error.message });
    }
  }
}

module.exports = new WebhookController();
