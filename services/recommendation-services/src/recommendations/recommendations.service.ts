import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { IsString, IsOptional } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { FlyweightService } from '../shared/flyweight/flyweight.service';
import { ScanEventsService } from '../shared/observer/scan-events.service';

/**
 * DTO para la comunicación entre Gateway y Microservicio
 */
export class GenerateRecommendationsDto {
  @IsOptional() @IsString() scanId?: string;
  @IsOptional() @IsString() transformationTypeId?: string;
  @IsOptional() @IsString() itemName?: string;
  @IsOptional() @IsString() imageBase64?: string; 
}

@Injectable()
export class RecommendationsService {
  
  // Mapeo de IDs a instrucciones específicas para la IA
  private readonly STRATEGY_MAP: Record<string, { name: string; instruction: string }> = {
    "1": { 
      name: "Reutilizar", 
      instruction: "estrategia para REUTILIZAR el producto (mismo fin sin cambios drásticos)." 
    },
    "2": { 
      name: "Transformar", 
      instruction: "estrategia para TRANSFORMAR el producto (Upcycling/crear algo nuevo)." 
    },
    "3": { 
      name: "Reconfigurar", 
      instruction: "estrategia para RECONFIGURAR el producto (desarmar y usar piezas)." 
    }
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly flyweight: FlyweightService,
    private readonly events: ScanEventsService,
  ) {}

  async generate(dto: GenerateRecommendationsDto) {
    console.log(`--- PROCESANDO ESTRATEGIA ESPECÍFICA (${dto.transformationTypeId}) ---`);
    
    if (!dto.imageBase64) {
      throw new BadRequestException('La IA local requiere una imagen en Base64.');
    }

    const estrategiaInfo = this.STRATEGY_MAP[dto.transformationTypeId ?? "1"] || this.STRATEGY_MAP["1"];

    try {
      // 1. Notificar progreso vía Observer
      this.events.notifyRecsPartial({ 
        scanId: dto.scanId || 'temp', 
        progress: 25, 
        message: `IA analizando imagen para: ${estrategiaInfo.name}...` 
      });

      // 2. Llamada a la IA Local (Ollama)
      const rawResponse = await this.askOllama(dto.itemName || 'objeto', dto.imageBase64, estrategiaInfo.instruction);

      // 3. Procesamiento Resiliente del JSON (Maneja tildes y formato cortado)
      let descripcionFinal = "";
      try {
        const parsed = JSON.parse(rawResponse);
        // Acepta tanto "descripcion" como "descripción"
        descripcionFinal = parsed.descripcion || parsed.descripción || parsed.response;
      } catch (e) {
        // Si el JSON falla, intentamos extraer el texto entre comillas manualmente
        const match = rawResponse.match(/"descri(?:p|pc)i(?:ó|o)n"\s*:\s*"([^"]+)"/i);
        descripcionFinal = match ? match[1] : rawResponse.replace(/[{}]/g, '').trim();
      }

      // 4. Formatear para el Dashboard
      const recommendationsArray = [
        { 
          title: `Estrategia de ${estrategiaInfo.name}`, 
          description: descripcionFinal || "No se pudo generar una descripción válida.", 
          confidence: 99, 
          effort: 'calculado' 
        }
      ];

      return {
        id: 'local-' + Date.now(),
        productoNombre: dto.itemName || 'Detectado',
        recommendations: recommendationsArray,
      };

    } catch (error) {
      console.error('Error en Microservicio (Ollama):', error.message);
      throw new InternalServerErrorException('Fallo en la IA Local: ' + error.message);
    }
  }

  /**
   * Comunicación directa con el contenedor de Ollama
   */
  private async askOllama(itemName: string, imageBase64: string, instruccion: string) {
    const url = "http://innoscan-ollama:11434/api/generate";
    const base64Data = imageBase64.split(',')[1] || imageBase64;

    const payload = {
      model: "llava",
      prompt: `Analiza el producto "${itemName}". ${instruccion}. 
               Sé breve (máximo 3 frases). Responde en español. 
               Responde ÚNICAMENTE con este formato JSON: {"descripcion": "tu idea"}.`,
      stream: false,
      format: "json",
      images: [base64Data],
      options: {
        num_predict: 200, // Respuesta corta para mayor velocidad y menor consumo de RAM
        temperature: 0.3,
        num_ctx: 2048
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`Ollama Error (${response.status})`);

    const data = await response.json();
    return data.response; // Enviamos el texto bruto para procesarlo con seguridad
  }

  // --- Métodos de búsqueda ---

  async findAll(transformationTypeId?: string, scanId?: string) {
    return this.prisma.recommendationResult.findMany({
      where: { ...(scanId && { scanId }) },
      include: { scan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const r = await this.prisma.recommendationResult.findUnique({
      where: { id },
      include: { scan: { include: { category: true } } }
    });
    if (!r) throw new NotFoundException(`Resultado "${id}" no encontrado`);
    return r;
  }
}