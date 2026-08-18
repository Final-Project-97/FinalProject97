export function mapGroqError(error) {
  const status = error?.status;
  const code = error?.error?.error?.code ?? error?.code;

  if (status === 429 || code === 'rate_limit_exceeded') {
    return {
      httpStatus: 503,
      body: {
        success: false,
        code: 'AI_RATE_LIMIT',
        message: 'Layanan AI sibuk. Coba lagi dalam beberapa detik.',
        retryAfterSec: 10,
      },
    };
  }

  if (status === 404 || code === 'model_not_found') {
    return {
      httpStatus: 503,
      body: {
        success: false,
        code: 'AI_MODEL_UNAVAILABLE',
        message: 'Model AI tidak tersedia.',
      },
    };
  }

  return {
    httpStatus: 500,
    body: {
      success: false,
      code: 'AI_ERROR',
      message: 'Gagal memproses permintaan AI.',
    },
  };
}