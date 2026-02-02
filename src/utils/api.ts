import { API_BASE_URL } from "./constants";

// Get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem("token")
}

// POST request
export const apiPost = <T = any>(api: string, json: Record<string, any> = {}): Promise<T> => {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(json),
    }

    fetch(`${API_BASE_URL}${api}`, requestOptions)
      .then((res) => res.json())
      .then((result) => resolve(result))
      .catch((err) => reject(err))
  })
}

// GET request
export const apiGet = <T = any>(api: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const requestOptions: RequestInit = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }

    fetch(`${API_BASE_URL}${api}`, requestOptions)
      .then((res) => res.json())
      .then((result) => resolve(result))
      .catch((err) => reject(err))
  })
}

// PUT request
export const apiPut = <T = any>(api: string, json: Record<string, any> = {}): Promise<T> => {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const requestOptions: RequestInit = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(json),
    }

    fetch(`${API_BASE_URL}${api}`, requestOptions)
      .then((res) => res.json())
      .then((result) => resolve(result))
      .catch((err) => reject(err))
  })
}

// DELETE request
export const apiDelete = <T = any>(api: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const requestOptions: RequestInit = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }

    fetch(`${API_BASE_URL}${api}`, requestOptions)
      .then((res) => res.json())
      .then((result) => resolve(result))
      .catch((err) => reject(err))
  })
}

// Generic apiHit function (POST by default)
export const apiHit = <T = any>(json: Record<string, any>, api: string): Promise<T> => {
  return apiPost<T>(api, json)
}
