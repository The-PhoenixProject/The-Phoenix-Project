// src/services/sessionInterceptor.js
import Swal from "sweetalert2";

class SessionInterceptor {
  constructor() {
    this.navigate = null;
  }

  setNavigate(navigate) {
    this.navigate = navigate;
  }

  checkSessionAndRedirect(error) {
    if (!this.navigate) return false;
    
    if (error?.response?.status === 401 || error?.status === 401 || 
        error?.message?.includes("401") || error?.message?.includes("Token expired") ||
        error?.message?.includes("Unauthorized") || error?.code === "TOKEN_EXPIRED") {
      
      console.log("🛑 Session expired, redirecting to login...");
      
      // Clear all auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('rememberMe');
      sessionStorage.clear();
      
      // Show notification
      Swal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "Your session has expired. Please login again.",
        timer: 3000,
        showConfirmButton: false
      });
      
      // Redirect to login
      setTimeout(() => {
        this.navigate("/login", { replace: true });
      }, 1500);
      
      return true;
    }
    return false;
  }
}

// Create a singleton instance
const sessionInterceptor = new SessionInterceptor();

export default sessionInterceptor;