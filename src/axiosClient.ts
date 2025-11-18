import axios from "axios"

/**
 * Axios instance for interacting with the back-end API. All requests made using this instance
 * will automatically have the Authentication headers set.
 */
const backend = axios.create({
  baseURL: "https://qgydcj7twd.execute-api.us-east-1.amazonaws.com/prod",
  headers: {
    "Content-Type": "application/json",
  },
})


// Custom request interceptor which adds auth token to the header of every request
backend.interceptors.request.use(
  (config) => {
    // Executes before every request is sent.
    // TODO: Insert AWS cognito access token in the "Authorization" header of every request.
    const token = null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)


export default backend 
