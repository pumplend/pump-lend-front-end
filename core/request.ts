/**
 * Front-end fetch syste,
 */


const coingeckoBaseUrl = `https://api.coingecko.com/api/v3/simple/price`;
const pumpWebApi = `https://testnet.pumpmax.fun/api`
const pumpmaxApi = `https://api.pumpmax.fun`
const request_router = {

  app_indexer: {
    price : coingeckoBaseUrl
  },
  pump:{
    coins : pumpWebApi+"/",
    search : pumpWebApi+"/search",
  },
  pumpmax : {
    positions : pumpmaxApi + "/explorer/positions",
    actives : pumpmaxApi + "/explorer/actives",
    liquidations : pumpmaxApi + "/explorer/liquidations"
  }

};

async function requester(url: string, requestOptions: any) {
  try {
    return (await fetch(url, requestOptions)).json();
  } catch (e) {
    console.log("🐞 req error", e);
  }

  return false;
}

function request_method_get(headers: any) {
  var requestOptions = {
    method: "GET",
    headers: headers,
    redirect: "follow",
  };

  return requestOptions;
}

function request_method_post(bodys: any, headers: any) {
  var requestOptions = {
    method: "POST",
    headers: headers,
    body: bodys,
    redirect: "follow",
  };

  return requestOptions;
}


function request_get_unauth() {
  return request_method_get({});
}


function request_post_unauth(data: any) {
  var h = new Headers();

  h.append("Content-Type", "application/json");

  return request_method_post(JSON.stringify(data), h);
}




async function api_price_oracle(token:string) {
  try {
    return await requester(
      `${request_router.app_indexer.price}?ids=${token}&vs_currencies=usd`,
      request_get_unauth(),
    );
  } catch (e) {
    console.error(e);

    return 0;
  }
}

async function api_pump_lts_token(amount:number) {
    try {
    return await requester(
        `${request_router.pump.coins}?limit=${amount}`,
        request_get_unauth(),
      );
    } catch (e) {
      console.error(e);
  
      return 0;
    }
  }

async function api_pump_search_token(search:string,amount:number) {
    try {
    return await requester(
        `${request_router.pump.search}/${search}/${amount}`,
        request_get_unauth(),
      );
    } catch (e) {
      console.error(e);
  
      return 0;
    }
}

async function api_pumpmax_get_user_positions(page:number = 1 , pageSize:number = 10,user?:string,token?:string) {
  try {
    let url = `${request_router.pumpmax.positions}?page=${page}&pageSize=${pageSize}`;
    if(user)
    {
      url += `&user=${user}`
    }
    if(token)
    {
      url += `&token=${token}`
    }

    return await requester(
        url,
        request_get_unauth(),
      );
  } catch (e) {
    console.error(e);

    return 0;
  }
}

async function api_pumpmax_get_user_actives(page:number = 1 , pageSize:number = 10,user?:string,token?:string) {
  try {
    let url = `${request_router.pumpmax.actives}?page=${page}&pageSize=${pageSize}`;
      if(user)
      {
        url += `&user=${user}`
      }
      if(token)
      {
        url += `&token=${token}`
      }
    
    return await requester(
        url,
        request_get_unauth(),
      );
  } catch (e) {
    console.error(e);

    return 0;
  }
}
export {

    api_price_oracle,
    api_pump_lts_token,
    api_pump_search_token,
    api_pumpmax_get_user_positions,
    api_pumpmax_get_user_actives
};