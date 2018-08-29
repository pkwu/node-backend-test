import axios from 'axios';
import { fetchSingleUserHelper } from './userHelpers';

const mapboxAPIKey = process.env.mapboxAPIKey || 'MUST-REPLACE-WITH-APIKEY-TO-PASS-TEST';

const fetchUserLocationCoordinates = async (req, res) => {
  try {
    const singleUser = await fetchSingleUserHelper(req.params);
    const loc = singleUser.address.split(' ').join('%20');
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${loc}.json?access_token=${mapboxAPIKey}`;
    const coords = await axios.get(url);
    if (coords && coords.data) {
      const [longitude, latitude] = coords.data.features[0].center;
      res.status(200).send({latitude, longitude});
    } else {
      throw new Error;
    }
  }
  catch (err) {
    res.status(400).send({error: 'Unable to fetch location information from user id'});
  }
};

export { fetchUserLocationCoordinates };