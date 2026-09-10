import Alert from '../models/Alert.js';
import AlertService from '../services/alert.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getAlerts = async (req, res, next) => {
  try {
    const { severity, status, vehicleId, search, page, limit } = req.query;
    const result = await AlertService.getAlerts({
      severity,
      status,
      vehicleId,
      search,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result.alerts,
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const resolveAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id);

    if (!alert) {
      return errorResponse(res, 'Alert not found', 404);
    }

    alert.status = 'RESOLVED';
    alert.resolvedAt = new Date();
    await alert.save();

    return successResponse(res, alert, 'Alert resolved successfully');
  } catch (error) {
    return next(error);
  }
};
