/*
 * teaser.jquery.js v1.0.0
 * http://themeforest.net/user/unionagency
 *
 * Copyright 2016, UnionAgency
 * http://themeforest.net/user/unionagency
 */

$(function(){
    //var newYear = (new Date().getFullYear())+1;
    function setTimer(){                        
        var today = new Date();
        //var finalTime = new Date("Sep,1,"+newYear);
        var finalTime = new Date("Sep,1,2017");
        var interval = finalTime - today;
        if(interval<0) interval = 0;
        var days = parseInt(interval/(1000*60*60*24));
        var daysLeft = interval%(1000*60*60*24);
        var hours = parseInt(daysLeft/(1000*60*60));
        var hoursLeft = daysLeft%(1000*60*60);
        var minutes = parseInt(hoursLeft/(1000*60));
        var minutesLeft = hoursLeft%(1000*60);
        var seconds = parseInt(minutesLeft/(1000));
        $('.days').text(days);
        $('.hours').text(hours);
        $('.minutes').text(minutes);
        $('.seconds').text((seconds<10)?'0'+seconds:seconds);
    }
    setTimer();
    setInterval(function(){setTimer();}, 1000);
});