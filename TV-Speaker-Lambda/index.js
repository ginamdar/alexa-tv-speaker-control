'use strict';
var api = require('./endpoint-api.js');
/**
 * This sample demonstrates a smart home skill using the publicly available API on Amazon's Alexa platform.
 * For more information about developing smart home skills, see
 *  https://developer.amazon.com/alexa/smart-home
 *
 * For details on the smart home API, please visit
 *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference
 */

/**
 * Mock data for devices to be discovered
 *
 * For more information on the discovered appliance response please see
 *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#discoverappliancesresponse
 */
const USER_DEVICES = [{
    "endpointId": "Speaker-400605",
    "manufacturerName": "XCoder Inc.",
    "friendlyName": "Speaker",
    "description": "Speaker control to turn volume low/high or mute the device",
    "displayCategories": [
        "SPEAKER"
    ],
    "cookie": {},
    "capabilities": [{
            "type": "AlexaInterface",
            "interface": "Alexa",
            "version": "3"
        },
        {
            "type": "AlexaInterface",
            "interface": "Alexa.Speaker",
            "version": "3",
            "properties": {
                "supported": [{
                        "name": "volume"
                    },
                    {
                        "name": "muted"
                    }
                ],
                "proactivelyReported": true,
                "retrievable": true
            }
        },
        {
            "type": "AlexaInterface",
            "interface": "Alexa.PowerController",
            "version": "3",
            "properties": {
                "supported": [{
                    "name": "powerState"
                }],
                "proactivelyReported": true,
                "retrievable": true
            }
        },
        {
            "type": "AlexaInterface",
            "interface": "Alexa.EndpointHealth",
            "version": "3",
            "properties": {
                "supported": [{
                    "name": "connectivity"
                }],
                "proactivelyReported": true,
                "retrievable": true
            }
        }
    ]
}, {
    "endpointId": "TV-400605",
    "manufacturerName": "XCoder Inc.",
    "friendlyName": "TV",
    "description": "TV Control to turnOFF/turnON mute the device",
    "displayCategories": [
        "SWITCH"
    ],
    "cookie": {},
    "capabilities": [{
            "type": "AlexaInterface",
            "interface": "Alexa",
            "version": "3"
        },
        {
            "type": "AlexaInterface",
            "interface": "Alexa.PowerController",
            "version": "3",
            "properties": {
                "supported": [{
                    "name": "powerState"
                }],
                "proactivelyReported": true,
                "retrievable": true
            }
        },
        {
            "type": "AlexaInterface",
            "interface": "Alexa.EndpointHealth",
            "version": "3",
            "properties": {
                "supported": [{
                    "name": "connectivity"
                }],
                "proactivelyReported": true,
                "retrievable": true
            }
        }
    ]
}];

/**
 * Utility functions
 */

function log(title, msg) {
    console.log(`[${title}] ${msg}`);
}

/**
 * Generate a unique message ID
 *
 * TODO: UUID v4 is recommended as a message ID in production.
 */
function generateMessageID() {
    //"JCPO1KCBWP84H";
    var messageId = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
    return '38A28869-DD5E-48CE-BBE5-' + messageId;
    // return '38A28869-DD5E-48CE-BBE5-7022c3e6c9ff';
}

/**
 * Generate a response message for PowerController
 * @param endpointId
 * @param namespace
 * @param value
 * @param token
 * @param correlationToken
 * @param payload
 */
function generatePowerControllerResponse(endpointId, onOffValue, token, correlationToken) {
    return {
        context: {
            properties: [{
                namespace: "Alexa.PowerController",
                name: "powerState",
                value: onOffValue,
                timeOfSample: "2018-01-21T00:55:55Z",
                uncertaintyInMilliseconds: "200"
            }, {
                namespace: "Alexa.EndpointHealth",
                name: "connectivity",
                value: {
                    value: "OK"
                },
                timeOfSample: "2018-01-21T00:55:55Z",
                uncertaintyInMilliseconds: "200"
            }]
        },
        event: {
            header: {
                namespace: 'Alexa',
                name: "Response",
                payloadVersion: '3',
                messageId: generateMessageID(),
                correlationToken: correlationToken
            },
            endpoint: {
                scope: {
                    type: "BearerToken",
                    token: token
                },
                endpointId: endpointId
            },
            payload: {}
        }
    };
}
/**
 * Generate a response message
 *
 * @param {string} name - Directive name
 * @param {Object} payload - Any special payload required for the response
 * @returns {Object} Response object
 */
function generateSpeakerResponse(endpointId, value, correlationToken, payload) {
    return {
        context: {
            properties: [{
                namespace: "Alexa.Speaker",
                name: "volume",
                value: value,
                timeOfSample: "2018-01-21T00:55:55Z",
                uncertaintyInMilliseconds: "0"
            }, {
                namespace: "Alexa.Speaker",
                name: "muted",
                value: false,
                timeOfSample: "2018-01-21T00:55:55Z",
                uncertaintyInMilliseconds: "0"
            }]
        },
        event: {
            header: {
                namespace: 'Alexa',
                name: "Response",
                payloadVersion: '3',
                messageId: generateMessageID(),
                correlationToken: correlationToken
            },
            endpoint: {
                endpointId: endpointId
            },
            payload: payload
        }
    };
}

