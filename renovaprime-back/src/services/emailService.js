class EmailService {
  constructor() {
    this.serviceId = process.env.EMAILJS_SERVICE_ID;
    this.templateId = process.env.EMAILJS_TEMPLATE_ID;
    this.publicKey = process.env.EMAILJS_PUBLIC_KEY;
    this.privateKey = process.env.EMAILJS_PRIVATE_KEY;
    this.apiUrl = 'https://api.emailjs.com/api/v1.0/email/send';
  }

  isConfigured() {
    return !!(this.serviceId && this.templateId && this.publicKey && this.privateKey);
  }

  async sendPasswordResetEmail({ to, name, code, expiresInMinutes = 15 }) {
    if (!this.isConfigured()) {
      console.warn('[EmailService] EmailJS nao configurado — codigo nao enviado por email');
      return false;
    }

    const payload = {
      service_id: this.serviceId,
      template_id: this.templateId,
      user_id: this.publicKey,
      accessToken: this.privateKey,
      template_params: {
        email: to,
        name: name || 'Usuário',
        code,
        expires_in: `${expiresInMinutes} minutos`
      }
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error(`[EmailService] Falha ao enviar email: ${response.status} ${body}`);
      return false;
    }

    return true;
  }
}

module.exports = new EmailService();
