export default async function handler() {
    // TODO: write the script logic here
    return "Hello, World!";
}

// prettier-ignore
handler().then((response)=>{
    console.log(response);
    process.exit(0);
}).catch(console.error);
