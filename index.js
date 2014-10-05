var http = require('http'),
	MongoClient = require('mongodb').MongoClient;

var weatherApi = process.env.WUNDERGROUND;
var uristring = process.env.MONGOLAB_URI;
var URL = 'http://api.wunderground.com/api/'+weatherApi+'/conditions/q/Australia/Melbourne.json';

function addWeatherData(data) {
	MongoClient.connect(uristring, function (err, db) {
		if (err) throw err;
		
		var cursor = db.collection('melbourneWeatherData');		

		// insert weather data
		cursor.insert(data, function (err, result) {
			if (err) throw err;

			// count db collection size
			cursor.count(function (err, count) {

			if (count <= 5) {
				db.close();
			}

			if (count > 5) {
				// deletes the oldest item (document) if the collection is larger than 5
				cursor.remove({}, {single: 1}, function (err, result) {
					if (err) throw err;
					db.close();
					//console.log('Deleted ' + result);
					});
				}
			});

			//db.close();
		});
	});
}

function getWeatherData() {
	console.log('Making request');
	http.get(URL, function (res) {
		var body = '';

		res.on('data', function (data){
			// The data comes in chunks which cannot be set to the db until it complete
			body += data;		
		});
		
		res.on('end', function () {
			//turn data into JSON to store into db
			var json = JSON.parse(body);
			addWeatherData(json);
		})
	});
}

console.log('Up and Running');
getWeatherData();
setInterval(getWeatherData, 1800*1000); // 30 mins