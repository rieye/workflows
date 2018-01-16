$ = require 'jquery'
do fill = (item = 'The most creative minds in troubleshooting') ->
  $('.tagline').append "#{item}"
fill