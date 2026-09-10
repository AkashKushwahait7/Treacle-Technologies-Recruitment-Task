import AnalyticsService from '../services/analytics.service.js';
import AlertService from '../services/alert.service.js';

export const getSummary = async (req, res, next) => {
  try {
    const summaryData = await AnalyticsService.getFleetSummary();
    
    return res.status(200).json({
      success: true,
      data: summaryData,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    return next(error);
  }
};

export const getDashboardAlerts = async (req, res, next) => {
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

export const getTrends = async (req, res, next) => {
  try {
    const period = req.query.period || '24h';
    const trendsData = await AnalyticsService.getFleetTrends(period);

    return res.status(200).json({
      success: true,
      data: trendsData,
    });
  } catch (error) {
    return next(error);
  }
};
