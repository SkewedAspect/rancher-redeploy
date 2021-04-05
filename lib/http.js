// ---------------------------------------------------------------------------------------------------------------------
// Super Basic HTTP Library
// ---------------------------------------------------------------------------------------------------------------------

const https = require('https');
const http = require('http');

// ---------------------------------------------------------------------------------------------------------------------

class HTTPRequestLib
{
    $getClient(url)
    {
        if(typeof url === 'string')
        {
            return url[4] === 's' ? https : http;
        }
        else
        {
            return url.protocol === 'https:' ? https : http;
        }
    }

    async get(url, options = {})
    {
        const reqURL = new URL(url);

        const client = this.$getClient(url);
        return new Promise((resolve, reject) =>
        {
            const reqOpts = {
                ...options,
                method: 'GET'
            };

            client.request(url, reqOpts, (res) =>
                {
                    if(res.statusCode === 301)
                    {
                        const redirectURL = new URL(res.headers.location, reqURL.origin);
                        resolve(this.get(redirectURL, options));
                    }
                    else
                    {

                        let data = '';
                        res.on('data', (chunk) => {
                            data += chunk;
                        });

                        res.on('end', () => {
                            resolve(JSON.parse(data));
                        });
                    }
                })
                .on('error', (error) =>
                {
                    reject(error);
                })
                .end();
        });
    }

    async put(url, data, options = {})
    {
        const reqURL = new URL(url);

        const client = this.$getClient(url);
        return new Promise((resolve, reject) =>
        {
            const reqOpts = {
                ...options,
                headers : {
                    ...options.headers,
                    'Content-Type': 'application/json'
                },
                method: 'PUT'
            };

            const req = client.request(url, reqOpts, (res) =>
            {
                if(res.statusCode === 301)
                {
                    const redirectURL = new URL(res.headers.location, reqURL.origin);
                    resolve(this.put(redirectURL, data, options));
                }
            })
                .on('error', (error) =>
                {
                    reject(error);
                });

            req.write(JSON.stringify(data));
            req.end();
        });
    }
}

// ---------------------------------------------------------------------------------------------------------------------

module.exports = new HTTPRequestLib();

// ---------------------------------------------------------------------------------------------------------------------
