const OAUTH_URL = 'https://www.googleapis.com/oauth2/v4/token'
const GOOGLE_SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets'
const GOOGLE_SHEETS_URL = 'https://sheets.googleapis.com/v4/spreadsheets/{0}/values/feudal!{1}?{2}'
const WHEEL_SHEETS_ID = '1ray4gflepLQH7RRHBEcuRZEIv7GfNlkQmqLbiCvCanA'
const SERVICE_ACCOUNT = {
    'type': 'service_account',
    'project_id': 'wheel-431014',
    'private_key_id': '338665c2d750' + 'e1c4fe' +
        '9d8475e2af962b593c7744',
    'private_key': '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAg' +
        'EAAoIBAQCkTta0oWaWwtY+\nHTQEpvs5JJILd/rqR6w6+ByK6F2E/rjOPv3fv5Lr+hM1ThMNv/iIkK2BQWjXI5ut\n' +
        'RtoL0X2zCnkaC4z3hgRN86fnbNzCLx0Y94k6S3ykMzVCQhdCWC3mqq8zc9rH7/4v\nETkMkvvAQ72cc8+hXnvW19cD8feIvGLLtarmRME52NJlFKQHpYKjnRuKU2oowxSQ\nAVXC3z6etmWbGdxXAJbYZ9bxKa22P7kavd5tNvxJxQf1U6VjksWheHXrx+d2Cg5J\nl7p5Q8i2VSqg3wdtKNcVe/EwBGT1gCSLN6kOgnQ1mZP+I75KoCThfDn2uaYwRYHT\nqcSOE/SdAgMBAAECggEACAcOVfPn6ky76jLWD7Yghw5CkK+YCoWCW09888uVPGa0\nHObx9/bJFOpDjLKqCO+6XAbgZGJ9XrvGbABX0nK11tYFXs5RhXj1Y+FPAtPnsz1Z\nUmAGQv+mJ/NLrcT53Tlw94ZRvpWV+JxTLho60BmHuoo93xya09a3RuvztADbDIri\n+E0A8JaWAN3tuuio/dNm0UPAltBJSF7nTxoQTSUi6ne/34qIIrQc6dN5onjerRDU\nmuLpq9q5DzsXTD8fD78vnuDtX3x2e6w2r9bL4Zm0sBj5ICAh/hkC1R/FJh6ahvEn\n+LgNg4SDt0uCqk/A6S2bo1cgdLePoPSMUmRQqo4SBwKBgQDkqg5Umbx0aaNY/bg5\nC0no0+5TpTgjoDlhcvP9aqqjcMCvKzWKjmIsvSwITTGi7kzWXIjwjGyeKwyW0sLs\nz4KNsyvYJZwg5u4WRvXKFRlg5RypFGTyx6vIF9h0knse4ls0iNQVSTJD8gq5jXQc\n/IC78iLyD2p6nrhMVAVaIlcevwKBgQC38z/cN3Oelb8nqQntUd0IB1c73wdcHQ5s\nJPdTfC1n15ZTYdEH/3UR7hwXoRoJ0LtFcvKlAOTWrftqmncZsjPY/RYnm0XZG8Hf\n04xJ6sB5kiSb2FGvIohpXZEfKRhC8/ilOuhBe7iWQIBysDnGVvkWc5//VkChnEMu\nFE08Ku3fowKBgQCRUSVUTHNAhBXkKzHVRsBMr8qo67nWoi91J6m5Zf1VawV5DPu0\ntzHa/smp6Ozff5PjMuFwBb3NcsxIWV65QlLUnIYDkjs7iabLD4OKTohXVKM3LJfO\n1mfr/IN56dFG2lFd/IrTkDXaikqYizW8aheh2YqtzHA9xvqWv1q7YlF9XwKBgGry\ns0M+visKlzvgzNO8z8x2MCKwFeBZSGRZza4tOVzxfAX4jgafYJpPHOgkEzZ3tBm5\nrhd/AI1MVCtzqSE4eWqEItheL2r992dB4IOtR8Cm1kABseQoKLVR4CkExIVQwVSX\nfidsXjKFR+jmSoDlWibSjMhwhl0vs+NbjFgaAXkPAoGARpieI8L/C49oO5PdKYlo\nsty9kg1+jxnsy46ToabmTxwaVh5iI6JJY2ePtCAr9VY8EWuQyl75dSYsGuHsztAE\nELUUP3i8g8DHyD063B7HzWvt5KXajeDGu95NEScZ6R6jATLNcDuNnY2llWq9lxB5\nW5H1ANiuKjCQrzgS8IS7Wns=\n-----END PRIVATE KEY-----\n',
    'client_email': 'wheelacc@wheel-431014.iam.gserviceaccount.com',
    'client_id': '114172704513' + '412960649',
    'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
    'token_uri': 'https://oauth2.googleapis.com/token',
    'auth_provider_x509_cert_url': 'https://www.googleapis.com/oauth2/v1/certs',
    'client_x509_cert_url': 'https://www.googleapis.com/robot/v1/metadata/x509/wheelacc%40wheel-431014.iam.gserviceaccount.com',
    'universe_domain': 'googleapis.com'
}

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
        })
    }
}

