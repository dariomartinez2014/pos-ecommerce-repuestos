import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// URL: normaliza únicamente el path, conservando https://.
export function singleSlash(value: string): string {
  const url = new URL(value);
  url.pathname = url.pathname.replace(/\/{2,}/g, '/');
  return url.toString();
}
@Injectable()
export class MockPayClient {
  constructor(private readonly config: ConfigService) {}
  async request(path: string, body?: unknown): Promise<any> {
    const key = this.config.get<string>('MOCKPAY_SECRET_KEY');
    if (!key) throw new ServiceUnavailableException('Configura MOCKPAY_SECRET_KEY en el backend');
    const base = this.config.get<string>('MOCKPAY_API_URL', 'https://mockpay-backend.onrender.com');
    const url = singleSlash(base.replace(/\/+$/, '') + '/api/v1/' + path.replace(/^\/+/, ''));
    try {
      // SERVIDOR A SERVIDOR: el secreto no aparece en respuestas ni en logs.
      const response = await fetch(url, { method: body ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('Respuesta externa inválida');
      return await response.json();
    } catch { throw new BadGatewayException('No se pudo confirmar la respuesta de MockPay; sincroniza antes de reintentar un cobro'); }
  }
  create(amount: number, metadata: Record<string, string>) { return this.request('payments', { amount, currency: 'GTQ', metadata }); }
  get(id: string) { return this.request('payments/' + encodeURIComponent(id)); }
  // SANDBOX: solo tarjetas ficticias del curso, normalizadas sin espacios.
  processDemo(id: string, scenario: 'SUCCESS' | 'INSUFFICIENT_FUNDS' | 'DECLINED') {
    const numbers = { SUCCESS: '4242424242424242', INSUFFICIENT_FUNDS: '4000000000000002', DECLINED: '5555555555554444' };
    return this.request('payments/' + encodeURIComponent(id) + '/process', { cardNumber: numbers[scenario], expiry: '12/30', cvc: '123', cardholderName: 'Cliente Demo', phone: '5555-0101', address: 'Dirección ficticia de prueba', zip: '01001' });
  }
}
