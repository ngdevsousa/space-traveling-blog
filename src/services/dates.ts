import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (date): string =>
  format(Date.parse(date), 'dd MMM yyyy', { locale: ptBR });
