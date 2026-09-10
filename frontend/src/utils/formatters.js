export const formatTime = (dateInput) => {
  if (!dateInput) return '--:--:--';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '--:--:--';
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const formatDate = (dateInput) => {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatSpeed = (speed) => {
  if (speed === undefined || speed === null) return '0 km/h';
  return `${Number(speed).toFixed(1)} km/h`;
};

export const formatPercentage = (val) => {
  if (val === undefined || val === null) return '0%';
  return `${Number(val).toFixed(1)}%`;
};

export const formatTemperature = (temp) => {
  if (temp === undefined || temp === null) return '0°C';
  return `${Number(temp).toFixed(1)}°C`;
};

export const formatDistance = (dist) => {
  if (!dist) return '0 km';
  return `${Number(dist).toLocaleString()} km`;
};
