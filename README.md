# departr - the Travel Tracker.

departr is a project **led by a passion for travel**. Originally a rail departure tracker, departr is now being re-written from the ground up to become a one-stop destination for travel.

**departr is looking for contributors!** If you're interested, feel free to start working on a feature which hasn't yet been claimed. See the GitHub Projects page for details, or ask a maintainer.

## Planned Features

-   **Travel Planning**
    -   View station departures
        -   Rail **[MVP]**
        -   Bus
        -   Tram
        -   Cycle
        -   Metro (Tube)
    -   Save and track journeys
    -   Search and display destinations
        -   Cities and attractions **[MVP]**
        -   Destination permalinks **[MVP]**
-   **Destinations, Sharing, and Accounts**
    -   User accounts
        -   Log in, log out, user registration **[MVP]**
        -   Username, name, bio, social links, etc. **[MVP]**
    -   Share destinations
        -   Share with other users
        -   Link sharing **[MVP]**
    -   Share photos from your journey
        -   Direct uploads
        -   Public, private, unlisted
        -   External links
            -   Instagram
            -   Flickr
            -   Pinterest
-   **Following and Notifications**
    -   Follow travellers
    -   Follow departures and routes
    -   Departure notifications
    -   Traveller "following" notifications
        -   New destinations
        -   New photos
        -   Updates and news

### Planned Features (Future)

-   Realtime "expected" times match scheduled times
-   Cache
    -   Departure results (up to 30s)
    -   Stations, station status (up to 6h, status up to 30m)
-   Monetisation _(unfortunately we have to make money somehow, to keep the platform running)_
    -   Premium/early-access features
    -   Private API
    -   Advanced Features
-   Public API
-   Notifications on PWA
-   Track multiple services, enabling multi-mode connections for full journey planning

## Run departr

departr should run on Windows, Linux, and macOS. A Docker image is planned for the future, also.

You can self-host departr, but there's a few things you need to do first:

1. Register with OpenLDBWS and get an authentication token [here](http://realtime.nationalrail.co.uk/OpenLDBWSRegistration/)
2. Register with the NRE Open Rail Data service
3. Copy `/example.env` to `/.env` and add your credentials
4. Start MongoDB
    - **Windows:** Add `mongod` from MongoDB installation to `PATH` and install it as a system service
    - **UNIX:** Start the MongoDB system service (usually with systemd)
5. Start the API and frontend independently

**The API uses MongoDB as a database.** That's how we store stuff. **Parts of the stored data will be checked for integrity on each start** and at certain periods (probably each 12 hours); however, this will be done in the background when data already exists. A 30MB file will be downloaded, painfully slowly, every time the database is populated.

### yarn Scripts

Run one of the following to serve the site and/or API server:

-   `cd frontend && yarn dev` to start the frontend application (website)
-   `cd backend && yarn dev` to start the backend application (API)

**NOTE**: MongoDB must be running as a service before starting the API server. On Windows, use the following command: `powershell -Command \"Start-Process -FilePath 'net' -ArgumentList 'start MongoDB' -Verb runAs\"`

## Licence

**The entire departr project is licenced under the MIT licence.** Please feel free to fork and extend it!
