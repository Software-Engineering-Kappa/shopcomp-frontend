import axios from "axios"

/**
 * Function to set the authorization access, id, and refresh tokens for the back-end API adapter.
 */
export function setAuthorizationTokens(access: string, id: string, refresh: string) {
  localStorage.setItem("accessToken", access)
  localStorage.setItem("idToken", id)
  localStorage.setItem("refreshToken", refresh)
}

/**
 * Function to unset the authorization tokens for the back-end API adapter (use when the
 * user signs out).
 */
export function unsetAuthorizationTokens() {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("idToken")
  localStorage.removeItem("refreshToken")
}

/**
 * Returns the currently set id token.
 */
export function getIdToken() {
  return localStorage.getItem("idToken")
}


/**
 * Axios instance for interacting with the back-end API. All requests made using this instance
 * will automatically have the Authentication headers set.
 */
export const backend = axios.create({
  baseURL: "https://ovd3xuvki6.execute-api.us-east-1.amazonaws.com/prod",
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true,
})


// Custom request interceptor which adds auth token to the header of every request
backend.interceptors.request.use(
  (config) => {
    // Executes before every request is sent.
    // Insert authorization token in the "Authorization" header of every request.
    let authToken = localStorage.getItem("idToken")
    console.log(authToken)
    if (authToken !== null) {
      config.headers.Authorization = `Bearer ${authToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)


// Custom response interceptor 
backend.interceptors.response.use(
  (response) => {
    // Any status code 2xx
    return response
  },
  (error) => {
    // Any error codes, i.e., outside 2xx
    console.log("Response error: ", error)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Handle unauthorized access
      // TODO: attempt to renew the auth token
      console.log("Access token expired. Logging out")
      unsetAuthorizationTokens()
      window.location.href = "/login"
    }
    return Promise.reject(error);
  }
)


