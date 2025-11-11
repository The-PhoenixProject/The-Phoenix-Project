// Data service to manage requests and offers
// Uses json-server API - no localStorage

const API_BASE_URL = "http://localhost:3001";

// API helper function to make requests
const apiRequest = async (endpoint, method = "GET", body = null) => {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      throw new Error(`API error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API ${method} error:`, error);
    throw error;
  }
};

// Load data from json-server API
export const loadData = async () => {
  try {
    // Fetch all data from json-server endpoints
    const [repairRequests, serviceProviders, myRequests, myOffers] =
      await Promise.all([
        apiRequest("/repairRequests").catch(() => []),
        apiRequest("/serviceProviders").catch(() => []),
        apiRequest("/myRequests").catch(() => []),
        apiRequest("/myOffers").catch(() => []),
      ]);

    const data = {
      repairRequests,
      serviceProviders,
      myRequests,
      myOffers,
    };

    return data;
  } catch (error) {
    console.error("Error loading data from API:", error);
    return {
      repairRequests: [],
      serviceProviders: [],
      myRequests: [],
      myOffers: [],
    };
  }
};

// Add a new repair request - only adds to myRequests
export const addRepairRequest = async (requestData) => {
  try {
    const myRequest = {
      item: requestData.itemName,
      category: requestData.category,
      budget: requestData.budget,
      status: "New",
    };

    // POST to myRequests only
    const createdRequest = await apiRequest("/myRequests", "POST", myRequest);

    return createdRequest;
  } catch (error) {
    console.error("Error adding repair request:", error);
    throw error;
  }
};

// Add a new service provider/offer
export const addServiceProvider = async (providerData) => {
  try {
    const newProvider = {
      ...providerData,
      rating: providerData.rating || 5,
      reviews: providerData.reviews || 0,
      image: providerData.image || "https://via.placeholder.com/80",
      postedBy: "You",
    };

    // POST to json-server API
    const createdProvider = await apiRequest(
      "/serviceProviders",
      "POST",
      newProvider
    );

    return createdProvider;
  } catch (error) {
    console.error("Error adding service provider:", error);
    throw error;
  }
};

// Add to my offers
export const addMyOffer = async (offerData) => {
  try {
    const newOffer = {
      ...offerData,
    };

    // POST to json-server API
    const createdOffer = await apiRequest("/myOffers", "POST", newOffer);

    return createdOffer;
  } catch (error) {
    console.error("Error adding my offer:", error);
    throw error;
  }
};

// Delete a repair request - only deletes from myRequests
export const deleteRepairRequest = async (requestId) => {
  try {
    // DELETE from myRequests only
    await apiRequest(`/myRequests/${requestId}`, "DELETE");

    return await loadData();
  } catch (error) {
    console.error("Error deleting repair request:", error);
    throw error;
  }
};

// Delete a service provider/offer - only deletes from myOffers
export const deleteServiceProvider = async (providerId) => {
  try {
    // DELETE from myOffers only
    await apiRequest(`/myOffers/${providerId}`, "DELETE");

    return await loadData();
  } catch (error) {
    console.error("Error deleting service provider:", error);
    throw error;
  }
};

// Export data as JSON (for downloading)
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

// Reset data to server.json (reload from API)
export const resetData = async () => {
  return await loadData(); // Reload from API
};
