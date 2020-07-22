# departr - Train Times

departr allows you to search for train stations and view their departures.

There are plans for enhancement of the service, including favourite journeys, timetable synchronisation, notifications, and more. See **Future Goals** below for more information.

departr is looking for contributors. `git clone` and start hacking!

## Prerequisites

**Currently, departr will only run on Windows.** UNIX support is planned, but currently not a priority.

To run departr yourself...

1. Register with OpenLDBWS and get an authentication token [here](http://realtime.nationalrail.co.uk/OpenLDBWSRegistration/)
2. Register with the NRE Open Rail Data service
    * Instructions to be added
3. Create `/.env` from `/example.env` and add credentials
4. Add `mongod` from MongoDB installation to `PATH` and install it as a system service (departr launches it automatically)
5. Run `yarn populate-db`
6. Run `yarn serve` to start both the API and the React app concurrently

**The API requires a MongoDB instance to function.** *`mongod` should exist in `PATH` in case of future changes.* departr requires this because some of the data used by departr comes from the NRE API in a gigantic 30MB XML file, which then has to be parsed to JSON. Luckily, this file rarely needs updating, so database entries can be static. In the future, user accounts will be stored in this database too.

**The database must be populated before the server is first started.** To do this, run `yarn populate-db`. A 30MB file will be downloaded every time the database is populated. This means that population *will take a very, very long time*, because the NRE server is incredibly slow, and it will use a lot of network bandwidth. For this reason, **avoid populating the database on a metered connection.**

## Run

Run one of the following to serve the site and/or proxy server:

* `yarn serve` to run the full app
* `yarn start` to run the front-end React application *only*
* `yarn server` to run the proxy server and database

## Project Aims

* Fully responsive front-end
* Remain simple and easy-to-use

### Technologies

* TypeScript
* MongoDB
* Express
* React.js
* MERN Stack

### Future Goals

* Create a plan for monetisation, such as premium features/API
* Allow public access to API with authentication middleware
* Cache station results for up to 30 seconds
* Combine realtime expected times with timetabled times for future results
* Allow a user to make an account and save favourite stations/services/routes
* Enable tracking of specific services with notifications on PWA
* Integrate bus, cycle, and coach tracking services, with connections to train services for full journey planning

## Licence

This project is currently licenced under the MIT licence.
