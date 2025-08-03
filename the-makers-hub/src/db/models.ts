import { DataTypes, Model } from 'sequelize';
import sequelize from './database';

// FilamentSpool Model
export class FilamentSpool extends Model {
  public id!: number;
  public manufacturer!: string;
  public materialType!: string;
  public color!: string;
  public spoolWeight!: number;
  public purchasePrice!: number;
  public purchaseDate!: Date;
  public remainingWeight!: number;
  public density!: number;
}

FilamentSpool.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    manufacturer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    materialType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    spoolWeight: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    purchasePrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    remainingWeight: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    density: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1.24, // Default to PLA density
    },
  },
  {
    sequelize,
    tableName: 'filament_spools',
  }
);

// DryBox Model
export class DryBox extends Model {
  public id!: number;
  public name!: string;
  public lastRecharged!: Date;
}

DryBox.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastRecharged: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'dry_boxes',
  }
);

// Printer Model
export class Printer extends Model {
  public id!: number;
  public name!: string;
  public model!: string;
}

Printer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'printers',
  }
);

// PrintFailureLog Model
export class PrintFailureLog extends Model {
  public id!: number;
  public title!: string;
  public dateOfFailure!: Date;
  public photos!: string[];
  public gcodeFile!: string;
  public stlFile!: string;
  public suspectedCauseAndNotes!: string;
  public slicerSettings!: Record<string, string>;
  public Printer?: Printer;
  public FilamentSpool?: FilamentSpool;
}

PrintFailureLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateOfFailure: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    photos: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    gcodeFile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stlFile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    suspectedCauseAndNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    slicerSettings: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'print_failure_logs',
  }
);

// Associations
PrintFailureLog.belongsTo(Printer, { foreignKey: 'printerId' });
PrintFailureLog.belongsTo(FilamentSpool, { foreignKey: 'filamentId' });

sequelize.sync();
