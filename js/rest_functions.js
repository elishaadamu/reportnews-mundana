/**
 * Created by brentdanley on 11/19/15.
 */
// If there is a single report div, get the JSON to fill it.
if ($('.single-report').length) {
    var reportid = GetURLReportNID();
   // alert(reportid);
    $.ajax({
        type: "GET",
        /*data: {
            report_id: GetURLReportNID(),
            ID: GetURLParameter("ID")
        },*/
        url: "https://back.3blmedia.com/rest/report-announcement/single-report/"+reportid,
        dataType: "json"
    })
    .done(function (response) {

        var report_data = response['results'][0];
        var dateparts = report_data['published-date'].split('/');
        pub_date = new Date(dateparts[2], dateparts[1] - 1, dateparts[0]).toISOString();
        $('body').attr('data-report-id',report_data.report_id);
        if (report_data['client-sector'].length !== 0) {
            $.ajax({
                    type: "GET",
                    /*data: {client_sector: report_data["client-sector"].replace(/&amp;/g, '&')},*/
                    url: "https://back.3blmedia.com/rest/report-announcement/related-report/"+report_data['client-sector'],
                    dataType: "json"
                })
                .done(function (related_reports) {
                    console.log(related_reports);
                    var related_reports_count = 0;
                    $.each(related_reports['results'], function (index, value) {
                        if (related_reports_count === 6) {
                            return true;
                        }
                        if ($('body').data('report-id') != related_reports['results'][index]['report_id']) {
                            var template = $("#related-reports--sidebar").html();
                            var output = Mustache.to_html(template, related_reports['results'][index]);
                            $('#related-reports--sidebar-content').append(output);
                        }
                        related_reports_count++;
                    });
                    $('.widget-report-details').removeClass('hidden');
                    $('#more-sector-link')
                        .prop('href', "/sector/" +report_data['client-sector']+"/"+ report_data['client-sector-name'].replace(/&amp;/g, '&'))
                        .text(report_data['client-sector-name'].replace(/&amp;/g, '&'));
                });
        }
        var display_report_data = report_data;
        display_report_data["published-date"] = moment(display_report_data["published-date"], "D/M/YYYY").format("Do MMMM, YYYY");
        if (display_report_data["report-image"] === undefined) {
            delete display_report_data["report-image"];
        }
        else {
            delete display_report_data["client-logo"];
        }
        if (! display_report_data.hasOwnProperty("client-logo") || display_report_data["client-logo"]["filename"] === undefined) {
            delete display_report_data["client-logo"];
        }

        //removed public:// from ["report-image"]["uri"] from image url and assign itself
        var url_image = report_data["report-image"];
        //display_report_data["report-image"]["uri"] = url_image.replace('public://', '');
        display_report_data["report-image"] = url_image;

        var template = $("#single-report--content").html();
        var output = Mustache.to_html(template, display_report_data);
        $('.single-report').append(output);
        $('#view-report-body-button').attr('href', display_report_data['report-link']);
        $('.single-report .ajax-spinner').remove();
                var parsely_script = '<script type="application/ld+json"> \
        { \
        "@context": "http://reportalert.info/", \
        "@type": "Report Announcement", \
        "headline": "' + report_data["report-title"] + '", \
        "url": "http://reportalert.info/report/' + report_data["report_id"] + '", \
        "thumbnailUrl": " + report_data["report-image"] + ", \
        "dateCreated": "' + pub_date + '", \
        "articleSection": "' + report_data["client-sector"] + '", \
        "creator": [], \
        "keywords": [] \
        } \
        </script>';
        $('#parsely-root').prepend(parsely_script);
        //console.log(display_report_data['report-title']);
        $('title').text(display_report_data['report-title'] + ' | ReportAlert.info');
    });
}

