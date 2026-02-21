export const validateVehicleForTrip = (vehicle) => {
  if (!vehicle) return { valid: false, error: "Vehicle not selected" };
  if (vehicle.status !== "Available") {
    return { valid: false, error: "Vehicle must be Available for trip" };
  }
  return { valid: true };
};

export const validateDriverForTrip = (driver) => {
  if (!driver) return { valid: false, error: "Driver not selected" };
  if (driver.status === "Suspended") {
    return { valid: false, error: "Driver is suspended" };
  }
  if (driver.status !== "On Duty") {
    return { valid: false, error: "Driver must be On Duty" };
  }
  
  const expiryDate = new Date(driver.licenseExpiry);
  if (expiryDate < new Date()) {
    return { valid: false, error: "Driver license has expired" };
  }
  
  return { valid: true };
};

export const validateCargoWeight = (weight, vehicle) => {
  const weightNum = Number(weight);
  if (!weight || isNaN(weightNum) || weightNum <= 0) {
    return { valid: false, error: "Enter valid cargo weight" };
  }
  if (weightNum > vehicle.capacity) {
    return { valid: false, error: `Weight exceeds vehicle capacity (${vehicle.capacity}kg)` };
  }
  return { valid: true };
};

export const validateTripForm = (formData, vehicle, driver) => {
  const errors = {};
  
  if (!formData.pickupLocation || formData.pickupLocation.trim() === "") {
    errors.pickupLocation = "Pickup location required";
  }
  if (!formData.dropLocation || formData.dropLocation.trim() === "") {
    errors.dropLocation = "Drop location required";
  }
  if (!formData.distance || Number(formData.distance) <= 0) {
    errors.distance = "Valid distance required";
  }
  const cargoValidation = validateCargoWeight(formData.cargoWeight, vehicle);
  if (!cargoValidation.valid) {
    errors.cargoWeight = cargoValidation.error;
  }
  
  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateLicenseExpiry = (expiryDate) => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  return expiry >= today;
};
