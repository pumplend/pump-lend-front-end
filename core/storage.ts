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

const tryGetKlineConfig = () =>
{
    const ret = localStorage.getItem("kline_config")
    if(!ret)
    {
        return "";
    }
    return ret
}
export {
    tryLoadReferral,
    trySetReferral,
    trySetKlineConfig,
    tryGetKlineConfig
}