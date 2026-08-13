import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Os testes rodam no Node e compartilham um banco/store, por isso os arquivos
    // são serializados para manter limpeza e resultados determinísticos.
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
  },
});
