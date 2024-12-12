// Fake auth api
export const authApi = {
  refreshToken: async ({ refreshToken }: { refreshToken: string }) => {
    if (refreshToken) {
      return {
        data: {
          username: 'test',
          accessToken: 'new access token',
          refreshToken: 'new refresh token'
        }
      }
    }
    return {
      data: {
        username: null,
        accessToken: null,
        refreshToken: null
      }
    }
  },
  logout: () => {}
}
