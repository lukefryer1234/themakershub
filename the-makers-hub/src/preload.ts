import { contextBridge, ipcRenderer } from 'electron';
import { FilamentSpool, DryBox, Printer, PrintFailureLog } from './db/models';

contextBridge.exposeInMainWorld('electron', {
  getFilaments: (): Promise<FilamentSpool[]> => ipcRenderer.invoke('filaments:get'),
  addFilament: (filament: Omit<FilamentSpool, 'id'>): Promise<FilamentSpool> =>
    ipcRenderer.invoke('filaments:add', filament),
  updateFilament: (filament: FilamentSpool): Promise<void> =>
    ipcRenderer.invoke('filaments:update', filament),
  deleteFilament: (id: number): Promise<void> =>
    ipcRenderer.invoke('filaments:delete', id),

  getDryBoxes: (): Promise<DryBox[]> => ipcRenderer.invoke('dryboxes:get'),
  addDryBox: (dryBox: Omit<DryBox, 'id'>): Promise<DryBox> =>
    ipcRenderer.invoke('dryboxes:add', dryBox),
  updateDryBox: (dryBox: DryBox): Promise<void> =>
    ipcRenderer.invoke('dryboxes:update', dryBox),
  deleteDryBox: (id: number): Promise<void> =>
    ipcRenderer.invoke('dryboxes:delete', id),
  rechargeDryBox: (id: number): Promise<void> =>
    ipcRenderer.invoke('dryboxes:recharge', id),

  getPrinters: (): Promise<Printer[]> => ipcRenderer.invoke('printers:get'),
  addPrinter: (printer: Omit<Printer, 'id'>): Promise<Printer> =>
    ipcRenderer.invoke('printers:add', printer),
  updatePrinter: (printer: Printer): Promise<void> =>
    ipcRenderer.invoke('printers:update', printer),
  deletePrinter: (id: number): Promise<void> =>
    ipcRenderer.invoke('printers:delete', id),

  getFailureLogs: (): Promise<PrintFailureLog[]> => ipcRenderer.invoke('failure-logs:get'),
  addFailureLog: (log: Omit<PrintFailureLog, 'id'>): Promise<PrintFailureLog> =>
    ipcRenderer.invoke('failure-logs:add', log),
  updateFailureLog: (log: PrintFailureLog): Promise<void> =>
    ipcRenderer.invoke('failure-logs:update', log),
  deleteFailureLog: (id: number): Promise<void> =>
    ipcRenderer.invoke('failure-logs:delete', id),
  searchFailureLogs: (query: string): Promise<PrintFailureLog[]> =>
    ipcRenderer.invoke('failure-logs:search', query),
});
