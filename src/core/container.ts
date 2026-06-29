export interface Injectable {
  constructor: (...args: any[]) => void;
}

export type ServiceToken<T = unknown> = symbol & { __type?: T };

export class Container {
  private services = new Map<ServiceToken, unknown>();
  private factories = new Map<ServiceToken, () => unknown>();

  register<T>(token: ServiceToken<T>, instance: T): void {
    this.services.set(token, instance);
  }

  registerFactory<T>(token: ServiceToken<T>, factory: () => T): void {
    this.factories.set(token, factory);
  }

  resolve<T>(token: ServiceToken<T>): T {
    const instance = this.services.get(token) as T | undefined;
    if (instance) return instance;

    const factory = this.factories.get(token);
    if (factory) {
      const instance = factory() as T;
      this.services.set(token, instance);
      return instance;
    }

    throw new Error(`Service not registered: ${token.toString()}`);
  }

  has(token: ServiceToken): boolean {
    return this.services.has(token) || this.factories.has(token);
  }

  clear(): void {
    this.services.clear();
    this.factories.clear();
  }
}

export const container = new Container();

export function createToken<T>(name: string): ServiceToken<T> {
  return Symbol(name) as ServiceToken<T>;
}
