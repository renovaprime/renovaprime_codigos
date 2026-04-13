import { apiClient } from './api';
import type { ApiResponse } from '../types/api';
import type { 
  DaySchedule, 
  ScheduleBlock, 
  ApiSchedule,
  ApiScheduleBlock,
  TimeInterval
} from '../types/availability';

class ScheduleService {
  /**
   * Busca agenda semanal do médico logado
   */
  async getSchedules(): Promise<DaySchedule[]> {
    try {
      const response = await apiClient.get<ApiResponse<ApiSchedule[]>>('/doctors/schedules');
      
      // Converter dados da API para formato da UI com múltiplos intervalos
      return this.convertApiSchedulesToDaySchedules(response.data);
    } catch (error: any) {
      // Se for 404 ou erro de rede, retornar agenda vazia (backend não implementado ainda)
      if (error?.response?.status === 404 || !error?.response) {
        console.warn('⚠️ Endpoint /doctors/schedules não implementado - usando agenda vazia');
        return this.getEmptyWeekSchedule();
      }
      console.error('Erro ao buscar agenda:', error);
      return this.getEmptyWeekSchedule();
    }
  }

  /**
   * Salva/atualiza agenda semanal completa
   */
  async saveSchedules(schedules: DaySchedule[]): Promise<void> {
    try {
      // Converter DaySchedule[] para formato da API (expandir intervalos)
      const apiSchedules = this.convertDaySchedulesToApiSchedules(schedules);
      
      await apiClient.post('/doctors/schedules', { schedules: apiSchedules });
    } catch (error: any) {
      // Se for 404, mostrar mensagem mais clara
      if (error?.response?.status === 404) {
        throw new Error('Endpoint de salvar agenda ainda não implementado no backend. Seus dados foram validados mas não foram salvos.');
      }
      throw error;
    }
  }

  /**
   * Lista bloqueios do médico
   */
  async getBlocks(): Promise<ScheduleBlock[]> {
    try {
      const response = await apiClient.get<ApiResponse<ApiScheduleBlock[]>>('/doctors/schedule-blocks');
      return response.data.map(block => ({
        id: block.id,
        date: block.date,
        start_time: block.start_time ? this.formatTimeToFrontend(block.start_time) : undefined,
        end_time: block.end_time ? this.formatTimeToFrontend(block.end_time) : undefined,
        reason: block.reason
      }));
    } catch (error: any) {
      // Se for 404 ou erro de rede, retornar lista vazia (backend não implementado ainda)
      if (error?.response?.status === 404 || !error?.response) {
        console.warn('⚠️ Endpoint /doctors/schedule-blocks não implementado - usando lista vazia');
        return [];
      }
      console.error('Erro ao buscar bloqueios:', error);
      return [];
    }
  }

