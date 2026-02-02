export interface StoredUser {
  _id: string
  name: string
  email: string
  role: string
  token: string
}

export function useStoredAuth() {
  const getToken = (): string | null => {
    return localStorage.getItem("token")
  }

  const getUser = (): StoredUser | null => {
    const stored = localStorage.getItem("user")
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return null
      }
    }
    return null
  }

  const getUserId = (): string | null => {
    const user = getUser()
    return user?._id || null
  }

  const getUserName = (): string | null => {
    const user = getUser()
    return user?.name || null
  }

  const getUserEmail = (): string | null => {
    const user = getUser()
    return user?.email || null
  }

  const getUserRole = (): string | null => {
    const user = getUser()
    return user?.role || null
  }

  const isAdmin = (): boolean => {
    const user = getUser()
    return user?.role === "admin"
  }

  const isLoggedIn = (): boolean => {
    return !!getToken() && !!getUser()
  }

  const getAllAuthData = () => {
    return {
      token: getToken(),
      user: getUser(),
      isLoggedIn: isLoggedIn(),
      isAdmin: isAdmin(),
    }
  }

  return {
    getToken,
    getUser,
    getUserId,
    getUserName,
    getUserEmail,
    getUserRole,
    isAdmin,
    isLoggedIn,
    getAllAuthData,
  }
}
