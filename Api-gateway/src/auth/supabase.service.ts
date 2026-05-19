import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient;

  onModuleInit() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY; // Acepta ambos nombres

    if (!url || !key) {
      console.error('❌ ERROR CRÍTICO: SUPABASE_URL o KEY no encontradas en el entorno.');
      console.log('Variables actuales:', { url, hasKey: !!key });
      // No lanzamos error aquí para que el contenedor no se apague
      return;
    }

    try {
      this.client = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      console.log('✅ Cliente de Supabase inicializado correctamente.');
    } catch (err) {
      console.error('❌ Error al crear el cliente de Supabase:', err.message);
    }
  }

  get supabase(): SupabaseClient {
    if (!this.client) {
      throw new Error('El cliente de Supabase no se ha inicializado. Revisa las variables de entorno.');
    }
    return this.client;
  }
}