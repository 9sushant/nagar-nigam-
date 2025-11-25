import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || "AIzaSyCPWMJCJkslIChcYgm8TLgkb_3XH4ZjfFA"),
      'import.meta.env.VITE_API_KEY': JSON.stringify(env.API_KEY || "AIzaSyCPWMJCJkslIChcYgm8TLgkb_3XH4ZjfFA"),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
  };
});