// If this is the Latest Reports page, get the JSON to fill it.
if ($('.content-latest--container').length) {
    $('#ajax-spinner--container .ajax-spinner').clone().prependTo('#report-list--content-container');
    get_latest_reports(1)
        .done(function(response) {
            // remove spinner
            $('#report-list--content-container .ajax-spinner').remove();

            // Display results
            display_latest_content_results(response['results']);

            // Persist results to localStorage
            localStorage.setItem("latest_reports", JSON.stringify(response['results']));

            update_paginator(+response['pager']['current_page'] + 1, +response['pager']['pages']);
        });
}

// If there is a latest reports widget, get the JSON to fill it.
if ($('.widget-latest-short').length) {
    var now = new Date();
    var expire = new Date(localStorage.getItem("latest_reports_expiration"));

    if (expire > now) {
        populate_latest_sidebar();
    }
    else {
        get_latest_reports(1)
            .done(function(response) {
                localStorage.setItem("latest_reports", JSON.stringify(response['results']));
                populate_latest_sidebar();

                var expiration = new Date();
                expiration.setHours(+expiration.getHours() + 1);
                localStorage.setItem("latest_reports_expiration", expiration);
            });
    }
}

function populate_latest_sidebar() {
    $.each(JSON.parse(localStorage.getItem("latest_reports")), function (index, value) {
        var template = $('#latest-reports--sidebar').html();
        var output = Mustache.to_html(template, JSON.parse(localStorage.getItem("latest_reports"))[index]);
        $('.report-summary--container').append(output);
        $('.widget-latest-short .ajax-spinner').remove();
    });
}

$('.pagination-button--first-page').on('click', function() {
    var last_page = $('.pagination--container').attr('data-last-page');
    $('#report-list--content-container').empty();
    $('#ajax-spinner--container .ajax-spinner').clone().prependTo('#report-list--content-container');
    if ($('body').hasClass('latest')) {
        get_latest_reports(1)
            .done(function (response) {
                $('#report-list--content-container .ajax-spinner').remove();
                update_paginator(1, last_page);
                display_latest_content_results(response['results']);
            });
    }
    if ($('body').hasClass('sector')) {
        get_related_reports(1)
            .done(function(response) {
                $('#report-list--content-container .ajax-spinner').remove();
                update_paginator(1, last_page);
                display_related_content_results(response);
            });
    }
});

$('.pagination-button--previous-page').on('click', function() {
    var current_page = $('#pagination--container').attr('data-current-page');
    var last_page = $('#pagination--container').attr('data-last-page');
    $('#report-list--content-container').empty();
    $('#ajax-spinner--container .ajax-spinner').clone().prependTo('#report-list--content-container');
    if ($('body').hasClass('latest')) {
        get_latest_reports(+current_page - 1)
            .done(function (response) {
                $('#report-list--content-container .ajax-spinner').remove();
                update_paginator(+current_page - 1, last_page);
                display_latest_content_results(response['results']);
            });
    }
    if ($('body').hasClass('sector')) {
        get_related_reports(+current_page - 1)
            .done(function(response) {
                $('#report-list--content-container .ajax-spinner').remove();
                update_paginator(+current_page - 1, last_page);
                display_related_content_results(response);
            });
    }
});

$('.pagination-button--next-page').on('click', function() {
    var current_page = $('#pagination--container').attr('data-current-page');
    var last_page = $('#pagination--container').attr('data-last-page');
    $('#report-list--content-container').empty();
    $('#ajax-spinner--container .ajax-spinner').clone().prependTo('#report-list--content-container');
    if ($('body').hasClass('latest')) {
        get_latest_reports(+current_page + 1)
            .done(function (response) {
                $('#report-list--content-container .ajax-spinner').remove();
                update_paginator(+current_page + 1, last_page);
                display_latest_content_results(response['results']);
            });
    }
    if ($('body').hasClass('sector')) {
        get_related_reports(+current_page + 1)
            .done(function(response) {
                $('#report-list--content-container .ajax-spinner').remove();
                update_paginator(+current_page + 1, last_page);
                display_related_content_results(response);
            });
    }
});

