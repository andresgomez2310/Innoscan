import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { IsString, IsOptional } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { FlyweightService } from '../shared/flyweight/flyweight.service';
import { ScanEventsService } from '../shared/observer/scan-events.service';

export class GenerateRecommendationsDto {
  @IsOptional() @IsString() scanId?: string;
  @IsOptional() @IsString() transformationTypeId?: string;
  @IsOptional() @IsString() itemName?: string;
  @IsOptional() @IsString() imageBase64?: string; 
}

@Injectable()
export class RecommendationsService {
  
  private readonly STRATEGY_MAP: Record<string, { name: string; instruction: string }> = {
    "1": { name: "Reutilizar", instruction: "reutilizarlo de forma creativa" },
    "2": { name: "Transformar", instruction: "hacer un proyecto de upcycling" },
    "3": { name: "Reconfigurar", instruction: "desarmarlo para usar sus componentes" }
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly flyweight: FlyweightService,
    private readonly events: ScanEventsService,
  ) {}

  async generate(dto: GenerateRecommendationsDto) {
    console.log(`--- GENERANDO RECOMENDACIÓN LOCAL (Llama 3.2 Vision) ---`);
    
    if (!dto.imageBase64) throw new BadRequestException('Imagen requerida');

    const estrategiaInfo = this.STRATEGY_MAP[dto.transformationTypeId ?? "1"] || this.STRATEGY_MAP["1"];

    try {
      // 1. Notificar progreso vía Observer
      this.events.notifyRecsPartial({ 
        scanId: dto.scanId || 'temp', 
        progress: 25, 
        message: `IA local analizando imagen para: ${estrategiaInfo.name}...` 
      });

      // 2. Llamada a Ollama Local
      const rawResponse = await this.askOllamaLocal(dto.itemName || 'objeto', dto.imageBase64, estrategiaInfo.instruction);
      console.log("Respuesta IA:", rawResponse);

      // 3. Limpieza de respuesta (evita textos vacíos o raros)
      let descripcionFinal = rawResponse.replace(/[{}"\n\r]/g, '').trim();
      
      if (descripcionFinal.length < 5) {
        descripcionFinal = `Para ${estrategiaInfo.name} este objeto, intenta buscar tutoriales de economía circular para darle una segunda vida útil.`;
      }

      return {
        id: 'local-' + Date.now(),
        productoNombre: dto.itemName || 'Objeto Detectado',
        recommendations: [{ 
          title: `Estrategia de ${estrategiaInfo.name}`, 
          description: descripcionFinal, 
          confidence: 99, 
          effort: 'calculado' 
        }],
      };

    } catch (error) {
      console.error('Error Local:', error.message);
      throw new InternalServerErrorException('Error en IA Local: ' + error.message);
    }
  }

  private async askOllamaLocal(itemName: string, imageBase64: string, instruccion: string) {
    const url = "http://innoscan-ollama:11434/api/generate";
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const payload = {
      model: "llava",
      prompt: `
Eres un asistente experto en economía circular, reutilización, upcycling y diseño sostenible.

Observa la imagen y genera UNA recomendación útil para ${instruccion}.

Reglas:
- No describas solamente el objeto.
- No digas frases genéricas como "agua cristal" o "objeto detectado".
- Da una idea práctica, creativa y realizable.
- Responde en español.
- Máximo 3 frases.
- Incluye qué se puede hacer y para qué serviría.

Objeto indicado por el usuario: ${itemName}

Respuesta:
`,
      stream: false,
      images: [base64Data],
      options: {
        num_predict: 60,
        temperature: 0.1,
        num_ctx: 1024,
        top_k: 1,
        top_p: 1
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      return data.response || "";
    } catch (err) {
      return "";
    }
  }

  async findAll(transformationTypeId?: string, scanId?: string) {
    return this.prisma.recommendationResult.findMany({
      where: { ...(scanId && { scanId }) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const r = await this.prisma.recommendationResult.findUnique({ where: { id } });
    if (!r) throw new NotFoundException(`No encontrado`);
    return r;
  }
}