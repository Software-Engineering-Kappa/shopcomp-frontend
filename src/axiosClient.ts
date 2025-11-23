import axios from "axios"


let authToken: string | undefined = undefined

/**
 * Function to set the authorization token for the back-end API adapter.
 */
export function setAuthorizationToken(token: string) {
  authToken = token
}


/**
 * Axios instance for interacting with the back-end API. All requests made using this instance
 * will automatically have the Authentication headers set.
 */
export const backend = axios.create({
  baseURL: "https://s10dl0v955.execute-api.us-east-1.amazonaws.com/prod",
  headers: {
    "Content-Type": "application/json",
  },
})


// Custom request interceptor which adds auth token to the header of every request
backend.interceptors.request.use(
  (config) => {
    // Executes before every request is sent.
    // Insert authorization token in the "Authorization" header of every request.
    if (authToken !== undefined) {
      config.headers.Authorization = `Bearer ${authToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)


// Custom response interceptor 
backend.interceptors.response.use(
  (response) => response,   // Any status code 2xx
  (error) => {
    // Any error codes, i.e., outside 2xx
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      // TODO: redirect to login page?
    }
    return Promise.reject(error);
  }
)