$('.pagination-button--last-page').on('click', function() {
    var last_page = $('#pagination--container').attr('data-last-page');
    $('#report-list--content-container').empty();
    $('#ajax-spinner--container .ajax-spinner').clone().prependTo('#report-list--content-container');
    if ($('body').hasClass('latest')) {
        get_latest_reports(last_page)
            .done(function(response) {
                $('#report-list--content-container .ajax-spinner').remove();
                update_paginator(last_page, last_page);
                display_latest_content_results(response['results']);
            });
    }
    if ($('body').hasClass('sector')) {
        get_related_reports(last_page)
            .done(function(response) {
                $('#report-list--content-container .ajax-spinner').remove();
                update_paginator(last_page, last_page);
                display_related_content_results(response);
            });
    }
});

function display_latest_content_results(reports) {
    $.each(reports, function (index, value) {
        var template = $('#latest-reports--content').html();
        var output = Mustache.to_html(template, reports[index]);
        $('.content-latest--container').append(output);
    });
}

function update_paginator(page, last_page) {
    $('#pagination--container').attr('data-current-page', page);
    $('#pagination--container').attr('data-last-page', last_page);
    if (page == "1") {
        $('.pagination-button--first-page').hide();
        $('.pagination-button--previous-page').hide();
    }
    else {
        $('.pagination-button--first-page').show();
        $('.pagination-button--previous-page').show();
    }
    if (last_page == "1" || page == last_page) {
        $('.pagination-button--next-page').hide();
        $('.pagination-button--last-page').hide();
    }
    else {
        $('.pagination-button--next-page').show();
        $('.pagination-button--last-page').show();
    }
    $('.pagination-indicator--current-page').text(page);
    $('.pagination-indicator--last-page').text(last_page);
}

function get_latest_reports(page) {
    var deferredObject = $.ajax({
        type: "GET",
        data: {
            page: +page - 1
        },
        url: "https://back.3blmedia.com/rest/report-announcement/latest-reports",
        responseType:'application/json'
    });

    return deferredObject.promise();
}

if ($('.content-related--container').length) {
    $('#ajax-spinner--container .ajax-spinner').clone().prependTo('#report-list--content-container');
    get_related_reports(1)
        .done(function (response) {
            display_related_content_results(response);
            update_paginator(1, +response['pager']['pages']);

            $('title').text('CSR / Sustainability Reports for the ' + response['results'][0]['client-sector-name'] + ' sector | ReportAlert.info');
        });
}

function get_related_reports(page) {
    var client_sector = GetURLSector();
    var deferredObject = $.ajax({
            type: "GET",
           data: {
                //client_sector: GetURLSector(),
                page: +page - 1
            },
            url: "https://back.3blmedia.com/rest/report-announcement/sector-reports/"+client_sector,
            dataType: "json"
        });

    return deferredObject.promise();
}

function display_related_content_results(response) {
    $.each(response['results'], function (index, value) {
        var template = $("#related-reports--content").html();
        var output = Mustache.to_html(template, response['results'][index]);
        $('.content-related--container').append(output);
    });
    $('.content-related--container .ajax-spinner').remove();
    $('#page-title').text('Report Announcements for ' + response['results'][0]['client-sector-name']);
}

// http://www.jquerybyexample.net/2012/06/get-url-parameters-using-jquery.html
function GetURLParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}

function GetURLReportNID() {
    var url = window.location.pathname.substring(1);
    var url_parts = url.replace(/\/\s*$/,'').split('/');
    return url_parts[1];
}

function GetURLSector() {
    var url = window.location.pathname.substring(1);
    var url_parts = url.replace(/\/\s*$/,'').split('/');
    return decodeURIComponent(url_parts[1]).replace(/&amp;/g, '&');
}