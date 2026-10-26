/**
 * Privacy & PII Data Sanitizer
 * Automatically masks customer personally identifiable information (PII)
 * such as mobile numbers, emails, customer names, vehicle numbers, passwords,
 * database URLs, and addresses in system console logs and debug diagnostics.
 */

/**
 * Mask a phone number (e.g. "7797789682" -> "77******82", "+919876543210" -> "+91****10")
 */
export function maskPhone(phone: string | number | null | undefined): string {
  if (!phone) return '';
  const str = String(phone).trim();
  if (str.length < 5) return '***';
  if (str.length === 10) {
    return `${str.slice(0, 2)}******${str.slice(8)}`;
  }
  if (str.length > 10) {
    const keepStart = str.startsWith('+') ? 3 : 2;
    return `${str.slice(0, keepStart)}******${str.slice(-2)}`;
  }
  return `${str.slice(0, 1)}***${str.slice(-1)}`;
}

/**
 * Mask an email address (e.g. "arupmondal2802@gmail.com" -> "ar***@gmail.com")
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '';
  const str = String(email).trim();
  const atIdx = str.indexOf('@');
  if (atIdx <= 1) return '***@***';
  const name = str.slice(0, atIdx);
  const domain = str.slice(atIdx);
  const maskedName = name.length <= 2 ? `${name[0]}*` : `${name.slice(0, 2)}***`;
  return `${maskedName}${domain}`;
}

/**
 * Mask a person's full name (e.g. "Arkabrata Ghosh" -> "A*** G***")
 */
export function maskName(name: string | null | undefined): string {
  if (!name) return '';
  const str = String(name).trim();
  if (str.length <= 2) return `${str[0]}*`;
  const parts = str.split(/\s+/);
  return parts
    .map(p => (p.length > 1 ? `${p[0]}***` : `${p}*`))
    .join(' ');
}

/**
 * Mask a car registration number (e.g. "WB5178946" -> "WB****946")
 */
export function maskCarReg(reg: string | null | undefined): string {
  if (!reg) return '';
  const str = String(reg).trim();
  if (str.length <= 4) return '***';
  return `${str.slice(0, 2)}****${str.slice(-3)}`;
}

/**
 * Mask a street address
 */
export function maskAddress(address: string | null | undefined): string {
  if (!address) return '';
  const str = String(address).trim();
  if (str.length <= 6) return '[Protected Address]';
  const firstWord = str.split(/[\s,]+/)[0];
  return `${firstWord} [Protected Location]`;
}

