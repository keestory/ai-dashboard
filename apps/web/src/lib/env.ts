/**
 * Environment variable validation and access
 * This file centralizes all environment variable handling for better security
 */

const requiredServerVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ANTHROPIC_API_KEY',
] as const;

const requiredClientVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_URL',
] as const;

const optionalVars = [
  'NEXT_PUBLIC_APP_NAME',
  'VERCEL_URL',
] as const;

type RequiredServerVar = (typeof requiredServerVars)[number];
type RequiredClientVar = (typeof requiredClientVars)[number];

/**
 * Validates that all required environment variables are set
 * Call this at app startup (e.g., in instrumentation.ts)
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const varName of requiredServerVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Server-side environment variables
 * Only use in server components or API routes
 */
export const serverEnv = {
  get supabaseUrl(): string {
    const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!value) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
    return value;
  },
  get supabaseAnonKey(): string {
    const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!value) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    return value;
  },
  get supabaseServiceRoleKey(): string {
    const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!value) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    return value;
  },
  get anthropicApiKey(): string {
    const value = process.env.ANTHROPIC_API_KEY;
    if (!value) throw new Error('ANTHROPIC_API_KEY is not set');
    return value;
  },
  get appUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  },
  get appName(): string {
    return process.env.NEXT_PUBLIC_APP_NAME || 'InsightFlow';
  },
  get vercelUrl(): string | undefined {
    return process.env.VERCEL_URL;
  },
  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  },
  get isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  },
};

/**
 * Client-side environment variables (NEXT_PUBLIC_ prefix)
 * Safe to use in client components
 */
export const clientEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'InsightFlow',
};

/**
 * Utility to check and warn about missing optional variables
 * Use in development for debugging
 */
export function warnMissingOptional(): void {
  if (process.env.NODE_ENV !== 'development') return;

  for (const varName of optionalVars) {
    if (!process.env[varName]) {
      console.warn(`[env] Optional variable ${varName} is not set`);
    }
  }
}

/**
 * Mask sensitive values for logging
 */
export function maskSensitiveValue(value: string): string {
  if (value.length <= 8) return '****';
  return value.slice(0, 4) + '****' + value.slice(-4);
}
