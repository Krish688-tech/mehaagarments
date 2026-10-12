import axios from "axios";

const SHIPROCKET_BASE_URL =
  process.env.SHIPROCKET_API_BASE_URL ||
  "https://apiv2.shiprocket.in/v1/external";

let cachedToken = null;
let tokenExpiresAt = 0;

let authenticationPromise = null;

// ==========================================
// CONFIGURATION
// ==========================================

const getCredentials = () => {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Shiprocket credentials are not configured in environment variables",
    );
  }

  return {
    email,
    password,
  };
};

// ==========================================
// AUTHENTICATION
// ==========================================

const authenticateShiprocket = async () => {
  const { email, password } = getCredentials();

  try {
    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/auth/login`,
      {
        email,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    );

    const token = response.data?.token;

    if (!token) {
      throw new Error(
        "Shiprocket authentication succeeded but no token was returned",
      );
    }

    /*
     * Shiprocket documents the token validity as 10 days.
     *
     * We refresh slightly before expiry instead of waiting
     * until the exact expiry moment.
     */
    cachedToken = token;

    tokenExpiresAt =
      Date.now() + 9 * 24 * 60 * 60 * 1000;

    return cachedToken;
  } catch (error) {
    console.error(
      "Shiprocket authentication failed:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        "Unable to authenticate with Shiprocket",
    );
  }
};

// ==========================================
// GET AUTH TOKEN
// ==========================================

const getShiprocketToken = async () => {
  /*
   * Reuse existing valid token.
   */
  if (
    cachedToken &&
    Date.now() < tokenExpiresAt
  ) {
    return cachedToken;
  }

  /*
   * Prevent multiple simultaneous requests
   * from generating multiple tokens.
   */
  if (!authenticationPromise) {
    authenticationPromise =
      authenticateShiprocket().finally(() => {
        authenticationPromise = null;
      });
  }

  return authenticationPromise;
};

// ==========================================
// GENERIC API REQUEST
// ==========================================

const shiprocketRequest = async ({
  method,
  endpoint,
  data = undefined,
  params = undefined,
  retry = true,
}) => {
  const token = await getShiprocketToken();

  try {
    const response = await axios({
      method,
      url: `${SHIPROCKET_BASE_URL}${endpoint}`,
      data,
      params,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 20000,
    });

    return response.data;
  } catch (error) {
    /*
     * Token may have expired earlier than expected.
     *
     * Clear it and authenticate once more.
     */
    if (
      error.response?.status === 401 &&
      retry
    ) {
      cachedToken = null;
      tokenExpiresAt = 0;

      return shiprocketRequest({
        method,
        endpoint,
        data,
        params,
        retry: false,
      });
    }

    console.error(
      `Shiprocket API error [${method} ${endpoint}]:`,
      error.response?.data || error.message,
    );

    const apiError =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Shiprocket API request failed";

    const enhancedError = new Error(apiError);

    enhancedError.status =
      error.response?.status || 500;

    enhancedError.response =
      error.response?.data || null;

    throw enhancedError;
  }
};

// ==========================================
// CREATE ORDER
// ==========================================

export const createShiprocketOrder = async (
  orderData,
) => {
  return shiprocketRequest({
    method: "POST",
    endpoint: "/orders/create/adhoc",
    data: orderData,
  });
};

// ==========================================
// COURIER SERVICEABILITY
// ==========================================

export const getCourierServiceability = async (
  params,
) => {
  return shiprocketRequest({
    method: "GET",
    endpoint: "/courier/serviceability/",
    params,
  });
};

// ==========================================
// ASSIGN COURIER + GENERATE AWB
// ==========================================

export const assignCourierAndGenerateAWB = async ({
  shipmentId,
  courierId = null,
}) => {
  const data = {
    shipment_id: shipmentId,
  };

  if (courierId) {
    data.courier_id = courierId;
  }

  return shiprocketRequest({
    method: "POST",
    endpoint: "/courier/assign/awb",
    data,
  });
};

// ==========================================
// GENERATE PICKUP
// ==========================================

export const generatePickup = async ({
  shipmentId,
  pickupDate = null,
  retry = false,
}) => {
  const data = {
    shipment_id: [shipmentId],
  };

  if (pickupDate) {
    data.pickup_date = [pickupDate];
  }

  if (retry) {
    data.status = "retry";
  }

  return shiprocketRequest({
    method: "POST",
    endpoint: "/courier/generate/pickup",
    data,
  });
};

// ==========================================
// CANCEL SHIPROCKET ORDER
// ==========================================

export const cancelShiprocketOrder = async (
  shiprocketOrderId,
) => {
  return shiprocketRequest({
    method: "POST",
    endpoint: "/orders/cancel",
    data: {
      ids: [shiprocketOrderId],
    },
  });
};

// ==========================================
// EXPORT
// ==========================================

export default {
  createShiprocketOrder,
  getCourierServiceability,
  assignCourierAndGenerateAWB,
  generatePickup,
  cancelShiprocketOrder,
};