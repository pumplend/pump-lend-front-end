import {siteConfig} from "@/config/site"
const twitterReferral = (address:string)=>
{
    let ref = ""
    if(address)
    {
        ref = "?referral="+address
    }
    window.open(`http://twitter.com/share?text=Try leverage your memecoin via pumplend ! &url=${siteConfig.links.website+ref} goes here&hashtags=pumplend,pump,meme`)
}
function telegramShare(address:string) {
    let ref = ""
    if(address)
    {
        ref = "?referral="+address
    }
    window.open(encodeURI(`https://t.me/share/url?url=${siteConfig.links.webapp+ref}&text=Try leverage your memecoin via pumplend !`))
  }
export {
    twitterReferral,
    telegramShare
}