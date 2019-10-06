import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Form, FormGroup, Label, Input} from 'reactstrap';

import ReactMapGL from 'react-map-gl';

import MapGL, {Marker,Source,Layer} from '@urbica/react-map-gl';
import { watchFile } from 'fs';
// const [viewport, setViewport] = useState({
//   latitude: 18.520430,
//   longitude: 73.856743,
//   width: "100vw",
//   height: "100vh",
//   zoom: 10
// });

const accessToken = "&access_token=pk.eyJ1IjoiYWtzaGF5Mjc5NiIsImEiOiJjazFjbGY2emwwNGZpM25scDcwMjNzMXhlIn0.-D54L9tbYqRfBSaXWgJbrA";


class MapContainer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      viewport: {
        latitude: 18.520430,
        longitude: 73.856743,
        zoom: 10,
      },

      from: '',
      to: '',

      fromLat: '',
      fromLng: '',

      toLat: '',
      toLng: '',

      navigationData: '',
    }
  }


  setFrom = event => {
    var fromText = event.target.value;
    this.setState({from: fromText});
  };

  setTo = event => {
    var toText = event.target.value;
    this.setState({to: toText});
  };

  setFromLocation = async() => {
    const fromText = this.state.from;
    console.log("From: "+fromText);
    var lat='',lng='';
    var length = fromText.length;
      console.log("Length of From: "+length);
      var fromTextURLEncoded = fromText.replace(" ", "%20");
      // console.log("https://api.mapbox.com/geocoding/v5/mapbox.places/"+fromTextURLEncoded+".json?"+accessToken);
      fetch("https://api.mapbox.com/geocoding/v5/mapbox.places/"+fromTextURLEncoded+".json?"+accessToken)
      .then((res) => res.json())
      .then((result) => {
        lat = result.features[0].geometry.coordinates[0];
        lng = result.features[0].geometry.coordinates[1];
        console.log("Latitude: "+lat);
        console.log("Longitude: "+lng);

        this.setState({
          fromLat: result.features[0].geometry.coordinates[0],
          fromLng: result.features[0].geometry.coordinates[1]
        })

        
      })
      .catch((error) => console.error(error));

      return lat+","+lng;
  }

  // setToLocation = async() => {
  //   const toText = this.state.to;
  //   console.log("To: "+toText);
  //   var length = toText.length;
  //     console.log("Length of From: "+length);
  //     var fromTextURLEncoded = toText.replace(" ", "%20");
  //     // console.log("https://api.mapbox.com/geocoding/v5/mapbox.places/"+fromTextURLEncoded+".json?"+accessToken);
  //     fetch("https://api.mapbox.com/geocoding/v5/mapbox.places/"+fromTextURLEncoded+".json?"+accessToken)
  //     .then((res) => res.json())
  //     .then((result) => {
  //       const lat = result.features[0].geometry.coordinates[0];
  //       const lng = result.features[0].geometry.coordinates[1];
  //       console.log("Latitude: "+lat);
  //       console.log("Longitude: "+lng);
  //     })
  //     .catch((error) => console.error(error));
  // }

  submit = async() => {
    //var fromData = '', toData='';
    const fromData = await this.setFromLocation();
    console.log(fromData);

    //const query = fromData.features[0].geometry.coordinates[0]+","+fromData.features[0].geometry.coordinates[1]+";"+toData.features[0].geometry.coordinates[0]+","+toData.features[0].geometry.coordinates[1];
    //console.log(fromData+"\n"+toData);

    //this.fetchNavData();



  }

  fetchNavData = (query) => {
    //const query = this.state.fromLat+","+this.state.fromLng+";"+this.state.toLat+","+this.state.toLng;
    const geoJson = 'geometries=geojson';
    const fullUrl = 'https://api.mapbox.com/directions/v5/mapbox/driving/'+query+".json?"+geoJson+accessToken;
    fetch(fullUrl)
    .then((res) => res.json())
    .then((data) => console.log(data.routes[0].geometry.coordinates))
    .catch((err) => console.error(err));
  }

  onDragEnd = lngLat => {
    this.setState({ fromLng: lngLat.lng, fromLat: lngLat.lat });
  };

  render() {
    return(
      <div className="App d-flex flex-column align-items-center mt-4">
        <div className="d-flex align-items-center justify-content-center text-center">
          <Form>
            <FormGroup>
                <Input type="text" name="from_location" id="fromInput" placeholder="Enter Starting Point" onChange={this.setFrom} />
            </FormGroup>
            <FormGroup>
                <Input type="text" name="to_location" id="toInput" placeholder="Enter Destination Point" onChange={this.setTo} />
            </FormGroup>
            <Button color="primary" className="mx-auto" onClick={this.submit}>Submit</Button>
          </Form>
        </div>
        <MapGL
          {...this.state.viewport}
          style={{width:'95%', height: '80%', marginTop: 30}}
          mapStyle="mapbox://styles/akshay2796/ck1cm1rgs17621cn2l9jd64w5"
          accessToken={"pk.eyJ1IjoiYWtzaGF5Mjc5NiIsImEiOiJjazFjbGphcGcwbTQyM2Rtd2oxZW9tYWRuIn0.0UVb63pN3wW_LIsQWpECIw"}
          onViewportChange={(viewport) => this.setState({ viewport })}
        >
        
          {this.state.fromLat && this.state.fromLng && 
              <Marker
              latitude={this.state.fromLat}
              longitude={this.state.fromLng}
              onDragEnd={this.onDragEnd}
              draggable
            >
              <div>This is the starting position.</div>
            </Marker>
          }

            <Source id="route" type="geojson" data={"{type: 'Feature',geometry: {type: 'LineString',"+this.state.navigationData+"}};"} />
              <Layer
                id="route"
                type="line"
                source="route"
                layout={{
                  'line-join': 'round',
                  'line-cap': 'round'
                }}
                paint={{
                  'line-color': '#888',
                  'line-width': 8
                }}
              />
        </MapGL>
      </div>
    );
  }
}


export default MapContainer;

// export default GoogleApiWrapper({
//   apiKey: 'AIzaSyBjlS4g9wxxrXb90IJLp_3oVfOfP4LkI1w'
// })(MapContainer);
