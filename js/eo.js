(function($) {
    window.emailOctopus = {
        successMessage: 'Thanks for subscribing!',
        missingEmailAddressMessage: 'Your email address is required.',
        invalidEmailAddressMessage: 'Your email address looks incorrect, please try again.',
        botSubmissionErrorMessage: 'This doesn\'t look like a human submission.',
        consentRequiredMessage: 'Please check the checkbox to indicate your consent.',
        invalidParametersErrorMessage: 'This form has missing or invalid fields.',
        unknownErrorMessage: 'Sorry, an unknown error has occurred. Please try again later.',
        isBotPost: function($form) {
            return Boolean($form.find('.email-octopus-form-row-hp input').val());
        },
        isEmailAddressValid: function($form) {
            return /\S+@\S+\.\S+/.test($form.find('input[type=email]').val());
        },
        hasEmailAddressBeenEntered: function($form) {
            return Boolean($.trim($form.find('input[type=email]').val()));
        },
        consentRequired: function($form) {
            var $checkbox = $form.find('.email-octopus-form-row-consent input');
            return Boolean($checkbox.length && !$checkbox.is(':checked'));
        },
        hasRedirectUrl: function($form) {
            return Boolean($form.find('input[name=successRedirectUrl]').val().trim());
        },
        getRedirectUrl: function($form) {
            return $form.find('input[name=successRedirectUrl]').val().trim();
        },
        redirect: function(url) {
            window.location.href = url;
        },
        showConfirmation: function($form, response) {
            var message = response.message ? response.message : emailOctopus.successMessage;
            $form.hide().siblings('.email-octopus-success-message').text(message);
        },
        ajaxSuccess: function($form, response) {
            emailOctopus.hasRedirectUrl($form) ? emailOctopus.redirect(emailOctopus.getRedirectUrl($form)) : emailOctopus.showConfirmation($form, response);
        },
        ajaxError: function($form, textStatus) {
            var response = $.parseJSON(textStatus.responseText);
            if (response && response.error && response.error.code) {
                switch (response.error.code) {
                    case 'INVALID_PARAMETERS':
                        emailOctopus.onError($form, emailOctopus.invalidParametersErrorMessage);
                        return;
                    case 'BOT_SUBMISSION':
                        emailOctopus.onError($form, emailOctopus.botSubmissionErrorMessage);
                        return;
                }
            }
            emailOctopus.onError($form, emailOctopus.unknownErrorMessage);
        },
        ajaxSubmit: function($form) {
            $form.find(':submit').attr('disabled', true);
            
            console.log($form.serialize());

            $.post($form.attr('action'), $form.serialize()).done(function(response) {
                emailOctopus.ajaxSuccess($form, response);
            }).fail(function(textStatus) {
                emailOctopus.ajaxError($form, textStatus);
            });
        },
        onError: function($form, message) {
            $form.siblings('.email-octopus-error-message').empty().text(message);
            $form.find(':submit').removeAttr('disabled');
            if (window.grecaptcha) {
                window.grecaptcha.reset();
            }
        },
        submit: function($form) {
            $form.siblings('.email-octopus-error-message').empty();
            if (emailOctopus.isBotPost($form)) {
                emailOctopus.onError($form, emailOctopus.botSubmissionErrorMessage);
            } else if (!emailOctopus.hasEmailAddressBeenEntered($form)) {
                emailOctopus.onError($form, emailOctopus.missingEmailAddressMessage);
            } else if (!emailOctopus.isEmailAddressValid($form)) {
                emailOctopus.onError($form, emailOctopus.invalidEmailAddressMessage);
            } else if (emailOctopus.consentRequired($form)) {
                emailOctopus.onError($form, emailOctopus.consentRequiredMessage);
            } else {
                emailOctopus.ajaxSubmit($form);
            }
        }
    };
    if (window.location.href.indexOf('eoDebug=1') !== -1) {
        var src = 'https://emailoctopus.com/bundles/emailoctopuslist/js/1.3/debug.js';
        var formAction = document.querySelector('.email-octopus-form').action;
        if (formAction) {
            var a = document.createElement('a');
            a.href = formAction;
            src = a.protocol + '//' + a.hostname + '/bundles/emailoctopuslist/js/1.3/debug.js';
        }
        var scr = document.createElement('script');
        var head = document.head || document.getElementsByTagName('head')[0];
        scr.src = src;
        scr.async = false;
        scr.defer = false;
        head.insertBefore(scr, head.firstChild);
    }
    $('.email-octopus-form:not(.bound)').submit(function(event) {
        event.stopPropagation();
        event.preventDefault();
        emailOctopus.submit($(this));
        return false;
    }).addClass('bound');
})(window.jQuery);