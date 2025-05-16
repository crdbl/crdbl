# Routes Folder

Routes define the pathways within your application.
Fastify's structure supports the modular monolith approach, where your
application is organized into distinct, self-contained modules.
This facilitates easier scaling and future transition to a microservice architecture.
In the future you might want to independently deploy some of those.

In this folder you should define all the routes that define the endpoints
of your web application.
Each service is a [Fastify
plugin](https://fastify.dev/docs/latest/Reference/Plugins/), it is
encapsulated (it can have its own independent plugins) and it is
typically stored in a file; be careful to group your routes logically,
e.g. all `/users` routes in a `users.js` file. We have added
a `root.js` file for you with a '/' root added.

If a single file becomes too large, create a folder and add a `index.js` file there:
this file must be a Fastify plugin, and it will be loaded automatically
by the application. You can now add as many files as you want inside that folder.
In this way you can create complex routes within a single monolith,
and eventually extract them.

If you need to share functionality between routes, place that
functionality into the `plugins` folder, and share it via
[decorators](https://fastify.dev/docs/latest/Reference/Decorators/).

If you're a bit confused about using `async/await` to write routes, you would
better take a look at [Promise resolution](https://fastify.dev/docs/latest/Reference/Routes/#promise-resolution) for more details.

## /credential/issue

**POST** `/credential/issue`

Issue a credential for a subject DID, signed by the issuer DID stored in Redis.

### Request Body

```
{
  "subjectDid": "did:key:...", // required, the user's DID
  "attributes": {
    "content": "string", // required, main content
    "context": ["crdbl-id-or-alias-1", "crdbl-id-or-alias-2"] // required, array of credential references (ids or aliases)
  },
  "signature": "hexstring", // required, signature of (attributes.content + attributes.context) by subjectDid's private key
  "opts": { // optional
    "generateAlias": false // optional, generate a short human-friendly alias in addition to its uuid
  }
}
```

### Response

- On success: the issued credential object (from cheqd studio)
- On error: `{ error: string }` with appropriate status code

### Notes

- The issuer DID must be present in Redis under the key 'issuer'.
- The signature is verified using the public key from subjectDid, and must cover both `attributes.content` and `attributes.context` (as a JSON array).
- Before issuing, **every credential referenced in `attributes.context` must exist locally and be verified**. Verification uses the same logic as `/credential/verify/:id`: it first checks the cache, then verifies and caches the result if not present.
- If any context credential is missing or not verified, the endpoint returns an error.
- Context references can be either credential ids or aliases.
- The issued credential is stored in Redis under the key `credential:{subjectDid}`.

#### Error Cases

- `400 Bad Request`: If required fields are missing, if any context credential is not found, or if any context credential is not verified.
- `401 Unauthorized`: If the signature is invalid.
- `500 Internal Server Error`: If there is a server or data parsing error.

## /credential/list/:did

**GET** `/credential/list/:did`

List all credentials for a given holder DID.

### Path Parameter

- `did` (string, required): The holder's DID whose credentials you want to list.

### Response

- On success: An array of credential objects issued to the given holder DID.
- On error: `{ error: string }` with appropriate status code

### Notes

- Credentials are stored in Redis under the key `credential:{did}` as a list. This endpoint returns all credentials for the specified DID.

## /credential/:id

**GET** `/credential/:id`

Retrieve a credential by its unique identifier, which can be either its UUID or its alias (if one was generated).

### Path Parameter

- `id` (string, required): The credential's unique identifier or alias.

### Response

- On success: The credential object.
- On error: `{ error: string }` with appropriate status code.

### Error Cases

- `400 Bad Request`: If the identifier is missing.
- `404 Not Found`: If no credential is found for the given id or alias.
- `500 Internal Server Error`: If there is a server or data parsing error.

### Notes

- The endpoint first attempts to find a credential by id. If not found, it checks if the id is an alias and resolves it to the credential's UUID.
- If neither is found, a 404 error is returned.

## /credential/verify/:id

**GET** `/credential/verify/:id`

Verify a credential by its unique identifier, which can be either its UUID or its alias.

### Path Parameter

- `id` (string, required): The credential's unique identifier or alias.

### Response

- On success: The verification result object.
- On error: `{ error: string }` with appropriate status code.

### Error Cases

- `400 Bad Request`: If the identifier is missing.
- `404 Not Found`: If no credential is found for the given id or alias.
- `500 Internal Server Error`: If there is a server or data parsing error.

### Notes

- The endpoint first attempts to find a credential by id. If not found, it checks if the id is an alias and resolves it to the credential's UUID.
- If neither is found, a 404 error is returned.
