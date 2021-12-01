** Setup

The backend uses Mongoose to connect to a MongoDB instance.  The connection string is stored in an environment variable (which is not included in the repo for obvious reasons).
Using NPM, install DOTENV.
Create a .env file in the root directory.

In the .env file, define a constant with the connection string.  Example:
DB_CONNECTION=xxx