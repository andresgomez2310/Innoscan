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

      return {
        id: 'local-' + Date.now(),
        productoNombre: dto.itemName || 'Objeto detectado',
        strategyName: estrategiaInfo.name,
        recommendations: [
          {
            title: `Idea para ${estrategiaInfo.name}`,
            description: descripcionFinal,
            confidence: 92,
            effort: 'medio',
          },
        ],
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

Analiza la imagen del objeto. El usuario dice que el objeto es: "${itemName}".

Tu tarea es generar UNA recomendación de tipo "${estrategiaNombre}".

Instrucción específica:
${instruccion}

Reglas obligatorias:
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

  async findAll(transformationTypeId?: string, scanId?: string) {
    return this.prisma.recommendationResult.findMany({
      where: {
        ...(scanId && { scanId }),
        ...(transformationTypeId && { transformationTypeId }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
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