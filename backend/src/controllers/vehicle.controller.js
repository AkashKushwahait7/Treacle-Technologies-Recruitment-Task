import Vehicle from '../models/Vehicle.js';
import Telemetry from '../models/Telemetry.js';
import Alert from '../models/Alert.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getVehicles = async (req, res, next) => {
  try {
    const { status, vehicleType, search, city, limit = 50, page = 1, sort = 'vehicleId' } = req.query;
    const query = {};

    if (status && status.toUpperCase() !== 'ALL') {
      query.status = status.toUpperCase();
    }
    if (vehicleType) {
      query.vehicleType = vehicleType;
    }
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { vehicleId: { $regex: search, $options: 'i' } },
        { driverName: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [vehicles, total] = await Promise.all([
      Vehicle.find(query)
        .sort(sort)
        .skip(skip)
        .limit(take)
        .lean(),
      Vehicle.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: vehicles,
      pagination: {
        total,
        page: parseInt(page, 10),
        totalPages: Math.ceil(total / take) || 1,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getVehicleById = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = await Vehicle.findOne({ vehicleId: vehicleId.toUpperCase() }).lean();

    if (!vehicle) {
      return errorResponse(res, `Vehicle with ID ${vehicleId} not found`, 404);
    }

    // Get active alert count for this vehicle
    const activeAlertsCount = await Alert.countDocuments({
      vehicleId: vehicle.vehicleId,
      status: 'ACTIVE',
    });

    return successResponse(res, {
      ...vehicle,
      activeAlertsCount,
    });
  } catch (error) {
    return next(error);
  }
};

export const getVehicleTelemetry = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const { limit = 50 } = req.query;

    const vehicle = await Vehicle.findOne({ vehicleId: vehicleId.toUpperCase() }).lean();
    if (!vehicle) {
      return errorResponse(res, `Vehicle with ID ${vehicleId} not found`, 404);
    }

    const telemetryLogs = await Telemetry.find({ vehicleId: vehicle.vehicleId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit, 10))
      .lean();

    // Return chronological order for charts
    telemetryLogs.reverse();

    return successResponse(res, telemetryLogs);
  } catch (error) {
    return next(error);
  }
};

export const getVehicleAlerts = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const { status, limit = 50 } = req.query;

    const query = { vehicleId: vehicleId.toUpperCase() };
    if (status) {
      query.status = status.toUpperCase();
    }

    const alerts = await Alert.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit, 10))
      .lean();

    return successResponse(res, alerts);
  } catch (error) {
    return next(error);
  }
};
