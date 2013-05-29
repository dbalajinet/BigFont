﻿(function () {

    'use strict';
    /*global $:false, window:false, document:false, bigfont_letterhead:false, bigfont_wysiwyg:false, bigfont_carousel:false */
    /*jslint white: true */

    var BASE_URL, BOOTSTRAP_COLLAPSE_HIDE_DURATION;

    BASE_URL = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port;
    BOOTSTRAP_COLLAPSE_HIDE_DURATION = 195; // approx

    function setupTheAnchorElementNonLinkBehavior() {

        // sometimes we want links that do not behave like links
        $("a.non-link").click(function (e) {
            // prevent default and bubbling
            // within a jQuery event handler
            e.preventDefault();
            e.stopPropagation();
            return false;
        });

    }

    function refreshScrollSpy() {

        $('[data-spy="scroll"]').each(function () {

            $(this).scrollspy('refresh');

        });

    }

    function expandTheCollapsingContactFormBySectionHash(hash) {

        $('section' + hash + ' ' + '.collapse').collapse('show');

    }

    function setupTheCollapsingContactForm() {

        var div, button, strong, span, forms, form, isValid, validator, jqxhr, scrollTopBefore, offsetTopBefore, scrollTopAfter, offsetTopAfter;

        function centerTheCollapsingContactForm(form) {

            var id = form.attr('id');
            var target = $('[href*=' + id + ']');
            var targetTop = target.offset().top;
            var windowHeight = $(window).height();
            var scrollTop = targetTop - windowHeight/2;
            $('html,body').scrollTop(scrollTop);

        }

        // get all the contact forms
        forms = $('form.contact-form');

        // When using scrollspy in conjunction with adding or removing of elements from the DOM, 
        // call the refresh method
        forms.children('.collapse').bind('shown hidden', function () {

            // use a timeout, because the hidden event is early
            window.setTimeout(refreshScrollSpy, BOOTSTRAP_COLLAPSE_HIDE_DURATION);

        });

        // on show of any collapsible within any form
        forms.children('.collapse').bind('show', function () {

            // capture the current window position
            scrollTopBefore = $('html,body').scrollTop();
            offsetTopBefore = $(this).offset().top;

            // Wrap all alerts with close functionality.
            // This is defensive coding, because it might be unnecessary.
            $(".alert").alert();

            // Close all the alerts within all contact forms.
            forms.find('.alert').alert('close');

            // Close collapsables that are currently open
            // do it manually, sans animation
            $('.collapse.in').height(0).removeClass('in');

            // adjust the window position so it appears that nothing happened
            offsetTopAfter = $(this).offset().top;
            scrollTopAfter = scrollTopBefore - (offsetTopBefore - offsetTopAfter);

        });

        // on shown of any collapsible
        forms.children('.collapse').bind('shown', function () {


            $('html,body').scrollTop(scrollTopAfter);

            // set the focus
            $(this).find('[name=fromEmail]').focus();

        });

        // on hidden of any collapsible within any form
        forms.children('.collapse').bind('hidden', function () {

            // get the specific form
            form = $(this).parents('form');
            form.validate().resetForm();
            form[0].reset();

        });

        // now, for each form
        $.each(forms, function (i) {

            form = $(forms[i]);

            // setup validation
            validator = form.validate({
                rules: {
                    fromEmail: {
                        required: true,
                        email: true
                    },
                    fromName: "required",
                    subject: "required",
                    body: "required"
                },
                messages: {
                    fromEmail: {
                        required: 'Please provide your email.',
                        email: 'Please provide a valid email.'
                    },
                    fromName: "Please provide your name.",
                    subject: "Please provide a subject.",
                    body: "Please type a message."
                },
                invalidHandler: function (form, validator) {

                    $(validator.errorList[0].element).focus();

                }
            });

        });

        // on form reset button click
        forms.find('button[type=reset]').click(function () {

            form = $(this).parents('form');
            centerTheCollapsingContactForm(form);

        });

        // on form submit button click
        forms.find('button[type=submit]').click(function () {

            // get the specific form
            form = $(this).parents('form');

            // prevent default behavior if the form is not valid
            isValid = form.valid();

            if (isValid) {

                // create the success alert box
                div = $('<div/>', { 'class': 'alert alert-success' });
                button = $('<button/>', { type: 'button', 'class': 'close', 'data-dismiss': 'alert', html: 'x' });
                strong = $('<strong/>', { html: 'Thank you.&nbsp' });
                span = $('<span/>', { html: 'We will reply shortly.' });
                div.append(button);
                div.append(strong);
                div.append(span);

                // show the success alert box
                form.append(div);
                centerTheCollapsingContactForm(form);

            }

            // prevent default behavior if the form is not valid
            // otherwise the form will collapse via the bootstrap collapse javascript                 
            return isValid;

        });

        // if the useragent has javascript
        // then submit with ajax and prevent page redirect
        forms.submit(function () {

            // retrieive the form
            form = $(this);

            // POST to wcf in a way that mimics an html form POST
            jqxhr = $.ajax({
                type: form.attr('method'),
                url: BASE_URL + form.attr('action'),
                data: form.serialize(),
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'text'
            });

            return false;

        });

    }

    function getParameterByName(name) {

        var regexS, regex, results, parameterValue;
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        regexS = "[\\?&]" + name + "=([^&#]*)";
        regex = new RegExp(regexS);
        results = regex.exec(window.location.search);
        if (results === null) {
            parameterValue = "";
        }
        else {
            parameterValue = decodeURIComponent(results[1].replace(/\+/g, " "));
        }
        return parameterValue;

    }

    function respondToQueryStringActionParameter() {

        var action, hash;
        action = getParameterByName('action');
        if (action === 'email') {

            hash = window.location.hash;
            expandTheCollapsingContactFormBySectionHash(hash);

        }
    }

    function setupNavigationClickHandler() {

        var collapsible, href, doDefault;
        $('nav#sub-nav a').click(function (e) {

            // if there is a collapsible on the page
            collapsible = $('.in.collapse');
            if (collapsible.length > 0) {

                // ... determine where to navigate...
                href = $(this).attr('href');

                // ... hide the collapsible
                collapsible.collapse('hide');

                // use a timeout, double the duraction to be safe, because the hidden event is early
                window.setTimeout(function () { window.location.hash = href; }, (BOOTSTRAP_COLLAPSE_HIDE_DURATION * 2));

                // ... finally, prevent the default behavior
                e.preventDefault();
                doDefault = false;
            }

        });

        return doDefault;

    }

    function initializeTooltips() {
        $("[data-toggle='tooltip']").tooltip();
    }

    $(document).ready(function () {

        setupTheAnchorElementNonLinkBehavior();

        setupTheCollapsingContactForm();

        respondToQueryStringActionParameter();

        setupNavigationClickHandler();

        initializeTooltips();

    });

} ());