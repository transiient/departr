# departr - Train Times

departr is a project with a simple aim: **to allow you to view station departures**.

There are plans to enhance the service. These include the addition of user accounts for favourite journeys, timetable synchronisation, notifications, and more. See **Future Goals** below for more information.

**departr is looking for contributors!** `git clone` and start hacking.

## Prerequisites

departr should run on Windows, Linux, and macOS. A Docker image is planned for the future, also.

To run departr:

1. Register with OpenLDBWS and get an authentication token [here](http://realtime.nationalrail.co.uk/OpenLDBWSRegistration/)
2. Register with the NRE Open Rail Data service
3. Copy `/example.env` to `/.env` and add your credentials
4. **Windows only:** Add `mongod` from MongoDB installation to `PATH` and install it as a system service
5. **First-time only:** Run `yarn populate-db`
6. Run `yarn serve` to start both the API and the React app concurrently

**The API requires a MongoDB instance to function.** If you're on Windows, _`mongod` should exist in `PATH`_. departr requires this because some of the data used by departr comes from the NRE API in an XML file, which is a painfully slow download. This then has to be parsed to JSON. In the future, user accounts will be stored in this database too.

**The database must be populated before the server is first started.** To do this, run `yarn populate-db`. A 30MB file will be downloaded every time the database is populated. Populating the stations database _will take a very, very long time_, because the NRE server is incredibly slow. For this reason, **avoid populating the database unless you know about an update.** In the future, these updates will be run automatically by departr, in the background, to ensure service reliability.

## Run

Run one of the following to serve the site and/or API server:

-   `yarn serve` to run the full app
-   `yarn start` to run the front-end React application _only_
-   `yarn server` to run the proxy server and database

**NOTE**: MongoDB must be running as a service before starting the API server. To do this on Windows, use the following command: `powershell -Command \"Start-Process -FilePath 'net' -ArgumentList 'start MongoDB' -Verb runAs\"`

-   `cd frontend && yarn start` to run the front-end React application _only_
-   `cd backend && yarn server` to run the departr API server and database

## Goals

-   Create a plan for monetisation, such as premium features/API
-   Allow public access to API with authentication middleware
-   Cache station results for up to 30 seconds
-   Combine realtime expected times with timetabled times for future results
-   Allow a user to make an account and save favourite stations/services/routes
-   Enable tracking of specific services with notifications on PWA
-   Integrate bus, cycle, and coach tracking services, with connections to train services for full journey planning

## Plans

1. Build MVP backend with the following:
    - Accounts (log in, log out, register)
    - RAIL
        - Stations search
        - Locations search
        - Station departures
        - Nearby departures
2. Cache the following:
    - Locations search results
    - Station departures
    - 30s cache timeout

### Future Goals

-   Create a plan for monetisation
    -   Premium features
    -   Early-access features
    -   API access
    -   Advanced notifications
-   Allow public access to API with authentication middleware
-   Cache station results for up to 30 seconds
-   Combine realtime expected times with timetabled times for future results
-   Allow a user to make an account and save favourite stations/services/routes
-   Enable tracking of specific services with notifications on PWA
-   Integrate bus, cycle, and coach tracking services, with connections to train services for full journey planning

## Licence

This project is currently licenced under the MIT licence.
