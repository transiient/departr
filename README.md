# departr - Train Tracker

I was sick of trying to find a page with *just train times*, so I made departr.

departr allows you to search for train stations and view departures.

## Prerequisites

1. Register for an OpenLDBWS token [here](http://realtime.nationalrail.co.uk/OpenLDBWSRegistration/)
2. Copy `/example.env` to `/.env` and insert the following:
    * The token you just received
    * The latest URL of the OpenLDBWS API (available [here](https://lite.realtime.nationalrail.co.uk/openldbws/))
3. Run `yarn` to install dependencies

The API requires a MongoDB instance to function. *`mongod` must exist in `PATH`.* Why is MongoDB required? Some of the data used by departr comes from the NRE API in a gigantic 30MB XML file, which then has to be parsed to JSON. Luckily, this file rarely needs updating, so database entries can be static.

**The database must be populated before the server is first started.** To do this, run `yarn populate-db`. A *gigantic* file will be downloaded every time the database is populated. This means that population *will take a very, very long time*, and use a lot of network bandwidth. For this reason, **you should avoid populating on a metered connection.** The MongoDB instance will be started alongside the server when using the `yarn server` command.

The database schemas can be viewed in `/api/db/schemas`.

## Run

Run one of the following to serve the site and/or proxy server:
    * `yarn serve` to run the full app
    * `yarn start` to run the front-end React application *only*
    * `yarn server` to run the proxy server and database
    * `yarn server-ts` to run *only* the proxy server, without a database (this is pointless)

## Project Aims

* Fully responsive front-end
* Remain simple and easy-to-use
* Back-end API which combines current times with timetables
    * Implements caching to minimise server requests and speed up responses
* PWA with departure notifications (bell button beside entries on departure list)
* *?* Accounts with the option to save regularly-timetabled journies
    * Email notifications with travel updates

### Future Goals

* Integrate a plan for monetisation
* Combine realtime expected times with timetabled times for future results
    * Enable tracking of specific services with notifications on PWA
* Integrate bus, cycle, and coach tracking services
    * Link these with trains for connecting services

## Licence

This project is currently licenced under the MIT licence.