function generateErrorResponse(endpointId, correlationToken, token, payload) {
    return {
        event: {
            header: {
                namespace: 'Alexa',
                name: 'ErrorResponse',
                payloadVersion: '3',
                messageId: generateMessageID(),
                correlationToken: correlationToken
            },
            endpoint: {
                scope: {
                    type: 'BearerToken',
                    token: token
                },
                endpointId: endpointId,
            },
            payload: payload
        }
    };
}

/**
 * Mock functions to access device cloud.
 *
 * TODO: Pass a user access token and call cloud APIs in production.
 */

function getDevicesFromPartnerCloud() {
    return USER_DEVICES;
}

function isValidToken() {
    /**
     * Always returns true for sample code.
     * You should update this method to your own access token validation.
     */
    return true;
}

function isDeviceOnline(applianceId) {
    log('DEBUG', `isDeviceOnline (applianceId: ${applianceId})`);

    /**
     * Always returns true for sample code.
     * You should update this method to your own validation.
     */
    return true;
}

function turnOn(endpointId, token, correlationId) {
    log('DEBUG', `turnOn (endpointId: ${endpointId})`);
    // Call device cloud's API to turn on the device
    api.postTVData(endpointId, "ON");

    return generatePowerControllerResponse(endpointId, "ON", token, correlationId);
}

function turnOff(endpointId, token, correlationId) {
    log('DEBUG', `turnOff (endpointId: ${endpointId})`);

    // Call device cloud's API to turn off the device
    api.postTVData(endpointId, "OFF");
    return generatePowerControllerResponse(endpointId, "OFF", token, correlationId);
}


function incrementPercentage(endpointId, delta, correlationToken) {
    log('DEBUG', `incrementVolume (endpointId: ${endpointId}), delta: ${delta}`);

    // Call device cloud's API to set percentage delta
    api.postSpeakerData(endpointId, delta);
    return generateSpeakerResponse(endpointId, delta, correlationToken, {});
}

function decrementPercentage(endpointId, delta, correlationToken) {
    log('DEBUG', `decreaseVolume (endpointId: ${endpointId}), delta: ${delta}`);

    // Call device cloud's API to set percentage delta
    api.postSpeakerData(endpointId, delta);
    return generateSpeakerResponse(endpointId, delta, correlationToken, {});
}

function setMute(endpointId, mute, correlationToken) {
    log('DEBUG', `setMute (endpointId: ${endpointId}), mute: ${mute}`);
    api.postSpeakerData(endpointId, mute ? "mute" : "unmute");
    return generateSpeakerResponse(endpointId, mute, correlationToken, {});
}

/**
 * Main logic
 */

/**
 * This function is invoked when we receive a "Discovery" message from Alexa Smart Home Skill.
 * We are expected to respond back with a list of appliances that we have discovered for a given customer.
 *
 * @param {Object} request - The full request object from the Alexa smart home service. This represents a DiscoverAppliancesRequest.
 *     https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#discoverappliancesrequest
 *
 * @param {function} callback - The callback object on which to succeed or fail the response.
 *     https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html#nodejs-prog-model-handler-callback
 *     If successful, return <DiscoverAppliancesResponse>.
 *     https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#discoverappliancesresponse
 */
function handleDiscovery(request, callback) {
    log('DEBUG', `Discovery Request: ${JSON.stringify(request)}`);

    /**
     * Get the OAuth token from the request.
     */
    const userAccessToken = request.payload.scope.token.trim();

    /**
     * Generic stub for validating the token against your cloud service.
     * Replace isValidToken() function with your own validation.
     */
    if (!userAccessToken || !isValidToken(userAccessToken)) {
        const errorMessage = `Discovery Request [${request.header.messageId}] failed. Invalid access token: ${userAccessToken}`;
        log('ERROR', errorMessage);
        callback(new Error(errorMessage));
    }

    /**
     * Assume access token is valid at this point.
     * Retrieve list of devices from cloud based on token.
     *
     * For more information on a discovery response see
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#discoverappliancesresponse
     */
    const response = {
        event: {
            header: {
                namespace: 'Alexa.Discovery',
                name: 'Discover.Response',
                payloadVersion: '3',
                messageId: generateMessageID(),
            },
            payload: {
                endpoints: getDevicesFromPartnerCloud(userAccessToken)
            },
        }
    };

    /**
     * Log the response. These messages will be stored in CloudWatch.
     */
    log('DEBUG', `Discovery Response: ${JSON.stringify(response)}`);

    /**
     * Return result with successful message.
     */
    return callback(null, response);
}

/**
 * A function to handle control events.
 * This is called when Alexa requests an action such as turning off an appliance.
 *
 * @param {Object} directive - The full request object from the Alexa smart home service.
 * @param {function} callback - The callback object on which to succeed or fail the response.
 */