// Regex patterns for inline string PII detection
const PHONE_PATTERN = /(\b(?:\+91|91)?[6-9]\d{9}\b)/g;
const EMAIL_PATTERN = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
const DB_URL_PATTERN = /(postgres(?:ql)?:\/\/[^\s'"]+)/gi;
const BEARER_PATTERN = /(Bearer\s+[a-zA-Z0-9_\-\.]+)/gi;

/**
 * Sanitize a string by masking any phone numbers, email addresses, database URLs, or tokens
 */
export function sanitizeString(text: string): string {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(DB_URL_PATTERN, 'postgres://[PROTECTED_DATABASE_CREDENTIALS]')
    .replace(BEARER_PATTERN, 'Bearer [PROTECTED_TOKEN]')
    .replace(EMAIL_PATTERN, (match) => maskEmail(match))
    .replace(PHONE_PATTERN, (match) => maskPhone(match));
}

// Sensitive object keys that must have their values masked
const SENSITIVE_PHONE_KEYS = new Set([
  'mobilenumber', 'customerphone', 'phone', 'user_mobile', 'mobile',
  'userphone', 'phonenumber', 'altphone', 'whatsapp'
]);

const SENSITIVE_NAME_KEYS = new Set([
  'customername', 'user_name', 'username', 'customerfirstname',
  'customerlastname', 'firstname', 'lastname', 'fullname'
]);

const SENSITIVE_EMAIL_KEYS = new Set([
  'customeremail', 'email', 'user_email', 'useremail'
]);

const SENSITIVE_ADDRESS_KEYS = new Set([
  'streetaddress', 'shippingaddress', 'address', 'shipping_address',
  'streetname', 'houseno', 'customerlatitude', 'customerlongitude',
  'latitude', 'longitude', 'lat', 'lon'
]);

const SENSITIVE_CAR_REG_KEYS = new Set([
  'carnumber', 'carregno', 'car_at_order_reg_no', 'regno', 'reg_no'
]);

const SENSITIVE_TOKEN_KEYS = new Set([
  'razorpaypaymentid', 'razorpay_payment_id', 'customersignature',
  'password', 'auth_token', 'authorization', 'token', 'secret',
  'database_url', 'databaseurl', 'connectionstring', 'apikey', 'key'
]);

/**
 * Recursively clone and mask sensitive PII in any data structure (objects, arrays, primitives)
 */
export function maskObjectPII(data: any, depth = 0): any {
  if (data === null || data === undefined) return data;
  if (depth > 6) return '[Deep Structure]';

  if (typeof data === 'string') {
    return sanitizeString(data);
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (Array.isArray(data)) {
    // If it's a large collection of items, don't dump all items to console
    if (data.length > 10) {
      return `[Private Data Collection: ${data.length} items protected]`;
    }
    return data.map(item => maskObjectPII(item, depth + 1));
  }

  if (typeof data === 'object') {
    // If Error instance, preserve message and stack but sanitize message
    if (data instanceof Error) {
      return {
        name: data.name,
        message: sanitizeString(data.message),
        stack: data.stack ? sanitizeString(data.stack) : undefined
      };
    }

    const masked: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (SENSITIVE_PHONE_KEYS.has(lowerKey)) {
        masked[key] = maskPhone(value as any);
      } else if (SENSITIVE_NAME_KEYS.has(lowerKey)) {
        masked[key] = maskName(value as any);
      } else if (SENSITIVE_EMAIL_KEYS.has(lowerKey)) {
        masked[key] = maskEmail(value as any);
      } else if (SENSITIVE_ADDRESS_KEYS.has(lowerKey)) {
        masked[key] = maskAddress(value as any);
      } else if (SENSITIVE_CAR_REG_KEYS.has(lowerKey)) {
        masked[key] = maskCarReg(value as any);
      } else if (SENSITIVE_TOKEN_KEYS.has(lowerKey)) {
        masked[key] = '[Protected Credential]';
      } else if (lowerKey === 'rawdata' || lowerKey === 'originalorderjson') {
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            masked[key] = JSON.stringify(maskObjectPII(parsed, depth + 1));
          } catch {
            masked[key] = sanitizeString(value);
          }
        } else {
          masked[key] = maskObjectPII(value, depth + 1);
        }
      } else {
        masked[key] = maskObjectPII(value, depth + 1);
      }
    }
    return masked;
  }

  return data;
}

/**
 * Installs global console interceptor that guarantees no customer PII
 * is ever dumped to the browser system console.
 */
let isConsoleSanitizerInstalled = false;

export function installConsoleSanitizer(): void {
  if (isConsoleSanitizerInstalled || typeof window === 'undefined') return;
  isConsoleSanitizerInstalled = true;

  const originalLog = console.log.bind(console);
  const originalInfo = console.info.bind(console);
  const originalWarn = console.warn.bind(console);
  const originalError = console.error.bind(console);
  const originalDebug = console.debug.bind(console);

  const sanitizeArgs = (args: any[]): any[] => {
    return args.map(arg => {
      if (typeof arg === 'string') {
        return sanitizeString(arg);
      }
      if (typeof arg === 'object' && arg !== null) {
        return maskObjectPII(arg);
      }
      return arg;
    });
  };

  const isSuppressedDebug = (firstArg: any): boolean => {
    if (typeof firstArg === 'string') {
      const lower = firstArg.toLowerCase();
      if (lower.startsWith('[debug]') || lower.includes('password') || lower.includes('token') || lower.includes('credential')) {
        return true;
      }
    }
    return false;
  };

  console.log = (...args: any[]) => {
    if (args.length > 0 && isSuppressedDebug(args[0])) {
      return;
    }
    originalLog(...sanitizeArgs(args));
  };

  console.info = (...args: any[]) => {
    if (args.length > 0 && isSuppressedDebug(args[0])) {
      return;
    }
    originalInfo(...sanitizeArgs(args));
  };

  console.warn = (...args: any[]) => {
    originalWarn(...sanitizeArgs(args));
  };

  console.error = (...args: any[]) => {
    originalError(...sanitizeArgs(args));
  };

  console.debug = (...args: any[]) => {
    // Suppress console.debug in production/console
    return;
  };

  originalLog('🔒 [Privacy Protection] Global console PII sanitizer and data masking active.');
}
