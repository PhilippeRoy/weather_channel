var http = require('http'),
	MongoClient = require('mongodb').MongoClient,
	keys = require('./keys');

var URL = 'http://api.wunderground.com/api/'+keys.weatherApi+'/conditions/q/Australia/Melbourne.json';

function addWeatherData(data) {
	MongoClient.connect('mongodb://localhost/test', function (err, db) {
		if (err) throw err;
		var cursor = db.collection('melbourneWeatherData');

		cursor.count(function (err, count) {
			//console.log(count);

			if (count > 5) {
				// deletes the oldest item (document) if the collection is larger than 5
				cursor.remove({}, {single: 1}, function (err, result) {
					if (err) throw err;
					console.log('Deleted ' + result);
				});
			}
		})


		// insert weather data
		// cursor.insert(data, function (err, result) {
		// 	if (err) throw err;
		// 	db.close();
		// });
	});
}

http.get(URL, function (res) {
	var body = '';

	res.on('data', function (data){
		// The data comes in chunks which cannot be set to the db until it complete
		body += data;		
	});
	
	res.on('end', function () {
		// turn data into JSON to store into db
		// var json = JSON.parse(body);
		// addWeatherData(json);
		console.log(body);
	})
});


//addWeatherData({test:true});
