import { ipcMain, Notification, dialog, app } from 'electron';
import { FilamentSpool, DryBox, Printer, PrintFailureLog, PrintLog } from './db/models';
import { Op } from 'sequelize';
import { GCodeParser } from 'gcode-parser';
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

function handleError(error: Error, window?: Electron.BrowserWindow) {
  console.error(error);
  if (window) {
    window.webContents.send('error', error.message);
  }
}

function createCrudHandlers<T extends { id: number }>(
  model: any,
  channel: string,
  options?: {
    add?: (event: Electron.IpcMainInvokeEvent, item: any) => Promise<any>;
    delete?: (event: Electron.IpcMainInvokeEvent, id: number) => Promise<void>;
    get?: (event: Electron.IpcMainInvokeEvent) => Promise<any[]>;
  }
) {
  ipcMain.handle(`${channel}:get`, async (event) => {
    try {
      if (options?.get) {
        return await options.get(event);
      }
      return await model.findAll();
    } catch (error) {
      handleError(error, event.sender);
      return [];
    }
  });

  ipcMain.handle(`${channel}:add`, async (event, item) => {
    try {
      if (options?.add) {
        return await options.add(event, item);
      }
      return await model.create(item);
    } catch (error) {
      handleError(error, event.sender);
    }
  });

  ipcMain.handle(`${channel}:update`, async (event, item: T) => {
    try {
      await model.update(item, { where: { id: item.id } });
    } catch (error) {
      handleError(error, event.sender);
    }
  });

  ipcMain.handle(`${channel}:delete`, async (event, id: number) => {
    try {
      if (options?.delete) {
        return await options.delete(event, id);
      }
      await model.destroy({ where: { id } });
    } catch (error) {
      handleError(error, event.sender);
    }
  });
}


