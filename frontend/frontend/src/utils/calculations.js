export const calculateFuelEfficiency = (distance, fuelUsed) => {
  if (fuelUsed === 0) return 0;
  return (distance / fuelUsed).toFixed(2);
};

export const calculateTotalOperationalCost = (fuelCost, maintenanceCost) => {
  return (Number(fuelCost) + Number(maintenanceCost)).toFixed(2);
};

export const calculateCostPerKM = (totalCost, totalDistance) => {
  if (totalDistance === 0) return 0;
  return (totalCost / totalDistance).toFixed(2);
};

export const calculateVehicleROI = (revenue, maintenanceCost, fuelCost, acquisitionCost) => {
  const profit = Number(revenue) - Number(maintenanceCost) - Number(fuelCost);
  if (acquisitionCost === 0) return 0;
  return ((profit / Number(acquisitionCost)) * 100).toFixed(2);
};

export const calculateTripCompletionRate = (completedTrips, totalTrips) => {
  if (totalTrips === 0) return 0;
  return ((completedTrips / totalTrips) * 100).toFixed(2);
};

export const formatCurrency = (amount) => {
  return `₹${Number(amount).toFixed(2)}`;
};

export const formatDistance = (km) => {
  return `${Number(km).toFixed(2)} km`;
};
