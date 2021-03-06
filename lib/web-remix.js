/* Embed media if it matches any of the following:
 * 1. Is a Youtube link
 * 2. Is a Vimeo link
 * 3. Is a general link
 * 4. Is a file with a jpg|jpeg|png|gif extension
 * 5. Is an video or audio extension matching mp3|ogg|webm|ogv|mp4
*/
var request = require('request');
var serviceDefault = 'web';
var serviceImage = /(jpg)|(jpeg)|(png)|(gif)$/i;
var serviceAudio = /(mp3)|(ogg)$/i;
var serviceVideo = /(webm)|(ogv)|(mp4)$/i;
var serviceVimeo = /vimeo/i;
var serviceYoutube = /(youtube)|(youtu\.be)/i;
var emotiHeart = '&lt;3';
var videoHeight = 281;
var videoWidth = 500;
var nickMatcher = new RegExp(/^(\/nick\s)([a-zA-Z0-9_]+)/i);
var meMatcher = /^(\s\/me\s)/i;

exports.generate = function(content) {
  // parse the current url to determine where to process it.
  this.parseWords = function(media) {
    var result = '';
    var url = media.split('/');
    var protocol = url[0].toLowerCase();

    // get rid of any html
    media = media.replace(/</gm, '&lt;');
    media = media.replace(/>/gm, '&gt;');
    media = media.replace(/\"/gm, '&quot;');
    media = media.replace(/;base64/gm, '');

    if (protocol === 'http:' || protocol === 'https:') {
      // this is a link, so let's do some more analysis
      try {
        if (media.match(serviceYoutube)) {
          var youtubeId = "";
          if (media.indexOf('youtu.be') > -1) {
            youtubeId = url[url.length - 1];
          } else {
            youtubeId = url[url.length - 1].split('v=')[1].split('&')[0];
          }

          result = '<iframe width="' + videoWidth + '" height="' + videoHeight + '" ' +
                   'src="http://www.youtube.com/embed/' + youtubeId + '" frameborder="0" ' +
                   'allowfullscreen></iframe>';

        } else if (media.match(serviceVimeo)) {
          var vimeoId = url[url.length - 1];
          result = '<iframe src="http://player.vimeo.com/video/' + vimeoId + '" ' +
                   'width="' + videoWidth + '" height="' + videoHeight + '" frameborder="0" ' +
                   'webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';

        } else if (media.match(serviceImage)) {
          result = '<img src="' + media + '">';

        } else if (media.match(serviceAudio)) {
          var audioType = media.split('.');
          audioType = audioType[audioType.length - 1];
          result = '<audio controls="controls" preload="auto" autobuffer>' +
            '<source src="' + media + '" type="audio/' + audioType + '" /></audio>' +
            '<a href="' + media + '" target="_blank">' + media + '</a>';

        } else if (media.match(serviceVideo)) {
          var videoType = media.split('.');
          videoType = videoType[videoType.length - 1];
          
          var videoFormat = '';
          if(videoType === 'webm') {
            videoFormat = 'type="video/webm; codecs="theora, vorbis"';
          } else if(videoType === 'ogv') {
            videoFormat = 'type="video/ogg; codecs="vp8, vorbis"';
          }

          result = '<video controls="controls" preload="auto" autobuffer>' +
            '<source src="' + media + '" ' + videoFormat + ' /></video>' +
            '<a href="' + media + '" target="_blank">' + media + '</a>';

        } else {
          result = '<a href="' + media + '" target="_blank">' + media + '</a>'; 
        }
      } catch(e) {
        // Invalid link attempt, falling back to regular text
        result = media;
      }

    } else if (media === emotiHeart) {
      result = '<img src="/images/heart.png"> ';

    } else {
      result = media;
    }

    return result;
  };

  // break the string up by spaces
  var newContent = '';
  var contentArray = content.split(/\s/);

  for (var i=0; i < contentArray.length; i++) {
    newContent += ' ' + this.parseWords(contentArray[i]);
  }

  return newContent;
};


exports.getNickName = function(content) {
  // set the nick name
  var nickname = '';
  var matches = nickMatcher.exec(content);

  if (matches !== null){
    nickname = matches[2];
    if (nickname.replace(/\s/, '').length > 1) {
      nickname = nickname.replace(/[^\w]/g, '_');
    }
  }

  return nickname;
};

