# Departr - Train Tracker

I was sick of trying to find a page with *just train times*, so I made Departr.

## Build and Run

1. Register for an OpenLDBWS token [here](http://realtime.nationalrail.co.uk/OpenLDBWSRegistration/)
2. Copy `/example.env` to `/api/.env` and insert the following:
    * The token you just received
    * The latest URL of the OpenLDBWS API (available [here](https://lite.realtime.nationalrail.co.uk/openldbws/))
3. Run `yarn` to install dependencies
4. Run one of the following to serve the site and/or proxy server:
    * `yarn serve` to run both
    * `yarn start` to run *only* the React app
    * `yarn server` to run *only* the proxy server
5. Enjoy!

## Project Aims

* Look good and be responsive
* Implement backend API which combines current times with timetables
    * Includes few-second caching to minimise server requests and speed up responses
* Remain simple and easy-to-use
* PWA with departure notifications (bell button beside entries on departure list)
* *?* Accounts with the option to save regularly-timetabled journies
    * Email notifications with travel updates

## Licence

This project is currently licenced under the MIT licence.