const tryLoadReferral = () =>
{
    return localStorage.getItem("ref")
}

const trySetReferral = (ref:string) =>{
    return localStorage.setItem("ref",ref)
}


export {
    tryLoadReferral,
    trySetReferral
}