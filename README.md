============================================================
PROJECT SETUP GUIDE

This guide explains everything required to install and run
the project on a Windows development machine.

The project contains three applications:

API -> Node.js / Express backend

Frontend -> React application

Admin -> React administration dashboard

============================================================

NODE.JS & NPM
============================================================

Install the latest LTS version of Node.js:

https://nodejs.org/en/download

Node.js includes npm automatically.

Verify the installation by running:

node --version
npm --version


Both commands should return a version number without errors.

============================================================
2. MONGODB
MongoDB Server

Install MongoDB Community Server:

https://www.mongodb.com/try/download/community

Verify the installation:

mongod --version

MongoDB Compass

MongoDB Compass is RECOMMENDED for viewing and managing
MongoDB databases.

Download MongoDB Compass:

https://www.mongodb.com/products/tools/compass

Compass is optional and is not required to run the project.

============================================================
3. DOCKER
Docker Desktop

Docker Desktop is RECOMMENDED.

Download Docker Desktop:

https://www.docker.com/products/docker-desktop/

After installation, start Docker Desktop.

Verify the installation:

docker --version

Install Docker with winget

If Docker Desktop is not already installed, PowerShell can
be used to install it.

Run PowerShell as Administrator and execute:

winget install Docker.DockerDesktop


After installation, start Docker Desktop and verify:

docker --version

============================================================
4. INSTALL PROJECT DEPENDENCIES

The project contains three separate applications.

Do NOT install the project's npm packages globally.

Each application has its own package.json file.

Run "npm install" separately inside each application.

4.1 API

The API is the Node.js / Express backend.

Open PowerShell in the project directory and run:

cd api
npm install


The API currently uses:

- Express
- MongoDB
- Mongoose
- bcryptjs
- Busboy
- cookie-parser
- dotenv
- express-validator
- jsonwebtoken
- morgan
- passport
- passport-jwt


Start the API with:

npm start

4.2 FRONTEND

The frontend is the main React application.

Run:

cd front
npm install


The frontend currently uses:

- React
- React DOM
- Vite
- Vite React plugin
- Babel
- React Compiler
- oxlint


Start the frontend development server with:

npm run dev

4.3 ADMIN DASHBOARD

The admin application is the React administration dashboard.

Run:

cd admin
npm install


The admin dashboard currently uses:

- React
- React DOM
- React Router
- Material Tailwind
- Tailwind CSS
- Heroicons
- ApexCharts
- React ApexCharts
- DnD Kit
- bcrypt
- Vite
- PostCSS
- Autoprefixer
- Prettier


Start the admin development server with:

npm run dev

============================================================
5. PIXIJS

PixiJS is NOT currently listed in any of the provided
package.json files.

Therefore, PixiJS does not need to be installed as part of
the current project setup.

If PixiJS is required in the future, install it from the
frontend directory:

cd front
npm install pixi.js


Verify the installation with:

npm list pixi.js

============================================================
6. VERIFY THE ENVIRONMENT

The following commands should complete without errors:

node --version
npm --version
mongod --version
docker --version


After installing the project dependencies, the following
commands can be used to verify the main packages.

API
cd api

npm list express
npm list mongodb
npm list mongoose

FRONTEND
cd front

npm list react
npm list vite

ADMIN
cd admin

npm list react
npm list vite

============================================================
7. QUICK SETUP

For a new Windows development machine, follow these steps.

STEP 1 - Check Node.js and npm

node --version
npm --version


STEP 2 - Check MongoDB

mongod --version


STEP 3 - Check Docker

docker --version


STEP 4 - Install API dependencies

cd api
npm install


STEP 5 - Install frontend dependencies

cd ..\front
npm install


STEP 6 - Install admin dependencies

cd ..\admin
npm install

============================================================
8. IMPORTANT NOTES

Do NOT install project npm packages globally.

Run "npm install" separately inside:
api
front
admin

package.json and package-lock.json should be treated as
the source of truth for npm dependencies.

MongoDB Server is required if the project uses a local
MongoDB instance.

MongoDB Compass is recommended but optional.

Docker Desktop is recommended but optional unless the
project uses Docker containers.

PixiJS is NOT currently included in the provided
dependencies.

Express, MongoDB, Mongoose, React, Vite, and the other
npm packages are installed automatically when running
"npm install".

If the project already contains package-lock.json files,
do not delete them unless there is a specific reason.

============================================================
SETUP COMPLETE

Once the required software and npm dependencies have been
installed, the API, frontend, and admin applications can
be started using their respective npm scripts.