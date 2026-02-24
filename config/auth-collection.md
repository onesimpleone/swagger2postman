# Auth Collection

Handles OAuth 2.0 authentication using the Password grant flow. Run **Login** here first to get a token before making requests in the API Collection.

## How it works

1. **Login (create token)** — sends `grant_type=password` to `/oauth/token/` with username, password and `clientId`
   - After successful login, automatically requests `/api/users/me/`
   - Extracts `workspace_id` from the response and saves it as a global variable
   - `workspace_id` is then automatically injected into the `Workspace-ID` header in all API collection requests
2. **Login (refresh token)** — sends `grant_type=refresh_token` to `/oauth/token/` to obtain a new access token
3. **Logout (revoke token)** — revokes the token via `/oauth/revoke_token/`
