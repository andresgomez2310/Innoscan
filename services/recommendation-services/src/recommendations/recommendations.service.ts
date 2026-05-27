import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { IsString, IsOptional } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { FlyweightService } from '../shared/flyweight/flyweight.service';
import { ScanEventsService } from '../shared/observer/scan-events.service';

export class GenerateRecommendationsDto {
  @IsOptional()
  @IsString()
  scanId?: string;

  @IsOptional()
  @IsString()
  transformationTypeId?: string;

  @IsOptional()
  @IsString()
  itemName?: string;

  @IsOptional()
  @IsString()
  imageBase64?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  condition?: string;
}

@Injectable()
export class RecommendationsService {
  private readonly STRATEGY_MAP: Record<
    string,
    { name: string; instruction: string }
  > = {
    '1': {
      name: 'Reutilizar',
      instruction:
        'reutilizar el objeto sin transformarlo demasiado, dándole un nuevo uso práctico',
    },
    '2': {
      name: 'Transformar',
      instruction:
        'transformar el objeto mediante upcycling en algo nuevo, útil o decorativo',
    },
    '3': {
      name: 'Reconfigurar',
      instruction:
        'desarmar o reconfigurar el objeto para aprovechar sus partes o componentes',
    },

    // Por si el frontend manda strategyKey en vez de id numérico
    reuse: {
      name: 'Reutilizar',
      instruction:
        'reutilizar el objeto sin transformarlo demasiado, dándole un nuevo uso práctico',
    },
    transform: {
      name: 'Transformar',
      instruction:
        'transformar el objeto mediante upcycling en algo nuevo, útil o decorativo',
    },
    reconfigure: {
      name: 'Reconfigurar',
      instruction:
        'desarmar o reconfigurar el objeto para aprovechar sus partes o componentes',
    },
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly flyweight: FlyweightService,
    private readonly events: ScanEventsService,
  ) {}

  async generate(dto: GenerateRecommendationsDto) {
    console.log('--- GENERANDO RECOMENDACIÓN LOCAL CON OLLAMA / LLAVA ---');

    if (!dto.imageBase64) {
      throw new BadRequestException('Imagen requerida');
    }

    const estrategiaInfo = this.resolveStrategy(dto.transformationTypeId);

    try {
      this.events.notifyRecsPartial({
        scanId: dto.scanId || 'temp',
        progress: 25,
        message: `IA local analizando imagen para: ${estrategiaInfo.name}...`,
      });

      const rawResponse = await this.askOllamaLocal(
        dto.itemName || 'objeto',
        dto.imageBase64,
        estrategiaInfo.name,
        estrategiaInfo.instruction,
      );

      console.log('Respuesta IA:', rawResponse);

      let descripcionFinal = rawResponse.replace(/\n{2,}/g, '\n').trim();

      if (
        descripcionFinal.length < 10 ||
        descripcionFinal.toLowerCase().includes('agua cristal') ||
        descripcionFinal.toLowerCase().includes('objeto detectado') ||
        descripcionFinal.toLowerCase().includes('no puedo')
      ) {
        descripcionFinal = `Puedes ${estrategiaInfo.instruction}. La idea es darle una segunda vida funcional al objeto, por ejemplo como elemento de almacenamiento, decoración o soporte, según su forma y material.`;
      }

      const recommendationPayload = [
  {
    title: `Idea para ${estrategiaInfo.name}`,
    description: descripcionFinal,
    confidence: 92,
    effort: 'medio',
  },
];

const db = (this.prisma as any).client;

let saved: any = null;

try {
  const { data, error } = await db
    .from('recomendaciones')
    .insert({
      escaneo_id: dto.scanId || null,
      producto_id: dto.productId || null,
      producto_nombre: dto.itemName || 'Objeto detectado',
      condicion: dto.condition || 'bueno',
      estrategia_key: dto.transformationTypeId || '1',
      estrategia_nombre: estrategiaInfo.name,
      recomendaciones: recommendationPayload,
      confianza_promedio: 92,
      procesado_en_ms: 0,
      estado: 'COMPLETADO',
      user_id: dto.userId || null,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  saved = data;
} catch (saveError: any) {
  console.warn(
    'No se pudo guardar la recomendación:',
    saveError?.message || saveError,
  );
}

return {
  id: saved?.id || 'local-' + Date.now(),
  scanId: dto.scanId,
  productoNombre: dto.itemName || 'Objeto detectado',
  strategyName: estrategiaInfo.name,
  recommendations: recommendationPayload,
  createdAt: saved?.created_at || new Date().toISOString(),
};
    } catch (error: any) {
      console.error('Error Local:', error?.message || error);

      throw new InternalServerErrorException(
        'Error en IA Local: ' + (error?.message || 'Error desconocido'),
      );
    }
  }

  private resolveStrategy(transformationTypeId?: string) {
    if (!transformationTypeId) {
      return this.STRATEGY_MAP['1'];
    }

    return this.STRATEGY_MAP[transformationTypeId] || this.STRATEGY_MAP['1'];
  }

  private async askOllamaLocal(
    itemName: string,
    imageBase64: string,
    estrategiaNombre: string,
    instruccion: string,
  ) {
    const url = 'http://innoscan-ollama:11434/api/generate';

    const base64Data = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    const payload = {
      model: 'llava',
      prompt: `
Eres un experto en economía circular, reutilización, upcycling y diseño sostenible.

Analiza visualmente la imagen. Identifica el objeto y su material principal por lo que VES en la imagen, no por lo que el usuario dice.

IMPORTANTE: En tu respuesta DEBES mencionar el material principal usando exactamente una de estas palabras: madera, plástico, metal, cartón, vidrio, electrónico, tela, orgánico.

Tu tarea es generar UNA recomendación de tipo "${estrategiaNombre}".

Instrucción específica:
${instruccion}

Reglas obligatorias:
- Identifica el material por la imagen, no por el nombre del objeto.
- No hagas una descripción publicitaria del objeto.
- No digas solamente qué objeto ves.
- No respondas con frases como "agua cristal", "botella de agua" u "objeto detectado".
- Da una idea concreta, útil y realizable.
- Explica qué se puede hacer con el objeto y para qué serviría.
- Responde en español.
- Máximo 3 frases.
- Sé creativo pero realista.

Respuesta final:
`,
      stream: false,
      images: [base64Data],
      options: {
        num_predict: 160,
        temperature: 0.45,
        num_ctx: 2048,
        top_k: 30,
        top_p: 0.9,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Ollama respondió ${response.status}: ${text}`);
    }

    const data = await response.json();

    return data.response || '';
  }

  async findAll(userId?: string, transformationTypeId?: string, scanId?: string) {
  const db = (this.prisma as any).client;
  let query = db
    .from('recomendaciones')
    .select('*')
    .order('created_at', { ascending: false });
  if (userId) {
    query = query.eq('user_id', userId);
  }
  if (transformationTypeId) {
    query = query.eq('estrategia_key', transformationTypeId);
  }
  if (scanId) {
    query = query.eq('escaneo_id', scanId);
  }
  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}
  async findOne(id: string) {
    const r = await this.prisma.recommendationResult.findUnique({
      where: {
        id,
      },
    });

    if (!r) {
      throw new NotFoundException('No encontrado');
    }

    return r;
  }
}