# Postman Testing Guide

To test your API in Postman, follow these steps for each endpoint.

---

## 1. Setup Environment
In Postman, create a new **Environment** (top right) and add these variables:
- `base_url`: `http://localhost:5000`
- `token`: (Leave blank for now, you will paste it here after registering/logging in)

---

## 2. Authentication Endpoints

### Register User
- **Method**: `POST`
- **URL**: `{{base_url}}/api/auth/register`
- **Body** (Select `raw` -> `JSON`):
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@college.edu",
    "password": "password123"
  }
  ```
- **Action**: After sending, copy the `token` from the response. Go to your Environment settings and paste it into the `token` variable's "Current Value".

### Login User
- **Method**: `POST`
- **URL**: `{{base_url}}/api/auth/login`
- **Body** (Select `raw` -> `JSON`):
  ```json
  {
    "email": "jane@college.edu",
    "password": "password123"
  }
  ```

---

## 3. Item Endpoints (Protected)
*For all requests below, go to the **Auth** tab in Postman, select **Bearer Token**, and enter `{{token}}`.*

### Add New Item
- **Method**: `POST`
- **URL**: `{{base_url}}/api/items`
- **Body** (`raw` -> `JSON`):
  ```json
  {
    "itemName": "Keys with a Red Keychain",
    "description": "Found near the cafeteria",
    "type": "Found",
    "location": "Cafeteria",
    "contactInfo": "jane@college.edu"
  }
  ```

### Get All Items
- **Method**: `GET`
- **URL**: `{{base_url}}/api/items`

### Search Items
- **Method**: `GET`
- **URL**: `{{base_url}}/api/items/search?name=Keys`

### Update Item
- **Method**: `PUT`
- **URL**: `{{base_url}}/api/items/<ITEM_ID_HERE>`
- **Body**: Update the fields as needed in JSON format.

---

## 💡 Pro Tip: Import curl
You don't have to type these manually! 
1. Click the **Import** button in the top-left of Postman.
2. Paste any of the `curl` commands I gave you earlier.
3. Postman will automatically create the request with the correct Method, URL, Headers, and Body.
