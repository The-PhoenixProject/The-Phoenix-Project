// Data service to manage requests and offers
// Uses localStorage to persist data and syncs with server.json

const STORAGE_KEY = "repair_app_data";

// Load initial data from server.json or localStorage
export const loadData = async () => {
  try {
    // Try to load from localStorage first (user's saved data)
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }

    // Fallback to server.json
    const response = await fetch("/server.json");
    const data = await response.json();
    // Save to localStorage for future use
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("Error loading data:", error);
    // Return empty structure if both fail
    return {
      repairRequests: [],
      serviceProviders: [],
      myRequests: [],
      myOffers: [],
    };
  }
};

// Save data to localStorage
const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Error saving data:", error);
    return false;
  }
};

// Add a new repair request
export const addRepairRequest = async (requestData) => {
  const data = await loadData();
  const newRequest = {
    id: Date.now(), // Simple ID generation
    ...requestData,
    status: "New",
    postedBy: "You", // You can customize this
    image: requestData.image || "https://via.placeholder.com/150",
  };

  data.repairRequests.push(newRequest);
  data.myRequests.push({
    id: newRequest.id,
    item: newRequest.itemName,
    category: newRequest.category,
    budget: newRequest.budget,
    status: "New",
  });

  saveData(data);
  return newRequest;
};

// Add a new service provider/offer
export const addServiceProvider = async (providerData) => {
  const data = await loadData();
  const providerId = Date.now();
  const newProvider = {
    id: providerId,
    ...providerData,
    rating: providerData.rating || 5,
    reviews: providerData.reviews || 0,
    image: providerData.image || "https://via.placeholder.com/80",
    postedBy: "You", // Mark as user-added
  };

  data.serviceProviders.push(newProvider);
  saveData(data);
  return newProvider;
};

// Add to my offers
export const addMyOffer = async (offerData) => {
  const data = await loadData();
  const newOffer = {
    id: Date.now(),
    ...offerData,
  };

  if (!data.myOffers) {
    data.myOffers = [];
  }
  data.myOffers.push(newOffer);
  saveData(data);
  return newOffer;
};

// Delete a repair request (only user-added ones)
export const deleteRepairRequest = async (requestId) => {
  const data = await loadData();

  // Remove from repairRequests
  data.repairRequests = data.repairRequests.filter((r) => r.id !== requestId);

  // Remove from myRequests
  data.myRequests = data.myRequests.filter((r) => r.id !== requestId);

  saveData(data);
  return data;
};

// Delete a service provider (only user-added ones)
export const deleteServiceProvider = async (providerId) => {
  const data = await loadData();

  // Remove from serviceProviders
  data.serviceProviders = data.serviceProviders.filter(
    (p) => p.id !== providerId
  );

  // Remove from myOffers if exists
  if (data.myOffers) {
    data.myOffers = data.myOffers.filter((o) => o.id !== providerId);
  }

  saveData(data);
  return data;
};

// Export data as JSON (for downloading server.json)
export const exportData = async () => {
  const data = await loadData();
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "server.json";
  link.click();
  URL.revokeObjectURL(url);
};

// Reset data to server.json (clear localStorage)
export const resetData = async () => {
  localStorage.removeItem(STORAGE_KEY);
  return await loadData();
};