  /**
   * Cria novo bloqueio
   */
  async createBlock(block: ScheduleBlock): Promise<ScheduleBlock> {
    try {
      const payload = {
        date: block.date,
        start_time: block.start_time ? this.formatTimeToBackend(block.start_time) : undefined,
        end_time: block.end_time ? this.formatTimeToBackend(block.end_time) : undefined,
        reason: block.reason
      };
      
      const response = await apiClient.post<ApiResponse<ApiScheduleBlock>>(
        '/doctors/schedule-blocks',
        payload
      );
      return {
        id: response.data.id,
        date: response.data.date,
        start_time: response.data.start_time ? this.formatTimeToFrontend(response.data.start_time) : undefined,
        end_time: response.data.end_time ? this.formatTimeToFrontend(response.data.end_time) : undefined,
        reason: response.data.reason
      };
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error('Endpoint de criar bloqueio ainda não implementado no backend.');
      }
      throw error;
    }
  }

  /**
   * Atualiza bloqueio existente
   */
  async updateBlock(id: number, block: ScheduleBlock): Promise<ScheduleBlock> {
    try {
      const payload = {
        date: block.date,
        start_time: block.start_time ? this.formatTimeToBackend(block.start_time) : undefined,
        end_time: block.end_time ? this.formatTimeToBackend(block.end_time) : undefined,
        reason: block.reason
      };
      
      const response = await apiClient.put<ApiResponse<ApiScheduleBlock>>(
        `/doctors/schedule-blocks/${id}`,
        payload
      );
      return {
        id: response.data.id,
        date: response.data.date,
        start_time: response.data.start_time ? this.formatTimeToFrontend(response.data.start_time) : undefined,
        end_time: response.data.end_time ? this.formatTimeToFrontend(response.data.end_time) : undefined,
        reason: response.data.reason
      };
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error('Endpoint de atualizar bloqueio ainda não implementado no backend.');
      }
      throw error;
    }
  }

  /**
   * Remove bloqueio
   */
  async deleteBlock(id: number): Promise<void> {
    try {
      await apiClient.delete(`/doctors/schedule-blocks/${id}`);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new Error('Endpoint de excluir bloqueio ainda não implementado no backend.');
      }
      throw error;
    }
  }

  /**
   * Busca slots disponíveis para preview (futura implementação)
   */
  async getAvailableSlots(startDate: string, endDate: string): Promise<any[]> {
    try {
      const response = await apiClient.get(
        `/doctors/available-slots?start=${startDate}&end=${endDate}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar slots disponíveis:', error);
      return [];
    }
  }

  // === HELPERS ===

  /**
   * Converte ApiSchedule[] em DaySchedule[] agrupando por dia
   */
  private convertApiSchedulesToDaySchedules(apiSchedules: ApiSchedule[]): DaySchedule[] {
    const weekSchedules: DaySchedule[] = this.getEmptyWeekSchedule();

    // Agrupar schedules por weekday
    apiSchedules.forEach(schedule => {
      const daySchedule = weekSchedules[schedule.weekday];
      daySchedule.enabled = true;
      daySchedule.intervals.push({
        id: crypto.randomUUID(),
        start_time: this.formatTimeToFrontend(schedule.start_time),
        end_time: this.formatTimeToFrontend(schedule.end_time)
      });
    });

    return weekSchedules;
  }

  /**
   * Converte DaySchedule[] em ApiSchedule[] expandindo intervalos
   */
  private convertDaySchedulesToApiSchedules(daySchedules: DaySchedule[]): Omit<ApiSchedule, 'id' | 'doctor_id'>[] {
    const apiSchedules: Omit<ApiSchedule, 'id' | 'doctor_id'>[] = [];

    daySchedules.forEach(day => {
      if (day.enabled && day.intervals.length > 0) {
        day.intervals.forEach(interval => {
          if (interval.start_time && interval.end_time) {
            apiSchedules.push({
              weekday: day.weekday,
              start_time: this.formatTimeToBackend(interval.start_time),
              end_time: this.formatTimeToBackend(interval.end_time)
            });
          }
        });
      }
    });

    return apiSchedules;
  }

  /**
   * Retorna agenda semanal vazia (7 dias desabilitados)
   */
  private getEmptyWeekSchedule(): DaySchedule[] {
    return Array.from({ length: 7 }, (_, index) => ({
      weekday: index,
      enabled: false,
      intervals: []
    }));
  }

  /**
   * Converte horário do backend (HH:MM:SS) para frontend (HH:MM)
   */
  private formatTimeToFrontend(time: string): string {
    if (!time) return '';
    // Remove segundos se presente
    return time.substring(0, 5);
  }

  /**
   * Converte horário do frontend (HH:MM) para backend (HH:MM:SS)
   */
  private formatTimeToBackend(time: string): string {
    if (!time) return '';
    // Adiciona segundos se não presente
    return time.length === 5 ? `${time}:00` : time;
  }
}

export const scheduleService = new ScheduleService();
