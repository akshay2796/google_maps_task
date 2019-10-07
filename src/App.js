import React, { Component, Fragment } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';

import ReactMapGL from 'react-map-gl';

import MapGL, { Marker, Source, Layer } from '@urbica/react-map-gl';
import axios from 'axios';

const accessToken =
	'&access_token=pk.eyJ1IjoiYWtzaGF5Mjc5NiIsImEiOiJjazFjbGY2emwwNGZpM25scDcwMjNzMXhlIn0.-D54L9tbYqRfBSaXWgJbrA';

var queryValue = null;
var navFullData = null;
var navArray = [];

class MapContainer extends Component {
	constructor(props) {
		super(props);

		this.state = {
			viewport: {
				latitude: 18.52043,
				longitude: 73.856743,
				zoom: 10,
			},

			from: '',
			to: '',

			fromLat: '',
			fromLng: '',

			toLat: '',
			toLng: '',
		};
	}

	setFrom = event => {
		var fromText = event.target.value;
		this.setState({ from: fromText });
	};

	setTo = event => {
		var toText = event.target.value;
		this.setState({ to: toText });
	};

	setFromLocation = async () => {
		const fromText = this.state.from;
		console.log('From: ' + fromText);
		var lat = '',
			lng = '';
		var length = fromText.length;
		console.log('Length of From: ' + length);
		var fromTextURLEncoded = fromText.replace(' ', '%20');
		const url =
			'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
			fromTextURLEncoded +
			'.json?' +
			accessToken;
		// fetch(
		// 	'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
		// 		fromTextURLEncoded +
		// 		'.json?' +
		// 		accessToken,
		// )
		// 	.then(res => res.json())
		// 	.then(result => {
		// 		const lat = result.features[0].geometry.coordinates[0];
		// 		const lng = result.features[0].geometry.coordinates[1];
		// 		this.setState({
		// 			fromLat: lat,
		// 			fromLng: lng,
		// 		});
		// 	})
		// 	.catch(error => console.log(error));

		return fetch(url)
			.then(res => res.json())
			.then(result => {
				const lat = result.features[0].geometry.coordinates[0];
				const lng = result.features[0].geometry.coordinates[1];

				console.log('Latitude: ' + lat);
				console.log('Longitude: ' + lng);

				this.setState({
					fromLat: lat,
					fromLng: lng,
				});
			});
	};

	setToLocation = async () => {
		const toText = this.state.to;
		console.log('To: ' + toText);
		var length = toText.length;
		console.log('Length of From: ' + length);
		var fromTextURLEncoded = toText.replace(' ', '%20');
		const url =
			'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
			fromTextURLEncoded +
			'.json?' +
			accessToken;
		return fetch(url)
			.then(res => res.json())
			.then(result => {
				const lat = result.features[0].geometry.coordinates[0];
				const lng = result.features[0].geometry.coordinates[1];

				console.log('Latitude: ' + lat);
				console.log('Longitude: ' + lng);

				this.setState({
					toLat: lat,
					toLng: lng,
				});
			});
	};

	fetchNavData = async query => {
		//const query = this.state.fromLat+","+this.state.fromLng+";"+this.state.toLat+","+this.state.toLng;
		const geoJson = 'geometries=geojson';
		const fullUrl =
			'https://api.mapbox.com/directions/v5/mapbox/driving/' +
			query +
			'.json?' +
			geoJson +
			accessToken;
		console.log('Navigation URL: ' + fullUrl);
		var navData;
		await fetch(fullUrl)
			.then(res => res.json())
			.then(data => {
				navData = data.routes[0].geometry.coordinates;
				// this.setState({
				// 	navigationData: data.routes[0].geometry.coordinates,
				// }),

				navData.map((item, key) => {
					// console.log(key + ':' + item);
					navArray.push('[' + item + ']');
				});

				// console.log('NavArray: ' + navArray);

				const jsonUrl =
					'{"type": "Feature","geometry": {"type": "LineString","coordinates": [' +
					navArray +
					']}}';

				// console.log('JSON URL: ' + jsonUrl);

				this.navFullData = JSON.parse(jsonUrl);

				console.log('JSON DATA: ' + JSON.stringify(this.navFullData));

				// this.setState(prevState => {
				// 	return {
				// 		viewport: {
				// 			...prevState.viewport,
				// 			zoom: 12,
				// 		},
				// 	};
				// });

				this.forceUpdate();
			})
			.catch(err => console.error(err));

		//console.log(navData);
		return navFullData;
	};

	submit = async () => {
		//var fromData = '', toData='';
		const fromData = await this.setFromLocation();
		console.log('Latitude (From): ' + this.state.fromLat);
		console.log('Longitude (From): ' + this.state.fromLng);
		const toData = await this.setToLocation();
		console.log('Latitude (To): ' + this.state.toLat);
		console.log('Longitude (To): ' + this.state.toLng);
		const query =
			this.state.fromLat +
			',' +
			this.state.fromLng +
			';' +
			this.state.toLat +
			',' +
			this.state.toLng;
		console.log('QUERY: ' + query);
		await this.fetchNavData(query);
		// const navData = await this.fetchNavData(query);
		// console.log(navData);
		//console.log('Nav Data: ' + this.state.navigationData);
	};

	render() {
		return (
			<div className='App d-flex flex-column align-items-center mt-4'>
				<div className='d-flex align-items-center justify-content-center text-center'>
					<Form>
						<FormGroup>
							<Input
								type='text'
								name='from_location'
								id='fromInput'
								placeholder='Enter Starting Point'
								onChange={this.setFrom}
							/>
						</FormGroup>
						<FormGroup>
							<Input
								type='text'
								name='to_location'
								id='toInput'
								placeholder='Enter Destination Point'
								onChange={this.setTo}
							/>
						</FormGroup>
						<Button
							color='primary'
							className='mx-auto'
							onClick={this.submit}
						>
							Submit
						</Button>
					</Form>
				</div>
				<MapGL
					{...this.state.viewport}
					style={{ width: '95%', height: '80%', marginTop: 30 }}
					mapStyle='mapbox://styles/akshay2796/ck1cm1rgs17621cn2l9jd64w5'
					accessToken={
						'pk.eyJ1IjoiYWtzaGF5Mjc5NiIsImEiOiJjazFjbGphcGcwbTQyM2Rtd2oxZW9tYWRuIn0.0UVb63pN3wW_LIsQWpECIw'
					}
					onViewportChange={viewport => this.setState({ viewport })}
				>
					{this.navFullData && (
						<Fragment>
							<Source
								id='route'
								type='geojson'
								data={this.navFullData}
							/>
							<Layer
								id='route'
								type='line'
								source='route'
								layout={{
									'line-join': 'round',
									'line-cap': 'round',
								}}
								paint={{
									'line-color': '#336666',
									'line-width': 6,
								}}
							/>
						</Fragment>
					)}
				</MapGL>
			</div>
		);
	}
}

export default MapContainer;

// export default GoogleApiWrapper({
//   apiKey: 'AIzaSyBjlS4g9wxxrXb90IJLp_3oVfOfP4LkI1w'
// })(MapContainer);
