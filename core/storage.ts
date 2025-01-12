const tryLoadReferral = () =>
{
    return localStorage.getItem("ref")
}

const trySetReferral = (ref:string) =>{
    return localStorage.setItem("ref",ref)
}

const trySetKlineConfig = (cfg:string) =>
{
    return localStorage.setItem("kline_config",cfg)
}

const tryGetKlineConfig = (cfg:string) =>
{
    return localStorage.getItem("kline_config")
}
export {
    tryLoadReferral,
    trySetReferral,
    trySetKlineConfig,
    tryGetKlineConfig
}