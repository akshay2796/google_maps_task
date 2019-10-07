import React, { Component, Fragment } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { MapboxLayer } from '@deck.gl/mapbox';
import { ArcLayer } from '@deck.gl/layers';

import MapGL, { Marker, Source, Layer } from '@urbica/react-map-gl';

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
				zoom: 12,
			},

			from: '',
			to: '',

			fromLatLng: '',
			toLatLng: '',

			fromLat: '',
			fromLng: '',

			toLat: '',
			toLng: '',
		};

		const myDeckLayer = new MapboxLayer({
			id: 'deckgl-arc',
			type: ArcLayer,
			data: [
				{
					source: Arrays.from(this.state.fromLatLng),
					target: Arrays.from(this.state.toLatLng),
				},
			],
			getSourcePosition: d => d.source,
			getTargetPosition: d => d.target,
			getSourceColor: [255, 208, 0],
			getTargetColor: [0, 128, 255],
			getStrokeWidth: 8,
		});

		console.log(myDeckLayer);
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
		const url =
			'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
			fromText.replace(' ', '%20') +
			'.json?' +
			accessToken;

		return fetch(url)
			.then(res => res.json())
			.then(result => {
				const lat = result.features[0].geometry.coordinates[0];
				const lng = result.features[0].geometry.coordinates[1];

				// this.setState({
				// 	fromLat: lat,
				// 	fromLng: lng,
				// });

				this.setState({ fromLatLng: lat + ',' + lng });
			});
	};

	setToLocation = async () => {
		const toText = this.state.to;
		const url =
			'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
			toText.replace(' ', '%20') +
			'.json?' +
			accessToken;

		return fetch(url)
			.then(res => res.json())
			.then(result => {
				const lat = result.features[0].geometry.coordinates[0];
				const lng = result.features[0].geometry.coordinates[1];

				// this.setState({
				// 	toLat: lat,
				// 	toLng: lng,
				// });

				this.setState({ toLatLng: lat + ',' + lng });
			});
	};

	fetchNavData = async query => {
		//const query = this.state.fromLat+","+this.state.fromLng+";"+this.state.toLat+","+this.state.toLng;
		const geoJson = 'geometries=geojson';
		const fullUrl =
			'https://api.mapbox.com/directions/v5/mapbox/driving/' +
			query +
			'.json?geometries=geojson' +
			accessToken;

		console.log('Navigation URL: ' + fullUrl);

		var navData;
		await fetch(fullUrl)
			.then(res => res.json())
			.then(data => {
				navData = data.routes[0].geometry.coordinates;

				navData.map((item, key) => {
					navArray.push('[' + item + ']');
				});

				const jsonUrl =
					'{"type": "Feature","geometry": {"type": "LineString","coordinates": [' +
					navArray +
					']}}';

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
	};

	submit = async () => {
		await this.setFromLocation();
		await this.setToLocation();
		const query = this.state.fromLatLng + ';' + this.state.toLatLng;
		await this.fetchNavData(query);
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
					mapStyle='mapbox://styles/mapbox/light-v9'
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
