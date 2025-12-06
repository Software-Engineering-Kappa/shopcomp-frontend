import axios from "axios"

/**
 * Function to set the authorization token for the back-end API adapter.
 */
export function setAuthorizationToken(token: string) {
  localStorage.setItem("token", token)
}

/**
 * Function to unset the authorization token for the back-end API adapter (use when the
 * user signs out).
 */
export function unsetAuthorizationToken() {
  localStorage.removeItem("token")
}

/**
 * Returns the currently set authorization token.
 */
export function getAuthorizationToken() {
  return localStorage.getItem("token")
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
    let authToken = localStorage.getItem("token")
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
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Handle unauthorized access
      // TODO: attempt to renew the auth token
      console.log("Access token expired. Logging out")
      unsetAuthorizationToken()
      window.location.href = "/login"
    }
    return Promise.reject(error);
  }
)


