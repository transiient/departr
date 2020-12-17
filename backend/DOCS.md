# departr API

The departr API offers various information about transportation services, operators, and stations.

## JSON Endpoints

### /
#### Body
None
#### Response
```
{
    message: ""
}
```

### /train/stations/:CRS/details
Details of station CRS
#### Params
`CRS`: A three-letter station CRS code

### /train/stations/:CRS/services
Services departing from station CRS.
#### Params
`CRS`: A three-letter station CRS code

### /search/:QUERY/:FILTERS?
#### Params
`QUERY`: URL-encoded search query
`FILTERS`: Search filters *(OPTIONAL)*