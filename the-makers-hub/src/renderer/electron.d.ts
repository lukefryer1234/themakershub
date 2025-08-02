import { FilamentSpool, DryBox, Printer, PrintFailureLog } from '../db/models';

export interface IElectronAPI {
  getFilaments: () => Promise<FilamentSpool[]>;
  addFilament: (filament: Omit<FilamentSpool, 'id'>) => Promise<FilamentSpool>;
  updateFilament: (filament: FilamentSpool) => Promise<void>;
  deleteFilament: (id: number) => Promise<void>;

  getDryBoxes: () => Promise<DryBox[]>;
  addDryBox: (dryBox: Omit<DryBox, 'id'>) => Promise<DryBox>;
  updateDryBox: (dryBox: DryBox) => Promise<void>;
  deleteDryBox: (id: number) => Promise<void>;
  rechargeDryBox: (id: number) => Promise<void>;

  getPrinters: () => Promise<Printer[]>;
  addPrinter: (printer: Omit<Printer, 'id'>) => Promise<Printer>;
  updatePrinter: (printer: Printer) => Promise<void>;
  deletePrinter: (id: number) => Promise<void>;

  getFailureLogs: () => Promise<PrintFailureLog[]>;
  addFailureLog: (log: Omit<PrintFailureLog, 'id'>) => Promise<PrintFailureLog>;
  updateFailureLog: (log: PrintFailureLog) => Promise<void>;
  deleteFailureLog: (id: number) => Promise<void>;
  searchFailureLogs: (query: string) => Promise<PrintFailureLog[]>;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
