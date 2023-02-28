# Welcome

Welcome to the API Documentation. Here you will find references and documentation on how to use the REST API.

# Authentication

API calls with permission `user` or `admin` or any other role need to be authenticated and authorised.

You can do this by providing `auth-token` gotten from `/login` in the Authorization header of every request you make. You should authenticate all API calls with the following header

```
Authorization: Bearer AUTH-TOKEN
```

# Response Format

The API uses JSON for serialization of data. All responses from the backend `success` or `failed` will have the following format:

```json
{
    "message": string, // Description of what happened
    "success": Boolean, // true or false
    "data": Mixed // Can be an object, array, string, number, null, etc.
}
```

<b> NOTE: The `data` field is what is being used as `response` example across the documentation . </b>

In the API documentation the `success-response` example field will be documented as an array of users.

```json
[
    {
        "name": "John Doe",
        "email": ""
        // ... other user fields
    }
    // ... other users
]
```

But if you make a request to `/users`, you get a response like this:

```json
{
    "message": "Users fetched successfully",
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "John Doe",
            "email": ""
            // ... other user fields
        }
        // ... other users
    ]
}
```

# Status Codes

The API use conventional HTTP response codes to indicate the success or failure of an API request. In general:

-   Codes in the `2xx` range indicate success.
-   Codes in the `4xx` range indicate an error that failed given the information provided (e.g., a required parameter was omitted, etc.).
-   Codes in the `5xx` range indicate an error from the server (these are rare).
    <br />

| Status Code | Meaning                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| 200, 201    | Everything works as expected. API request was successful                                                |
| 400         | Bad Request - The request was unacceptable, often due to missing a required parameter.                  |
| 401         | Unauthorized - The auth-token was missing or invalid.                                                   |
| 403         | Forbidden - The auth-token was valid but the user does not have the permissions to access the resource. |
| 404         | Not Found - The requested resource doesn't exist.                                                       |
| 429         | Too Many Requests - Too many requests hit the API too quickly.                                          |
| 5XX         | Server Errors - Something went wrong on the backend side. Doesn't happen often :)                       |