const JwtSigner = (function () {
    // Helper: Convert PEM to ArrayBuffer
    function pemToArrayBuffer(pem) {
        const b64 = pem.replace(/-----.*?-----/g, "").replace(/\s+/g, "");
        const binary = atob(b64);
        const buffer = new ArrayBuffer(binary.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < binary.length; i++) {
            view[i] = binary.charCodeAt(i);
        }
        return buffer;
    }

    // Helper: Base64url encode a string
    function base64UrlEncode(input) {
        return btoa(input)
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }

    // Helper: Create the header and payload parts of a JWT
    function createJwtParts(header, payload) {
        const encodedHeader = base64UrlEncode(JSON.stringify(header));
        const encodedPayload = base64UrlEncode(JSON.stringify(payload));
        return `${encodedHeader}.${encodedPayload}`;
    }

    // Main function: Sign a JWT
    async function sign(privateKeyPem, payload) {
        // Define the header
        const header = { alg: "RS256", typ: "JWT" };

        // Create the unsigned JWT parts
        const dataToSign = createJwtParts(header, payload);

        // Import the private key
        const privateKey = await window.crypto.subtle.importKey(
            "pkcs8",
            pemToArrayBuffer(privateKeyPem),
            { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
            false,
            ["sign"]
        );

        // Sign the JWT parts
        const signature = await window.crypto.subtle.sign(
            "RSASSA-PKCS1-v1_5",
            privateKey,
            new TextEncoder().encode(dataToSign)
        );

        // Convert signature to base64url format
        const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));

        // Return the full signed JWT
        return `${dataToSign}.${encodedSignature}`;
    }

    // Expose the `sign` function
    return { sign };
})();

// see https://stackoverflow.com/questions/28751995/how-to-obtain-google-service-account-access-token-javascript
async function fetchAuthToken() {
    let claim = {
        aud: OAUTH_URL,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        iss: SERVICE_ACCOUNT.client_email,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Date.now() / 1000
    }
    let jws = await JwtSigner.sign(SERVICE_ACCOUNT.private_key, claim)

    let response = await fetch(OAUTH_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jws
        })
    })
    let responseData = await response.json()
    return responseData.access_token
}

async function readSheet(range, authToken, queryParams) {
    let response = await fetch(GOOGLE_SHEETS_URL.format(WHEEL_SHEETS_ID, range, queryParams), {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + authToken,
            'Content-Type': 'application/json'
        }
    })
    return await response.json()
}

async function writeSheet(data, authToken) {
    let response = await fetch(GOOGLE_SHEETS_URL.format(WHEEL_SHEETS_ID, 'A1', 'valueInputOption=RAW'), {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + authToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            range: 'feudal!A1',
            majorDimension: 'COLUMNS',
            values: data
        })
    })
    return await response.json()
}