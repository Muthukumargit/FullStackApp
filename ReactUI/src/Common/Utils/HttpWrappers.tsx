
const checkAccess = async (path:string) => {
 const response=await sendHTTPRequest(window.location.origin+'/userservice/haveAccess/'+path,{method:'GET'});
//  debugger;
 if(response.ok){
return true;
 }
 if(response.status == 406)
 {
  console.log('Not allowed');
  return false;
 }
}

export async function canAccessPage(path: String) {

  
  //@ts-ignore
  const hasAccess= await checkAccess(path);  
  if(!hasAccess){
    throw new Response('Access Denined',{status:403});
  }
}

export default function sendHTTPRequest(url:RequestInfo| URL,options:RequestInit): Promise<Response>{

  // debugger;
  return fetch(url,RequestOption(options)).then(
      async (httpResponse) =>{
        if(httpResponse.status == 401){
          // if (!window.location.pathname.startsWith("/UI/login") || !window.location.pathname.startsWith("/UI/register") || !window.location.pathname.startsWith("/verifyUserId") )
          if (!window.location.pathname.startsWith("/UI/login") )
          window.location.href='/UI/login';
        }
        return await httpResponse;
      }
      
  )

}
export const HTTP = {
  Get: 'GET',
  Post: 'POST',
  Put: 'PUT',
  Delete: 'DELETE'
} as const;

export type HTTP = (typeof HTTP)[keyof typeof HTTP]; 
function RequestOption(options:RequestInit):RequestInit | undefined{

  switch(options.method?.toUpperCase()){
    case HTTP.Post:
      return{
        method: HTTP.Post,
        credentials:"include",
        headers:{
          'Content-Type':'application/json; charset=utf-8',
          ...options.headers
        },
        body:options.body,
      }
    case HTTP.Get:
      return {
        method: HTTP.Get,
        credentials:"include",
        headers:{
          'Content-Type':'application/json; charset=utf-8',
          ...options.headers
        }
      }
      default:
        console.log('Invalid HTTP method');
  }

}