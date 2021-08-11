

const uploadSlate = async (buffer) => {
    const url = 'https://uploads.slate.host/api/public/df680546-a4dc-45bc-8d0b-5e6f488fd877'; // collection ID
  
    let data = new FormData();
    const date = new Date();
    data.append("data", buffer, date.toISOString()+".png");

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: 'Basic SLA0e9b8b3b-2081-430e-a830-740cd8e00efdTE', // API key  
        },
        body: data
    });

    const json = await response.json();
    return json;
}

export default uploadSlate;