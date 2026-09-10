import Alert from '../models/Alert.js';
import { ENV } from '../config/env.js';

export class AlertService {
  /**
   * Evaluates telemetry metrics against centralized thresholds,
   * creates new ACTIVE alerts when thresholds are breached,
   * and auto-resolves existing alerts when metrics return to normal.
   */
  static async processVehicleAlerts(vehicle, telemetry) {
    const { vehicleId, engineTemperature, fuelLevel, batteryLevel, speed } = telemetry;
    const { TEMPERATURE, FUEL, BATTERY, SPEED } = ENV.THRESHOLDS;
    const generatedAlerts = [];
    const resolvedAlerts = [];

    // Rules to evaluate
    const checks = [
      {
        type: 'TEMPERATURE',
        isCritical: engineTemperature >= TEMPERATURE.CRITICAL,
        isWarning: engineTemperature >= TEMPERATURE.WARNING && engineTemperature < TEMPERATURE.CRITICAL,
        value: engineTemperature,
        warningThreshold: TEMPERATURE.WARNING,
        criticalThreshold: TEMPERATURE.CRITICAL,
        messageWarn: `Engine temperature elevated (${engineTemperature}°C >= ${TEMPERATURE.WARNING}°C)`,
        messageCrit: `CRITICAL engine overheating (${engineTemperature}°C >= ${TEMPERATURE.CRITICAL}°C)`,
      },
      {
        type: 'FUEL',
        isCritical: fuelLevel <= FUEL.CRITICAL,
        isWarning: fuelLevel <= FUEL.WARNING && fuelLevel > FUEL.CRITICAL,
        value: fuelLevel,
        warningThreshold: FUEL.WARNING,
        criticalThreshold: FUEL.CRITICAL,
        messageWarn: `Low fuel level warning (${fuelLevel}% <= ${FUEL.WARNING}%)`,
        messageCrit: `CRITICAL fuel level low (${fuelLevel}% <= ${FUEL.CRITICAL}%)`,
      },
      {
        type: 'BATTERY',
        isCritical: batteryLevel <= BATTERY.CRITICAL,
        isWarning: batteryLevel <= BATTERY.WARNING && batteryLevel > BATTERY.CRITICAL,
        value: batteryLevel,
        warningThreshold: BATTERY.WARNING,
        criticalThreshold: BATTERY.CRITICAL,
        messageWarn: `Battery level low (${batteryLevel}% <= ${BATTERY.WARNING}%)`,
        messageCrit: `CRITICAL battery depletion (${batteryLevel}% <= ${BATTERY.CRITICAL}%)`,
      },
      {
        type: 'SPEED',
        isCritical: speed >= SPEED.CRITICAL,
        isWarning: speed >= SPEED.WARNING && speed < SPEED.CRITICAL,
        value: speed,
        warningThreshold: SPEED.WARNING,
        criticalThreshold: SPEED.CRITICAL,
        messageWarn: `Speed threshold exceeded (${speed} km/h >= ${SPEED.WARNING} km/h)`,
        messageCrit: `CRITICAL overspeeding detected (${speed} km/h >= ${SPEED.CRITICAL} km/h)`,
      },
    ];

    for (const check of checks) {
      // Find any currently active alert for this vehicle and type
      const activeAlert = await Alert.findOne({
        vehicleId,
        type: check.type,
        status: 'ACTIVE',
      });

      if (check.isCritical) {
        if (!activeAlert || activeAlert.severity !== 'CRITICAL') {
          if (activeAlert) {
            activeAlert.status = 'RESOLVED';
            activeAlert.resolvedAt = new Date();
            await activeAlert.save();
          }
          const newAlert = await Alert.create({
            vehicleId,
            type: check.type,
            severity: 'CRITICAL',
            message: check.messageCrit,
            value: check.value,
            threshold: check.criticalThreshold,
            status: 'ACTIVE',
            timestamp: new Date(),
          });
          generatedAlerts.push(newAlert);
        }
      } else if (check.isWarning) {
        if (!activeAlert) {
          const newAlert = await Alert.create({
            vehicleId,
            type: check.type,
            severity: 'WARNING',
            message: check.messageWarn,
            value: check.value,
            threshold: check.warningThreshold,
            status: 'ACTIVE',
            timestamp: new Date(),
          });
          generatedAlerts.push(newAlert);
        }
      } else {
        // Condition normal - resolve any active alert
        if (activeAlert) {
          activeAlert.status = 'RESOLVED';
          activeAlert.resolvedAt = new Date();
          await activeAlert.save();
          resolvedAlerts.push(activeAlert);
        }
      }
    }

    return { generatedAlerts, resolvedAlerts };
  }

  /**
   * Query alerts with filtering and pagination
   */
  static async getAlerts(filters = {}) {
    const { severity, status, vehicleId, search, limit = 50, page = 1 } = filters;
    const query = {};

    if (severity) {
      query.severity = severity.toUpperCase();
    }
    if (status) {
      query.status = status.toUpperCase();
    }
    if (vehicleId) {
      query.vehicleId = vehicleId.toUpperCase();
    }
    if (search) {
      query.$or = [
        { vehicleId: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [alerts, total] = await Promise.all([
      Alert.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(take)
        .lean(),
      Alert.countDocuments(query),
    ]);

    return {
      alerts,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / take) || 1,
    };
  }
}

export default AlertService;
