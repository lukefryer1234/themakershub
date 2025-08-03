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

  getSettings: () => Promise<{ electricityCost?: string; printerPower?: string }>;
  setSettings: (settings: { electricityCost: string; printerPower: string }) => Promise<void>;
  generateCalibrationGCode: (options: {
    testModel: string;
    slicerSetting: string;
    startValue: string;
    endValue: string;
    stepValue: string;
  }) => Promise<string>;
  login: () => Promise<{ name: string }>;
  logout: () => Promise<null>;
  getCommunityProfiles: () => Promise<any[]>;
  addCommunityProfile: (profile: any) => Promise<any>;
  rateCommunityProfile: (options: { id: number; rating: 'up' | 'down' }) => Promise<any>;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
