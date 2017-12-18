'use strict';
var axios = require('axios');
const flickrAPIKey = "4f82ff77219418d9ff8524e42e9cc12d";
const flickrSecret = "2e051e5d3a5ffa88";
const googleAPIKey = "";
var util = require('util');


module.exports = {
  streetart: streetart
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function streetart(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var city = req.swagger.params.city.value || 'Prague';

  var urlLocation = "https://maps.googleapis.com/maps/api/geocode/json?address="+city+"&key=AIzaSyBotO1CVieCQnj7cQyPaF2g9PNKllB4XeE"

  var streetart = {},
    promises = [];

  axios.get(urlLocation).then(function(response){
    console.log(response.data.results[0].geometry.location);
    var location = response.data.results[0].geometry.location;
    axios.get('https://api.flickr.com/services/rest', {
      params: {
        method: "flickr.photos.search",
        api_key: flickrAPIKey,
        text: "streetart",
        lat: location.lat,
        lon: location.lng,
        radius: 30,
        format: "json",
        nojsoncallback: 1
      }
    })
      .then(function (response) {
        var arrayOfPhotos = response.data.photos.photo;
  
        arrayOfPhotos.forEach(photo => {
          var promise = axios.get('https://api.flickr.com/services/rest', {
            params: {
              method: "flickr.photos.getInfo",
              api_key: flickrAPIKey,
              photo_id: photo.id,
              format: "json",
              nojsoncallback: 1
            }
          });
  
          promises.push(promise);
        });
        return promises;
  
      }).then(function (promises) {
        //console.log(promises);
        axios.all(promises).then(function (results) {
          var photos =[];
          results.forEach(function (response) {
            var photo = response.data.photo;
            var photoObj = {
                author: photo.owner.username,
                text: photo.title._content,
                lat: photo.location.latitude,
                lon: photo.location.longitude,
                date: photo.dates.posted,
                urlFlickerThumb: buildThumbnailUrl(photo),
                urlFlickerSmall: buildPhotoSmallUrl(photo)
            };
            photos.push(photoObj);
  
  
          });
          streetart = {
            city: city,
            lat: "50.0755381",
            lon: "14.43780049999998",
            photos: photos
          }
          res.json(streetart);
        });
  
      }).catch(function (error) {
        console.log(error);
      });

  });

  

  
  
}


/*axios.get('https://api.flickr.com/services/rest', {
  params: {
    method: "flickr.photos.search",
    api_key: flickrAPIKey,
    text: "streetart",
    lat: "50.0755381",
    lon: "14.43780049999998",
    radius: 30,
    format: "json",
    nojsoncallback: 1
  }
})
.then(function (response) {
  //console.log(response.data.photos.photo);
  return response.data.photos.photo;
  
}).then(function(arrayPhotos){
   var photos = [];
   for(let i=0; i < 0; i++){
       var id = arrayPhotos[i].id;
       var photoObj = {};
       // GET INFO ABOUT EACH PHOTO FROM FLICKR API
       axios.get('https://api.flickr.com/services/rest', {
          params: {
            method: "flickr.photos.getInfo",
            api_key: flickrAPIKey,
            photo_id: id,
            format: "json",
            nojsoncallback: 1
          }
        })
        .then(function (response) {
          //console.log(response);
          var photo = response.data.photo;
          var photoObj = {
              author: photo.owner.username,
              text: photo.title._content,
              lat: photo.location.latitude,
              lon: photo.location.longitude,
              date: photo.dates.posted,
              urlFlickerThumb: buildThumbnailUrl(photo),
              urlFlickerSmall: buildPhotoSmallUrl(photo)
          };

          photos.push(photoObj);
        })
        .catch(function (error) {
          console.log(error);
        });
   }
   console.log(photos);
   var streetart = {
       city: city,
       lat: "50.0755381",
       lon: "14.43780049999998",
       photos: photos
   }
   return streetart;
})
.catch(function (error) {
  console.log(error);
});*/

function buildThumbnailUrl(photo) {
  return 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server +
    '/' + photo.id + '_' + photo.secret + '_q.jpg';
}

function buildPhotoSmallUrl(photo) {
  return 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server +
    '/' + photo.id + '_' + photo.secret + '_m.jpg';
}

function buildPhotoUrl(photo) {
  return 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server +
    '/' + photo.id + '_' + photo.secret + '.jpg';
}

function buildPhotoLargeUrl(photo) {
  return 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server +
    '/' + photo.id + '_' + photo.secret + '_b.jpg';
}