# House Market Place

This is a market place where you can post a house to be rent or to sale.

## API from positionstack.com

#### Get all items

This is used on CreatedListing.jsx and EditListing.jsx, in the field of the form you need to put the address of the house and this would give back the geolocalitation of the place, this woulb be used to show the location of the house on the map.

```http
  http://api.positionstack.com/v1/forward?access_key=${accessToken}&query=${address}&country_module=1&limit=1
```

| Parameter | Type     | Description               |
| :-------- | :------- | :------------------------ |
| `api_key` | `string` | **Required**. accessToken |
| `Input`   | `string` | **Required**. address     |

## License

[MIT](https://choosealicense.com/licenses/mit/)
