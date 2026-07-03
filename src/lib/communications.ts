export interface CommunicationLog {
  id: string;
  eventId: string;
  subject: string;
  message: string;
  sentAt: string;
  recipientCount: number;
  openRate?: number;
}
