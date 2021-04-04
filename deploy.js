// ---------------------------------------------------------------------------------------------------------------------
// Rancher Redeploy Script
// ---------------------------------------------------------------------------------------------------------------------

const axios = require('axios');

// ---------------------------------------------------------------------------------------------------------------------

// Read these from ENV
const {
    RANCHER_BEARER_TOKEN,
    RANCHER_CLUSTER_ID,
    RANCHER_NAMESPACE,
    RANCHER_PROJECT_ID,
    RANCHER_URL,
    RANCHER_WORKLOAD,
    IMAGE_TAG
} = process.env;

// ---------------------------------------------------------------------------------------------------------------------
// Check for required environment variables
// ---------------------------------------------------------------------------------------------------------------------

const required = [
    'RANCHER_BEARER_TOKEN',
    'RANCHER_CLUSTER_ID',
    'RANCHER_NAMESPACE',
    'RANCHER_PROJECT_ID',
    'RANCHER_URL',
    'RANCHER_WORKLOAD'
]

const missing = required.filter((key) => !process.env[key]);
if(missing.length > 0)
{
    throw new Error(`Required environment variables missing: ${ missing.join(', ') }`);
}

// ---------------------------------------------------------------------------------------------------------------------

const headers = {
    Authorization: `Bearer ${ RANCHER_BEARER_TOKEN }`
}

const workloadURL = `${RANCHER_URL}/v3/project/${RANCHER_CLUSTER_ID}:${RANCHER_PROJECT_ID}/workloads/deployment:${RANCHER_NAMESPACE}:${RANCHER_WORKLOAD}`

// ---------------------------------------------------------------------------------------------------------------------

function buildImage(image)
{
    if(IMAGE_TAG)
    {
        const parts = image.split(':');
        return `${ parts[0] }:${ IMAGE_TAG }`
    }

    return image;
}

// ---------------------------------------------------------------------------------------------------------------------

async function main()
{
    console.log('Redeploying workload...')

    // Step 1: Get the workload
    const { data } = await axios.get(workloadURL, { headers });

    // Step 2: Modify the workload
    const workload = {
        ...data,
        annotations: {
            ...data.annotations,
            'cattle.io/timestamp': new Date().toISOString()
        },
        containers: [{
            ...data.containers[0],
            image: buildImage(data.containers[0].image)
        }]
    };

    // Step 3: Push the modified workload
    await axios.put(workloadURL, workload, { headers });
}


// ---------------------------------------------------------------------------------------------------------------------

main()
    .then(() =>
    {
        console.log('Workload successfully deployed.')
        process.exit(0);
    })
    .catch((error) =>
    {
        console.error(error.message);
        process.exit(1);
    });

// ---------------------------------------------------------------------------------------------------------------------
