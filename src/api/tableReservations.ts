import client from './client';
import { TableReservation } from '../types';

export interface CreateTableReservationInput {
  eventId: string;
  partySize: number;
  tableFee: number;
}

export const getTableReservations = async (eventId?: string): Promise<TableReservation[]> => {
  const { data } = await client.get<{ reservations: TableReservation[] }>('/table-reservations', {
    params: eventId ? { eventId } : undefined,
  });
  return data.reservations ?? [];
};

export const createTableReservation = async (input: CreateTableReservationInput): Promise<TableReservation> => {
  const { data } = await client.post<{ reservation: TableReservation }>('/table-reservations', input);
  return data.reservation;
};

export const splitAndPayTableReservation = async (id: string): Promise<TableReservation> => {
  const { data } = await client.post<{ reservation: TableReservation }>(`/table-reservations/${id}/split-pay`);
  return data.reservation;
};

export const updateReserverCoveredCount = async (id: string, count: number): Promise<TableReservation> => {
  const { data } = await client.patch<{ reservation: TableReservation }>(`/table-reservations/${id}`, {
    reserverCoveredCount: count,
  });
  return data.reservation;
};
