(function() {

    // Storing common selections
    var allEndpoints = $('li.endpoint'),
        allEndpointsLength = allEndpoints.length,
        allMethodLists = $('ul.methods'),
        allMethodListsLength = allMethodLists.length;

    function listMethods(context) {
        var methodsList = $('ul.methods', context || null);

        for (var i = 0, len = methodsList.length; i < len; i++) {
            $(methodsList[i]).slideDown();
        }
    }

    // Toggle show/hide of method details, form, and results
    $('li.method > div.title').click(function() {
        $('form', this.parentNode).slideToggle();
    })

    // Toggle an endpoint
    $('li.endpoint > h3.title span.name').click(function() {
        $('ul.methods', this.parentNode.parentNode).slideToggle();
        $(this.parentNode.parentNode).toggleClass('expanded')
    })

    // Toggle all endpoints
    $('#toggle-endpoints').click(function(event) {
        event.preventDefault();

        // Check for collapsed endpoints (hidden methods)
        var endpoints = $('ul.methods:not(:visible)'),
            endpointsLength = endpoints.length;

        if (endpointsLength > 0) {
            // Some endpoints are collapsed, expand them.
            for (var x = 0; x < endpointsLength; x++) {
                var methodsList = $(endpoints[x]);
                methodsList.slideDown();
                methodsList.parent().toggleClass('expanded', true)

            }
        } else {
            // All endpoints are expanded, collapse them
            var endpoints = $('ul.methods'),
                endpointsLength = endpoints.length;

            for (var x = 0; x < endpointsLength; x++) {
                var methodsList = $(endpoints[x]);
                methodsList.slideUp();
                methodsList.parent().toggleClass('expanded', false)
            }
        }

    })

    // Toggle all methods
    $('#toggle-methods').click(function(event) {
        event.preventDefault();

        var methodForms = $('ul.methods form:not(:visible)'), // Any hidden method forms
            methodFormsLength = methodForms.length;

        // Check if any method is not visible. If so, expand all methods.
        if (methodFormsLength > 0) {
            var methodLists = $('ul.methods:not(:visible)'), // Any hidden methods
            methodListsLength = methodLists.length;

            // First make sure all the hidden endpoints are expanded.
            for (var x = 0; x < methodListsLength; x++) {
                $(methodLists[x]).slideDown();
            }

            // Now make sure all the hidden methods are expanded.
            for (var y = 0; y < methodFormsLength; y++) {
                $(methodForms[y]).slideDown();
            }

        } else {
            // Hide all visible method forms
            var visibleMethodForms = $('ul.methods form:visible'),
                visibleMethodFormsLength = visibleMethodForms.length;

            for (var i = 0; i < visibleMethodFormsLength; i++) {
                $(visibleMethodForms[i]).slideUp();
            }
        }

        for (var z = 0; z < allEndpointsLength; z++) {
            $(allEndpoints[z]).toggleClass('expanded', true);
        }
    })

    // List methods for a particular endpoint.
    // Hide all forms if visible
    $('li.list-methods a').click(function(event) {
        event.preventDefault();

        // Make sure endpoint is expanded
        var endpoint = $(this).closest('li.endpoint'),
            methods = $('li.method form', endpoint);

        listMethods(endpoint);

        // Make sure all method forms are collapsed
        var visibleMethods = $.grep(methods, function(method) {
            return $(method).is(':visible')
        })

        $(visibleMethods).each(function(i, method) {
            $(method).slideUp();
        })

        $(endpoint).toggleClass('expanded', true);

    })

    // Expand methods for a particular endpoint.
    // Show all forms and list all methods
    $('li.expand-methods a').click(function(event) {
        event.preventDefault();

        // Make sure endpoint is expanded
        var endpoint = $(this).closest('li.endpoint'),
            methods = $('li.method form', endpoint);

        listMethods(endpoint);

        // Make sure all method forms are expanded
        var hiddenMethods = $.grep(methods, function(method) {
            return $(method).not(':visible')
        })

        $(hiddenMethods).each(function(i, method) {
            $(method).slideDown();
        })

        $(endpoint).toggleClass('expanded', true);

    });

    // Toggle headers section
    $('div.headers h4').click(function(event) {
        event.preventDefault();

        $(this.parentNode).toggleClass('expanded');

        $('div.fields', this.parentNode).slideToggle();
    });

    // Auth with OAuth
    $('#credentials').submit(function(event) {
        event.preventDefault();

        var params = $(this).serializeArray();

        $.post('/auth', params, function(result) {
            if (result.signin) {
                window.open(result.signin,"_blank","height=900,width=800,menubar=0,resizable=1,scrollbars=1,status=0,titlebar=0,toolbar=0");
            }
        })
    });

    /*
        Try it! button. Submits the method params, apikey and secret if any, and apiName
    */
    $('li.method form').submit(function(event) {
        var self = this;

        event.preventDefault();

        var params = $(this).serializeArray(),
            apiKey = { name: 'apiKey', value: $('input[name=key]').val() },
            apiSecret = { name: 'apiSecret', value: $('input[name=secret]').val() },
            apiName = { name: 'apiName', value: $('input[name=apiName]').val() };

        params.push(apiKey, apiSecret, apiName);

        // Setup results container
        var resultContainer = $('.result', self);
        if (resultContainer.length === 0) {
            resultContainer = $(document.createElement('div')).attr('class', 'result');
            $(self).append(resultContainer);
        }

        if ($('pre.response', resultContainer).length === 0) {

            // Clear results link
            var clearLink = $(document.createElement('a'))
                .text('Clear results')
                .addClass('clear-results')
                .attr('href', '#')
                .click(function(e) {
                    e.preventDefault();

                    var thislink = this;
                    $('.result', self)
                        .slideUp(function() {
                            $(this).remove();
                            $(thislink).remove();
                        });
                })
                .insertAfter($('input[type=submit]', self));

            // We want to display the request Body passed to the service if a POST or PUT
            // operation was executed. -- examine our parameters to find the http method
            // assume a GET until we learn otherwise.
            var httpMethod='GET';
            for ( var i = 0 ; i < params.length ; i++ ) {
                var nv = params[i];
                if (nv.name == 'httpMethod') {
                    httpMethod = nv.value;
                }
            }
            if ( httpMethod == 'POST' || httpMethod == 'PUT') {
                resultContainer.append($(document.createElement('h4')).text('Request Body'));
                resultContainer.append($(document.createElement('pre')).addClass('body prettyprint'));
           }

            // Call that was made, add pre elements
            resultContainer.append($(document.createElement('h4')).text('Call'));
            resultContainer.append($(document.createElement('pre')).addClass('call'));

            // Code
            resultContainer.append($(document.createElement('h4')).text('Response Code'));
            resultContainer.append($(document.createElement('pre')).addClass('code prettyprint'));

            // Header
            resultContainer.append($(document.createElement('h4')).text('Response Headers'));
            resultContainer.append($(document.createElement('pre')).addClass('headers prettyprint'));

            // Response
            resultContainer.append($(document.createElement('h4'))
                .text('Response Body')
                .append($(document.createElement('a'))
                    .text('Select body')
                    .addClass('select-all')
                    .attr('href', '#')
                    .click(function(e) {
                        e.preventDefault();
                        selectElementText($(this.parentNode).siblings('.response')[0]);
                    })
                )
            );

            resultContainer.append($(document.createElement('pre'))
                .addClass('response prettyprint'));
        }

        console.log(params);

        $.post('/processReq', params, function(result, text) {
            // If we get passed a signin property, open a window to allow the user to signin/link their account
            if (result.signin) {
                window.open(result.signin,"_blank","height=900,width=800,menubar=0,resizable=1,scrollbars=1,status=0,titlebar=0,toolbar=0");
            } else {
                 // make sure we can display something even if we got no response text passed back to us.
               var ct='text/plain';
               if (result && result.headers['content-type']) {
                   ct=result.headers['content-type'];
               }
                 var response,
                    responseContentType = ct;

                 // Format output according to content-type
               if (result && result.headers['content-type']) {
                    response = livedocs.formatData(result.response, ct);
               }
               else {
                    // if there is no content, by all means say so!
                   response = 'No Content';
               }

                $('pre.response', resultContainer)
                    .toggleClass('error', false)
                    .text(response);
            }

        })
        // Complete, runs on error and success
        .complete(function(result, text) {

            // make sure the response it set to something
            // if there was no response, perhaps something bad happened?
            var response = JSON.parse('{"code":"500"}');
            if (result && result.responseText) {
               response = JSON.parse(result.responseText);
            }
            else if (result && result.status) {
               // no response text? well at least grab the status
                response.code = JSON.parse(result.status);
           }

            if (response.call) {
                $('pre.call', resultContainer)
                    .text(response.call);
            }

            if (response.code) {
                $('pre.code', resultContainer)
                    .text(response.code);
            }

            if (response.headers) {
                $('pre.headers', resultContainer)
                    .text(formatJSON(response.headers));
            }

            // if we did a POST or PUT, we may have sent along the request body and
            // content type -- if so, format the body and embed in the result container.
            if ( httpMethod == 'POST' || httpMethod == 'PUT') {
               var rawpayloadText='Request Body Not Found';
                if (response.requestBody) {
                   rawpayloadText=response.requestBody;
               }

                // json encoding is fairly safe if nothing was sent
               var requestContentType='application/json';
                if (response.requestBodyContentType) {
                   requestContentType=response.requestBodyContentType;
               }

                   var requestBodyText = livedocs.formatData(rawpayloadText, requestContentType);
                $('pre.body', resultContainer).text(requestBodyText);
            }


            // Syntax highlighting
            prettyPrint();
        })
        .error(function(err, text) {
            var response;

            if (err.responseText !== '') {
                var result = JSON.parse(err.responseText),
                    headers = formatJSON(result.headers);

                if (result.headers && result.headers['content-type']) {
                    // Format the result.response and assign it to response
                    response = livedocs.formatData(result.response, result.headers['content-type']);
                } else {
                    response = result.response;
                }

            } else {
                response = 'Error';
            }

            $('pre.response', resultContainer)
                .toggleClass('error', true)
                .text(response);
        })
    })

})();