export function registerIpcHandlers() {
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');

  const getNotificationInterval = () => {
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      return settings.desiccantNotificationInterval || 30;
    }
    return 30;
  };

  // Call checkDesiccant on startup
  checkDesiccant(getNotificationInterval());

  // And then every 24 hours
  setInterval(() => checkDesiccant(getNotificationInterval()), 1000 * 60 * 60 * 24);

  createCrudHandlers(FilamentSpool, 'filaments');
  createCrudHandlers(DryBox, 'dryboxes');
  createCrudHandlers(Printer, 'printers');

  createCrudHandlers(PrintLog, 'print-logs', {
    get: async (event) => {
      try {
        return await PrintLog.findAll({ include: [Printer, FilamentSpool] });
      } catch (error) {
        handleError(error, event.sender);
        return [];
      }
    },
    add: async (event, log) => {
      try {
        const newLog = { ...log };
        newLog.photos = saveFiles(log.photos);
        newLog.gcodeFile = saveFiles([log.gcodeFile])[0];
        newLog.stlFile = saveFiles([log.stlFile])[0];

        if (newLog.gcodeFile && log.filamentId) {
          const gcode = fs.readFileSync(newLog.gcodeFile, 'utf-8');
          const parser = new GCodeParser(gcode);
          const commands = parser.parse();

          let filamentLength = 0;
          commands.forEach((command) => {
            if (command.command === 'G1' && command.params.E) {
              filamentLength += command.params.E;
            }
          });

          const filament = await FilamentSpool.findByPk(log.filamentId);
          if (filament) {
            const filamentRadius = filament.diameter / 2;
            const filamentVolume = Math.PI * Math.pow(filamentRadius, 2) * filamentLength; // mm^3
            const usedWeight = (filamentVolume / 1000) * filament.density; // g

            filament.remainingWeight -= usedWeight;
            await filament.save();

            newLog.printCost = (usedWeight / filament.spoolWeight) * filament.purchasePrice;
          }
        }

        return await PrintLog.create(newLog);
      } catch (error) {
        handleError(error, event.sender);
      }
    },
    delete: async (event, id) => {
      try {
        const log = await PrintLog.findByPk(id);
        if (log) {
          deleteFiles(log.photos);
          deleteFiles([log.gcodeFile, log.stlFile]);
          await log.destroy();
        }
      } catch (error) {
        handleError(error, event.sender);
      }
    },
  });

  createCrudHandlers(PrintFailureLog, 'failure-logs', {
    get: async (event) => {
      try {
        return await PrintFailureLog.findAll({ include: [Printer, FilamentSpool] });
      } catch (error) {
        handleError(error, event.sender);
        return [];
      }
    },
    add: async (event, log) => {
      try {
        const newLog = { ...log };
        newLog.photos = saveFiles(log.photos);
        newLog.gcodeFile = saveFiles([log.gcodeFile])[0];
        newLog.stlFile = saveFiles([log.stlFile])[0];

        if (newLog.gcodeFile && log.filamentId) {
          const gcode = fs.readFileSync(newLog.gcodeFile, 'utf-8');
          const parser = new GCodeParser(gcode);
          const commands = parser.parse();

          let filamentLength = 0;
          commands.forEach((command) => {
            if (command.command === 'G1' && command.params.E) {
              filamentLength += command.params.E;
            }
          });

          const filament = await FilamentSpool.findByPk(log.filamentId);
          if (filament) {
            const filamentRadius = filament.diameter / 2;
            const filamentVolume = Math.PI * Math.pow(filamentRadius, 2) * filamentLength; // mm^3
            const usedWeight = (filamentVolume / 1000) * filament.density; // g

            filament.remainingWeight -= usedWeight;
            await filament.save();

            newLog.printCost = (usedWeight / filament.spoolWeight) * filament.purchasePrice;
          }
        }

        return await PrintFailureLog.create(newLog);
      } catch (error) {
        handleError(error, event.sender);
      }
    },
    delete: async (event, id) => {
      try {
        const log = await PrintFailureLog.findByPk(id);
        if (log) {
          deleteFiles(log.photos);
          deleteFiles([log.gcodeFile, log.stlFile]);
          await log.destroy();
        }
      } catch (error) {
        handleError(error, event.sender);
      }
    },
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
      handleError(error, event.sender);
    }
  });

  const checkDesiccant = async (notificationInterval = 30) => {
    try {
      const dryBoxes = await DryBox.findAll();
      dryBoxes.forEach((dryBox) => {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - notificationInterval);
        if (dryBox.lastRecharged < daysAgo) {
          new Notification({
            title: 'Recharge Desiccant',
            body: `It has been over ${notificationInterval} days since you last recharged the desiccant in ${dryBox.name}.`,
          }).show();
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  ipcMain.handle('print-logs:get', async (event) => {
    try {
      return await PrintLog.findAll({ include: [Printer, FilamentSpool] });
    } catch (error) {
      handleError(error, event.sender);
      return [];
    }
  });

  ipcMain.handle('print-logs:add', async (event, log) => {
    try {
      const newLog = { ...log };
      newLog.photos = saveFiles(log.photos);
      newLog.gcodeFile = saveFiles([log.gcodeFile])[0];
      newLog.stlFile = saveFiles([log.stlFile])[0];

      if (newLog.gcodeFile && log.filamentId) {
        const gcode = fs.readFileSync(newLog.gcodeFile, 'utf-8');
        const parser = new GCodeParser(gcode);
        const commands = parser.parse();

        let filamentLength = 0;
        commands.forEach((command) => {
          if (command.command === 'G1' && command.params.E) {
            filamentLength += command.params.E;
          }
        });

        const filament = await FilamentSpool.findByPk(log.filamentId);
        if (filament) {
          const filamentRadius = filament.diameter / 2;
          const filamentVolume = Math.PI * Math.pow(filamentRadius, 2) * filamentLength; // mm^3
          const usedWeight = (filamentVolume / 1000) * filament.density; // g

          filament.remainingWeight -= usedWeight;
          await filament.save();

          newLog.printCost = (usedWeight / filament.spoolWeight) * filament.purchasePrice;
        }
      }

      return await PrintLog.create(newLog);
    } catch (error) {
      handleError(error, event.sender);
    }
  });

  ipcMain.handle('print-logs:update', async (event, log) => {
    try {
      await PrintLog.update(log, { where: { id: log.id } });
    } catch (error) {
      handleError(error, event.sender);
    }
  });

  ipcMain.handle('print-logs:delete', async (event, id) => {
    try {
      const log = await PrintLog.findByPk(id);
      if (log) {
        deleteFiles(log.photos);
        deleteFiles([log.gcodeFile, log.stlFile]);
        await log.destroy();
      }
    } catch (error) {
      handleError(error, event.sender);
    }
  });

  ipcMain.handle('failure-logs:get', async (event) => {
    try {
      return await PrintFailureLog.findAll({ include: [Printer, FilamentSpool] });
    } catch (error) {
      handleError(error, event.sender);
      return [];
    }
  });

  ipcMain.handle('failure-logs:add', async (event, log) => {
    try {
      const newLog = { ...log };
      newLog.photos = saveFiles(log.photos);
      newLog.gcodeFile = saveFiles([log.gcodeFile])[0];
      newLog.stlFile = saveFiles([log.stlFile])[0];

      if (newLog.gcodeFile && log.filamentId) {
        const gcode = fs.readFileSync(newLog.gcodeFile, 'utf-8');
        const parser = new GCodeParser(gcode);
        const commands = parser.parse();

        let filamentLength = 0;
        commands.forEach((command) => {
          if (command.command === 'G1' && command.params.E) {
            filamentLength += command.params.E;
          }
        });

        const filament = await FilamentSpool.findByPk(log.filamentId);
        if (filament) {
          const filamentRadius = filament.diameter / 2;
          const filamentVolume = Math.PI * Math.pow(filamentRadius, 2) * filamentLength; // mm^3
          const usedWeight = (filamentVolume / 1000) * filament.density; // g

          filament.remainingWeight -= usedWeight;
          await filament.save();

          newLog.printCost = (usedWeight / filament.spoolWeight) * filament.purchasePrice;
        }
      }

      return await PrintFailureLog.create(newLog);
    } catch (error) {
      handleError(error, event.sender);
    }
  });

  ipcMain.handle('failure-logs:update', async (event, log) => {
    try {
      await PrintFailureLog.update(log, { where: { id: log.id } });
    } catch (error) {
      handleError(error, event.sender);
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
      handleError(error, event.sender);
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
      handleError(error, event.sender);
      return [];
    }
  });

  ipcMain.handle('settings:get', async (event) => {
    try {
      const settingsPath = path.join(app.getPath('userData'), 'settings.json');
      if (fs.existsSync(settingsPath)) {
        const settings = fs.readFileSync(settingsPath, 'utf-8');
        return JSON.parse(settings);
      }
      return {};
    } catch (error) {
      handleError(error, event.sender);
      return {};
    }
  });

  ipcMain.handle('settings:set', async (event, settings) => {
    try {
      const settingsPath = path.join(app.getPath('userData'), 'settings.json');
      fs.writeFileSync(settingsPath, JSON.stringify(settings));
    } catch (error) {
      handleError(error, event.sender);
    }
  });

  ipcMain.handle('gcode:generate-calibration', async (event, { gcodeFile, slicerSetting, startValue, endValue, stepValue }) => {
    try {
      const gcode = fs.readFileSync(gcodeFile, 'utf-8');
      const lines = gcode.split('\n');
      const newLines = [];
      let layer = 0;
      let lastZ = -999;

      for (const line of lines) {
        newLines.push(line);
        if (line.startsWith('G1') || line.startsWith('G0')) {
          const zMatch = line.match(/Z([\d.]+)/);
          if (zMatch) {
            const z = parseFloat(zMatch[1]);
            if (z > lastZ) {
              lastZ = z;
              layer++;
              const currentValue = parseInt(startValue) + (layer * parseInt(stepValue));
              if (currentValue <= parseInt(endValue)) {
                if (slicerSetting === 'temperature') {
                  newLines.push(`M104 S${currentValue}`);
                } else if (slicerSetting === 'retraction-distance') {
                  // M207 sets retraction distance
                  newLines.push(`M207 S${currentValue}`);
                }
              }
            }
          }
        }
      }
      return newLines.join('\n');
    } catch (error) {
      handleError(error, event.sender);
      return '';
    }
  });

  ipcMain.handle('gcode:calculate-filament-usage', async (event, { filePath, filamentId }) => {
    try {
      const gcode = fs.readFileSync(filePath, 'utf-8');
      const parser = new GCodeParser(gcode);
      const commands = parser.parse();

      let filamentLength = 0;
      commands.forEach((command) => {
        if (command.command === 'G1' && command.params.E) {
          filamentLength += command.params.E;
        }
      });

      const filament = await FilamentSpool.findByPk(filamentId);
      if (filament) {
        const filamentRadius = filament.diameter / 2;
        const filamentVolume = Math.PI * Math.pow(filamentRadius, 2) * filamentLength; // mm^3
        const usedWeight = (filamentVolume / 1000) * filament.density; // g
        return usedWeight;
      }
      return 0;
    } catch (error) {
      console.error(error);
      return 0;
    }
  });

  ipcMain.handle('gcode:save', async (event, gcode) => {
    try {
      const { filePath } = await dialog.showSaveDialog({
        title: 'Save G-code File',
        defaultPath: 'modified.gcode',
        filters: [{ name: 'G-code', extensions: ['gcode'] }],
      });
      if (filePath) {
        fs.writeFileSync(filePath, gcode);
      }
    } catch (error) {
      handleError(error, event.sender);
    }
  });

  ipcMain.handle('user:login', async () => {
    // Mock login
    return { name: 'Test User' };
  });

  ipcMain.handle('user:logout', async () => {
    // Mock logout
    return null;
  });

  ipcMain.handle('community-profiles:get', async () => {
    // This is a placeholder for the logic to fetch profiles from a public database.
    return [];
  });

  ipcMain.handle('community-profiles:add', async (event, profile) => {
    // This is a placeholder for the logic to add a profile to a public database.
    return profile;
  });

  ipcMain.handle('community-profiles:rate', async (event, { id, rating }) => {
    // This is a placeholder for the logic to rate a profile in a public database.
    return { id, rating };
  });

  ipcMain.handle('dashboard:stats', async (event) => {
    try {
      const successfulPrints = await PrintLog.count();
      const failedPrints = await PrintFailureLog.count();

      const allPrints = [
        ...(await PrintLog.findAll()),
        ...(await PrintFailureLog.findAll()),
      ];

      const totalCost = allPrints.reduce((acc, log) => acc + (log.printCost || 0), 0);

      const filaments = await FilamentSpool.findAll();
      const lowFilaments = filaments.filter(
        (f) => (f.remainingWeight / f.spoolWeight) * 100 < 10
      );

      return {
        successfulPrints,
        failedPrints,
        totalCost,
        lowFilaments,
      };
    } catch (error) {
      handleError(error, event.sender);
      return {};
    }
  });
}
