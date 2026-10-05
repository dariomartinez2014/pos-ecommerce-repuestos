// Envía solicitudes a la pasarela del curso con la clave privada; normaliza barras y limita el tiempo de espera.

import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// normaliza únicamente el path, conservando https://.
// Usa URL y normaliza únicamente pathname; conserva https:// y evita el doble slash del proveedor.
export function singleSlash(value: string): string {
  const url = new URL(value);
  url.pathname = url.pathname.replace(/\/{2,}/g, '/');
  return url.toString();
}

@Injectable()
export class MockPayClient {
  
  constructor(private readonly config: ConfigService) {}
  // Construye la URL, agrega Bearer privado, llama fetch con timeout y convierte fallos externos a un error seguro.
  async request(path: string, body?: unknown): Promise<any> {
    const key = this.config.get<string>('MOCKPAY_SECRET_KEY');
    if (!key) throw new ServiceUnavailableException('Configura MOCKPAY_SECRET_KEY en el backend');
    const base = this.config.get<string>('MOCKPAY_API_URL', 'https://mockpay-backend.onrender.com');
    const url = singleSlash(base.replace(/\/+$/, '') + '/api/v1/' + path.replace(/^\/+/, ''));
    try {
      // el secreto no aparece en respuestas ni en logs.
      const response = await fetch(url, { method: body ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('Respuesta externa inválida');
      return await response.json();
    } catch { throw new BadGatewayException('No se pudo confirmar la respuesta de MockPay; sincroniza antes de reintentar un cobro'); }
  }
  // Crea o recupera un intento sin duplicarlo; llama MockPay fuera de la transacción y guarda su URL normalizada.
  create(amount: number, metadata: Record<string, string>) { return this.request('payments', { amount, currency: 'GTQ', metadata }); }
  // Busca el registro solicitado y responde con los campos permitidos.
  get(id: string) { return this.request('payments/' + encodeURIComponent(id)); }
  // solo tarjetas ficticias del curso, normalizadas sin espacios.
  // Envía una tarjeta fija de prueba según el escenario; sus números se envían sin espacios.
  processDemo(id: string, scenario: 'SUCCESS' | 'INSUFFICIENT_FUNDS' | 'DECLINED') {
    const numbers = { SUCCESS: '4242424242424242', INSUFFICIENT_FUNDS: '4000000000000002', DECLINED: '5555555555554444' };
    return this.request('payments/' + encodeURIComponent(id) + '/process', { cardNumber: numbers[scenario], expiry: '12/30', cvc: '123', cardholderName: 'Cliente Demo', phone: '5555-0101', address: 'Dirección ficticia de prueba', zip: '01001' });
  }
}
