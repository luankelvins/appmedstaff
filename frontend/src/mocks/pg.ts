// Mock da biblioteca pg para uso no frontend

export class Pool {
  constructor(config?: any) {
    console.warn('PostgreSQL Pool mock initialized in browser');
  }

  async query(text: string, params?: any[]) {
    console.warn('PostgreSQL query mock called:', text, params);
    return { rows: [], rowCount: 0 };
  }

  async connect() {
    console.warn('PostgreSQL connect mock called');
    return {
      query: this.query,
      release: () => console.warn('PostgreSQL release mock called')
    };
  }

  async end() {
    console.warn('PostgreSQL end mock called');
  }
}

export default { Pool };