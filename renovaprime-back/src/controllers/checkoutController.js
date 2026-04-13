const checkoutService = require('../services/checkoutService');
const { successResponse, errorResponse } = require('../utils/response');

class CheckoutController {
  async checkout(req, res) {
    try {
      const result = await checkoutService.processCheckout({
        ...req.body,
        remoteIp: req.ip || req.connection.remoteAddress
      });

      return res.json(successResponse(result));
    } catch (error) {
      console.error('Checkout error:', error.message);

      // Map specific errors to user-friendly messages
      const errorMessages = {
        'CPF já cadastrado no sistema': 'Este CPF já está cadastrado. Se você já é cliente, faça login.',
        'Email já cadastrado no sistema': 'Este email já está cadastrado. Se você já é cliente, faça login.',
        'Plano inválido': 'Plano selecionado não é válido.',
        'Role PACIENTE não encontrada': 'Erro de configuração do sistema. Contate o suporte.'
      };

      const message = errorMessages[error.message] || error.message || 'Erro ao processar pagamento. Tente novamente.';

      return res.status(400).json(errorResponse(message, 'CHECKOUT_ERROR'));
    }
  }
}

module.exports = new CheckoutController();
