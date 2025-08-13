import { ipcMain, Notification, dialog, app } from 'electron';
import { FilamentSpool, DryBox, Printer, PrintFailureLog } from './db/models';
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


  ipcMain.handle('filaments:get', async (event) => {
    try {
      return await FilamentSpool.findAll();
    } catch (error) {
      handleError(error, event.sender);
      return [];
    }
  });

  ipcMain.handle('filaments:add', async (event, filament) => {
    try {
      return await FilamentSpool.create(filament);
    } catch (error) {
      handleError(error, event.sender);
    }
  });

  ipcMain.handle('filaments:update', async (event, filament) => {
    try {
      await FilamentSpool.update(filament, { where: { id: filament.id } });
    } catch (error) {
      handleError(error, event.sender);
    }
  });

  ipcMain.handle('filaments:delete', async (event, id) => {
    try {
      await FilamentSpool.destroy({ where: { id } });
    } catch (error) {
      handleError(error, event.sender);
    }
  });

  ipcMain.handle('dryboxes:get', async (event) => {
    try {
      return await DryBox.findAll();
    } catch (error) {
      handleError(error, event.sender);
      return [];
    }
  });

  ipcMain.handle('dryboxes:add', async (event, dryBox) => {
    try {
      return await DryBox.create(dryBox);
    } catch (error) {
      handleError(error, event.sender);
    }
  });

  ipcMain.handle('dryboxes:update', async (event, dryBox) => {
    try {
      await DryBox.update(dryBox, { where: { id: dryBox.id } });
    } catch (error) {
      handleError(error, event.sender);
    }
  });

  ipcMain.handle('dryboxes:delete', async (event, id) => {
    try {
      await DryBox.destroy({ where: { id } });
    } catch (error) {
      handleError(error, event.sender);
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

  ipcMain.handle('printers:get', async (event) => {
    try {
      return await Printer.findAll();
    } catch (error) {
      handleError(error, event.sender);
      return [];
    }
  });

  ipcMain.handle('printers:add', async (event, printer) => {
    try {
      return await Printer.create(printer);
    } catch (error) {
      handleError(error, event.sender);
    }
  });

  ipcMain.handle('printers:update', async (event, printer) => {
    try {
      await Printer.update(printer, { where: { id: printer.id } });
    } catch (error) {
      handleError(error, event.sender);
    }
  });

  ipcMain.handle('printers:delete', async (event, id) => {
    try {
      await Printer.destroy({ where: { id } });
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

  ipcMain.handle('gcode:generate-calibration', async (event, { testModel, slicerSetting, startValue, endValue, stepValue }) => {
    // This is a placeholder for the G-code generation logic.
    // In a real application, this would involve a more complex process
    // of selecting a template G-code file and modifying it based on the
    // provided parameters.
    const gcode = `; G-code generated for ${testModel}
; Slicer Setting: ${slicerSetting}
; Start: ${startValue}, End: ${endValue}, Step: ${stepValue}
G21 ; set units to millimeters
G90 ; use absolute positioning
M82 ; use absolute distances for extrusion
G28 ; home all axes
`;
    return gcode;
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
}
