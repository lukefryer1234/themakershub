import { ipcMain, Notification, dialog, app } from 'electron';
import { FilamentSpool, DryBox, Printer, PrintFailureLog } from './db/models';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';

const failureLogFilesPath = path.join(app.getPath('userData'), 'failure-log-files');
if (!fs.existsSync(failureLogFilesPath)) {
  fs.mkdirSync(failureLogFilesPath);
}

function saveFiles(files: string[]): string[] {
  if (!files) return [];
  try {
    return files.map((filePath) => {
      if (!filePath) return null;
      const fileName = path.basename(filePath);
      const newPath = path.join(failureLogFilesPath, fileName);
      fs.copyFileSync(filePath, newPath);
      return newPath;
    });
  } catch (error) {
    console.error('Error saving files:', error);
    return [];
  }
}

function deleteFiles(files: string[]) {
  if (!files) return;
  files.forEach((filePath) => {
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  });
}


export function registerIpcHandlers() {
  ipcMain.handle('filaments:get', async () => {
    try {
      return await FilamentSpool.findAll();
    } catch (error) {
      console.error(error);
      return [];
    }
  });

  ipcMain.handle('filaments:add', async (event, filament) => {
    try {
      return await FilamentSpool.create(filament);
    } catch (error) {
      console.error(error);
    }
  });

  ipcMain.handle('filaments:update', async (event, filament) => {
    try {
      await FilamentSpool.update(filament, { where: { id: filament.id } });
    } catch (error) {
      console.error(error);
    }
  });

  ipcMain.handle('filaments:delete', async (event, id) => {
    try {
      await FilamentSpool.destroy({ where: { id } });
    } catch (error) {
      console.error(error);
    }
  });

  ipcMain.handle('dryboxes:get', async () => {
    try {
      return await DryBox.findAll();
    } catch (error) {
      console.error(error);
      return [];
    }
  });

  ipcMain.handle('dryboxes:add', async (event, dryBox) => {
    try {
      return await DryBox.create(dryBox);
    } catch (error) {
      console.error(error);
    }
  });

  ipcMain.handle('dryboxes:update', async (event, dryBox) => {
    try {
      await DryBox.update(dryBox, { where: { id: dryBox.id } });
    } catch (error) {
      console.error(error);
    }
  });

  ipcMain.handle('dryboxes:delete', async (event, id) => {
    try {
      await DryBox.destroy({ where: { id } });
    } catch (error) {
      console.error(error);
    }
  });

  ipcMain.handle('dryboxes:recharge', async (event, id) => {
    try {
      const dryBox = await DryBox.findByPk(id);
      if (dryBox) {
        dryBox.lastRecharged = new Date();
        await dryBox.save();
        new Notification({
          title: 'Desiccant Recharged',
          body: `Desiccant in ${dryBox.name} was recharged on ${dryBox.lastRecharged.toLocaleString()}.`,
        }).show();
      }
    } catch (error) {
      console.error(error);
    }
  });

  ipcMain.handle('printers:get', async () => {
    try {
      return await Printer.findAll();
    } catch (error) {
      console.error(error);
      return [];
    }
  });

  ipcMain.handle('printers:add', async (event, printer) => {
    try {
      return await Printer.create(printer);
    } catch (error) {
      console.error(error);
    }
  });

  ipcMain.handle('printers:update', async (event, printer) => {
    try {
      await Printer.update(printer, { where: { id: printer.id } });
    } catch (error) {
      console.error(error);
    }
  });

  ipcMain.handle('printers:delete', async (event, id) => {
    try {
      await Printer.destroy({ where: { id } });
    } catch (error) {
      console.error(error);
    }
  });

  ipcMain.handle('failure-logs:get', async () => {
    try {
      return await PrintFailureLog.findAll({ include: [Printer, FilamentSpool] });
    } catch (error) {
      console.error(error);
      return [];
    }
  });

  ipcMain.handle('failure-logs:add', async (event, log) => {
    try {
      const newLog = { ...log };
      newLog.photos = saveFiles(log.photos);
      newLog.gcodeFile = saveFiles([log.gcodeFile])[0];
      newLog.stlFile = saveFiles([log.stlFile])[0];

      return await PrintFailureLog.create(newLog);
    } catch (error) {
      console.error(error);
    }
  });

  ipcMain.handle('failure-logs:update', async (event, log) => {
    try {
      await PrintFailureLog.update(log, { where: { id: log.id } });
    } catch (error) {
      console.error(error);
    }
  });

  ipcMain.handle('failure-logs:delete', async (event, id) => {
    try {
      const log = await PrintFailureLog.findByPk(id);
      if (log) {
        deleteFiles(log.photos);
        deleteFiles([log.gcodeFile, log.stlFile]);
        await log.destroy();
      }
    } catch (error) {
      console.error(error);
    }
  });

  ipcMain.handle('failure-logs:search', async (event, query) => {
    try {
      return await PrintFailureLog.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${query}%` } },
            { suspectedCauseAndNotes: { [Op.like]: `%${query}%` } },
          ],
        },
        include: [Printer, FilamentSpool],
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  });
}
