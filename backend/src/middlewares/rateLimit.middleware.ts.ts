import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 10, // Limita cada IP a 10 tentativas de login por janela
	standardHeaders: true,
	legacyHeaders: false,
    message: 'Muitas tentativas de login, por favor tente novamente em 15 minutos.'
});

export const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 200, // Limita cada IP a 200 requisições por janela
	standardHeaders: true,
	legacyHeaders: false,
    message: 'Muitas requisições enviadas, por favor aguarde um momento.'
});