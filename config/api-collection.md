# API Collection

Main service endpoint collection. Auto-generated from the Swagger schema.

## How it works

- Pre-request script automatically adds `Workspace-ID` and `Content-Type: application/json` headers to all requests
- `Workspace-ID` is taken from the `workspace_id` global variable, which is set by the Auth collection

## Before use

1. Run the **Login** request from the Auth collection — it will set the token and `workspace_id`
2. After that, all requests in this collection will work with authorization