function handleControl(directive, callback) {
    log('DEBUG', `Control Request: ${JSON.stringify(directive)}`);

    /**
     * Get the access token.
     */
    const userAccessToken = directive.endpoint.scope.token.trim();
    const correlationToken = directive.header.correlationToken;
    /**
     * Grab the endpointId from the request.
     */
    const endpointId = directive.endpoint.endpointId;
    /**
     * Generic stub for validating the token against your cloud service.
     * Replace isValidToken() function with your own validation.
     *
     * If the token is invliad, return InvalidAccessTokenError
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#invalidaccesstokenerror
     */
    if (!userAccessToken || !isValidToken(userAccessToken)) {
        const payload = {

        };
        log('ERROR', `Discovery Request [${directive.header.messageId}] failed. Invalid access token: ${userAccessToken}`);
        callback(generateErrorResponse(endpointId, correlationToken, userAccessToken, {}));
        return;
    }


    /**
     * If the applianceId is missing, return UnexpectedInformationReceivedError
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#unexpectedinformationreceivederror
     */
    if (!endpointId) {
        log('ERROR', 'No endpointId provided in request');
        const payload = { type: 'NO_SUCH_ENDPOINT', message: `endpointId: Invalid endpoint` };
        callback(generateErrorResponse(endpointId, correlationToken, userAccessToken, payload));
        return;
    }

    /**
     * At this point the applianceId and accessToken are present in the request.
     *
     * Please review the full list of errors in the link below for different states that can be reported.
     * If these apply to your device/cloud infrastructure, please add the checks and respond with
     * accurate error messages. This will give the user the best experience and help diagnose issues with
     * their devices, accounts, and environment
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#error-messages
     */
    if (!isDeviceOnline(endpointId, correlationToken, userAccessToken)) {
        log('ERROR', `Device offline: ${endpointId}`);
        const payload = { "type": "ENDPOINT_UNREACHABLE", "message": "Unable to reach endpoint because it appears to be offline" };
        callback(generateErrorResponse(endpointId, correlationToken, userAccessToken, payload));
        return;
    }

    let response;

    switch (directive.header.name) {
        case 'TurnOn':
            response = turnOn(endpointId, userAccessToken, correlationToken);
            break;

        case 'TurnOff':
            response = turnOff(endpointId, userAccessToken, correlationToken);
            break;

        case 'SetMute':
            const mute = directive.payload.mute;
            response = setMute(endpointId, mute, correlationToken);
            log('DEBUG', `Inside setMute: ${JSON.stringify(response)}`);
            break;

        case 'AdjustVolume':
        case 'SetVolume':
            {
                log('DEBUG', 'Inside SetVolume');
                const delta = directive.payload.volume;
                const correlationToken = directive.header.correlationToken;

                if (delta < 0) {
                    response = decrementPercentage(endpointId, delta, correlationToken);
                }
                else if (delta > 0) {
                    response = incrementPercentage(endpointId, delta, correlationToken);
                }
                else {
                    const payload = { type: 'INVALID_VALUE', message: `deltaPercentage: ${delta}` };
                    callback(generateErrorResponse(endpointId, correlationToken, userAccessToken, payload));
                    return;
                }
            }
            break;

        default:
            {
                log('ERROR', `No supported directive name: ${directive.header.name}`);
                const payload = { type: 'INVALID_DIRECTIVE', message: `Invalid directive name ${directive.header.name}` };
                callback(generateErrorResponse(endpointId, correlationToken, userAccessToken, payload));
                return;
            }
    }

    log('DEBUG', `Control Confirmation: ${JSON.stringify(response)}`);

    callback(null, response);
}

/**
 * Main entry point.
 * Incoming events from Alexa service through Smart Home API are all handled by this function.
 *
 * It is recommended to validate the request and response with Alexa Smart Home Skill API Validation package.
 *  https://github.com/alexa/alexa-smarthome-validation
 */
exports.handler = (request, context, callback) => {
    log('DEBUG', `Directive.header: ${JSON.stringify(request.directive.header)}`);
    const directive = request.directive;
    switch (request.directive.header.namespace) {
        /**
         * The namespace of 'Alexa.Discovery' indicates a request is being made to the Lambda for
         * discovering all appliances associated with the customer's appliance cloud account.
         *
         * For more information on device discovery, please see
         *  https://developer.amazon.com/docs/device-apis/alexa-discovery.html
         */
        case 'Alexa.Discovery':
            log('DEBUG', `Inside Discovery` + callback);
            handleDiscovery(directive, callback);
            break;

            /*
             https://developer.amazon.com/docs/device-apis/alexa-powercontroller.html
             https://developer.amazon.com/docs/device-apis/alexa-speaker.html
             */
        case 'Alexa.PowerController':
        case 'Alexa.Speaker':
            handleControl(directive, callback);
            break;
            /**
             * Received an unexpected message
             */
        default:
            {
                const errorMessage = `No supported namespace: ${directive.header.namespace}`;
                log('ERROR', errorMessage);
                callback(new Error(errorMessage));
            }
    }
};
